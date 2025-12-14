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
    try { await User.collection.drop(); } catch(e) {}
    try { await Category.collection.drop(); } catch(e) {}
    try { await Product.collection.drop(); } catch(e) {}
    try { await Bid.collection.drop(); } catch(e) {}
    try { await WatchList.collection.drop(); } catch(e) {}
    try { await QnA.collection.drop(); } catch(e) {}
    try { await AuctionResult.collection.drop(); } catch(e) {} 
    try { await Rating.collection.drop(); } catch(e) {}
    try { await UpgradeRequest.collection.drop(); } catch(e) {}
    try { await DeletionHistory.collection.drop(); } catch(e) {}
    try { await RefreshToken.collection.drop(); } catch(e) {}

    console.log('✅ Đã xóa dữ liệu và index cũ.');

    // --- 2. CHUẨN BỊ MẬT KHẨU HASH ---
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("password123", salt);

    // --- 3. TẠO USERS ---
    console.log('👤 Đang tạo Users...');
    const [seller1, seller2, seller3, seller4, seller5, bidder1, bidder2, bidder3, admin] = await User.create([
      { 
        full_name: "Seller Một", 
        email: "seller1@example.com", 
        password: hashedPassword, 
        role: "seller", 
        address: "Hà Nội",
        phone_number: "0901234567",
        seller_expiry_date: new Date(Date.now() + 300 * 24 * 60 * 60 * 1000),
        providers: [
          { provider: 'local' }
        ],
      },
      { 
        full_name: "Seller Hai", 
        email: "seller2@example.com", 
        password: hashedPassword, 
        role: "seller", 
        address: "TP.HCM",
        phone_number: "0909888777",
        seller_expiry_date: new Date(Date.now() + 300 * 24 * 60 * 60 * 1000),
        providers: [
          { provider: 'local' }
        ],
      },
      { 
        full_name: "Seller Ba", 
        email: "seller3@example.com", 
        password: hashedPassword, 
        role: "seller", 
        address: "TP.HCM",
        phone_number: "0909888777",
        seller_expiry_date: new Date(Date.now() + 300 * 24 * 60 * 60 * 1000),
        providers: [
          { provider: 'local' }
        ],
      },
      { 
        full_name: "Seller Bốn", 
        email: "seller4@example.com", 
        password: hashedPassword, 
        role: "seller", 
        address: "TP.HCM",
        phone_number: "0909888777",
        seller_expiry_date: new Date(Date.now() + 300 * 24 * 60 * 60 * 1000),
        providers: [
          { provider: 'local' }
        ],
      },
      { 
        full_name: "Seller Năm", 
        email: "seller5@example.com", 
        password: hashedPassword, 
        role: "seller", 
        address: "TP.HCM",
        phone_number: "0909888777",
        seller_expiry_date: new Date(Date.now() + 300 * 24 * 60 * 60 * 1000),
        providers: [
          { provider: 'local' }
        ],
      },
      { 
        full_name: "Bidder Một", 
        email: "bidder1@example.com", 
        password: hashedPassword, 
        role: "bidder", 
        address: "Đà Nẵng",
        phone_number: "0912345678",
        providers: [
          { provider: 'local' }
        ],
      },
      { 
        full_name: "Bidder Hai", 
        email: "bidder2@example.com", 
        password: hashedPassword, 
        role: "bidder", 
        address: "Cần Thơ",
        phone_number: "0987654321",
        providers: [
          { provider: 'local' }
        ],
      },
      { 
        full_name: "Bidder Ba", 
        email: "bidder3@example.com", 
        password: hashedPassword, 
        role: "bidder", 
        address: "Cần Thơ",
        phone_number: "0987654321",
        providers: [
          { provider: 'local' }
        ],
      },
      { 
        full_name: "Admin Quản Trị", 
        email: "admin@example.com", 
        password: hashedPassword, 
        role: "admin", 
        address: "Server",
        phone_number: "0000000000",
        providers: [
          { provider: 'local' }
        ],
      }
    ]);

    // --- 4. TẠO CATEGORIES ---
    console.log('📂 Đang tạo Categories...');
    
    // 3 Danh mục cha
    const catElectronics = await Category.create({ category_name: "Đồ Điện Tử", description: "Các thiết bị điện tử" , slug: "do-dien-tu" });
    const catFashion = await Category.create({ category_name: "Thời Trang", description: "Quần áo, giày dép", slug: "thoi-trang" });
    const catFurniture = await Category.create({ category_name: "Nội Thất", description: "Bàn ghế, tủ giường", slug: "noi-that" }); // Không có con

    // 3 Danh mục con
    const catLaptop = await Category.create({ 
      category_name: "Laptop", 
      description: "Máy tính xách tay các loại", 
      parent: catElectronics._id,
      slug: "laptop"
    });
    const catPhone = await Category.create({ 
      category_name: "Điện Thoại", 
      description: "Smartphones", 
      parent: catElectronics._id,
      slug: "dien-thoai"
    });
    
    const catShoes = await Category.create({ 
      category_name: "Giày Dép", 
      description: "Giày thể thao, giày da", 
      parent: catFashion._id,
      slug: "giay-dep"
    });

    // --- 5. TẠO PRODUCTS ---
    console.log('📦 Đang tạo Products...');
    
    // Mảng ảnh mẫu (3 ảnh để thỏa mãn validation)
    const sampleThumbnail = "https://bizweb.dktcdn.net/thumb/1024x1024/100/116/615/products/mbp-spacegray-select-202206-jpeg.jpg";
    const sampleImages = [
      "https://cdn.shopify.com/s/files/1/0456/5070/6581/files/top-23-mau-giay-sneaker-dang-duoc-san-lung-nhat-nam-2022_600x600.jpg",
      "https://thanhnien.mediacdn.vn/uploaded/thuthao/2018_11_10/14_ZHRV.jpg",
      "https://cdn.tgdd.vn/Files/2020/06/22/1264873/9bestportabletechgadgetsforeverydayuse_800x450.jpg"
    ];

    const createList = async (dataList) => {
        for (const item of dataList) {
            // 1. Tách description cũ ra
            const { description, ...otherFields } = item;

            // 2. Tạo object mới đúng chuẩn Schema
            const productData = {
                ...otherFields,
                // Chuyển description text -> description_history array
                description_history: [{
                    // Bọc thẻ <p> để giả lập đây là HTML từ Editor gửi lên
                    content: `<p>${description}</p>`, 
                    timestamp: new Date()
                }]
                // Không cần field description_current, hook pre-save sẽ tự làm
            };

            // 3. Create (Nó sẽ kích hoạt pre('save') hook để sanitize và tạo index search)
            await Product.create(productData);
        }
    };

    const activeProducts = [
      {
        product_name: "MacBook Pro 14 M1 2021 – Likenew 99%",
        description: "Máy còn mới 99%, pin sạc ít lần, đầy đủ phụ kiện zin theo máy.",
        start_price: 20000000,
        bid_increment: 500000,
        auction_end_time: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        seller: seller5._id,
        category: catLaptop._id,
        thumbnail: sampleThumbnail,
        images: sampleImages
      },
      {
        product_name: "MacBook Pro 16 M1 Max 2022 – Bản cao cấp",
        description: "Hiệu năng cực mạnh, phù hợp cho designer, editor.",
        start_price: 22000000,
        bid_increment: 500000,
        auction_end_time: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        seller: seller5._id,
        category: catLaptop._id,
        thumbnail: sampleThumbnail,
        images: sampleImages
      },
      {
        product_name: "MacBook Air M1 2023 – Mỏng nhẹ tiện dụng",
        description: "Thiết kế mỏng nhẹ, pin trâu, phù hợp sinh viên.",
        start_price: 18000000,
        bid_increment: 500000,
        auction_end_time: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        seller: seller5._id,
        category: catLaptop._id,
        thumbnail: sampleThumbnail,
        images: sampleImages
      },
      {
        product_name: "MacBook Pro 14 M2 2024 – Máy đẹp như mới",
        description: "Chip M2 mạnh mẽ, màn hình XDR siêu đẹp.",
        start_price: 24000000,
        bid_increment: 500000,
        auction_end_time: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        seller: seller5._id,
        category: catLaptop._id,
        thumbnail: sampleThumbnail,
        images: sampleImages
      },
      {
        product_name: "MacBook Air M2 2025 – Siêu mỏng nhẹ",
        description: "Máy rất ít sử dụng, ngoại hình không tì vết.",
        start_price: 19000000,
        bid_increment: 500000,
        auction_end_time: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        seller: seller1._id,
        category: catLaptop._id,
        thumbnail: sampleThumbnail,
        images: sampleImages
      },
      {
        product_name: "MacBook Pro 16 M3 2026 – Hàng fullbox",
        description: "Hiệu năng vô đối, phù hợp dân chuyên nghiệp.",
        start_price: 26000000,
        bid_increment: 500000,
        auction_end_time: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        seller: seller1._id,
        category: catLaptop._id,
        thumbnail: sampleThumbnail,
        images: sampleImages
      },
      {
        product_name: "MacBook Pro 13 M3 2027 – Like new",
        description: "Máy sử dụng văn phòng nhẹ nhàng, máy đẹp.",
        start_price: 21000000,
        bid_increment: 500000,
        auction_end_time: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        seller: seller1._id,
        category: catLaptop._id,
        thumbnail: sampleThumbnail,
        images: sampleImages
      },
      {
        product_name: "MacBook Air M3 2028 – Chính hãng VN/A",
        description: "Hàng ít dùng, pin cực ngon.",
        start_price: 20000000,
        bid_increment: 500000,
        auction_end_time: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        seller: seller3._id,
        category: catLaptop._id,
        thumbnail: sampleThumbnail,
        images: sampleImages
      },
      {
        product_name: "MacBook Pro 14 M2 Pro 2029 – Gần như mới",
        description: "Máy không trầy xước, cấu hình mạnh mẽ.",
        start_price: 25000000,
        bid_increment: 500000,
        auction_end_time: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        seller: seller3._id,
        category: catLaptop._id,
        thumbnail: sampleThumbnail,
        images: sampleImages
      },
      {
        product_name: "MacBook Pro 13 Intel 2020 – Máy văn phòng",
        description: "Máy chạy mượt, phù hợp dân văn phòng.",
        start_price: 16000000,
        bid_increment: 500000,
        auction_end_time: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        seller: seller1._id,
        category: catLaptop._id,
        thumbnail: sampleThumbnail,
        images: sampleImages
      },

      {
        product_name: "iPhone 13 Pro Max 256GB – Xanh Sierra",
        description: "Bản 256GB màu xanh, trầy nhẹ ở viền, cam kết chưa sửa chữa.",
        start_price: 15000000,
        bid_increment: 200000,
        buy_it_now_price: 18000000,
        auction_end_time: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        seller: seller1._id,
        category: catPhone._id,
        thumbnail: sampleThumbnail,
        images: sampleImages
      },
      {
        product_name: "Laptop Dell XPS 13 – Màn 4K cảm ứng",
        description: "Dòng doanh nhân mỏng nhẹ, màn hình 4K cảm ứng cực đẹp.",
        start_price: 18000000,
        bid_increment: 500000,
        auction_end_time: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        seller: seller1._id,
        category: catLaptop._id,
        thumbnail: sampleThumbnail,
        images: sampleImages
      },
      {
        product_name: "Samsung Galaxy S22 Ultra – Bút S-Pen đầy đủ",
        description: "Bút S-Pen đầy đủ, màn hình bị ám nhẹ, bán giá xác.",
        start_price: 8000000,
        bid_increment: 100000,
        auction_end_time: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        seller: seller1._id,
        category: catPhone._id,
        thumbnail: sampleThumbnail,
        images: sampleImages
      },

      // --- Seller 2: Thời trang & Nội thất ---
      {
        product_name: "Đồng Hồ Rolex Submariner – Cấm Newbie",
        description: "Chỉ dành cho người có uy tín cao.",
        start_price: 100000000,
        bid_increment: 2000000,
        auction_end_time: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        seller: seller2._id,
        category: catFashion._id,
        thumbnail: sampleThumbnail,
        images: sampleImages,
        allow_newbie: false
      },
      {
        product_name: "Nike Air Jordan 1 – Size 42, Auth 100%",
        description: "Hàng auth bao check, size 42, mới đi lướt 2 lần.",
        start_price: 3000000,
        bid_increment: 100000,
        auction_end_time: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        seller: seller2._id,
        category: catShoes._id,
        thumbnail: sampleThumbnail,
        images: sampleImages
      },
      {
        product_name: "Adidas Ultraboost – Fullbox Size 40",
        description: "Chạy bộ cực êm, size 40, full box.",
        start_price: 1500000,
        bid_increment: 50000,
        auction_end_time: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
        seller: seller2._id,
        category: catShoes._id,
        thumbnail: sampleThumbnail,
        images: sampleImages
      },
      {
        product_name: "Sofa Da Bò Ý – Cao Cấp Nhập Khẩu",
        description: "Sofa nhập khẩu nguyên chiếc, da thật 100%, ngồi rất êm.",
        start_price: 25000000,
        bid_increment: 1000000,
        auction_end_time: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        seller: seller2._id,
        category: catFurniture._id,
        thumbnail: sampleThumbnail,
        images: sampleImages
      },
      {
        product_name: "Bàn Ăn Gỗ Sồi 6 Ghế – Hàng cao cấp",
        description: "Gỗ sồi nga tự nhiên đã qua xử lý mối mọt.",
        start_price: 5000000,
        bid_increment: 200000,
        auction_end_time: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
        seller: seller2._id,
        category: catFurniture._id,
        thumbnail: sampleThumbnail,
        images: sampleImages
      },
      {
        product_name: "Giày Tây Da Cá Sấu – Handmade Size 41",
        description: "Hàng thủ công handmade, size 41, lịch lãm sang trọng.",
        start_price: 4000000,
        bid_increment: 100000,
        buy_it_now_price: 6000000,
        auction_end_time: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000),
        seller: seller2._id,
        category: catShoes._id,
        thumbnail: sampleThumbnail,
        images: sampleImages
      },
      {
        product_name: "Tủ Quần Áo Gỗ Công Nghiệp 4 Cánh – Màu Trắng",
        description: "Tủ 4 cánh, màu trắng hiện đại, tháo lắp dễ dàng.",
        start_price: 2000000,
        bid_increment: 50000,
        auction_end_time: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        seller: seller2._id,
        category: catFurniture._id,
        thumbnail: sampleThumbnail,
        images: sampleImages
      }
    ];

    const soldProducts = [
        {
            product_name: "Sony PlayStation 5 (Đã bán)",
            description: "Máy chơi game console, fullbox.",
            start_price: 10000000,
            bid_increment: 200000,
            auction_end_time: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // Đã hết hạn 2 ngày
            seller: seller1._id,
            category: catElectronics._id,
            thumbnail: sampleThumbnail,
            images: sampleImages,
            auction_status: 'sold', // Đã bán
            current_highest_bidder: bidder1._id, // Bidder 1 thắng
            current_highest_price: 12000000
        },
        {
            product_name: "Loa Bluetooth Marshall (Đã bán)",
            description: "Nghe nhạc cực hay.",
            start_price: 5000000,
            bid_increment: 100000,
            auction_end_time: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // Đã hết hạn 5 ngày
            seller: seller2._id,
            category: catElectronics._id,
            thumbnail: sampleThumbnail,
            images: sampleImages,
            auction_status: 'sold',
            current_highest_bidder: bidder2._id, // Bidder 2 thắng
            current_highest_price: 6000000
        }
    ];

    console.log('Đang seed Active Products...');
    await createList(activeProducts);

    console.log('Đang seed Sold Products...');
    await createList(soldProducts);

    // --- 6. TẠO WATCHLIST ---
    console.log('🔄 Đang lấy lại ID sản phẩm từ DB...');
    const currentActiveProducts = await Product.find({ auction_status: 'active' });
    if (currentActiveProducts.length > 0) {
      console.log('👀 Đang tạo WatchLists...');
      
      await WatchList.create([
        // Giờ thì activeProducts đã có dữ liệu thật, gọi [0] vô tư
        { user: bidder1._id, product: currentActiveProducts[0]._id }, 
        { user: bidder1._id, product: currentActiveProducts[4] ? currentActiveProducts[4]._id : currentActiveProducts[0]._id }, // Check lỡ mảng ngắn quá
        { user: bidder2._id, product: currentActiveProducts[1] ? currentActiveProducts[1]._id : currentActiveProducts[0]._id }, 
        { user: seller1._id, product: currentActiveProducts[6] ? currentActiveProducts[6]._id : currentActiveProducts[0]._id }, 
      ]);
    } else {
        console.log('⚠️ Không tìm thấy Active Product nào để tạo WatchList');
    }

    console.log('✅ Xong tất cả!');

    // --- 7. TẠO AUCTION RESULTS (Đơn hàng) ---
    console.log('🔄 Đang lấy danh sách sản phẩm ĐÃ BÁN từ DB...');
    
    // BƯỚC QUAN TRỌNG: Phải query lấy thằng status 'sold' về mới có _id
    const dbSoldProducts = await Product.find({ auction_status: 'sold' });
    
    let result = []
    if (dbSoldProducts.length > 0) {
        console.log('🏆 Đang tạo Auction Results...');
        
        result = await AuctionResult.create([
             {
                product: dbSoldProducts[0]._id,
                winning_bidder: bidder1._id,
                seller: seller1._id,
                final_price: 12000000,
                status: 'completed',
                shipping_address: "123 Đường A, Đà Nẵng",
                payment_proof: "https://example.com/payment.jpg",
                shipping_proof: "https://example.com/ship.jpg"
            },
            {
                product: dbSoldProducts[1] ? dbSoldProducts[1]._id : dbSoldProducts[0]._id, 
                winning_bidder: bidder2._id,
                seller: seller2._id,
                final_price: 6000000,
                status: 'pending_payment',
            }
        ]);
        
        console.log('✅ Tạo Auction Results thành công!');

    } else {
        console.log('⚠️ Không tìm thấy sản phẩm đã bán (Sold) nào để tạo kết quả.');
    }

    // --- 7. TẠO RATINGS & UPDATE USER STATS ---
    console.log('⭐ Đang tạo Ratings...');

    await Rating.create([
        {
            rater: bidder1._id,
            rated_user: seller1._id, // Khen Seller 1
            auction_result: result[0]._id,
            rating_type: 1,
            comment: "Shop uy tín, máy ngon!"
        },
        {
            rater: seller1._id,
            rated_user: bidder1._id, // Khen Bidder 1
            auction_result: result[0]._id,
            rating_type: 1,
            comment: "Khách chuyển khoản nhanh, very good."
        },
    ]);

    // --- 8. CẬP NHẬT ĐIỂM SỐ USER (Quan trọng để test logic) ---
    console.log('📊 Đang cập nhật điểm User...');

    // Seller 1: +1 điểm (1 đánh giá)
    await User.findByIdAndUpdate(seller1._id, { rating_score: 1, rating_count: 1 });

    // Bidder 1: +1 điểm (1 đánh giá) -> Uy tín 100%
    await User.findByIdAndUpdate(bidder1._id, { rating_score: 1, rating_count: 1 });

    // --- 9. TẠO QnA ---
    if (typeof currentActiveProducts !== 'undefined' && currentActiveProducts.length > 0) {
        console.log('❓ Đang tạo QnAs...');
        
        await QnA.create([
          {
            product: currentActiveProducts[0]._id, // Macbook
            asker: bidder1._id,
            question_content: "Máy có bị trầy xước gì không shop?",
            answerer: seller1._id,
            answer_content: "Máy đẹp keng như mới bạn nhé.",
            answer_timestamp: new Date()
          },
          {
            product: currentActiveProducts[6] ? currentActiveProducts[6]._id : currentActiveProducts[0]._id, // Sofa
            asker: bidder2._id,
            question_content: "Shop có hỗ trợ vận chuyển lên chung cư không?",
          }
        ]);
        
        console.log('✅ Tạo QnA thành công!');
    } else {
        console.log('⚠️ Không có Active Product để tạo QnA.');
    }

    console.log('✨ --- TẠO DỮ LIỆU MẪU THÀNH CÔNG --- ✨');

  } catch (error) {
    console.error('❌ Lỗi khi tạo dữ liệu mẫu:', error);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Đã ngắt kết nối MongoDB.');
  }
};

seedDatabase();