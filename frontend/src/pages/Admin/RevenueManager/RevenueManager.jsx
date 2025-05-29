import React, { useState, useEffect } from 'react';
import { Line, Bar, Doughnut, Pie } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';
import { format } from 'date-fns';
import { Form, DatePicker } from 'antd';
import * as XLSX from 'xlsx';
import { toast } from 'react-toastify';
import { getRevenueSummary, getRevenueChartData, getRevenueDetails } from '../../../api/revenueApi';
import styles from './RevenueManager.module.css';
import dayjs from 'dayjs';

// Register ChartJS components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

const RevenueManager = () => {
    const [summary, setSummary] = useState(null);
    const [chartData, setChartData] = useState(null);
    const [packageRevenueData, setPackageRevenueData] = useState(null);
    const [selectedPeriod, setSelectedPeriod] = useState('monthly');
    const [selectedChartType, setSelectedChartType] = useState('line');
    const [orderDetails, setOrderDetails] = useState([]);
    const [dateRange, setDateRange] = useState([
        dayjs().subtract(1, 'month'),
        dayjs()
    ]);

    const [loading, setLoading] = useState({
        summary: true,
        chart: true,
        details: true
    });

    // Fetch summary data
    useEffect(() => {
        const fetchSummary = async () => {
            try {
                const data = await getRevenueSummary();
                setSummary(data);
            } catch (error) {
                console.error('Error fetching revenue summary:', error);
            } finally {
                setLoading(prev => ({ ...prev, summary: false }));
            }
        };
        fetchSummary();
    }, []);    // Fetch chart data when period changes
    useEffect(() => {
        const fetchChartData = async () => {
            setLoading(prev => ({ ...prev, chart: true }));
            try {
                const data = await getRevenueChartData(selectedPeriod);

                // Dữ liệu cho biểu đồ đường/cột doanh thu theo thời gian
                setChartData({
                    labels: data.labels,
                    datasets: [{
                        label: 'Doanh thu (VND)',
                        data: data.values,
                        fill: selectedChartType === 'area',
                        borderColor: 'rgb(99, 102, 241)',
                        backgroundColor: selectedChartType === 'area'
                            ? 'rgba(99, 102, 241, 0.1)'
                            : 'rgba(99, 102, 241, 0.8)',
                        tension: 0.4,
                        borderWidth: 3,
                        pointBackgroundColor: 'rgb(99, 102, 241)',
                        pointBorderColor: '#fff',
                        pointBorderWidth: 2,
                        pointRadius: 6,
                        pointHoverRadius: 8,
                    }]
                });

                // Tạo dữ liệu giả cho biểu đồ phân tích theo gói dịch vụ
                const packageLabels = ['Gói Cơ bản', 'Gói Pro', 'Gói Premium', 'Gói Enterprise'];
                const packageValues = data.values.length > 0
                    ? [
                        Math.floor(data.values.reduce((a, b) => a + b, 0) * 0.3),
                        Math.floor(data.values.reduce((a, b) => a + b, 0) * 0.35),
                        Math.floor(data.values.reduce((a, b) => a + b, 0) * 0.25),
                        Math.floor(data.values.reduce((a, b) => a + b, 0) * 0.1)
                    ]
                    : [0, 0, 0, 0];

                setPackageRevenueData({
                    labels: packageLabels,
                    datasets: [{
                        label: 'Doanh thu theo gói (VND)',
                        data: packageValues,
                        backgroundColor: [
                            'rgba(34, 197, 94, 0.8)',
                            'rgba(59, 130, 246, 0.8)',
                            'rgba(168, 85, 247, 0.8)',
                            'rgba(239, 68, 68, 0.8)'
                        ],
                        borderColor: [
                            'rgb(34, 197, 94)',
                            'rgb(59, 130, 246)',
                            'rgb(168, 85, 247)',
                            'rgb(239, 68, 68)'
                        ],
                        borderWidth: 2,
                        hoverBackgroundColor: [
                            'rgba(34, 197, 94, 1)',
                            'rgba(59, 130, 246, 1)',
                            'rgba(168, 85, 247, 1)',
                            'rgba(239, 68, 68, 1)'
                        ],
                    }]
                });

            } catch (error) {
                console.error('Error fetching chart data:', error);
            } finally {
                setLoading(prev => ({ ...prev, chart: false }));
            }
        };
        fetchChartData();
    }, [selectedPeriod, selectedChartType]);

    // Fetch order details when date range changes
    useEffect(() => {
        if (dateRange[0] && dateRange[1]) {
            const fetchDetails = async () => {
                setLoading(prev => ({ ...prev, details: true }));
                try {
                    // Ensure we have valid Date objects
                    const startDate = dateRange[0].toDate();
                    const endDate = dateRange[1].toDate();

                    // Format dates using date-fns
                    const formattedStartDate = format(startDate, 'yyyy-MM-dd');
                    const formattedEndDate = format(endDate, 'yyyy-MM-dd');

                    const data = await getRevenueDetails(formattedStartDate, formattedEndDate);
                    setOrderDetails(data);
                } catch (error) {
                    console.error('Error fetching order details:', error);
                    setOrderDetails([]); // Reset order details on error
                } finally {
                    setLoading(prev => ({ ...prev, details: false }));
                }
            };
            fetchDetails();
        }
    }, [dateRange]);

    // Export to Excel function
    const exportToExcel = () => {
        if (orderDetails.length === 0) {
            toast.warning('Không có dữ liệu để xuất');
            return;
        }

        const exportData = orderDetails.map(order => ({
            'Mã đơn hàng': order.orderCode,
            'Ngày tạo': format(new Date(order.createdAt), 'dd/MM/yyyy HH:mm'),
            'Khách hàng': order.customerName,
            'Gói dịch vụ': order.packageName,
            'Số tiền (VND)': order.amount,
            'Trạng thái': order.status
        }));

        // Thêm thống kê tổng quan
        const summaryData = [
            { 'Loại doanh thu': 'Doanh thu hôm nay', 'Số tiền (VND)': summary?.dailyRevenue || 0 },
            { 'Loại doanh thu': 'Doanh thu tháng này', 'Số tiền (VND)': summary?.monthlyRevenue || 0 },
            { 'Loại doanh thu': 'Doanh thu năm nay', 'Số tiền (VND)': summary?.yearlyRevenue || 0 },
            { 'Loại doanh thu': 'Tổng doanh thu', 'Số tiền (VND)': summary?.totalRevenue || 0 }
        ];

        const workbook = XLSX.utils.book_new();

        // Tạo sheet thống kê tổng quan
        const summarySheet = XLSX.utils.json_to_sheet(summaryData);
        summarySheet['!cols'] = [
            { wch: 25 }, // Loại doanh thu
            { wch: 20 }  // Số tiền
        ];
        XLSX.utils.book_append_sheet(workbook, summarySheet, 'Tổng quan');

        // Tạo sheet chi tiết đơn hàng
        const detailSheet = XLSX.utils.json_to_sheet(exportData);
        detailSheet['!cols'] = [
            { wch: 15 }, // Mã đơn hàng
            { wch: 18 }, // Ngày tạo
            { wch: 20 }, // Khách hàng
            { wch: 20 }, // Gói dịch vụ
            { wch: 15 }, // Số tiền
            { wch: 12 }  // Trạng thái
        ];
        XLSX.utils.book_append_sheet(workbook, detailSheet, 'Chi tiết đơn hàng');

        const fileName = `bao_cao_doanh_thu_${format(new Date(), 'yyyy-MM-dd')}.xlsx`;
        XLSX.writeFile(workbook, fileName);

        toast.success('Đã xuất báo cáo Excel thành công!');
    };

    return (
        <div className={styles.container}>
            {/* Statistics Overview */}
            <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                    <h3>Doanh thu hôm nay</h3>
                    <div className={styles.amount}>
                        {loading.summary ? 'Đang tải...' : formatCurrency(summary?.dailyRevenue || 0)}
                    </div>
                </div>
                <div className={styles.statCard}>
                    <h3>Doanh thu tháng này</h3>
                    <div className={styles.amount}>
                        {loading.summary ? 'Đang tải...' : formatCurrency(summary?.monthlyRevenue || 0)}
                    </div>
                </div>
                <div className={styles.statCard}>
                    <h3>Doanh thu năm nay</h3>
                    <div className={styles.amount}>
                        {loading.summary ? 'Đang tải...' : formatCurrency(summary?.yearlyRevenue || 0)}
                    </div>
                </div>
                <div className={styles.statCard}>
                    <h3>Tổng doanh thu</h3>
                    <div className={styles.amount}>
                        {loading.summary ? 'Đang tải...' : formatCurrency(summary?.totalRevenue || 0)}
                    </div>
                </div>
            </div>            {/* Analytics Dashboard */}
            <div className={styles.analyticsSection}>
                {/* Chart Controls */}
                <div className={styles.chartControls}>
                    <div className={styles.controlGroup}>
                        <label>Khoảng thời gian:</label>
                        <div className={styles.periodButtons}>
                            <button
                                className={`${styles.periodButton} ${selectedPeriod === 'daily' ? styles.active : ''}`}
                                onClick={() => setSelectedPeriod('daily')}
                            >
                                Theo ngày
                            </button>
                            <button
                                className={`${styles.periodButton} ${selectedPeriod === 'monthly' ? styles.active : ''}`}
                                onClick={() => setSelectedPeriod('monthly')}
                            >
                                Theo tháng
                            </button>
                            <button
                                className={`${styles.periodButton} ${selectedPeriod === 'yearly' ? styles.active : ''}`}
                                onClick={() => setSelectedPeriod('yearly')}
                            >
                                Theo năm
                            </button>
                        </div>
                    </div>

                    <div className={styles.controlGroup}>
                        <label>Loại biểu đồ:</label>
                        <div className={styles.chartTypeButtons}>
                            <button
                                className={`${styles.chartTypeButton} ${selectedChartType === 'line' ? styles.active : ''}`}
                                onClick={() => setSelectedChartType('line')}
                                title="Biểu đồ đường"
                            >
                                📈
                            </button>
                            <button
                                className={`${styles.chartTypeButton} ${selectedChartType === 'bar' ? styles.active : ''}`}
                                onClick={() => setSelectedChartType('bar')}
                                title="Biểu đồ cột"
                            >
                                📊
                            </button>
                            <button
                                className={`${styles.chartTypeButton} ${selectedChartType === 'area' ? styles.active : ''}`}
                                onClick={() => setSelectedChartType('area')}
                                title="Biểu đồ vùng"
                            >
                                📄
                            </button>
                        </div>
                    </div>
                </div>

                {/* Main Revenue Chart */}
                <div className={styles.mainChart}>
                    <h3 className={styles.chartTitle}>
                        📈 Xu hướng doanh thu {selectedPeriod === 'daily' ? 'theo ngày' : selectedPeriod === 'monthly' ? 'theo tháng' : 'theo năm'}
                    </h3>
                    {loading.chart ? (
                        <div className={styles.loadingSpinner}>
                            <div className={styles.spinner}></div>
                            <p>Đang tải biểu đồ...</p>
                        </div>
                    ) : chartData && (
                        <div className={styles.chartContainer}>
                            {selectedChartType === 'line' || selectedChartType === 'area' ? (
                                <Line
                                    data={chartData}
                                    options={{
                                        responsive: true,
                                        maintainAspectRatio: false,
                                        plugins: {
                                            legend: {
                                                position: 'top',
                                                labels: {
                                                    usePointStyle: true,
                                                    padding: 20,
                                                    font: {
                                                        size: 12,
                                                        weight: '600'
                                                    }
                                                }
                                            },
                                            tooltip: {
                                                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                                                titleColor: '#fff',
                                                bodyColor: '#fff',
                                                borderColor: 'rgb(99, 102, 241)',
                                                borderWidth: 1,
                                                displayColors: false,
                                                callbacks: {
                                                    label: function (context) {
                                                        return `Doanh thu: ${formatCurrency(context.parsed.y)}`;
                                                    }
                                                }
                                            }
                                        },
                                        scales: {
                                            y: {
                                                beginAtZero: true,
                                                grid: {
                                                    color: 'rgba(0, 0, 0, 0.1)',
                                                },
                                                ticks: {
                                                    callback: function (value) {
                                                        return new Intl.NumberFormat('vi-VN', {
                                                            notation: 'compact',
                                                            compactDisplay: 'short',
                                                            currency: 'VND'
                                                        }).format(value);
                                                    }
                                                }
                                            },
                                            x: {
                                                grid: {
                                                    color: 'rgba(0, 0, 0, 0.1)',
                                                }
                                            }
                                        },
                                        elements: {
                                            point: {
                                                hoverRadius: 8,
                                                hoverBorderWidth: 3
                                            }
                                        }
                                    }}
                                    height={400}
                                />
                            ) : (
                                <Bar
                                    data={chartData}
                                    options={{
                                        responsive: true,
                                        maintainAspectRatio: false,
                                        plugins: {
                                            legend: {
                                                position: 'top',
                                                labels: {
                                                    usePointStyle: true,
                                                    padding: 20,
                                                    font: {
                                                        size: 12,
                                                        weight: '600'
                                                    }
                                                }
                                            },
                                            tooltip: {
                                                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                                                titleColor: '#fff',
                                                bodyColor: '#fff',
                                                borderColor: 'rgb(99, 102, 241)',
                                                borderWidth: 1,
                                                displayColors: false,
                                                callbacks: {
                                                    label: function (context) {
                                                        return `Doanh thu: ${formatCurrency(context.parsed.y)}`;
                                                    }
                                                }
                                            }
                                        },
                                        scales: {
                                            y: {
                                                beginAtZero: true,
                                                grid: {
                                                    color: 'rgba(0, 0, 0, 0.1)',
                                                },
                                                ticks: {
                                                    callback: function (value) {
                                                        return new Intl.NumberFormat('vi-VN', {
                                                            notation: 'compact',
                                                            compactDisplay: 'short',
                                                            currency: 'VND'
                                                        }).format(value);
                                                    }
                                                }
                                            },
                                            x: {
                                                grid: {
                                                    color: 'rgba(0, 0, 0, 0.1)',
                                                }
                                            }
                                        }
                                    }}
                                    height={400}
                                />
                            )}
                        </div>
                    )}
                </div>

                {/* Package Revenue Analysis */}
                <div className={styles.packageAnalysis}>
                    <div className={styles.packageChartSection}>
                        <h3 className={styles.chartTitle}>🎯 Phân tích doanh thu theo gói dịch vụ</h3>
                        {loading.chart ? (
                            <div className={styles.loadingSpinner}>
                                <div className={styles.spinner}></div>
                                <p>Đang phân tích...</p>
                            </div>
                        ) : packageRevenueData && (
                            <div className={styles.packageChartsGrid}>
                                <div className={styles.pieChartContainer}>
                                    <h4>Tỷ lệ phần trăm</h4>
                                    <Pie
                                        data={packageRevenueData}
                                        options={{
                                            responsive: true,
                                            maintainAspectRatio: false,
                                            plugins: {
                                                legend: {
                                                    position: 'bottom',
                                                    labels: {
                                                        padding: 20,
                                                        usePointStyle: true,
                                                        font: {
                                                            size: 11,
                                                            weight: '500'
                                                        }
                                                    }
                                                },
                                                tooltip: {
                                                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                                                    titleColor: '#fff',
                                                    bodyColor: '#fff',
                                                    callbacks: {
                                                        label: function (context) {
                                                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                                            const percentage = ((context.parsed / total) * 100).toFixed(1);
                                                            return `${context.label}: ${formatCurrency(context.parsed)} (${percentage}%)`;
                                                        }
                                                    }
                                                }
                                            }
                                        }}
                                        height={300}
                                    />
                                </div>

                                <div className={styles.doughnutChartContainer}>
                                    <h4>Phân bố doanh thu</h4>
                                    <Doughnut
                                        data={packageRevenueData}
                                        options={{
                                            responsive: true,
                                            maintainAspectRatio: false,
                                            cutout: '60%',
                                            plugins: {
                                                legend: {
                                                    position: 'bottom',
                                                    labels: {
                                                        padding: 20,
                                                        usePointStyle: true,
                                                        font: {
                                                            size: 11,
                                                            weight: '500'
                                                        }
                                                    }
                                                },
                                                tooltip: {
                                                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                                                    titleColor: '#fff',
                                                    bodyColor: '#fff',
                                                    callbacks: {
                                                        label: function (context) {
                                                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                                            const percentage = ((context.parsed / total) * 100).toFixed(1);
                                                            return `${context.label}: ${formatCurrency(context.parsed)} (${percentage}%)`;
                                                        }
                                                    }
                                                }
                                            }
                                        }}
                                        height={300}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>{/* Order Details */}
            <div className={styles.detailsSection}>
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <h2>Chi tiết đơn hàng</h2>
                    <button
                        className="btn btn-success"
                        onClick={exportToExcel}
                        disabled={orderDetails.length === 0}
                    >
                        <i className="fas fa-file-excel me-2"></i>
                        Xuất Excel
                    </button>
                </div>                <div className={styles.dateFilters}>
                    <Form.Item label="Khoảng thời gian">
                        <DatePicker.RangePicker
                            value={dateRange}
                            onChange={setDateRange}
                        />
                    </Form.Item>
                </div>
                {loading.details ? (
                    <div className={styles.loadingSpinner}>Đang tải dữ liệu...</div>
                ) : (
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Mã đơn hàng</th>
                                <th>Ngày tạo</th>
                                <th>Khách hàng</th>
                                <th>Gói dịch vụ</th>
                                <th>Số tiền</th>
                                <th>Trạng thái</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orderDetails.map(order => (<tr key={order.id}>
                                <td>{order.orderCode}</td>
                                <td>{format(new Date(order.createdAt), 'dd/MM/yyyy HH:mm')}</td>
                                <td>{order.customerName}</td>
                                <td>{order.packageName}</td>
                                <td>{formatCurrency(order.amount)}</td>
                                <td>{order.status}</td>
                            </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default RevenueManager;