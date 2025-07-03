import { create } from "zustand"
import { persist } from "zustand/middleware"
import { themes } from './themes'


export const useThemeStore = create(
    persist(
        (set, get) => ({
            currentTheme: "midnight",
            themes, // This won't be persisted
            setTheme: (themeName) => set({ currentTheme: themeName }),
            getTheme: () => {
                const { currentTheme } = get()
                return themes[currentTheme] || themes.midnight
            },
        }),
        {
            name: "theme-storage",
            // Only persist the currentTheme, not the entire state
            partialize: (state) => ({ currentTheme: state.currentTheme }),
            // Handle loading from storage with validation
            onRehydrateStorage: () => (state) => {
                if (state && (!state.currentTheme || !themes[state.currentTheme])) {
                    // Invalid theme found, clear localStorage and reset to default
                    localStorage.removeItem("theme-storage")
                    state.currentTheme = "midnight"
                }
            },
        },
    ),
)

// Version 2: No saving theme to localStorage
// export const useThemeStore = create((set, get) => ({
//     currentTheme: "midnight",
//     themes,
//     setTheme: (themeName) => set({ currentTheme: themeName }),
//     getTheme: () => {
//         const { currentTheme } = get()
//         return themes[currentTheme] || themes.serenity
//     },
// }))