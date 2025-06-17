import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import "./PaymentFailed.css";

const PaymentFailed = () => {
  useEffect(() => {
    document.title = "Thanh toán thất bại | TopCV";
  }, []);

  return (
    <div className="payment-failed-container">
      <div className="payment-failed-card">
        <div className="failed-icon">
          <i className="bi bi-x-circle-fill"></i>
        </div>
        <h1>Thanh toán thất bại</h1>
        <p>Rất tiếc, giao dịch của bạn không thể hoàn tất.</p>

        <div className="failed-details">
          <p>
            Có thể có vấn đề với phương thức thanh toán hoặc đã xảy ra lỗi trong
            quá trình xử lý.
          </p>
          <p>Vui lòng thử lại hoặc chọn một phương thức thanh toán khác.</p>
        </div>

        <div className="failed-actions">
          <Link to="/employer" className="btn btn-primary">
            Thử lại
          </Link>
          <Link to="/" className="btn btn-outline-secondary">
            Quay về trang chủ
          </Link>
          <a href="mailto:support@topcv.vn" className="btn btn-link">
            Liên hệ hỗ trợ
          </a>
        </div>
      </div>
    </div>
  );
};

export default PaymentFailed;
