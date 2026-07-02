import { createBrowserRouter, Outlet } from "react-router-dom";
import MainLayout from "../pages/MainLayout/MainLayout";
import HomePage from "../pages/HomePage";
import FriendsPage from "../pages/FriendsLayout/FriendsPage";
import SchedulePage from "../pages/SchedulePage/SchedulePage";
import StudyConnectionPage from "../pages/StudyConnection/StudyConnectionPage";
import { AuthLayout } from "../pages/MainLayout/AuthLayout";
import LoginPage from "../pages/Auth/LoginPage";
import RegisterPage from "../pages/Auth/RegisterPage";
import OnboardingFlow from "../pages/Onboarding/Onboarding";
import ConversationPage from "../pages/Conversation/ConversationPage";

import { Navigate } from "react-router-dom";
import { Login } from "@mui/icons-material";
import CreateGroupPage from "../pages/CreateGroup/CreateGroupPage";
import GroupPage from "../pages/Group/GroupPage";
import ForgotPasswordPage from "../pages/Auth/ResetPassword/ForgotPasswordPage";
import CheckEmailPage from "../pages/Auth/ResetPassword/CheckEmailPage";
import ResetPasswordPage from "../pages/Auth/ResetPassword/ResetPasswordPage";
import ResetPasswordSuccessPage from "../pages/Auth/ResetPassword/ResetPasswordSuccessPage";
import CheckVerifyEmailPage from "../pages/Auth/ResetPassword/CheckVerifyPage";
import ProfilePage from "../pages/ProfilePage/ProfilePage";
import MyProfilePage from "../pages/MyProfile/MyProfilePage";
import StudyMatchAdminLayout from "../layouts/admin/StudyMatchAdminLayout";
import AdminGroupsPage from "../pages/admin/AdminGroupsPage/AdminGroupsPage";
import AdminUsersPage from "../pages/admin/AdminUsersPage/AdminUsersPage";
import AdminSchedulesPage from "../pages/admin/AdminSchedulesPage/AdminSchedulesPage";
import AdminAIMatchingPage from "../pages/admin/AdminAIMatchingPage/AdminAIMatchingPage";
import StudySessionPage from "../pages/StudySession/StudySessionPage";
import AdminDashboardPage from "../pages/admin/AdminDashboardPage/AdminDashboardPage";
import LandingPage from "../pages/Landing/LandingPage";


const ProtectedRoute = () => {
  const token = localStorage.getItem("accessToken");
  console.log("ProtectedRoute token:", token);

  if (!token) {
    return <Navigate to="/landing" replace />;
  }
  return <Outlet />;
};

export const router = createBrowserRouter([
  // Public landing page (also accessible at root for new visitors)
  {
    path: "/landing",
    element: <LandingPage />,
  },
  {
    path: "/",
    element: <LandingPage />,
  },

  {
    element: <AuthLayout />,
    children: [
      { path: "/login", element: <LoginPage /> },
      { path: "/register", element: <RegisterPage /> },
      { path: "/onboarding", element: <OnboardingFlow /> },
      {
        path: "/forgot-password",
        element: <ForgotPasswordPage />,
      },
      {
        path: "/check-email",
        element: <CheckEmailPage />,
      },
      {
        path: "/reset-password",
        element: <ResetPasswordPage />,
      },
      {
        path: "/reset-password-success",
        element: <ResetPasswordSuccessPage />,
      },
      {
        path: "/verify-email",
        element: <CheckVerifyEmailPage />,
      },
    ],
  },


  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <MainLayout />,
        children: [
          { path: "/home", element: <HomePage /> },
          { path: "/friends", element: <HomePage /> },
          { path: "/schedule", element: <StudySessionPage /> },
          { path: "/profile/:id", element: <ProfilePage /> },
          { path: "/my-profile", element: <MyProfilePage /> },
          { path: "/conversation", element: <ConversationPage /> },
          { path: "/recommendation", element: <StudyConnectionPage /> },
          { path: "/groups", element: <GroupPage /> },
        ],
      },
    ],
  },

  {
    element: <AuthLayout />,
    children: [{ path: "/create-group", element: <CreateGroupPage /> }],
  },

  {
    path: "/admin",
    element: <StudyMatchAdminLayout />,
    children: [
      {
        index: true,
        element: <Navigate to="/admin/dashboard" replace />,
      },
      {
        path: "dashboard",
        element: <AdminDashboardPage />,
      },
      {
        path: "users",
        element: <AdminUsersPage />,
      },
      {
        path: "groups",
        element: <AdminGroupsPage />,
      },
      {
        path: "schedules",
        element: <AdminSchedulesPage />,
      },
      {
        path: "matching",
        element: <AdminAIMatchingPage />,
      },
    ],
  },

]);
