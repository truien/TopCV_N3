import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "../pages/LoginPage";
import SignPage from "../pages/SignupPage";
import AdminLayout from "../layouts/AdminLayouts.jsx";
import AccountMangnager from "../pages/Admin/AccoutMangnager.jsx";
import ForgotPassword from "../components/ForgotPassword/ForgotPassword.jsx"
import ResetPassword from "../components/ResetPassword/ResetPassword.jsx"
import PackagesManager from "../pages/Admin/PackagesManager.jsx";
import NotFoundPage from "../components/NotFoundPage/NotFoundPage.jsx";
import MainLayout from "../layouts/MainLayoutts.jsx";
import HomePage from "../pages/Main/Home/Home.jsx";
import JobPostDetails from "../pages/Main/JobPostDetails/JobPostDetails.jsx";
function AppRoutes() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<MainLayout />}>
                    <Route index element={<HomePage />} />
                </Route>
                <Route path='/admin' element={<AdminLayout />}>
                    <Route index element={<AccountMangnager />} />
                    <Route path='job-post-pakage' element={<PackagesManager />} />
                </Route>
                <Route path="/login" element={<LoginPage />} />
                <Route path='/jobposts/:id' element={<JobPostDetails />} />
                <Route path="/sign" element={<SignPage />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="*" element={<NotFoundPage />} />
            </Routes>
        </Router>
    );
}

export default AppRoutes;
