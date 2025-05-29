import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { debounce } from 'lodash';
import styles from './AdminJobPostsManager.module.css';
import {
    getAdminJobPosts,
    deleteAdminJobPost,
    updateJobPostStatus,
    getJobPostStatistics
} from '../../../api/adminJobPostsApi';

const AdminJobPostsManager = () => {
    const [jobPosts, setJobPosts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingPosts, setLoadingPosts] = useState(false);
    const [statistics, setStatistics] = useState(null);

    // Filters and pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [pageSize] = useState(10);

    // Search and filters
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [sortBy, setSortBy] = useState('PostDate');
    const [sortDirection, setSortDirection] = useState('desc');

    // Modal states
    const [selectedJobPost, setSelectedJobPost] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showStatusModal, setShowStatusModal] = useState(false);
    const [newStatus, setNewStatus] = useState('');    // Fetch job posts with loading state
    const fetchJobPosts = useCallback(async (
        page = currentPage,
        searchTerm = search,
        status = statusFilter,
        sort = sortBy,
        direction = sortDirection
    ) => {
        setLoadingPosts(true);
        try {
            const params = {
                page,
                pageSize,
                search: searchTerm,
                status,
                sortBy: sort,
                sortDirection: direction
            };

            const data = await getAdminJobPosts(params);
            setJobPosts(data.jobPosts || []);
            setCurrentPage(data.currentPage || 1);
            setTotalPages(data.totalPages || 1);
            setTotalItems(data.totalItems || 0);
        } catch (error) {
            console.error('Error fetching job posts:', error);
            toast.error('Không thể tải danh sách bài viết');
        } finally {
            setLoadingPosts(false);
        }
    }, [currentPage, pageSize, search, statusFilter, sortBy, sortDirection]);    // Fetch statistics
    const fetchStatistics = useCallback(async () => {
        try {
            const data = await getJobPostStatistics();
            setStatistics(data);
        } catch (error) {
            console.error('Error fetching statistics:', error);
            toast.error('Không thể tải thống kê');
        }
    }, []);

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const debouncedSearch = useCallback(
        debounce((searchTerm) => {
            setCurrentPage(1);
            fetchJobPosts(1, searchTerm, statusFilter, sortBy, sortDirection);
        }, 500),
        [fetchJobPosts, statusFilter, sortBy, sortDirection]
    );
    useEffect(() => {
        setLoading(true);
        Promise.all([
            fetchJobPosts(),
            fetchStatistics()
        ]).finally(() => {
            setLoading(false);
        });
    }, [fetchJobPosts, fetchStatistics]);

    // Handle search input change
    useEffect(() => {
        debouncedSearch(search);
        return () => {
            debouncedSearch.cancel();
        };
    }, [search, debouncedSearch]);

    // Handle filter changes
    const handleStatusFilterChange = (status) => {
        setStatusFilter(status);
        setCurrentPage(1);
        fetchJobPosts(1, search, status, sortBy, sortDirection);
    };

    const handleSortChange = (newSortBy) => {
        const newDirection = sortBy === newSortBy && sortDirection === 'asc' ? 'desc' : 'asc';
        setSortBy(newSortBy);
        setSortDirection(newDirection);
        fetchJobPosts(currentPage, search, statusFilter, newSortBy, newDirection);
    };

    // Handle pagination
    const handlePageChange = (page) => {
        setCurrentPage(page);
        fetchJobPosts(page, search, statusFilter, sortBy, sortDirection);
    };

    // Handle delete job post
    const handleDeleteJobPost = async () => {
        if (!selectedJobPost) return;

        try {
            await deleteAdminJobPost(selectedJobPost.id);
            toast.success('Xóa bài viết thành công');
            setShowDeleteModal(false);
            setSelectedJobPost(null);
            await fetchJobPosts();
            await fetchStatistics();
        } catch (error) {
            console.error('Error deleting job post:', error);
            toast.error('Không thể xóa bài viết');
        }
    };

    // Handle update status
    const handleUpdateStatus = async () => {
        if (!selectedJobPost || !newStatus) return;

        try {
            await updateJobPostStatus(selectedJobPost.id, { status: newStatus });
            toast.success('Cập nhật trạng thái thành công');
            setShowStatusModal(false);
            setSelectedJobPost(null);
            setNewStatus('');
            await fetchJobPosts();
            await fetchStatistics();
        } catch (error) {
            console.error('Error updating status:', error);
            toast.error('Không thể cập nhật trạng thái');
        }
    };

    // Export to CSV
    const exportToCSV = () => {
        if (jobPosts.length === 0) {
            toast.warning('Không có dữ liệu để xuất');
            return;
        }

        const headers = [
            'ID', 'Tiêu đề', 'Công ty', 'Trạng thái', 'Địa điểm',
            'Mức lương', 'Ngày đăng', 'Hạn ứng tuyển', 'Lượt xem', 'Số ứng viên'
        ];

        const csvData = jobPosts.map(post => [
            post.id,
            post.title,
            post.companyName,
            post.status,
            post.location,
            post.salaryRange || 'Không có',
            new Date(post.postDate).toLocaleDateString('vi-VN'),
            post.applyDeadline ? new Date(post.applyDeadline).toLocaleDateString('vi-VN') : 'Không có',
            post.viewCount || 0,
            post.applicationCount || 0
        ]);

        const csvContent = [headers, ...csvData]
            .map(row => row.map(cell => `"${cell}"`).join(','))
            .join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `job_posts_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }; const getStatusBadgeClass = (status) => {
        switch (status) {
            case 'open': return styles.statusOpen;
            case 'closed': return styles.statusClosed;
            case 'pending': return styles.statusPending;
            case 'suspended': return styles.statusSuspended;
            default: return styles.statusSuspended;
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'open': return 'Đang mở';
            case 'closed': return 'Đã đóng';
            case 'pending': return 'Chờ duyệt';
            case 'suspended': return 'Tạm dừng';
            default: return status;
        }
    };

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Đang tải...</span>
                </div>
            </div>
        );
    } return (
        <div className={styles.container}>
            {/* Header Section */}
            <div className={styles.header}>
                <div className="d-flex justify-content-between align-items-center">
                    <div>
                        <h1 className={styles.title}>Quản lý bài viết tuyển dụng</h1>
                        <p className={styles.subtitle}>Quản lý, theo dõi và điều chỉnh các bài đăng tuyển dụng</p>
                    </div>
                    <button
                        className={styles.exportButton}
                        onClick={exportToCSV}
                        disabled={jobPosts.length === 0}
                    >
                        <i className="fas fa-download me-2"></i>
                        Xuất CSV
                    </button>
                </div>
            </div>            {/* Statistics Cards */}
            {statistics && (
                <div className={styles.statsGrid}>
                    <div className={styles.statCard}>
                        <div className={styles.statValue}>{statistics.totalPosts}</div>
                        <div className={styles.statLabel}>Tổng bài viết</div>
                    </div>
                    <div className={styles.statCard}>
                        <div className={styles.statValue}>{statistics.activePosts}</div>
                        <div className={styles.statLabel}>Đang hoạt động</div>
                    </div>
                    <div className={styles.statCard}>
                        <div className={styles.statValue}>{statistics.pendingPosts}</div>
                        <div className={styles.statLabel}>Chờ duyệt</div>
                    </div>
                    <div className={styles.statCard}>
                        <div className={styles.statValue}>{statistics.totalApplications}</div>
                        <div className={styles.statLabel}>Tổng ứng viên</div>
                    </div>
                </div>
            )}            {/* Filters and Search */}
            <div className={styles.filterCard}>
                <div className="row g-4">
                    <div className="col-md-6">
                        <div className={styles.formGroup}>
                            <label className={styles.formLabel}>Tìm kiếm</label>
                            <input
                                type="text"
                                className={styles.formControl}
                                placeholder="Tìm theo tiêu đề, công ty, mô tả..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className={styles.formGroup}>
                            <label className={styles.formLabel}>Trạng thái</label>
                            <select
                                className={styles.formControl}
                                value={statusFilter}
                                onChange={(e) => handleStatusFilterChange(e.target.value)}
                            >
                                <option value="">Tất cả</option>
                                <option value="open">Đang mở</option>
                                <option value="closed">Đã đóng</option>
                                <option value="pending">Chờ duyệt</option>
                                <option value="suspended">Tạm dừng</option>
                            </select>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className={styles.formGroup}>
                            <label className={styles.formLabel}>Sắp xếp theo</label>
                            <select
                                className={styles.formControl}
                                value={sortBy}
                                onChange={(e) => handleSortChange(e.target.value)}
                            >
                                <option value="PostDate">Ngày đăng</option>
                                <option value="Title">Tiêu đề</option>
                                <option value="CompanyName">Công ty</option>
                                <option value="ApplicationCount">Số ứng viên</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>            {/* Job Posts Table */}
            <div className={styles.tableCard}>
                <div className="position-relative">
                    {loadingPosts && (
                        <div className={styles.tableLoadingOverlay}>
                            <div className={styles.spinner}></div>
                        </div>
                    )}

                    <div className="table-responsive">
                        <table className="table table-hover mb-0">
                            <thead className={styles.tableHeader}>
                                <tr>
                                    <th>ID</th>
                                    <th
                                        style={{ cursor: 'pointer' }}
                                        onClick={() => handleSortChange('Title')}
                                    >
                                        Tiêu đề
                                        {sortBy === 'Title' && (
                                            <i className={`fas fa-sort-${sortDirection === 'asc' ? 'up' : 'down'} ms-2`}></i>
                                        )}
                                    </th>
                                    <th>Công ty</th>
                                    <th>Trạng thái</th>
                                    <th>Địa điểm</th>
                                    <th>Ngày đăng</th>
                                    <th>Ứng viên</th>
                                    <th>Thao tác</th>
                                </tr>
                            </thead>
                            <tbody className={styles.tableBody}>
                                {jobPosts.length > 0 ? (
                                    jobPosts.map((post) => (
                                        <tr key={post.id}>
                                            <td><strong>#{post.id}</strong></td>
                                            <td>
                                                <div className={styles.titleCell}>
                                                    {post.title}
                                                </div>
                                            </td>
                                            <td>
                                                <div style={{ fontWeight: '500', color: '#374151' }}>
                                                    {post.companyName}
                                                </div>
                                            </td>
                                            <td>
                                                <span className={`${styles.statusBadge} ${getStatusBadgeClass(post.status)}`}>
                                                    {getStatusText(post.status)}
                                                </span>
                                            </td>
                                            <td>
                                                <i className="fas fa-map-marker-alt me-1 text-muted"></i>
                                                {post.location}
                                            </td>
                                            <td>{new Date(post.postDate).toLocaleDateString('vi-VN')}</td>
                                            <td>
                                                <i className="fas fa-users me-1 text-muted"></i>
                                                {post.applicationCount || 0}
                                            </td>
                                            <td>
                                                <div className={styles.actionButtons}>
                                                    <button
                                                        className={`${styles.actionButton} ${styles.editButton}`}
                                                        onClick={() => {
                                                            setSelectedJobPost(post);
                                                            setNewStatus(post.status);
                                                            setShowStatusModal(true);
                                                        }}
                                                        title="Cập nhật trạng thái"
                                                    >
                                                        <i className="fas fa-edit"></i>
                                                    </button>
                                                    <button
                                                        className={`${styles.actionButton} ${styles.deleteButton}`}
                                                        onClick={() => {
                                                            setSelectedJobPost(post);
                                                            setShowDeleteModal(true);
                                                        }}
                                                        title="Xóa bài viết"
                                                    >
                                                        <i className="fas fa-trash"></i>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="9" className={styles.emptyState}>
                                            <div className={styles.emptyIcon}>
                                                <i className="fas fa-search"></i>
                                            </div>
                                            <div className={styles.emptyMessage}>Không tìm thấy bài viết nào</div>
                                            <div className={styles.emptySubtext}>Thử thay đổi bộ lọc hoặc tìm kiếm với từ khóa khác</div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>                   
                {totalPages > 1 && (
                    <div className={styles.pagination}>
                        <div className="d-flex justify-content-between align-items-center">
                            <div className={styles.paginationInfo}>
                                Hiển thị {((currentPage - 1) * pageSize) + 1} - {Math.min(currentPage * pageSize, totalItems)} của {totalItems} bài viết
                            </div>
                            <nav>
                                <ul className="pagination mb-0">
                                    <li className="page-item">
                                        <button
                                            className={styles.pageButton}
                                            onClick={() => handlePageChange(1)}
                                            disabled={currentPage === 1 || loadingPosts}
                                        >
                                            Đầu
                                        </button>
                                    </li>
                                    <li className="page-item">
                                        <button
                                            className={styles.pageButton}
                                            onClick={() => handlePageChange(currentPage - 1)}
                                            disabled={currentPage === 1 || loadingPosts}
                                        >
                                            Trước
                                        </button>
                                    </li>

                                    {/* Page numbers */}
                                    {[...Array(Math.min(5, totalPages))].map((_, index) => {
                                        const page = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + index;
                                        if (page <= totalPages) {
                                            return (
                                                <li key={page} className="page-item">
                                                    <button
                                                        className={`${styles.pageButton} ${currentPage === page ? 'active' : ''}`}
                                                        onClick={() => handlePageChange(page)}
                                                        disabled={loadingPosts}
                                                    >
                                                        {page}
                                                    </button>
                                                </li>
                                            );
                                        }
                                        return null;
                                    })}

                                    <li className="page-item">
                                        <button
                                            className={styles.pageButton}
                                            onClick={() => handlePageChange(currentPage + 1)}
                                            disabled={currentPage === totalPages || loadingPosts}
                                        >
                                            Sau
                                        </button>
                                    </li>
                                    <li className="page-item">
                                        <button
                                            className={styles.pageButton}
                                            onClick={() => handlePageChange(totalPages)}
                                            disabled={currentPage === totalPages || loadingPosts}
                                        >
                                            Cuối
                                        </button>                                        </li>
                                </ul>
                            </nav>
                        </div>
                    </div>
                )}
            </div>

            {/* Delete Modal */}
            {showDeleteModal && (
                <div className={`modal show ${styles.modal}`} style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog">
                        <div className={`modal-content ${styles.modalContent}`}>
                            <div className={`modal-header ${styles.modalHeader}`}>
                                <h5 className={`modal-title ${styles.modalTitle}`}>
                                    <i className="fas fa-exclamation-triangle text-warning me-2"></i>
                                    Xác nhận xóa
                                </h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => {
                                        setShowDeleteModal(false);
                                        setSelectedJobPost(null);
                                    }}
                                ></button>
                            </div>
                            <div className={`modal-body ${styles.modalBody}`}>
                                <p className="mb-3">Bạn có chắc chắn muốn xóa bài viết <strong>"{selectedJobPost?.title}"</strong>?</p>
                                <div className="alert alert-warning d-flex align-items-center">
                                    <i className="fas fa-exclamation-triangle me-2"></i>
                                    Hành động này sẽ xóa tất cả dữ liệu liên quan và không thể hoàn tác.
                                </div>
                            </div>
                            <div className={`modal-footer ${styles.modalFooter}`}>
                                <button
                                    type="button"
                                    className={styles.secondaryButton}
                                    onClick={() => {
                                        setShowDeleteModal(false);
                                        setSelectedJobPost(null);
                                    }}
                                >
                                    <i className="fas fa-times me-2"></i>
                                    Hủy
                                </button>
                                <button
                                    type="button"
                                    className={styles.dangerButton}
                                    onClick={handleDeleteJobPost}
                                >
                                    <i className="fas fa-trash me-2"></i>
                                    Xóa bài viết
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}            {/* Status Update Modal */}
            {showStatusModal && (
                <div className={`modal show ${styles.modal}`} style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog">
                        <div className={`modal-content ${styles.modalContent}`}>
                            <div className={`modal-header ${styles.modalHeader}`}>
                                <h5 className={`modal-title ${styles.modalTitle}`}>
                                    <i className="fas fa-edit text-primary me-2"></i>
                                    Cập nhật trạng thái
                                </h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => {
                                        setShowStatusModal(false);
                                        setSelectedJobPost(null);
                                        setNewStatus('');
                                    }}
                                ></button>
                            </div>
                            <div className={`modal-body ${styles.modalBody}`}>
                                <p className="mb-3">Cập nhật trạng thái cho bài viết: <strong>"{selectedJobPost?.title}"</strong></p>
                                <div className="mb-3">
                                    <label className={styles.formLabel}>Trạng thái mới</label>
                                    <select
                                        className={styles.formControl}
                                        value={newStatus}
                                        onChange={(e) => setNewStatus(e.target.value)}
                                    >
                                        <option value="open">🟢 Đang mở</option>
                                        <option value="closed">🔴 Đã đóng</option>
                                        <option value="pending">🟡 Chờ duyệt</option>
                                        <option value="suspended">⚫ Tạm dừng</option>
                                    </select>
                                </div>
                            </div>
                            <div className={`modal-footer ${styles.modalFooter}`}>
                                <button
                                    type="button"
                                    className={styles.secondaryButton}
                                    onClick={() => {
                                        setShowStatusModal(false);
                                        setSelectedJobPost(null);
                                        setNewStatus('');
                                    }}
                                >
                                    <i className="fas fa-times me-2"></i>
                                    Hủy
                                </button>
                                <button
                                    type="button"
                                    className={styles.primaryButton}
                                    onClick={handleUpdateStatus}
                                    disabled={!newStatus}
                                >
                                    <i className="fas fa-save me-2"></i>
                                    Cập nhật
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminJobPostsManager;
