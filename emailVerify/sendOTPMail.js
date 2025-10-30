import nodemailer from 'nodemailer';
import 'dotenv/config';

export const sendOTPMail = async (token, email) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.MAIL_USER,
            pass: process.env.MAIL_PASS
        }
    });

    const mailConfigurations = {

        // It should be a string of sender/server email
        from: process.env.MAIL_USER,
        to: email,
        subject: 'Password Reset OTP',
        html:`<p>Hi! There, You have recently requested to reset your password.</p>
           <p>Please use the following OTP to reset your password:</p>
           <h2>${token}</h2>
           <p>This OTP is valid for 10 minutes.</p>
           <p>If you did not request a password reset, please ignore this email.</p>
           <p>Thanks</p>
        `
    };

    transporter.sendMail(mailConfigurations, function (error, info) {
        if (error) throw Error(error);
        console.log('Email Sent Successfully');
        console.log(info);
    });


}





