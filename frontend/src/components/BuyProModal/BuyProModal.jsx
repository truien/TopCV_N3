import { useEffect, useState } from 'react';
import { getAllProPackages } from '@/api/packagesApi';
import { createProVNPayOrder } from '@/api/paymentApi';
import styles from './BuyProModal.module.css';

export default function BuyProModal({ show, onClose }) {
    const [packages, setPackages] = useState([]);
    const [selectedPackage, setSelectedPackage] = useState(null);

    useEffect(() => {
        if (show) { // 👉 Chỉ load gói khi show
            getAllProPackages().then(setPackages);
        }
    }, [show]);
    if (!show) return null;

    const handleBuy = async () => {
        if (!selectedPackage) {
            alert('Vui lòng chọn gói Pro');
            return;
        }
        try {
            const { paymentUrl } = await createProVNPayOrder(selectedPackage);
            window.location.href = paymentUrl;
            onClose();
        } catch (err) {
            alert(err?.response?.data?.message || 'Lỗi tạo đơn VNPay');
        }
    };

    return (
        <div className={styles.overlay}>
            <div className={styles.modalBox}>
                <h2 className={styles.title}>Mua gói hiển thị</h2>

                <div className={styles.formGroup}>
                    <label>Gói dịch vụ:</label>
                    <div className={styles.packageGrid}>
                        {packages
                            .filter(pkg => pkg.price > 0)
                            .map((pkg) => (
                                <label key={pkg.id} className={`${styles.packageCard} ${selectedPackage === pkg.id ? styles.active : ''}`}>
                                    <input
                                        type="radio"
                                        name="package"
                                        value={pkg.id}
                                        checked={selectedPackage === pkg.id}
                                        onChange={() => setSelectedPackage(pkg.id)}
                                    />
                                    <div>
                                        <h4>{pkg.name}</h4>
                                        <p>{pkg.description}</p>
                                        <strong>{pkg.price.toLocaleString()}₫</strong>
                                    </div>
                                </label>
                            ))}
                    </div>
                </div>

                <div className={styles.actions}>
                    <button className={styles.cancelButton} onClick={onClose}>Hủy</button>
                    <button className={styles.primaryButton} onClick={handleBuy}>Thanh toán</button>
                </div>
            </div>
        </div>
    );
}
