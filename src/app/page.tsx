"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Toaster, toast } from "sonner";
import {
  Eye,
  EyeOff,
  Phone,
  Lock,
  User,
  Gift,
  Shield,
  Loader2,
  Zap,
  CheckCircle,
} from "lucide-react";
import {
  supabase,
  phoneToEmail,
  validateMoroccanPhone,
  validatePassword,
} from "@/lib/supabase";

type AuthMode = "login" | "register";

export default function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>("login");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  // Check if user is already logged in
  useEffect(() => {
    const checkSession = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        router.push("/dashboard");
      } else {
        setCheckingSession(false);
      }
    };
    checkSession();
  }, [router]);

  // Form states
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [referralCode, setReferralCode] = useState("");

  // OTP states
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [otpInputs, setOtpInputs] = useState(["", "", "", ""]);
  const [otpVerified, setOtpVerified] = useState(false);
  const otpRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  // Generate OTP on register mode
  useEffect(() => {
    if (mode === "register") {
      generateNewOtp();
    }
  }, [mode]);

  const generateNewOtp = () => {
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    setGeneratedOtp(otp);
    setOtpInputs(["", "", "", ""]);
    setOtpVerified(false);
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;

    const newOtpInputs = [...otpInputs];
    newOtpInputs[index] = value;
    setOtpInputs(newOtpInputs);

    // Check if OTP is complete and correct
    const enteredOtp = newOtpInputs.join("");
    if (enteredOtp.length === 4) {
      if (enteredOtp === generatedOtp) {
        setOtpVerified(true);
        toast.success("تم التحقق بنجاح");
      } else {
        setOtpVerified(false);
        toast.error("رمز التحقق غير صحيح");
        // Reset OTP
        setTimeout(() => {
          setOtpInputs(["", "", "", ""]);
          otpRefs[0].current?.focus();
        }, 500);
      }
    }

    // Auto focus next input
    if (value && index < 3) {
      otpRefs[index + 1].current?.focus();
    }
  };

  const handleOtpKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace" && !otpInputs[index] && index > 0) {
      otpRefs[index - 1].current?.focus();
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateMoroccanPhone(phone)) {
      toast.error("رقم الهاتف غير صحيح", {
        description: "يجب أن يبدأ الرقم بـ 06 أو 07 ويتكون من 10 أرقام",
      });
      return;
    }

    if (!validatePassword(password)) {
      toast.error("كلمة المرور ضعيفة", {
        description: "يجب أن تتكون كلمة المرور من 8 أحرف على الأقل",
      });
      return;
    }

    if (!otpVerified) {
      toast.error("يرجى إدخال رمز التحقق الصحيح");
      return;
    }

    setLoading(true);

    try {
      const fakeEmail = phoneToEmail(phone);

      const { data, error } = await supabase.auth.signUp({
        email: fakeEmail,
        password: password,
        options: {
          data: {
            full_name: fullName,
            phone: phone,
            referral_code: referralCode || null,
          },
        },
      });

      if (error) {
        if (error.message.includes("already registered")) {
          toast.error("هذا الرقم مسجل مسبقاً", {
            description: "يرجى تسجيل الدخول أو استخدام رقم آخر",
          });
        } else {
          toast.error("حدث خطأ", {
            description: error.message,
          });
        }
        return;
      }

      if (data.user) {
        toast.success("تم إنشاء الحساب بنجاح!", {
          description: "مرحباً بك في Brixa",
        });
        // Reset form
        setFullName("");
        setPhone("");
        setPassword("");
        setReferralCode("");
        setMode("login");
      }
    } catch (err) {
      toast.error("حدث خطأ غير متوقع");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateMoroccanPhone(phone)) {
      toast.error("رقم الهاتف غير صحيح");
      return;
    }

    if (!password) {
      toast.error("يرجى إدخال كلمة المرور");
      return;
    }

    setLoading(true);

    try {
      const fakeEmail = phoneToEmail(phone);

      const { data, error } = await supabase.auth.signInWithPassword({
        email: fakeEmail,
        password: password,
      });

      if (error) {
        if (error.message.includes("Invalid login credentials")) {
          toast.error("بيانات الدخول غير صحيحة", {
            description: "تأكد من رقم الهاتف وكلمة المرور",
          });
        } else {
          toast.error("حدث خطأ", {
            description: error.message,
          });
        }
        return;
      }

      if (data.user) {
        toast.success("تم تسجيل الدخول بنجاح!", {
          description: "جاري تحويلك...",
        });
        // Redirect to dashboard
        setTimeout(() => {
          router.push("/dashboard");
        }, 1000);
      }
    } catch (err) {
      toast.error("حدث خطأ غير متوقع");
    } finally {
      setLoading(false);
    }
  };

  // Show loading while checking session
  if (checkingSession) {
    return (
      <main className="min-h-screen bg-[#050810] flex items-center justify-center font-cairo">
        <Loader2 className="w-10 h-10 text-yellow-500 animate-spin" />
      </main>
    );
  }

  return (
    <main
      className="min-h-screen bg-[#050810] flex flex-col items-center justify-center p-4 md:p-6 relative overflow-hidden font-cairo"
      dir="rtl"
    >
      {/* Background effects */}
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-yellow-500/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-yellow-500/3 blur-[100px] rounded-full pointer-events-none" />

      {/* Toast notifications */}
      <Toaster
        position="top-center"
        richColors
        toastOptions={{
          style: {
            fontFamily: "Cairo, sans-serif",
          },
        }}
      />

      {/* Main container */}
      <div className="w-full max-w-md relative z-10 animate-fadeIn">
        {/* Logo section */}
        <div className="text-center mb-8 mt-4">
          {/* Logo icon */}
          <div className="relative inline-flex items-center justify-center w-20 h-20 mb-4">
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-2xl rotate-3 animate-pulse-glow" />
            <div className="relative bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-2xl w-full h-full flex items-center justify-center shadow-lg shadow-yellow-500/30">
              <Zap className="w-10 h-10 text-slate-950" strokeWidth={2.5} />
            </div>
          </div>

          <h1 className="text-4xl font-black text-white italic tracking-tighter uppercase">
            <span className="text-yellow-500">BRIXA</span>
          </h1>
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.3em] mt-1">
            منصة الاستثمار الذكي
          </p>
        </div>

        {/* Auth card */}
        <div className="bg-[#0a0f1e]/80 backdrop-blur-2xl p-6 md:p-8 rounded-[2.5rem] md:rounded-[3.5rem] border border-white/5 shadow-2xl">
          {/* Toggle buttons */}
          <div className="bg-slate-950 p-1.5 rounded-[1.8rem] flex mb-6 md:mb-8 border border-white/5 shadow-inner">
            <button
              type="button"
              onClick={() => setMode("login")}
              className={`flex-1 py-3 md:py-4 rounded-[1.2rem] font-black text-[10px] md:text-[11px] uppercase transition-all tracking-widest ${
                mode === "login"
                  ? "bg-yellow-500 text-slate-950 shadow-lg shadow-yellow-500/20"
                  : "text-slate-500 hover:text-slate-300"
              }`}
            >
              دخول
            </button>
            <button
              type="button"
              onClick={() => setMode("register")}
              className={`flex-1 py-3 md:py-4 rounded-[1.2rem] font-black text-[10px] md:text-[11px] uppercase transition-all tracking-widest ${
                mode === "register"
                  ? "bg-yellow-500 text-slate-950 shadow-lg shadow-yellow-500/20"
                  : "text-slate-500 hover:text-slate-300"
              }`}
            >
              تسجيل
            </button>
          </div>

          {/* Forms */}
          {mode === "login" ? (
            <form onSubmit={handleLogin} className="space-y-4">
              {/* Phone input */}
              <div className="relative group">
                <div className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-500">
                  <Phone className="w-5 h-5" />
                </div>
                <input
                  type="tel"
                  placeholder="06XXXXXXXX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-slate-950/50 border border-white/5 rounded-[1.5rem] py-4 md:py-5 pr-14 pl-5 text-right text-white focus:border-yellow-500/30 outline-none font-bold text-sm transition-all shadow-inner placeholder:text-slate-600"
                  required
                  dir="ltr"
                />
              </div>

              {/* Password input */}
              <div className="relative group">
                <div className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-500">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="كلمة المرور"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-950/50 border border-white/5 rounded-[1.5rem] py-4 md:py-5 pr-14 pl-14 text-right text-white focus:border-yellow-500/30 outline-none font-bold text-sm transition-all shadow-inner placeholder:text-slate-600"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-yellow-500 transition-colors p-1"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-yellow-500 to-yellow-400 text-slate-950 font-black py-4 md:py-5 rounded-[1.8rem] shadow-2xl shadow-yellow-500/30 flex items-center justify-center gap-3 active:scale-[0.98] transition-all mt-6 disabled:opacity-70 disabled:cursor-not-allowed hover:shadow-yellow-500/40"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <span className="uppercase tracking-[0.15em] text-[11px] md:text-[12px]">
                      دخول الحساب
                    </span>
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              {/* Full name input */}
              <div className="relative group">
                <div className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-500">
                  <User className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  placeholder="الاسم الكامل"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-slate-950/50 border border-white/5 rounded-[1.5rem] py-4 md:py-5 pr-14 pl-5 text-right text-white focus:border-yellow-500/30 outline-none font-bold text-sm transition-all shadow-inner placeholder:text-slate-600"
                  required
                />
              </div>

              {/* Phone input */}
              <div className="relative group">
                <div className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-500">
                  <Phone className="w-5 h-5" />
                </div>
                <input
                  type="tel"
                  placeholder="06XXXXXXXX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-slate-950/50 border border-white/5 rounded-[1.5rem] py-4 md:py-5 pr-14 pl-5 text-right text-white focus:border-yellow-500/30 outline-none font-bold text-sm transition-all shadow-inner placeholder:text-slate-600"
                  required
                  dir="ltr"
                />
                <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 text-xs font-bold">
                  +212
                </span>
              </div>

              {/* Password input */}
              <div className="relative group">
                <div className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-500">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="كلمة المرور (8 أحرف على الأقل)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-950/50 border border-white/5 rounded-[1.5rem] py-4 md:py-5 pr-14 pl-14 text-right text-white focus:border-yellow-500/30 outline-none font-bold text-sm transition-all shadow-inner placeholder:text-slate-600"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-yellow-500 transition-colors p-1"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>

              {/* Referral code input */}
              <div className="relative group">
                <div className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-500">
                  <Gift className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  placeholder="كود الإحالة (اختياري)"
                  value={referralCode}
                  onChange={(e) => setReferralCode(e.target.value)}
                  className="w-full bg-slate-950/50 border border-white/5 rounded-[1.5rem] py-4 md:py-5 pr-14 pl-5 text-right text-white focus:border-yellow-500/30 outline-none font-bold text-sm transition-all shadow-inner placeholder:text-slate-600"
                />
              </div>

              {/* OTP Section */}
              <div className="bg-slate-950/30 p-4 md:p-5 rounded-2xl border border-white/5">
                <div className="flex items-center justify-between mb-4">
                  <button
                    type="button"
                    onClick={generateNewOtp}
                    className="text-yellow-500 text-xs font-bold hover:text-yellow-400 transition-colors"
                  >
                    رمز جديد
                  </button>
                  <div className="flex items-center gap-2 text-slate-400">
                    <span className="text-xs font-bold">رمز التحقق</span>
                    <Shield className="w-4 h-4" />
                  </div>
                </div>

                {/* OTP Display */}
                <div className="bg-gradient-to-r from-yellow-500/10 to-yellow-600/5 p-3 rounded-xl mb-4 border border-yellow-500/20">
                  <p className="text-center text-2xl font-black text-yellow-500 tracking-[0.5em]">
                    {generatedOtp}
                  </p>
                  <p className="text-center text-[10px] text-slate-500 mt-1">
                    أدخل هذا الرمز أدناه
                  </p>
                </div>

                {/* OTP Inputs */}
                <div className="flex justify-center gap-3" dir="ltr">
                  {otpInputs.map((digit, index) => (
                    <input
                      key={index}
                      ref={otpRefs[index]}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) =>
                        handleOtpChange(index, e.target.value.replace(/\D/g, ""))
                      }
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      className={`otp-input ${
                        otpVerified
                          ? "!border-green-500 !bg-green-500/10"
                          : ""
                      }`}
                    />
                  ))}
                </div>

                {otpVerified && (
                  <div className="flex items-center justify-center gap-2 mt-3 text-green-500">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-xs font-bold">تم التحقق</span>
                  </div>
                )}
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={loading || !otpVerified}
                className="w-full bg-gradient-to-r from-yellow-500 to-yellow-400 text-slate-950 font-black py-4 md:py-5 rounded-[1.8rem] shadow-2xl shadow-yellow-500/30 flex items-center justify-center gap-3 active:scale-[0.98] transition-all mt-6 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-yellow-500/40"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <span className="uppercase tracking-[0.15em] text-[11px] md:text-[12px]">
                      إنشاء الحساب
                    </span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* Footer text */}
          <p className="text-center text-slate-600 text-[10px] mt-6">
            {mode === "login"
              ? "ليس لديك حساب؟ "
              : "لديك حساب بالفعل؟ "}
            <button
              type="button"
              onClick={() => setMode(mode === "login" ? "register" : "login")}
              className="text-yellow-500 font-bold hover:text-yellow-400 transition-colors"
            >
              {mode === "login" ? "سجل الآن" : "سجل الدخول"}
            </button>
          </p>
        </div>

        {/* Bottom branding */}
        <p className="text-center text-slate-700 text-[9px] mt-6 uppercase tracking-widest">
          Brixa © 2026 - All Rights Reserved
        </p>
      </div>
    </main>
  );
}
