import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useApp } from "@/lib/store";
import { Eye, EyeOff, Sparkles, ArrowRight, ArrowLeft, ShieldCheck, Check, Lock } from "lucide-react";
import { OTPVerification } from "@/components/OTPVerification";
import { sendOTP, verifyOTP, clearOTPSession } from "@/utils/otp";

export default function ForgotPassword() {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();

  // Step 1: Email input
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Step 2: OTP verification
  const [showOTPVerification, setShowOTPVerification] = useState(false);
  const [otpEmail, setOtpEmail] = useState("");

  // Step 3: New password
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({});
  const [isResettingPassword, setIsResettingPassword] = useState(false);

  const PASSWORD_RULES = [
    { test: (pw: string) => pw.length >= 8, label: "At least 8 characters" },
    { test: (pw: string) => /[A-Z]/.test(pw), label: "One uppercase letter" },
    { test: (pw: string) => /[a-z]/.test(pw), label: "One lowercase letter" },
    { test: (pw: string) => /[0-9]/.test(pw), label: "One number" },
    { test: (pw: string) => /[^A-Za-z0-9]/.test(pw), label: "One special character" },
  ];

  const validateEmail = (): boolean => {
    const e: Record<string, string> = {};
    if (!email.trim()) {
      e.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      e.email = "Enter a valid email address";
    } else {
      // Check if email exists in system
      const emailExists = Object.values(state.users || {}).some(
        (u) => u.email?.toLowerCase() === email.trim().toLowerCase()
      );
      if (!emailExists) {
        e.email = "No account found with this email address";
      }
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateNewPassword = (): boolean => {
    const e: Record<string, string> = {};
    if (!newPassword) {
      e.password = "Password is required";
    } else if (newPassword.length < 8) {
      e.password = "Password must be at least 8 characters";
    }
    if (!confirmPassword) {
      e.confirmPassword = "Please confirm your password";
    } else if (newPassword !== confirmPassword) {
      e.confirmPassword = "Passwords do not match";
    }
    setPasswordErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleRequestReset = () => {
    if (!validateEmail()) return;

    const result = sendOTP(email.trim());
    if (result.success) {
      setOtpEmail(email.trim());
      setShowOTPVerification(true);
    } else {
      setErrors({ email: result.message });
    }
  };

  const handleOTPVerify = async (otp: string): Promise<boolean> => {
    const result = verifyOTP(otpEmail, otp);
    if (result.success) {
      setShowOTPVerification(false);
      setShowPasswordReset(true);
      return true;
    } else {
      throw new Error(result.message || "Invalid OTP. Please try again.");
    }
  };

  const handleOTPResend = async (): Promise<boolean> => {
    const result = sendOTP(otpEmail);
    return result.success;
  };

  const handleResetPassword = async () => {
    if (!validateNewPassword()) return;

    setIsResettingPassword(true);

    // Simulate API call
    setTimeout(() => {
      try {
        // Find and update user
        const users = Object.values(state.users || {});
        const user = users.find(
          (u) => u.email?.toLowerCase() === otpEmail.toLowerCase()
        );

        if (user) {
          // Update user password
          const updatedUser = { ...user, password: newPassword };
          dispatch({ type: "updateUser", payload: updatedUser });

          // If user is currently logged in, update them
          if (state.currentUser?.id === user.id) {
            dispatch({ type: "setCurrentUser", payload: updatedUser });
          }

          // Show success and redirect
          setPasswordErrors({});
          setTimeout(() => {
            navigate("/login?reset=success");
          }, 500);
        }
      } catch (err) {
        setPasswordErrors({ submit: "Failed to reset password. Please try again." });
      } finally {
        setIsResettingPassword(false);
      }
    }, 500);
  };

  const handleOTPBackClick = () => {
    setShowOTPVerification(false);
    clearOTPSession(otpEmail);
    setOtpEmail("");
  };

  const handleBackToEmail = () => {
    setShowPasswordReset(false);
    setNewPassword("");
    setConfirmPassword("");
    setPasswordErrors({});
  };

  // OTP Verification Screen
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
          subtitle="Enter the 6-digit code we sent to your email"
        />
      </div>
    );
  }

  // Password Reset Screen
  if (showPasswordReset) {
    const passwordsMatch = newPassword.length > 0 && confirmPassword.length > 0 && newPassword === confirmPassword;

    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4">
        {/* Background glow */}
        <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="absolute top-1/3 -right-32 size-[500px] rounded-full bg-primary/10 blur-[120px]" />
          <div className="absolute bottom-1/3 -left-32 size-[400px] rounded-full bg-purple/10 blur-[120px]" />
        </div>

        <div className="w-full max-w-lg">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-4">
              <Lock className="size-3.5" /> Reset password
            </div>
            <h1 className="font-display text-3xl md:text-4xl font-bold tracking-tight">
              Create new password
            </h1>
            <p className="text-muted-foreground mt-2">
              Enter a strong password to secure your account.
            </p>
          </div>

          {/* Card */}
          <div className="ds-card p-8 backdrop-blur-xl border-border/50">
            <div className="space-y-5">
              {/* New Password */}
              <div>
                <label htmlFor="new-password" className="text-sm font-medium mb-1.5 block">
                  New password
                </label>
                <div className="relative">
                  <input
                    id="new-password"
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      setPasswordErrors((p) => ({ ...p, password: "" }));
                    }}
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
                {passwordErrors.password && (
                  <p className="text-xs text-danger mt-1.5">{passwordErrors.password}</p>
                )}

                {/* Password rules */}
                {newPassword.length > 0 && (
                  <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1">
                    {PASSWORD_RULES.map((rule) => {
                      const passed = rule.test(newPassword);
                      return (
                        <div key={rule.label} className="flex items-center gap-1.5">
                          {passed ? (
                            <Check className="size-3 text-emerald-500 shrink-0" />
                          ) : (
                            <div className="size-3 rounded-full border border-muted-foreground/30 shrink-0" />
                          )}
                          <span
                            className={`text-[11px] ${
                              passed ? "text-emerald-500" : "text-muted-foreground/60"
                            }`}
                          >
                            {rule.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label htmlFor="confirm-password" className="text-sm font-medium mb-1.5 block">
                  Confirm password
                </label>
                <div className="relative">
                  <input
                    id="confirm-password"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      setPasswordErrors((p) => ({ ...p, confirmPassword: "" }));
                    }}
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
                {passwordErrors.confirmPassword && (
                  <p className="text-xs text-danger mt-1.5">{passwordErrors.confirmPassword}</p>
                )}
              </div>

              {/* Error message */}
              {passwordErrors.submit && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <p className="text-sm text-red-600">{passwordErrors.submit}</p>
                </div>
              )}

              {/* Submit buttons */}
              <div className="space-y-3 pt-2">
                <button
                  onClick={handleResetPassword}
                  disabled={isResettingPassword || !passwordsMatch}
                  className="h-12 w-full rounded-xl bg-primary text-white font-semibold text-sm inline-flex items-center justify-center gap-2 hover:bg-primary-hover transition-all shadow-glow active:scale-[0.98] disabled:opacity-70"
                >
                  {isResettingPassword ? (
                    <>
                      <div className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Resetting...
                    </>
                  ) : (
                    <>
                      <Lock className="size-4" />
                      Reset password
                      <ArrowRight className="size-4" />
                    </>
                  )}
                </button>
                <button
                  onClick={handleBackToEmail}
                  className="h-12 w-full rounded-xl border border-border text-sm font-medium inline-flex items-center justify-center gap-2 hover:bg-accent transition-colors"
                >
                  <ArrowLeft className="size-4" />
                  Back
                </button>
              </div>
            </div>
          </div>

          {/* Security badge */}
          <div className="flex items-center justify-center gap-2 mt-6 text-xs text-muted-foreground">
            <ShieldCheck className="size-3.5" />
            <span>Your password is encrypted and stored securely</span>
          </div>
        </div>
      </div>
    );
  }

  // Email Input Screen
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4">
      {/* Background glow */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 -right-32 size-[500px] rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute bottom-1/3 -left-32 size-[400px] rounded-full bg-purple/10 blur-[120px]" />
      </div>

      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-4">
            <Sparkles className="size-3.5" /> Reset password
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-bold tracking-tight">
            Forgot your password?
          </h1>
          <p className="text-muted-foreground mt-2">
            Enter your email and we'll send you a code to reset it.
          </p>
        </div>

        {/* Card */}
        <div className="ds-card p-8 backdrop-blur-xl border-border/50">
          <div className="space-y-5">
            {/* Email */}
            <div>
              <label htmlFor="reset-email" className="text-sm font-medium mb-1.5 block">
                Email address
              </label>
              <input
                id="reset-email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setErrors((p) => ({ ...p, email: "" }));
                }}
                type="email"
                placeholder="john@university.edu"
                className="ds-input"
                autoComplete="email"
              />
              {errors.email && <p className="text-xs text-danger mt-1.5">{errors.email}</p>}
            </div>

            {/* Submit */}
            <button
              onClick={handleRequestReset}
              className="h-12 w-full rounded-xl bg-primary text-white font-semibold text-sm inline-flex items-center justify-center gap-2 hover:bg-primary-hover transition-all shadow-glow active:scale-[0.98]"
            >
              Send reset code
              <ArrowRight className="size-4" />
            </button>
          </div>

          {/* Back to login link */}
          <p className="text-center text-sm text-muted-foreground mt-6">
            Remember your password?{" "}
            <Link to="/login" className="text-primary font-semibold hover:underline">
              Sign in
            </Link>
          </p>
        </div>

        {/* Security badge */}
        <div className="flex items-center justify-center gap-2 mt-6 text-xs text-muted-foreground">
          <ShieldCheck className="size-3.5" />
          <span>Your account stays secure with OTP verification</span>
        </div>
      </div>
    </div>
  );
}
