import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function MainLayout() {
  return (
    <div>
      <Header />
      <div className="min-h-[80vh]">
        {/* Outlet là nơi nội dung của các trang con (HomePage, LoginPage) sẽ hiển thị */}
        <Outlet />
      </div>
      <Footer />

      <ToastContainer />
    </div>
  );
}