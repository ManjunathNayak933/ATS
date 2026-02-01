import { PrismaClient } from '@prisma/client';
import { uploadCV } from '../services/file.service.js';
import { extractTextFromPDF } from '../utils/pdf-parser.js';
import { analyzeCVMatch } from '../services/ai.service.js';
import { sendApplicationReceivedEmail } from '../services/email.service.js';

const prisma = new PrismaClient();

// Get job application form (public)
export const getApplicationForm = async (req, res, next) => {
  try {
    const { formUrl } = req.params;

    const job = await prisma.job.findUnique({
      where: { formUrl },
      include: {
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
        message: 'Job not found or application closed'
      });
    }

    if (job.status !== 'ACTIVE') {
      return res.status(400).json({
        success: false,
        message: 'This job is not accepting applications'
      });
    }

    res.json({
      success: true,
      job
    });
  } catch (error) {
    next(error);
  }
};

// Submit application (public)
export const submitApplication = async (req, res, next) => {
  try {
    const { formUrl } = req.params;
    const { name, email, phone, answers } = req.body;

    // Get job
    const job = await prisma.job.findUnique({
      where: { formUrl },
      include: {
        company: true,
        questions: true
      }
    });

    if (!job || job.status !== 'ACTIVE') {
      return res.status(400).json({
        success: false,
        message: 'Job not found or not accepting applications'
      });
    }

    // Check if already applied
    const existing = await prisma.candidate.findFirst({
      where: {
        email,
        jobId: job.id
      }
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'You have already applied for this position'
      });
    }

    // Validate CV upload
    if (!req.files || !req.files.cv) {
      return res.status(400).json({
        success: false,
        message: 'CV is required'
      });
    }

    const cvFile = req.files.cv;

    // Upload CV
    const cvUrl = await uploadCV(cvFile, name);

    // Extract text from CV for AI analysis
    let cvText = '';
    let aiAnalysis = null;
    let matchScore = null;

    try {
      if (cvFile.mimetype === 'application/pdf') {
        cvText = await extractTextFromPDF(cvFile.tempFilePath || cvFile.path);
      }

      // Run AI analysis
      if (cvText) {
        const analysis = await analyzeCVMatch(job.description, cvText);
        matchScore = analysis.matchScore;
        aiAnalysis = {
          recommendation: analysis.recommendation,
          strengths: analysis.strengths,
          gaps: analysis.gaps,
          keyHighlights: analysis.keyHighlights
        };
      }
    } catch (aiError) {
      console.error('AI Analysis failed:', aiError);
      // Continue without AI analysis
    }

    // Parse answers
    const parsedAnswers = typeof answers === 'string' ? JSON.parse(answers) : answers;

    // Create candidate with answers in transaction
    const candidate = await prisma.$transaction(async (tx) => {
      const newCandidate = await tx.candidate.create({
        data: {
          name,
          email,
          phone,
          cvUrl,
          jobId: job.id,
          aiMatchScore: matchScore,
          aiAnalysis: aiAnalysis
        }
      });

      // Create answers
      if (parsedAnswers && Object.keys(parsedAnswers).length > 0) {
        const answerData = Object.entries(parsedAnswers).map(([questionId, answerText]) => ({
          candidateId: newCandidate.id,
          questionId,
          answerText: String(answerText)
        }));

        await tx.answer.createMany({
          data: answerData
        });
      }

      return newCandidate;
    });

    // Send confirmation email
    try {
      await sendApplicationReceivedEmail(candidate, job, job.company);
    } catch (emailError) {
      console.error('Failed to send confirmation email:', emailError);
      // Continue even if email fails
    }

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      candidateId: candidate.id
    });
  } catch (error) {
    next(error);
  }
};
