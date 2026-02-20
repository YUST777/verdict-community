import nodemailer from 'nodemailer';

// Create reusable transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_SERVER,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: Number(process.env.SMTP_PORT) === 465, // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_LOGIN,
        pass: process.env.SMTP_PASSWORD,
    },
});

interface MailOptions {
    to: string;
    subject: string;
    text: string;
    html?: string;
    [key: string]: unknown;
}

export const sendEmail = async (options: MailOptions) => {
    try {
        const mailOptions = {
            from: `"${process.env.SENDER_NAME || 'ICPC HUE'}" <${process.env.SENDER_EMAIL}>`,
            ...options
        };
        const info = await transporter.sendMail(mailOptions);
        return info;
    } catch (error) {
        console.error('Error sending email:', error);
        throw error;
    }
};

export const sendPasswordResetEmail = async (email: string, resetLink: string) => {
    const html = `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px; background-color: #ffffff;">
  <h2 style="color: #333333; text-align: center;">Reset Your Password</h2>
  <p style="color: #555555; font-size: 16px;">Hello,</p>
  <p style="color: #555555; font-size: 16px;">You requested a password reset for your <strong>ICPC HUE</strong> account.</p>
  
  <div style="text-align: center; margin: 30px 0;">
    <a href="${resetLink}" style="background-color: #0088cc; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">Reset Password</a>
  </div>

  <p style="color: #555555; font-size: 14px;">Or copy this link to your browser:</p>
  <p style="color: #0088cc; font-size: 14px; word-break: break-all; background: #f5f5f5; padding: 10px; border-radius: 4px;">${resetLink}</p>
  
  <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
  <p style="color: #999999; font-size: 12px; text-align: center;">This link is valid for 24 hours. If you didn't request this, you can safely ignore this email.</p>
</div>
`;

    return sendEmail({
        to: email,
        subject: 'Reset Password - ICPC HUE',
        text: `Hello,\n\nYou requested a password reset for your ICPC HUE account.\n\nPlease click the link below to reset your password:\n${resetLink}\n\nThis link expires in 24 hours.\n\nIf you did not request this, please ignore this email.\n`,
        html
    });
};
