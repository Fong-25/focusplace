"use client";

import { RotateCcw } from 'lucide-react'
import { useThemeStore } from '../stores/themeStore';

function ResetTheme() {
    const { setTheme, getTheme } = useThemeStore()
    const theme = getTheme()

    const handleReset = () => {
        // Set to default theme
        setTheme("midnight")

        // Clear localStorage
        localStorage.removeItem("theme-storage")

        // Refresh the page
        window.location.reload()
    }

    return (
        <button
            onClick={handleReset}
            className={`
                flex items-center gap-2 px-3 py-1.5 rounded-md border transition-all duration-200 text-xs
                ${theme.secondary} ${theme.secondaryText} ${theme.border}
                hover:opacity-80 focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-red-300
            `}
            title="Reset to default theme"
        >
            <RotateCcw className="w-3 h-3" />
            <span className="font-medium">Reset Theme</span>
        </button>
    )
}

export default ResetTheme;