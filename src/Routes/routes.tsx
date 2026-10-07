import { createBrowserRouter } from "react-router-dom";
import Homelayout from "../Layouts/HomeLayouts";
import Home from "../Pages/Homepage";
import AuthLayout from "../Layouts/AuthLayouts";
import Register from "../auth/Register";
import Login from "../auth/Login";
import ForgotPassword from "../auth/Forgotpassword";
import ResetPassword from "../auth/ResetPassword";


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
            }
        ]
    }
])