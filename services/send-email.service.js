const nodemailer = require("nodemailer");
// const path = require("path");
require('dotenv').config()

async function sendEmail(to, subject, text, html) {

    try {
        const transporter = nodemailer.createTransport({


            host: process.env.HOST,
            port: process.env.EMAIL_PORT,
            auth: {
                user: process.env.EMAIL_USERNAME,
                pass: process.env.EMAIL_PASSWORD
            }
        });

        // send mail with defined transport object
        const info = await transporter.sendMail({
            from: '<fomo@fomo.com>',
            to: to,
            subject: subject,
            text: text,
            html: html,
        });
    } catch (error) {
        console.log(error);
        // return error;
    }

}

module.exports = {
    sendEmail: sendEmail
};
