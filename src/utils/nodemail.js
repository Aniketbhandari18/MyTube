import nodemailer from "nodemailer";
import { PASSWORD_RESET_REQUEST_TEMPLATE, PASSWORD_RESET_SUCCESS_TEMPLATE, VERIFICATION_EMAIL_TEMPLATE } from "./emailTemplate.js";

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  }
});

const sendMail = async (email, subject, html) =>{
  const mailOptions = {
    from: `"MyTube" <${process.env.SMTP_USER}>`,
    to: email,
    subject: subject,
    html: html
  }

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    throw new Error("Failed to send mail");
  }
}

const sendVerificationMail = async (email, verificationCode) =>{
  const subject = "Email Verification";
  const html = VERIFICATION_EMAIL_TEMPLATE.replace("{verificationCode}", verificationCode);

  try {
    await sendMail(email, subject, html);
  } catch (error) {
    throw new Error("Failed to send verification email");
  }
};

const sendResetPasswordToken = async (email, resetPasswordToken) =>{
  const subject = "Reset Your Password";
  const html = PASSWORD_RESET_REQUEST_TEMPLATE.replace("{resetURL}", `${process.env.CLIENT_URL}/user/reset-password/${resetPasswordToken}`);

  try {
    await sendMail(email, subject, html);
  } catch (error) {
    throw new Error("Failed to send reset-password-token email");
  }
}

const sendResetPasswordSuccessMail = async (email) =>{
  const subject = "Password Reset Successfully";
  const html = PASSWORD_RESET_SUCCESS_TEMPLATE;

  try {
    await sendMail(email, subject, html);
  } catch (error) {
    throw new Error("Failed to send password reset successfull mail");
  }
};

export { sendVerificationMail, sendResetPasswordToken, sendResetPasswordSuccessMail };