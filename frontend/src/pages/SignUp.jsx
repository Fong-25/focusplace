"use client"

import { useState } from "react"
import { Eye, EyeOff, User, Mail, Lock, UserPlus } from "lucide-react"
import toast, { Toaster } from "react-hot-toast"
import { useThemeStore } from "../stores/themeStore"
import ThemeChooser from "../components/themeChooser"
import ResetTheme from "../components/resetTheme"
import Warning from "../components/warning"
import { Link, useNavigate } from "react-router-dom"

function Signup() {
    const navigate = useNavigate()
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
    })
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    const { getTheme } = useThemeStore()
    const theme = getTheme()

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }))
    }

    const validateForm = () => {
        if (!formData.username || !formData.email || !formData.password) {
            toast.error("Please fill in all fields")
            return false
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(formData.email)) {
            toast.error("Please enter a valid email address")
            return false
        }

        // if (formData.password !== formData.confirmPassword) {
        //     toast.error("Passwords do not match")
        //     return false
        // }

        return true
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!validateForm()) {
            return
        }

        setIsLoading(true)

        try {
            const response = await fetch("http://localhost:3000/api/auth/signup", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            })

            const data = await response.json()

            if (response.ok) {
                toast.success("Account created successfully! Please login to continue.")
                // Reset form
                setFormData({
                    username: "",
                    email: "",
                    password: "",
                    confirmPassword: "",
                })
                navigate("/login")
            } else {
                toast.error(data.message || "Failed to create account")
            }
        } catch (error) {
            console.error("Signup error:", error)
            toast.error("Network error. Please check your connection and try again.")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div
            className={`min-h-screen flex items-center justify-center p-4 transition-all duration-300 ${theme.background}`}
        >
            <Toaster position="top-right"
                toastOptions={{
                    style: {
                        background: "#fff",
                        color: "#111827",
                    }
                }}
            />

            <div className="w-full max-w-md">
                {/* Theme Chooser */}
                <div className="flex justify-end mb-6">
                    <ThemeChooser />
                </div>

                <div className="absolute top-4 right-4">
                    <ResetTheme />
                </div>

                {/* Signup Card */}
                <div
                    className={`
                                rounded-xl shadow-lg border p-6 transition-all duration-300 max-w-sm mx-auto
                                ${theme.cardBackground} ${theme.border}
                            `}
                >
                    {/* Header */}
                    <div className="text-center mb-6">
                        <div
                            className={`
                                        inline-flex items-center justify-center w-12 h-12 rounded-full mb-3
                                        ${theme.primary}
                                    `}
                        >
                            <UserPlus className={`w-6 h-6 ${theme.primaryText}`} />
                        </div>
                        <h1 className={`text-2xl font-bold ${theme.text}`}>Create Account</h1>
                        <p className={`mt-1 text-sm ${theme.textMuted}`}>Join us and get started today</p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Username Field */}
                        <div>
                            <label htmlFor="username" className={`block text-sm font-medium mb-2 ${theme.text}`}>
                                Username
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                                    <User className={`w-4 h-4 ${theme.textMuted}`} />
                                </div>
                                <input
                                    type="text"
                                    autoComplete="off"
                                    id="username"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleInputChange}
                                    className={`
                                                w-full pl-9 pr-3 py-2.5 text-sm rounded-md border transition-all duration-200
                                                ${theme.input} ${theme.inputText}
                                                focus:outline-none focus:ring-1 focus:ring-offset-1
                                                placeholder-gray-400
                                            `}
                                    placeholder="Choose a username"
                                    required
                                />
                            </div>
                        </div>

                        {/* Email Field */}
                        <div>
                            <label htmlFor="email" className={`block text-sm font-medium mb-2 ${theme.text}`}>
                                Email
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                                    <Mail className={`w-4 h-4 ${theme.textMuted}`} />
                                </div>
                                <input
                                    type="email"
                                    autoComplete="off"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className={`
                                                w-full pl-9 pr-3 py-2.5 text-sm rounded-md border transition-all duration-200
                                                ${theme.input} ${theme.inputText}
                                                focus:outline-none focus:ring-1 focus:ring-offset-1
                                                placeholder-gray-400
                                            `}
                                    placeholder="Enter your email"
                                    required
                                />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div>
                            <label htmlFor="password" className={`block text-sm font-medium mb-2 ${theme.text}`}>
                                Password
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                                    <Lock className={`w-4 h-4 ${theme.textMuted}`} />
                                </div>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    id="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    className={`
                                                w-full pl-9 pr-10 py-2.5 text-sm rounded-md border transition-all duration-200
                                                ${theme.input} ${theme.inputText}
                                                focus:outline-none focus:ring-1 focus:ring-offset-1
                                                placeholder-gray-400
                                            `}
                                    placeholder="Create a password"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className={`
                                                absolute inset-y-0 right-0 pr-2.5 flex items-center
                                                ${theme.textMuted} hover:${theme.text} transition-colors duration-200
                                            `}
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        {/* Confirm Password Field
                        <div>
                            <label htmlFor="confirmPassword" className={`block text-sm font-medium mb-2 ${theme.text}`}>
                                Confirm Password
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                                    <Lock className={`w-4 h-4 ${theme.textMuted}`} />
                                </div>
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleInputChange}
                                    className={`
                                                w-full pl-9 pr-10 py-2.5 text-sm rounded-md border transition-all duration-200
                                                ${theme.input} ${theme.inputText}
                                                focus:outline-none focus:ring-1 focus:ring-offset-1
                                                placeholder-gray-400
                                            `}
                                    placeholder="Confirm your password"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className={`
                                                absolute inset-y-0 right-0 pr-2.5 flex items-center
                                                ${theme.textMuted} hover:${theme.text} transition-colors duration-200
                                            `}
                                >
                                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div> */}
                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`
                                        w-full py-2.5 px-4 rounded-md text-sm font-medium transition-all duration-200
                                        ${theme.primary} ${theme.primaryText}
                                        focus:outline-none focus:ring-1 focus:ring-offset-1
                                        disabled:opacity-50 disabled:cursor-not-allowed
                                        transform hover:scale-[1.01] active:scale-[0.99]
                                    `}
                        >
                            {isLoading ? (
                                <div className="flex items-center justify-center">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Creating account...
                                </div>
                            ) : (
                                "Create Account"
                            )}
                        </button>
                    </form>

                    {/* Footer */}
                    <div className="mt-6 text-center">
                        <p className={`text-xs ${theme.textMuted}`}>
                            Already have an account?{" "}

                            {/* Use Link instead of button */}
                            <Link
                                to='/'
                                // onClick={() => navigate('/')}
                                // type="button"
                                className={`
                                        font-medium transition-colors duration-200
                                        ${theme.primary.includes("slate")
                                        ? "text-slate-500 hover:text-slate-600"
                                        : theme.primary.includes("purple")
                                            ? "text-purple-400 hover:text-purple-500"
                                            : theme.primary.includes("green")
                                                ? "text-green-400 hover:text-green-500"
                                                : theme.primary.includes("orange")
                                                    ? "text-orange-400 hover:text-orange-500"
                                                    : theme.primary.includes("teal")
                                                        ? "text-teal-400 hover:text-teal-500"
                                                        : "text-amber-400 hover:text-amber-500"
                                    }
                `}
                            >
                                Sign in
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
            <div className="w-full absolute bottom-4 left-1/2 transform -translate-x-1/2 text-xs text-center text-gray-500" >
                <Warning />
            </div>
        </div>
    )
}
export default Signup