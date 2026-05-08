import WelcomeSection from "../components/home/WelcomeSection";
import { useProfileData } from "./Profile/hooks/useProfileData";
export default function HomePage() {
  const userId = Number(localStorage.getItem("userId"));
  useProfileData(userId);

  return (
    <>
      <WelcomeSection />
    </>
  );
}
