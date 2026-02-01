import { PrismaClient } from '@prisma/client';
import { sendStatusUpdateEmail } from '../services/email.service.js';
import { transcribeAudio, generateInterviewEmail } from '../services/ai.service.js';
import { uploadAudio } from '../services/file.service.js';
import path from 'path';
import fs from 'fs';

const prisma = new PrismaClient();

// Get candidate details
export const getCandidateById = async (req, res, next) => {
  try {
    const { candidateId } = req.params;

    const candidate = await prisma.candidate.findFirst({
      where: {
        id: candidateId,
        job: {
          companyId: req.user.companyId
        }
      },
      include: {
        job: {
          include: {
            company: true,
            hr: true
          }
        },
        answers: {
          include: {
            question: true
          },
          orderBy: {
            question: {
              orderIndex: 'asc'
            }
          }
        },
        interviewHistory: {
          orderBy: {
            interviewDate: 'desc'
          }
        }
      }
    });

    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: 'Candidate not found'
      });
    }

    res.json({
      success: true,
      candidate,
      interviewHistory: candidate.interviewHistory || []
    });
  } catch (error) {
    next(error);
  }
};

// Update candidate status
export const updateCandidateStatus = async (req, res, next) => {
  try {
    const { candidateId } = req.params;
    const { status, rejectionReason } = req.body;

    if (!['PENDING', 'APPROVED', 'REJECTED'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    // Get candidate with job and company info
    const candidate = await prisma.candidate.findFirst({
      where: {
        id: candidateId,
        job: {
          companyId: req.user.companyId
        }
      },
      include: {
        job: {
          include: {
            company: true,
            hr: true
          }
        }
      }
    });

    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: 'Candidate not found'
      });
    }

    // Update candidate
    const updated = await prisma.candidate.update({
      where: { id: candidateId },
      data: {
        status,
        rejectionReason: status === 'REJECTED' ? rejectionReason : null
      }
    });

    // Send email notification
    try {
      await sendStatusUpdateEmail(
        updated,
        candidate.job,
        candidate.job.company,
        status
      );
    } catch (emailError) {
      console.error('Failed to send email:', emailError);
      // Continue even if email fails
    }

    res.json({
      success: true,
      message: 'Candidate status updated successfully',
      candidate: updated
    });
  } catch (error) {
    next(error);
  }
};

// Bulk update candidates
export const bulkUpdateCandidates = async (req, res, next) => {
  try {
    const { candidateIds, status, rejectionReason } = req.body;

    if (!candidateIds || !Array.isArray(candidateIds) || candidateIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Candidate IDs are required'
      });
    }

    if (!['APPROVED', 'REJECTED'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    // Get all candidates
    const candidates = await prisma.candidate.findMany({
      where: {
        id: { in: candidateIds },
        job: {
          companyId: req.user.companyId
        }
      },
      include: {
        job: {
          include: {
            company: true,
            hr: true
          }
        }
      }
    });

    // Update all candidates
    await prisma.candidate.updateMany({
      where: {
        id: { in: candidateIds }
      },
      data: {
        status,
        rejectionReason: status === 'REJECTED' ? rejectionReason : null
      }
    });

    // Send emails to all candidates
    const emailPromises = candidates.map(candidate =>
      sendStatusUpdateEmail(
        candidate,
        candidate.job,
        candidate.job.company,
        status
      ).catch(err => console.error('Email failed for:', candidate.email, err))
    );

    await Promise.all(emailPromises);

    res.json({
      success: true,
      message: `${candidateIds.length} candidate(s) updated successfully`,
      updated: candidateIds.length
    });
  } catch (error) {
    next(error);
  }
};

// Process interview recording
export const processInterviewRecording = async (req, res, next) => {
  try {
    const { candidateId } = req.params;

    if (!req.files || !req.files.audioFile) {
      return res.status(400).json({
        success: false,
        message: 'Audio file is required'
      });
    }

    const audioFile = req.files.audioFile;

    // Get candidate with job info
    const candidate = await prisma.candidate.findFirst({
      where: {
        id: candidateId,
        job: {
          companyId: req.user.companyId
        }
      },
      include: {
        job: {
          include: {
            company: true
          }
        }
      }
    });

    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: 'Candidate not found'
      });
    }

    // Upload audio to Cloudinary
    const audioUrl = await uploadAudio(audioFile, candidateId);

    // Transcribe audio
    const transcript = await transcribeAudio(audioFile.tempFilePath || audioFile.path);

    // Generate email draft
    const emailDraft = await generateInterviewEmail(
      transcript,
      candidate,
      candidate.job
    );

    // Save recording
    await prisma.interviewRecording.create({
      data: {
        candidateId,
        audioUrl,
        transcript,
        aiGeneratedResponse: emailDraft,
        recordedBy: req.user.id
      }
    });

    res.json({
      success: true,
      transcript,
      emailDraft
    });
  } catch (error) {
    next(error);
  }
};

// Send email to candidate
export const sendEmailToCandidate = async (req, res, next) => {
  try {
    const { candidateId } = req.params;
    const { emailContent } = req.body;

    if (!emailContent) {
      return res.status(400).json({
        success: false,
        message: 'Email content is required'
      });
    }

    const candidate = await prisma.candidate.findFirst({
      where: {
        id: candidateId,
        job: {
          companyId: req.user.companyId
        }
      },
      include: {
        job: {
          include: {
            company: true,
            hr: true
          }
        }
      }
    });

    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: 'Candidate not found'
      });
    }

    // Import sendCustomEmail
    const { sendCustomEmail } = await import('../services/email.service.js');

    await sendCustomEmail(
      candidate.email,
      [candidate.job.hr.email, candidate.job.company.email],
      `Interview Feedback - ${candidate.job.title}`,
      emailContent,
      candidate.job.company
    );

    res.json({
      success: true,
      message: 'Email sent successfully'
    });
  } catch (error) {
    next(error);
  }
};
