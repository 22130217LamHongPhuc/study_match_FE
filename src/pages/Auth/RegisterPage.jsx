import BackgroundLayer from "./components/BackgroundLayer";
import RegisterForm from "./components/RegisterForm";

export default function RegisterPage() {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-[#f7f5f0] font-sans text-slate-900">
      <BackgroundLayer />

      <main className="relative z-10 flex min-h-screen flex-1 items-center justify-center px-4 py-6">
        <div className="w-full max-w-lg">
          <RegisterForm />
        </div>
      </main>
    </div>
  );
}
