import OpenAI from 'openai';
import fs from 'fs';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Analyze CV against job description
export const analyzeCVMatch = async (jobDescription, cvText) => {
  try {
    const prompt = `Analyze the following CV against the job description and provide a detailed assessment.

Job Description:
${jobDescription}

Candidate CV:
${cvText}

Provide a JSON response with:
1. match_score (0-100) - Overall match percentage
2. strengths (array of strings) - Specific qualifications that align well
3. gaps (array of strings) - Missing qualifications or skills
4. recommendation ("Strong Match" | "Moderate Match" | "Weak Match")
5. key_highlights (array of 3-5 bullet points summarizing the candidate)

Return ONLY valid JSON, no markdown or explanation.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are an expert technical recruiter analyzing CVs. Return only valid JSON.'
        },
        { role: 'user', content: prompt }
      ],
      temperature: 0.3,
      max_tokens: 1000
    });

    const content = response.choices[0].message.content;
    
    // Remove markdown code blocks if present
    const cleanContent = content.replace(/```json\n?|\n?```/g, '').trim();
    
    const analysis = JSON.parse(cleanContent);
    
    return {
      matchScore: analysis.match_score || 0,
      strengths: analysis.strengths || [],
      gaps: analysis.gaps || [],
      recommendation: analysis.recommendation || 'Moderate Match',
      keyHighlights: analysis.key_highlights || []
    };
  } catch (error) {
    console.error('CV Analysis Error:', error);
    throw new Error('Failed to analyze CV: ' + error.message);
  }
};

// Analyze questionnaire answers
export const analyzeQuestionnaireAnswers = async (jobTitle, answers) => {
  try {
    const prompt = `Evaluate the candidate's questionnaire answers for the position: ${jobTitle}

Answers:
${JSON.stringify(answers, null, 2)}

Provide insights on:
1. Cultural fit (0-100)
2. Communication skills (0-100)
3. Motivation level (0-100)
4. Red flags (array of strings, empty if none)
5. Positive indicators (array of strings)

Return only valid JSON.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are an HR expert evaluating candidate responses. Return only valid JSON.'
        },
        { role: 'user', content: prompt }
      ],
      temperature: 0.4,
      max_tokens: 500
    });

    const content = response.choices[0].message.content;
    const cleanContent = content.replace(/```json\n?|\n?```/g, '').trim();
    
    return JSON.parse(cleanContent);
  } catch (error) {
    console.error('Questionnaire Analysis Error:', error);
    // Return default values if analysis fails
    return {
      cultural_fit: 70,
      communication_skills: 70,
      motivation_level: 70,
      red_flags: [],
      positive_indicators: ['Application submitted']
    };
  }
};

// Transcribe audio using Whisper
export const transcribeAudio = async (audioFilePath) => {
  try {
    const audioFile = fs.createReadStream(audioFilePath);
    
    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: 'whisper-1',
      language: 'en'
    });
    
    return transcription.text;
  } catch (error) {
    console.error('Transcription Error:', error);
    throw new Error('Failed to transcribe audio: ' + error.message);
  }
};

// Generate interview feedback email
export const generateInterviewEmail = async (transcript, candidate, job) => {
  try {
    const prompt = `Based on the following interview feedback, draft a professional email to the candidate.

Candidate: ${candidate.name}
Position: ${job.title}
Company: ${job.company.name}

Interviewer Feedback (transcribed):
${transcript}

Draft an email that:
- Is warm, professional, and encouraging
- Provides specific, actionable feedback based on the transcript
- Clearly states next steps
- Maintains a positive tone regardless of outcome
- Is 150-250 words

Return only the email body text, no subject line or markdown formatting.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a professional HR manager drafting candidate communication. Write clear, empathetic emails.'
        },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 500
    });

    return response.choices[0].message.content.trim();
  } catch (error) {
    console.error('Email Generation Error:', error);
    throw new Error('Failed to generate email: ' + error.message);
  }
};

// Analyze interview history for improvement suggestions
export const analyzeInterviewHistory = async (interviewHistory) => {
  try {
    if (!interviewHistory || interviewHistory.length === 0) {
      return {
        common_patterns: [],
        areas_for_improvement: [],
        success_factors: []
      };
    }

    const prompt = `Analyze this candidate's interview history and provide insights:

${JSON.stringify(interviewHistory, null, 2)}

Provide:
1. common_patterns (array) - Recurring themes in rejections
2. areas_for_improvement (array) - Specific skills/areas to work on
3. success_factors (array) - What worked in successful interviews

Return only valid JSON.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a career coach analyzing interview performance. Return only valid JSON.'
        },
        { role: 'user', content: prompt }
      ],
      temperature: 0.5,
      max_tokens: 400
    });

    const content = response.choices[0].message.content;
    const cleanContent = content.replace(/```json\n?|\n?```/g, '').trim();
    
    return JSON.parse(cleanContent);
  } catch (error) {
    console.error('Interview History Analysis Error:', error);
    return {
      common_patterns: [],
      areas_for_improvement: [],
      success_factors: []
    };
  }
};
