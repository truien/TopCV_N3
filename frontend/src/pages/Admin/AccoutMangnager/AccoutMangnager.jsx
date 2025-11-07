import { useEffect, useState, useMemo, useCallback } from "react";
import {
    MdDelete,
    MdOutlineClose,
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
    MdChevronRight,
    MdPersonAdd,
    MdBusiness,
    MdSecurity,
    MdFilterAlt,
    MdSort,
    MdMoreVert,
    MdInfo,
    MdWarning,
    MdEmail
} from "react-icons/md";
import { FaFileExcel, FaUsers, FaUserShield, FaUserTie, FaChartLine } from "react-icons/fa";
import { HiSparkles, HiShieldCheck, HiTrendingUp } from "react-icons/hi";
import * as XLSX from 'xlsx';
import { toast } from "react-toastify";
import debounce from 'lodash.debounce';
import styles from "./AccountManager.module.css";
import { getAllUsers, deleteUser, register, getUserStats } from '@/api/authApi';

function AccountManager() {
    // State management
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
    const [newUser, setNewUser] = useState({
        name: "",
        email: "",
        password: "",
        roleId: 3 // Default to candidate
    });
    const [roleFilter, setRoleFilter] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all");
    const [showFilters, setShowFilters] = useState(false);
    const [searchInput, setSearchInput] = useState("");
    const [validationErrors, setValidationErrors] = useState({});
    const [isExporting, setIsExporting] = useState(false);
    const [loadingRefresh, setLoadingRefresh] = useState(false);
    const [loadingUsers, setLoadingUsers] = useState(false);


    const fetchUsers = useCallback(async (pageNum = page, searchTerm = search) => {
        setLoadingUsers(true);
        try {
            const res = await getAllUsers(pageNum, searchTerm);
            if (res && res.users) {
                setUsers(res.users);
                setTotalPages(res.totalPages || 1);
                setError(null);
            } else {
                setUsers([]);
                setTotalPages(1);
                setError("Không có dữ liệu người dùng");
            }
        } catch (err) {
            console.error('Error fetching users:', err);
            setError(err.message || "Lỗi kết nối đến server.");
            setUsers([]);
            setTotalPages(1);
            toast.error("Lỗi khi tải danh sách người dùng");
        } finally {
            setLoadingUsers(false);
        }
    }, [page, search]);

    // Initial load with comprehensive error handling
    useEffect(() => {
        const initializeData = async () => {
            setLoading(true);
            try {
                const [usersRes, statsData] = await Promise.allSettled([
                    getAllUsers(1, ""),
                    getUserStats()
                ]);

                // Handle users data
                if (usersRes.status === 'fulfilled' && usersRes.value?.users) {
                    setUsers(usersRes.value.users);
                    setTotalPages(usersRes.value.totalPages || 1);
                } else {
                    setUsers([]);
                    setTotalPages(1);
                    console.warn('Failed to load users:', usersRes.reason);
                }

                // Handle stats data
                if (statsData.status === 'fulfilled' && statsData.value) {
                    setStats(statsData.value);
                } else {
                    console.warn('Failed to load stats:', statsData.reason);
                    setStats({
                        totalUsers: 0,
                        newUsersThisMonth: 0,
                        activeUsers: 0,
                        roleStats: []
                    });
                }

                setError(null);
            } catch (err) {
                console.error('Initialization error:', err);
                setError(err.message || "Lỗi kết nối đến server.");
                setUsers([]);
                setStats(null);
            } finally {
                setLoading(false);
            }
        };

        initializeData();
    }, []);

    // Watch for page/search changes
    useEffect(() => {
        if (!loading) {
            fetchUsers(page, search);
        }
    }, [page, search, loading, fetchUsers]);

    // Fetch stats with error handling
    const fetchStats = async () => {
        try {
            const data = await getUserStats();
            setStats(data || {
                totalUsers: 0,
                newUsersThisMonth: 0,
                activeUsers: 0,
                roleStats: []
            });
        } catch (err) {
            console.error('Error fetching stats:', err);
            toast.error("Lỗi khi lấy thống kê người dùng.");
        }
    };

    // Debounced search with error handling
    const debouncedSearch = useMemo(
        () => debounce((searchTerm) => {
            try {
                setSearch(searchTerm);
                setPage(1);
            } catch (err) {
                console.error('Search error:', err);
                toast.error("Lỗi khi tìm kiếm");
            }
        }, 500),
        []
    );

    // Enhanced form validation
    const validateUser = (user) => {
        const errors = {};

        if (!user.name?.trim()) {
            errors.name = "Tên người dùng không được để trống";
        } else if (user.name.length < 2) {
            errors.name = "Tên người dùng phải có ít nhất 2 ký tự";
        } else if (user.name.length > 100) {
            errors.name = "Tên người dùng không được quá 100 ký tự";
        }

        if (!user.email?.trim()) {
            errors.email = "Email không được để trống";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.email)) {
            errors.email = "Email không hợp lệ";
        } else if (user.email.length > 255) {
            errors.email = "Email không được quá 255 ký tự";
        }

        if (!user.password?.trim()) {
            errors.password = "Mật khẩu không được để trống";
        } else if (user.password.length < 6) {
            errors.password = "Mật khẩu phải có ít nhất 6 ký tự";
        } else if (user.password.length > 128) {
            errors.password = "Mật khẩu không được quá 128 ký tự";
        }

        if (!user.roleId || ![1, 2, 3].includes(parseInt(user.roleId))) {
            errors.roleId = "Vui lòng chọn vai trò hợp lệ";
        }

        return errors;
    };

    // Export functionality with error handling
    const exportUsers = async () => {
        if (isExporting) return;

        setIsExporting(true);
        try {
            const allUsers = await getAllUsers(1, "", 1000);
            if (allUsers?.users?.length > 0) {
                exportToExcel(allUsers.users);
                toast.success("Xuất file Excel thành công!");
            } else {
                toast.warning("Không có dữ liệu để xuất");
            }
        } catch (err) {
            console.error('Export error:', err);
            toast.error("Lỗi khi xuất dữ liệu: " + (err.message || "Không xác định"));
        } finally {
            setIsExporting(false);
        }
    };

    const exportToExcel = (data) => {
        try {
            if (!data || data.length === 0) {
                toast.warning('Không có dữ liệu để xuất');
                return;
            }

            const exportData = data.map((user, index) => ({
                'STT': index + 1,
                'ID': user.id || 'N/A',
                'Tên người dùng': user.username || 'N/A',
                'Email': user.email || 'N/A',
                'Vai trò': user.role || 'N/A',
                'Ngày tạo': user.createdAt ? new Date(user.createdAt).toLocaleDateString('vi-VN') : 'N/A',
                'Trạng thái': user.isActive !== false ? 'Hoạt động' : 'Không hoạt động'
            }));

            // Summary data
            const summaryData = [
                { 'Thống kê': 'Tổng số người dùng', 'Giá trị': stats?.totalUsers || 0 },
                { 'Thống kê': 'Người dùng hoạt động', 'Giá trị': stats?.activeUsers || 0 },
                { 'Thống kê': 'Người dùng mới tháng này', 'Giá trị': stats?.newUsersThisMonth || 0 },
                { 'Thống kê': 'Đang hiển thị', 'Giá trị': data.length }
            ];

            const workbook = XLSX.utils.book_new();

            // Create summary sheet
            const summarySheet = XLSX.utils.json_to_sheet(summaryData);
            summarySheet['!cols'] = [{ wch: 25 }, { wch: 15 }];
            XLSX.utils.book_append_sheet(workbook, summarySheet, 'Thống kê tổng quan');

            // Create detail sheet
            const detailSheet = XLSX.utils.json_to_sheet(exportData);
            detailSheet['!cols'] = [
                { wch: 8 },  // STT
                { wch: 10 }, // ID
                { wch: 25 }, // Tên
                { wch: 30 }, // Email
                { wch: 15 }, // Vai trò
                { wch: 15 }, // Ngày tạo
                { wch: 15 }  // Trạng thái
            ];
            XLSX.utils.book_append_sheet(workbook, detailSheet, 'Danh sách người dùng');

            const fileName = `danh_sach_nguoi_dung_${new Date().toISOString().split('T')[0]}.xlsx`;
            XLSX.writeFile(workbook, fileName);
        } catch (err) {
            console.error('Excel export error:', err);
            toast.error("Lỗi khi tạo file Excel");
        }
    };

    // Refresh data with loading state
    const refreshData = async () => {
        if (loadingRefresh) return;

        setLoadingRefresh(true);
        try {
            await Promise.all([
                fetchUsers(page, search),
                fetchStats()
            ]);
            toast.success("Dữ liệu đã được làm mới!");
        } catch (err) {
            console.error('Refresh error:', err);
            toast.error("Lỗi khi làm mới dữ liệu");
        } finally {
            setLoadingRefresh(false);
        }
    };

    // Filter users with safety checks
    const filteredUsers = useMemo(() => {
        if (!Array.isArray(users)) return [];

        return users.filter(user => {
            if (!user) return false;

            const roleMatch = roleFilter === "all" || user.role === roleFilter;
            const statusMatch = statusFilter === "all" ||
                (statusFilter === "active" && user.isActive !== false) ||
                (statusFilter === "inactive" && user.isActive === false);
            return roleMatch && statusMatch;
        });
    }, [users, roleFilter, statusFilter]);

    // Handle search with validation
    const handleSearch = (e) => {
        try {
            const value = e.target.value;
            if (value.length <= 255) { // Prevent extremely long searches
                setSearchInput(value);
                debouncedSearch(value);
            }
        } catch (err) {
            console.error('Search handling error:', err);
        }
    };

    // Enhanced user action handlers with analytics
    const handleSearchWithTracking = (e) => {
        handleSearch(e);
        if (e.target.value) {
            console.log('[Analytics] Search performed:', { query: e.target.value });
        }
    };

    const handleAddUserWithTracking = async () => {
        console.log('[Analytics] Add user initiated');
        await handleAddUser();
        console.log('[Analytics] Add user completed');
    };

    const handleDeleteWithTracking = async () => {
        console.log('[Analytics] Delete user initiated:', { userId: selectedUser?.id });
        await handleDelete();
        console.log('[Analytics] Delete user completed');
    };

    // Add user with comprehensive validation
    const handleAddUser = async () => {
        if (loadingUsers) return;

        const errors = validateUser(newUser);
        setValidationErrors(errors);

        if (Object.keys(errors).length > 0) {
            toast.error("Vui lòng kiểm tra lại thông tin!");
            return;
        }

        try {
            await register(newUser);
            toast.success("Thêm người dùng thành công!");
            setShowAddModal(false);
            setNewUser({ name: "", email: "", password: "", roleId: 3 });
            setValidationErrors({});
            await Promise.all([fetchStats(), fetchUsers(page, search)]);
        } catch (err) {
            console.error('Add user error:', err);
            toast.error(err.message || "Lỗi khi thêm người dùng.");
        }
    };

    // Delete user with safety checks
    const handleDelete = async () => {
        if (!selectedUser?.id || loadingDelete) return;

        setLoadingDelete(true);
        try {
            await deleteUser(selectedUser.id);
            toast.success("Xóa thành công!");
            setShowModal(false);
            setSelectedUser(null);
            await Promise.all([fetchStats(), fetchUsers(page, search)]);
        } catch (err) {
            console.error('Delete error:', err);
            toast.error(err.message || "Lỗi khi xóa người dùng.");
        } finally {
            setLoadingDelete(false);
        }
    };

    // Handle pagination with bounds checking
    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages && !loadingUsers) {
            setPage(newPage);
        }
    };

    // Reset filters
    const resetFilters = () => {
        setSearch("");
        setSearchInput("");
        setRoleFilter("all");
        setStatusFilter("all");
        setPage(1);
    };

    // Get role display name
    const getRoleDisplayName = (role) => {
        switch (role) {
            case 'admin':
                return 'Quản trị viên';
            case 'employer':
                return 'Nhà tuyển dụng';
            case 'candidate':
                return 'Ứng viên';
            default:
                return role || 'N/A';
        }
    };

    // Loading state
    if (loading) {
        return (
            <div className={styles.pageContainer}>
                <div className={styles.pageLoader}>
                    <div className={styles.loaderSpinner}></div>
                    <div className={styles.loaderText}>
                        Đang tải dữ liệu quản lý tài khoản
                    </div>
                    <div className={styles.loaderSubtext}>
                        Vui lòng đợi trong giây lát...
                    </div>
                </div>
            </div>
        );
    }

    // Error state with retry option
    if (error && !users.length) {
        return (
            <div className={styles.pageContainer}>
                <div className={styles.pageLoader}>
                    <div className={styles.noDataIcon}>
                        <MdWarning />
                    </div>
                    <div className={styles.loaderText}>
                        Có lỗi xảy ra
                    </div>
                    <div className={styles.loaderSubtext}>
                        {error}
                    </div>
                    <button
                        className={styles.resetButton}
                        onClick={() => window.location.reload()}
                    >
                        Thử lại
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.pageContainer}>
            <div className={styles.contentWrapper}>
                {/* Header Section */}
                <div className={styles.header}>
                    <div className={styles.headerContent}>
                        <div className={styles.titleSection}>
                            <div className={styles.titleWrapper}>
                                <div className={styles.iconContainer}>
                                    <MdAdminPanelSettings className={styles.titleIcon} />
                                </div>
                                <div className={styles.titleInfo}>
                                    <h1 className={styles.title}>Quản lý tài khoản</h1>
                                    <p className={styles.subtitle}>
                                        Quản lý và theo dõi tất cả người dùng trong hệ thống TopCV
                                    </p>
                                </div>
                            </div>
                            <div className={styles.headerActions}>                                <button
                                className={styles.primaryButton}
                                onClick={() => setShowAddModal(true)}
                                disabled={loadingUsers}
                                title="Thêm người dùng mới (Ctrl+N)"
                            >
                                <MdPersonAdd />
                                Thêm người dùng
                            </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats Section */}
                {/* {stats && (
                    <div className={styles.statsGrid}>
                        <div className={`${styles.statCard} ${styles.statCardprimaryStat}`}>
                            <div className={styles.statIcon}>
                                <FaUsers />
                            </div>
                            <div className={styles.statContent}>
                                <div className={styles.statHeader}>
                                    <h3>Tổng người dùng</h3>
                                    <span className={styles.statTrend}>
                                        <HiTrendingUp />
                                        +12%
                                    </span>
                                </div>
                                <p className={styles.statNumber}>{stats.totalUsers || 0}</p>
                                <span className={styles.statLabel}>Tài khoản đã đăng ký</span>
                            </div>
                        </div>

                        <div className={`${styles.statCard} ${styles.statCardsuccessStat}`}>
                            <div className={styles.statIcon}>
                                <HiSparkles />
                            </div>
                            <div className={styles.statContent}>
                                <div className={styles.statHeader}>
                                    <h3>Người dùng mới</h3>
                                    <span className={styles.statBadge}>Tháng này</span>
                                </div>
                                <p className={styles.statNumber}>{stats.newUsersThisMonth || 0}</p>
                                <span className={styles.statLabel}>Đăng ký trong tháng</span>
                            </div>
                        </div>

                        <div className={`${styles.statCard} ${styles.statCardinfoStat}`}>
                            <div className={styles.statIcon}>
                                <FaChartLine />
                            </div>
                            <div className={styles.statContent}>
                                <div className={styles.statHeader}>
                                    <h3>Hoạt động</h3>
                                    <span className={`${styles.statusIndicator} ${styles.active}`}></span>
                                </div>
                                <p className={styles.statNumber}>{stats.activeUsers || 0}</p>
                                <span className={styles.statLabel}>Người dùng hoạt động</span>
                            </div>
                        </div>

                        <div className={`${styles.statCard} ${styles.statCardroleCard}`}>
                            <div className={styles.statIcon}>
                                <HiShieldCheck />
                            </div>
                            <div className={styles.statContent}>
                                <h3>Phân bổ vai trò</h3>
                                <div className={styles.roleStats}>
                                    {stats.roleStats && Array.isArray(stats.roleStats) && stats.roleStats.length > 0 ? (
                                        stats.roleStats.map((role) => (
                                            <div key={role.roleId} className={styles.roleItem}>
                                                <div className={styles.roleInfo}>
                                                    <div className={styles.roleIcon}>
                                                        {role.roleName === 'admin' && <FaUserShield />}
                                                        {role.roleName === 'employer' && <FaUserTie />}
                                                        {role.roleName === 'candidate' && <FaUsers />}
                                                    </div>
                                                    <span className={styles.roleName}>
                                                        {getRoleDisplayName(role.roleName)}
                                                    </span>
                                                </div>
                                                <span className={styles.roleCount}>{role.count || 0}</span>
                                            </div>
                                        ))
                                    ) : (
                                        <div className={styles.roleItem}>
                                            <span className={styles.roleName}>Không có dữ liệu</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )} */}

                {/* Main Content */}
                <div className={styles.mainContent}>
                    {/* Toolbar */}
                    <div className={styles.toolbar}>
                        <div className={styles.toolbarLeft}>
                            <div className={styles.searchContainer}>
                                <div className={styles.searchWrapper}>
                                    <MdSearch className={styles.searchIcon} />                                    <input
                                        type="text"
                                        placeholder="Tìm kiếm theo tên, email hoặc ID... (Ctrl+K)"
                                        value={searchInput}
                                        onChange={handleSearchWithTracking}
                                        className={styles.searchInput}
                                        disabled={loadingUsers}
                                        title="Nhấn Ctrl+K để focus vào ô tìm kiếm"
                                    />
                                    {searchInput && (
                                        <button
                                            className={styles.clearSearch}
                                            onClick={() => {
                                                setSearchInput("");
                                                setSearch("");
                                                setPage(1);
                                            }}
                                            disabled={loadingUsers}
                                        >
                                            <MdOutlineClose />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className={styles.toolbarRight}>
                            <div className={styles.actionGroup}>
                                <button
                                    className={`${styles.filterButton} ${showFilters ? styles.active : ''}`}
                                    onClick={() => setShowFilters(!showFilters)}
                                    title="Bộ lọc"
                                    disabled={loadingUsers}
                                >
                                    <MdFilterAlt />
                                    <span>Lọc</span>
                                    {(roleFilter !== "all" || statusFilter !== "all") && (
                                        <span className={styles.filterIndicator}></span>
                                    )}
                                </button>

                                <button
                                    className={styles.exportButton}
                                    onClick={exportUsers}
                                    disabled={isExporting || !filteredUsers.length}
                                    title="Xuất file Excel"
                                >
                                    <FaFileExcel />
                                    <span>{isExporting ? "Đang xuất..." : "Xuất Excel"}</span>
                                </button>

                                <button
                                    className={styles.refreshButton}
                                    onClick={refreshData}
                                    disabled={loadingRefresh || loadingUsers}
                                    title="Làm mới dữ liệu"
                                >
                                    <MdRefresh className={loadingRefresh ? styles.spinning : ""} />
                                    <span>Làm mới</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Filters */}
                    {showFilters && (
                        <div className={styles.filtersContainer}>
                            <div className={styles.filtersHeader}>
                                <div className={styles.filtersTitle}>
                                    <MdFilterList />
                                    <span>Bộ lọc nâng cao</span>
                                </div>
                                <button
                                    className={styles.clearFilters}
                                    onClick={resetFilters}
                                    disabled={loadingUsers}
                                >
                                    Xóa bộ lọc
                                </button>
                            </div>
                            <div className={styles.filtersGrid}>
                                <div className={styles.filterGroup}>
                                    <label className={styles.filterLabel}>
                                        <MdSecurity />
                                        Vai trò
                                    </label>
                                    <select
                                        value={roleFilter}
                                        onChange={(e) => setRoleFilter(e.target.value)}
                                        className={styles.filterSelect}
                                        disabled={loadingUsers}
                                    >
                                        <option value="all">Tất cả vai trò</option>
                                        <option value="admin">Quản trị viên</option>
                                        <option value="employer">Nhà tuyển dụng</option>
                                        <option value="candidate">Ứng viên</option>
                                    </select>
                                </div>

                                <div className={styles.filterGroup}>
                                    <label className={styles.filterLabel}>
                                        <MdInfo />
                                        Trạng thái
                                    </label>
                                    <select
                                        value={statusFilter}
                                        onChange={(e) => setStatusFilter(e.target.value)}
                                        className={styles.filterSelect}
                                        disabled={loadingUsers}
                                    >
                                        <option value="all">Tất cả trạng thái</option>
                                        <option value="active">Hoạt động</option>
                                        <option value="inactive">Không hoạt động</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Users Table */}
                    <div className={styles.tableSection}>
                        <div className={styles.tableHeader}>
                            <div className={styles.tableTitle}>
                                <h3>Danh sách người dùng</h3>
                                <span className={styles.resultCount}>
                                    {filteredUsers.length} kết quả
                                </span>
                            </div>
                        </div>

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
                                        <th>
                                            <div className={styles.tableHeaderCell}>
                                                ID
                                                <MdSort className={styles.sortIcon} />
                                            </div>
                                        </th>
                                        <th>
                                            <div className={styles.tableHeaderCell}>
                                                Thông tin người dùng
                                                <MdSort className={styles.sortIcon} />
                                            </div>
                                        </th>
                                        <th>
                                            <div className={styles.tableHeaderCell}>
                                                Vai trò
                                                <MdSort className={styles.sortIcon} />
                                            </div>
                                        </th>
                                        <th>
                                            <div className={styles.tableHeaderCell}>
                                                Trạng thái
                                                <MdSort className={styles.sortIcon} />
                                            </div>
                                        </th>
                                        <th>
                                            <div className={styles.tableHeaderCell}>
                                                Hành động
                                            </div>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {!loadingUsers && filteredUsers.length > 0 ? (
                                        filteredUsers.map((user) => (
                                            <tr key={user.id} className={styles.tableRow}>
                                                <td>
                                                    <div className={styles.idCell}>
                                                        <span className={styles.userId}>#{user.id}</span>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className={styles.userInfo}>
                                                        <div className={styles.avatarContainer}>
                                                            <img
                                                                src={user.avatar || "/src/assets/images/avatar-default.jpg"}
                                                                alt="avatar"
                                                                className={styles.avatar}
                                                                onError={(e) => {
                                                                    e.target.src = "/src/assets/images/avatar-default.jpg";
                                                                }}
                                                            />
                                                            <div className={styles.onlineIndicator}></div>
                                                        </div>
                                                        <div className={styles.userDetails}>
                                                            <span className={styles.username}>
                                                                {user.username || 'N/A'}
                                                            </span>
                                                            <span className={styles.email}>
                                                                {user.email || 'N/A'}
                                                            </span>
                                                            <span className={styles.joinDate}>
                                                                Tham gia: {user.createdAt ?
                                                                    new Date(user.createdAt).toLocaleDateString('vi-VN') :
                                                                    'N/A'
                                                                }
                                                            </span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className={styles.roleCell}>
                                                        <span className={`${styles.roleBadge} ${styles[user.role] || ''}`}>
                                                            <div className={styles.roleIcon}>
                                                                {user.role === 'admin' && <FaUserShield />}
                                                                {user.role === 'employer' && <FaUserTie />}
                                                                {user.role === 'candidate' && <FaUsers />}
                                                            </div>
                                                            <span>
                                                                {getRoleDisplayName(user.role)}
                                                            </span>
                                                        </span>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className={styles.statusCell}>
                                                        <span className={`${styles.statusBadge} ${user.isActive !== false ? styles.active : styles.inactive}`}>
                                                            <span className={styles.statusDot}></span>
                                                            {user.isActive !== false ? 'Hoạt động' : 'Không hoạt động'}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className={styles.actionCell}>
                                                        <div className={styles.actionButtons}>
                                                            <button
                                                                className={`${styles.actionBtn} ${styles.deleteBtn}`}
                                                                title="Xóa tài khoản"
                                                                onClick={() => {
                                                                    setSelectedUser(user);
                                                                    setShowModal(true);
                                                                }}
                                                                disabled={loadingUsers}
                                                            >
                                                                <MdDelete />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : !loadingUsers ? (
                                        <tr>
                                            <td colSpan="5" className={styles.noData}>
                                                <div className={styles.noDataContent}>
                                                    <div className={styles.noDataIcon}>
                                                        <MdPeople />
                                                    </div>
                                                    <div className={styles.noDataText}>
                                                        <h3>Không tìm thấy người dùng</h3>
                                                        <p>Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
                                                    </div>
                                                    <button
                                                        className={styles.resetButton}
                                                        onClick={resetFilters}
                                                    >
                                                        Đặt lại bộ lọc
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : null}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className={styles.pagination}>
                            <div className={styles.paginationInfo}>
                                <span className={styles.pageInfo}>
                                    Hiển thị <strong>{((page - 1) * 10) + 1}</strong> đến{" "}
                                    <strong>{Math.min(page * 10, filteredUsers.length)}</strong> trong{" "}
                                    <strong>{filteredUsers.length}</strong> kết quả
                                </span>
                            </div>

                            <div className={styles.paginationControls}>
                                <button
                                    disabled={page === 1 || loadingUsers}
                                    onClick={() => handlePageChange(1)}
                                    className={`${styles.pageButton} ${styles.pageEdge}`}
                                    title="Trang đầu"
                                >
                                    <MdFirstPage />
                                </button>
                                <button
                                    disabled={page === 1 || loadingUsers}
                                    onClick={() => handlePageChange(page - 1)}
                                    className={`${styles.pageButton} ${styles.pageNav}`}
                                    title="Trang trước"
                                >
                                    <MdChevronLeft />
                                    <span>Trước</span>
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
                                                onClick={() => handlePageChange(pageNum)}
                                                disabled={loadingUsers}
                                                className={`${styles.pageButton} ${styles.pageNumber} ${page === pageNum ? styles.activePage : ''}`}
                                            >
                                                {pageNum}
                                            </button>
                                        );
                                    })}
                                </div>

                                <button
                                    disabled={page === totalPages || loadingUsers}
                                    onClick={() => handlePageChange(page + 1)}
                                    className={`${styles.pageButton} ${styles.pageNav}`}
                                    title="Trang sau"
                                >
                                    <span>Sau</span>
                                    <MdChevronRight />
                                </button>
                                <button
                                    disabled={page === totalPages || loadingUsers}
                                    onClick={() => handlePageChange(totalPages)}
                                    className={`${styles.pageButton} ${styles.pageEdge}`}
                                    title="Trang cuối"
                                >
                                    <MdLastPage />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Delete Modal */}
            {showModal && selectedUser && (
                <div className={styles.modalOverlay}>
                    <div className={`${styles.modal} ${styles.deleteModal}`}>
                        <div className={styles.modalHeader}>
                            <div className={styles.modalTitleSection}>
                                <div className={styles.warningIconHeader}>
                                    <MdWarning />
                                </div>
                                <h3>Xác nhận xóa tài khoản</h3>
                            </div>
                            <button
                                className={styles.closeButton}
                                onClick={() => {
                                    setShowModal(false);
                                    setSelectedUser(null);
                                }}
                                disabled={loadingDelete}
                            >
                                <MdOutlineClose />
                            </button>
                        </div>
                        <div className={styles.modalBody}>
                            <div className={styles.deleteContent}>
                                <div className={styles.userPreview}>
                                    <img
                                        src={selectedUser?.avatar || "/src/assets/images/avatar-default.jpg"}
                                        alt="avatar"
                                        className={styles.previewAvatar}
                                        onError={(e) => {
                                            e.target.src = "/src/assets/images/avatar-default.jpg";
                                        }}
                                    />
                                    <div className={styles.previewInfo}>
                                        <span className={styles.previewName}>
                                            {selectedUser?.username || 'N/A'}
                                        </span>
                                        <span className={styles.previewEmail}>
                                            {selectedUser?.email || 'N/A'}
                                        </span>
                                        <span className={styles.previewRole}>
                                            {getRoleDisplayName(selectedUser?.role)}
                                        </span>
                                    </div>
                                </div>
                                <div className={styles.warningMessage}>
                                    <p>
                                        Bạn có chắc chắn muốn xóa tài khoản này không?
                                    </p>
                                    <div className={styles.warningDetails}>
                                        <div className={styles.warningItem}>
                                            <MdWarning />
                                            <span>Tất cả dữ liệu của người dùng sẽ bị xóa vĩnh viễn</span>
                                        </div>
                                        <div className={styles.warningItem}>
                                            <MdWarning />
                                            <span>Hành động này không thể hoàn tác</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className={styles.modalFooter}>
                            <button
                                className={styles.cancelButton}
                                onClick={() => {
                                    setShowModal(false);
                                    setSelectedUser(null);
                                }}
                                disabled={loadingDelete}
                            >
                                Hủy bỏ
                            </button>
                            <button
                                className={styles.confirmDeleteButton}
                                onClick={handleDeleteWithTracking}
                                disabled={loadingDelete}
                            >
                                {loadingDelete ? (
                                    <>
                                        <div className={styles.buttonSpinner}></div>
                                        Đang xóa...
                                    </>
                                ) : (
                                    <>
                                        <MdDelete />
                                        Xác nhận xóa
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add User Modal */}
            {showAddModal && (
                <div className={styles.modalOverlay}>
                    <div className={`${styles.modal} ${styles.addModal}`}>
                        <div className={styles.modalHeader}>
                            <div className={styles.modalTitleSection}>
                                <div className={styles.addIconHeader}>
                                    <MdPersonAdd />
                                </div>
                                <div>
                                    <h3>Thêm người dùng mới</h3>
                                    <p>Tạo tài khoản mới cho hệ thống TopCV</p>
                                </div>
                            </div>
                            <button
                                className={styles.closeButton}
                                onClick={() => {
                                    setShowAddModal(false);
                                    setNewUser({ name: "", email: "", password: "", roleId: 3 });
                                    setValidationErrors({});
                                }}
                            >
                                <MdOutlineClose />
                            </button>
                        </div>
                        <div className={styles.modalBody}>
                            <form className={styles.addUserForm} onSubmit={(e) => e.preventDefault()}>
                                <div className={styles.formRow}>
                                    <div className={styles.formGroup}>
                                        <label className={styles.formLabel}>
                                            <MdPeople />
                                            Tên người dùng *
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="Nhập tên người dùng"
                                            value={newUser.name}
                                            onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                                            className={`${styles.formInput} ${validationErrors.name ? styles.inputError : ''}`}
                                            maxLength="100"
                                        />
                                        {validationErrors.name && (
                                            <span className={styles.errorText}>
                                                <MdWarning />
                                                {validationErrors.name}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className={styles.formRow}>
                                    <div className={styles.formGroup}>
                                        <label className={styles.formLabel}>
                                            <MdEmail />
                                            Email *
                                        </label>
                                        <input
                                            type="email"
                                            placeholder="Nhập địa chỉ email"
                                            value={newUser.email}
                                            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                                            className={`${styles.formInput} ${validationErrors.email ? styles.inputError : ''}`}
                                            maxLength="255"
                                        />
                                        {validationErrors.email && (
                                            <span className={styles.errorText}>
                                                <MdWarning />
                                                {validationErrors.email}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className={styles.formRow}>
                                    <div className={styles.formGroup}>
                                        <label className={styles.formLabel}>
                                            <MdSecurity />
                                            Mật khẩu *
                                        </label>
                                        <input
                                            type="password"
                                            placeholder="Nhập mật khẩu (ít nhất 6 ký tự)"
                                            value={newUser.password}
                                            onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                                            className={`${styles.formInput} ${validationErrors.password ? styles.inputError : ''}`}
                                            maxLength="128"
                                        />
                                        {validationErrors.password && (
                                            <span className={styles.errorText}>
                                                <MdWarning />
                                                {validationErrors.password}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className={styles.formRow}>
                                    <div className={styles.formGroup}>
                                        <label className={styles.formLabel}>
                                            <MdAdminPanelSettings />
                                            Vai trò
                                        </label>
                                        <select
                                            value={newUser.roleId}
                                            onChange={(e) => setNewUser({ ...newUser, roleId: parseInt(e.target.value) })}
                                            className={styles.formSelect}
                                        >
                                            <option value={3}>Ứng viên</option>
                                            <option value={2}>Nhà tuyển dụng</option>
                                            <option value={1}>Quản trị viên</option>
                                        </select>
                                        {validationErrors.roleId && (
                                            <span className={styles.errorText}>
                                                <MdWarning />
                                                {validationErrors.roleId}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className={styles.roleDescription}>
                                    <div className={styles.roleDescItem}>
                                        <FaUsers />
                                        <div>
                                            <strong>Ứng viên:</strong> Có thể tìm kiếm và ứng tuyển việc làm
                                        </div>
                                    </div>
                                    <div className={styles.roleDescItem}>
                                        <FaUserTie />
                                        <div>
                                            <strong>Nhà tuyển dụng:</strong> Có thể đăng tin tuyển dụng và quản lý ứng viên
                                        </div>
                                    </div>
                                    <div className={styles.roleDescItem}>
                                        <FaUserShield />
                                        <div>
                                            <strong>Quản trị viên:</strong> Có quyền truy cập đầy đủ hệ thống
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div>
                        <div className={styles.modalFooter}>
                            <button
                                type="button"
                                className={styles.cancelButton}
                                onClick={() => {
                                    setShowAddModal(false);
                                    setNewUser({ name: "", email: "", password: "", roleId: 3 });
                                    setValidationErrors({});
                                }}
                            >
                                Hủy bỏ
                            </button>
                            <button
                                type="button"
                                className={styles.submitButton}
                                onClick={handleAddUserWithTracking}
                                disabled={loadingUsers}
                            >
                                <MdPersonAdd />
                                Tạo tài khoản
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AccountManager;
