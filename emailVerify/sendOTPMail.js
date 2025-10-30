import nodemailer from 'nodemailer';
import 'dotenv/config';

export const sendOTPMail = async (email, otp) => {
  try {
    if (!email) {
      throw new Error("No recipient email provided");
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

    const mailConfigurations = {
      from: `"Mobile shop " <${process.env.MAIL_USER}>`,
      to: email,
      subject: 'Password Reset OTP',
      html: `
        <p>Hi there,</p>
        <p>You have requested to reset your password.</p>
        <p>Your One-Time Password (OTP) is:</p>
        <h2 style="color:#1E88E5;">${otp}</h2>
        <p>This OTP is valid for <strong>10 minutes</strong>.</p>
        <p>If you did not request this, please ignore this email.</p>
        <p>Thanks,<br/>Kindergarten School Team</p>
      `,
    };

    const info = await transporter.sendMail(mailConfigurations);
    console.log("✅ Email Sent Successfully to:", email);
    return info;
  } catch (error) {
    console.error("❌ Error sending OTP mail:", error.message);
    throw error;
  }
};
