const mongoose = require('mongoose');
const { Schema } = mongoose;

// 1. User
const userSchema = new Schema({
  full_name: { type: String, required: true },
  email: { type: String, required: true, unique: true, index: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['buyer', 'seller', 'admin'], default: 'buyer' },
  date_of_birth: Date,
  phone_number: { type: String, unique: true, sparse: true }, // 'sparse' cho phép nhiều giá trị null
  password_otp: { type: String, default: null },
  otp_expired: { type: Date, default: null },
}, { timestamps: true }); // Tự động thêm createdAt và updatedAt

// 2. UpgradeRequest
const upgradeRequestSchema = new Schema({
  user_upgrade_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  approver_id: { type: Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
}, { timestamps: true });

// 3. DeletionHistory
const deletionHistorySchema = new Schema({
  user_deleted_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  deleter_id: { type: Schema.Types.ObjectId, ref: 'User', required: true }, // Admin
}, { timestamps: true });

// 4. WatchList
const watchListSchema = new Schema({
  user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  product_id: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
}, { timestamps: { createdAt: 'timestamp_added', updatedAt: false } });
// Đảm bảo 1 user chỉ add 1 product 1 lần
watchListSchema.index({ user_id: 1, product_id: 1 }, { unique: true });

// 5. Category
const categorySchema = new Schema({
  category_name: { type: String, required: true, unique: true },
  description: String,
  parent_id: { type: Schema.Types.ObjectId, ref: 'Category', default: null }
});

// 6. Product
const productSchema = new Schema({
  product_name: { type: String, required: true, index: true },
  start_price: { type: Number, required: true, default: 0 },
  bid_increment: { type: Number, default: 10000 },
  buy_it_now_price: { type: Number },
  image: String,
  auction_start_time: { type: Date, default: Date.now },
  auction_end_time: { type: Date, required: true },
  seller_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  category_id: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
  current_highest_bidder_id: { type: Schema.Types.ObjectId, ref: 'User' },
  current_highest_price: { type: Number },
}, { timestamps: true });

// 7. Bid
const bidSchema = new Schema({
  user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  product_id: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  price: { type: Number, required: true },
  max_bid_price: Number, // Dành cho tính năng auto-bidding
}, { timestamps: true });

// 8. QnA
const qnaSchema = new Schema({
  product_id: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  asker_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  answerer_id: { type: Schema.Types.ObjectId, ref: 'User' }, // Thường là seller
  question_content: { type: String, required: true },
  answer_content: String,
  answer_timestamp: Date,
}, { timestamps: { createdAt: 'question_timestamp', updatedAt: false } });

// 9. AuctionResult
const auctionResultSchema = new Schema({
  product_id: { type: Schema.Types.ObjectId, ref: 'Product', required: true, unique: true },
  winning_bidder_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  final_price: { type: Number, required: true },
  payment_status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },
}, { timestamps: true });

// 10. Rating
const ratingSchema = new Schema({
  rater_id: { type: Schema.Types.ObjectId, ref: 'User', required: true }, // người mua
  rated_user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true }, // người bán
  result_id: { type: Schema.Types.ObjectId, ref: 'AuctionResult', required: true },
  rating_type: { type: Number, min: 1, max: 5, required: true }, // Số sao
  comment: String,
}, { timestamps: true });


module.exports = {
  User: mongoose.model('User', userSchema),
  UpgradeRequest: mongoose.model('UpgradeRequest', upgradeRequestSchema),
  DeletionHistory: mongoose.model('DeletionHistory', deletionHistorySchema),
  WatchList: mongoose.model('WatchList', watchListSchema),
  Category: mongoose.model('Category', categorySchema),
  Product: mongoose.model('Product', productSchema),
  Bid: mongoose.model('Bid', bidSchema),
  QnA: mongoose.model('QnA', qnaSchema),
  AuctionResult: mongoose.model('AuctionResult', auctionResultSchema),
  Rating: mongoose.model('Rating', ratingSchema)
};