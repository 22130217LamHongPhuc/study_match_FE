import { GoogleLogin, CredentialResponse } from "@react-oauth/google";
import { loginWithGoogle } from "../../../services/AuthService";
import { useNavigate } from "react-router-dom";

const facebookIcon =
  "https://upload.wikimedia.org/wikipedia/commons/5/51/Facebook_f_logo_%282019%29.svg";

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
        navigate("/");
      } else {
        console.log("Google login failed:", response.message);
      }
    } catch (error) {
      console.log("Google login error:", error);
    }
  };

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="flex items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-white px-2 py-1 transition hover:bg-slate-50">
        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={() => console.log("Google Login Failed")}
          text="signin_with"
        />
      </div>

      <button
        type="button"
        onClick={() => console.log("Facebook login chưa làm")}
        className="flex items-center justify-center gap-3 rounded-xl border border-slate-200 px-4 py-3 transition hover:bg-slate-50"
      >
        <img
          src={facebookIcon}
          alt="Facebook"
          className="h-5 w-5 object-contain"
        />
        <span className="text-sm font-bold text-slate-800">Facebook</span>
      </button>
    </div>
  );
}
