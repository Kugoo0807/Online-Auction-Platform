const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('./connect');
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
} = require('./schema');

const seedDatabase = async () => {
  try {
    await connectDB();
    console.log('🔌 Đã kết nối MongoDB...');

    // --- 1. DỌN DẸP DỮ LIỆU CŨ ---
    console.log('🧹 Đang xóa dữ liệu cũ...');
    await Promise.all([
      User.deleteMany({}), 
      Category.deleteMany({}), 
      Product.deleteMany({}),
      Bid.deleteMany({}), 
      WatchList.deleteMany({}), 
      QnA.deleteMany({}),
      AuctionResult.deleteMany({}), 
      Rating.deleteMany({}),
      UpgradeRequest.deleteMany({}), 
      DeletionHistory.deleteMany({}),
      RefreshToken.deleteMany({})
    ]);
    console.log('✅ Đã xóa dữ liệu cũ.');

    // --- 2. CHUẨN BỊ MẬT KHẨU HASH ---
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("password123", salt);

    // --- 3. TẠO USERS (5 người) ---
    console.log('👤 Đang tạo 5 Users...');
    const [seller1, seller2, bidder1, bidder2, admin] = await User.create([
      { 
        full_name: "Nguyễn Văn Bán (Seller 1)", 
        email: "seller1@example.com", 
        password: hashedPassword, 
        role: "seller", 
        address: "Hà Nội",
        phone_number: "0901234567"
      },
      { 
        full_name: "Trần Thị Buôn (Seller 2)", 
        email: "seller2@example.com", 
        password: hashedPassword, 
        role: "seller", 
        address: "TP.HCM",
        phone_number: "0909888777"
      },
      { 
        full_name: "Lê Văn Mua (Bidder 1)", 
        email: "bidder1@example.com", 
        password: hashedPassword, 
        role: "bidder", 
        address: "Đà Nẵng",
        phone_number: "0912345678"
      },
      { 
        full_name: "Phạm Thị Săn (Bidder 2)", 
        email: "bidder2@example.com", 
        password: hashedPassword, 
        role: "bidder", 
        address: "Cần Thơ",
        phone_number: "0987654321"
      },
      { 
        full_name: "Admin Quản Trị", 
        email: "admin@example.com", 
        password: hashedPassword, 
        role: "admin", 
        address: "Server",
        phone_number: "0000000000"
      }
    ]);

    // --- 4. TẠO CATEGORIES (6 danh mục: 3 cha, 3 con) ---
    console.log('📂 Đang tạo 6 Categories...');
    
    // 3 Danh mục cha
    const catElectronics = await Category.create({ category_name: "Đồ Điện Tử", description: "Các thiết bị điện tử" });
    const catFashion = await Category.create({ category_name: "Thời Trang", description: "Quần áo, giày dép" });
    const catFurniture = await Category.create({ category_name: "Nội Thất", description: "Bàn ghế, tủ giường" }); // Không có con

    // 3 Danh mục con
    const catLaptop = await Category.create({ 
      category_name: "Laptop", 
      description: "Máy tính xách tay các loại", 
      parent_id: catElectronics._id 
    });
    const catPhone = await Category.create({ 
      category_name: "Điện Thoại", 
      description: "Smartphones", 
      parent_id: catElectronics._id 
    });
    
    const catShoes = await Category.create({ 
      category_name: "Giày Dép", 
      description: "Giày thể thao, giày da", 
      parent_id: catFashion._id 
    });

    // --- 5. TẠO PRODUCTS (10 sản phẩm) ---
    console.log('📦 Đang tạo 10 Products...');
    
    // Mảng ảnh mẫu (3 ảnh để thỏa mãn validation)
    const sampleImages = [
      "https://placehold.co/600x400/png?text=Anh+1",
      "https://placehold.co/600x400/png?text=Anh+2",
      "https://placehold.co/600x400/png?text=Anh+3"
    ];

    const products = await Product.create([
      // --- Seller 1 bán Đồ điện tử (4 món) ---
      {
        product_name: "MacBook Pro M1 2020",
        description: "Máy còn mới 99%, pin sạc ít lần, đầy đủ phụ kiện zin theo máy.",
        start_price: 20000000,
        bid_increment: 500000,
        auction_end_time: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Còn 7 ngày
        seller_id: seller1._id,
        category_id: catLaptop._id,
        images: sampleImages
      },
      {
        product_name: "iPhone 13 Pro Max",
        description: "Bản 256GB màu xanh, trầy nhẹ ở viền, cam kết chưa sửa chữa.",
        start_price: 15000000,
        bid_increment: 200000,
        auction_end_time: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // Còn 3 ngày
        seller_id: seller1._id,
        category_id: catPhone._id,
        images: sampleImages
      },
      {
        product_name: "Laptop Dell XPS 13",
        description: "Dòng doanh nhân mỏng nhẹ, màn hình 4K cảm ứng cực đẹp.",
        start_price: 18000000,
        bid_increment: 500000,
        auction_end_time: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        seller_id: seller1._id,
        category_id: catLaptop._id,
        images: sampleImages
      },
      {
        product_name: "Samsung Galaxy S22 Ultra",
        description: "Bút S-Pen đầy đủ, màn hình bị ám nhẹ, bán giá xác cho anh em.",
        start_price: 8000000,
        bid_increment: 100000,
        auction_end_time: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        seller_id: seller1._id,
        category_id: catPhone._id,
        images: sampleImages
      },

      // --- Seller 2 bán Thời trang & Nội thất (6 món) ---
      {
        product_name: "Giày Nike Air Jordan 1",
        description: "Hàng auth bao check, size 42, mới đi lướt 2 lần.",
        start_price: 3000000,
        bid_increment: 100000,
        auction_end_time: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        seller_id: seller2._id,
        category_id: catShoes._id,
        images: sampleImages
      },
      {
        product_name: "Giày Adidas Ultraboost",
        description: "Chạy bộ cực êm, size 40, full box.",
        start_price: 1500000,
        bid_increment: 50000,
        auction_end_time: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
        seller_id: seller2._id,
        category_id: catShoes._id,
        images: sampleImages
      },
      {
        product_name: "Sofa Da Bò Ý",
        description: "Sofa nhập khẩu nguyên chiếc, da thật 100%, ngồi rất êm.",
        start_price: 25000000,
        bid_increment: 1000000,
        auction_end_time: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        seller_id: seller2._id,
        category_id: catFurniture._id, // Danh mục cha
        images: sampleImages
      },
      {
        product_name: "Bàn Ăn Gỗ Sồi",
        description: "Bàn ăn 6 ghế, gỗ sồi nga tự nhiên đã qua xử lý mối mọt.",
        start_price: 5000000,
        bid_increment: 200000,
        auction_end_time: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
        seller_id: seller2._id,
        category_id: catFurniture._id,
        images: sampleImages
      },
      {
        product_name: "Giày Tây Nam Da Cá Sấu",
        description: "Hàng thủ công handmade, size 41, lịch lãm sang trọng.",
        start_price: 4000000,
        bid_increment: 100000,
        auction_end_time: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000),
        seller_id: seller2._id,
        category_id: catShoes._id,
        images: sampleImages
      },
      {
        product_name: "Tủ Quần Áo Gỗ Công Nghiệp",
        description: "Tủ 4 cánh, màu trắng hiện đại, tháo lắp dễ dàng.",
        start_price: 2000000,
        bid_increment: 50000,
        auction_end_time: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        seller_id: seller2._id,
        category_id: catFurniture._id,
        images: sampleImages
      }
    ]);

    // --- 6. TẠO WATCHLIST ---
    console.log('👀 Đang tạo WatchLists...');
    await WatchList.create([
      { user_id: bidder1._id, product_id: products[0]._id }, // Bidder 1 thích Macbook
      { user_id: bidder1._id, product_id: products[4]._id }, // Bidder 1 thích Giày Nike
      { user_id: bidder2._id, product_id: products[1]._id }, // Bidder 2 thích iPhone
      { user_id: seller1._id, product_id: products[6]._id }, // Seller 1 cũng đi soi Sofa của Seller 2
    ]);

    // --- 7. TẠO QnA ---
    console.log('❓ Đang tạo QnAs...');
    await QnA.create([
      {
        product_id: products[0]._id, // Macbook
        asker_id: bidder1._id,
        question_content: "Máy có bị trầy xước gì không shop?",
        answerer_id: seller1._id,
        answer_content: "Máy đẹp keng như mới bạn nhé.",
        answer_timestamp: new Date()
      },
      {
        product_id: products[6]._id, // Sofa
        asker_id: bidder2._id,
        question_content: "Shop có hỗ trợ vận chuyển lên chung cư không?",
        // Chưa trả lời
      }
    ]);

    console.log('✨ --- TẠO DỮ LIỆU MẪU THÀNH CÔNG --- ✨');

  } catch (error) {
    console.error('❌ Lỗi khi tạo dữ liệu mẫu:', error);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Đã ngắt kết nối MongoDB.');
  }
};

seedDatabase();