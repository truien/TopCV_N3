import Header from '../components/Header/Header';
import Footer from '../components/Footer/Footer';
import Search from '../components/Search/Search';
import Recommend from '../components/Recommend/Recommend';
import { Outlet } from 'react-router-dom';


const MainLayout = () => {
    return (
        <>
            <Header />
            <Search />
            <Outlet />
            <Recommend />
            <Outlet />
            <Footer />
        </>
    );
}
export default MainLayout;