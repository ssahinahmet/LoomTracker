const nodemailer = require("nodemailer");
const path = require("path");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: parseInt(process.env.MAIL_PORT, 10),
  secure: process.env.MAIL_SECURE === "true",
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

async function sendEmailWithAttachment({ to, subject, html, attachmentPath }) {
  const mailOptions = {
    from: `"LoomTracker" <${process.env.MAIL_USER}>`,
    to,
    subject,
    html,
  };

  if (attachmentPath) {
    mailOptions.attachments = [
      {
        filename: path.basename(attachmentPath),
        path: attachmentPath,
      },
    ];
  }

  return transporter.sendMail(mailOptions);
}

module.exports = { sendEmailWithAttachment };
