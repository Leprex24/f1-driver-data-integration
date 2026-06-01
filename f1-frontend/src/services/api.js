const BASE_URL = 'http://localhost:8000'

export const login = async (username, password) => {
    const formData = new FormData()
    formData.append('username', username)
    formData.append('password', password)
    const response = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        body: formData
    })
    return response.json()
}

export const register = async (username, password, role) => {
    const response = await fetch(`${BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json'},
        body: JSON.stringify({ username, password, role })
    })
    return response.json()
}

export const getDrivers = async (token) => {
    const response = await fetch(`${BASE_URL}/drivers/`, {
        headers: { 'Authorization': `Bearer ${token}`}
    })
    return response.json()
}

export const getDriver = async (token, abbreviation) => {
    const response = await fetch(`${BASE_URL}/drivers/${abbreviation}`, {
        headers: { 'Authorization': `Bearer ${token}`}
    })
    return response.json()
}

export const compareDrivers = async (token, params) => {
    const query = new URLSearchParams(params).toString()
    const response = await fetch(`${BASE_URL}/comparisons/summary?${query}`, {
        headers: { 'Authorization': `Bearer ${token}`}
    })
    return response.json()
}

export const detailCompareDrivers = async (token, params) => {
    const query = new URLSearchParams(params).toString()
    const response = await fetch(`${BASE_URL}/comparisons/detailed?${query}`, {
        headers: {'Authorization': `Bearer ${token}`}
    })
    return response.json()
}

export const loadSession = async (token, year, grandPrix, sessionType) => {
    const response = await fetch(`${BASE_URL}/sessions/load`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ year, grand_prix: grandPrix, session_type: sessionType})
    })
    return response.json()
}

export const exportJson = async (token, sessionId) => {
    const response = await fetch(`${BASE_URL}/export/session/${sessionId}/json`, {
        headers: { 'Authorization': `Bearer ${token}`}
    })
    return response.json()
}

export const exportXml = async (token, sessionId) => {
    const response = await fetch(`${BASE_URL}/export/session/${sessionId}/xml`, {
        headers: { 'Authorization': `Bearer ${token}`}
    })
    return response.text()
}

export const getAvailableSessions = async (token, season = null, circuitId = null) => {
    const params = new URLSearchParams()
    if (season) params.append('season', season)
    if (circuitId) params.append('circuit_id', circuitId)
    const response = await fetch(`${BASE_URL}/sessions/available?${params}`, {
        headers: { 'Authorization': `Bearer ${token}`}
    })
    return response.json()
}

export const loadDefaultSessions = async (token) => {
    const response = await fetch(`${BASE_URL}/sessions/load-defaults`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`}
    })
    return response.json()
}

export const getSessionWeather = async (token, sessionId) => {
    const response = await fetch(`${BASE_URL}/sessions/${sessionId}/weather`, {
        headers: { 'Authorization': `Bearer ${token}` }
    })
    return response.json()
}

export const getTeammates = async (token, season, circuitId = null, sessionType = null) => {
    const params = new URLSearchParams({ season })
    if (circuitId) params.append('circuit_id', circuitId)
    if (sessionType) params.append('session_type', sessionType)
    const response = await fetch(`${BASE_URL}/sessions/teammates?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` }
    })
    return response.json()
}

export const seedStaticData = async (token) => {
    const response = await fetch(`${BASE_URL}/sessions/seed-static-data`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`}
    })
    return response.json()
}