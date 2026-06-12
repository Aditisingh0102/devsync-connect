import { useState, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useApp } from "@/lib/store";
import { Eye, EyeOff, Sparkles, ArrowRight, Check, X, UserPlus, ShieldCheck, LogIn } from "lucide-react";
import { OTPVerification } from "@/components/OTPVerification";
import { sendOTP, verifyOTP, clearOTPSession } from "@/utils/otp";

function getPasswordStrength(pw: string): { score: number; label: string; color: string } {
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[a-z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;

  if (score <= 2) return { score: 1, label: "Weak", color: "bg-red-500" };
  if (score <= 3) return { score: 2, label: "Fair", color: "bg-orange-500" };
  if (score <= 4) return { score: 3, label: "Good", color: "bg-yellow-500" };
  if (score <= 5) return { score: 4, label: "Strong", color: "bg-emerald-500" };
  return { score: 5, label: "Excellent", color: "bg-emerald-400" };
}

const PASSWORD_RULES = [
  { test: (pw: string) => pw.length >= 8, label: "At least 8 characters" },
  { test: (pw: string) => /[A-Z]/.test(pw), label: "One uppercase letter" },
  { test: (pw: string) => /[a-z]/.test(pw), label: "One lowercase letter" },
  { test: (pw: string) => /[0-9]/.test(pw), label: "One number" },
  { test: (pw: string) => /[^A-Za-z0-9]/.test(pw), label: "One special character" },
];

export default function Signup() {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();

  // Form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [agreed, setAgreed] = useState(false);

  // OTP state
  const [showOTPVerification, setShowOTPVerification] = useState(false);
  const [otpEmail, setOtpEmail] = useState("");
  const [formData, setFormData] = useState<any>(null);

  const strength = useMemo(() => getPasswordStrength(password), [password]);
  const passwordsMatch = password.length > 0 && confirmPassword.length > 0 && password === confirmPassword;

  const isUsernameTaken = useMemo(() => {
    if (!username.trim()) return false;
    return Object.values(state.users || {}).some(
      (u) => u.username?.toLowerCase() === username.trim().toLowerCase()
    );
  }, [username, state.users]);

  const validate = (isLoginAttempt: boolean): boolean => {
    const e: Record<string, string> = {};
    if (!isLoginAttempt && !name.trim()) e.name = "Full name is required";
    if (!username.trim()) e.username = "Username is required";
    else if (username.trim().length < 3) e.username = "Username must be at least 3 characters";
    else if (!/^[a-zA-Z0-9_]+$/.test(username.trim())) e.username = "Only letters, numbers, and underscores";
    if (!isLoginAttempt) {
      if (!email.trim()) e.email = "Email is required";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) e.email = "Enter a valid email address";
    }
    if (!password) e.password = "Password is required";
    else if (!isLoginAttempt && password.length < 8) e.password = "Password must be at least 8 characters";
    if (!isLoginAttempt && !confirmPassword) e.confirmPassword = "Please confirm your password";
    else if (!isLoginAttempt && password !== confirmPassword) e.confirmPassword = "Passwords do not match";
    if (!isLoginAttempt && !agreed) e.agreed = "You must accept the terms to continue";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const [loginMessage, setLoginMessage] = useState("");

  const submit = () => {
    // Validate inputs first
    if (!validate(false)) return;

    const users = Object.values(state.users || {});
    const trimmedUsername = username.trim().toLowerCase();
    const trimmedEmail = email.trim().toLowerCase();

    // Check if username is already taken
    const existingUser = users.find(
      (u) =>
        u.username?.toLowerCase() === trimmedUsername ||
        u.handle?.toLowerCase() === `@${trimmedUsername}`
    );

    // Check if email is already registered
    const existingEmail = users.find(
      (u) => u.email?.toLowerCase() === trimmedEmail
    );

    if (existingUser || existingEmail) {
      const e: Record<string, string> = {};
      if (existingUser) {
        e.username = "Username is already taken";
      }
      if (existingEmail) {
        e.email = "Email is already registered. Please sign in instead.";
      }
      setErrors(e);
      return;
    }

    // Send OTP to email
    const result = sendOTP(email.trim());
    if (result.success) {
      // Store form data for account creation after OTP verification
      setFormData({
        name: name.trim(),
        email: email.trim(),
        username: username.trim(),
        password,
      });
      setOtpEmail(email.trim());
      setShowOTPVerification(true);
    } else {
      setErrors({ email: result.message });
    }
  };

  const handleOTPVerify = async (otp: string): Promise<boolean> => {
    const result = verifyOTP(otpEmail, otp);
    if (result.success) {
      // OTP verified - create account
      createAccount();
      return true;
    } else {
      throw new Error(result.message);
    }
  };

  const handleOTPResend = async (): Promise<boolean> => {
    const result = sendOTP(otpEmail);
    return result.success;
  };

  const createAccount = () => {
    if (!formData) return;

    const id = `u_${Date.now()}`;
    const user = {
      id,
      name: formData.name,
      username: formData.username,
      handle: `@${formData.username}`,
      avatar: formData.name.split(" ").map((s: string) => s[0]).slice(0, 2).join("").toUpperCase(),
      email: formData.email,
      password: formData.password,
      profileCompleted: false,
      followers: [],
      following: [],
      pendingRequests: [],
      sentRequests: [],
      links: { github: "", linkedin: "", portfolio: "" },
    } as any;
    
    dispatch({ type: "updateUser", payload: user });
    dispatch({ type: "setCurrentUser", payload: user });
    
    setLoginMessage("Account created successfully! Redirecting...");
    setTimeout(() => {
      navigate("/onboarding/profile-setup");
    }, 500);
  };

  const handleOTPBackClick = () => {
    setShowOTPVerification(false);
    clearOTPSession(otpEmail);
    setOtpEmail("");
    setFormData(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !loginMessage && !showOTPVerification) submit();
  };

  // Show OTP verification screen
  if (showOTPVerification) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4">
        {/* Background glow */}
        <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 -left-32 size-[500px] rounded-full bg-primary/10 blur-[120px]" />
          <div className="absolute bottom-1/4 -right-32 size-[400px] rounded-full bg-purple/10 blur-[120px]" />
        </div>

        <OTPVerification
          email={otpEmail}
          onVerify={handleOTPVerify}
          onResend={handleOTPResend}
          onBackClick={handleOTPBackClick}
          title="Verify your email"
          subtitle="Enter the 6-digit code we sent to your email address"
        />
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4">
      {/* Background glow */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-32 size-[500px] rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute bottom-1/4 -right-32 size-[400px] rounded-full bg-purple/10 blur-[120px]" />
      </div>

      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-4">
            <Sparkles className="size-3.5" /> Join DevSync
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-bold tracking-tight">
            Create your account
          </h1>
          <p className="text-muted-foreground mt-2">
            Start discovering projects and building with great teams.
          </p>
        </div>

        {/* Card */}
        <div className="ds-card p-8 backdrop-blur-xl border-border/50">
          <div className="space-y-5" onKeyDown={handleKeyDown}>
            {/* Name */}
            <div>
              <label htmlFor="signup-name" className="text-sm font-medium mb-1.5 block">Full name</label>
              <input
                id="signup-name"
                value={name}
                onChange={(e) => { setName(e.target.value); setErrors((p) => ({ ...p, name: "" })); }}
                placeholder="John Doe"
                className="ds-input"
                autoComplete="name"
              />
              {errors.name && <p className="text-xs text-danger mt-1.5">{errors.name}</p>}
            </div>

            {/* Username */}
            <div>
              <label htmlFor="signup-username" className="text-sm font-medium mb-1.5 block">Username</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">@</span>
                <input
                  id="signup-username"
                  value={username}
                  onChange={(e) => { setUsername(e.target.value.replace(/\s/g, "")); setErrors((p) => ({ ...p, username: "" })); }}
                  placeholder="johndoe"
                  className="ds-input pl-8"
                  autoComplete="username"
                />
                {username.trim().length >= 3 && !isUsernameTaken && (
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2">
                    <Check className="size-4 text-emerald-500" />
                  </span>
                )}
                {isUsernameTaken && (
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2">
                    <X className="size-4 text-danger" />
                  </span>
                )}
              </div>
              {errors.username && <p className="text-xs text-danger mt-1.5">{errors.username}</p>}
              {isUsernameTaken && !errors.username && <p className="text-xs text-danger mt-1.5">Username is already taken</p>}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="signup-email" className="text-sm font-medium mb-1.5 block">Email address</label>
              <input
                id="signup-email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setErrors((p) => ({ ...p, email: "" })); }}
                type="email"
                placeholder="john@university.edu"
                className="ds-input"
                autoComplete="email"
              />
              {errors.email && <p className="text-xs text-danger mt-1.5">{errors.email}</p>}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="signup-password" className="text-sm font-medium mb-1.5 block">Password</label>
              <div className="relative">
                <input
                  id="signup-password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setErrors((p) => ({ ...p, password: "" })); }}
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a strong password"
                  className="ds-input pr-11"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-danger mt-1.5">{errors.password}</p>}

              {/* Strength meter */}
              {password.length > 0 && (
                <div className="mt-3 space-y-2.5">
                  <div className="flex items-center gap-2.5">
                    <div className="flex-1 flex gap-1">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div
                          key={i}
                          className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                            i <= strength.score ? strength.color : "bg-border"
                          }`}
                        />
                      ))}
                    </div>
                    <span className={`text-xs font-semibold ${
                      strength.score <= 1 ? "text-red-500" :
                      strength.score <= 2 ? "text-orange-500" :
                      strength.score <= 3 ? "text-yellow-500" :
                      "text-emerald-500"
                    }`}>
                      {strength.label}
                    </span>
                  </div>

                  {/* Password rules */}
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                    {PASSWORD_RULES.map((rule) => {
                      const passed = rule.test(password);
                      return (
                        <div key={rule.label} className="flex items-center gap-1.5">
                          {passed ? (
                            <Check className="size-3 text-emerald-500 shrink-0" />
                          ) : (
                            <X className="size-3 text-muted-foreground/50 shrink-0" />
                          )}
                          <span className={`text-[11px] ${passed ? "text-emerald-500" : "text-muted-foreground/60"}`}>
                            {rule.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="signup-confirm" className="text-sm font-medium mb-1.5 block">Confirm password</label>
              <div className="relative">
                <input
                  id="signup-confirm"
                  value={confirmPassword}
                  onChange={(e) => { setConfirmPassword(e.target.value); setErrors((p) => ({ ...p, confirmPassword: "" })); }}
                  type={showConfirm ? "text" : "password"}
                  placeholder="Re-enter your password"
                  className="ds-input pr-11"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                  aria-label={showConfirm ? "Hide password" : "Show password"}
                >
                  {showConfirm ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
                {passwordsMatch && (
                  <span className="absolute right-10 top-1/2 -translate-y-1/2">
                    <Check className="size-4 text-emerald-500" />
                  </span>
                )}
              </div>
              {errors.confirmPassword && <p className="text-xs text-danger mt-1.5">{errors.confirmPassword}</p>}
            </div>

            {/* Terms */}
            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => { setAgreed(e.target.checked); setErrors((p) => ({ ...p, agreed: "" })); }}
                className="mt-0.5 size-4 rounded border-border accent-primary cursor-pointer"
              />
              <span className="text-xs text-muted-foreground leading-relaxed group-hover:text-foreground transition-colors">
                I agree to the <span className="text-primary font-medium cursor-pointer hover:underline">Terms of Service</span> and{" "}
                <span className="text-primary font-medium cursor-pointer hover:underline">Privacy Policy</span>
              </span>
            </label>
            {errors.agreed && <p className="text-xs text-danger -mt-2">{errors.agreed}</p>}

            {/* Login message */}
            {loginMessage && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm font-medium animate-in fade-in slide-in-from-bottom-2 duration-300">
                <Check className="size-4 shrink-0" />
                {loginMessage}
              </div>
            )}

            {/* Submit */}
            <button
              onClick={submit}
              disabled={!!loginMessage}
              className="h-12 w-full rounded-xl bg-primary text-white font-semibold text-sm inline-flex items-center justify-center gap-2 hover:bg-primary-hover transition-all shadow-glow active:scale-[0.98] disabled:opacity-70"
            >
              {loginMessage ? (
                <>
                  <div className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Redirecting…
                </>
              ) : (
                <>
                  <UserPlus className="size-4" />
                  Create account
                  <ArrowRight className="size-4" />
                </>
              )}
            </button>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground">or</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* OAuth placeholder buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button className="h-11 rounded-xl bg-card border border-border text-sm font-medium inline-flex items-center justify-center gap-2 hover:bg-secondary transition-colors">
              <svg className="size-4" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
              Google
            </button>
            <button className="h-11 rounded-xl bg-card border border-border text-sm font-medium inline-flex items-center justify-center gap-2 hover:bg-secondary transition-colors">
              <svg className="size-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/></svg>
              GitHub
            </button>
          </div>

          {/* Sign in link */}
          <p className="text-center text-sm text-muted-foreground mt-6">
            Already have an account?{" "}
            <Link to="/login" className="text-primary font-semibold hover:underline">
              Sign in
            </Link>
          </p>
        </div>

        {/* Security badge */}
        <div className="flex items-center justify-center gap-2 mt-6 text-xs text-muted-foreground">
          <ShieldCheck className="size-3.5" />
          <span>Your data is encrypted and stored securely</span>
        </div>
      </div>
    </div>
  );
}
