import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import "./PaymentSuccess.css";

const PaymentSuccess = () => {
  useEffect(() => {
    document.title = "Thanh toán thành công | TopCV";
  }, []);

  return (
    <div className="payment-success-container">
      <div className="payment-success-card">
        <div className="success-icon">
          <i className="bi bi-check-circle-fill"></i>
        </div>
        <h1>Thanh toán thành công!</h1>
        <p>
          Cảm ơn bạn đã thực hiện thanh toán. Đơn hàng của bạn đã được xác nhận.
        </p>

        <div className="success-details">
          <p>Dịch vụ của bạn đã được kích hoạt và sẵn sàng sử dụng.</p>
          <p>
            Bạn có thể kiểm tra chi tiết đơn hàng trong phần quản lý tài khoản.
          </p>
        </div>

        <div className="success-actions">
          <Link to="/employer" className="btn btn-primary">
            Quay lại trang quản lý
          </Link>
          <Link to="/" className="btn btn-outline-primary">
            Quay về trang chủ
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
