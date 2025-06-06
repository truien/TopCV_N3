import React, { useState, useEffect } from 'react';
import { FaBriefcase, FaPlus, FaEdit, FaTrash, FaSearch, FaSpinner } from 'react-icons/fa';
import { Modal, Button, Form, Alert } from 'react-bootstrap';
import { toast } from 'react-toastify';
import {
    getAllJobFieldsForAdmin,
    createJobField,
    updateJobField,
    deleteJobField
} from '../../../api/jobFieldsApi';
import styles from './JobFieldsManager.module.css';

const JobFieldsManager = () => {
    const [jobFields, setJobFields] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [editingField, setEditingField] = useState(null);
    const [formData, setFormData] = useState({ name: '' });
    const [submitting, setSubmitting] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);

    useEffect(() => {
        fetchJobFields();
    }, []);

    const fetchJobFields = async () => {
        try {
            setLoading(true);
            const data = await getAllJobFieldsForAdmin();
            setJobFields(data);
        } catch (error) {
            console.error('Error fetching job fields:', error);
            toast.error('Không thể tải danh sách lĩnh vực');
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = () => {
        setEditingField(null);
        setFormData({ name: '' });
        setShowModal(true);
    };

    const handleEdit = (field) => {
        setEditingField(field);
        setFormData({ name: field.name });
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name.trim()) {
            toast.error('Vui lòng nhập tên lĩnh vực');
            return;
        }

        try {
            setSubmitting(true);
            if (editingField) {
                await updateJobField(editingField.id, formData);
                toast.success('Cập nhật lĩnh vực thành công');
            } else {
                await createJobField(formData);
                toast.success('Tạo lĩnh vực thành công');
            }
            setShowModal(false);
            fetchJobFields();
        } catch (error) {
            const message = error.response?.data?.message || 'Có lỗi xảy ra';
            toast.error(message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = (field) => {
        setDeleteTarget(field);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (!deleteTarget) return;

        try {
            setSubmitting(true);
            await deleteJobField(deleteTarget.id);
            toast.success('Xóa lĩnh vực thành công');
            setShowDeleteModal(false);
            setDeleteTarget(null);
            fetchJobFields();
        } catch (error) {
            const message = error.response?.data?.message || 'Có lỗi xảy ra';
            toast.error(message);
        } finally {
            setSubmitting(false);
        }
    };

    const filteredFields = jobFields.filter(field =>
        field.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.headerContent}>
                    <h1 className={styles.title}>
                        <FaBriefcase className={styles.titleIcon} />
                        Quản lý lĩnh vực công việc
                    </h1>
                    <p className={styles.subtitle}>
                        Quản lý các lĩnh vực công việc trong hệ thống
                    </p>
                </div>
            </div>

            <div className={styles.mainContent}>
                <div className={styles.toolbar}>
                    <div className={styles.searchContainer}>
                        <FaSearch className={styles.searchIcon} />
                        <input
                            type="text"
                            placeholder="Tìm kiếm lĩnh vực..."
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
                        Thêm lĩnh vực
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
                                    <th>Tên lĩnh vực</th>
                                    <th>Số bài đăng</th>
                                    <th>Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredFields.length > 0 ? (
                                    filteredFields.map((field) => (
                                        <tr key={field.id}>
                                            <td>{field.id}</td>
                                            <td className={styles.fieldName}>{field.name}</td>
                                            <td>
                                                <span className={styles.jobCount}>
                                                    {field.jobPostCount || 0}
                                                </span>
                                            </td>
                                            <td>
                                                <div className={styles.actionButtons}>
                                                    <Button
                                                        variant="outline-primary"
                                                        size="sm"
                                                        onClick={() => handleEdit(field)}
                                                        className={styles.editButton}
                                                    >
                                                        <FaEdit />
                                                    </Button>
                                                    <Button
                                                        variant="outline-danger"
                                                        size="sm"
                                                        onClick={() => handleDelete(field)}
                                                        className={styles.deleteButton}
                                                        disabled={field.jobPostCount > 0}
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
                                            {searchTerm ? 'Không tìm thấy lĩnh vực nào' : 'Chưa có lĩnh vực nào'}
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
                            {editingField ? 'Chỉnh sửa lĩnh vực' : 'Thêm lĩnh vực mới'}
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form.Group className="mb-3">
                            <Form.Label>Tên lĩnh vực *</Form.Label>
                            <Form.Control
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Nhập tên lĩnh vực"
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
                                    {editingField ? 'Đang cập nhật...' : 'Đang tạo...'}
                                </>
                            ) : (
                                editingField ? 'Cập nhật' : 'Tạo mới'
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
                            Bạn có chắc chắn muốn xóa lĩnh vực "<strong>{deleteTarget?.name}</strong>" không?
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

export default JobFieldsManager;
