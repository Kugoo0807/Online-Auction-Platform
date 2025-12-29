const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('./connect');
const {
  User,
  UpgradeRequest,
  WatchList,
  Category,
  Product,
  Bid,
  QnA,
  AuctionResult,
  Rating,
  RefreshToken,
  ChatMessage,
  OtpModel,
} = require('./schema');

// Import dữ liệu từ các file đã tách
const getUsersData = require('./data/seeds/users.data');
const getCategoriesData = require('./data/seeds/categories.data');
const getProductsData = require('./data/seeds/products.data');
const getRelationsData = require('./data/seeds/relations.data');
const sampleAssets = require('./data/seeds/sample-assets.data');

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
    try { await RefreshToken.collection.drop(); } catch(e) {}
    try { await ChatMessage.collection.drop(); } catch(e) {}
    try { await OtpModel.collection.drop(); } catch(e) {}

    console.log('✅ Đã xóa dữ liệu và index cũ.');

    // --- 2. CHUẨN BỊ MẬT KHẨU HASH ---
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("password123", salt);

    // --- 3. TẠO USERS ---
    console.log('👤 Đang tạo Users...');
    const usersData = getUsersData(hashedPassword);
    const [seller1, seller2, seller3, seller4, seller5, bidder1, bidder2, bidder3, admin] = await User.create(usersData);

    // --- 4. TẠO CATEGORIES ---
    console.log('📂 Đang tạo Categories...');
    const categories = await getCategoriesData(Category);

    // --- 5. TẠO PRODUCTS ---
    console.log('📦 Đang tạo Products...');
    
    const createList = async (dataList) => {
        for (const item of dataList) {
            const { description, ...otherFields } = item;
            const productData = {
                ...otherFields,
                description_history: [{
                    content: `<p>${description}</p>`, 
                    timestamp: new Date()
                }]
            };
            await Product.create(productData);
        }
    };

    // Lấy dữ liệu products
    const sellers = { seller1, seller2, seller3, seller4, seller5 };
    const bidders = { bidder1, bidder2, bidder3 };
    const { activeProducts, soldProducts } = getProductsData({ sellers, categories, assets: sampleAssets, bidders });

    console.log('Đang seed Active Products...');
    await createList(activeProducts);

    console.log('Đang seed Sold Products...');
    await createList(soldProducts);

    // --- 6. TẠO WATCHLIST ---
    console.log('🔄 Đang lấy lại ID sản phẩm từ DB...');
    const currentActiveProducts = await Product.find({ auction_status: 'active' });
    
    // --- 7. TẠO AUCTION RESULTS (Đơn hàng) ---
    console.log('🔄 Đang lấy danh sách sản phẩm ĐÃ BÁN từ DB...');
    const dbSoldProducts = await Product.find({ auction_status: 'sold' });
    
    // Lấy dữ liệu quan hệ
    const users = { seller1, seller2, bidder1, bidder2, bidder3 };
    const relationsData = getRelationsData({ users, products: currentActiveProducts, auctionResults: [] });

    // --- 6.5. TẠO BIDS THÔNG QUA LOGIC ĐẤU GIÁ ---
    console.log('💰 Đang tạo Bids thông qua logic đấu giá...');
    
    // Helper function để tạo bids cho 1 product
    const createBidsForProduct = async (product, productData) => {
      const { start_price, bid_increment } = productData;
      const bidders = [bidder1, bidder2, bidder3];
      let bidCount = 0;
      
      // Tạo 5 lượt đấu giá xen kẽ giữa các bidder
      for (let i = 0; i < 5; i++) {
        const bidder = bidders[i % 3];
        const bidPrice = start_price + (bid_increment * (i + 1));
        
        // Logic đấu giá đơn giản (không validate quá kỹ)
        const isFirstBid = product.bid_count === 0 || !product.current_highest_bidder;
        const userIdStr = bidder._id.toString();
        
        // Cập nhật dữ liệu
        const currentBidCount = product.bid_counts.get(userIdStr) || 0;
        product.bid_counts.set(userIdStr, currentBidCount + 1);
        product.auto_bid_map.set(userIdStr, bidPrice);
        product.bid_count += 1;
        
        if (isFirstBid) {
          product.current_highest_price = start_price;
          product.current_highest_bidder = bidder._id;
          await product.save();
          
          await Bid.create({
            user: bidder._id,
            product: product._id,
            price: start_price,
            date: new Date(Date.now() - (5 - i) * 60 * 60 * 1000)
          });
          bidCount++;
        } else if (product.current_highest_bidder?.toString() === userIdStr) {
          // Người giữ giá tăng max bid
          product.bid_counts.set(userIdStr, currentBidCount);
          product.bid_count -= 1;
          await product.save();
        } else {
          const currentHolderId = product.current_highest_bidder;
          const currentHolderIdStr = currentHolderId ? currentHolderId.toString() : null;
          const currentHolderMaxBid = currentHolderIdStr ? product.auto_bid_map.get(currentHolderIdStr) : 0;
          
          if (bidPrice > currentHolderMaxBid) {
            // Người mới thắng
            product.current_highest_bidder = bidder._id;
            product.current_highest_price = Math.min(bidPrice, currentHolderMaxBid + bid_increment);
            await product.save();
            
            await Bid.create({
              user: bidder._id,
              product: product._id,
              price: product.current_highest_price,
              date: new Date(Date.now() - (5 - i) * 60 * 60 * 1000)
            });
            bidCount++;
          } else {
            // Người cũ vẫn giữ
            product.current_highest_price = bidPrice;
            
            await Bid.create({
              user: bidder._id,
              product: product._id,
              price: bidPrice,
              date: new Date(Date.now() - (5 - i) * 60 * 60 * 1000)
            });
            
            await Bid.create({
              user: currentHolderId,
              product: product._id,
              price: product.current_highest_price,
              is_priority: true,
              date: new Date(Date.now() - (5 - i) * 60 * 60 * 1000)
            });
            
            product.bid_counts.set(currentHolderIdStr, (product.bid_counts.get(currentHolderIdStr) || 0) + 1);
            product.bid_count += 1;
            await product.save();
            bidCount += 2;
          }
        }
      }
      
      return bidCount;
    };
    
    // Tạo bids cho active products
    let totalBids = 0;
    for (const product of currentActiveProducts) {
      const count = await createBidsForProduct(product, product);
      totalBids += count;
    }
    
    // Tạo bids cho sold products
    for (const product of dbSoldProducts) {
      const count = await createBidsForProduct(product, product);
      totalBids += count;
    }
    
    console.log(`✅ Đã tạo ${totalBids} bids!`);

    // Tạo WatchList
    if (currentActiveProducts.length > 0) {
      console.log('👀 Đang tạo WatchLists...');
      await WatchList.create(relationsData.watchLists);
    } else {
      console.log('⚠️ Không tìm thấy Active Product nào để tạo WatchList');
    }

    // Tạo Auction Results và điều chỉnh final_price nếu cần
    let auctionResults = [];
    if (dbSoldProducts.length > 0) {
      console.log('🏆 Đang tạo Auction Results...');
      const auctionResultsData = relationsData.auctionResultsData(dbSoldProducts);
      
      // Điều chỉnh final_price nếu current_highest_price cao hơn
      for (let i = 0; i < auctionResultsData.length; i++) {
        const product = dbSoldProducts[i];
        if (product && product.current_highest_price > auctionResultsData[i].final_price) {
          auctionResultsData[i].final_price = product.current_highest_price;
          console.log(`   ⚠️ Điều chỉnh final_price cho ${product.product_name}: ${auctionResultsData[i].final_price.toLocaleString()}đ`);
        }
      }
      
      auctionResults = await AuctionResult.create(auctionResultsData);
      console.log('✅ Tạo Auction Results thành công!');
    } else {
      console.log('⚠️ Không tìm thấy sản phẩm đã bán (Sold) nào để tạo kết quả.');
    }

    // --- 8. TẠO RATINGS & UPDATE USER STATS ---
    if (auctionResults.length > 0) {
      console.log('⭐ Đang tạo Ratings...');
      const ratingsData = relationsData.ratings(auctionResults);
      await Rating.create(ratingsData);

      // Cập nhật điểm số User
      console.log('📊 Đang cập nhật điểm User...');
      for (const update of relationsData.userStatsUpdates) {
        await User.findByIdAndUpdate(update.userId, { 
          rating_score: update.rating_score, 
          rating_count: update.rating_count 
        });
      }
    }

    // --- 9. TẠO QnA ---
    if (currentActiveProducts.length > 0) {
      console.log('❓ Đang tạo QnAs...');
      await QnA.create(relationsData.qnas);
      console.log('✅ Tạo QnA thành công!');
    } else {
      console.log('⚠️ Không có Active Product để tạo QnA.');
    }

    console.log('✅ Xong tất cả!');

    console.log('✨ --- TẠO DỮ LIỆU MẪU THÀNH CÔNG --- ✨');

  } catch (error) {
    console.error('❌ Lỗi khi tạo dữ liệu mẫu:', error);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Đã ngắt kết nối MongoDB.');
  }
};

seedDatabase();