import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  }
});


const sendVerificationMail = async (email, html) =>{
  const mailOptions = {
    from: `"MyTube" <${process.env.SMTP_USER}>`,
    to: email,
    subject: "Email Verification",
    // text: `Your verification code is ${verificationCode}`, // Plain text fallback
    html: html
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.log(error);
    throw new Error("Failed to send verification email");
  }
};

export { sendVerificationMail };