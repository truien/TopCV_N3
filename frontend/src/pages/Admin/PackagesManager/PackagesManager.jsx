import { useEffect, useState } from "react";
import styles from "./PackagesManager.module.css";
import { FaEdit, FaTrash } from "react-icons/fa";
import {
    getAllPackages,
    getPackageStatistics,
    deletePackage,
} from "@/api/packagesApi";
import { toast } from "react-toastify";

function PackagesManager() {
    const [packages, setPackages] = useState([]);
    const [statistics, setStatistics] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPackages();
        fetchStatistics();
    }, []);

    const fetchPackages = async () => {
        setLoading(true);
        try {
            const data = await getAllPackages();
            setPackages(data);
        } catch {
            toast.error("Không thể tải danh sách gói.");
        } finally {
            setLoading(false);
        }
    };

    const fetchStatistics = async () => {
        try {
            const data = await getPackageStatistics();
            setStatistics(data);
        } catch {
            toast.error("Không thể tải thống kê.");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Bạn có chắc muốn xóa gói này?")) return;
        try {
            await deletePackage(id);
            toast.success("Đã xóa gói!");
            fetchPackages();
        } catch {
            toast.error("Lỗi khi xóa.");
        }
    };

    return (
        <div className={styles.wrapper}>
            <div className={styles.sidebar}>
                <h2 style={{ color: "#00b14f", fontWeight: 700 }}>📊 Thống kê</h2>
                {statistics ? (
                    <div className={styles.statGrid}>
                        <div className={styles.statBox}>
                            <h4>{statistics.totalSold}</h4>
                            <span>Tổng gói đã bán</span>
                        </div>
                        <div className={styles.statBox}>
                            <h4>{statistics.activeSubscriptions}</h4>
                            <span>Gói còn hiệu lực</span>
                        </div>
                    </div>
                ) : (
                    <p>Đang tải...</p>
                )}
            </div>

            <div className={styles.mainPanel}>
                <div className={styles.card}>
                    <div className={styles.cardTitle}>📦 Danh sách Gói Bài Viết</div>
                    {loading ? (
                        <p>Đang tải dữ liệu...</p>
                    ) : (
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Tên Gói</th>
                                    <th>Mô Tả</th>
                                    <th>Giá (VND)</th>
                                    <th>Thời gian</th>
                                    <th>Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {packages.map((pkg) => (
                                    <tr key={pkg.id}>
                                        <td>{pkg.id}</td>
                                        <td>{pkg.name}</td>
                                        <td>{pkg.description}</td>
                                        <td>{pkg.price.toLocaleString()}</td>
                                        <td>{pkg.durationDays} ngày</td>
                                        <td>
                                            <div className={styles.actionBtns}>
                                                <button className={styles.btn}><FaEdit /></button>
                                                <button className={styles.btn} onClick={() => handleDelete(pkg.id)}><FaTrash /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}

export default PackagesManager;
