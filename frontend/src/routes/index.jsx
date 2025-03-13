import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "../pages/LoginPage";
import SignPage from "../pages/SignupPage";
import AdminLayout from "../layouts/AdminLayouts.jsx";
import AccountMangnager from "../pages/AccoutMangnager.jsx";

function AppRoutes() {
    return (
        <Router>
            <Routes>
                <Route path='/admin' element={<AdminLayout />}>
                    <Route index element={<AccountMangnager />} /> 
                </Route>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/sign" element={<SignPage />} />
                <Route path="*" element={<h1>404 - Không tìm thấy trang</h1>} />
            </Routes>
        </Router>
    );
}

export default AppRoutes;
