const nodemailer = require('nodemailer');
require("dotenv").config();
let transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: process.env.EMAIL,
        pass: process.env.APP_PASS 
    }
});


const sendMail = async (sender, receiver, subject, text) => {
    let mailOptions = {
        from: sender,
        to: receiver,
        subject: subject,
        text: text, 
    };
    try {
        await transporter.sendMail(mailOptions);
        return true; 
    } catch (error) {
        console.error("Error sending email:", error);
        return false;
    }
};

module.exports = sendMail;