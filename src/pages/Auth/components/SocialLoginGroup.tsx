import { GoogleLogin, CredentialResponse } from "@react-oauth/google";
import { loginWithGoogle } from "../../../services/AuthService";
import { useNavigate } from "react-router-dom";

export default function SocialLoginGroup() {
  const navigate = useNavigate();
  const handleGoogleSuccess = async (
    credentialResponse: CredentialResponse,
  ) => {
    try {
      const idToken = credentialResponse.credential;

      if (!idToken) {
        console.log("Không lấy được Google ID Token");
        return;
      }
      const response = await loginWithGoogle(idToken);

      if (response.success) {
        console.log("Google login successful:", response.data);
        localStorage.setItem("accessToken", response.data.accessToken);
        localStorage.setItem("refreshToken", response.data.refreshToken);
        localStorage.setItem("userId", response.data.userId.toString());
        if (!response.data.onboardingCompleted) {
          navigate("/onboarding");
          return;
        }
        navigate("/home");
      } else {
        console.log("Google login failed:", response.message);
      }
    } catch (error) {
      console.log("Google login error:", error);
    }
  };

  return (
    <div className="flex justify-center w-full">
      <GoogleLogin
        onSuccess={handleGoogleSuccess}
        onError={() => console.log("Google Login Failed")}
        text="signin_with"
        theme="outline"
        size="large"
        shape="rectangular"
        width="400"
      />
    </div>
  );
}
