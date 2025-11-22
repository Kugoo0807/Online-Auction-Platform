import dotenv from 'dotenv';
dotenv.config();

import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,       // smtp.gmail.com
  port: Number(process.env.MAIL_PORT),
  secure: process.env.MAIL_SECURE === "true",
  auth: {
    user: process.env.MAIL_USER,     // your@gmail.com
    pass: process.env.MAIL_PASS      // app password
  }
});

export async function sendOtp(email, otp) {
    console.log(process.env.MAIL_USER)
    try {
        const info = await transporter.sendMail({
        from: process.env.MAIL_FROM,
        to: email,
        subject: "Mã xác thực OTP",
        html: `
        <div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2">
            <div style="margin:50px auto;width:70%;padding:20px 0">
            <div style="border-bottom:1px solid #eee">
                <a href="" style="font-size:1.4em;color: #00466a;text-decoration:none;font-weight:600">Xác thực tài khoản</a>
            </div>
            <p>Xin chào,</p>
            <p>Mã xác thực OTP của bạn là: <strong style="font-size: 1.2em;">${otp}</strong></p>
            <p>Mã có hiệu lực trong 10 phút. Tuyệt đối không chia sẻ mã này cho người khác.</p>
            <hr style="border:none;border-top:1px solid #eee" />
            </div>
        </div>
        ` 
        });

        return info;
    } catch (error) {
        console.error("Gửi mail thất bại:", error);
        throw error;
    }
}