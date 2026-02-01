import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// Send application received email
export const sendApplicationReceivedEmail = async (candidate, job, company) => {
  try {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #1f2937; margin-bottom: 20px;">Application Received</h2>
        
        <p>Dear ${candidate.name},</p>
        
        <p>Thank you for applying to the <strong>${job.title}</strong> position at <strong>${company.name}</strong>.</p>
        
        <p>We have received your application and our team will review it shortly. You will hear from us within 3-5 business days.</p>
        
        <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0; font-size: 14px; color: #6b7280;">
            <strong>What happens next?</strong><br>
            Our team will review your application and match your qualifications with the role requirements. If you're a good fit, we'll contact you to schedule an interview.
          </p>
        </div>
        
        <p>Best regards,<br>
        <strong>${company.name}</strong> Hiring Team</p>
        
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
        
        <p style="font-size: 12px; color: #9ca3af;">
          This is an automated message. Please do not reply to this email.
        </p>
      </div>
    `;

    await resend.emails.send({
      from: process.env.FROM_EMAIL || 'onboarding@resend.dev',
      to: candidate.email,
      subject: `Application Received - ${job.title}`,
      html
    });

    return { success: true };
  } catch (error) {
    console.error('Email sending error:', error);
    throw new Error('Failed to send email: ' + error.message);
  }
};

// Send application status update email
export const sendStatusUpdateEmail = async (candidate, job, company, status, customMessage = null) => {
  try {
    let html;

    if (status === 'APPROVED') {
      html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #10b981; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
            <h2 style="margin: 0;">Great News!</h2>
          </div>
          
          <div style="background-color: #ffffff; padding: 20px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
            <p>Dear ${candidate.name},</p>
            
            ${customMessage ? `<p>${customMessage}</p>` : `
              <p>We're pleased to inform you that your application for the <strong>${job.title}</strong> position has been approved!</p>
              
              <p>We were impressed by your qualifications and would like to move forward with the next steps in our hiring process.</p>
              
              <div style="background-color: #d1fae5; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981;">
                <p style="margin: 0; color: #065f46;">
                  <strong>Next Steps:</strong><br>
                  Our team will contact you within 1-2 business days to schedule an interview. Please keep an eye on your email and phone.
                </p>
              </div>
            `}
            
            <p>We look forward to speaking with you soon!</p>
            
            <p>Best regards,<br>
            <strong>${company.name}</strong> Hiring Team</p>
          </div>
        </div>
      `;
    } else if (status === 'REJECTED') {
      html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #1f2937; margin-bottom: 20px;">Application Update</h2>
          
          <p>Dear ${candidate.name},</p>
          
          <p>Thank you for your interest in the <strong>${job.title}</strong> position at <strong>${company.name}</strong>.</p>
          
          <p>After careful review, we have decided to move forward with other candidates whose experience more closely matches our current needs.</p>
          
          <div style="background-color: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
            <p style="margin: 0; color: #92400e;">
              We encourage you to apply for future openings that match your skills and experience. We wish you the best in your job search.
            </p>
          </div>
          
          <p>Best wishes,<br>
          <strong>${company.name}</strong> Hiring Team</p>
        </div>
      `;
    }

    const ccEmails = [job.hr.email, company.email].filter(Boolean);

    await resend.emails.send({
      from: process.env.FROM_EMAIL || 'onboarding@resend.dev',
      to: candidate.email,
      cc: ccEmails,
      subject: `Application Update - ${job.title}`,
      html
    });

    return { success: true };
  } catch (error) {
    console.error('Email sending error:', error);
    throw new Error('Failed to send email: ' + error.message);
  }
};

// Send custom email (for interview feedback)
export const sendCustomEmail = async (to, cc, subject, body, company) => {
  try {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #ffffff; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
          ${body.split('\n').map(para => `<p>${para}</p>`).join('')}
          
          <p style="margin-top: 30px;">Best regards,<br>
          <strong>${company.name}</strong> Team</p>
        </div>
        
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
        
        <p style="font-size: 12px; color: #9ca3af;">
          This email was sent from ${company.name}'s ATS system.
        </p>
      </div>
    `;

    await resend.emails.send({
      from: process.env.FROM_EMAIL || 'onboarding@resend.dev',
      to,
      cc: cc || [],
      subject,
      html
    });

    return { success: true };
  } catch (error) {
    console.error('Email sending error:', error);
    throw new Error('Failed to send email: ' + error.message);
  }
};
