import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, setToken } from "@/lib/api";
import { useApp } from "@/lib/store";
import { toast } from "sonner";

export default function SignupWizard() {
    const navigate = useNavigate();
    const { dispatch } = useApp();

    // 1. Keep track of which step the user is on (1 to 4)
    const [currentStep, setCurrentStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // 2. Keep all their data in ONE state object
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
        name: "",
        college: "",
        year: "",
        bio: "",
        skills: [] as string[],
        domains: [] as string[]
    });

    // 3. Helper functions to move between steps
    const nextStep = () => setCurrentStep((prev) => prev + 1);
    const prevStep = () => setCurrentStep((prev) => prev - 1);

    // Helper to handle text inputs
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Helper to handle skills (comma separated for simplicity here)
    const handleSkillsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const skillsArray = e.target.value.split(",").map(skill => skill.trim()).filter(Boolean);
        setFormData({ ...formData, skills: skillsArray });
    };

    // 4. Final step: Send everything to the API we just updated!
    const handleFinalSubmit = async () => {
        setIsSubmitting(true);
        try {
            // 1. Create base account
            await api.signup({
                username: formData.username.trim(),
                email: formData.email.trim(),
                password: formData.password
            });

            // 2. Login to get token
            const tokenRes = await api.login({
                identifier: formData.email.trim(),
                password: formData.password
            });
            setToken(tokenRes.access_token);

            // 3. Fetch user to ensure valid session
            let user = await api.getMe();

            // 4. Update with extra details
            const updatePayload = {
                name: formData.name.trim(),
                bio: formData.bio.trim(),
                college: formData.college.trim(),
                year: formData.year.trim(),
                skills: formData.skills
            };
            user = await api.updateMe(updatePayload);

            dispatch({ type: "setCurrentUser", payload: user });
            toast.success("Account created successfully! 🎉");
            navigate("/dashboard", { state: { isNewSignup: true } });

        } catch (error: any) {
            console.error("Signup failed", error);
            const errMsg = error.detail || error.message || "Something went wrong!";
            toast.error("Error creating account: " + errMsg);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-white p-6">
            <div className="bg-slate-800 p-8 rounded-xl shadow-lg w-full max-w-md">

                {/* STEP 1: Basic Details */}
                {currentStep === 1 && (
                    <form onSubmit={(e) => { e.preventDefault(); nextStep(); }} className="flex flex-col gap-4">
                        <h2 className="text-2xl font-bold mb-4">Step 1: Account Details</h2>

                        <input required name="name" placeholder="Full Name (e.g. John Doe)" value={formData.name} onChange={handleChange} className="p-2 rounded bg-slate-700" />
                        <input required name="username" placeholder="Username (e.g. johndoe)" value={formData.username} onChange={handleChange} className="p-2 rounded bg-slate-700" />
                        <input required name="email" type="email" placeholder="Email Address" value={formData.email} onChange={handleChange} className="p-2 rounded bg-slate-700" />
                        <input required name="password" type="password" placeholder="Strong Password" value={formData.password} onChange={handleChange} className="p-2 rounded bg-slate-700" />

                        <button type="submit" className="bg-blue-600 hover:bg-blue-500 p-2 rounded font-bold mt-4">Next: Add Skills & College ➔</button>
                    </form>
                )}

                {/* STEP 2: Add Skills & Education */}
                {currentStep === 2 && (
                    <form onSubmit={(e) => { e.preventDefault(); nextStep(); }} className="flex flex-col gap-4">
                        <h2 className="text-2xl font-bold mb-4">Step 2: Skills & Education</h2>

                        <input name="college" placeholder="College Name" value={formData.college} onChange={handleChange} className="p-2 rounded bg-slate-700" />
                        <input name="year" placeholder="Graduation Year (e.g. 2026)" value={formData.year} onChange={handleChange} className="p-2 rounded bg-slate-700" />

                        <label className="text-sm text-slate-400">Skills (comma separated)</label>
                        <input name="skills" placeholder="React, Node.js, Python..." onChange={handleSkillsChange} className="p-2 rounded bg-slate-700" />

                        <div className="flex gap-4 mt-4">
                            <button type="button" onClick={prevStep} className="bg-slate-600 hover:bg-slate-500 p-2 rounded flex-1">Back</button>
                            <button type="submit" className="bg-blue-600 hover:bg-blue-500 p-2 rounded font-bold flex-1">Next: Add Bio ➔</button>
                        </div>
                    </form>
                )}

                {/* STEP 3: Add Bio */}
                {currentStep === 3 && (
                    <form onSubmit={(e) => { e.preventDefault(); nextStep(); }} className="flex flex-col gap-4">
                        <h2 className="text-2xl font-bold mb-4">Step 3: Add Bio</h2>

                        <textarea name="bio" rows={4} placeholder="Tell everyone a bit about yourself and what you like to build..." value={formData.bio} onChange={handleChange} className="p-2 rounded bg-slate-700 resize-none" />

                        <div className="flex gap-4 mt-4">
                            <button type="button" onClick={prevStep} className="bg-slate-600 hover:bg-slate-500 p-2 rounded flex-1">Back</button>
                            <button type="submit" className="bg-blue-600 hover:bg-blue-500 p-2 rounded font-bold flex-1">Review Profile ➔</button>
                        </div>
                    </form>
                )}

                {/* STEP 4: Review and Create */}
                {currentStep === 4 && (
                    <div className="flex flex-col gap-4">
                        <h2 className="text-2xl font-bold mb-4 text-green-400">Step 4: Review Profile</h2>

                        <div className="bg-slate-900 p-4 rounded text-sm text-slate-300">
                            <p><strong>Name:</strong> {formData.name}</p>
                            <p><strong>Username:</strong> @{formData.username}</p>
                            <p><strong>Email:</strong> {formData.email}</p>
                            <p><strong>College:</strong> {formData.college} ({formData.year})</p>
                            <p><strong>Skills:</strong> {formData.skills.join(", ")}</p>
                            <p><strong>Bio:</strong> {formData.bio}</p>
                        </div>

                        <div className="flex gap-4 mt-4">
                            <button type="button" onClick={prevStep} className="bg-slate-600 hover:bg-slate-500 p-2 rounded flex-1">Back</button>
                            <button onClick={handleFinalSubmit} className="bg-green-600 hover:bg-green-500 p-2 rounded font-bold flex-1">🚀 Create Account</button>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}
