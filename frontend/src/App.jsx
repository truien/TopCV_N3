import AppRoutes from "./routes";
import { NotificationProvider } from "./contexts/NotificationContext.jsx";
import { AuthProvider } from "./contexts/AuthContext.jsx";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
    return (
        <AuthProvider>
            <NotificationProvider>
                <AppRoutes />
                <ToastContainer
                    position="top-right"
                    autoClose={5000}
                    hideProgressBar={false}
                    newestOnTop
                    closeOnClick
                    rtl={false}
                    pauseOnFocusLoss
                    draggable
                    pauseOnHover
                />
            </NotificationProvider>
        </AuthProvider>
    );
}

export default App;
