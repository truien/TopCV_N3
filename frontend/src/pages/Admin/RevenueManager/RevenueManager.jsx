import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';
import { format } from 'date-fns';
import { Form, DatePicker } from 'antd';
import { getRevenueSummary, getRevenueChartData, getRevenueDetails } from '../../../api/revenueApi';
import styles from './RevenueManager.module.css';

// Register ChartJS components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

const RevenueManager = () => {
    const [summary, setSummary] = useState(null);
    const [chartData, setChartData] = useState(null);
    const [selectedPeriod, setSelectedPeriod] = useState('monthly');
    const [orderDetails, setOrderDetails] = useState([]);
    const [dateRange, setDateRange] = useState([null, null]);
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
    }, []);

    // Fetch chart data when period changes
    useEffect(() => {
        const fetchChartData = async () => {
            setLoading(prev => ({ ...prev, chart: true }));
            try {
                const data = await getRevenueChartData(selectedPeriod);
                setChartData({
                    labels: data.labels,
                    datasets: [{
                        label: 'Doanh thu',
                        data: data.values,
                        fill: false,
                        borderColor: 'rgb(75, 192, 192)',
                        tension: 0.1
                    }]
                });
            } catch (error) {
                console.error('Error fetching chart data:', error);
            } finally {
                setLoading(prev => ({ ...prev, chart: false }));
            }
        };
        fetchChartData();
    }, [selectedPeriod]);

    // Fetch order details when date range changes
    useEffect(() => {
        if (dateRange[0] && dateRange[1]) {
            const fetchDetails = async () => {
                setLoading(prev => ({ ...prev, details: true }));
                try {
                    const startDate = format(dateRange[0], 'yyyy-MM-dd');
                    const endDate = format(dateRange[1], 'yyyy-MM-dd');
                    const data = await getRevenueDetails(startDate, endDate);
                    setOrderDetails(data);
                } catch (error) {
                    console.error('Error fetching order details:', error);
                } finally {
                    setLoading(prev => ({ ...prev, details: false }));
                }
            };
            fetchDetails();
        }
    }, [dateRange]);

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
            </div>

            {/* Revenue Chart */}
            <div className={styles.chartSection}>
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
                {loading.chart ? (
                    <div className={styles.loadingSpinner}>Đang tải biểu đồ...</div>
                ) : chartData && (
                    <Line
                        data={chartData}
                        options={{
                            responsive: true,
                            plugins: {
                                legend: {
                                    position: 'top',
                                },
                                title: {
                                    display: true,
                                    text: 'Biểu đồ doanh thu'
                                }
                            }
                        }}
                    />
                )}
            </div>

            {/* Order Details */}
            <div className={styles.detailsSection}>
                <h2>Chi tiết đơn hàng</h2>
                <div className={styles.dateFilters}>
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
                            {orderDetails.map(order => (
                                <tr key={order.id}>
                                    <td>{order.orderCode}</td>
                                    <td>{format(new Date(order.createdDate), 'dd/MM/yyyy HH:mm')}</td>
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