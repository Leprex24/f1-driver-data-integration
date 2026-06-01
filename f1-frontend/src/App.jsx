import {useState} from 'react'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Comparison from './pages/Comparison'
import Drivers from "./pages/Drivers.jsx";
import Export from "./pages/Export.jsx";
import Admin from "./pages/Admin.jsx";

export default function App() {
    const [token, setToken] = useState(localStorage.getItem('token'))
    const [page, setPage] = useState('dashboard')
    const [comparisonDefaults, setComparisonDefaults] = useState({})
    const [userRole, setUserRole] = useState(() => {
        const t = localStorage.getItem('token')
        if (!t) return null
        try {
            const payload = JSON.parse(atob(t.split('.')[1]))
            return payload.role
        } catch {
            return null
        }
    })

    const handleLogin = (newToken) => {
        const payload = JSON.parse(atob(newToken.split('.')[1]))
        setToken(newToken)
        setUserRole(payload.role)
    }

    const handleNavigate = (page, data = {}) => {
        console.log("navigate to:", page, "data:", data)
        if (page === 'comparison') setComparisonDefaults(data)
        setPage(page)
    }

    const handleLogout = () => {
        localStorage.removeItem('token')
        setToken(null)
        setPage('dashboard')
    }

    if (!token) return <Login onLogin={handleLogin}/>

    return (
        <>
            {page === 'dashboard' && (
                <Dashboard token={token} onNavigate={handleNavigate} onLogout={handleLogout} userRole={userRole}/>
            )}
            {page === 'comparison' && (
                <Comparison token={token} onNavigate={setPage} onLogout={handleLogout} defaults={comparisonDefaults} userRole={userRole}/>
            )}
            {page === 'drivers' && (
                <Drivers token={token} onNavigate={handleNavigate} onLogout={handleLogout} userRole={userRole}/>
            )}
            {page === 'export' && (
                <Export token={token} onNavigate={handleNavigate} onLogout={handleLogout} userRole={userRole}/>
            )}
            {page === 'admin' && (
                <Admin token={token} onNavigate={handleNavigate} onLogout={handleLogout} userRole={userRole}/>
            )}
        </>
    )
}