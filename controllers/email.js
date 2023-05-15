const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // 1. Create a transporter (service like gmail yahoo etc that will actually send an email)
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  // 2. Define Email OPtions
  const mailOptions = {
    from: 'Daddy <daddy@gmail.com>',
    to: options.email,
    subject: options.subject,
    text: options.message,
    // html:<h1>options.message</h1> for later use
  };
  // 3. Actually send the email
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
