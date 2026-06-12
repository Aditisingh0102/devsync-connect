import { useState, useEffect } from "react";
import { Mail, CheckCircle, Clock, AlertCircle } from "lucide-react";

interface OTPVerificationProps {
  email: string;
  onVerify: (otp: string) => Promise<boolean>;
  onResend: () => Promise<boolean>;
  onBackClick?: () => void;
  title?: string;
  subtitle?: string;
}

export function OTPVerification({
  email,
  onVerify,
  onResend,
  onBackClick,
  title = "Verify your email",
  subtitle = "Enter the 6-digit code we sent to your email",
}: OTPVerificationProps) {
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(600); // 10 minutes
  const [canResend, setCanResend] = useState(false);

  // Timer for OTP expiry
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setError("OTP has expired. Please request a new one.");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Resend cooldown timer
  useEffect(() => {
    const timer = setTimeout(() => {
      setCanResend(true);
    }, 30000); // 30 seconds

    return () => clearTimeout(timer);
  }, [isResending]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const handleOTPChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 6);
    setOtp(value);
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (otp.length !== 6) {
      setError("Please enter a 6-digit OTP");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const isValid = await onVerify(otp);
      if (isValid) {
        setSuccess(true);
      } else {
        setError("Invalid OTP. Please try again.");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setIsResending(true);
    setCanResend(false);
    setOtp("");
    setError("");
    setTimeRemaining(600);

    try {
      const success = await onResend();
      if (!success) {
        setError("Failed to resend OTP. Please try again.");
      }
    } catch (err) {
      setError("An error occurred while resending OTP.");
    } finally {
      setIsResending(false);
    }
  };

  if (success) {
    return (
      <div className="w-full max-w-md mx-auto">
        <div className="ds-card p-8 backdrop-blur-xl border-border/50 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-emerald-500/20 rounded-full">
              <CheckCircle className="size-8 text-emerald-500" />
            </div>
          </div>
          <h2 className="text-xl font-bold mb-2">Email Verified!</h2>
          <p className="text-muted-foreground mb-6">
            Your email has been verified successfully. You can now continue.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="ds-card p-8 backdrop-blur-xl border-border/50">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2">{title}</h2>
          <p className="text-muted-foreground text-sm">{subtitle}</p>
          <p className="text-muted-foreground text-sm mt-1 flex items-center gap-1">
            <Mail className="size-4" /> {email}
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-2">
            <AlertCircle className="size-4 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* OTP Timer */}
        <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg flex items-center gap-2">
          <Clock className="size-4 text-blue-500" />
          <span className="text-sm text-blue-600 flex-1">
            OTP expires in {formatTime(timeRemaining)}
          </span>
          {timeRemaining < 60 && (
            <span className="text-xs font-semibold text-orange-600 bg-orange-500/20 px-2 py-1 rounded">
              Expiring soon
            </span>
          )}
        </div>

        {/* OTP Input Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="otp" className="text-sm font-medium mb-1.5 block">
              Enter OTP
            </label>
            <input
              id="otp"
              type="text"
              inputMode="numeric"
              placeholder="000000"
              value={otp}
              onChange={handleOTPChange}
              maxLength={6}
              className="ds-input text-center text-2xl tracking-widest font-mono"
              disabled={isLoading}
            />
            <p className="text-xs text-muted-foreground mt-1">{otp.length}/6 digits</p>
          </div>

          {/* Verify Button */}
          <button
            type="submit"
            disabled={isLoading || otp.length !== 6 || timeRemaining === 0}
            className="w-full ds-button-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Verifying..." : "Verify OTP"}
          </button>
        </form>

        {/* Resend Section */}
        <div className="mt-6 pt-6 border-t border-border">
          <p className="text-sm text-muted-foreground text-center mb-3">
            Didn't receive the code?
          </p>
          <button
            onClick={handleResend}
            disabled={!canResend || isResending}
            className="w-full px-4 py-2 text-sm font-medium border border-border rounded-lg hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isResending ? "Sending..." : canResend ? "Resend OTP" : "Resend in 30s"}
          </button>
        </div>

        {/* Back Link */}
        {onBackClick && (
          <button
            onClick={onBackClick}
            className="w-full mt-4 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Back
          </button>
        )}
      </div>
    </div>
  );
}
