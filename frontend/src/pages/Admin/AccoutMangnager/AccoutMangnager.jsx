import { useEffect, useState, useMemo, useCallback } from "react";
import {
    MdDelete,
    MdOutlineClose,
    MdAdd,
    MdPeople,
    MdTrendingUp,
    MdAdminPanelSettings,
    MdSearch,
    MdEdit,
    MdVisibility,
    MdFilterList,
    MdRefresh,
    MdFirstPage,
    MdLastPage,
    MdChevronLeft,
    MdChevronRight
} from "react-icons/md";
import { FaFileExcel } from "react-icons/fa";
import * as XLSX from 'xlsx';
import { toast } from "react-toastify";
import debounce from 'lodash.debounce';
import styles from "./AccountManager.module.css";
import { getAllUsers, deleteUser, register, getUserStats } from '@/api/authApi';

function AccountManager() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [loadingDelete, setLoadingDelete] = useState(false);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [search, setSearch] = useState("");
    const [stats, setStats] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newUser, setNewUser] = useState({ name: "", email: "", password: "", roleId: 2 });    // New states for enhanced features
    const [roleFilter, setRoleFilter] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all");
    const [showFilters, setShowFilters] = useState(false);
    const [searchInput, setSearchInput] = useState("");
    const [validationErrors, setValidationErrors] = useState({});
    const [isExporting, setIsExporting] = useState(false);
    const [loadingRefresh, setLoadingRefresh] = useState(false);
    const [loadingUsers, setLoadingUsers] = useState(false); // Separate loading state for users only    // Fetch users data function
    const fetchUsers = useCallback(async (pageNum = page, searchTerm = search) => {
        setLoadingUsers(true);
        try {
            const res = await getAllUsers(pageNum, searchTerm);
            setUsers(res.users);
            setTotalPages(res.totalPages);
            setError(null);
        } catch (err) {
            setError(err.message || "Lỗi kết nối đến server.");
            toast.error("Lỗi khi tải danh sách người dùng");
        } finally {
            setLoadingUsers(false);
        }
    }, [page, search]);    // Initial load with full loading state
    useEffect(() => {
        setLoading(true);
        Promise.all([
            getAllUsers(1, ""), // Start with page 1 and no search
            getUserStats()
        ]).then(([usersRes, statsData]) => {
            setUsers(usersRes.users);
            setTotalPages(usersRes.totalPages);
            setStats(statsData);
            setLoading(false);
        }).catch((err) => {
            setError(err.message || "Lỗi kết nối đến server.");
            setLoading(false);
        });
    }, []); // Only run once on mount// Watch for page/search changes and only reload users
    useEffect(() => {
        if (!loading) { // Don't run during initial load
            fetchUsers(page, search);
        }
    }, [page, search, loading, fetchUsers]); // Add fetchUsers as dependency

    const fetchStats = async () => {
        try {
            const data = await getUserStats();
            setStats(data);
        } catch {
            toast.error("Lỗi khi lấy thống kê người dùng.");
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);
    const debouncedSearch = useMemo(
        () => debounce((searchTerm) => {
            setSearch(searchTerm);
            setPage(1);
        }, 500),
        []
    );

    // Enhanced form validation
    const validateUser = (user) => {
        const errors = {};

        if (!user.name.trim()) {
            errors.name = "Tên người dùng không được để trống";
        } else if (user.name.length < 3) {
            errors.name = "Tên người dùng phải có ít nhất 3 ký tự";
        }

        if (!user.email.trim()) {
            errors.email = "Email không được để trống";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.email)) {
            errors.email = "Email không hợp lệ";
        }

        if (!user.password.trim()) {
            errors.password = "Mật khẩu không được để trống";
        } else if (user.password.length < 6) {
            errors.password = "Mật khẩu phải có ít nhất 6 ký tự";
        }

        return errors;
    };    // Export functionality
    const exportUsers = async () => {
        setIsExporting(true);
        try {
            const allUsers = await getAllUsers(1, "", 1000);
            exportToExcel(allUsers.users);
            toast.success("Xuất file Excel thành công!");
        } catch {
            toast.error("Lỗi khi xuất dữ liệu");
        } finally {
            setIsExporting(false);
        }
    };

    const exportToExcel = (data) => {
        if (data.length === 0) {
            toast.warning('Không có dữ liệu để xuất');
            return;
        }

        const exportData = data.map(user => ({
            'ID': user.id,
            'Tên người dùng': user.username,
            'Email': user.email,
            'Vai trò': user.role,
            'Ngày tạo': new Date(user.createdAt).toLocaleDateString('vi-VN'),
            'Trạng thái': user.isActive !== false ? 'Hoạt động' : 'Không hoạt động'
        }));

        // Thêm thống kê tổng quan
        const summaryData = [
            { 'Loại thống kê': 'Tổng số người dùng', 'Giá trị': stats?.totalUsers || 0 },
            { 'Loại thống kê': 'Người dùng hoạt động', 'Giá trị': stats?.activeUsers || 0 },
            { 'Loại thống kê': 'Admin', 'Giá trị': stats?.adminUsers || 0 },
            { 'Loại thống kê': 'Người dùng thường', 'Giá trị': stats?.regularUsers || 0 },
            { 'Loại thống kê': 'Đang hiển thị', 'Giá trị': data.length }
        ];

        const workbook = XLSX.utils.book_new();

        // Tạo sheet thống kê tổng quan
        const summarySheet = XLSX.utils.json_to_sheet(summaryData);
        summarySheet['!cols'] = [
            { wch: 25 }, // Loại thống kê
            { wch: 15 }  // Giá trị
        ];
        XLSX.utils.book_append_sheet(workbook, summarySheet, 'Thống kê');

        // Tạo sheet chi tiết người dùng
        const detailSheet = XLSX.utils.json_to_sheet(exportData);
        detailSheet['!cols'] = [
            { wch: 8 },  // ID
            { wch: 20 }, // Tên người dùng
            { wch: 25 }, // Email
            { wch: 15 }, // Vai trò
            { wch: 15 }, // Ngày tạo
            { wch: 15 }  // Trạng thái
        ];
        XLSX.utils.book_append_sheet(workbook, detailSheet, 'Danh sách người dùng');

        const fileName = `nguoi_dung_${new Date().toISOString().split('T')[0]}.xlsx`;
        XLSX.writeFile(workbook, fileName);
    }; const refreshData = async () => {
        setLoadingRefresh(true);
        try {
            await Promise.all([
                fetchUsers(page, search),
                fetchStats()
            ]);
            toast.success("Dữ liệu đã được cập nhật!");
        } catch {
            toast.error("Lỗi khi làm mới dữ liệu");
        } finally {
            setLoadingRefresh(false);
        }
    };

    // Filter users based on role and status
    const filteredUsers = useMemo(() => {
        let filtered = users;

        if (roleFilter !== "all") {
            filtered = filtered.filter(user => user.role === roleFilter);
        }

        if (statusFilter !== "all") {
            // Assuming we have an active/inactive status
            filtered = filtered.filter(user => {
                if (statusFilter === "active") return user.isActive !== false;
                if (statusFilter === "inactive") return user.isActive === false;
                return true;
            });
        }

        return filtered;
    }, [users, roleFilter, statusFilter]); const handleSearch = (e) => {
        const value = e.target.value;
        setSearchInput(value);
        debouncedSearch(value);
    };

    const handleAddUser = async () => {
        const errors = validateUser(newUser);
        setValidationErrors(errors);

        if (Object.keys(errors).length > 0) {
            toast.error("Vui lòng kiểm tra lại thông tin!");
            return;
        } try {
            await register(newUser);
            toast.success("Thêm người dùng thành công!");
            setShowAddModal(false);
            setNewUser({ name: "", email: "", password: "", roleId: 3 });
            setValidationErrors({});
            fetchStats();
            fetchUsers(page, search); // Use fetchUsers instead of direct API call
        } catch (err) {
            toast.error(err.message || "Lỗi khi thêm người dùng.");
        }
    };

    const handleDelete = async () => {
        if (!selectedUser) return;
        setLoadingDelete(true); try {
            await deleteUser(selectedUser.id);
            toast.success("Xóa thành công!");
            setShowModal(false);
            fetchStats();
            fetchUsers(page, search); // Refresh the users list from server
        } catch (err) {
            toast.error(err.message || "Lỗi khi xóa người dùng.");
        } finally {
            setLoadingDelete(false);
        }
    };

    if (loading) return <div className={styles.loader}>Đang tải...</div>;
    if (error) return <p>{error}</p>; return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.headerContent}>
                    <h1 className={styles.title}>
                        <MdAdminPanelSettings className={styles.titleIcon} />
                        Quản lý tài khoản
                    </h1>
                    <p className={styles.subtitle}>
                        Quản lý và theo dõi tất cả người dùng trong hệ thống
                    </p>
                </div>
            </div>

            {/* Stats Section */}
            {stats && (
                <div className={styles.statsGrid}>
                    <div className={styles.statCard}>
                        <div className={styles.statIcon}>
                            <MdPeople />
                        </div>
                        <div className={styles.statContent}>
                            <h3>Tổng người dùng</h3>
                            <p className={styles.statNumber}>{stats.totalUsers || 0}</p>
                            <span className={styles.statLabel}>Tài khoản đã đăng ký</span>
                        </div>
                    </div>

                    <div className={styles.statCard}>
                        <div className={styles.statIcon}>
                            <MdTrendingUp />
                        </div>
                        <div className={styles.statContent}>
                            <h3>Người dùng mới</h3>
                            <p className={styles.statNumber}>{stats.newUsersThisMonth || 0}</p>
                            <span className={styles.statLabel}>Trong tháng này</span>
                        </div>
                    </div>

                    <div className={styles.statCard}>
                        <div className={styles.statIcon}>
                            <MdAdminPanelSettings />
                        </div>
                        <div className={styles.statContent}>
                            <h3>Phân bổ vai trò</h3>
                            <div className={styles.roleStats}>
                                {stats.roleStats && stats.roleStats.map((role) => (
                                    <div key={role.roleId} className={styles.roleItem}>
                                        <span className={styles.roleName}>{role.roleName || 'Unknown'}</span>
                                        <span className={styles.roleCount}>{role.count || 0}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
            <div className={styles.mainContent}>
                {/* Search and Actions */}
                <div className={styles.toolbar}>
                    <div className={styles.searchContainer}>
                        <MdSearch className={styles.searchIcon} />
                        <input
                            type="text"
                            placeholder="Tìm kiếm theo tên hoặc email..."
                            value={searchInput}
                            onChange={handleSearch}
                            className={styles.searchInput}
                        />
                    </div>

                    <div className={styles.actionGroup}>
                        <button
                            className={styles.filterButton}
                            onClick={() => setShowFilters(!showFilters)}
                            title="Bộ lọc"
                        >
                            <MdFilterList />
                            Lọc
                        </button>                        <button
                            className={styles.exportButton}
                            onClick={exportUsers}
                            disabled={isExporting}
                            title="Xuất file Excel"
                        >
                            <FaFileExcel />
                            {isExporting ? "Đang xuất..." : "Xuất Excel"}
                        </button>

                        <button
                            className={styles.refreshButton}
                            onClick={refreshData}
                            disabled={loadingRefresh}
                            title="Làm mới"
                        >
                            <MdRefresh className={loadingRefresh ? styles.spinning : ""} />
                            Làm mới
                        </button>

                        <button className={styles.addButton} onClick={() => setShowAddModal(true)}>
                            <MdAdd />
                            Thêm người dùng
                        </button>
                    </div>
                </div>

                {/* Filters */}
                {showFilters && (
                    <div className={styles.filtersContainer}>
                        <div className={styles.filterGroup}>
                            <label>Lọc theo vai trò:</label>
                            <select
                                value={roleFilter}
                                onChange={(e) => setRoleFilter(e.target.value)}
                                className={styles.filterSelect}
                            >
                                <option value="all">Tất cả vai trò</option>
                                <option value="employer">Employer</option>
                                <option value="candidate">Candidate</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>

                        <div className={styles.filterGroup}>
                            <label>Lọc theo trạng thái:</label>
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className={styles.filterSelect}
                            >
                                <option value="all">Tất cả trạng thái</option>
                                <option value="active">Hoạt động</option>
                                <option value="inactive">Không hoạt động</option>
                            </select>
                        </div>
                    </div>
                )}                {/* Users Table */}
                <div className={styles.tableContainer}>
                    {loadingUsers && (
                        <div className={styles.tableLoadingOverlay}>
                            <div className={styles.tableLoader}>
                                <div className={styles.spinner}></div>
                                <span>Đang tải danh sách người dùng...</span>
                            </div>
                        </div>
                    )}
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Người dùng</th>
                                <th>Email</th>
                                <th>Vai trò</th>
                                <th>Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {!loadingUsers && filteredUsers.length > 0 ? (
                                filteredUsers.map((user) => (
                                    <tr key={user.id} className={styles.tableRow}>
                                        <td>
                                            <span className={styles.userId}>#{user.id}</span>
                                        </td>
                                        <td>
                                            <div className={styles.userInfo}>
                                                <img
                                                    src={user.avatar || "/src/assets/images/avatar-default.jpg"}
                                                    alt="avatar"
                                                    className={styles.avatar}
                                                />
                                                <div className={styles.userDetails}>
                                                    <span className={styles.username}>{user.username}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <span className={styles.email}>{user.email}</span>
                                        </td>
                                        <td>
                                            <span className={`${styles.roleBadge} ${styles[`role${user.role}`]}`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td>
                                            <div className={styles.actionButtons}>
                                                <button className={styles.viewButton} title="Xem chi tiết">
                                                    <MdVisibility />
                                                </button>
                                                <button className={styles.editButton} title="Chỉnh sửa">
                                                    <MdEdit />
                                                </button>
                                                <button
                                                    className={styles.deleteButton}
                                                    title="Xóa"
                                                    onClick={() => {
                                                        setSelectedUser(user);
                                                        setShowModal(true);
                                                    }}
                                                >
                                                    <MdDelete />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))) : !loadingUsers ? (
                                    <tr>
                                        <td colSpan="5" className={styles.noData}>
                                            <div className={styles.noDataContent}>
                                                <MdPeople className={styles.noDataIcon} />
                                                <p>Không có dữ liệu người dùng</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : null}
                        </tbody>
                    </table>
                </div>                {/* Enhanced Pagination */}
                <div className={styles.pagination}>
                    <button
                        disabled={page === 1 || loadingUsers}
                        onClick={() => setPage(1)}
                        className={styles.paginationButton}
                        title="Trang đầu"
                    >
                        <MdFirstPage />
                    </button>
                    <button
                        disabled={page === 1 || loadingUsers}
                        onClick={() => setPage(page - 1)}
                        className={styles.paginationButton}
                        title="Trang trước"
                    >
                        <MdChevronLeft />
                    </button>

                    <div className={styles.pageNumbers}>
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                            let pageNum;
                            if (totalPages <= 5) {
                                pageNum = i + 1;
                            } else if (page <= 3) {
                                pageNum = i + 1;
                            } else if (page >= totalPages - 2) {
                                pageNum = totalPages - 4 + i;
                            } else {
                                pageNum = page - 2 + i;
                            }

                            return (
                                <button
                                    key={pageNum}
                                    onClick={() => setPage(pageNum)}
                                    disabled={loadingUsers}
                                    className={`${styles.pageButton} ${page === pageNum ? styles.activePage : ''}`}
                                >
                                    {pageNum}
                                </button>
                            );
                        })}
                    </div>

                    <button
                        disabled={page === totalPages || loadingUsers}
                        onClick={() => setPage(page + 1)}
                        className={styles.paginationButton}
                        title="Trang sau"
                    >
                        <MdChevronRight />
                    </button>
                    <button
                        disabled={page === totalPages || loadingUsers}
                        onClick={() => setPage(totalPages)}
                        className={styles.paginationButton}
                        title="Trang cuối"
                    >
                        <MdLastPage />
                    </button>

                    <div className={styles.pageInfo}>
                        <span>Trang {page} / {totalPages}</span>
                        <span className={styles.totalInfo}>
                            Tổng: {filteredUsers.length} người dùng
                        </span>
                    </div>
                </div>
            </div>

            {/* Delete Modal */}
            {showModal && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modal}>
                        <div className={styles.modalHeader}>
                            <h3>Xác nhận xóa tài khoản</h3>
                            <button className={styles.closeButton} onClick={() => setShowModal(false)}>
                                <MdOutlineClose />
                            </button>
                        </div>
                        <div className={styles.modalBody}>
                            <div className={styles.warningIcon}>⚠️</div>
                            <p>
                                Bạn có chắc chắn muốn xóa tài khoản <strong>{selectedUser?.username}</strong> không?
                            </p>
                            <p className={styles.warningText}>
                                Hành động này không thể hoàn tác!
                            </p>
                        </div>
                        <div className={styles.modalFooter}>
                            <button className={styles.cancelButton} onClick={() => setShowModal(false)}>
                                Hủy
                            </button>
                            <button
                                className={styles.confirmDeleteButton}
                                onClick={handleDelete}
                                disabled={loadingDelete}
                            >
                                {loadingDelete ? "Đang xóa..." : "Xác nhận xóa"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add User Modal */}
            {showAddModal && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modal}>
                        <div className={styles.modalHeader}>
                            <h3>Thêm người dùng mới</h3>
                            <button className={styles.closeButton} onClick={() => setShowAddModal(false)}>
                                <MdOutlineClose />
                            </button>
                        </div>                        <div className={styles.modalBody}>
                            <div className={styles.formGroup}>
                                <label className={styles.formGroup_label}>Tên người dùng *</label>
                                <input
                                    type="text"
                                    placeholder="Nhập tên người dùng"
                                    value={newUser.name}
                                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                                    className={`${styles.formInput} ${validationErrors.name ? styles.inputError : ''}`}
                                />
                                {validationErrors.name && (
                                    <span className={styles.errorText}>{validationErrors.name}</span>
                                )}
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.formGroup_label}>Email *</label>
                                <input
                                    type="email"
                                    placeholder="Nhập địa chỉ email"
                                    value={newUser.email}
                                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                                    className={`${styles.formInput} ${validationErrors.email ? styles.inputError : ''}`}
                                />
                                {validationErrors.email && (
                                    <span className={styles.errorText}>{validationErrors.email}</span>
                                )}
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.formGroup_label}>Mật khẩu *</label>
                                <input
                                    type="password"
                                    placeholder="Nhập mật khẩu (ít nhất 6 ký tự)"
                                    value={newUser.password}
                                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                                    className={`${styles.formInput} ${validationErrors.password ? styles.inputError : ''}`}
                                />
                                {validationErrors.password && (
                                    <span className={styles.errorText}>{validationErrors.password}</span>
                                )}
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.formGroup_label}>Vai trò</label>
                                <select
                                    value={newUser.roleId}
                                    onChange={(e) => setNewUser({ ...newUser, roleId: parseInt(e.target.value) })}
                                    className={styles.formSelect}
                                >
                                    <option value={2}>admin</option>
                                    <option value={1}>employer</option>
                                    <option value={3}>candidate</option>
                                </select>
                            </div>
                        </div>
                        <div className={styles.modalFooter}>
                            <button className={styles.cancelButton} onClick={() => setShowAddModal(false)}>
                                Hủy
                            </button>
                            <button className={styles.submitButton} onClick={handleAddUser}>
                                Thêm người dùng
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AccountManager;
