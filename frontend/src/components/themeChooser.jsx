"use client";

import { useState, useRef, useEffect } from 'react'
import { ChevronDown, Palette } from 'lucide-react'
import { useThemeStore } from '../stores/themeStore';

function ThemeChooser() {
    const [isOpen, setIsOpen] = useState(false)
    const dropdownRef = useRef(null)
    const { currentTheme, themes, setTheme, getTheme } = useThemeStore()
    const theme = getTheme()

    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false)
            }
        }

        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    const handleThemeSelect = (themeName) => {
        setTheme(themeName)
        setIsOpen(false)
    }

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`
                            flex items-center gap-2 px-3 py-1.5 rounded-md border transition-all duration-200 text-xs
                            ${theme.secondary} ${theme.secondaryText} ${theme.border}
                            focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-blue-300
                            `}
            >
                <Palette className="w-3 h-3" />
                <span className="font-medium">{themes[currentTheme].name}</span>
                <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
            </button>

            {isOpen && (
                <div
                    className={`
                                absolute top-full left-0 mt-1 w-40 rounded-md border shadow-lg z-50
                                ${theme.cardBackground} ${theme.border}
                                `}
                >
                    <div className="py-1">
                        {Object.entries(themes).map(([key, themeOption]) => (
                            <button
                                key={key}
                                onClick={() => handleThemeSelect(key)}
                                className={`
                                            w-full px-3 py-1.5 text-left text-xs transition-colors duration-150
                                            ${currentTheme === key ? `${theme.primary} ${theme.primaryText}` : `hover:${theme.secondary} ${theme.text}`}
                                            `}
                            >
                                <div className="flex items-center gap-2">
                                    <div className={`w-2 h-2 rounded-full ${themeOption.primary.split(" ")[0]}`}></div>
                                    {themeOption.name}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}

export default ThemeChooser;