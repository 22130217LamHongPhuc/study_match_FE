import { createBrowserRouter, Outlet } from "react-router-dom";
import MainLayout from "../pages/MainLayout/MainLayout";
import HomePage from "../pages/HomePage";
import FriendsPage from "../pages/FriendsLayout/FriendsPage";
import SchedulePage from "../pages/SchedulePage/SchedulePage";
import ProfilePage from "../pages/Profile";
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
    ],
  },

  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <MainLayout />,
        children: [
          { path: "/", element: <HomePage /> },
          { path: "/friends", element: <FriendsPage /> },
          { path: "/schedule", element: <SchedulePage /> },
          { path: "/profile", element: <ProfilePage /> },
          { path: "/conversation", element: <ConversationPage /> },
          { path: "/recommendation", element: <RecommendationPage /> },
          { path: "/groups", element: <GroupPage /> },
        ],
      },
    ],
  },

  {
    element: <AuthLayout />,
    children: [{ path: "/create-group", element: <CreateGroupPage /> }],
  },
]);
