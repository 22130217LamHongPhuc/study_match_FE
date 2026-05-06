import Branding from "./Branding";
import WelcomeSection from "./WelcomeSection";
import LoginForm from "./LoginForm";
import Divider from "./Divider";
import SocialLoginGroup from "./SocialLoginGroup";
import RegisterText from "./RegisterText";

export default function LoginCard() {
  return (
    <div className="rounded-[28px] bg-white p-8">
      <WelcomeSection />
      <LoginForm />
      <Divider />
      <SocialLoginGroup />
      <RegisterText />
    </div>
  );
}
