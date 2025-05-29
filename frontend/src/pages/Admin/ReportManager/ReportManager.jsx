import React, { useState, useEffect, useCallback } from 'react';
import { FaSearch, FaFilter, FaEdit, FaTrash, FaEye, FaDownload, FaExclamationTriangle, FaCheck, FaTimes, FaClock } from 'react-icons/fa';
import { toast } from 'react-toastify';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { getAllReports, getReportStatistics, updateReportStatus, deleteReport, getReportDetail } from '../../../api/reportApi';
import styles from './ReportManager.module.css';

const ReportManager = () => {
    const [reports, setReports] = useState([]);
    const [statistics, setStatistics] = useState({});
    const [loading, setLoading] = useState(false);
    const [selectedReport, setSelectedReport] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [reportToDelete, setReportToDelete] = useState(null);

    // Pagination and filters
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [reasonFilter, setReasonFilter] = useState(''); const statusOptions = [
        { value: '', label: 'Tất cả trạng thái' },
        { value: 'pending', label: 'Đang chờ xử lý' },
        { value: 'resolved', label: 'Đã xử lý' },
        { value: 'reviewed', label: 'Đã xem xét' }
    ];

    const reasonOptions = [
        { value: '', label: 'Tất cả lý do' },
        { value: 'inappropriate_content', label: 'Nội dung không phù hợp' },
        { value: 'fake_job', label: 'Việc làm giả' },
        { value: 'spam', label: 'Spam' },
        { value: 'discrimination', label: 'Phân biệt đối xử' },
        { value: 'other', label: 'Khác' }
    ]; const getStatusIcon = (status) => {
        switch (status) {
            case 'pending': return <FaClock className={styles.statusIconPending} />;
            case 'resolved': return <FaCheck className={styles.statusIconResolved} />;
            case 'reviewed': return <FaTimes className={styles.statusIconReviewed} />;
            default: return <FaExclamationTriangle className={styles.statusIconDefault} />;
        }
    }; const getStatusText = (status) => {
        switch (status) {
            case 'pending': return 'Đang chờ xử lý';
            case 'resolved': return 'Đã xử lý';
            case 'reviewed': return 'Đã xem xét';
            default: return status;
        }
    };

    const getReasonText = (reason) => {
        const reasonMap = {
            'inappropriate_content': 'Nội dung không phù hợp',
            'fake_job': 'Việc làm giả',
            'spam': 'Spam',
            'discrimination': 'Phân biệt đối xử',
            'other': 'Khác'
        };
        return reasonMap[reason] || reason;
    };

    const fetchReports = useCallback(async () => {
        setLoading(true);
        try {
            const params = {
                page: currentPage,
                pageSize,
                status: statusFilter,
                reason: reasonFilter,
                search: searchTerm
            };

            const response = await getAllReports(params);
            setReports(response.data.data);
            setTotalPages(response.data.totalPages);
        } catch (error) {
            console.error('Lỗi khi tải danh sách báo cáo:', error);
            toast.error('Không thể tải danh sách báo cáo');
        } finally {
            setLoading(false);
        }
    }, [currentPage, pageSize, statusFilter, reasonFilter, searchTerm]);

    const fetchStatistics = useCallback(async () => {
        try {
            const response = await getReportStatistics();
            setStatistics(response.data);
        } catch (error) {
            console.error('Lỗi khi tải thống kê:', error);
        }
    }, []);

    // Cập nhật useEffect để tự động fetch khi filter thay đổi
    useEffect(() => {
        fetchReports();
    }, [fetchReports]);

    useEffect(() => {
        fetchStatistics();
    }, [fetchStatistics]);

    // Thêm useEffect để tự động search khi searchTerm thay đổi
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (searchTerm !== '') {
                setCurrentPage(1);
                fetchReports();
            } else {
                setCurrentPage(1);
                fetchReports();
            }
        }, 500); // Debounce 500ms

        return () => clearTimeout(timeoutId);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchTerm]);

    // const handleSearch = (e) => {
    //     e.preventDefault();
    //     setCurrentPage(1);
    //     fetchReports();
    // };

    const handleStatusChange = async (reportId, newStatus) => {
        try {
            await updateReportStatus(reportId, newStatus);
            toast.success('Đã cập nhật trạng thái báo cáo');
            fetchReports();
            fetchStatistics();
        } catch (error) {
            console.error('Lỗi khi cập nhật trạng thái:', error);
            toast.error('Không thể cập nhật trạng thái báo cáo');
        }
    };

    const handleViewDetail = async (reportId) => {
        try {
            const response = await getReportDetail(reportId);
            setSelectedReport(response.data);
            setShowDetailModal(true);
        } catch (error) {
            console.error('Lỗi khi tải chi tiết báo cáo:', error);
            toast.error('Không thể tải chi tiết báo cáo');
        }
    };

    const handleDeleteReport = async () => {
        if (!reportToDelete) return;

        try {
            await deleteReport(reportToDelete.id);
            toast.success('Đã xóa báo cáo thành công');
            setShowDeleteModal(false);
            setReportToDelete(null);
            fetchReports();
            fetchStatistics();
        } catch (error) {
            console.error('Lỗi khi xóa báo cáo:', error);
            toast.error('Không thể xóa báo cáo');
        }
    };

    const handleExportExcel = () => {
        const exportData = reports.map(report => ({
            'ID': report.id,
            'Tiêu đề công việc': report.jobPostTitle,
            'Công ty': report.companyName,
            'Người báo cáo': report.reportedByEmail,
            'Lý do': getReasonText(report.reason),
            'Mô tả': report.description,
            'Trạng thái': getStatusText(report.status),
            'Ngày tạo': new Date(report.createdAt).toLocaleDateString('vi-VN')
        }));

        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Reports");

        const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        saveAs(data, `reports_${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    return (
        <div className={styles.reportManager}>
            <div className={styles.background}></div>

            {/* Header */}
            <div className={styles.header}>
                <h1 className={styles.title}>Quản lý báo cáo</h1>
                <p className={styles.subtitle}>Quản lý và xử lý các báo cáo từ người dùng</p>
            </div>

            {/* Statistics Cards */}
            <div className={styles.statsGrid}>
                <div className={styles.statsCard}>
                    <div className={styles.statsIcon}>
                        <FaExclamationTriangle />
                    </div>
                    <div className={styles.statsContent}>
                        <h3>{statistics.totalReports || 0}</h3>
                        <p className={styles.statsContent_p}>Tổng báo cáo</p>
                    </div>
                </div>

                <div className={styles.statsCard}>
                    <div className={styles.statsIcon}>
                        <FaClock />
                    </div>
                    <div className={styles.statsContent}>
                        <h3>{statistics.pendingReports || 0}</h3>
                        <p>Đang chờ xử lý</p>
                    </div>
                </div>

                <div className={styles.statsCard}>
                    <div className={styles.statsIcon}>
                        <FaCheck />
                    </div>
                    <div className={styles.statsContent}>
                        <h3>{statistics.resolvedReports || 0}</h3>
                        <p>Đã xử lý</p>
                    </div>
                </div>                <div className={styles.statsCard}>
                    <div className={styles.statsIcon}>
                        <FaTimes />
                    </div>
                    <div className={styles.statsContent}>
                        <h3>{statistics.reviewedReports || 0}</h3>
                        <p>Đã xem xét</p>
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className={styles.controls}>
                <div className={styles.searchForm}>
                    <div className={styles.searchInput}>
                        <FaSearch className={styles.searchIcon} />
                        <input
                            type="text"
                            placeholder="Tìm kiếm theo tiêu đề, mô tả, email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    {searchTerm && (
                        <button
                            type="button"
                            onClick={() => setSearchTerm('')}
                            className={styles.clearButton}
                            title="Xóa tìm kiếm"
                        >
                            <FaTimes />
                        </button>
                    )}
                </div>

                <div className={styles.filters}>
                    <div className={styles.filterGroup}>
                        <FaFilter className={styles.filterIcon} />
                        <select
                            value={statusFilter}
                            onChange={(e) => {
                                setStatusFilter(e.target.value);
                                setCurrentPage(1);
                            }}
                            className={styles.filterSelect}
                        >
                            {statusOptions.map(option => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className={styles.filterGroup}>
                        <select
                            value={reasonFilter}
                            onChange={(e) => {
                                setReasonFilter(e.target.value);
                                setCurrentPage(1);
                            }}
                            className={styles.filterSelect}
                        >
                            {reasonOptions.map(option => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <button onClick={handleExportExcel} className={styles.exportButton}>
                        <FaDownload /> Export Excel
                    </button>

                    {/* Nút reset filters */}
                    {(statusFilter || reasonFilter || searchTerm) && (
                        <button
                            onClick={() => {
                                setStatusFilter('');
                                setReasonFilter('');
                                setSearchTerm('');
                                setCurrentPage(1);
                            }}
                            className={styles.resetButton}
                            title="Xóa tất cả bộ lọc"
                        >
                            <FaTimes /> Reset
                        </button>
                    )}
                </div>
            </div>

            {/* Reports Table */}
            <div className={styles.tableContainer}>
                {loading ? (
                    <div className={styles.loading}>Đang tải...</div>
                ) : (
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Tiêu đề công việc</th>
                                <th>Công ty</th>
                                <th>Người báo cáo</th>
                                <th>Lý do</th>
                                <th>Trạng thái</th>
                                <th>Ngày tạo</th>
                                <th>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reports.map(report => (
                                <tr key={report.id}>
                                    <td>{report.id}</td>
                                    <td className={styles.jobTitle}>{report.jobPostTitle}</td>
                                    <td>{report.companyName}</td>
                                    <td>{report.reportedByEmail}</td>
                                    <td>{getReasonText(report.reason)}</td>
                                    <td>
                                        <div className={styles.statusCell}>
                                            {getStatusIcon(report.status)}                                            <select
                                                value={report.status}
                                                onChange={(e) => handleStatusChange(report.id, e.target.value)}
                                                className={styles.statusSelect}
                                            >
                                                <option value="pending">Đang chờ xử lý</option>
                                                <option value="resolved">Đã xử lý</option>
                                                <option value="reviewed">Đã xem xét</option>
                                            </select>
                                        </div>
                                    </td>
                                    <td>{new Date(report.createdAt).toLocaleDateString('vi-VN')}</td>
                                    <td>
                                        <div className={styles.actions}>
                                            <button
                                                onClick={() => handleViewDetail(report.id)}
                                                className={styles.actionButton}
                                                title="Xem chi tiết"
                                            >
                                                <FaEye />
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setReportToDelete(report);
                                                    setShowDeleteModal(true);
                                                }}
                                                className={styles.deleteButton}
                                                title="Xóa báo cáo"
                                            >
                                                <FaTrash />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className={styles.pagination}>
                    <button
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                        className={styles.paginationButton}
                    >
                        Trước
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                        <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`${styles.paginationButton} ${page === currentPage ? styles.active : ''}`}
                        >
                            {page}
                        </button>
                    ))}

                    <button
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                        className={styles.paginationButton}
                    >
                        Sau
                    </button>
                </div>
            )}

            {/* Detail Modal */}
            {showDetailModal && selectedReport && (
                <div className={styles.modal}>
                    <div className={styles.modalContent}>
                        <div className={styles.modalHeader}>
                            <h2>Chi tiết báo cáo #{selectedReport.id}</h2>
                            <button
                                onClick={() => setShowDetailModal(false)}
                                className={styles.closeButton}
                            >
                                <FaTimes />
                            </button>
                        </div>

                        <div className={styles.modalBody}>
                            <div className={styles.detailSection}>
                                <h3>Thông tin công việc</h3>
                                <p><strong>Tiêu đề:</strong> {selectedReport.jobPost.title}</p>
                                <p><strong>Công ty:</strong> {selectedReport.jobPost.company}</p>
                                <p><strong>Ngày đăng:</strong> {new Date(selectedReport.jobPost.createdAt).toLocaleDateString('vi-VN')}</p>
                            </div>

                            <div className={styles.detailSection}>
                                <h3>Thông tin người báo cáo</h3>
                                <p><strong>Email:</strong> {selectedReport.reportedBy.email}</p>
                                <p><strong>Tên:</strong> {selectedReport.reportedBy.username}</p>
                            </div>

                            <div className={styles.detailSection}>
                                <h3>Chi tiết báo cáo</h3>
                                <p><strong>Lý do:</strong> {getReasonText(selectedReport.reason)}</p>
                                <p><strong>Mô tả:</strong> {selectedReport.description}</p>
                                <p><strong>Trạng thái:</strong> {getStatusText(selectedReport.status)}</p>
                                <p><strong>Ngày tạo:</strong> {new Date(selectedReport.createdAt).toLocaleDateString('vi-VN')}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && reportToDelete && (
                <div className={styles.modal}>
                    <div className={styles.modalContent}>
                        <div className={styles.modalHeader}>
                            <h2>Xác nhận xóa báo cáo</h2>
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className={styles.closeButton}
                            >
                                <FaTimes />
                            </button>
                        </div>

                        <div className={styles.modalBody}>
                            <p>Bạn có chắc chắn muốn xóa báo cáo #{reportToDelete.id}?</p>
                            <p>Hành động này không thể hoàn tác.</p>

                            <div className={styles.modalActions}>
                                <button
                                    onClick={() => setShowDeleteModal(false)}
                                    className={styles.cancelButton}
                                >
                                    Hủy
                                </button>
                                <button
                                    onClick={handleDeleteReport}
                                    className={styles.confirmDeleteButton}
                                >
                                    Xóa
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReportManager;
