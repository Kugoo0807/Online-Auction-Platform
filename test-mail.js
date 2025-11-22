import { sendOtp } from './backend/services/email.service.js'; 

const email = '<mail bản thân>@gmail.com'; // <--- Nhập email cá nhân của bạn vào đây để check
const otpTest = '123456';

console.log(`🚀 Đang thử gửi OTP đến ${email}...`);

sendOtp(email, otpTest)
    .then((info) => {
        console.log('✅ Gửi mail THÀNH CÔNG!');
        console.log('Message ID:', info.messageId);
        console.log('-----------------------------------');
        console.log('Hãy kiểm tra hộp thư (cả mục Spam).');
    })
    .catch((err) => {
        console.log('❌ Gửi mail THẤT BẠI!');
        console.error('Lỗi chi tiết:', err);
    });