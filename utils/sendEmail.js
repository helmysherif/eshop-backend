const nodemailer = require("nodemailer");
const sendEmail = async (options) => {
  // 1- create transporter (the service that will send email like gmail , mailgun)
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT, // if secure is true the port is 465 and if it false the port is 587
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });
  // 2- define email options like email from whome and the content
  const mailOptions = {
    from: "Ecommerce-shop app <sherifhelmy997@gmail.com>",
    to: options.email,
    subject: options.subject,
    text: options.message,
  };
  // 3- send email
  await transporter.sendMail(mailOptions);
};
module.exports = sendEmail;
