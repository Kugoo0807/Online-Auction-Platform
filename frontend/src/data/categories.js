// 1. DỮ LIỆU DANH MỤC (Copy chuẩn 100% từ API Documentation)
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

// 2. DỮ LIỆU SẢN PHẨM MẪU (Đã map đúng category_slug theo danh mục ở trên)
export const MOCK_PRODUCTS = [
  // --- LAPTOP (slug: laptop) ---
  { 
    _id: "p1", 
    product_name: "MacBook Pro M1 2020", 
    current_highest_price: 30000000, 
    images: ["https://cdn.tgdd.vn/Products/Images/44/231244/macbook-air-m1-2020-gray-600x600.jpg"], 
    category_slug: "laptop" 
  },
  { 
    _id: "p2", 
    product_name: "Dell XPS 13 Plus", 
    current_highest_price: 25000000, 
    images: ["https://laptopvang.com/wp-content/uploads/2023/04/Dell-XPS-9320-Platinum-01.jpg"], 
    category_slug: "laptop" 
  },

  // --- ĐIỆN THOẠI (slug: dien-thoai) ---
  { 
    _id: "p3", 
    product_name: "iPhone 14 Pro Max", 
    current_highest_price: 28000000, 
    images: ["https://cdn.tgdd.vn/Products/Images/42/251192/iphone-14-pro-max-tim-thumb-600x600.jpg"], 
    category_slug: "dien-thoai" 
  },
  { 
    _id: "p4", 
    product_name: "Samsung S24 Ultra", 
    current_highest_price: 24000000, 
    images: ["https://cdn.tgdd.vn/Products/Images/42/307174/samsung-galaxy-s24-ultra-grey-thumb-600x600.jpg"], 
    category_slug: "dien-thoai" 
  },

  // --- GIÀY DÉP (slug: giay-dep) ---
  { 
    _id: "p5", 
    product_name: "Nike Air Jordan 1 Low", 
    current_highest_price: 5000000, 
    images: ["https://static.nike.com/a/images/t_PDP_1280_v1/f_auto,q_auto:eco/99486859-0ff3-46b4-949b-2d16af2ad421/custom-nike-dunk-low-by-you-shoes.png"], 
    category_slug: "giay-dep" 
  },

  // --- NỘI THẤT (slug: noi-that) ---
  { 
    _id: "p6", 
    product_name: "Sofa Da Cao Cấp", 
    current_highest_price: 12000000, 
    images: ["https://bizweb.dktcdn.net/100/438/769/products/sofa-bang-ni-mem-mai-sf03-3-1678768079632.jpg"], 
    category_slug: "noi-that" 
  },

  // --- THỜI TRANG (slug: thoi-trang) ---
  { 
    _id: "p7", 
    product_name: "Áo Thun Basic", 
    current_highest_price: 200000, 
    images: ["https://product.hstatic.net/200000310271/product/ao_thun_nam_basic_mau_trang_routine_10s22tsh003_dbf9270830464670942363073797b5e4_master.jpg"], 
    category_slug: "thoi-trang" 
  }
];