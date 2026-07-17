import { useEffect } from "react";
import { toast } from "react-toastify";
import BackgroundLayer from "./components/BackgroundLayer";
import LoginCard from "./components/LoginCard";
import Footer from "./../../components/Footer/Footer";

export default function LoginPage() {
  useEffect(() => {
    const msg = localStorage.getItem("session_locked_message");
    if (msg) {
      toast.error(msg);
      localStorage.removeItem("session_locked_message");
    }
  }, []);
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-[#f7f5f0] text-slate-900" style={{ fontFamily: "Arial, sans-serif" }}>
      <BackgroundLayer />

      <main className="relative z-10 flex min-h-screen flex-1 items-center justify-center px-4 py-6">
        <div className="w-full max-w-lg">
          <LoginCard />
        </div>
      </main>
    </div>
  );
}
