import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { user } = useAuth();
  const location = useLocation();

  // kiểm tra nếu người dùng chưa đăng nhập
  if (!user) {
    // chuyển hướng đến trang đăng nhập
    // state: lưu đường dẫn hiện tại để quay lại sau khi đăng nhập thành công
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return children ? children : <Outlet />;
}
