// 1. DỮ LIỆU DANH MỤC (Giữ nguyên cấu trúc chuẩn)
export const categories = [
  {
    "_id": "6927d0b500c978b0d0efb95a",
    "category_name": "Giày Dép",
    "description": "Giày thể thao, giày da",
    "parent": {
      "_id": "6927d0b500c978b0d0efb950",
      "category_name": "Thời Trang"
    },
    "slug": "giay-dep",
    "__v": 0
  },
  {
    "_id": "6927d0b500c978b0d0efb954",
    "category_name": "Laptop",
    "description": "Máy tính xách tay các loại",
    "parent": {
      "_id": "6927d0b500c978b0d0efb94e",
      "category_name": "Đồ Điện Tử"
    },
    "slug": "laptop",
    "__v": 0
  },
  {
    "_id": "6927d0b500c978b0d0efb952",
    "category_name": "Nội Thất",
    "description": "Bàn ghế, tủ giường",
    "parent": null,
    "slug": "noi-that",
    "__v": 0
  },
  {
    "_id": "6927d0b500c978b0d0efb950",
    "category_name": "Thời Trang",
    "description": "Quần áo, giày dép",
    "parent": null,
    "slug": "thoi-trang",
    "__v": 0
  },
  {
    "_id": "6927d0b500c978b0d0efb957",
    "category_name": "Điện Thoại",
    "description": "Smartphones",
    "parent": {
      "_id": "6927d0b500c978b0d0efb94e",
      "category_name": "Đồ Điện Tử"
    },
    "slug": "dien-thoai",
    "__v": 0
  },
  {
    "_id": "6927d0b500c978b0d0efb94e",
    "category_name": "Đồ Điện Tử",
    "description": "Các thiết bị điện tử",
    "parent": null,
    "slug": "do-dien-tu",
    "__v": 0
  }
];

