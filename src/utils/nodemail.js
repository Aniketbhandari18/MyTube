import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  }
});


const sendVerificationMail = async (email, verificationCode) =>{
  const mailOptions = {
    from: `"MyTube" <${process.env.SMTP_USER}>`,
    to: email,
    subject: "Email Verification",
    text: `Your verification code is ${verificationCode}`, // Plain text fallback
    html: `
      <div style="font-family: Arial, sans-serif; color: #333;">
        <h1>Welcome to MyTube!</h1>
        <p>Thank you for registering. Please verify your email address using the code below:</p>
        <p style="font-size: 18px; font-weight: bold; color: #4CAF50;">${verificationCode}</p>
        <p>If you didn't register, please ignore this email.</p>
        <p>Thank you,</p>
        <p>The MyTube Team</p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.log(error);
    throw new Error("Failed to send verification email");
  }
};

export { sendVerificationMail };