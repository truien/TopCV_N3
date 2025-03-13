import axios from "axios";
import { useEffect, useState } from "react";
import { MdDelete } from "react-icons/md";


function AccountMangnager() {
    const token = localStorage.getItem("token");
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Gọi API để lấy danh sách người dùng
        axios.get(`${import.meta.env.VITE_API_URL}/api/auth/users`)
            .then((res) => {
                setUsers(res.data);
                setLoading(false);
            })
            .catch((err) => {
                setError("Có lỗi xảy ra khi tải dữ liệu.", err);
                setLoading(false);
            });
    }, []);
    const handleDelete = (id) => {
        axios.delete(`${import.meta.env.VITE_API_URL}/api/auth/delete/${id}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
        .then((res) => {
            setUsers(users.filter((user) => user.id !== id));
            console.log(res);
        })
        .catch((err) => {
            setError("Có lỗi xảy ra khi xóa dữ liệu.", err);
        });
    };
    

    if (loading) return <p>Loading...</p>; // Hiển thị khi đang tải dữ liệu
    if (error) return <p>{error}</p>; // Hiển thị khi có lỗi

    return (
        <>
            <h1>Account Mangnager</h1>
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
                                    onClick={() => handleDelete(user.id)}
                                    className="btn btn-danger">
                                    <MdDelete />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </>
    );
}

export default AccountMangnager;
