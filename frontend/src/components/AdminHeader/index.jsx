import { useEffect, useState } from 'react';
import {
    FaBars,
    FaBell,
    FaUser,
    FaChartLine,
    FaBriefcase,
    FaCog,
    FaHome,
} from 'react-icons/fa';
import { Link } from 'react-router-dom';
import logo from '../../assets/images/logo-birthday-10.09ebdc6.png';
import './styles.css';

const AdminLayout = () => {
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [activeLink, setActiveLink] = useState(
        sessionStorage.getItem('activeLink') || '/admin'
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
        <div className='admin-layout d-flex'>
            {/* Header */}
            <header className='header navbar navbar-expand-lg navbar-dark fixed-top'>
                <button className='btn text-white me-2' onClick={toggleSidebar}>
                    <FaBars />
                </button>
                <Link to='/' className='navbar-brand d-flex align-items-center'>
                    <img src={logo} alt='Logo' height='40' className='me-2' />
                </Link>
                <div className='header-icons d-flex align-items-center'>
                    <button className='bg-transparent border-0'>
                        <FaBell className='text-white mx-2' />
                    </button>
                    <button className='bg-transparent border-0'>
                        <FaUser className='text-white mx-2' />
                    </button>
                </div>
            </header>

            <aside
                className={`sidebar ${isSidebarCollapsed ? 'collapsed' : ''}`}
            >
                <nav className='nav flex-column pt-4'>
                    <Link
                        to='/admin'
                        className={`nav-link ${
                            activeLink === '/admin' ? 'active' : ''
                        }`}
                        onClick={() => handleLinkClick('/admin')}
                    >
                        <FaChartLine className='icon' />
                        <span className='link-text fw-bolder'>
                            Quản lý tài khoản
                        </span>
                    </Link>
                    <Link
                        to='/admin/job-post-manage'
                        className={`nav-link ${
                            activeLink === '/admin/job-post-manage'
                                ? 'active'
                                : ''
                        }`}
                        onClick={() =>
                            handleLinkClick('/admin/job-post-manage')
                        }
                    >
                        <FaBriefcase className='icon' />
                        <span className='link-text fw-bolder'>
                            Quản lý bài tuyển dụng
                        </span>
                    </Link>
                    <Link
                        to='/admin/managecatery'
                        className={`nav-link`}
                        onClick={() =>
                            handleLinkClick('/admin/job-post-manage')
                        }
                    >
                        <FaBriefcase className='icon' />
                        <span className='link-text fw-bolder'>
                            Quản lý danh mục
                        </span>
                    </Link>
                    <Link
                        to='/admin/settings'
                        className={`nav-link ${
                            activeLink === '/admin/settings' ? 'active' : ''
                        }`}
                        onClick={() => handleLinkClick('/admin/settings')}
                    >
                        <FaCog className='icon' />
                        <span className='link-text fw-bolder'>
                            Cài đặt tài khoản
                        </span>
                    </Link>
                    <Link
                        to='/'
                        className={`nav-link`}
                        onClick={() => handleLinkClick('/admin')}
                    >
                        <FaHome className='icon' />
                        <span className='link-text fw-bolder'>
                            Xem bảng tin
                        </span>
                    </Link>
                </nav>
            </aside>
        </div>
    );
};

export default AdminLayout;
