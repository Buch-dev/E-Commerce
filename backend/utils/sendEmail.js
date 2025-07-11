import nodemailer from "nodemailer";

export const sendEmail = async (options) => {
  // Validate required options
  if (!options || !options.email || !options.subject || !options.message) {
    throw new Error('Missing required email options: email, subject, and message are required');
  }

  // Create a transporter  // Create a transporter
  const transporter = nodemailer.createTransport({
    service: process.env.SMTP_SERVICE, // e.g., 'gmail', 'yahoo', etc.
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  // Define email options
  const mailOptions = {
    from: `"E-Commerce App" <${process.env.SMTP_USER}>`, // sender address
    to: options.email, // list of receivers
    subject: options.subject, // Subject line
    text: options.message, // plain text body
  };

  // Send email
  await transporter.sendMail(mailOptions);
};
