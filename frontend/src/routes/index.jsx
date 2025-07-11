import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "../pages/LoginPage";
import SignPage from "../pages/SignupPage";
import AdminLayout from "../layouts/AdminLayouts.jsx";
import AccountMangnager from "../pages/Admin/AccoutMangnager/AccoutMangnager.jsx";
import ForgotPassword from "../components/ForgotPassword/ForgotPassword.jsx";
import ResetPassword from "../components/ResetPassword/ResetPassword.jsx";
import PackagesManager from "../pages/Admin/PackagesManager/PackagesManager.jsx";
import ProPackagesManager from "../pages/Admin/ProPackagesManager/ProPackagesManager.jsx";
import AdminJobPostsManager from "../pages/Admin/AdminJobPostsManager/AdminJobPostsManager.jsx";
import RevenueManager from "../pages/Admin/RevenueManager/RevenueManager.jsx";
import ReportManager from "../pages/Admin/ReportManager/ReportManager.jsx";
import JobFieldsManager from "../pages/Admin/JobFieldsManager/JobFieldsManager.jsx";
import EmploymentTypesManager from "../pages/Admin/EmploymentTypesManager/EmploymentTypesManager.jsx";
import NotFoundPage from "../components/NotFoundPage/NotFoundPage.jsx";
import MainLayout from "../layouts/MainLayoutts.jsx";
import HomePage from "../pages/Main/Home/Home.jsx";
import JobPostDetails from "../pages/Main/JobPostDetails/JobPostDetails.jsx";
import EmployerLayouts from "../layouts/EmployLayouts.jsx";
import CreateJobPost from "../pages/Employer/CreateJobPost/CreateJobPost.jsx";
import ApplicantManagement from "../pages/Employer/ApplicantManagement/ApplicantManagement.jsx";
import InterviewManagement from "../pages/Employer/InterviewManagement/InterviewManagement.jsx";
import JobPostManager from "../pages/Employer/JobPostManager/JobPostManager.jsx";
import EmployerReviewsManager from "../components/EmployerReviewsManager/EmployerReviewsManager.jsx";
import CompanyInfor from "../pages/Main/CompanyInfor/CompanyInfor.jsx";
import ConfirmPage from "../pages/ConfirmPage.jsx";
import SearchJob from "../pages/Main/SearchJob/SearchJob.jsx";
import NotificationPage from "../pages/NotificationPage.jsx";
import CandidateSettings from "../pages/Settings/CandidateSettings/CandidateSettings.jsx";
import EmployerSettings from "../pages/Settings/EmployerSettings/EmployerSettings.jsx";
import UserSettings from "../pages/Settings/UserSettings/UserSettings.jsx";
import SavedJobs from "../pages/SavedJobs/SavedJobs.jsx";
import PaymentSuccess from "../pages/Payment/PaymentSuccess/PaymentSuccess.jsx";
import PaymentFailed from "../pages/Payment/PaymentFailed/PaymentFailed.jsx";
function AppRoutes() {
  return (
    <Router>
      <Routes>
        {" "}
        <Route path="/" element={<MainLayout />}>
          <Route index element={<HomePage />} />
        </Route>
        <Route path="/candidate/settings" element={<CandidateSettings />} />
        <Route path="/user/settings" element={<UserSettings />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AccountMangnager />} />
          <Route path="job-post-pakage" element={<PackagesManager />} />
          <Route path="job-posts" element={<AdminJobPostsManager />} />
          <Route path="pro-packages" element={<ProPackagesManager />} />
          <Route path="revenue" element={<RevenueManager />} />
          <Route path="reports" element={<ReportManager />} />
          <Route path="job-fields" element={<JobFieldsManager />} />
          <Route path="employment-types" element={<EmploymentTypesManager />} />
        </Route>{" "}
        <Route path="/employer" element={<EmployerLayouts />}>
          <Route index element={<JobPostManager />} />
          <Route path="createjobpost" element={<CreateJobPost />} />
          <Route path="applicantmanagement" element={<ApplicantManagement />} />
          <Route path="reviews" element={<EmployerReviewsManager />} />
          <Route path="interviews" element={<InterviewManagement />} />
          <Route path="settings" element={<EmployerSettings />} />
        </Route>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/jobposts/:id" element={<JobPostDetails />} />
        <Route path="/sign" element={<SignPage />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/company/:slug" element={<CompanyInfor />} />{" "}
        <Route path="/search-job" element={<SearchJob />} />
        <Route path="/saved-jobs" element={<SavedJobs />} />{" "}
        <Route path="/confirm" element={<ConfirmPage />} />
        <Route path="/notifications" element={<NotificationPage />} />
        <Route path="/thanh-toan/thanh-cong" element={<PaymentSuccess />} />
        <Route path="/thanh-toan/that-bai" element={<PaymentFailed />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
}

export default AppRoutes;
