import AdminHeaderSidebar from '../components/AdminHeader/index';
import { Outlet } from 'react-router-dom';
import '../components/AdminHeader/styles.css';

function AdminLayout() {
    return (
        <>
            <AdminHeaderSidebar />
            <main className={`content`}>
                <Outlet />
            </main>
        </>
    );
}

export default AdminLayout;
