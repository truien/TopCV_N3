/* eslint-disable no-unused-vars */
import axios from "axios";
import { useEffect, useState } from "react";
import { MdDelete, MdOutlineClose } from "react-icons/md";
import { toast } from "react-toastify";

function AccountManager() {
    const token = sessionStorage.getItem("token");
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [loadingDelete, setLoadingDelete] = useState(false);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        axios.get(`${import.meta.env.VITE_API_URL}/api/auth/users?page=${page}&pageSize=5`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then((res) => {
                setUsers(res.data.users);
                setTotalPages(res.data.totalPages);
                setLoading(false);
            })
            .catch((err) => {
                setError(err.response?.data || "Lỗi kết nối đến server.");
                setLoading(false);
            });
    }, [token, page]);

    const handleDelete = () => {
        if (!selectedUser) return;
        setLoadingDelete(true);
        axios.delete(`${import.meta.env.VITE_API_URL}/api/auth/delete/${selectedUser.id}`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then((res) => {
                if (res.status === 204) {
                    setUsers(users.filter((user) => user.id !== selectedUser.id));
                    setShowModal(false);
                    toast.success("Xóa thành công");
                }
            })
            .catch((err) => toast.error(err.response?.data || "Có lỗi xảy ra khi xóa dữ liệu."))
            .finally(() => setLoadingDelete(false));
    };

    const confirmDelete = (user) => {
        setSelectedUser(user);
        setShowModal(true);
    };

    if (loading) return <p>Loading...</p>;
    if (error) return <p>{error}</p>;

    return (
        <div>
            <h1 className="bg-white" style={{
                fontSize: "1.5rem",
                position: "relative",
                top: "-20px",
                left: "-20px",
                padding: "12px 10px",
                width: "calc(100% + 40px)",
            }} >Account Manager</h1>

            <table className="table">
                <thead className="text-light">
                    <tr>
                        <th>ID</th>
                        <th>Avatar</th>
                        <th>UserName</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {users && Array.isArray(users) && users.length > 0 ? (
                        users.map((user) => (
                            <tr key={user.id}>
                                <th scope="row">{user.id}</th>
                                <td>
                                    <img
                                        src={user.avatar || "/src/assets/images/avatar-default.jpg"}
                                        alt="Avatar"
                                        style={{ width: "40px", height: "40px", borderRadius: "50%" }}
                                    />
                                </td>
                                <td>{user.username}</td>
                                <td>{user.email}</td>
                                <td>{user.role}</td>
                                <td>
                                    <button
                                        onClick={() => confirmDelete(user)}
                                        className="btn btn-danger btn-sm">
                                        <MdDelete />
                                    </button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="6" className="text-center">Không có dữ liệu người dùng.</td>
                        </tr>
                    )}
                </tbody>
            </table>

            {/* Pagination */}
            <div className="d-flex justify-content-between">
                <button disabled={page === 1} onClick={() => setPage(page - 1)} className="btn btn-primary">
                    Trang trước
                </button>
                <span>Trang {page} / {totalPages}</span>
                <button disabled={page === totalPages} onClick={() => setPage(page + 1)} className="btn btn-primary">
                    Trang sau
                </button>
            </div>

            {/* Modal xác nhận xóa */}
            {showModal && (
                <div className="modal fade show d-block" tabIndex="-1" role="dialog">
                    <div className="modal-dialog" role="document">
                        <div className="modal-content">
                            <div className="modal-header bg-dark text-light d-flex justify-content-between">
                                <h5 className="modal-title">Xác nhận xóa</h5>
                                <button className="close btn btn-danger" onClick={() => setShowModal(false)}>
                                    <MdOutlineClose />
                                </button>
                            </div>
                            <div className="modal-body">
                                Bạn có chắc chắn muốn xóa tài khoản <strong>{selectedUser?.username}</strong> không?
                            </div>
                            <div className="modal-footer">
                                <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Hủy</button>
                                <button className="btn btn-danger" onClick={handleDelete}>Xóa</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Overlay */}
            {showModal && <div className="modal-backdrop fade show" onClick={() => setShowModal(false)}></div>}
        </div>
    );
}

export default AccountManager;
