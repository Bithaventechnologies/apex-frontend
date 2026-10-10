import { createBrowserRouter } from "react-router-dom";
import Homelayout from "../Layouts/HomeLayouts";
import Home from "../Pages/Homepage";
import AuthLayout from "../Layouts/AuthLayouts";
import Register from "../auth/Register";
import Login from "../auth/Login";
import ForgotPassword from "../auth/Forgotpassword";
import ResetPassword from "../auth/ResetPassword";
import DashboardLayout from "../Layouts/Userlayouts";
import Overview from "../Clients/Overview";
import Deposit from "../Clients/Deposit";
import Withdrawal from "../Clients/Withdrawal";
import Plans from "../Clients/Plans";
import Investments from "../Clients/Investment";
import Earnings from "../Clients/Earning";
import Settings from "../Clients/Settings";
import VerifyEmail from "../auth/VerifyEmail";
import Transactions from "../Clients/Transactions";
import AdminLayout from "../Layouts/Adminlayouts";
import AdminOverview from "../Admin/adminOverview";
import AdminDeposits from "../Admin/adminDeposit";
import AdminWithdrawals from "../Admin/AdminWithdrawal";
import AdminPendingWithdrawals from "../Admin/PendingWithdrawal";
import AdminPendingDeposits from "../Admin/pendingDeposits";
import AdminInvestments from "../Admin/adminInvestement";
import AdminEarnings from "../Admin/adminEarnings";
import AdminPlans from "../Admin/AdminPlans";
import AdminLogin from "../auth/adminLogin";



export const router = createBrowserRouter([
    {
        path: "",
        element: <Homelayout/>,
        children: [
            {
                path : "",
                element: <Home/>
            }
        ]
    }, 
    {
        path: "auth",
        element: <AuthLayout/>, 
        children: [
            {
                path: "register",
                element: <Register/>
            },
            {
                path: "login",
                element: <Login/>
            },
            {
                path: "forget-password",
                element: <ForgotPassword/>
            }, 
            {
                path : "reset-password",
                element: <ResetPassword/>
            }, 
            {
                path: "verify-email",
                element: <VerifyEmail/>
            }
        ]
    },
     {
        path: "user",
         element: <DashboardLayout />,
         children: [
            {
                path : "dashboard",
                element: <Overview/>
            },
            {
                path : "deposit",
                element: <Deposit/>
            },
            {
                path: "withdrawal",
                element: <Withdrawal/>
            }, 
            {
                path: "plans", 
                element: <Plans/>
            },
            {
                path: "investments",
                element: <Investments/>
            }, 
            {
                path: "earnings",
                element: <Earnings/>
            }, 
            {
                path : "settings",
                element: <Settings/>
            }, 
            {
                path: "transaction", 
                element: <Transactions/>
            }
         ]
    }, 

    {
        path : "admin",
        element: <AdminLayout/>,
        children: [
            {
                path: "",
                element: <AdminOverview/>
            },
            {
                path : "deposits",
                element: <AdminDeposits/>
            }, 
            {
                path : "withdrawals", 
                element: <AdminWithdrawals/>
            }, 
            {
                path: "deposits/pending",
                element: <AdminPendingDeposits/>
            }, 
            {
                path : "withdrawals/pending",
                element: <AdminPendingWithdrawals/>
            }, 
            {
                path : "investments",
                element: <AdminInvestments/>
            }, 
            {
                path : "earnings", 
                element: <AdminEarnings/>
            }, 
            {
                path: "plans", 
                element: <AdminPlans/>
            }
        ]
    }, 
    {
        path : "admin/auth/login",
        element: <AdminLogin/>
    }
])