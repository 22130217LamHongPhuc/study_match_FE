import { createBrowserRouter } from "react-router-dom";
import MainLayout from "../pages/MainLayout/MainLayout";
import HomePage from "../pages/HomePage";
import FriendsPage from "../pages/FriendsLayout/FriendsPage";
import SchedulePage from "../pages/SchedulePage/SchedulePage";
import RecommendationPage from "../pages/Recommendation";
import { Login } from "@mui/icons-material";
import { AuthLayout } from "../pages/MainLayout/AuthLayout";
import LoginPage from "../pages/Auth/LoginPage";
import RegisterPage from "../pages/Auth/RegisterPage";
import OnboardingFlow from "../pages/Onboarding/Onboarding";
import ConversationPage from "../pages/Conversation/ConversationPage";
import ProfilePage from "../pages/ProfilePage/ProfilePage";

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
    element: <MainLayout />,
    children: [
      { path: "/", element: <HomePage /> },
      { path: "/friends", element: <HomePage /> },
      { path: "/schedule", element: <SchedulePage /> },
      { path: "/profile/:id", element: <ProfilePage /> },
      { path: "/conversation", element: <ConversationPage /> },
      { path: "/recommendation", element: <RecommendationPage /> },
    ],
  },
]);
