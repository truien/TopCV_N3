/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */

import axios from "axios";
import { useEffect, useState } from "react";
import { FaEdit, FaTrash, FaPlus, FaChevronDown, FaChevronUp } from "react-icons/fa";
import { toast } from "react-toastify";
import { Card, Table, Button, Spinner, Badge, Modal, Collapse } from "react-bootstrap";

function PackagesManager() {
    const token = sessionStorage.getItem("token");
    const [packages, setPackages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statistics, setStatistics] = useState(null);
    const [modalShow, setModalShow] = useState(false);
    const [editingPackage, setEditingPackage] = useState(null);
    const [newPackage, setNewPackage] = useState({ name: "", description: "", price: "", durationDays: "" });
    const URL = import.meta.env.VITE_API_URL + "/api/Packages";
    const [postsUsingPackages, setPostsUsingPackages] = useState([]);
    const [companyPostPackages, setCompanyPostPackages] = useState([]);
    const [openPosts, setOpenPosts] = useState(false);
    const [openCompanies, setOpenCompanies] = useState(false);

    const customStyles = {
        primaryButton: {
            backgroundColor: '#00b14f',
            borderColor: '#00b14f',
            color: '#fff',
        },
        header: {
            backgroundColor: '#00b14f',
            color: 'white',
        },
        collapseHeader: {
            backgroundColor: '#f8f9fa',
            cursor: 'pointer',
            borderBottom: '2px solid #00b14f',
        }
    };

    useEffect(() => {
        fetchPackages();
        fetchStatistics();
        fetchPostsUsingPackages();
        fetchCompanyPostPackages();
    }, []);

    const fetchPackages = async () => {
        setLoading(true);
        try {
            const res = await axios.get(import.meta.env.VITE_API_URL + "/api/PackagesPost", {
                headers: { Authorization: `Bearer ${token}` },
            });
            setPackages(res.data);
        } catch (err) {
            toast.error("Lỗi tải dữ liệu.");
        } finally {
            setLoading(false);
        }
    };

    const fetchStatistics = async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/PackagesPost/post-package-statistics`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setStatistics(res.data);
        } catch (err) {
            toast.error("Lỗi tải thống kê.");
        }
    };
    const fetchPostsUsingPackages = async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/PackagesPost/posts-using-packages`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setPostsUsingPackages(res.data);
        } catch (err) {
            toast.error("Lỗi tải dữ liệu bài viết sử dụng gói.");
        }
    };

    const fetchCompanyPostPackages = async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/PackagesPost/company-post-packages`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setCompanyPostPackages(res.data);
        } catch (err) {
            toast.error("Lỗi tải dữ liệu công ty có bài viết dùng gói.");
        }
    };

    const handleSave = async () => {
        try {
            if (editingPackage) {
                await axios.put(`${URL}/${editingPackage.id}`, editingPackage, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                toast.success("Cập nhật thành công!");
            } else {
                const res = await axios.post(URL, newPackage, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setPackages([...packages, res.data]);
                toast.success("Tạo gói mới thành công!");
            }
            setModalShow(false);
            fetchPackages();
        } catch (err) {
            toast.error("Lỗi khi xử lý dữ liệu.");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Bạn có chắc chắn muốn xóa gói này?")) return;
        try {
            await axios.delete(`${URL}/${id}`, { headers: { Authorization: `Bearer ${token}` } });
            toast.success("Xóa gói thành công!");
            fetchPackages();
        } catch (err) {
            toast.error("Lỗi khi xóa gói.");
        }
    };

    return (
        <div className="container mt-4">
            <h1 className="mb-3 text-center" style={{ color: '#00b14f' }}>Quản lý Gói Bài Viết</h1>

            {/* Phần thống kê */}
            {statistics && (
                <Card className="mb-4 border-0 shadow-sm" style={customStyles.header}>
                    <Card.Body className="py-3">
                        <div className="d-flex justify-content-around">
                            <div className="text-center">
                                <h5 className="mb-0">Tổng số gói đã bán</h5>
                                <Badge pill bg="light" text="dark" className="fs-5 mt-2">
                                    {statistics.totalSold}
                                </Badge>
                            </div>
                            <div className="text-center">
                                <h5 className="mb-0">Gói còn hiệu lực</h5>
                                <Badge pill bg="light" text="dark" className="fs-5 mt-2">
                                    {statistics.activeSubscriptions}
                                </Badge>
                            </div>
                        </div>
                    </Card.Body>
                </Card>
            )}

            {/* Nút thêm mới */}
            <Button
                style={customStyles.primaryButton}
                onClick={() => { setEditingPackage(null); setModalShow(true); }}
                className="mb-4"
            >
                <FaPlus /> Thêm Gói Mới
            </Button>

            {loading ? (
                <div className="text-center mt-3">
                    <Spinner animation="border" style={{ color: '#00b14f' }} />
                </div>
            ) : (
                <>
                    <Table striped bordered hover responsive className="mt-3">
                        <thead style={customStyles.header}>
                            <tr>
                                <th className="text-center">ID</th>
                                <th>Tên Gói</th>
                                <th>Mô tả</th>
                                <th className="text-center">Giá</th>
                                <th className="text-center">Thời gian</th>
                                <th className="text-center">Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {packages.map((pack) => (
                                <tr key={pack.id}>
                                    <td className="text-center">{pack.id}</td>
                                    <td>{pack.name}</td>
                                    <td>{pack.description}</td>
                                    <td className="text-center">{pack.price.toLocaleString()} VND</td>
                                    <td className="text-center">{pack.durationDays} ngày</td>
                                    <td className="text-center">
                                        <Button
                                            variant="outline-success"
                                            className="me-2"
                                            size="sm"
                                            onClick={() => { setEditingPackage(pack); setModalShow(true); }}
                                        >
                                            <FaEdit />
                                        </Button>
                                        <Button
                                            variant="outline-danger"
                                            size="sm"
                                            onClick={() => handleDelete(pack.id)}
                                        >
                                            <FaTrash />
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>

                    <Card className="mt-4 shadow-sm">
                        <Card.Header
                            style={customStyles.collapseHeader}
                            onClick={() => setOpenPosts(!openPosts)}
                        >
                            <div className="d-flex justify-content-between align-items-center">
                                <h5 className="mb-0">Bài viết đang sử dụng gói</h5>
                                {openPosts ? <FaChevronUp /> : <FaChevronDown />}
                            </div>
                        </Card.Header>
                        <Collapse in={openPosts}>
                            <div className="table-responsive">
                                <Table striped bordered hover responsive className="shadow">
                                    <thead className="table-dark">
                                        <tr>
                                            <th>ID Bài Viết</th>
                                            <th>Tiêu đề</th>
                                            <th>ID Gói</th>
                                            <th>Tên Gói</th>
                                            <th>Ngày bắt đầu</th>
                                            <th>Ngày kết thúc</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {postsUsingPackages.map((post) => (
                                            <tr key={post.jobPostId}>
                                                <td>{post.jobPostId}</td>
                                                <td>{post.jobPostTitle}</td>
                                                <td>{post.packageId}</td>
                                                <td>{post.packageName}</td>
                                                <td>{post.startDate}</td>
                                                <td>{post.endDate}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            </div>
                        </Collapse>
                    </Card>

                    {/* Phần Collapse cho công ty */}
                    <Card className="mt-4 shadow-sm">
                        <Card.Header
                            style={customStyles.collapseHeader}
                            onClick={() => setOpenCompanies(!openCompanies)}
                        >
                            <div className="d-flex justify-content-between align-items-center">
                                <h5 className="mb-0">Công ty sử dụng gói</h5>
                                {openCompanies ? <FaChevronUp /> : <FaChevronDown />}
                            </div>
                        </Card.Header>
                        <Collapse in={openCompanies}>
                            <div className="table-responsive">
                                <Table striped bordered hover responsive className="shadow">
                                    <thead className="">
                                        <tr>
                                            <th>ID Công Ty</th>
                                            <th>Tên Công Ty</th>
                                            <th>ID Bài Viết</th>
                                            <th>Tiêu đề</th>
                                            <th>ID Gói</th>
                                            <th>Tên Gói</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {companyPostPackages.map((company) => (
                                            <tr key={company.jobPostId}>
                                                <td>{company.companyId}</td>
                                                <td>{company.companyName}</td>
                                                <td>{company.jobPostId}</td>
                                                <td>{company.jobPostTitle}</td>
                                                <td>{company.packageId}</td>
                                                <td>{company.packageName}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            </div>
                        </Collapse>
                    </Card>
                </>
            )}

            {/* Modal */}
            <Modal show={modalShow} onHide={() => setModalShow(false)}>
                <Modal.Header closeButton style={customStyles.header}>
                    <Modal.Title style={{ color: 'white' }}>
                        {editingPackage ? "Chỉnh sửa gói" : "Thêm Gói Mới"}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {/* ... (giữ nguyên phần body modal) */}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setModalShow(false)}>Hủy</Button>
                    <Button style={customStyles.primaryButton} onClick={handleSave}>
                        Lưu thay đổi
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
}

export default PackagesManager;
