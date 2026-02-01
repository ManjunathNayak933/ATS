import { PrismaClient } from '@prisma/client';
import { nanoid } from 'nanoid';

const prisma = new PrismaClient();

// Get all jobs for the company
export const getJobs = async (req, res, next) => {
  try {
    const jobs = await prisma.job.findMany({
      where: {
        companyId: req.user.companyId
      },
      include: {
        hr: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        _count: {
          select: { candidates: true }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json({
      success: true,
      jobs
    });
  } catch (error) {
    next(error);
  }
};

// Get single job with candidates
export const getJobById = async (req, res, next) => {
  try {
    const { jobId } = req.params;

    const job = await prisma.job.findFirst({
      where: {
        id: jobId,
        companyId: req.user.companyId
      },
      include: {
        hr: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        company: {
          select: {
            id: true,
            name: true,
            email: true,
            logoUrl: true
          }
        },
        questions: {
          orderBy: {
            orderIndex: 'asc'
          }
        }
      }
    });

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Get candidates for this job
    const candidates = await prisma.candidate.findMany({
      where: {
        jobId: jobId
      },
      include: {
        answers: {
          include: {
            question: true
          }
        }
      },
      orderBy: {
        appliedAt: 'desc'
      }
    });

    res.json({
      success: true,
      job,
      candidates
    });
  } catch (error) {
    next(error);
  }
};

// Create new job
export const createJob = async (req, res, next) => {
  try {
    const { title, description, hrId, questions } = req.body;

    // Validate input
    if (!title || !description || !hrId) {
      return res.status(400).json({
        success: false,
        message: 'Title, description, and HR assignment are required'
      });
    }

    // Verify HR belongs to same company
    const hr = await prisma.user.findFirst({
      where: {
        id: hrId,
        companyId: req.user.companyId
      }
    });

    if (!hr) {
      return res.status(400).json({
        success: false,
        message: 'Invalid HR assignment'
      });
    }

    // Generate unique form URL
    const formUrl = nanoid(10);

    // Create job with questions in transaction
    const job = await prisma.$transaction(async (tx) => {
      const newJob = await tx.job.create({
        data: {
          title,
          description,
          formUrl,
          companyId: req.user.companyId,
          hrId,
          questions: questions && questions.length > 0 ? {
            create: questions.map((q, index) => ({
              questionText: q.questionText,
              questionType: q.questionType || 'TEXT',
              isRequired: q.isRequired || false,
              orderIndex: q.orderIndex !== undefined ? q.orderIndex : index
            }))
          } : undefined
        },
        include: {
          hr: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          questions: true
        }
      });

      return newJob;
    });

    res.status(201).json({
      success: true,
      message: 'Job created successfully',
      job,
      formUrl: formUrl
    });
  } catch (error) {
    next(error);
  }
};

// Update job status
export const updateJobStatus = async (req, res, next) => {
  try {
    const { jobId } = req.params;
    const { status } = req.body;

    if (!['ACTIVE', 'PAUSED', 'CLOSED'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    // Check if job belongs to user's company
    const existingJob = await prisma.job.findFirst({
      where: {
        id: jobId,
        companyId: req.user.companyId
      }
    });

    if (!existingJob) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    const updatedJob = await prisma.job.update({
      where: { id: jobId },
      data: { status }
    });

    res.json({
      success: true,
      message: 'Job status updated successfully',
      job: updatedJob
    });
  } catch (error) {
    next(error);
  }
};

// Delete job
export const deleteJob = async (req, res, next) => {
  try {
    const { jobId } = req.params;

    // Check if job belongs to user's company
    const job = await prisma.job.findFirst({
      where: {
        id: jobId,
        companyId: req.user.companyId
      }
    });

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    await prisma.job.delete({
      where: { id: jobId }
    });

    res.json({
      success: true,
      message: 'Job deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
