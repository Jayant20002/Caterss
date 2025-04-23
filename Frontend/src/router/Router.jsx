import { createBrowserRouter } from "react-router-dom";
import Main from "../layout/Main";
import Home from "../pages/home/Home";
import Packages from '../pages/Packages/Packages'
import BoxGenie from "../pages/menuPage/BoxGenie";
import Signup from "../components/Signup";
import PrivateRoute from "../PrivateRoute/PrivateRoute";
import CartPage from "../pages/menuPage/CartPage";
import Login from "../components/Login";
import Order from "../pages/dashboard/user/Order";
import UserProfile from "../pages/dashboard/user/UserProfile";
import Buffet from '../pages/Buffet/Buffet';
import DashboardLayout from "../layout/DashboardLayout";
import Dashboard from "../pages/dashboard/admin/Dashboard";
import Users from "../pages/dashboard/admin/Users";
import AddMenu from "../pages/dashboard/admin/AddMenu";
import ManageItems from "../pages/dashboard/admin/ManageItems";
import UpdateMenu from "../pages/dashboard/admin/UpdateMenu";
import Payment from "../pages/menuPage/Payment";
import ReceiptPage from "../pages/menuPage/ReceiptPage";
import ManageBookings from "../pages/dashboard/admin/ManageBookings";
import BuffetPage from "../pages/dashboard/admin/BuffetPage";
import Contact from '../pages/Contact/Contact';
import ErrorBoundary from '../components/ErrorBoundary';
import axios from 'axios';

// Loader function for UpdateMenu
const menuItemLoader = async ({ params }) => {
  try {
    const response = await axios.get(`${import.meta.env.VITE_API_URL}/menu/${params.id}`);
    return response.data;
  } catch (error) {
    console.error('Error loading menu item:', error);
    throw new Error('Failed to load menu item');
  }
};

const router = createBrowserRouter([
    {
      path: "/",
      element: <Main/>,
      errorElement: <ErrorBoundary />,
      children: [
        {
            path: "/",
            element: <Home/>
        },
        {
          path: "/boxgenie",
          element: <BoxGenie/>
        },
        {
          path: "/order",
          element: <PrivateRoute><Order/></PrivateRoute>
        },
        {
          path: "/update-profile",
          element: <PrivateRoute><UserProfile/></PrivateRoute>
        },
        {
          path: "/cart-page",
          element: <PrivateRoute><CartPage/></PrivateRoute>
        },
        {
          path: "/process-checkout",
          element: <PrivateRoute><Payment/></PrivateRoute>
        },
        {
          path: "/receipt",
          element: <PrivateRoute><ReceiptPage/></PrivateRoute>
        },
        {
          path:"/wedding-catering",
          element: <Buffet catering="Wedding Catering"/>
        },
        {
          path:"/event-catering",
          element: <Buffet catering="Event Catering"/>
        },
        {
          path:"/corporate-catering",
          element: <Buffet catering="Corporate Catering" />
        },
        {
          path:"/Packages",
          element: <Packages/>
        },
        {
          path:"/contact",
          element: <Contact/>
        }
      ]
    },
    {
      path: "/signup",
      element: <Signup/>
    },
    {
      path: "/login",
      element: <Login/>
    },
    {
      path: 'dashboard',
      element: <PrivateRoute requiredRole="admin"><DashboardLayout/></PrivateRoute>,
      errorElement: <ErrorBoundary />,
      children: [
        {
          path: '',
          element: <Dashboard/>
        },
        {
          path: 'users',
          element: <Users/>
        },
        {
          path: 'add-menu',
          element: <AddMenu/>
        },
        {
          path: 'manage-items',
          element: <ManageItems/>
        },
        {
          path: 'update-menu/:id',
          element: <UpdateMenu/>,
          loader: menuItemLoader
        },
        {
          path: 'bookings',
          element: <ManageBookings/>
        },
        {
          path: 'buffet',
          element: <BuffetPage/>
        }
      ]
    }
]);

export default router;