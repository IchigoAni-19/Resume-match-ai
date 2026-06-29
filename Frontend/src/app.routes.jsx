import { createBrowserRouter } from "react-router";
import Login from './features/auth/pages/Login.jsx'
import Register from './features/auth/pages/Register.jsx'
import Settings from './features/auth/pages/Settings.jsx'
import Protected from "./features/auth/components/Protected.jsx";
import Home from "./features/interview/pages/Home.jsx";
import Interview from "./features/interview/pages/Interview.jsx";
import History from "./features/interview/pages/History.jsx";


export const router = createBrowserRouter([
    {
        path: '/login',
        element: <Login />
    },
    {
        path: '/register',
        element: <Register />
    },
    {
        path: '/',
        element: <Protected><Home /></Protected>
    },
    {
        path: '/interview/:interviewId',
        element: <Protected><Interview /></Protected>
    },
    {
        path: '/history',
        element: <Protected><History /></Protected>
    },
    {
        path: '/settings',
        element: <Protected><Settings /></Protected>
    }
])