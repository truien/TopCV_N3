
import { useEffect, useState } from "react";
import { MdDelete, MdOutlineClose } from "react-icons/md";
import { toast } from "react-toastify";
import styles from "./AccountManager.module.css";
import { getAllUsers, deleteUser } from '@/api/authApi';

function AccountManager() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [loadingDelete, setLoadingDelete] = useState(false);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        setLoading(true);
        getAllUsers(page)
            .then((res) => {
                setUsers(res.users);
                setTotalPages(res.totalPages);
                setLoading(false);
            })
            .catch((err) => {
                setError(err.message || "Lỗi kết nối đến server.");
                setLoading(false);
            });
    }, [page]);

    const handleDelete = async () => {
        if (!selectedUser) return;
        setLoadingDelete(true);
        try {
            await deleteUser(selectedUser.id);
            setUsers(users.filter((u) => u.id !== selectedUser.id));
            toast.success("Xóa thành công!");
            setShowModal(false);
        } catch (err) {
            toast.error(err.message || "Lỗi khi xóa người dùng.");
        } finally {
            setLoadingDelete(false);
        }
    };

    if (loading) return <div className={styles.loader}>Đang tải...</div>;
    if (error) return <p>{error}</p>;

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>✨ Quản lý người dùng ✨</h1>

            <div className={styles.card}>
                <table className={`table ${styles.table}`}>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Avatar</th>
                            <th>UserName</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.length > 0 ? (
                            users.map((user) => (
                                <tr key={user.id} className={styles.rowHover}>
                                    <td>{user.id}</td>
                                    <td>
                                        <img
                                            src={user.avatar || "/src/assets/images/avatar-default.jpg"}
                                            alt="avatar"
                                            className={styles.avatar}
                                        />
                                    </td>
                                    <td>{user.username}</td>
                                    <td>{user.email}</td>
                                    <td><span className={styles.badge}>{user.role}</span></td>
                                    <td>
                                        <button className={styles.btnDanger} onClick={() => {
                                            setSelectedUser(user);
                                            setShowModal(true);
                                        }}>
                                            <MdDelete /> Xóa
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan="6" className={styles.noData}>Không có dữ liệu người dùng.</td></tr>
                        )}
                    </tbody>
                </table>

                <div className={styles.pagination}>
                    <button disabled={page === 1} onClick={() => setPage(page - 1)} className={styles.btnOutline}>← Trang trước</button>
                    <span className={styles.pageIndicator}>Trang {page} / {totalPages}</span>
                    <button disabled={page === totalPages} onClick={() => setPage(page + 1)} className={styles.btnOutline}>Trang sau →</button>
                </div>
            </div>

            {showModal && (
                <div className="modal-backdrop fade show">
                    <div className={`modal d-block ${styles.modal}`}>
                        <div className={`modal-dialog ${styles.modalDialog}`}>
                            <div className={`modal-content ${styles.modalContent}`}>
                                <div className={styles.modalHeader}>
                                    <h5>Xác nhận xóa</h5>
                                    <button className={styles.btnClose} onClick={() => setShowModal(false)}>
                                        <MdOutlineClose />
                                    </button>
                                </div>
                                <div className="modal-body">
                                    Bạn có chắc chắn muốn xóa <strong>{selectedUser?.username}</strong> không?
                                </div>
                                <div className={styles.modalFooter}>
                                    <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Hủy</button>
                                    <button className={styles.btnDanger} onClick={handleDelete} disabled={loadingDelete}>
                                        {loadingDelete ? "Đang xóa..." : "Xác nhận xóa"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AccountManager;
