import EmployerLayout from "../components/Employer/EmployLayout";
import { Outlet } from 'react-router-dom';
function EmployerLayouts() {
    return (<>
        <EmployerLayout />

        <Outlet />
    </>);
}

export default EmployerLayouts;