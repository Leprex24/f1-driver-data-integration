import {useState, useEffect} from "react";

const F1_RED = "#E8002D";
const F1_DARK = "#0a0a0a";
const F1_GRAY = "#141414";
const F1_GRAY2 = "#1a1a1a";
const F1_LIGHT = "#f5f5f5";
const F1_MID = "#888";

const SESSION_TYPE_LABELS = {
    Race: {label: "RACE", color: F1_RED},
    Qualifying: {label: "QUALI", color: "#FFD700"},
    "Practice 1": {label: "FP1", color: "#4a9eff"},
    "Practice 2": {label: "FP2", color: "#4a9eff"},
    "Practice 3": {label: "FP3", color: "#4a9eff"},
};

const CIRCUIT_FLAGS = {
    Bahrain: "bh", Sakhir: "bh",
    Monaco: "mc", "Monte Carlo": "mc",
    Azerbaijan: "az", Baku: "az",
    "Abu Dhabi": "ae", "Yas Island": "ae",
    Japan: "jp", Suzuka: "jp",
    "Great Britain": "gb", Silverstone: "gb",
    Italy: "it", Monza: "it",
    Spain: "es", Barcelona: "es",
    Hungary: "hu", Budapest: "hu",
    Belgium: "be", "Spa-Francorchamps": "be",
    Netherlands: "nl", Zandvoort: "nl",
    Singapore: "sg", "Marina Bay": "sg",
    USA: "us", Austin: "us",
    Mexico: "mx", MexicoCity: "mx",
    Brazil: "br",
    "Saudi Arabia": "sa", Jeddah: "sa",
    Australia: "au", Melbourne: "au",
    Canada: "ca", Montréal: "ca",
    France: "fr", "Le Castellet": "fr",
    Austria: "at", Spielberg: "at",
    Qatar: "qa", Lusail: "qa",
    Miami: "us", "Miami Gardens": "us",
    "Las Vegas": "us",
};

import Navbar from "../components/Navbar";

function SessionCard({session, index, onNavigate}) {
    const sessionMeta = SESSION_TYPE_LABELS[session.type] || {
        label: session.type?.toUpperCase(),
        color: F1_MID,
    };
    const flagCode = CIRCUIT_FLAGS[session.circuit] || "xx";

    return (
        <div
            style={{
                ...cardStyles.root,
                animationDelay: `${index * 60}ms`,
                cursor: "pointer"
            }}
            className="session-card"
            onClick={() => onNavigate('comparison', {
                circuit_id: session.circuit,
                season: session.season,
                session_type: session.type,
            })}
        >
            <div style={cardStyles.top}>
                <img src={`https://flagcdn.com/32x24/${flagCode}.png`} alt={session.circuit}
                     style={{width: "32px", height: "24px", objectFit: "cover"}}/>
                <span
                    style={{
                        ...cardStyles.badge,
                        backgroundColor: sessionMeta.color + "22",
                        color: sessionMeta.color,
                        border: `1px solid ${sessionMeta.color}44`,
                    }}
                >
          {sessionMeta.label}
        </span>
            </div>
            <div style={cardStyles.circuit}>{session.circuit || "—"}</div>
            <div style={cardStyles.event}>{session.event}</div>
            <div style={cardStyles.meta}>
                <span style={cardStyles.season}>Season {session.season}</span>
                <span style={cardStyles.dot}>·</span>
                <span style={cardStyles.round}>R{session.round}</span>
            </div>
            <div style={cardStyles.date}>
                {session.date
                    ? new Date(session.date).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                    })
                    : "—"}
            </div>
            <div style={cardStyles.divider}/>
            <div style={cardStyles.id}>SESSION #{session.id}</div>
        </div>
    );
}

function StatsBar({sessions}) {
    const races = sessions.filter((s) => s.type === "Race").length;
    const circuits = new Set(sessions.map((s) => s.circuit)).size;
    const seasons = new Set(sessions.map((s) => s.season)).size;

    const stats = [
        {label: "SESSIONS", value: sessions.length},
        {label: "RACES", value: races},
        {label: "CIRCUITS", value: circuits},
        {label: "SEASONS", value: seasons},
    ];

    return (
        <div style={statsStyles.root}>
            {stats.map((s, i) => (
                <div key={i} style={statsStyles.item}>
                    <div style={statsStyles.value}>{s.value}</div>
                    <div style={statsStyles.label}>{s.label}</div>
                </div>
            ))}
        </div>
    );
}

