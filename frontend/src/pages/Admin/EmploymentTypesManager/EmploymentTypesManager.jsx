import React, { useState, useEffect } from 'react';
import { FaClock, FaPlus, FaEdit, FaTrash, FaSearch, FaSpinner } from 'react-icons/fa';
import { Modal, Button, Form, Alert } from 'react-bootstrap';
import { toast } from 'react-toastify';
import {
    getAllEmploymentTypesForAdmin,
    createEmploymentType,
    updateEmploymentType,
    deleteEmploymentType
} from '../../../api/employmentTypesApi';
import styles from './EmploymentTypesManager.module.css';

const EmploymentTypesManager = () => {
    const [employmentTypes, setEmploymentTypes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [editingType, setEditingType] = useState(null);
    const [formData, setFormData] = useState({ name: '' });
    const [submitting, setSubmitting] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);

    useEffect(() => {
        fetchEmploymentTypes();
    }, []);

    const fetchEmploymentTypes = async () => {
        try {
            setLoading(true);
            const data = await getAllEmploymentTypesForAdmin();
            setEmploymentTypes(data);
        } catch (error) {
            console.error('Error fetching employment types:', error);
            toast.error('Không thể tải danh sách hình thức làm việc');
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = () => {
        setEditingType(null);
        setFormData({ name: '' });
        setShowModal(true);
    };

    const handleEdit = (type) => {
        setEditingType(type);
        setFormData({ name: type.name });
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name.trim()) {
            toast.error('Vui lòng nhập tên hình thức làm việc');
            return;
        }

        try {
            setSubmitting(true);
            if (editingType) {
                await updateEmploymentType(editingType.id, formData);
                toast.success('Cập nhật hình thức làm việc thành công');
            } else {
                await createEmploymentType(formData);
                toast.success('Tạo hình thức làm việc thành công');
            }
            setShowModal(false);
            fetchEmploymentTypes();
        } catch (error) {
            const message = error.response?.data?.message || 'Có lỗi xảy ra';
            toast.error(message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = (type) => {
        setDeleteTarget(type);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (!deleteTarget) return;

        try {
            setSubmitting(true);
            await deleteEmploymentType(deleteTarget.id);
            toast.success('Xóa hình thức làm việc thành công');
            setShowDeleteModal(false);
            setDeleteTarget(null);
            fetchEmploymentTypes();
        } catch (error) {
            const message = error.response?.data?.message || 'Có lỗi xảy ra';
            toast.error(message);
        } finally {
            setSubmitting(false);
        }
    };

    const filteredTypes = employmentTypes.filter(type =>
        type.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.headerContent}>
                    <h1 className={styles.title}>
                        <FaClock className={styles.titleIcon} />
                        Quản lý hình thức làm việc
                    </h1>
                    <p className={styles.subtitle}>
                        Quản lý các hình thức làm việc trong hệ thống
                    </p>
                </div>
            </div>

            <div className={styles.mainContent}>
                <div className={styles.toolbar}>
                    <div className={styles.searchContainer}>
                        <FaSearch className={styles.searchIcon} />
                        <input
                            type="text"
                            placeholder="Tìm kiếm hình thức làm việc..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className={styles.searchInput}
                        />
                    </div>
                    <Button
                        variant="primary"
                        onClick={handleCreate}
                        className={styles.addButton}
                    >
                        <FaPlus className="me-2" />
                        Thêm hình thức
                    </Button>
                </div>

                {loading ? (
                    <div className={styles.loadingContainer}>
                        <FaSpinner className={`${styles.spinner} fa-spin`} />
                        <p>Đang tải...</p>
                    </div>
                ) : (
                    <div className={styles.tableContainer}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Tên hình thức</th>
                                    <th>Số bài đăng</th>
                                    <th>Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredTypes.length > 0 ? (
                                    filteredTypes.map((type) => (
                                        <tr key={type.id}>
                                            <td>{type.id}</td>
                                            <td className={styles.typeName}>{type.name}</td>
                                            <td>
                                                <span className={styles.jobCount}>
                                                    {type.jobPostCount || 0}
                                                </span>
                                            </td>
                                            <td>
                                                <div className={styles.actionButtons}>
                                                    <Button
                                                        variant="outline-primary"
                                                        size="sm"
                                                        onClick={() => handleEdit(type)}
                                                        className={styles.editButton}
                                                    >
                                                        <FaEdit />
                                                    </Button>
                                                    <Button
                                                        variant="outline-danger"
                                                        size="sm"
                                                        onClick={() => handleDelete(type)}
                                                        className={styles.deleteButton}
                                                        disabled={type.jobPostCount > 0}
                                                    >
                                                        <FaTrash />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" className={styles.noData}>
                                            {searchTerm ? 'Không tìm thấy hình thức nào' : 'Chưa có hình thức nào'}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Create/Edit Modal */}
            <Modal show={showModal} onHide={() => setShowModal(false)} centered>
                <Form onSubmit={handleSubmit}>
                    <Modal.Header closeButton>
                        <Modal.Title>
                            {editingType ? 'Chỉnh sửa hình thức làm việc' : 'Thêm hình thức làm việc mới'}
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form.Group className="mb-3">
                            <Form.Label>Tên hình thức làm việc *</Form.Label>
                            <Form.Control
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Nhập tên hình thức làm việc"
                                required
                                disabled={submitting}
                            />
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button
                            variant="secondary"
                            onClick={() => setShowModal(false)}
                            disabled={submitting}
                        >
                            Hủy
                        </Button>
                        <Button
                            variant="primary"
                            type="submit"
                            disabled={submitting}
                        >
                            {submitting ? (
                                <>
                                    <FaSpinner className="fa-spin me-2" />
                                    {editingType ? 'Đang cập nhật...' : 'Đang tạo...'}
                                </>
                            ) : (
                                editingType ? 'Cập nhật' : 'Tạo mới'
                            )}
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Xác nhận xóa</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Alert variant="warning">
                        <p className="mb-0">
                            Bạn có chắc chắn muốn xóa hình thức làm việc "<strong>{deleteTarget?.name}</strong>" không?
                        </p>
                        <small className="text-muted">
                            Hành động này không thể hoàn tác.
                        </small>
                    </Alert>
                </Modal.Body>
                <Modal.Footer>
                    <Button
                        variant="secondary"
                        onClick={() => setShowDeleteModal(false)}
                        disabled={submitting}
                    >
                        Hủy
                    </Button>
                    <Button
                        variant="danger"
                        onClick={confirmDelete}
                        disabled={submitting}
                    >
                        {submitting ? (
                            <>
                                <FaSpinner className="fa-spin me-2" />
                                Đang xóa...
                            </>
                        ) : (
                            'Xóa'
                        )}
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default EmploymentTypesManager;
