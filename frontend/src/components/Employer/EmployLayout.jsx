import { useEffect, useState } from 'react';
import {
    FaBars,
    FaBell,
    FaShoppingCart,
    FaUser,
    FaChartLine,
    FaBriefcase,
    FaCog,
    FaHome,
    FaStar,
    FaCogs,
} from 'react-icons/fa';
import { Outlet } from 'react-router-dom';
import { Link } from 'react-router-dom';
import logo from '../../assets/images/logo-birthday-10.09ebdc6.png';
import styles from './EmployerLayout.module.css';

const EmployerLayout = () => {
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [activeLink, setActiveLink] = useState(
        sessionStorage.getItem('activeLink') || '/employer'
    );

    const toggleSidebar = () => setIsSidebarCollapsed(!isSidebarCollapsed);

    const handleLinkClick = (link) => {
        setActiveLink(link);
        sessionStorage.setItem('activeLink', link);
    };

    useEffect(() => {
        const savedLink = sessionStorage.getItem('activeLink');
        if (savedLink) {
            setActiveLink(savedLink);
        }
    }, []);

    return (
        <div className='d-flex'>
            {/* Header */}
            <header className={`navbar navbar-expand-lg navbar-dark bg-dark fixed-top px-3 d-flex justify-content-between w-100 ${styles.header}`}>
                <div className='d-flex align-items-center'>
                    <button className='btn text-white me-2' onClick={toggleSidebar}>
                        <FaBars />
                    </button>
                    <Link to='/' className='navbar-brand d-flex align-items-center'>
                        <img src={logo} alt='Logo' height='40' className='me-2' />
                    </Link>
                </div>
                <div className={`d-flex align-items-center ${styles.headerIcons}`}>
                    <button className='btn btn-sm btn-outline-light me-2'>
                        <FaBell />
                    </button>
                    <button className='btn btn-sm btn-outline-light me-2'>
                        <FaShoppingCart />
                    </button>
                    <button className='btn btn-sm btn-outline-light'>
                        <FaUser />
                    </button>
                </div>
            </header>

            {/* Sidebar */}
            <aside className={`bg-light border-end position-fixed top-0 pt-5 mt-4 ${styles.sidebar} ${isSidebarCollapsed ? styles.sidebarCollapsed : ''}`} style={{ width: isSidebarCollapsed ? '80px' : '260px', height: '100vh' }}>
                <nav className='nav flex-column px-3'>
                    <Link
                        to='/employer'
                        className={`nav-link d-flex align-items-center ${styles.navLink} ${activeLink === '/employer' ? styles.navLinkActive : ''}`}
                        onClick={() => handleLinkClick('/employer')}
                    >
                        <FaChartLine className={`me-2 ${styles.icon}`} />
                        {!isSidebarCollapsed && <span className={styles.linkText}>Quản lý bài tuyển dụng</span>}
                    </Link>
                    <Link
                        to='/employer/reviews'
                        className={`nav-link d-flex align-items-center ${styles.navLink} ${activeLink === '/employer/reviews' ? styles.navLinkActive : ''}`}
                        onClick={() => handleLinkClick('/employer/reviews')}
                    >
                        <FaStar className={`me-2 ${styles.icon}`} />
                        {!isSidebarCollapsed && <span className={styles.linkText}>Quản lý đánh giá</span>}
                    </Link>
                    <Link
                        to='/employer/applicantmanagement'
                        className={`nav-link d-flex align-items-center ${styles.navLink} ${activeLink === '/employer/applicantmanagement' ? styles.navLinkActive : ''}`}
                        onClick={() => handleLinkClick('/employer/applicantmanagement')}
                    >
                        <FaBriefcase className={`me-2 ${styles.icon}`} />
                        {!isSidebarCollapsed && <span className={styles.linkText}>Quản lý hồ sơ ứng viên</span>}
                    </Link>
                    <Link
                        to='/employer/interviews'
                        className={`nav-link d-flex align-items-center ${styles.navLink} ${activeLink === '/employer/interviews' ? styles.navLinkActive : ''}`}
                        onClick={() => handleLinkClick('/employer/interviews')}
                    >
                        <FaBriefcase className={`me-2 ${styles.icon}`} />
                        {!isSidebarCollapsed && <span className={styles.linkText}>Quản lý lịch phỏng vấn</span>}
                    </Link>                    <Link
                        to='/employer/createjobpost'
                        className={`nav-link d-flex align-items-center ${styles.navLink} ${activeLink === '/employer/createjobpost' ? styles.navLinkActive : ''}`}
                        onClick={() => handleLinkClick('/employer/createjobpost')}
                    >
                        <FaCog className={`me-2 ${styles.icon}`} />
                        {!isSidebarCollapsed && <span className={styles.linkText}>Đăng bài tuyển dụng</span>}
                    </Link>                    <Link
                        to='/employer/settings'
                        className={`nav-link d-flex align-items-center ${styles.navLink} ${activeLink === '/employer/settings' ? styles.navLinkActive : ''}`}
                        onClick={() => handleLinkClick('/employer/settings')}
                    >
                        <FaCogs className={`me-2 ${styles.icon}`} />
                        {!isSidebarCollapsed && <span className={styles.linkText}>Cài đặt tài khoản</span>}
                    </Link>
                    <Link
                        to='/'
                        className={`nav-link d-flex align-items-center ${styles.navLink}`}
                        onClick={() => handleLinkClick('/')}
                    >
                        <FaHome className={`me-2 ${styles.icon}`} />
                        {!isSidebarCollapsed && <span className={styles.linkText}>Xem bảng tin</span>}
                    </Link>
                </nav>
            </aside>

            <main
                className={`ms-auto py-5 ${styles.mainContent}`}
                style={{
                    marginLeft: isSidebarCollapsed ? '30px' : '260px',
                    width: isSidebarCollapsed ? 'calc(100% - 30px)' : 'calc(100% - 260px)',
                    transition: 'all 0.3s ease',
                }}
            >
                <Outlet />
            </main>

        </div>
    );
};

export default EmployerLayout;