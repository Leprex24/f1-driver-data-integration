import {useState, useEffect} from "react";
import Navbar from "../components/Navbar";
import {getDrivers} from "../services/api";

const F1_RED = "#E8002D";
const F1_DARK = "#0a0a0a";
const F1_GRAY2 = "#1a1a1a";
const F1_LIGHT = "#f5f5f5";

function getFlagUrl(nationality) {
    const map = {
        NED: "nl", GBR: "gb", MON: "mc", ESP: "es", FIN: "fi",
        MEX: "mx", FRA: "fr", AUS: "au", GER: "de", CAN: "ca",
        DEN: "dk", JPN: "jp", THA: "th", CHN: "cn", ITA: "it",
        POL: "pl", RUS: "ru", BRA: "br", USA: "us", NZL: "nz",
        ARG: "ar", ZAF: "za",
    };
    const code = map[nationality];
    return code ? `https://flagcdn.com/24x18/${code}.png` : null;
}

function DriverCard({driver, index, onNavigate}) {
    return (
        <div
            style={{
                ...cardStyles.root,
                cursor: "pointer",
                animationDelay: `${index * 40}ms`,
                borderTop: `3px solid #${driver.team_color || "333"}`,
            }}
            className="driver-card"
            onClick={() => onNavigate('comparison', {driver1: driver.abbreviation})}
        >
            <div style={cardStyles.header}>
                <div style={cardStyles.number}>#{driver.number}</div>
                {getFlagUrl(driver.nationality)
                    ? <img src={getFlagUrl(driver.nationality)} alt={driver.nationality}
                           style={{width: "24px", height: "18px"}}/>
                    : <span style={{color: "#333", fontSize: "12px"}}>{driver.nationality || "—"}</span>
                }
            </div>
            <div style={cardStyles.name}>
                <div style={cardStyles.firstName}>{driver.first_name}</div>
                <div style={cardStyles.lastName}>{driver.last_name}</div>
            </div>
            <div style={cardStyles.divider}/>
            <div style={cardStyles.footer}>
                <span style={cardStyles.abbr}>{driver.abbreviation}</span>
                <span style={cardStyles.nationality}>{driver.nationality || "—"}</span>
            </div>
        </div>
    );
}