// 2. DỮ LIỆU SẢN PHẨM MẪU (DATA SIÊU LỚN - HƠN 100 SẢN PHẨM ĐIỆN THOẠI)
export const MOCK_PRODUCTS = [
  // =================================================================
  // --- LAPTOP (slug: laptop) ---
  // =================================================================
  { _id: "lap1", product_name: "MacBook Pro 14 M3", current_highest_price: 39990000, images: ["https://cdn.tgdd.vn/Products/Images/44/318225/macbook-pro-14-inch-m3-gray-thumb-600x600.jpg"], category_slug: "laptop" },
  { _id: "lap2", product_name: "MacBook Air M2 13.6 inch", current_highest_price: 26490000, images: ["https://cdn.tgdd.vn/Products/Images/44/282827/apple-macbook-air-m2-2022-16gb-256gb-thumb-600x600.jpg"], category_slug: "laptop" },
  { _id: "lap3", product_name: "Dell XPS 13 Plus 9320", current_highest_price: 35000000, images: ["https://laptopvang.com/wp-content/uploads/2023/04/Dell-XPS-9320-Platinum-01.jpg"], category_slug: "laptop" },
  { _id: "lap4", product_name: "Asus ROG Zephyrus G14", current_highest_price: 42000000, images: ["https://cdn.tgdd.vn/Products/Images/44/302829/asus-rog-zephyrus-g14-ga402xv-r9-n2085w-thumb-600x600.jpg"], category_slug: "laptop" },
  { _id: "lap5", product_name: "Lenovo ThinkPad X1 Carbon Gen 11", current_highest_price: 45000000, images: ["https://cdn.tgdd.vn/Products/Images/44/313337/lenovo-thinkpad-x1-carbon-gen-11-i7-21hm001lva-thumb-600x600.jpg"], category_slug: "laptop" },
  { _id: "lap6", product_name: "HP Spectre x360 14", current_highest_price: 38000000, images: ["https://cdn.tgdd.vn/Products/Images/44/311029/hp-spectre-x360-14-ef2030tu-i7-8f1t0pa-thumb-600x600.jpg"], category_slug: "laptop" },
  { _id: "lap7", product_name: "MacBook Air M1 2020", current_highest_price: 18490000, images: ["https://cdn.tgdd.vn/Products/Images/44/231244/macbook-air-m1-2020-gray-600x600.jpg"], category_slug: "laptop" },
  { _id: "lap8", product_name: "Acer Nitro 5 Gaming", current_highest_price: 19990000, images: ["https://cdn.tgdd.vn/Products/Images/44/303512/acer-nitro-5-tiger-an515-58-52sp-i5-nhqfhsv001-thumb-600x600.jpg"], category_slug: "laptop" },

  // =================================================================
  // --- ĐIỆN THOẠI (slug: dien-thoai) - SAMSUNG (40 Sản phẩm) ---
  // =================================================================
  { _id: "ss01", product_name: "Samsung Galaxy S24 Ultra 5G 1TB", current_highest_price: 41990000, images: ["https://cdn.tgdd.vn/Products/Images/42/307174/samsung-galaxy-s24-ultra-grey-thumb-600x600.jpg"], category_slug: "dien-thoai" },
  { _id: "ss02", product_name: "Samsung Galaxy S24 Ultra 5G 512GB", current_highest_price: 35990000, images: ["https://cdn.tgdd.vn/Products/Images/42/307174/samsung-galaxy-s24-ultra-grey-thumb-600x600.jpg"], category_slug: "dien-thoai" },
  { _id: "ss03", product_name: "Samsung Galaxy S24 Plus 5G", current_highest_price: 26990000, images: ["https://cdn.tgdd.vn/Products/Images/42/307172/samsung-galaxy-s24-plus-grey-thumb-600x600.jpg"], category_slug: "dien-thoai" },
  { _id: "ss04", product_name: "Samsung Galaxy S24 5G", current_highest_price: 22990000, images: ["https://cdn.tgdd.vn/Products/Images/42/319665/samsung-galaxy-a15-yellow-thumb-600x600.jpg"], category_slug: "dien-thoai" },
  { _id: "ss05", product_name: "Samsung Galaxy Z Fold5 5G 1TB", current_highest_price: 48990000, images: ["https://cdn.tgdd.vn/Products/Images/42/301642/oppo-reno8t-vang-thumb-600x600.jpg"], category_slug: "dien-thoai" },
  { _id: "ss06", product_name: "Samsung Galaxy Z Flip5 5G", current_highest_price: 25990000, images: ["https://cdn.tgdd.vn/Products/Images/42/306994/samsung-galaxy-s23-fe-mint-thumb-600x600.jpg"], category_slug: "dien-thoai" },
  { _id: "ss07", product_name: "Samsung Galaxy S23 Ultra 5G", current_highest_price: 24990000, images: ["https://cdn.tgdd.vn/Products/Images/42/235838/samsung-galaxy-s22-ultra-burgundy-thumb-600x600.jpg"], category_slug: "dien-thoai" },
  { _id: "ss08", product_name: "Samsung Galaxy S23 Plus", current_highest_price: 20990000, images: ["https://cdn.tgdd.vn/Products/Images/42/264060/samsung-galaxy-s23-600x600.jpg"], category_slug: "dien-thoai" },
  { _id: "ss09", product_name: "Samsung Galaxy S23 FE 5G", current_highest_price: 12990000, images: ["https://cdn.tgdd.vn/Products/Images/42/306994/samsung-galaxy-s23-fe-mint-thumb-600x600.jpg"], category_slug: "dien-thoai" },
  { _id: "ss10", product_name: "Samsung Galaxy A55 5G", current_highest_price: 9990000, images: ["https://cdn.tgdd.vn/Products/Images/42/322625/samsung-galaxy-a55-5g-xanh-thumb-1-600x600.jpg"], category_slug: "dien-thoai" },
  { _id: "ss11", product_name: "Samsung Galaxy A35 5G", current_highest_price: 8290000, images: ["https://cdn.tgdd.vn/Products/Images/42/322626/samsung-galaxy-a35-5g-xanh-thumb-1-600x600.jpg"], category_slug: "dien-thoai" },
  { _id: "ss12", product_name: "Samsung Galaxy M54 5G", current_highest_price: 10490000, images: ["https://cdn.tgdd.vn/Products/Images/42/274359/samsung-galaxy-m54-bac-thumb-600x600.jpg"], category_slug: "dien-thoai" },
  { _id: "ss13", product_name: "Samsung Galaxy M34 5G", current_highest_price: 7690000, images: ["https://cdn.tgdd.vn/Products/Images/42/313437/vivo-v29e-xanh-thumb-600x600.jpg"], category_slug: "dien-thoai" },
  { _id: "ss14", product_name: "Samsung Galaxy A25 5G", current_highest_price: 6590000, images: ["https://cdn.tgdd.vn/Products/Images/42/319665/samsung-galaxy-a15-yellow-thumb-600x600.jpg"], category_slug: "dien-thoai" },
  { _id: "ss15", product_name: "Samsung Galaxy A15 LTE", current_highest_price: 4990000, images: ["https://cdn.tgdd.vn/Products/Images/42/319665/samsung-galaxy-a15-yellow-thumb-600x600.jpg"], category_slug: "dien-thoai" },
  { _id: "ss16", product_name: "Samsung Galaxy A05s", current_highest_price: 3990000, images: ["https://cdn.tgdd.vn/Products/Images/42/317530/samsung-galaxy-a05s-xanh-thumb-600x600.jpg"], category_slug: "dien-thoai" },
  { _id: "ss17", product_name: "Samsung Galaxy A05", current_highest_price: 3090000, images: ["https://cdn.tgdd.vn/Products/Images/42/317529/samsung-galaxy-a05-den-thumb-600x600.jpg"], category_slug: "dien-thoai" },
  { _id: "ss18", product_name: "Samsung Galaxy S22 Ultra (Cũ)", current_highest_price: 15500000, images: ["https://cdn.tgdd.vn/Products/Images/42/235838/samsung-galaxy-s22-ultra-burgundy-thumb-600x600.jpg"], category_slug: "dien-thoai" },
  { _id: "ss19", product_name: "Samsung Galaxy Note 20 Ultra (Cũ)", current_highest_price: 11000000, images: ["https://cdn.tgdd.vn/Products/Images/42/220522/samsung-galaxy-note-20-ultra-trang-600x600.jpg"], category_slug: "dien-thoai" },
  { _id: "ss20", product_name: "Samsung Galaxy S21 FE", current_highest_price: 8990000, images: ["https://cdn.tgdd.vn/Products/Images/42/267211/samsung-galaxy-s21-fe-xanh-la-600x600.jpg"], category_slug: "dien-thoai" },
  { _id: "ss21", product_name: "Samsung Galaxy S20 Ultra", current_highest_price: 8500000, images: ["https://cdn.tgdd.vn/Products/Images/42/217937/samsung-galaxy-s20-ultra-den-600x600.jpg"], category_slug: "dien-thoai" },
  { _id: "ss22", product_name: "Samsung Galaxy S10 Plus", current_highest_price: 5500000, images: ["https://cdn.tgdd.vn/Products/Images/42/179530/samsung-galaxy-s10-plus-black-flash-600x600.jpg"], category_slug: "dien-thoai" },
  { _id: "ss23", product_name: "Samsung Galaxy A73 5G", current_highest_price: 7990000, images: ["https://cdn.tgdd.vn/Products/Images/42/246199/samsung-galaxy-a73-5g-xanh-thumb-600x600.jpg"], category_slug: "dien-thoai" },
  { _id: "ss24", product_name: "Samsung Galaxy A53 5G", current_highest_price: 6490000, images: ["https://cdn.tgdd.vn/Products/Images/42/251866/samsung-galaxy-a53-5g-xanh-thumb-600x600.jpg"], category_slug: "dien-thoai" },
  { _id: "ss25", product_name: "Samsung Galaxy A33 5G", current_highest_price: 5490000, images: ["https://cdn.tgdd.vn/Products/Images/42/251865/samsung-galaxy-a33-5g-xanh-thumb-600x600.jpg"], category_slug: "dien-thoai" },
  { _id: "ss26", product_name: "Samsung Galaxy M14 5G", current_highest_price: 4490000, images: ["https://cdn.tgdd.vn/Products/Images/42/303530/samsung-galaxy-m14-5g-xanh-thumb-600x600.jpg"], category_slug: "dien-thoai" },
  { _id: "ss27", product_name: "Samsung Galaxy S21 Plus", current_highest_price: 9500000, images: ["https://cdn.tgdd.vn/Products/Images/42/226316/samsung-galaxy-s21-plus-bac-600x600.jpg"], category_slug: "dien-thoai" },
  { _id: "ss28", product_name: "Samsung Galaxy Note 10 Plus", current_highest_price: 6500000, images: ["https://cdn.tgdd.vn/Products/Images/42/206176/samsung-galaxy-note-10-plus-xanh-600x600.jpg"], category_slug: "dien-thoai" },
  { _id: "ss29", product_name: "Samsung Galaxy Z Fold4", current_highest_price: 28000000, images: ["https://cdn.tgdd.vn/Products/Images/42/250625/samsung-galaxy-z-fold4-kem-256gb-600x600.jpg"], category_slug: "dien-thoai" },
  { _id: "ss30", product_name: "Samsung Galaxy Z Flip4", current_highest_price: 13000000, images: ["https://cdn.tgdd.vn/Products/Images/42/262648/samsung-galaxy-z-flip4-5g-128gb-thumb-tim-600x600.jpg"], category_slug: "dien-thoai" },
  { _id: "ss31", product_name: "Samsung Galaxy A52s 5G", current_highest_price: 5990000, images: ["https://cdn.tgdd.vn/Products/Images/42/247507/samsung-galaxy-a52s-5g-mint-600x600.jpg"], category_slug: "dien-thoai" },
  { _id: "ss32", product_name: "Samsung Galaxy A13", current_highest_price: 3190000, images: ["https://cdn.tgdd.vn/Products/Images/42/249944/samsung-galaxy-a13-cam-thumb-600x600.jpg"], category_slug: "dien-thoai" },
  { _id: "ss33", product_name: "Samsung Galaxy M23 5G", current_highest_price: 4690000, images: ["https://cdn.tgdd.vn/Products/Images/42/262796/samsung-galaxy-m23-5g-xanh-thumb-600x600.jpg"], category_slug: "dien-thoai" },
  { _id: "ss34", product_name: "Samsung Galaxy S20 FE", current_highest_price: 7490000, images: ["https://cdn.tgdd.vn/Products/Images/42/224859/samsung-galaxy-s20-fe-xanh-la-thumb-600x600.jpg"], category_slug: "dien-thoai" },
  { _id: "ss35", product_name: "Samsung Galaxy A23", current_highest_price: 4290000, images: ["https://cdn.tgdd.vn/Products/Images/42/262650/samsung-galaxy-a23-cam-thumb-600x600.jpg"], category_slug: "dien-thoai" },
  { _id: "ss36", product_name: "Samsung Galaxy A34 5G", current_highest_price: 7190000, images: ["https://cdn.tgdd.vn/Products/Images/42/296727/samsung-galaxy-a34-5g-bac-thumb-600x600.jpg"], category_slug: "dien-thoai" },
  { _id: "ss37", product_name: "Samsung Galaxy A54 5G", current_highest_price: 9490000, images: ["https://cdn.tgdd.vn/Products/Images/42/267984/samsung-galaxy-a54-5g-tim-thumb-600x600.jpg"], category_slug: "dien-thoai" },
  { _id: "ss38", product_name: "Samsung Galaxy A04", current_highest_price: 2490000, images: ["https://cdn.tgdd.vn/Products/Images/42/283623/samsung-galaxy-a04-den-thumb-600x600.jpg"], category_slug: "dien-thoai" },
  { _id: "ss39", product_name: "Samsung Galaxy A04s", current_highest_price: 2990000, images: ["https://cdn.tgdd.vn/Products/Images/42/283819/samsung-galaxy-a04s-xanh-thumb-600x600.jpg"], category_slug: "dien-thoai" },
  { _id: "ss40", product_name: "Samsung Galaxy A03", current_highest_price: 2190000, images: ["https://cdn.tgdd.vn/Products/Images/42/251856/samsung-galaxy-a03-xanh-thumb-600x600.jpg"], category_slug: "dien-thoai" },


  // =================================================================
  // --- ĐIỆN THOẠI (slug: dien-thoai) - IPHONE (40 Sản phẩm) ---
  // =================================================================
  { _id: "ip01", product_name: "iPhone 15 Pro Max 1TB", current_highest_price: 44990000, images: ["https://cdn.tgdd.vn/Products/Images/42/305658/iphone-15-pro-max-blue-thumbnew-600x600.jpg"], category_slug: "dien-thoai" },
  { _id: "ip02", product_name: "iPhone 15 Pro 512GB", current_highest_price: 38990000, images: ["https://cdn.tgdd.vn/Products/Images/42/303401/iphone-15-pro-blue-thumbnew-600x600.jpg"], category_slug: "dien-thoai" },
  { _id: "ip03", product_name: "iPhone 15 Plus 256GB", current_highest_price: 28990000, images: ["https://cdn.tgdd.vn/Products/Images/42/303891/iphone-15-plus-pink-thumbnew-600x600.jpg"], category_slug: "dien-thoai" },
  { _id: "ip04", product_name: "iPhone 15 128GB", current_highest_price: 22990000, images: ["https://cdn.tgdd.vn/Products/Images/42/281570/iphone-15-black-thumbnew-600x600.jpg"], category_slug: "dien-thoai" },
  { _id: "ip05", product_name: "iPhone 14 Pro Max 1TB", current_highest_price: 36990000, images: ["https://cdn.tgdd.vn/Products/Images/42/251192/iphone-14-pro-max-tim-thumb-600x600.jpg"], category_slug: "dien-thoai" },
  { _id: "ip06", product_name: "iPhone 14 Pro Max 256GB", current_highest_price: 29990000, images: ["https://cdn.tgdd.vn/Products/Images/42/251192/iphone-14-pro-max-tim-thumb-600x600.jpg"], category_slug: "dien-thoai" },
  { _id: "ip07", product_name: "iPhone 14 Pro 128GB", current_highest_price: 26990000, images: ["https://cdn.tgdd.vn/Products/Images/42/247508/iphone-14-pro-tim-thumb-600x600.jpg"], category_slug: "dien-thoai" },
  { _id: "ip08", product_name: "iPhone 14 Plus 128GB", current_highest_price: 21990000, images: ["https://cdn.tgdd.vn/Products/Images/42/245545/iphone-14-plus-gold-thumbnew-600x600.jpg"], category_slug: "dien-thoai" },
  { _id: "ip09", product_name: "iPhone 14 128GB", current_highest_price: 18990000, images: ["https://cdn.tgdd.vn/Products/Images/42/240259/iphone-14-xanh-thumb-600x600.jpg"], category_slug: "dien-thoai" },
  { _id: "ip10", product_name: "iPhone 13 Pro Max (Cũ)", current_highest_price: 17500000, images: ["https://cdn.tgdd.vn/Products/Images/42/230529/iphone-13-pro-max-xanh-la-thumb-600x600.jpg"], category_slug: "dien-thoai" },
  { _id: "ip11", product_name: "iPhone 13 128GB", current_highest_price: 13990000, images: ["https://cdn.tgdd.vn/Products/Images/42/223602/iphone-13-pink-thumb-600x600.jpg"], category_slug: "dien-thoai" },
  { _id: "ip12", product_name: "iPhone 12 Pro Max (Cũ)", current_highest_price: 14500000, images: ["https://cdn.tgdd.vn/Products/Images/42/213033/iphone-12-pro-max-xanh-duong-thumb-600x600.jpg"], category_slug: "dien-thoai" },
  { _id: "ip13", product_name: "iPhone 12 64GB", current_highest_price: 11490000, images: ["https://cdn.tgdd.vn/Products/Images/42/213031/iphone-12-tim-thumb-600x600.jpg"], category_slug: "dien-thoai" },
  { _id: "ip14", product_name: "iPhone 11 64GB", current_highest_price: 8990000, images: ["https://cdn.tgdd.vn/Products/Images/42/153856/iphone-11-trang-thumb-600x600.jpg"], category_slug: "dien-thoai" },
  { _id: "ip15", product_name: "iPhone 11 128GB", current_highest_price: 10490000, images: ["https://cdn.tgdd.vn/Products/Images/42/210644/iphone-11-128gb-xanh-la-thumb-600x600.jpg"], category_slug: "dien-thoai" },
  { _id: "ip16", product_name: "iPhone SE 2022", current_highest_price: 10990000, images: ["https://cdn.tgdd.vn/Products/Images/42/274018/iphone-se-2022-do-thumb-600x600.jpg"], category_slug: "dien-thoai" },
  { _id: "ip17", product_name: "iPhone XS Max (Cũ)", current_highest_price: 7500000, images: ["https://cdn.tgdd.vn/Products/Images/42/190321/iphone-xs-max-gold-600x600.jpg"], category_slug: "dien-thoai" },
  { _id: "ip18", product_name: "iPhone XR (Cũ)", current_highest_price: 5500000, images: ["https://cdn.tgdd.vn/Products/Images/42/190325/iphone-xr-trang-thumb-600x600.jpg"], category_slug: "dien-thoai" },
  { _id: "ip19", product_name: "iPhone 8 Plus (Cũ)", current_highest_price: 3500000, images: ["https://cdn.tgdd.vn/Products/Images/42/114110/iphone-8-plus-hh-600x600.jpg"], category_slug: "dien-thoai" },
  { _id: "ip20", product_name: "iPhone 7 Plus (Cũ)", current_highest_price: 2500000, images: ["https://cdn.tgdd.vn/Products/Images/42/78124/iphone-7-plus-32gb-gold-600x600.jpg"], category_slug: "dien-thoai" },
  { _id: "ip21", product_name: "iPhone 12 Mini", current_highest_price: 9500000, images: ["https://cdn.tgdd.vn/Products/Images/42/225380/iphone-12-mini-xanh-duong-600x600.jpg"], category_slug: "dien-thoai" },
  { _id: "ip22", product_name: "iPhone 13 Mini", current_highest_price: 13500000, images: ["https://cdn.tgdd.vn/Products/Images/42/250257/iphone-13-mini-pink-600x600.jpg"], category_slug: "dien-thoai" },
  { _id: "ip23", product_name: "iPhone 6s Plus (Cũ)", current_highest_price: 1500000, images: ["https://cdn.tgdd.vn/Products/Images/42/71306/iphone-6s-plus-32gb-600x600-300x300.jpg"], category_slug: "dien-thoai" },
  { _id: "ip24", product_name: "iPhone 14 Plus 256GB", current_highest_price: 24990000, images: ["https://cdn.tgdd.vn/Products/Images/42/245545/iphone-14-plus-gold-thumbnew-600x600.jpg"], category_slug: "dien-thoai" },
  { _id: "ip25", product_name: "iPhone 15 256GB", current_highest_price: 25990000, images: ["https://cdn.tgdd.vn/Products/Images/42/281570/iphone-15-black-thumbnew-600x600.jpg"], category_slug: "dien-thoai" },
  { _id: "ip26", product_name: "iPhone 11 Pro Max (Cũ)", current_highest_price: 9900000, images: ["https://cdn.tgdd.vn/Products/Images/42/200533/iphone-11-pro-max-black-600x600.jpg"], category_slug: "dien-thoai" },
  { _id: "ip27", product_name: "iPhone 11 Pro (Cũ)", current_highest_price: 8500000, images: ["https://cdn.tgdd.vn/Products/Images/42/188705/iphone-11-pro-black-600x600.jpg"], category_slug: "dien-thoai" },
  { _id: "ip28", product_name: "iPhone X (Cũ)", current_highest_price: 4900000, images: ["https://cdn.tgdd.vn/Products/Images/42/114115/iphone-x-64gb-600x600.jpg"], category_slug: "dien-thoai" },
  { _id: "ip29", product_name: "iPhone 8 (Cũ)", current_highest_price: 2900000, images: ["https://cdn.tgdd.vn/Products/Images/42/114113/iphone-8-64gb-hh-600x600.jpg"], category_slug: "dien-thoai" },
  { _id: "ip30", product_name: "iPhone 15 Pro Max 512GB", current_highest_price: 40990000, images: ["https://cdn.tgdd.vn/Products/Images/42/305658/iphone-15-pro-max-blue-thumbnew-600x600.jpg"], category_slug: "dien-thoai" },
  { _id: "ip31", product_name: "iPhone 13 Pro (Cũ)", current_highest_price: 14500000, images: ["https://cdn.tgdd.vn/Products/Images/42/230521/iphone-13-pro-blue-600x600.jpg"], category_slug: "dien-thoai" },
  { _id: "ip32", product_name: "iPhone 12 Pro (Cũ)", current_highest_price: 11500000, images: ["https://cdn.tgdd.vn/Products/Images/42/213032/iphone-12-pro-vang-600x600.jpg"], category_slug: "dien-thoai" },
  { _id: "ip33", product_name: "iPhone XS (Cũ)", current_highest_price: 6500000, images: ["https://cdn.tgdd.vn/Products/Images/42/190322/iphone-xs-gold-600x600.jpg"], category_slug: "dien-thoai" },
  { _id: "ip34", product_name: "iPhone 7 32GB (Cũ)", current_highest_price: 1900000, images: ["https://cdn.tgdd.vn/Products/Images/42/74110/iphone-7-gold-600x600.jpg"], category_slug: "dien-thoai" },
  { _id: "ip35", product_name: "iPhone 6 Plus (Cũ)", current_highest_price: 1200000, images: ["https://cdn.tgdd.vn/Products/Images/42/69783/iphone-6-plus-16gb-gold-600x600.jpg"], category_slug: "dien-thoai" },
  { _id: "ip36", product_name: "iPhone 5s (Cũ)", current_highest_price: 800000, images: ["https://cdn.tgdd.vn/Products/Images/42/59800/iphone-5s-gold-600x600.jpg"], category_slug: "dien-thoai" },
  { _id: "ip37", product_name: "iPhone SE 2020", current_highest_price: 4500000, images: ["https://cdn.tgdd.vn/Products/Images/42/222629/iphone-se-2020-do-600x600.jpg"], category_slug: "dien-thoai" },
  { _id: "ip38", product_name: "iPhone 14 Plus 512GB", current_highest_price: 27990000, images: ["https://cdn.tgdd.vn/Products/Images/42/245545/iphone-14-plus-gold-thumbnew-600x600.jpg"], category_slug: "dien-thoai" },
  { _id: "ip39", product_name: "iPhone 13 256GB", current_highest_price: 16990000, images: ["https://cdn.tgdd.vn/Products/Images/42/223602/iphone-13-pink-thumb-600x600.jpg"], category_slug: "dien-thoai" },
  { _id: "ip40", product_name: "iPhone 15 Plus 128GB", current_highest_price: 25990000, images: ["https://cdn.tgdd.vn/Products/Images/42/303891/iphone-15-plus-pink-thumbnew-600x600.jpg"], category_slug: "dien-thoai" },


  // =================================================================
  // --- ĐIỆN THOẠI KHÁC (Xiaomi, OPPO, Vivo, Realme) - ~20 Sản phẩm ---
  // =================================================================
  { _id: "xm01", product_name: "Xiaomi 14 Ultra 5G", current_highest_price: 29990000, images: ["https://cdn.tgdd.vn/Products/Images/42/309832/xiaomi-14-ultra-black-thumb-600x600.jpg"], category_slug: "dien-thoai" },
  { _id: "xm02", product_name: "Xiaomi 13T Pro 5G", current_highest_price: 14990000, images: ["https://cdn.tgdd.vn/Products/Images/42/309822/xiaomi-13t-pro-xanh-duong-thumb-600x600.jpg"], category_slug: "dien-thoai" },
  { _id: "xm03", product_name: "Xiaomi Redmi Note 13 Pro", current_highest_price: 7290000, images: ["https://cdn.tgdd.vn/Products/Images/42/309835/xiaomi-redmi-note-13-pro-black-thumb-600x600.jpg"], category_slug: "dien-thoai" },
  { _id: "xm04", product_name: "Xiaomi Redmi 13C", current_highest_price: 3090000, images: ["https://cdn.tgdd.vn/Products/Images/42/316934/xiaomi-redmi-13c-black-thumb-600x600.jpg"], category_slug: "dien-thoai" },
  { _id: "xm05", product_name: "Xiaomi Redmi Note 12", current_highest_price: 4290000, images: ["https://cdn.tgdd.vn/Products/Images/42/299653/xiaomi-redmi-note-12-xanh-duong-thumb-600x600.jpg"], category_slug: "dien-thoai" },
  { _id: "xm06", product_name: "Xiaomi 12T Pro", current_highest_price: 11990000, images: ["https://cdn.tgdd.vn/Products/Images/42/291672/xiaomi-12t-pro-blue-600x600.jpg"], category_slug: "dien-thoai" },
  
  { _id: "op01", product_name: "OPPO Find N3 Flip", current_highest_price: 22990000, images: ["https://cdn.tgdd.vn/Products/Images/42/306995/oppo-find-n3-flip-pink-thumb-600x600.jpg"], category_slug: "dien-thoai" },
  { _id: "op02", product_name: "OPPO Reno11 F 5G", current_highest_price: 8990000, images: ["https://cdn.tgdd.vn/Products/Images/42/321526/oppo-reno11-f-tim-thumb-600x600.jpg"], category_slug: "dien-thoai" },
  { _id: "op03", product_name: "OPPO A78", current_highest_price: 5990000, images: ["https://cdn.tgdd.vn/Products/Images/42/309819/oppo-a78-xanh-thumb-600x600.jpg"], category_slug: "dien-thoai" },
  { _id: "op04", product_name: "OPPO A58", current_highest_price: 4990000, images: ["https://cdn.tgdd.vn/Products/Images/42/309818/oppo-a58-xanh-thumb-600x600.jpg"], category_slug: "dien-thoai" },
  { _id: "op05", product_name: "OPPO Reno10 5G", current_highest_price: 9990000, images: ["https://cdn.tgdd.vn/Products/Images/42/309814/oppo-reno10-xanh-thumb-600x600.jpg"], category_slug: "dien-thoai" },
  
  { _id: "vv01", product_name: "Vivo V29e 5G", current_highest_price: 8490000, images: ["https://cdn.tgdd.vn/Products/Images/42/313437/vivo-v29e-xanh-thumb-600x600.jpg"], category_slug: "dien-thoai" },
  { _id: "vv02", product_name: "Vivo Y36", current_highest_price: 5290000, images: ["https://cdn.tgdd.vn/Products/Images/42/306767/vivo-y36-xanh-thumb-600x600.jpg"], category_slug: "dien-thoai" },
  { _id: "vv03", product_name: "Vivo Y17s", current_highest_price: 3990000, images: ["https://cdn.tgdd.vn/Products/Images/42/316061/vivo-y17s-tim-thumb-600x600.jpg"], category_slug: "dien-thoai" },
  
  { _id: "rm01", product_name: "Realme C67", current_highest_price: 5290000, images: ["https://cdn.tgdd.vn/Products/Images/42/306772/realme-c67-xanh-thumb-600x600.jpg"], category_slug: "dien-thoai" },
  { _id: "rm02", product_name: "Realme 11 Pro", current_highest_price: 11990000, images: ["https://cdn.tgdd.vn/Products/Images/42/306990/realme-11-pro-be-thumb-600x600.jpg"], category_slug: "dien-thoai" },
  
  { _id: "hn01", product_name: "Honor X8b", current_highest_price: 5490000, images: ["https://cdn.tgdd.vn/Products/Images/42/320875/honor-x8b-bac-thumb-600x600.jpg"], category_slug: "dien-thoai" },
  { _id: "hn02", product_name: "Honor 90 5G", current_highest_price: 10990000, images: ["https://cdn.tgdd.vn/Products/Images/42/309825/honor-90-xanh-duong-thumb-600x600.jpg"], category_slug: "dien-thoai" },
  { _id: "hn03", product_name: "Honor X6a", current_highest_price: 3290000, images: ["https://cdn.tgdd.vn/Products/Images/42/313442/honor-x6a-bac-thumb-600x600.jpg"], category_slug: "dien-thoai" },
  
  // =================================================================
  // --- CÁC DANH MỤC KHÁC (Để không bị trống) ---
  // =================================================================
  { _id: "gd1", product_name: "Nike Air Jordan 1 Low", current_highest_price: 5000000, images: ["https://static.nike.com/a/images/t_PDP_1280_v1/f_auto,q_auto:eco/99486859-0ff3-46b4-949b-2d16af2ad421/custom-nike-dunk-low-by-you-shoes.png"], category_slug: "giay-dep" },
  { _id: "gd2", product_name: "Adidas UltraBoost 22", current_highest_price: 4500000, images: ["https://assets.adidas.com/images/h_840,f_auto,q_auto,fl_lossy,c_fill,g_auto/fbaf991a78bc4896a3e9ad7800abcec6_9366/Ultraboost_22_Shoes_Black_GZ0127_01_standard.jpg"], category_slug: "giay-dep" },
  { _id: "gd3", product_name: "Biti's Hunter X", current_highest_price: 1200000, images: ["https://product.hstatic.net/1000230642/product/dsmh10500den__1__52d192080373467699313550993081b7_master.jpg"], category_slug: "giay-dep" },
  { _id: "nt1", product_name: "Sofa Da Cao Cấp", current_highest_price: 12000000, images: ["https://bizweb.dktcdn.net/100/438/769/products/sofa-bang-ni-mem-mai-sf03-3-1678768079632.jpg"], category_slug: "noi-that" },
  { _id: "nt2", product_name: "Bàn Ăn Gỗ Sồi", current_highest_price: 8500000, images: ["https://noithatminhkhoi.com/upload/sanpham/bo-ban-an-go-soi-4-ghe-hien-dai-dep-mat.jpg"], category_slug: "noi-that" },
  { _id: "tt1", product_name: "Áo Thun Basic", current_highest_price: 200000, images: ["https://product.hstatic.net/200000310271/product/ao_thun_nam_basic_mau_trang_routine_10s22tsh003_dbf9270830464670942363073797b5e4_master.jpg"], category_slug: "thoi-trang" },
  { _id: "tt2", product_name: "Quần Jean Slimfit", current_highest_price: 500000, images: ["https://aristino.com/Data/ResizeImage/images/product/quan-jeans/AJN02008/quan-jeans-nam-aristino-AJN02008-05x900x900x4.jpg"], category_slug: "thoi-trang" }
];