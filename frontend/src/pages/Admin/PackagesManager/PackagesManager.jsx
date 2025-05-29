import { useEffect, useState } from "react";
import styles from "./PackagesManager.module.css";
import {
    FaEdit,
    FaTrash,
    FaPlus,
    FaSearch,
    FaSort,
    FaSortUp,
    FaSortDown,
    FaChartBar,
    FaBox,
    FaMoneyBillWave,
    FaClock,
    FaEye,
    FaFilter,
    FaFileExcel,
    FaSync
} from "react-icons/fa";
import * as XLSX from 'xlsx';
import {
    getAllPackages,
    getPackageStatistics,
    deletePackage,
    createPackage,
    updatePackage,
} from "@/api/packagesApi";
import { toast } from "react-toastify";

function PackagesManager() {
    const [packages, setPackages] = useState([]);
    const [filteredPackages, setFilteredPackages] = useState([]);
    const [statistics, setStatistics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [sortField, setSortField] = useState("id");
    const [sortDirection, setSortDirection] = useState("asc");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [showModal, setShowModal] = useState(false);
    const [editingPackage, setEditingPackage] = useState(null);
    const [packageForm, setPackageForm] = useState({
        name: "",
        description: "",
        price: "",
        durationDays: "",
        highlightType: "",
        priorityLevel: "",
        autoBoostDaily: false
    }); useEffect(() => {
        fetchPackages();
        fetchStatistics();
    }, []);

    // Combined effect for search and sort to avoid infinite loops
    useEffect(() => {
        let filtered = packages;

        // Apply search filter
        if (searchTerm.trim()) {
            filtered = packages.filter(pkg =>
                pkg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                pkg.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                pkg.price.toString().includes(searchTerm)
            );
        }

        // Apply sorting
        const sorted = [...filtered].sort((a, b) => {
            let aValue = a[sortField];
            let bValue = b[sortField];

            if (typeof aValue === 'string') {
                aValue = aValue.toLowerCase();
                bValue = bValue.toLowerCase();
            }

            if (sortDirection === 'asc') {
                return aValue > bValue ? 1 : -1;
            } else {
                return aValue < bValue ? 1 : -1;
            }
        });

        setFilteredPackages(sorted);
        setCurrentPage(1); // Reset to first page when filter/sort changes
    }, [packages, searchTerm, sortField, sortDirection]); const fetchPackages = async () => {
        setLoading(true);
        try {
            const data = await getAllPackages();
            setPackages(data);
        } catch {
            toast.error("Không thể tải danh sách gói.");
        } finally {
            setLoading(false);
        }
    };

    const fetchStatistics = async () => {
        try {
            const data = await getPackageStatistics();
            setStatistics(data);
        } catch {
            toast.error("Không thể tải thống kê.");
        }
    };

    const handleSortClick = (field) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    const getSortIcon = (field) => {
        if (sortField !== field) return <FaSort />;
        return sortDirection === 'asc' ? <FaSortUp /> : <FaSortDown />;
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Bạn có chắc muốn xóa gói này?")) return;
        try {
            await deletePackage(id);
            toast.success("Đã xóa gói!");
            fetchPackages();
            fetchStatistics();
        } catch {
            toast.error("Lỗi khi xóa.");
        }
    };

    const openModal = (pkg = null) => {
        if (pkg) {
            setEditingPackage(pkg);
            setPackageForm({
                name: pkg.name,
                description: pkg.description || "",
                price: pkg.price.toString(),
                durationDays: pkg.durationDays.toString(),
                highlightType: pkg.highlightType || "",
                priorityLevel: pkg.priorityLevel?.toString() || "",
                autoBoostDaily: pkg.autoBoostDaily || false
            });
        } else {
            setEditingPackage(null);
            setPackageForm({
                name: "",
                description: "",
                price: "",
                durationDays: "",
                highlightType: "",
                priorityLevel: "",
                autoBoostDaily: false
            });
        }
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingPackage(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const packageData = {
                ...packageForm,
                price: parseFloat(packageForm.price),
                durationDays: parseInt(packageForm.durationDays),
                priorityLevel: packageForm.priorityLevel ? parseInt(packageForm.priorityLevel) : null
            };

            if (editingPackage) {
                await updatePackage(editingPackage.id, { ...packageData, id: editingPackage.id });
                toast.success("Cập nhật gói thành công!");
            } else {
                await createPackage(packageData);
                toast.success("Tạo gói mới thành công!");
            }

            closeModal();
            fetchPackages();
            fetchStatistics();
        } catch {
            toast.error("Có lỗi xảy ra!");
        }
    };

    // Pagination
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredPackages.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredPackages.length / itemsPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);    // Export to Excel
    const exportToExcel = () => {
        if (filteredPackages.length === 0) {
            toast.warning('Không có dữ liệu để xuất');
            return;
        }

        const exportData = filteredPackages.map(pkg => ({
            'ID': pkg.id,
            'Tên gói': pkg.name,
            'Mô tả': pkg.description || 'Không có mô tả',
            'Giá (VND)': pkg.price,
            'Thời gian (ngày)': pkg.durationDays,
            'Loại highlight': pkg.highlightType || 'Không có',
            'Mức ưu tiên': pkg.priorityLevel || 'Không có',
            'Auto Boost': pkg.autoBoostDaily ? 'Có' : 'Không'
        }));

        // Thêm thống kê tổng quan
        const summaryData = [
            { 'Loại thống kê': 'Tổng số gói', 'Giá trị': packages.length },
            { 'Loại thống kê': 'Đang hiển thị', 'Giá trị': filteredPackages.length },
            { 'Loại thống kê': 'Tổng gói đã bán', 'Giá trị': statistics?.totalSold || 0 },
            { 'Loại thống kê': 'Gói còn hiệu lực', 'Giá trị': statistics?.activeSubscriptions || 0 }
        ];

        const workbook = XLSX.utils.book_new();

        // Tạo sheet thống kê tổng quan
        const summarySheet = XLSX.utils.json_to_sheet(summaryData);
        summarySheet['!cols'] = [
            { wch: 20 }, // Loại thống kê
            { wch: 15 }  // Giá trị
        ];
        XLSX.utils.book_append_sheet(workbook, summarySheet, 'Thống kê');

        // Tạo sheet chi tiết gói
        const detailSheet = XLSX.utils.json_to_sheet(exportData);
        detailSheet['!cols'] = [
            { wch: 8 },  // ID
            { wch: 20 }, // Tên gói
            { wch: 30 }, // Mô tả
            { wch: 12 }, // Giá
            { wch: 15 }, // Thời gian
            { wch: 15 }, // Loại highlight
            { wch: 12 }, // Mức ưu tiên
            { wch: 12 }  // Auto Boost
        ];
        XLSX.utils.book_append_sheet(workbook, detailSheet, 'Danh sách gói');

        const fileName = `goi_dich_vu_${new Date().toISOString().split('T')[0]}.xlsx`;
        XLSX.writeFile(workbook, fileName);

        toast.success('Đã xuất file Excel thành công!');
    };

    // Refresh data
    const refreshData = async () => {
        await Promise.all([fetchPackages(), fetchStatistics()]);
        toast.success('Đã làm mới dữ liệu!');
    };

    return (
        <div className={styles.wrapper}>
            {/* Enhanced Statistics Sidebar */}
            <div className={styles.sidebar}>
                <h2 className={styles.sidebarTitle}>
                    <FaChartBar /> Thống kê chi tiết
                </h2>
                {statistics ? (
                    <div className={styles.statGrid}>
                        <div className={styles.statBox}>
                            <div className={styles.statIcon}>
                                <FaBox />
                            </div>
                            <div className={styles.statContent}>
                                <h4>{statistics.totalSold}</h4>
                                <span>Tổng gói đã bán</span>
                            </div>
                        </div>
                        <div className={styles.statBox}>
                            <div className={styles.statIcon}>
                                <FaClock />
                            </div>
                            <div className={styles.statContent}>
                                <h4>{statistics.activeSubscriptions}</h4>
                                <span>Gói còn hiệu lực</span>
                            </div>
                        </div>
                        <div className={styles.statBox}>
                            <div className={styles.statIcon}>
                                <FaMoneyBillWave />
                            </div>
                            <div className={styles.statContent}>
                                <h4>{packages.length}</h4>
                                <span>Tổng số gói</span>
                            </div>
                        </div>
                        <div className={styles.statBox}>
                            <div className={styles.statIcon}>
                                <FaEye />
                            </div>
                            <div className={styles.statContent}>
                                <h4>{filteredPackages.length}</h4>
                                <span>Đang hiển thị</span>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className={styles.loadingStats}>
                        <div className={styles.spinner}></div>
                        <p>Đang tải thống kê...</p>
                    </div>
                )}
            </div>

            {/* Main Content Panel */}
            <div className={styles.mainPanel}>                {/* Header with Search and Add Button */}
                <div className={styles.headerActions}>
                    <div className={styles.searchContainer}>
                        <FaSearch className={styles.searchIcon} />
                        <input
                            type="text"
                            placeholder="Tìm kiếm theo tên gói, mô tả, giá..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className={styles.searchInput}
                        />
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm("")}
                                className={styles.clearSearch}
                            >
                                ×
                            </button>
                        )}
                    </div>
                    <div className={styles.actionButtons}>
                        <button
                            onClick={refreshData}
                            className={styles.refreshBtn}
                            title="Làm mới dữ liệu"
                        >
                            <FaSync />
                        </button>                        <button
                            onClick={exportToExcel}
                            className={styles.exportBtn}
                            title="Xuất file Excel"
                        >
                            <FaFileExcel /> Xuất Excel
                        </button>
                        <button
                            onClick={() => openModal()}
                            className={styles.addBtn}
                        >
                            <FaPlus /> Thêm gói mới
                        </button>
                    </div>
                </div>

                {/* Filters */}
                <div className={styles.filtersRow}>
                    <div className={styles.filterItem}>
                        <FaFilter />
                        <span>Hiển thị {filteredPackages.length} trên {packages.length} gói</span>
                    </div>
                </div>

                {/* Package Table */}
                <div className={styles.card}>
                    <div className={styles.cardHeader}>
                        <div className={styles.cardTitle}>
                            <FaBox /> Danh sách Gói Bài Viết
                        </div>
                    </div>

                    {loading ? (
                        <div className={styles.loadingContainer}>
                            <div className={styles.spinner}></div>
                            <p>Đang tải dữ liệu...</p>
                        </div>
                    ) : (
                        <>
                            <div className={styles.tableContainer}>
                                <table className={styles.table}>
                                    <thead>
                                        <tr>
                                            <th onClick={() => handleSortClick('id')} className={styles.sortableHeader}>
                                                ID {getSortIcon('id')}
                                            </th>
                                            <th onClick={() => handleSortClick('name')} className={styles.sortableHeader}>
                                                Tên Gói {getSortIcon('name')}
                                            </th>
                                            <th>Mô Tả</th>
                                            <th onClick={() => handleSortClick('price')} className={styles.sortableHeader}>
                                                Giá (VND) {getSortIcon('price')}
                                            </th>
                                            <th onClick={() => handleSortClick('durationDays')} className={styles.sortableHeader}>
                                                Thời gian {getSortIcon('durationDays')}
                                            </th>
                                            <th>Tính năng</th>
                                            <th>Hành động</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {currentItems.map((pkg) => (
                                            <tr key={pkg.id} className={styles.tableRow}>
                                                <td className={styles.idCell}>{pkg.id}</td>
                                                <td className={styles.nameCell}>
                                                    <div className={styles.packageName}>
                                                        {pkg.name}
                                                        {pkg.highlightType && (
                                                            <span className={styles.highlightBadge}>
                                                                {pkg.highlightType}
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className={styles.descCell}>
                                                    <div className={styles.description}>
                                                        {pkg.description || "Không có mô tả"}
                                                    </div>
                                                </td>
                                                <td className={styles.priceCell}>
                                                    <span className={styles.price}>
                                                        {pkg.price.toLocaleString()} đ
                                                    </span>
                                                </td>
                                                <td className={styles.durationCell}>
                                                    <span className={styles.duration}>
                                                        {pkg.durationDays} ngày
                                                    </span>
                                                </td>
                                                <td className={styles.featuresCell}>
                                                    <div className={styles.features}>
                                                        {pkg.priorityLevel && (
                                                            <span className={styles.featureBadge}>
                                                                Ưu tiên {pkg.priorityLevel}
                                                            </span>
                                                        )}
                                                        {pkg.autoBoostDaily && (
                                                            <span className={styles.featureBadge}>
                                                                Auto Boost
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className={styles.actionsCell}>
                                                    <div className={styles.actionBtns}>
                                                        <button
                                                            className={`${styles.btn} ${styles.editBtn}`}
                                                            onClick={() => openModal(pkg)}
                                                            title="Chỉnh sửa"
                                                        >
                                                            <FaEdit />
                                                        </button>
                                                        <button
                                                            className={`${styles.btn} ${styles.deleteBtn}`}
                                                            onClick={() => handleDelete(pkg.id)}
                                                            title="Xóa"
                                                        >
                                                            <FaTrash />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className={styles.pagination}>
                                    <button
                                        onClick={() => paginate(currentPage - 1)}
                                        disabled={currentPage === 1}
                                        className={styles.paginationBtn}
                                    >
                                        Trước
                                    </button>

                                    {[...Array(totalPages)].map((_, index) => (
                                        <button
                                            key={index + 1}
                                            onClick={() => paginate(index + 1)}
                                            className={`${styles.paginationBtn} ${currentPage === index + 1 ? styles.activePage : ''
                                                }`}
                                        >
                                            {index + 1}
                                        </button>
                                    ))}

                                    <button
                                        onClick={() => paginate(currentPage + 1)}
                                        disabled={currentPage === totalPages}
                                        className={styles.paginationBtn}
                                    >
                                        Sau
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Modal for Add/Edit Package */}
            {showModal && (
                <div className={styles.modalOverlay} onClick={closeModal}>
                    <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h3>{editingPackage ? 'Chỉnh sửa gói' : 'Thêm gói mới'}</h3>
                            <button onClick={closeModal} className={styles.closeBtn}>×</button>
                        </div>

                        <form onSubmit={handleSubmit} className={styles.modalForm}>
                            <div className={styles.formRow}>
                                <div className={styles.formGroup}>
                                    <label>Tên gói *</label>
                                    <input
                                        type="text"
                                        value={packageForm.name}
                                        onChange={(e) => setPackageForm({ ...packageForm, name: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Giá (VND) *</label>
                                    <input
                                        type="number"
                                        value={packageForm.price}
                                        onChange={(e) => setPackageForm({ ...packageForm, price: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <div className={styles.formRow}>
                                <div className={styles.formGroup}>
                                    <label>Thời gian (ngày) *</label>
                                    <input
                                        type="number"
                                        value={packageForm.durationDays}
                                        onChange={(e) => setPackageForm({ ...packageForm, durationDays: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Mức ưu tiên</label>
                                    <input
                                        type="number"
                                        value={packageForm.priorityLevel}
                                        onChange={(e) => setPackageForm({ ...packageForm, priorityLevel: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className={styles.formGroup}>
                                <label>Mô tả</label>
                                <textarea
                                    value={packageForm.description}
                                    onChange={(e) => setPackageForm({ ...packageForm, description: e.target.value })}
                                    rows="3"
                                />
                            </div>

                            <div className={styles.formRow}>
                                <div className={styles.formGroup}>
                                    <label>Loại highlight</label>
                                    <select
                                        value={packageForm.highlightType}
                                        onChange={(e) => setPackageForm({ ...packageForm, highlightType: e.target.value })}
                                    >
                                        <option value="">Không có</option>
                                        <option value="URGENT">Gấp</option>
                                        <option value="HOT">Hot</option>
                                        <option value="PREMIUM">Premium</option>
                                    </select>
                                </div>
                                <div className={styles.formGroup}>
                                    <label className={styles.checkboxLabel}>
                                        <input
                                            type="checkbox"
                                            checked={packageForm.autoBoostDaily}
                                            onChange={(e) => setPackageForm({ ...packageForm, autoBoostDaily: e.target.checked })}
                                        />
                                        Auto Boost hàng ngày
                                    </label>
                                </div>
                            </div>

                            <div className={styles.modalActions}>
                                <button type="button" onClick={closeModal} className={styles.cancelBtn}>
                                    Hủy
                                </button>
                                <button type="submit" className={styles.submitBtn}>
                                    {editingPackage ? 'Cập nhật' : 'Tạo mới'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default PackagesManager;
