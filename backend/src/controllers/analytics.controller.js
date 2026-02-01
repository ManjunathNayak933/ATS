import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getDashboardAnalytics = async (req, res, next) => {
  try {
    const companyId = req.user.companyId;

    // Get total jobs
    const totalJobs = await prisma.job.count({
      where: { companyId }
    });

    // Get active jobs
    const activeJobs = await prisma.job.count({
      where: {
        companyId,
        status: 'ACTIVE'
      }
    });

    // Get total candidates
    const totalCandidates = await prisma.candidate.count({
      where: {
        job: {
          companyId
        }
      }
    });

    // Get average match score
    const avgScore = await prisma.candidate.aggregate({
      where: {
        job: {
          companyId
        },
        aiMatchScore: {
          not: null
        }
      },
      _avg: {
        aiMatchScore: true
      }
    });

    // Get status distribution
    const pending = await prisma.candidate.count({
      where: {
        job: { companyId },
        status: 'PENDING'
      }
    });

    const approved = await prisma.candidate.count({
      where: {
        job: { companyId },
        status: 'APPROVED'
      }
    });

    const rejected = await prisma.candidate.count({
      where: {
        job: { companyId },
        status: 'REJECTED'
      }
    });

    // Get top jobs by applications
    const topJobs = await prisma.job.findMany({
      where: { companyId },
      select: {
        id: true,
        title: true,
        _count: {
          select: {
            candidates: true
          }
        }
      },
      orderBy: {
        candidates: {
          _count: 'desc'
        }
      },
      take: 5
    });

    // Get applications over time (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const applicationsOverTime = await prisma.candidate.groupBy({
      by: ['appliedAt'],
      where: {
        job: { companyId },
        appliedAt: {
          gte: thirtyDaysAgo
        }
      },
      _count: {
        id: true
      }
    });

    // Format applications over time for chart
    const formattedApplications = {};
    for (let i = 0; i < 30; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      formattedApplications[dateStr] = 0;
    }

    applicationsOverTime.forEach(item => {
      const dateStr = new Date(item.appliedAt).toISOString().split('T')[0];
      if (formattedApplications[dateStr] !== undefined) {
        formattedApplications[dateStr] += item._count.id;
      }
    });

    const chartData = Object.entries(formattedApplications)
      .map(([date, applications]) => ({
        date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        applications
      }))
      .reverse();

    res.json({
      success: true,
      totalJobs,
      activeJobs,
      totalCandidates,
      avgMatchScore: avgScore._avg.aiMatchScore ? Number(avgScore._avg.aiMatchScore) : 0,
      statusDistribution: {
        pending,
        approved,
        rejected
      },
      topJobs: topJobs.map(job => ({
        title: job.title,
        applications: job._count.candidates
      })),
      applicationsOverTime: chartData
    });
  } catch (error) {
    next(error);
  }
};