export default function Dashboard({token, onNavigate, onLogout, userRole}) {
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [filter, setFilter] = useState("ALL");
    const [currentPage, setCurrentPage] = useState("dashboard");

    const fetchSessions = async () => {
        try {
            const response = await fetch("http://localhost:8000/sessions/", {
                headers: {Authorization: `Bearer ${token}`},
            });
            if (!response.ok) throw new Error("Failed to fetch");
            const data = await response.json();
            setSessions(data);
        } catch {
            setError("Could not load sessions from server.");
        } finally {
            setLoading(false);
        }
    };

    const handleNavigate = (page) => {
        setCurrentPage(page);
        if (onNavigate) onNavigate(page);
    };

    const filterTypes = ["ALL", "RACE", "QUALI"];
    const filtered = sessions.filter((s) => {
        if (filter === "ALL") return true;
        if (filter === "RACE") return s.type === "Race";
        if (filter === "QUALI") return s.type === "Qualifying";
        return true;
    });

    return (
        <div style={pageStyles.root}>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;600;700;900&display=swap');
        * { font-family: 'Rajdhani', sans-serif; }
        .session-card {
          animation: fadeUp 0.4s ease both;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .session-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 40px rgba(232,0,45,0.15);
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

            <Navbar
                onNavigate={handleNavigate}
                currentPage={currentPage}
                onLogout={onLogout}
                userRole={userRole}
            />

            <main style={pageStyles.main}>
                {/* Header */}
                <div style={pageStyles.header}>
                    <div>
                        <div style={pageStyles.headerTag}>RACE DATA</div>
                        <h1 style={pageStyles.headerTitle}>Sessions Dashboard</h1>
                        <p style={pageStyles.headerSub}>
                            Browse loaded race and qualifying sessions
                        </p>
                    </div>
                    <div style={pageStyles.headerLine}/>
                </div>

                {/* Stats */}
                {!loading && sessions.length > 0 && (
                    <StatsBar sessions={sessions}/>
                )}

                {/* Filters */}
                <div style={pageStyles.filterRow}>
                    {filterTypes.map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            style={{
                                ...pageStyles.filterBtn,
                                ...(filter === f ? pageStyles.filterBtnActive : {}),
                            }}
                        >
                            {f}
                        </button>
                    ))}
                    <div style={pageStyles.filterCount}>
                        {filtered.length} session{filtered.length !== 1 ? "s" : ""}
                    </div>
                </div>

                {/* Content */}
                {loading && (
                    <div style={pageStyles.center}>
                        <div style={pageStyles.loadingDot}/>
                        <span style={pageStyles.loadingText}>Loading sessions...</span>
                    </div>
                )}

                {error && (
                    <div style={pageStyles.error}>{error}</div>
                )}

                {!loading && !error && filtered.length === 0 && (
                    <div style={pageStyles.empty}>
                        <div style={pageStyles.emptyIcon}>⬜</div>
                        <div style={pageStyles.emptyText}>No sessions found</div>
                        <div style={pageStyles.emptySub}>
                            Load sessions via POST /sessions/load
                        </div>
                    </div>
                )}

                {!loading && filtered.length > 0 && (
                    <div style={pageStyles.grid}>
                        {filtered.map((session, i) => (
                            <SessionCard key={session.id} session={session} index={i} onNavigate={onNavigate}/>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}

/* ── Styles ── */
const pageStyles = {
    root: {
        backgroundColor: F1_DARK,
        minHeight: "100vh",
        color: F1_LIGHT,
    },
    main: {
        maxWidth: "1400px",
        margin: "0 auto",
        padding: "48px 40px",
    },
    header: {
        marginBottom: "40px",
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "space-between",
    },
    headerTag: {
        color: F1_RED,
        fontSize: "11px",
        fontWeight: "700",
        letterSpacing: "4px",
        marginBottom: "8px",
    },
    headerTitle: {
        color: F1_LIGHT,
        fontSize: "40px",
        fontWeight: "900",
        letterSpacing: "-1px",
        margin: "0 0 8px 0",
        textTransform: "uppercase",
    },
    headerSub: {
        color: "#555",
        fontSize: "14px",
        margin: 0,
    },
    headerLine: {
        height: "60px",
        width: "1px",
        backgroundColor: "#222",
    },
    filterRow: {
        display: "flex",
        gap: "8px",
        alignItems: "center",
        marginBottom: "32px",
    },
    filterBtn: {
        backgroundColor: "transparent",
        border: "1px solid #2a2a2a",
        color: "#555",
        fontSize: "11px",
        fontWeight: "700",
        letterSpacing: "2px",
        padding: "7px 16px",
        cursor: "pointer",
        fontFamily: "inherit",
        transition: "all 0.2s",
    },
    filterBtnActive: {
        backgroundColor: F1_RED,
        border: `1px solid ${F1_RED}`,
        color: "#fff",
    },
    filterCount: {
        marginLeft: "auto",
        color: "#444",
        fontSize: "12px",
        letterSpacing: "1px",
    },
    grid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
        gap: "16px",
    },
    center: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "12px",
        padding: "80px 0",
    },
    loadingDot: {
        width: "8px",
        height: "8px",
        backgroundColor: F1_RED,
        borderRadius: "50%",
        animation: "pulse 1s infinite",
    },
    loadingText: {
        color: "#444",
        fontSize: "14px",
        letterSpacing: "2px",
    },
    error: {
        backgroundColor: "rgba(232,0,45,0.08)",
        border: "1px solid rgba(232,0,45,0.2)",
        color: "#ff4466",
        padding: "16px 20px",
        fontSize: "14px",
        marginBottom: "24px",
    },
    empty: {
        textAlign: "center",
        padding: "80px 0",
    },
    emptyIcon: {
        fontSize: "40px",
        marginBottom: "16px",
        opacity: 0.3,
    },
    emptyText: {
        color: "#444",
        fontSize: "18px",
        fontWeight: "700",
        letterSpacing: "2px",
        marginBottom: "8px",
    },
    emptySub: {
        color: "#333",
        fontSize: "13px",
        letterSpacing: "1px",
    },
};

const statsStyles = {
    root: {
        display: "flex",
        gap: "1px",
        marginBottom: "40px",
        backgroundColor: "#1a1a1a",
        border: "1px solid #222",
    },
    item: {
        flex: 1,
        padding: "20px 24px",
        backgroundColor: F1_GRAY,
        borderRight: "1px solid #222",
    },
    value: {
        color: F1_LIGHT,
        fontSize: "36px",
        fontWeight: "900",
        letterSpacing: "-1px",
        lineHeight: 1,
        marginBottom: "4px",
    },
    label: {
        color: "#666",
        fontSize: "11px",
        fontWeight: "700",
        letterSpacing: "3px",
    },
};

const cardStyles = {
    root: {
        backgroundColor: F1_GRAY2,
        border: "1px solid #222",
        borderTop: `2px solid #2a2a2a`,
        padding: "24px",
        cursor: "pointer",
    },
    top: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "16px",
    },
    badge: {
        fontSize: "10px",
        fontWeight: "800",
        letterSpacing: "2px",
        padding: "4px 10px",
    },
    circuit: {
        color: F1_LIGHT,
        fontSize: "22px",
        fontWeight: "900",
        letterSpacing: "-0.5px",
        textTransform: "uppercase",
        marginBottom: "4px",
    },
    event: {
        color: "#666",
        fontSize: "12px",
        letterSpacing: "1px",
        marginBottom: "12px",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
    },
    meta: {
        display: "flex",
        gap: "8px",
        alignItems: "center",
        marginBottom: "8px",
    },
    season: {
        color: "#888",
        fontSize: "12px",
        fontWeight: "700",
        letterSpacing: "1px",
    },
    dot: {
        color: "#333",
    },
    round: {
        color: "#666",
        fontSize: "12px",
    },
    date: {
        color: "#666",
        fontSize: "12px",
        letterSpacing: "0.5px",
    },
    divider: {
        height: "1px",
        backgroundColor: "#222",
        margin: "16px 0 12px",
    },
    id: {
        color: "#444",
        fontSize: "10px",
        fontWeight: "700",
        letterSpacing: "2px",
    },
};