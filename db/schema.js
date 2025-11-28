const mongoose = require('mongoose');

const { Schema } = mongoose;

// Helper validate số lượng ảnh
function arrayLimit(val) {
  return val.length >= 3;
}

// Helper tự động quét các trường có 'ref' và kiểm tra ID có tồn tại không
const checkForeignKeys = (schema) => {
  schema.eachPath((path, schemaType) => {
    if (schemaType.options.ref) {
      const refModel = schemaType.options.ref;
      // Thêm validator
      schema.path(path).validate({
        validator: async function (value) {
          if (!value) return true; // Bỏ qua nếu null/undefined
          
          // Xử lý nếu là mảng ID (ví dụ: banned_bidder_id)
          if (Array.isArray(value)) {
             if (value.length === 0) return true;
             const count = await mongoose.models[refModel].countDocuments({ _id: { $in: value } });
             return count === value.length; // Phải tìm thấy đủ số lượng
          }
          
          // Xử lý nếu là ID đơn lẻ
          const count = await mongoose.models[refModel].countDocuments({ _id: value });
          return count > 0;
        },
        message: `Giá trị tại trường {PATH} không tồn tại trong bảng ${refModel}!`
      });
    }
  });
};

// 1. User
const userSchema = new Schema({
  full_name: { type: String, required: true },
  email: { type: String, required: true, unique: true, index: true },
  password: { type: String },
  role: { type: String, enum: ['bidder', 'seller', 'admin'], default: 'bidder' },
  date_of_birth: Date,
  phone_number: { type: String, sparse: true },
  password_otp: { type: String, default: null },
  otp_expired: { type: Date, default: null },
  address: { type: String },
  auth_provider: { type: String, enum: ['local', 'google', 'facebook'], default: 'local' },
  provider_id: { type: String, default: null },
}, { timestamps: true });

// 2. UpgradeRequest
const upgradeRequestSchema = new Schema({
  user_upgrade: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  approver: { type: Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
}, { timestamps: true });
// Kích hoạt kiểm tra khóa ngoại
upgradeRequestSchema.plugin(checkForeignKeys);

// 3. DeletionHistory
const deletionHistorySchema = new Schema({
  user_deleted: { type: Schema.Types.ObjectId, required: true },
  user_deleted_email: { type: String, required: true },
  user_deleted_name: { type: String, required: true },
  deleter: { type: Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });
deletionHistorySchema.plugin(checkForeignKeys);

// 4. WatchList
const watchListSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
}, { timestamps: { createdAt: 'timestamp_added', updatedAt: false } });

watchListSchema.index({ user: 1, product: 1 }, { unique: true });
watchListSchema.plugin(checkForeignKeys);

// 5. Category
const categorySchema = new Schema({
  category_name: { type: String, required: true, unique: true },
  description: String,
  parent: { type: Schema.Types.ObjectId, ref: 'Category', default: null },
  slug: { type: String, required: true, unique: true, index: true },
});
categorySchema.plugin(checkForeignKeys);

// 6. Product
const productSchema = new Schema({
  product_name: { type: String, required: true, index: true },
  description: { type: String, required: true }, // Mới thêm
  start_price: { type: Number, required: true, default: 0 },
  bid_increment: { type: Number, default: 10000 },
  buy_it_now_price: { type: Number },
  thumbnail: {
    type: String,
    required: [true, "Sản phẩm phải có ảnh đại diện"]
  },
  images: {
    type: [String],
    validate: {
      validator: function (arr) {
        return arr.length >= 3;
      },
      message: "Sản phẩm phải có ít nhất 3 ảnh phụ"
    }
  },
  
  // Các trường logic đấu giá
  auction_start_time: { type: Date, default: Date.now },
  auction_end_time: { type: Date, required: true },
  max_bids_per_bidder: { type: Number, default: 2 },
  bid_count: { type: Number, default: 0 },              // Tổng số bid của sản phẩm
  auto_bid_map: { type: Map, of: Number, default: {}},  // Map lượt bid của bidder
  bid_counts: { type: Map, of: Number, default: {}},    // Số lần bid của mỗi bidder
  // Trạng thái đấu giá
  auction_status: { 
    type: String, 
    enum: ['active', 'ended', 'sold', 'cancelled'],
    default: 'active'
  },
  auto_renew: { type: Boolean, default: false },        // Cho phép gia hạn auction
  
  // Quan hệ
  seller: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
  current_highest_bidder: { type: Schema.Types.ObjectId, ref: 'User' },
  current_highest_price: { type: Number, default: function() { return this.start_price; } },
  
  // Danh sách bidder bị cấm đấu giá
  banned_bidder: [{ type: Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true });
// Full-text search index
productSchema.index({ product_name: 'text', description: 'text' });
productSchema.plugin(checkForeignKeys);

// 7. Bid
const bidSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  price: { type: Number, required: true },
  max_bid_price: Number,
  holder: { type: Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });
bidSchema.plugin(checkForeignKeys);

// 8. QnA
const qnaSchema = new Schema({
  product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  asker: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  answerer: { type: Schema.Types.ObjectId, ref: 'User' },
  question_content: { type: String, required: true },
  answer_content: String,
  answer_timestamp: Date,
}, { timestamps: { createdAt: 'question_timestamp', updatedAt: false } });
qnaSchema.plugin(checkForeignKeys);

// 9. AuctionResult
const auctionResultSchema = new Schema({
  product: { type: Schema.Types.ObjectId, ref: 'Product', required: true, unique: true },
  winning_bidder: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  final_price: { type: Number, required: true },
  payment_status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },
}, { timestamps: true });
auctionResultSchema.plugin(checkForeignKeys);

// 10. Rating
const ratingSchema = new Schema({
  rater: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  rated_user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  auction_result: { type: Schema.Types.ObjectId, ref: 'AuctionResult', required: true },
  rating_type: { type: String, enum: ['positive','negative'], required: true }, 
  comment: String,
}, { timestamps: true });
ratingSchema.plugin(checkForeignKeys);

//11. Refresh Token
const refreshTokenSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  token: { type: String, required: true },
  expires_at: { type: Date, required: true },
  is_revoked: { type: Boolean, default: false },
}, { timestamps: true });
refreshTokenSchema.plugin(checkForeignKeys);

// --- KHAI BÁO MODEL ---
const User = mongoose.model('User', userSchema);
const UpgradeRequest = mongoose.model('Upgrade_Request', upgradeRequestSchema);
const DeletionHistory = mongoose.model('Deletion_History', deletionHistorySchema);
const WatchList = mongoose.model('Watch_List', watchListSchema);
const Category = mongoose.model('Category', categorySchema);
const Product = mongoose.model('Product', productSchema);
const Bid = mongoose.model('Bid', bidSchema);
const QnA = mongoose.model('QnA', qnaSchema);
const AuctionResult = mongoose.model('Auction_Result', auctionResultSchema);
const Rating = mongoose.model('Rating', ratingSchema);
const RefreshToken = mongoose.model('Refresh_Token', refreshTokenSchema);

// --- EXPORT (CommonJS) ---
module.exports = {
  User,
  UpgradeRequest,
  DeletionHistory,
  WatchList,
  Category,
  Product,
  Bid,
  QnA,
  AuctionResult,
  Rating,
  RefreshToken
};