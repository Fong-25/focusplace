import { useNavigate } from 'react-router-dom'
import { useState, useEffect, createContext, useContext } from 'react'

const UserContext = createContext()

export const useUser = () => {
    const context = useContext(UserContext)
    if (!context) {
        throw new Error('useUser must be used within a ProtectedRoute')
    }
    return context
}

export default function ProtectedRoute({ children }) {
    const navigate = useNavigate()
    const [isAuthenticated, setIsAuthenticated] = useState(null)
    const [user, setUser] = useState(null)

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/verify`, {
                    credentials: 'include',
                    method: "GET"
                })

                if (res.ok) {
                    const data = await res.json()
                    setUser(data.user)
                    setIsAuthenticated(true)
                    // console.log(data.user)
                } else {
                    setIsAuthenticated(false)
                }
            } catch (error) {
                setIsAuthenticated(false)
            }
        }

        checkAuth()
    }, [])

    // Show loading while checking authentication
    if (isAuthenticated === null) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
        )
    }

    // Redirect to login if not authenticated
    if (!isAuthenticated) {
        return navigate('/login')
    }

    // Provide user data to children
    return (
        <UserContext.Provider value={{ user, setUser }}>
            {children}
        </UserContext.Provider>
    )
}