import axios from "axios";
import { useEffect, useState } from "react";
import { MdDelete, MdOutlineClose } from "react-icons/md";
import { toast } from "react-toastify";

function AccountMangnager() {
    const token = localStorage.getItem("token");
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    // eslint-disable-next-line no-unused-vars
    const [loadingDelete, setLoadingDelete] = useState(false);

    useEffect(() => {
        axios.get(`${import.meta.env.VITE_API_URL}/api/auth/users`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
            .then((res) => {
                setUsers(res.data);
                setLoading(false);
            })
            .catch((err) => {
                if (err.response) {
                    if (err.response.status === 403) {
                        setLoading(false);
                        setError("Bạn không có quyền truy cập trang này.");
                    } else {
                        setError("Có lỗi xảy ra khi tải dữ liệu.");
                    }
                } else {
                    setLoading(false);
                    setError("Lỗi kết nối đến server.");
                }
            });
    }, [token]);

    const handleDelete = () => {
        if (!selectedUser) return;

        setLoadingDelete(true);
        axios.delete(`${import.meta.env.VITE_API_URL}/api/auth/delete/${selectedUser.id}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
            .then((res) => {
                if (res.status === 204) {
                    setUsers(users.filter((user) => user.id !== selectedUser.id));
                    setShowModal(false);
                    toast.success("Xóa thành công");
                }
            })
            .catch((err) => {
                if (err.response) {
                    if (err.response.status === 401) {
                        toast.error("Bạn không có quyền thực hiện thao tác này.");
                    } else if (err.response.status === 404) {
                        toast.warning("Người dùng không tồn tại!");
                    } else {
                        toast.error("Có lỗi xảy ra khi xóa dữ liệu.");
                    }
                } else {
                    toast.error("Lỗi kết nối đến server.");
                }
            })
            .finally(() => {
                setLoadingDelete(false);
            });
    };


    const confirmDelete = (user) => {
        setSelectedUser(user);
        setShowModal(true);
    };

    if (loading) return <p>Loading...</p>;
    if (error) return <p>{error}</p>;

    return (
        <>
            <h1>Account Manager</h1>
            <table className="table">
                <thead>
                    <tr>
                        <th scope="col">ID</th>
                        <th scope="col">UserName</th>
                        <th scope="col">Email</th>
                        <th scope="col">Role</th>
                        <th scope="col">Action</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map((user) => (
                        <tr key={user.id}>
                            <th scope="row">{user.id}</th>
                            <td>{user.userName}</td>
                            <td>{user.email}</td>
                            <td>{user.role}</td>
                            <td>
                                <button
                                    onClick={() => confirmDelete(user)}
                                    className="btn btn-danger">
                                    <MdDelete />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Modal xác nhận xóa */}
            {showModal && (
                <div className="modal fade show d-block" tabIndex="-1" role="dialog">
                    <div className="modal-dialog" role="document">
                        <div className="modal-content">
                            <div className="modal-header d-flex justify-content-between">
                                <h5 className="modal-title">Xác nhận xóa</h5>
                                <div className="close btn btn-danger" onClick={() => setShowModal(false)}>
                                    <MdOutlineClose />
                                </div>
                            </div>
                            <div className="modal-body">
                                Bạn có chắc chắn muốn xóa tài khoản <strong>{selectedUser?.userName}</strong> không?
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                                    Hủy
                                </button>
                                <button type="button" className="btn btn-danger" onClick={handleDelete}>
                                    Xóa
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Overlay để đóng modal khi bấm ra ngoài */}
            {showModal && <div className="modal-backdrop fade show" onClick={() => setShowModal(false)}></div>}
        </>
    );
}

export default AccountMangnager;
