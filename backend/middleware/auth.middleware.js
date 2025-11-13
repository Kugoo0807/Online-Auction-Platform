// ==== GIẢ LẬP XỬ LÝ TOKEN ====
const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    
    // 401 (Unauthorized) - Không cung cấp token
    if (!authHeader) {
        return res.status(401).json({ message: "Không tìm thấy token. Yêu cầu xác thực." });
    }

    // Giả lập token: 'Bearer valid-token-admin' hoặc 'Bearer valid-token-user'
    const token = authHeader.split(' ')[1];

    if (token === 'valid-token-admin') {
        req.user = {
            id: 1,
            role: 'admin'
        };
        next();
    } else if (token === 'valid-token-user') {
        req.user = {
            id: 2,
            role: 'bidder'
        };
        next();
    } else {
        return res.status(401).json({ message: "Token không hợp lệ." });
    }
};

// ROLE ADMIN
const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        // 403 (Forbidden) - Đã xác thực nhưng không có quyền
        return res.status(403).json({ message: "Từ chối truy cập. Yêu cầu quyền Admin." });
    }
};

module.exports = {
    verifyToken,
    isAdmin
};