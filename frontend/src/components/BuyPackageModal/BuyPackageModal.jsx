import { useEffect, useState } from 'react';
import styles from './BuyPackageModal.module.css';
import { toast } from 'react-toastify';
import { getAllPackages } from '@/api/packagesApi';
import { createVNPayOrder } from '@/api/paymentApi';

export default function BuyPackageModal({ jobPostId, onClose }) {
    const [packages, setPackages] = useState([]);
    const [selectedPackage, setSelectedPackage] = useState(null);

    useEffect(() => {
        if (jobPostId) {
            setSelectedPackage(null); // reset khi mở mới
            getAllPackages().then(setPackages);
        }
    }, [jobPostId]);

    const handleBuy = async () => {
        if (!selectedPackage) {
            toast.warning('Vui lòng chọn gói cần mua');
            return;
        }
        try {
            const { paymentUrl } = await createVNPayOrder(selectedPackage, jobPostId);
            window.location.href = paymentUrl; // 
            onClose(); 
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Lỗi tạo đơn VNPay');
        }
    };



    if (!jobPostId) return null;

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
