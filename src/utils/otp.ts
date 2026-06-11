/**
 * OTP Utility Functions
 * Generates, validates, and manages OTP for signup and password recovery
 */

export interface OTPSession {
  email: string;
  otp: string;
  expiresAt: number;
  attempts: number;
  maxAttempts: number;
}

const OTP_LENGTH = 6;
const OTP_EXPIRY_MINUTES = 10;
const MAX_ATTEMPTS = 5;
const OTP_RESEND_COOLDOWN_SECONDS = 30;

// Store OTP sessions in memory (in production, this should be on the backend)
const otpSessions: Record<string, OTPSession> = {};
const resendCooldowns: Record<string, number> = {};

/**
 * Generate a random 6-digit OTP
 */
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Send OTP to email (simulated - in production, call backend API)
 * @param email - Email address to send OTP to
 * @returns Generated OTP (in production, this should not be returned)
 */
export function sendOTP(email: string): { success: boolean; otp?: string; message: string } {
  try {
    const normalizedEmail = email.toLowerCase().trim();

    // Check cooldown period
    const lastSendTime = resendCooldowns[normalizedEmail];
    if (lastSendTime && Date.now() - lastSendTime < OTP_RESEND_COOLDOWN_SECONDS * 1000) {
      const secondsRemaining = Math.ceil(
        (OTP_RESEND_COOLDOWN_SECONDS * 1000 - (Date.now() - lastSendTime)) / 1000
      );
      return {
        success: false,
        message: `Please wait ${secondsRemaining}s before requesting another OTP`,
      };
    }

    const otp = generateOTP();
    const expiresAt = Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000;

    // Store OTP session
    otpSessions[normalizedEmail] = {
      email: normalizedEmail,
      otp,
      expiresAt,
      attempts: 0,
      maxAttempts: MAX_ATTEMPTS,
    };

    // Set resend cooldown
    resendCooldowns[normalizedEmail] = Date.now();

    // In production, this would call a backend API to send the email
    // For now, we log it (in development, the OTP is returned for testing)
    console.log(`[DEMO] OTP for ${normalizedEmail}: ${otp}`);

    return {
      success: true,
      otp, // Remove this in production
      message: `OTP sent to ${normalizedEmail}. Check your email (valid for ${OTP_EXPIRY_MINUTES} minutes)`,
    };
  } catch (error) {
    console.error("Error sending OTP:", error);
    return { success: false, message: "Failed to send OTP. Please try again." };
  }
}

/**
 * Verify OTP for a given email
 * @param email - Email address
 * @param otp - OTP to verify
 * @returns Verification result
 */
export function verifyOTP(email: string, otp: string): { success: boolean; message: string } {
  try {
    const normalizedEmail = email.toLowerCase().trim();
    const session = otpSessions[normalizedEmail];

    // Check if session exists
    if (!session) {
      return { success: false, message: "OTP not requested. Please request a new one." };
    }

    // Check if OTP has expired
    if (Date.now() > session.expiresAt) {
      delete otpSessions[normalizedEmail];
      return { success: false, message: "OTP has expired. Please request a new one." };
    }

    // Check attempt limit
    if (session.attempts >= session.maxAttempts) {
      delete otpSessions[normalizedEmail];
      return { success: false, message: "Maximum attempts exceeded. Please request a new OTP." };
    }

    // Verify OTP
    if (otp.trim() === session.otp) {
      // Clear the session on successful verification
      delete otpSessions[normalizedEmail];
      return { success: true, message: "OTP verified successfully!" };
    }

    // Increment attempts
    session.attempts += 1;
    const attemptsRemaining = session.maxAttempts - session.attempts;

    if (attemptsRemaining === 0) {
      delete otpSessions[normalizedEmail];
      return { success: false, message: "Maximum attempts exceeded. Please request a new OTP." };
    }

    return {
      success: false,
      message: `Invalid OTP. ${attemptsRemaining} attempt(s) remaining.`,
    };
  } catch (error) {
    console.error("Error verifying OTP:", error);
    return { success: false, message: "Error verifying OTP. Please try again." };
  }
}

/**
 * Check if an OTP session exists for an email
 * @param email - Email address
 * @returns Whether OTP session exists and is valid
 */
export function hasValidOTPSession(email: string): boolean {
  const normalizedEmail = email.toLowerCase().trim();
  const session = otpSessions[normalizedEmail];

  if (!session) return false;
  if (Date.now() > session.expiresAt) {
    delete otpSessions[normalizedEmail];
    return false;
  }

  return true;
}

/**
 * Clear OTP session for an email
 * @param email - Email address
 */
export function clearOTPSession(email: string): void {
  const normalizedEmail = email.toLowerCase().trim();
  delete otpSessions[normalizedEmail];
}

/**
 * Get remaining time for OTP expiry
 * @param email - Email address
 * @returns Remaining seconds or null if no session
 */
export function getOTPTimeRemaining(email: string): number | null {
  const normalizedEmail = email.toLowerCase().trim();
  const session = otpSessions[normalizedEmail];

  if (!session) return null;

  const remaining = Math.max(0, session.expiresAt - Date.now());
  return Math.ceil(remaining / 1000);
}
