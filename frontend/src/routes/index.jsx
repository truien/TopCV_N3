import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "../pages/LoginPage";
import SignPage from "../pages/SignupPage";
import AdminLayout from "../layouts/AdminLayouts.jsx";
import AccountMangnager from "../pages/Admin/AccoutMangnager/AccoutMangnager.jsx";
import ForgotPassword from "../components/ForgotPassword/ForgotPassword.jsx"
import ResetPassword from "../components/ResetPassword/ResetPassword.jsx"
import PackagesManager from "../pages/Admin/PackagesManager/PackagesManager.jsx";
import ProPackagesManager from "../pages/Admin/ProPackagesManager/ProPackagesManager.jsx";
import AdminJobPostsManager from "../pages/Admin/AdminJobPostsManager/AdminJobPostsManager.jsx";
import RevenueManager from "../pages/Admin/RevenueManager/RevenueManager.jsx";
import ReportManager from "../pages/Admin/ReportManager/ReportManager.jsx";
import NotFoundPage from "../components/NotFoundPage/NotFoundPage.jsx";
import MainLayout from "../layouts/MainLayoutts.jsx";
import HomePage from "../pages/Main/Home/Home.jsx";
import JobPostDetails from "../pages/Main/JobPostDetails/JobPostDetails.jsx";
import EmployerLayouts from "../layouts/EmployLayouts.jsx";
import CreateJobPost from "../pages/Employer/CreateJobPost/CreateJobPost.jsx";
import ApplicantManagement from "../pages/Employer/ApplicantManagement/ApplicantManagement.jsx"
import InterviewManagement from "../pages/Employer/InterviewManagement/InterviewManagement.jsx"
import JobPostManager from '../pages/Employer/JobPostManager/JobPostManager.jsx'
import CompanyInfor from "../pages/Main/CompanyInfor/CompanyInfor.jsx";
import ConfirmPage from "../pages/ConfirmPage.jsx";
import SearchJob from "../pages/SearchJob/SearchJob.jsx";
function AppRoutes() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<MainLayout />}>
                    <Route index element={<HomePage />} />
                </Route>                <Route path='/admin' element={<AdminLayout />}>
                    <Route index element={<AccountMangnager />} />
                    <Route path='job-post-pakage' element={<PackagesManager />} />
                    <Route path='job-posts' element={<AdminJobPostsManager />} />
                    <Route path='pro-packages' element={<ProPackagesManager />} />
                    <Route path='revenue' element={<RevenueManager />} />
                    <Route path='reports' element={<ReportManager />} />
                </Route>
                <Route path='/employer' element={<EmployerLayouts />}>
                    <Route index element={< JobPostManager />} />
                    <Route path="createjobpost" element={<CreateJobPost />} />
                    <Route path="applicantmanagement" element={<ApplicantManagement />} />
                    <Route path="interviews" element={<InterviewManagement />} />
                </Route>
                <Route path="/login" element={<LoginPage />} />
                <Route path='/jobposts/:id' element={<JobPostDetails />} />
                <Route path="/sign" element={<SignPage />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/company/:slug" element={<CompanyInfor />} />
                <Route path="/search-job" element={<SearchJob />} />
                <Route path="/confirm" element={<ConfirmPage />} />
                <Route path="*" element={<NotFoundPage />} />
            </Routes>
        </Router>
    );
}

export default AppRoutes;
