// db/seed.js
const mongoose = require('mongoose');
const connectDB = require('./connect'); // Đảm bảo đường dẫn đúng
const {
  User,
  Category,
  Product,
  Bid,
  WatchList,
  QnA,
  AuctionResult,
  Rating,
  UpgradeRequest,
  DeletionHistory,
  RefreshToken 
} = require('./schema'); // Đảm bảo đường dẫn đúng

const seedDatabase = async () => {
  try {
    await connectDB(); // Kết nối đến DB

    console.log('Dang xoa du lieu cu...');
    // Xoá tất cả 10 collection
    await Promise.all([
      User.deleteMany({}), Category.deleteMany({}), Product.deleteMany({}),
      Bid.deleteMany({}), WatchList.deleteMany({}), QnA.deleteMany({}),
      AuctionResult.deleteMany({}), Rating.deleteMany({}),
      UpgradeRequest.deleteMany({}), DeletionHistory.deleteMany({})
    ]);
    console.log('Xoa du lieu cu thanh cong.');

    // --- TẠO DỮ LIỆU MẪU ---

    console.log('Dang tao Users...');
    // 1. Tạo Users
    const [
      seller1, seller2, buyer1, buyer2, buyer3, admin, userToBeDeleted
    ] = await User.create([
      { full_name: "Trần Minh Quang", email: "quang.tran@example.com", password: "hashed_password_123", role: "seller" },
      { full_name: "Lê Thị Thanh Thảo", email: "thao.le@example.com", password: "hashed_password_123", role: "seller" },
      { full_name: "Nguyễn Anh Dũng", email: "dung.nguyen@example.com", password: "hashed_password_456", role: "buyer" },
      { full_name: "Phạm Hoài An", email: "an.pham@example.com", password: "hashed_password_456", role: "buyer" },
      { full_name: "Vũ Đức Huy", email: "huy.vu@example.com", password: "hashed_password_456", role: "buyer" },
      { full_name: "Nguyễn Nhật Nam", email: "nam.nguyen@example.com", password: "hashed_password_789", role: "admin" },
      { full_name: "Nguyễn Văn Hùng", email: "hung.ng@example.com", password: "hashed_password_000", role: "buyer" }
    ]);

    console.log('Dang tao Categories...');
    // 2. Tạo Categories
    const catElectronics = await Category.create({ category_name: "Đồ điện tử" });
    const catAntiques = await Category.create({ category_name: "Đồ cổ" });
    const catFashion = await Category.create({ category_name: "Thời trang" });
    
    // Laptop là con của Đồ điện tử
    const catLaptop = await Category.create({
      category_name: "Laptop",
      description: "Các loại máy tính xách tay",
      parent_id: catElectronics._id
    });

    console.log('Dang tao Products...');
    // 3. Tạo Products
    const [
      product1, product2, product3, product4, product5
    ] = await Product.create([
      // Sản phẩm 1: Đã kết thúc
      {
        product_name: "Macbook Pro 2019 (Cũ)", start_price: 15000000, bid_increment: 100000,
        auction_end_time: new Date(Date.now() - 10000), // ĐÃ KẾT THÚC
        seller_id: seller1._id, category_id: catLaptop._id,
        current_highest_price: 15200000,
        current_highest_bidder_id: buyer2._id
      },
      // Sản phẩm 2: Đang diễn ra
      {
        product_name: "Đồng hồ Odo (Pháp)", start_price: 2000000, bid_increment: 50000,
        auction_end_time: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 ngày
        seller_id: seller2._id, category_id: catAntiques._id,
        current_highest_price: 2000000
      },
      // Sản phẩm 3: Đã kết thúc
      {
        product_name: "Điện thoại Samsung S21", start_price: 10000000, bid_increment: 100000,
        auction_end_time: new Date(Date.now() - 20000), // ĐÃ KẾT THÚC
        seller_id: seller1._id, category_id: catElectronics._id,
        current_highest_price: 10300000,
        current_highest_bidder_id: buyer1._id
      },
      // Sản phẩm 4: Đang diễn ra
      {
        product_name: "Áo khoác Da Bò Thật", start_price: 800000, bid_increment: 20000,
        auction_end_time: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 ngày
        seller_id: seller2._id, category_id: catFashion._id,
        current_highest_price: 820000,
        current_highest_bidder_id: buyer3._id
      },
      // Sản phẩm 5: Đang diễn ra
      {
        product_name: "Laptop Dell XPS 13", start_price: 20000000, bid_increment: 200000,
        auction_end_time: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 ngày
        seller_id: seller1._id, category_id: catLaptop._id,
        current_highest_price: 20400000,
        current_highest_bidder_id: buyer2._id
      }
    ]);

    console.log('Dang tao Bids...');
    // 4. Tạo Bids
    await Bid.create([
      // Bids cho Product 1
      { user_id: buyer1._id, product_id: product1._id, price: 15100000 },
      { user_id: buyer2._id, product_id: product1._id, price: 15200000 },
      // Bids cho Product 3
      { user_id: buyer2._id, product_id: product3._id, price: 10100000 },
      { user_id: buyer3._id, product_id: product3._id, price: 10200000 },
      { user_id: buyer1._id, product_id: product3._id, price: 10300000 },
      // Bids cho Product 4
      { user_id: buyer3._id, product_id: product4._id, price: 820000 },
      // Bids cho Product 5
      { user_id: buyer1._id, product_id: product5._id, price: 20200000 },
      { user_id: buyer2._id, product_id: product5._id, price: 20400000 },
    ]);

    console.log('Dang tao WatchLists...');
    // 5. Tạo WatchLists
    await WatchList.create([
      { user_id: buyer1._id, product_id: product1._id },
      { user_id: buyer1._id, product_id: product5._id },
      { user_id: buyer2._id, product_id: product1._id },
      { user_id: buyer2._id, product_id: product3._id },
      { user_id: buyer3._id, product_id: product5._id },
    ]);

    console.log('Dang tao QnAs...');
    // 6. Tạo QnAs
    await QnA.create([
      {
        product_id: product1._id, asker_id: buyer1._id,
        question_content: "Sản phẩm này còn bảo hành không?",
        answerer_id: seller1._id, answer_content: "Dạ, hàng xách tay không bảo hành ạ.",
        answer_timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24)
      },
      {
        product_id: product1._id, asker_id: buyer2._id,
        question_content: "Ship về Cà Mau mất bao lâu vậy shop?"
      },
      {
        product_id: product2._id, asker_id: buyer3._id,
        question_content: "Đồng hồ này có giấy chứng nhận không?",
        answerer_id: seller2._id, answer_content: "Có giấy tờ tay của người bán trước đó ạ.",
        answer_timestamp: new Date(Date.now() - 1000 * 60 * 30)
      }
    ]);

    console.log('Dang tao AuctionResults...');
    // 7. Tạo AuctionResults
    const [auctionResult1, auctionResult2] = await AuctionResult.create([
      {
        product_id: product1._id, winning_bidder_id: buyer2._id,
        final_price: product1.current_highest_price, payment_status: "completed"
      },
      {
        product_id: product3._id, winning_bidder_id: buyer1._id,
        final_price: product3.current_highest_price, payment_status: "pending"
      }
    ]);

    console.log('Dang tao Ratings...');
    // 8. Tạo Ratings
    await Rating.create([
      // Buyer2 rate Seller1 cho product1
      {
        rater_id: buyer2._id, rated_user_id: seller1._id,
        result_id: auctionResult1._id,
        rating_type: 5, comment: "Người bán rất uy tín, laptop dùng tốt!"
      },
      // Buyer1 rate Seller1 cho product3
      {
        rater_id: buyer1._id, rated_user_id: seller1._id,
        result_id: auctionResult2._id,
        rating_type: 4, comment: "Điện thoại ổn, nhưng giao hàng hơi chậm."
      }
    ]);

    console.log('Dang tao UpgradeRequests...');
    // 9. Tạo UpgradeRequests
    await UpgradeRequest.create([
      { user_upgrade_id: buyer1._id, status: "pending" },
      {
        user_upgrade_id: buyer3._id, status: "approved",
        approver_id: admin._id
      }
    ]);

    console.log('Dang tao DeletionHistory...');
    // 10. Tạo DeletionHistory
    await DeletionHistory.create({
      user_deleted_id: userToBeDeleted._id,
      deleter_id: admin._id
    });
    // 11. Tạo RefreshTokens
    await RefreshToken.create([
      { user_id: buyer1._id, token: "sample_refresh_token_1", expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
      { user_id: seller1._id, token: "sample_refresh_token_2", expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) }
    ]);
    console.log('--- TAO DU LIEU MAU THANH CONG ---');

  } catch (error) {
    console.error('Loi khi tao du lieu mau:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Da ngat ket noi MongoDB.');
  }
};

seedDatabase();