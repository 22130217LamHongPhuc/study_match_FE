import { createBrowserRouter, Outlet } from "react-router-dom";
import MainLayout from "../pages/MainLayout/MainLayout";
import HomePage from "../pages/HomePage";
import FriendsPage from "../pages/FriendsLayout/FriendsPage";
import SchedulePage from "../pages/SchedulePage/SchedulePage";
import RecommendationPage from "../pages/Recommendation";
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



const ProtectedRoute = () => {
  const token = localStorage.getItem("accessToken");
  console.log("ProtectedRoute token:", token);

  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
};

export const router = createBrowserRouter([
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
          { path: "/", element: <HomePage /> },
          { path: "/friends", element: <HomePage /> },
          { path: "/schedule", element: <SchedulePage /> },
          { path: "/profile/:id", element: <ProfilePage /> },
          { path: "/conversation", element: <ConversationPage /> },
          { path: "/recommendation", element: <RecommendationPage /> },
          { path: "/groups", element: <GroupPage /> },

        ],
      }

    ],
  },

  {
    element: <AuthLayout />,
    children: [{ path: "/create-group", element: <CreateGroupPage /> }],
  },
]);
