import nodemailer from "nodemailer";
import jade from "jade";
import fs from "fs";

export async function sendMail(params) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_ACCOUNT, // generated ethereal user
      pass: process.env.EMAIL_PWD, // generated ethereal password
    },
  });

  const emailTemplate = jade.compile(fs.readFileSync(params.template, "utf8"));

  const mailOptions = {
    from: process.env.EMAIL_ACCOUNT,
    to: params.username,
    subject: params.subject,
    html: emailTemplate(params.objects),
  };

  await transporter.sendMail(mailOptions).then((err, res) => {
    //TODO handle error
  });
}
