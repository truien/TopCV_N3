import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import styles from './FeaturedCompanies.module.css';
import { getFeaturedCompanies } from '../../api/companyApi';
import logo_default from '../../assets/images/logo_default.webp';
import { IoBriefcaseOutline } from "react-icons/io5";
import { Link } from 'react-router-dom';
import {
    followEmployer,
    unfollowEmployer,
    isFollowingEmployer
} from '@/api/followApi';


const industries = [
    'Tất cả',
    'Ngân hàng',
    'Bất động sản',
    'Xây dựng',
    'IT - Phần mềm',
    'Tài chính',
    'Bán lẻ - Hàng tiêu dùng - FMCG',
    'Sản xuất'
];

const PAGE_SIZE = 4;

const FeaturedCompanies = () => {
    const [companies, setCompanies] = useState([]);
    const [selectedIndustry, setSelectedIndustry] = useState('Tất cả');
    const [currentPage, setCurrentPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [followed, setFollowed] = useState({});

    const fetchCompanies = async () => {
        setLoading(true);
        try {
            const res = await getFeaturedCompanies(selectedIndustry, currentPage, PAGE_SIZE);
            setCompanies(res.companies || []);
            setTotal(res.total || 0);
            if (res.companies.length > 0 && res.companies[0].userId) {
                const isFollowing = await isFollowingEmployer(res.companies[0].userId);
                setFollowed(isFollowing);
            }
        } catch {
            setCompanies([]);
            setTotal(0);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchCompanies();
        // eslint-disable-next-line
    }, [selectedIndustry, currentPage]);

    const handleFollow = async () => {
        if (!companies.length) return;
        if (!companies[0].userId) {
            toast.error("Bạn cần đăng nhập để theo dõi công ty.");
            return;
        }
        try {
            if (followed) {
                await unfollowEmployer(companies[0].userId);
                toast.info("Đã bỏ theo dõi.");
                setFollowed(false);
            } else {
                await followEmployer(companies[0].userId);
                toast.success("Đã theo dõi công ty.");
                setFollowed(true);
            }
        } catch {
            toast.warning("Vui lòng đăng nhập để theo dõi công ty.");
            setFollowed(false);
        }
    };

    const handleIndustryChange = (industry) => {
        setSelectedIndustry(industry);
        setCurrentPage(1);
    };

    const totalPages = Math.ceil(total / PAGE_SIZE);

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.headerContent}>
                    <h2 className={styles.headerTitle}>Thương hiệu lớn tiêu biểu</h2>
                    <span className={styles.desc}>
                        Hàng trăm thương hiệu lớn tiêu biểu đang tuyển dụng trên TopCV Pro
                    </span>
                </div>
                <button className={styles.proBtn}>Pro Company</button>
            </div>
            <div className={styles.filters}>
                {industries.map((industry) => (
                    <button
                        key={industry}
                        className={
                            styles.filterBtn +
                            (selectedIndustry === industry ? ' ' + styles.active : '')
                        }
                        onClick={() => handleIndustryChange(industry)}
                    >
                        {industry}
                    </button>
                ))}
            </div>
            <div className={styles.listWrapper}>
                {loading ? (
                    <div className={styles.noData}>Đang tải dữ liệu...</div>
                ) : companies.length > 0 ? (
                    <>
                        <div className={styles.featured}>
                            <div className={styles.companyCard + ' ' + styles.featuredCard}>
                                <img
                                    src={companies[0].avatar || companies[0].logo || logo_default}
                                    alt={companies[0].companyName}
                                    className={styles.logo}
                                />
                                <Link to={`/company/${companies[0].slug}`} className={styles.companyName}>{companies[0].companyName}</Link>
                                <div className={styles.industry}>{companies[0].industry}</div>
                                <div className='d-flex flex-column gap-2 mt-5'>
                                    <div className={styles.jobs}>
                                        <span className={styles.jobs_title} role="img" aria-label="jobs">
                                            <IoBriefcaseOutline className='me-1' />
                                            {companies[0].jobCount || 0} việc làm
                                        </span>
                                    </div>
                                    {companies[0].isPro && (
                                        <div className={styles.proLabel}>Pro Company</div>
                                    )}
                                    <button
                                        className={styles.followBtn}
                                        onClick={() => handleFollow(companies[0].userId)}
                                    >
                                        {followed ? 'Đã theo dõi' : '+ Theo dõi'}
                                    </button>
                                </div>

                            </div>
                        </div>
                        <div className={styles.grid}>
                            {companies.slice(1).map((company) => (
                                <div className={styles.companyCardOutline} key={company.userId}>
                                    <div className={styles.cardRow}>
                                        <img src={company.avatar || company.logo || logo_default} alt={company.companyName} className={styles.logoSmall} />
                                        <div className={styles.infoCol}>
                                            <Link to={`/company/${company.slug}`} className={styles.companyNameSmall}>{company.companyName}</Link>
                                            <div className={styles.industrySmall}>{company.industry}</div>
                                            <div className={styles.jobsSmall}>
                                                <span role="img" aria-label="jobs">
                                                    <IoBriefcaseOutline />
                                                </span> {company.jobCount || 0} việc làm
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                ) : (
                    <div className={styles.noData}>Không có công ty nào</div>
                )}
            </div>
            <div className={styles.pagination}>
                <button
                    className={styles.pageBtn}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                >
                    &lt;
                </button>
                <span className={styles.pageInfo}>
                    {currentPage} / {totalPages || 1}
                </span>
                <button
                    className={styles.pageBtn}
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages || totalPages === 0}
                >
                    &gt;
                </button>
            </div>
        </div>
    );
};

export default FeaturedCompanies;
