import async from 'async';
import * as mailService from './email.service.js'; // Import file service gốc của mày

// 1. Định nghĩa các Worker xử lý (giống cái map handlers lúc nãy)
const EMAIL_HANDLERS = {
    'SEND_OTP': async (data) => {
        await mailService.sendOtp(data.email, data.otp);
    },
    'NOTIFY_NEW_BID_SELLER': async (data) => {
        await mailService.notifyNewBidToSeller(data.sellerEmail, data.productName, data.newPrice, data.bidderName, data.productLink);
    },
    'NOTIFY_BID_SUCCESS': async (data) => {
        await mailService.notifyBidSuccess(data.bidderEmail, data.productName, data.holderName, data.bidderPrice, data.currentPrice, data.productLink);
    },
    'NOTIFY_HOLDER': async (data) => {
        await mailService.notifyHolder(data.holderEmail, data.productName, data.currentPrice, data.top1Email, data.productLink);
    },
    'NOTIFY_BID_REJECTED': async (data) => {
        await mailService.notifyBidRejected(data.bidderEmail, data.productName);
    },
    'NOTIFY_AUCTION_WINNER': async (data) => {
        await mailService.notifyAuctionWinner(data.winnerEmail, data.productName, data.finalPrice, data.checkoutLink);
    },
    'NOTIFY_AUCTION_SOLD': async (data) => {
        await mailService.notifyAuctionEndedSold(data.sellerEmail, data.productName, data.winnerName, data.finalPrice, data.productLink);
    },
    'NOTIFY_AUCTION_NO_BID': async (data) => {
        await mailService.notifyAuctionEndedNoBid(data.sellerEmail, data.productName, data.productLink);
    },
    'NOTIFY_NEW_QUESTION': async (data) => {
        await mailService.notifyNewQuestion(data.sellerEmail, data.productName, data.questionContent, data.productLink);
    },
    'NOTIFY_NEW_ANSWER': async (data) => {
        await mailService.notifyNewAnswer(data.recipientsEmails, data.productName, data.questionContent, data.answerContent, data.productLink);
    },
    'NOTIFY_AUCTION_CANCELLED': async (data) => {
        await mailService.notifyAuctionCancelled(data.recipientsEmails, data.productName);
    },
    'NOTIFY_UPGRADE_APPROVED': async (data) => {
        await mailService.notifyUpgradeApproved(data.userEmail);
    },
    'NOTIFY_UPGRADE_REJECTED': async (data) => {
        await mailService.notifyUpgradeRejected(data.userEmail);
    },
    'NOTIFY_RATING_RECEIVED': async (data) => {
        await mailService.notifyRatingReceived(data.userEmail, data.raterName, data.score, data.comment, data.productName);
    },
    'NOTIFY_UNBAN': async (data) => {
        await mailService.notifyBidUnBan(data.bidderEmail, data.productName, data.productLink);
    }
};

// 2. Tạo Queue (Concurrency = 1: Xử lý từng mail một, tránh bị server mail chặn vì spam)
const emailQueue = async.queue(async (task, callback) => {
    const { type, data } = task;
    const handler = EMAIL_HANDLERS[type];

    if (handler) {
        console.log(`[Queue] Processing job: ${type}`);
        try {
            await handler(data);
            console.log(`[Queue] Done: ${type}`);
        } catch (error) {
            console.error(`[Queue] Error processing ${type}:`, error);
            // Có thể thêm logic retry ở đây nếu muốn
        }
    } else {
        console.error(`[Queue] Unknown job type: ${type}`);
    }
    
    // Báo cho queue biết là đã xong task này
    callback();
}, 1);

// 3. Hàm dispatch để các service khác gọi
// Lưu ý: Hàm này KHÔNG async, vì nó chỉ push vào mảng rồi return ngay
export const dispatchEmail = (type, data) => {
    emailQueue.push({ type, data }, (err) => {
        if (err) {
            console.log('Có lỗi khi xử lý queue:', err);
        }
    });
};

// Handle lỗi drain (khi queue trống - optional)
emailQueue.drain(() => {
    // console.log('Tất cả mail đã được gửi hết');
});