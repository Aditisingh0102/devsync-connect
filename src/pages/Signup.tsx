import { useState, useMemo, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useApp } from "@/lib/store";
import { Eye, EyeOff, Sparkles, ArrowRight, Check, X, UserPlus, ShieldCheck } from "lucide-react";
import { api, setToken } from "@/lib/api";
import { toast } from "sonner";

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

const PREDEFINED_SKILLS = [
  "React", "Node.js", "Python", "UI/UX", "Java", "C++", 
  "Machine Learning", "Figma", "AWS", "Docker", "Next.js", 
  "Tailwind CSS", "Data Science", "Cybersecurity", "Blockchain"
];

export default function Signup() {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [loginMessage, setLoginMessage] = useState("");

  // Step 1
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreed, setAgreed] = useState(false);

  // Step 2
  const [college, setCollege] = useState("");
  const [department, setDepartment] = useState("");
  const [year, setYear] = useState("");
  const [semester, setSemester] = useState("");

  // Step 3
  const [skills, setSkills] = useState<string[]>([]);
  const [customSkill, setCustomSkill] = useState("");
  const [bio, setBio] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (state.currentUser && step === 1) {
      navigate("/dashboard");
    }
  }, [state.currentUser, navigate, step]);

  const strength = useMemo(() => getPasswordStrength(password), [password]);
  const passwordsMatch = password.length > 0 && confirmPassword.length > 0 && password === confirmPassword;

  const isUsernameTaken = useMemo(() => {
    if (!username.trim()) return false;
    return Object.values(state.users || {}).some(
      (u) => u.username?.toLowerCase() === username.trim().toLowerCase()
    );
  }, [username, state.users]);

  const validateStep1 = (): boolean => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = "Full name is required";
    if (!username.trim()) e.username = "Username is required";
    else if (username.trim().length < 3) e.username = "Username must be at least 3 characters";
    else if (!/^[a-zA-Z0-9_]+$/.test(username.trim())) e.username = "Only letters, numbers, and underscores";
    
    if (!email.trim()) e.email = "Email is required";
    else if (!email.trim().toLowerCase().endsWith("@gmail.com")) e.email = "Only @gmail.com addresses are allowed";
    
    if (!password) {
      e.password = "Password is required";
    } else {
      const failedRules = PASSWORD_RULES.filter(rule => !rule.test(password));
      if (failedRules.length > 0) {
        e.password = "Password must meet all requirements";
      }
    }
    
    if (!confirmPassword) e.confirmPassword = "Please confirm your password";
    else if (password !== confirmPassword) e.confirmPassword = "Passwords do not match";
    
    if (!agreed) e.agreed = "You must accept the terms to continue";
    
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNextStep1 = () => {
    if (validateStep1()) {
      setStep(2);
    }
  };

  const addCustomSkill = () => {
    if (customSkill.trim() && !skills.includes(customSkill.trim())) {
      setSkills([...skills, customSkill.trim()]);
    }
    setCustomSkill("");
  };

  const submitDetails = async () => {
    setLoginMessage("Creating account...");
    try {
      // 1. Create account
      await api.signup({
        username: username.trim(),
        email: email.trim(),
        password: password,
      });

      // 2. Auto login
      setLoginMessage("Logging in...");
      const tokenRes = await api.login({
        identifier: email.trim(),
        password: password,
      });
      setToken(tokenRes.access_token);
      
      // 3. Update profile
      setLoginMessage("Saving profile...");
      let user = await api.getMe();
      
      try {
        user = await api.updateMe({ 
          name: name.trim(), 
          college: college.trim(), 
          year: year.trim(), 
          skills, 
          bio: bio.trim(),
          preferences: {
            department: department.trim(),
            semester: semester.trim()
          }
        });
      } catch (e) {
        console.error("Failed to save some fields:", e);
      }
      
      dispatch({ type: "setCurrentUser", payload: user });
      
      setLoginMessage("Success!");
      toast.success("Account created! 🎉");
      setTimeout(() => navigate("/dashboard", { state: { isNewSignup: true } }), 500);

    } catch (err: any) {
      setLoginMessage("");
      const msg = err.message || "An error occurred";
      if (msg.toLowerCase().includes("username")) {
        setErrors({ username: "Username is already taken" });
        setStep(1);
      } else if (msg.toLowerCase().includes("email")) {
        setErrors({ email: "Email is already registered. Please sign in instead." });
        setStep(1);
      } else {
        toast.error("Error creating account: " + msg);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !loginMessage && step === 1) handleNextStep1();
  };

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
            {step === 1 ? "Create your account" : step === 4 ? "Review Profile" : "Complete your profile"}
          </h1>
          <p className="text-muted-foreground mt-2">
            {step === 1 ? "Start discovering projects and building with great teams." : "Tell the community more about yourself."}
          </p>
        </div>

        {/* Multi-step progress bar */}
        <div className="flex gap-2 mb-6">
          {[1, 2, 3, 4].map(s => (
            <div key={s} className={`h-1.5 flex-1 rounded-full ${step >= s ? 'bg-primary' : 'bg-border'}`} />
          ))}
        </div>

        {/* Card */}
        <div className="ds-card p-8 backdrop-blur-xl border-border/50">
          <div className="space-y-5" onKeyDown={handleKeyDown}>
            {step === 1 && (
              <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
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
                    placeholder="john@gmail.com"
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

                {/* Submit */}
                <button
                  onClick={handleNextStep1}
                  className="h-12 w-full rounded-xl bg-primary text-white font-semibold text-sm inline-flex items-center justify-center gap-2 hover:bg-primary-hover transition-all shadow-glow active:scale-[0.98]"
                >
                  Continue <ArrowRight className="size-4" />
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">College / University</label>
                  <input
                    value={college}
                    onChange={(e) => setCollege(e.target.value)}
                    placeholder="e.g. MIT, Stanford, IIT"
                    className="ds-input"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Department Name</label>
                  <div className="relative">
                    <select
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className="ds-input appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M6%209l6%206%206-6%22%20stroke%3D%22%2394a3b8%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-[length:20px] bg-[position:calc(100%-12px)_center] bg-no-repeat pr-10"
                    >
                      <option value="" disabled>Select your department</option>
                      <option value="Computer Science & Engineering">Computer Science & Engineering</option>
                      <option value="Information Technology">Information Technology</option>
                      <option value="Electronics & Communication">Electronics & Communication</option>
                      <option value="Electrical Engineering">Electrical Engineering</option>
                      <option value="Mechanical Engineering">Mechanical Engineering</option>
                      <option value="Civil Engineering">Civil Engineering</option>
                      <option value="Chemical Engineering">Chemical Engineering</option>
                      <option value="Aerospace Engineering">Aerospace Engineering</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Year</label>
                    <div className="relative">
                      <select
                        value={year}
                        onChange={(e) => setYear(e.target.value)}
                        className="ds-input appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M6%209l6%206%206-6%22%20stroke%3D%22%2394a3b8%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-[length:20px] bg-[position:calc(100%-12px)_center] bg-no-repeat pr-10"
                      >
                        <option value="" disabled>Select Year</option>
                        <option value="1st Year">1st Year</option>
                        <option value="2nd Year">2nd Year</option>
                        <option value="3rd Year">3rd Year</option>
                        <option value="4th Year">4th Year</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Current Semester</label>
                    <div className="relative">
                      <select
                        value={semester}
                        onChange={(e) => setSemester(e.target.value)}
                        className="ds-input appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M6%209l6%206%206-6%22%20stroke%3D%22%2394a3b8%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-[length:20px] bg-[position:calc(100%-12px)_center] bg-no-repeat pr-10"
                      >
                        <option value="" disabled>Select Sem</option>
                        <option value="1st Semester">1st Semester</option>
                        <option value="2nd Semester">2nd Semester</option>
                        <option value="3rd Semester">3rd Semester</option>
                        <option value="4th Semester">4th Semester</option>
                        <option value="5th Semester">5th Semester</option>
                        <option value="6th Semester">6th Semester</option>
                        <option value="7th Semester">7th Semester</option>
                        <option value="8th Semester">8th Semester</option>
                      </select>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-3 mt-4">
                  <button
                    onClick={() => setStep(1)}
                    className="h-12 w-1/3 rounded-xl bg-secondary text-foreground font-semibold text-sm inline-flex items-center justify-center hover:bg-secondary/80 transition-all"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => setStep(3)}
                    className="h-12 w-2/3 rounded-xl bg-primary text-white font-semibold text-sm inline-flex items-center justify-center gap-2 hover:bg-primary-hover transition-all shadow-glow active:scale-[0.98]"
                  >
                    Continue <ArrowRight className="size-4" />
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div>
                  <label className="text-sm font-medium mb-3 block">Select Your Skills <span className="text-xs text-muted-foreground font-normal ml-1">(At least 3)</span></label>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {PREDEFINED_SKILLS.map((skill) => (
                      <button
                        key={skill}
                        onClick={() => {
                          if (skills.includes(skill)) setSkills(skills.filter(s => s !== skill));
                          else setSkills([...skills, skill]);
                        }}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${skills.includes(skill) ? "bg-primary text-white border-primary shadow-glow" : "bg-secondary text-muted-foreground hover:text-foreground border border-border"}`}
                      >
                        {skill}
                      </button>
                    ))}
                  </div>
                  
                  <div className="flex gap-2">
                    <input
                      value={customSkill}
                      onChange={(e) => setCustomSkill(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") addCustomSkill();
                      }}
                      placeholder="Type a skill and hit Add..."
                      className="ds-input flex-1"
                    />
                    <button
                      onClick={addCustomSkill}
                      className="h-11 px-4 rounded-xl bg-secondary hover:bg-secondary/80 text-foreground text-sm font-semibold transition-colors"
                    >
                      Add
                    </button>
                  </div>

                  {skills.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2 p-3 bg-secondary/20 rounded-xl border border-border/50">
                      {skills.map(skill => (
                        <span key={skill} className="px-2.5 py-1 rounded-md bg-primary/10 text-primary border border-primary/20 text-xs font-medium inline-flex items-center gap-1.5">
                          {skill}
                          <button onClick={() => setSkills(skills.filter(s => s !== skill))} className="hover:text-primary-hover opacity-70 hover:opacity-100 transition-opacity">
                            <X className="size-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium mb-1.5 block">Short Bio (Optional)</label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={3}
                    placeholder="Tell us a bit about yourself..."
                    className="ds-input resize-none py-3"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setStep(2)}
                    className="h-12 w-1/3 rounded-xl bg-secondary text-foreground font-semibold text-sm inline-flex items-center justify-center hover:bg-secondary/80 transition-all"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => {
                      if (skills.length < 3) {
                        toast.error("Please add at least 3 skills to continue.");
                        return;
                      }
                      setStep(4);
                    }}
                    className="h-12 w-2/3 rounded-xl bg-primary text-white font-semibold text-sm inline-flex items-center justify-center gap-2 hover:bg-primary-hover transition-all shadow-glow active:scale-[0.98]"
                  >
                    Review <ArrowRight className="size-4" />
                  </button>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="p-5 rounded-xl bg-secondary/30 border border-border space-y-4 text-sm">
                  <div className="flex flex-col gap-1.5">
                    <span className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">Account</span>
                    <p className="font-medium text-foreground">{name || "No name"} <span className="text-muted-foreground font-normal">(@{username})</span></p>
                    <p className="text-muted-foreground">{email}</p>
                  </div>
                  <div className="w-full h-px bg-border/60" />
                  
                  <div className="flex flex-col gap-1.5">
                    <span className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">Education</span>
                    {college ? (
                      <div>
                        <p className="text-foreground font-medium">{college}</p>
                        <p className="text-muted-foreground mt-0.5">
                          {department ? `${department}` : ""} {year ? ` | Class of ${year}` : ""} {semester ? ` | ${semester} Sem` : ""}
                        </p>
                      </div>
                    ) : (
                      <p className="text-muted-foreground">Not added</p>
                    )}
                  </div>
                  <div className="w-full h-px bg-border/60" />
                  
                  <div className="flex flex-col gap-1.5">
                    <span className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">Skills</span>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {skills.length > 0 ? skills.map(s => (
                        <span key={s} className="px-2 py-0.5 rounded bg-secondary text-xs">{s}</span>
                      )) : <p className="text-muted-foreground text-sm">None added</p>}
                    </div>
                  </div>
                </div>

                {loginMessage && (
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-primary/10 border border-primary/30 text-primary text-sm font-medium animate-in fade-in duration-300">
                    <div className="size-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                    {loginMessage}
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={() => setStep(3)}
                    disabled={!!loginMessage}
                    className="h-12 w-1/3 rounded-xl bg-secondary text-foreground font-semibold text-sm inline-flex items-center justify-center hover:bg-secondary/80 transition-all disabled:opacity-50"
                  >
                    Back
                  </button>
                  <button
                    onClick={submitDetails}
                    disabled={!!loginMessage}
                    className="h-12 w-2/3 rounded-xl bg-emerald-500 text-white font-semibold text-sm inline-flex items-center justify-center gap-2 hover:bg-emerald-600 transition-all shadow-glow active:scale-[0.98] disabled:opacity-50"
                  >
                    {loginMessage ? "Please wait..." : "Complete Profile"} 
                    {!loginMessage && <Check className="size-4" />}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Divider */}
          {step === 1 && (
            <>
              <div className="flex items-center gap-3 my-6">
                <div className="flex-1 h-px bg-border" />
                <span className="text-xs text-muted-foreground">or</span>
                <div className="flex-1 h-px bg-border" />
              </div>

              {/* OAuth placeholder buttons */}
              <div className="grid grid-cols-2 gap-3 mb-6">
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
            </>
          )}
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
