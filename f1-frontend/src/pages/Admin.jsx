import {useState} from 'react'
import Navbar from '../components/Navbar'
import {loadSession, loadDefaultSessions, seedStaticData} from '../services/api'

export default function Admin({token, onNavigate, onLogout, userRole}) {
    const [year, setYear] = useState('2024')
    const [gp, setGp] = useState('')
    const [type, setType] = useState('Race')
    const [status, setStatus] = useState('')
    const [loading, setLoading] = useState(false)
    const [defaultsLoading, setDefaultsLoading] = useState(false)
    const [defaultsStatus, setDefaultsStatus] = useState(null)
    const [seedLoading, setSeedLoading] = useState(false)
    const [seedStatus, setSeedStatus] = useState(null)

    const handleSeed = async () => {
        setSeedLoading(true)
        setSeedStatus(null)
        try {
            const result = await seedStaticData(token)
            setSeedStatus({message: result.message})
        } catch (e) {
            setSeedStatus({error: e.message})
        } finally {
            setSeedLoading(false)
        }
    }

    const handleLoad = async () => {
        setLoading(true)
        setStatus('')
        try {
            await loadSession(token, parseInt(year), gp, type)
            setStatus('✓ Session loaded successfully')
        } catch (e) {
            setStatus('✗ ' + e.message)
        } finally {
            setLoading(false)
        }
    }

    const handleLoadDefaults = async () => {
        setDefaultsLoading(true)
        setDefaultsStatus(null)
        try {
            const result = await loadDefaultSessions(token)
            setDefaultsStatus(result)
        } catch (e) {
            setDefaultsStatus({error: e.message})
        } finally {
            setDefaultsLoading(false)
        }
    }

    return (
        <div style={{backgroundColor: '#0a0a0a', minHeight: '100vh', color: '#f5f5f5'}}>
            <Navbar onNavigate={onNavigate} currentPage="admin" onLogout={onLogout} userRole={userRole}/>
            <div style={{maxWidth: '600px', margin: '0 auto', padding: '48px 40px'}}>
                <div style={{color: '#E8002D', fontSize: '11px', letterSpacing: '4px', marginBottom: '8px'}}>ADMIN</div>
                <h1 style={{fontSize: '40px', fontWeight: '900', margin: '0 0 40px', textTransform: 'uppercase'}}>Load
                    Session</h1>

                <div style={{
                    backgroundColor: '#1a1a1a',
                    border: '1px solid #222',
                    borderTop: '3px solid #E8002D',
                    padding: '32px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '20px'
                }}>
                    {[
                        {label: 'YEAR', value: year, set: setYear, placeholder: '2024'},
                        {label: 'GRAND PRIX', value: gp, set: setGp, placeholder: 'e.g. Monza'},
                    ].map(({label, value, set, placeholder}) => (
                        <div key={label} style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
                            <label style={{
                                color: '#555',
                                fontSize: '11px',
                                fontWeight: '700',
                                letterSpacing: '2px'
                            }}>{label}</label>
                            <input
                                value={value}
                                onChange={e => set(e.target.value)}
                                placeholder={placeholder}
                                style={{
                                    backgroundColor: '#111',
                                    border: '1px solid #2a2a2a',
                                    borderBottom: '2px solid #333',
                                    color: '#f5f5f5',
                                    fontSize: '16px',
                                    padding: '10px 14px',
                                    outline: 'none',
                                    fontFamily: 'inherit'
                                }}
                            />
                        </div>
                    ))}
                    <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
                        <label style={{color: '#555', fontSize: '11px', fontWeight: '700', letterSpacing: '2px'}}>SESSION
                            TYPE</label>
                        <select value={type} onChange={e => setType(e.target.value)} style={{
                            backgroundColor: '#111',
                            border: '1px solid #2a2a2a',
                            borderBottom: '2px solid #333',
                            color: '#f5f5f5',
                            fontSize: '14px',
                            padding: '10px 14px',
                            outline: 'none',
                            fontFamily: 'inherit'
                        }}>
                            <option>Race</option>
                            <option>Qualifying</option>
                        </select>
                    </div>
                    <button onClick={handleLoad} disabled={loading} style={{
                        backgroundColor: '#E8002D',
                        color: '#fff',
                        border: 'none',
                        padding: '14px',
                        fontSize: '14px',
                        fontWeight: '800',
                        letterSpacing: '3px',
                        cursor: 'pointer',
                        fontFamily: 'inherit',
                        clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 100%, 0 100%)',
                        opacity: loading ? 0.7 : 1
                    }}>
                        {loading ? 'LOADING...' : 'LOAD SESSION →'}
                    </button>
                    {status && (
                        <div style={{
                            color: status.startsWith('✓') ? '#00c853' : '#ff4466',
                            fontSize: '14px',
                            letterSpacing: '1px'
                        }}>
                            {status}
                        </div>
                    )}
                </div>
                <div style={{
                    backgroundColor: '#1a1a1a',
                    border: '1px solid #222',
                    borderTop: '3px solid #333',
                    padding: '32px',
                    marginTop: '16px'
                }}>
                    <div style={{
                        color: '#555',
                        fontSize: '11px',
                        fontWeight: '700',
                        letterSpacing: '3px',
                        marginBottom: '8px'
                    }}>BULK LOAD
                    </div>
                    <div style={{color: '#888', fontSize: '14px', marginBottom: '20px'}}>
                        Load all default sessions: Bahrain, Monaco, Baku, Monza, Abu Dhabi + Silverstone (2021) / Suzuka
                        (2022-2024). Race only.
                    </div>
                    <button
                        onClick={handleLoadDefaults}
                        disabled={defaultsLoading}
                        style={{
                            backgroundColor: '#1a1a1a',
                            color: '#666',
                            border: '1px solid #333',
                            padding: '14px',
                            fontSize: '14px',
                            fontWeight: '800',
                            letterSpacing: '3px',
                            cursor: 'pointer',
                            fontFamily: 'inherit',
                            width: '100%',
                            opacity: defaultsLoading ? 0.7 : 1
                        }}
                    >
                        {defaultsLoading ? 'LOADING ALL SESSIONS...' : 'LOAD DEFAULT SESSIONS →'}
                    </button>
                    {defaultsStatus && !defaultsStatus.error && (
                        <div style={{marginTop: '16px'}}>
                            <div style={{color: '#00c853', fontSize: '13px', marginBottom: '8px'}}>
                                ✓ {defaultsStatus.success?.length || 0} sessions loaded
                            </div>
                            {defaultsStatus.failed?.length > 0 && (
                                <div style={{color: '#ff4466', fontSize: '13px'}}>
                                    ✗ {defaultsStatus.failed.length} failed: {defaultsStatus.failed.join(', ')}
                                </div>
                            )}
                        </div>
                    )}
                    {defaultsStatus?.error && (
                        <div style={{
                            color: '#ff4466',
                            fontSize: '13px',
                            marginTop: '16px'
                        }}>✗ {defaultsStatus.error}</div>
                    )}
                </div>
                <div style={{
                    backgroundColor: '#1a1a1a',
                    border: '1px solid #222',
                    borderTop: '3px solid #FFD700',
                    padding: '32px',
                    marginTop: '16px'
                }}>
                    <div style={{
                        color: '#FFD700',
                        fontSize: '11px',
                        fontWeight: '700',
                        letterSpacing: '3px',
                        marginBottom: '8px'
                    }}>
                        STATIC DATA
                    </div>
                    <div style={{color: '#888', fontSize: '14px', marginBottom: '20px'}}>
                        Seed engine suppliers, circuit types and team season engines. Run once after first setup.
                    </div>
                    <button onClick={handleSeed} disabled={seedLoading} style={{
                        backgroundColor: '#1a1a1a',
                        color: '#FFD700',
                        border: '1px solid #FFD70044',
                        padding: '14px',
                        fontSize: '14px',
                        fontWeight: '800',
                        letterSpacing: '3px',
                        cursor: 'pointer',
                        fontFamily: 'inherit',
                        width: '100%',
                        opacity: seedLoading ? 0.7 : 1
                    }}>
                        {seedLoading ? 'SEEDING...' : 'SEED STATIC DATA →'}
                    </button>
                    {seedStatus?.message && (
                        <div
                            style={{color: '#00c853', fontSize: '13px', marginTop: '16px'}}>✓ {seedStatus.message}</div>
                    )}
                    {seedStatus?.error && (
                        <div style={{color: '#ff4466', fontSize: '13px', marginTop: '16px'}}>✗ {seedStatus.error}</div>
                    )}
                </div>
            </div>
        </div>
    )
}