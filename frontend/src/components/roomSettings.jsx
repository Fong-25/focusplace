"use client"

import { Clock, User, Settings, Lock } from 'lucide-react'
import { useThemeStore } from '../stores/themeStore'

function RoomSettings({ settings, onSettingsChange, disabled = true }) {
    const { getTheme } = useThemeStore()
    const theme = getTheme()

    const handleCheckboxChange = (key, value) => {
        if (!disabled) {
            onSettingsChange({ [key]: value })
        }
    }
    const handleInputChangeTime = (key, value) => {
        if (!disabled) {
            const newValue = value === '' ? '' : Math.max(1, Math.min(key === 'focusTime' ? 120 : 60, Number(value) || (key === 'focusTime' ? 25 : 5)));
            onSettingsChange({ [key]: newValue });
        }
    }

    const handleInputChangeName = (key, value) => {
        if (!disabled) {
            onSettingsChange({ [key]: value })
        }
    }

    return (
        <div className="space-y-4">
            {/* Settings Header */}
            <div className="flex items-center gap-2">
                <Settings className={`w-4 h-4 ${theme.textMuted}`} />
                <h3 className={`text-base font-semibold ${theme.text}`}>Room Settings</h3>
                {disabled && (
                    <div className={`ml-auto flex items-center gap-1 text-xs ${theme.textMuted}`}>
                        <Lock className="w-3 h-3" />
                        <span>Preview Only</span>
                    </div>
                )}
            </div>

            {/* Control Settings */}
            <div className={`p-3 rounded-lg ${theme.secondary}`}>
                <h4 className={`text-xs font-medium mb-2 ${theme.secondaryText}`}>Control Settings</h4>
                <div className="space-y-2">
                    {/* Strict Mode */}
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={settings.strictMode}
                            onChange={(e) => handleCheckboxChange("strictMode", e.target.checked)}
                            disabled={disabled}
                            className={`
                                        rounded border-gray-300 text-blue-400 
                                        focus:ring-blue-300 focus:ring-offset-0 w-3 h-3
                                        ${disabled ? "opacity-50 cursor-not-allowed" : ""}
                                    `}
                        />
                        <div className="flex-1">
                            <span className={`text-xs font-medium ${disabled ? theme.textMuted : theme.text}`}>Strict Mode</span>
                            <p className={`text-xs ${theme.textMuted}`}>Only host controls timer</p>
                        </div>
                    </label>

                    {/* Auto Phase Change */}
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={settings.autoPhaseChange}
                            onChange={(e) => handleCheckboxChange("autoPhaseChange", e.target.checked)}
                            disabled={disabled}
                            className={`
                                        rounded border-gray-300 text-blue-400 
                                        focus:ring-blue-300 focus:ring-offset-0 w-3 h-3
                                        ${disabled ? "opacity-50 cursor-not-allowed" : ""}
                                    `}
                        />
                        <div className="flex-1">
                            <span className={`text-xs font-medium ${disabled ? theme.textMuted : theme.text}`}>
                                Auto Phase Change
                            </span>
                            <p className={`text-xs ${theme.textMuted}`}>Auto switch phases</p>
                        </div>
                    </label>
                </div>
            </div>

            {/* Timer Settings */}
            <div className={`p-3 rounded-lg ${theme.secondary}`}>
                <h4 className={`text-xs font-medium mb-2 ${theme.secondaryText}`}>Timer Settings</h4>
                <div className="grid grid-cols-2 gap-3">
                    {/* Focus Time */}
                    <div>
                        <label className={`block text-xs font-medium mb-1 ${disabled ? theme.textMuted : theme.text}`}>
                            <Clock className="w-3 h-3 inline mr-1" />
                            Focus (min)
                        </label>
                        <input
                            type="number"
                            min="1"
                            max="120"
                            value={settings.focusTime || ""}
                            onChange={(e) => handleInputChangeTime("focusTime", e.target.value)}
                            disabled={disabled}
                            className={`
                                        w-full px-2 py-1.5 text-sm rounded-md border transition-all duration-200
                                        ${theme.input} ${disabled ? theme.textMuted : theme.inputText}
                                        focus:outline-none focus:ring-1 focus:ring-offset-1
                                        ${disabled ? "opacity-50 cursor-not-allowed" : ""}
                                    `}
                        />
                    </div>

                    {/* Break Time */}
                    <div>
                        <label className={`block text-xs font-medium mb-1 ${disabled ? theme.textMuted : theme.text}`}>
                            <Clock className="w-3 h-3 inline mr-1" />
                            Break (min)
                        </label>
                        <input
                            type="number"
                            min="1"
                            max="60"
                            value={settings.breakTime || ""}
                            onChange={(e) => handleInputChangeTime("breakTime", e.target.value)}
                            disabled={disabled}
                            className={`
                                        w-full px-2 py-1.5 text-sm rounded-md border transition-all duration-200
                                        ${theme.input} ${disabled ? theme.textMuted : theme.inputText}
                                        focus:outline-none focus:ring-1 focus:ring-offset-1
                                        ${disabled ? "opacity-50 cursor-not-allowed" : ""}
                                    `}
                        />
                    </div>
                </div>
            </div>

            {/* Phase Names */}
            <div className={`p-3 rounded-lg ${theme.secondary}`}>
                <h4 className={`text-xs font-medium mb-2 ${theme.secondaryText}`}>Phase Names</h4>
                <div className="grid grid-cols-2 gap-3">
                    {/* Focus Phase Name */}
                    <div>
                        <label className={`block text-xs font-medium mb-1 ${disabled ? theme.textMuted : theme.text}`}>
                            <User className="w-3 h-3 inline mr-1" />
                            Focus Name
                        </label>
                        <input
                            type="text"
                            maxLength="20"
                            value={settings.focusPhaseName}
                            onChange={(e) => handleInputChangeName("focusPhaseName", e.target.value)}
                            disabled={disabled}
                            className={`
                                        w-full px-2 py-1.5 text-sm rounded-md border transition-all duration-200
                                        ${theme.input} ${disabled ? theme.textMuted : theme.inputText}
                                        focus:outline-none focus:ring-1 focus:ring-offset-1
                                        ${disabled ? "opacity-50 cursor-not-allowed" : ""}
                                    `}
                            placeholder="Focus"
                        />
                    </div>

                    {/* Break Phase Name */}
                    <div>
                        <label className={`block text-xs font-medium mb-1 ${disabled ? theme.textMuted : theme.text}`}>
                            <User className="w-3 h-3 inline mr-1" />
                            Break Name
                        </label>
                        <input
                            type="text"
                            maxLength="20"
                            value={settings.breakPhaseName}
                            onChange={(e) => handleInputChangeName("breakPhaseName", e.target.value)}
                            disabled={disabled}
                            className={`
                                w-full px-2 py-1.5 text-sm rounded-md border transition-all duration-200
                                ${theme.input} ${disabled ? theme.textMuted : theme.inputText}
                                focus:outline-none focus:ring-1 focus:ring-offset-1
                                ${disabled ? "opacity-50 cursor-not-allowed" : ""}
                            `}
                            placeholder="Break"
                        />
                    </div>
                </div>
            </div>

            {/* Settings Preview */}
            <div className={`p-2 rounded-lg border-l-4 ${theme.secondary} border-blue-400`}>
                <p className={`text-xs ${theme.textMuted} mb-1`}>Preview:</p>
                <p className={`text-xs ${theme.text}`}>
                    {settings.focusPhaseName}: {settings.focusTime}min → {settings.breakPhaseName}: {settings.breakTime}min
                    {settings.strictMode && " • Host Control"}
                    {settings.autoPhaseChange && " • Auto Switch"}
                </p>
            </div>
        </div>
    )

}

export default RoomSettings