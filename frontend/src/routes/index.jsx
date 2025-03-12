import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "../pages/LoginPage";
import SignPage from "../pages/SignupPage";

function AppRoutes() {
    return (
        <Router>
            <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/sign" element={<SignPage />} />
                <Route path="*" element={<h1>404 - Không tìm thấy trang</h1>} />
            </Routes>
        </Router>
    );
}

export default AppRoutes;
