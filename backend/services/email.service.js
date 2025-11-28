import dotenv from 'dotenv';
dotenv.config();

import nodemailer from "nodemailer";

// Cấu hình Transporter
const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: Number(process.env.MAIL_PORT),
  secure: process.env.MAIL_SECURE === "true",
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS
  }
});

async function sendMailBase({ to, subject, html }) {
  try {
    const info = await transporter.sendMail({
      from: `"Online Auction" <${process.env.MAIL_USER}>`, 
      to: to, 
      subject: subject,
      html: html
    });
    console.log(`Mail sent to ${to}: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error(`Gửi mail thất bại đến ${to}:`, error);
  }
}

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

export async function sendOtp(email, otp) {
  return sendMailBase({
    to: email,
    subject: "Mã xác thực OTP - Online Auction",
    html: `
      <div style="font-family: Helvetica,Arial,sans-serif;line-height:1.6">
          <h2>Xác thực tài khoản</h2>
          <p>Mã OTP của bạn là: <strong style="font-size: 1.5em; color: #c0341d;">${otp}</strong></p>
          <p>Mã có hiệu lực trong 10 phút. Tuyệt đối không chia sẻ mã này.</p>
      </div>
    `
  });
}

export async function notifyNewBidToSeller(sellerEmail, productName, newPrice, bidderName, productLink) {
  return sendMailBase({
    to: sellerEmail,
    subject: `[Thông báo] Sản phẩm "${productName}" có lượt ra giá mới`,
    html: `
      <p>Xin chào,</p>
      <p>Sản phẩm <strong>${productName}</strong> của bạn vừa nhận được lượt ra giá mới.</p>
      <ul>
        <li>Người đặt: <strong>${bidderName}</strong></li>
        <li>Giá đặt: <strong>${formatCurrency(newPrice)}</strong></li>
      </ul>
      <p><a href="${productLink}">Xem chi tiết sản phẩm</a></p>
    `
  });
}

export async function notifyBidSuccess(bidderEmail, productName, price, productLink) {
    return sendMailBase({
      to: bidderEmail,
      subject: `[Xác nhận] Bạn đã ra giá thành công cho "${productName}"`,
      html: `
        <p>Bạn đã đặt giá thành công cho sản phẩm <strong>${productName}</strong>.</p>
        <p>Giá của bạn: <strong>${formatCurrency(price)}</strong></p>
        <p>Chúc bạn thắng đấu giá!</p>
        <p><a href="${productLink}">Theo dõi sản phẩm</a></p>
      `
    });
}

export async function notifyOutbid(previousBidderEmail, productName, newPrice, productLink) {
  return sendMailBase({
    to: previousBidderEmail,
    subject: `BẠN ĐÃ BỊ VƯỢT GIÁ: ${productName}`,
    html: `
      <div style="font-family: Helvetica,Arial,sans-serif;">
          <h3 style="color: #d9534f;">Bạn không còn là người giữ giá cao nhất!</h3>
          <p>Sản phẩm <strong>${productName}</strong> vừa có người đặt giá cao hơn.</p>
          <p>Giá hiện tại: <strong style="font-size: 1.2em;">${formatCurrency(newPrice)}</strong></p>
          <p>Hãy ra giá ngay để giành lại cơ hội chiến thắng!</p>
          <div style="margin-top: 20px;">
             <a href="${productLink}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Đấu giá lại ngay</a>
          </div>
      </div>
    `
  });
}

export async function notifyBidRejected(bidderEmail, productName) {
    return sendMailBase({
        to: bidderEmail,
        subject: `[Thông báo] Quyền đấu giá bị từ chối: ${productName}`,
        html: `
            <p>Xin chào,</p>
            <p>Người bán đã từ chối quyền tham gia đấu giá của bạn đối với sản phẩm <strong>${productName}</strong>.</p>
            <p>Các lượt ra giá trước đó của bạn (nếu có) đã bị vô hiệu hóa.</p>
        `
    });
}

export async function notifyAuctionWinner(winnerEmail, productName, finalPrice, checkoutLink) {
  return sendMailBase({
    to: winnerEmail,
    subject: `CHÚC MỪNG! BẠN ĐÃ THẮNG SẢN PHẨM: ${productName}`,
    html: `
      <div style="font-family: Helvetica,Arial,sans-serif;">
          <h2 style="color: #28a745;">Chúc mừng bạn!</h2>
          <p>Bạn đã thắng đấu giá sản phẩm <strong>${productName}</strong>.</p>
          <p>Giá trúng thầu: <strong>${formatCurrency(finalPrice)}</strong></p>
          <p>Vui lòng hoàn tất đơn hàng và thanh toán càng sớm càng tốt.</p>
          <div style="margin-top: 20px;">
             <a href="${checkoutLink}" style="background-color: #28a745; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Hoàn tất đơn hàng</a>
          </div>
      </div>
    `
  });
}

export async function notifyAuctionEndedSold(sellerEmail, productName, winnerName, finalPrice, productLink) {
    return sendMailBase({
        to: sellerEmail,
        subject: `[Kết thúc] Sản phẩm "${productName}" đã được bán!`,
        html: `
            <p>Phiên đấu giá đã kết thúc thành công.</p>
            <p>Sản phẩm: <strong>${productName}</strong></p>
            <p>Người thắng: <strong>${winnerName}</strong></p>
            <p>Giá cuối cùng: <strong>${formatCurrency(finalPrice)}</strong></p>
            <p><a href="${productLink}">Xem chi tiết</a></p>
        `
    });
}

export async function notifyAuctionEndedNoBid(sellerEmail, productName, productLink) {
    return sendMailBase({
        to: sellerEmail,
        subject: `[Kết thúc] Sản phẩm "${productName}" không có người mua`,
        html: `
            <p>Phiên đấu giá đã kết thúc nhưng rất tiếc chưa có lượt ra giá nào.</p>
            <p>Bạn có thể cân nhắc đăng lại sản phẩm này.</p>
            <p><a href="${productLink}">Xem lại sản phẩm</a></p>
        `
    });
}

export async function notifyNewQuestion(sellerEmail, productName, questionContent, productLink) {
    return sendMailBase({
        to: sellerEmail,
        subject: `Câu hỏi mới về sản phẩm: ${productName}`,
        html: `
            <p>Người dùng vừa đặt câu hỏi cho sản phẩm của bạn.</p>
            <blockquote style="background: #f9f9f9; padding: 10px; border-left: 3px solid #ccc;">
                "${questionContent}"
            </blockquote>
            <p><a href="${productLink}">Bấm vào đây để trả lời</a></p>
        `
    });
}

export async function notifyNewAnswer(recipientsEmails, productName, questionContent, answerContent, productLink) {
    return transporter.sendMail({
        from: `"Online Auction" <${process.env.MAIL_USER}>`,
        bcc: recipientsEmails, 
        subject: `[Cập nhật] Người bán đã trả lời câu hỏi về: ${productName}`,
        html: `
             <p>Người bán đã trả lời một câu hỏi liên quan đến sản phẩm bạn đang quan tâm.</p>
             <p><strong>Câu hỏi:</strong> ${questionContent}</p>
             <p><strong>Trả lời:</strong> ${answerContent}</p>
             <p><a href="${productLink}">Xem chi tiết tại đây</a></p>
        `
    });
}