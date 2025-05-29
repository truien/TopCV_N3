import { useSearchParams, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import styles from './ConfirmPage.module.css';

export default function ConfirmPage() {
    const [searchParams] = useSearchParams();
    const status = searchParams.get('status');
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        setIsLoaded(true);
    }, []);

    const renderContent = () => {
        switch (status) {
            case 'accepted':
                return (
                    <div className={`${styles.confirmContainer} ${isLoaded ? styles.loaded : ''}`}>
                        <div className={`${styles.confirmCard} ${styles.success}`}>
                            <div className={`${styles.iconContainer} ${styles.success}`}>
                                <svg className={styles.checkIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                    <polyline points="20,6 9,17 4,12"></polyline>
                                </svg>
                            </div>
                            <h1 className={styles.confirmTitle}>Xác nhận thành công!</h1>
                            <p className={styles.confirmMessage}>
                                Bạn đã xác nhận tham gia phỏng vấn. Nhà tuyển dụng sẽ liên hệ với bạn sớm nhất.
                            </p>
                            <div className={styles.confirmInfo}>
                                <p>✓ Thông tin của bạn đã được ghi nhận</p>
                                <p>✓ Email xác nhận đã được gửi</p>
                                <p>✓ Vui lòng kiểm tra email để biết thêm chi tiết</p>
                            </div>
                            <Link to="/" className={`${styles.btn} ${styles.btnPrimary}`}>
                                Quay về trang chủ
                            </Link>
                        </div>
                    </div>
                ); case 'declined':
                return (
                    <div className={`${styles.confirmContainer} ${isLoaded ? styles.loaded : ''}`}>
                        <div className={`${styles.confirmCard} ${styles.declined}`}>
                            <div className={`${styles.iconContainer} ${styles.declined}`}>
                                <svg className={styles.xIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                            </div>
                            <h1 className={styles.confirmTitle}>Đã từ chối phỏng vấn</h1>
                            <p className={styles.confirmMessage}>
                                Bạn đã từ chối lời mời phỏng vấn. Nếu thay đổi quyết định,
                                vui lòng liên hệ trực tiếp với nhà tuyển dụng.
                            </p>
                            <div className={styles.confirmInfo}>
                                <p>• Quyết định của bạn đã được ghi nhận</p>
                                <p>• Nhà tuyển dụng đã được thông báo</p>
                                <p>• Bạn vẫn có thể ứng tuyển các vị trí khác</p>
                            </div>
                            <div className={styles.buttonGroup}>
                                <Link to="/" className={`${styles.btn} ${styles.btnSecondary}`}>
                                    Quay về trang chủ
                                </Link>
                                <Link to="/search-job" className={`${styles.btn} ${styles.btnPrimary}`}>
                                    Tìm việc khác
                                </Link>
                            </div>
                        </div>
                    </div>
                ); default:
                return (
                    <div className={`${styles.confirmContainer} ${isLoaded ? styles.loaded : ''}`}>
                        <div className={`${styles.confirmCard} ${styles.error}`}>
                            <div className={`${styles.iconContainer} ${styles.error}`}>
                                <svg className={styles.warningIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                    <circle cx="12" cy="12" r="10"></circle>
                                    <line x1="12" y1="8" x2="12" y2="12"></line>
                                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                                </svg>
                            </div>
                            <h1 className={styles.confirmTitle}>Liên kết không hợp lệ</h1>
                            <p className={styles.confirmMessage}>
                                Liên kết xác nhận không hợp lệ hoặc đã hết hạn.
                                Vui lòng kiểm tra lại email hoặc liên hệ với nhà tuyển dụng.
                            </p>
                            <div className={styles.confirmInfo}>
                                <p>• Liên kết có thể đã được sử dụng</p>
                                <p>• Liên kết có thể đã hết hạn</p>
                                <p>• Vui lòng kiểm tra email mới nhất</p>
                            </div>
                            <Link to="/" className={`${styles.btn} ${styles.btnPrimary}`}>
                                Quay về trang chủ
                            </Link>
                        </div>
                    </div>
                );
        }
    }; return (
        <div className={styles.confirmPage}>
            {renderContent()}
        </div>
    );
}