export default function Drivers({token, onNavigate, onLogout, userRole}) {
    const [drivers, setDrivers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");
    const [sortBy, setSortBy] = useState("number");

    useEffect(() => {
        getDrivers(token)
            .then(setDrivers)
            .catch(() => setError("Could not load drivers."))
            .finally(() => setLoading(false));
    }, []);

    const filtered = drivers
        .filter((d) => {
            const q = search.toLowerCase();
            return (
                d.first_name?.toLowerCase().includes(q) ||
                d.last_name?.toLowerCase().includes(q) ||
                d.abbreviation?.toLowerCase().includes(q) ||
                d.nationality?.toLowerCase().includes(q)
            );
        })
        .sort((a, b) => {
            if (sortBy === "number") {
                return (parseInt(a.number) || 999) - (parseInt(b.number) || 999);
            }
            if (sortBy === "name") return a.last_name?.localeCompare(b.last_name);
            if (sortBy === "nationality") return a.nationality?.localeCompare(b.nationality);
            return 0;
        });

    return (
        <div style={pageStyles.root}>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;600;700;900&display=swap');
        * { font-family: 'Rajdhani', sans-serif; }
        .driver-card {
          animation: fadeUp 0.35s ease both;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .driver-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 32px rgba(0,0,0,0.4);
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        input::placeholder { color: #333; }
      `}</style>

            <Navbar onNavigate={onNavigate} currentPage="drivers" onLogout={onLogout} userRole={userRole}/>

            <main style={pageStyles.main}>
                {/* Header */}
                <div style={pageStyles.header}>
                    <div>
                        <div style={pageStyles.headerTag}>GRID</div>
                        <h1 style={pageStyles.headerTitle}>Drivers</h1>
                        <p style={pageStyles.headerSub}>
                            {drivers.length} drivers across 2021–2024 seasons
                        </p>
                    </div>
                </div>

                {/* Controls */}
                <div style={pageStyles.controls}>
                    <input
                        type="text"
                        placeholder="Search by name, abbreviation or nationality..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        style={pageStyles.search}
                    />
                    <div style={pageStyles.sortRow}>
                        <span style={pageStyles.sortLabel}>SORT:</span>
                        {["number", "name", "nationality"].map((s) => (
                            <button
                                key={s}
                                onClick={() => setSortBy(s)}
                                style={{
                                    ...pageStyles.sortBtn,
                                    ...(sortBy === s ? pageStyles.sortBtnActive : {}),
                                }}
                            >
                                {s.toUpperCase()}
                            </button>
                        ))}
                        <span style={pageStyles.count}>{filtered.length} drivers</span>
                    </div>
                </div>

                {/* Content */}
                {loading && (
                    <div style={pageStyles.center}>
                        <span style={pageStyles.loadingText}>Loading drivers...</span>
                    </div>
                )}

                {error && <div style={pageStyles.error}>{error}</div>}

                {!loading && !error && (
                    <div style={pageStyles.grid}>
                        {filtered.map((driver, i) => (
                            <DriverCard key={driver.id} driver={driver} index={i} onNavigate={onNavigate}/>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}

/* ── Styles ── */
const pageStyles = {
    root: {backgroundColor: F1_DARK, minHeight: "100vh", color: F1_LIGHT},
    main: {maxWidth: "1400px", margin: "0 auto", padding: "48px 40px"},
    header: {marginBottom: "40px"},
    headerTag: {
        color: F1_RED, fontSize: "11px", fontWeight: "700",
        letterSpacing: "4px", marginBottom: "8px",
    },
    headerTitle: {
        color: F1_LIGHT, fontSize: "40px", fontWeight: "900",
        letterSpacing: "-1px", margin: "0 0 8px 0", textTransform: "uppercase",
    },
    headerSub: {color: "#555", fontSize: "14px", margin: 0},
    controls: {marginBottom: "32px"},
    search: {
        width: "100%",
        backgroundColor: "#111",
        border: "1px solid #2a2a2a",
        borderBottom: "2px solid #333",
        color: F1_LIGHT,
        fontSize: "16px",
        padding: "12px 16px",
        outline: "none",
        fontFamily: "inherit",
        marginBottom: "12px",
        boxSizing: "border-box",
    },
    sortRow: {
        display: "flex",
        alignItems: "center",
        gap: "8px",
    },
    sortLabel: {
        color: "#444",
        fontSize: "11px",
        fontWeight: "700",
        letterSpacing: "2px",
        marginRight: "4px",
    },
    sortBtn: {
        backgroundColor: "transparent",
        border: "1px solid #2a2a2a",
        color: "#555",
        fontSize: "11px",
        fontWeight: "700",
        letterSpacing: "2px",
        padding: "6px 14px",
        cursor: "pointer",
        fontFamily: "inherit",
        transition: "all 0.2s",
    },
    sortBtnActive: {
        backgroundColor: F1_RED,
        border: `1px solid ${F1_RED}`,
        color: "#fff",
    },
    count: {
        marginLeft: "auto",
        color: "#333",
        fontSize: "12px",
        letterSpacing: "1px",
    },
    grid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
        gap: "12px",
    },
    center: {
        display: "flex", justifyContent: "center",
        padding: "80px 0",
    },
    loadingText: {color: "#444", fontSize: "14px", letterSpacing: "2px"},
    error: {
        backgroundColor: "rgba(232,0,45,0.08)",
        border: "1px solid rgba(232,0,45,0.2)",
        color: "#ff4466",
        padding: "16px 20px",
        fontSize: "14px",
    },
};

const cardStyles = {
    root: {
        backgroundColor: F1_GRAY2,
        border: "1px solid #222",
        padding: "20px",
        cursor: "default",
    },
    header: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "16px",
    },
    number: {
        color: "#333",
        fontSize: "28px",
        fontWeight: "900",
        letterSpacing: "-1px",
        lineHeight: 1,
    },
    flag: {fontSize: "22px"},
    name: {marginBottom: "16px"},
    firstName: {
        color: "#666",
        fontSize: "13px",
        fontWeight: "600",
        letterSpacing: "1px",
        textTransform: "uppercase",
    },
    lastName: {
        color: F1_LIGHT,
        fontSize: "22px",
        fontWeight: "900",
        letterSpacing: "-0.5px",
        textTransform: "uppercase",
        lineHeight: 1.1,
    },
    divider: {
        height: "1px",
        backgroundColor: "#222",
        margin: "12px 0",
    },
    footer: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
    },
    abbr: {
        color: F1_RED,
        fontSize: "13px",
        fontWeight: "800",
        letterSpacing: "3px",
    },
    nationality: {
        color: "#444",
        fontSize: "12px",
        letterSpacing: "1px",
    },
};