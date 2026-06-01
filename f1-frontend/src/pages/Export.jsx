import {useState, useEffect} from "react";
import Navbar from "../components/Navbar";

const F1_RED = "#E8002D";
const F1_DARK = "#0a0a0a";
const F1_GRAY2 = "#1a1a1a";
const F1_LIGHT = "#f5f5f5";

const FLAG_MAP = {
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
    Canada: "ca", Montreal: "ca",
    France: "fr", "Le Castellet": "fr",
    Austria: "at", Spielberg: "at",
    Qatar: "qa", Lusail: "qa",
    Miami: "us", "Miami Gardens": "us",
    "Las Vegas": "us",
};

export default function Export({token, onNavigate, onLogout, userRole}) {
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState(null);
    const [exporting, setExporting] = useState(null);
    const [result, setResult] = useState(null);
    const [format, setFormat] = useState("json");
    const [filter, setFilter] = useState("ALL");

    useEffect(() => {
        fetch("http://localhost:8000/sessions/", {
            headers: {Authorization: `Bearer ${token}`},
        })
            .then((r) => r.json())
            .then(setSessions)
            .finally(() => setLoading(false));
    }, []);

    const handleExport = async () => {
        if (!selected) return;
        setExporting(true);
        setResult(null);
        try {
            const url = `http://localhost:8000/export/session/${selected.id}/${format}`;
            const response = await fetch(url, {
                headers: {Authorization: `Bearer ${token}`},
            });

            if (format === "json") {
                const data = await response.json();
                const blob = new Blob([JSON.stringify(data, null, 2)], {
                    type: "application/json",
                });
                downloadBlob(blob, `f1_session_${selected.id}.json`);
                setResult({type: "json", preview: JSON.stringify(data, null, 2).slice(0, 800) + "\n..."});
            } else {
                const text = await response.text();
                const blob = new Blob([text], {type: "application/xml"});
                downloadBlob(blob, `f1_session_${selected.id}.xml`);
                setResult({type: "xml", preview: text.slice(0, 800) + "\n..."});
            }
        } catch {
            setResult({type: "error", preview: "Export failed. Check server connection."});
        } finally {
            setExporting(false);
        }
    };

    const downloadBlob = (blob, filename) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    };

    const filtered = sessions.filter((s) => {
        if (filter === "ALL") return true;
        if (filter === "RACE") return s.type === "Race";
        if (filter === "QUALI") return s.type === "Qualifying";
        return true;
    });

    const grouped = filtered.reduce((acc, s) => {
        const key = s.season;
        if (!acc[key]) acc[key] = [];
        acc[key].push(s);
        return acc;
    }, {});

    return (
        <div style={pageStyles.root}>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;600;700;900&display=swap');
        * { font-family: 'Rajdhani', sans-serif; }
        .session-row:hover { background-color: #1e1e1e; }
        pre { margin: 0; }
      `}</style>

            <Navbar onNavigate={onNavigate} currentPage="export" onLogout={onLogout} userRole={userRole}/>

            <main style={pageStyles.main}>
                <div style={pageStyles.header}>
                    <div>
                        <div style={pageStyles.headerTag}>DATA EXPORT</div>
                        <h1 style={pageStyles.headerTitle}>Export Sessions</h1>
                        <p style={pageStyles.headerSub}>
                            Download session data in JSON or XML format
                        </p>
                    </div>
                </div>

                <div style={pageStyles.layout}>
                    {/* Left – session picker */}
                    <div style={pageStyles.left}>
                        <div style={pageStyles.panel}>
                            <div style={pageStyles.panelHeader}>
                                <span style={pageStyles.panelTitle}>SELECT SESSION</span>
                                <div style={pageStyles.filterRow}>
                                    {["ALL", "RACE", "QUALI"].map((f) => (
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
                                </div>
                            </div>

                            {loading ? (
                                <div style={pageStyles.center}>Loading...</div>
                            ) : (
                                <div style={pageStyles.sessionList}>
                                    {Object.keys(grouped)
                                        .sort((a, b) => b - a)
                                        .map((season) => (
                                            <div key={season}>
                                                <div style={pageStyles.seasonHeader}>{season}</div>
                                                {grouped[season].map((session) => {
                                                    const flagCode = FLAG_MAP[session.circuit];
                                                    const isSelected = selected?.id === session.id;
                                                    return (
                                                        <div
                                                            key={session.id}
                                                            className="session-row"
                                                            onClick={() => {
                                                                setSelected(session);
                                                                setResult(null);
                                                            }}
                                                            style={{
                                                                ...pageStyles.sessionRow,
                                                                ...(isSelected ? pageStyles.sessionRowActive : {}),
                                                            }}
                                                        >
                                                            <div style={pageStyles.sessionRowLeft}>
                                                                {flagCode ? (
                                                                    <img
                                                                        src={`https://flagcdn.com/20x15/${flagCode}.png`}
                                                                        alt={session.circuit}
                                                                        style={{width: "20px", height: "15px"}}
                                                                    />
                                                                ) : (
                                                                    <div style={pageStyles.flagPlaceholder}/>
                                                                )}
                                                                <div>
                                                                    <div style={pageStyles.sessionCircuit}>
                                                                        {session.circuit}
                                                                    </div>
                                                                    <div style={pageStyles.sessionMeta}>
                                                                        R{session.round} · {new Date(session.date).toLocaleDateString("en-GB", {
                                                                        day: "numeric",
                                                                        month: "short"
                                                                    })}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <span style={{
                                                                ...pageStyles.typeBadge,
                                                                color: session.type === "Race" ? F1_RED : "#FFD700",
                                                                borderColor: session.type === "Race" ? F1_RED + "44" : "#FFD70044",
                                                                backgroundColor: session.type === "Race" ? F1_RED + "11" : "#FFD70011",
                                                            }}>
                                {session.type === "Race" ? "R" : "Q"}
                              </span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right – export options */}
                    <div style={pageStyles.right}>
                        <div style={pageStyles.panel}>
                            <div style={pageStyles.panelHeader}>
                                <span style={pageStyles.panelTitle}>EXPORT OPTIONS</span>
                            </div>

                            {!selected ? (
                                <div style={pageStyles.empty}>
                                    <div style={pageStyles.emptyIcon}>←</div>
                                    <div style={pageStyles.emptyText}>Select a session to export</div>
                                </div>
                            ) : (
                                <div style={pageStyles.exportForm}>
                                    {/* Selected session info */}
                                    <div style={pageStyles.selectedInfo}>
                                        <div style={pageStyles.selectedLabel}>SELECTED</div>
                                        <div style={pageStyles.selectedValue}>
                                            {selected.circuit} · {selected.season} · {selected.type}
                                        </div>
                                        <div style={pageStyles.selectedSub}>Session #{selected.id}</div>
                                    </div>

                                    {/* Format picker */}
                                    <div style={pageStyles.formatSection}>
                                        <div style={pageStyles.formatLabel}>FORMAT</div>
                                        <div style={pageStyles.formatRow}>
                                            {["json", "xml"].map((f) => (
                                                <button
                                                    key={f}
                                                    onClick={() => setFormat(f)}
                                                    style={{
                                                        ...pageStyles.formatBtn,
                                                        ...(format === f ? pageStyles.formatBtnActive : {}),
                                                    }}
                                                >
                                                    <div style={pageStyles.formatBtnTitle}>{f.toUpperCase()}</div>
                                                    <div style={pageStyles.formatBtnSub}>
                                                        {f === "json" ? "Machine-readable · API-friendly" : "Human-readable · Report-friendly"}
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* What's included */}
                                    <div style={pageStyles.includes}>
                                        <div style={pageStyles.includesLabel}>INCLUDES</div>
                                        <div style={pageStyles.includesList}>
                                            {["Session metadata", "All lap times", "Sector times", "Tyre compounds", "Driver results", "Weather snapshots"].map((item) => (
                                                <div key={item} style={pageStyles.includesItem}>
                                                    <span style={pageStyles.includesDot}>▸</span>
                                                    <span>{item}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleExport}
                                        disabled={exporting}
                                        style={{
                                            ...pageStyles.exportBtn,
                                            opacity: exporting ? 0.7 : 1,
                                        }}
                                    >
                                        {exporting
                                            ? "EXPORTING..."
                                            : `DOWNLOAD ${format.toUpperCase()} →`}
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Preview */}
                        {result && (
                            <div style={pageStyles.preview}>
                                <div style={pageStyles.previewHeader}>
                  <span style={pageStyles.panelTitle}>
                    {result.type === "error" ? "ERROR" : `${result.type.toUpperCase()} PREVIEW`}
                  </span>
                                    <span style={pageStyles.previewNote}>
                    {result.type !== "error" && "File downloaded automatically"}
                  </span>
                                </div>
                                <pre style={{
                                    ...pageStyles.previewCode,
                                    color: result.type === "error" ? "#ff4466" : "#6a9955",
                                }}>
                  {result.preview}
                </pre>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}

/* ── Styles ── */
const pageStyles = {
    root: {backgroundColor: F1_DARK, minHeight: "100vh", color: F1_LIGHT},
    main: {maxWidth: "1400px", margin: "0 auto", padding: "48px 40px"},
    header: {marginBottom: "40px"},
    headerTag: {color: F1_RED, fontSize: "11px", fontWeight: "700", letterSpacing: "4px", marginBottom: "8px"},
    headerTitle: {
        color: F1_LIGHT,
        fontSize: "40px",
        fontWeight: "900",
        letterSpacing: "-1px",
        margin: "0 0 8px 0",
        textTransform: "uppercase"
    },
    headerSub: {color: "#555", fontSize: "14px", margin: 0},
    layout: {display: "grid", gridTemplateColumns: "340px 1fr", gap: "16px", alignItems: "start"},
    left: {},
    right: {display: "flex", flexDirection: "column", gap: "16px"},
    panel: {backgroundColor: F1_GRAY2, border: "1px solid #222", borderTop: `3px solid ${F1_RED}`},
    panelHeader: {
        padding: "16px 20px",
        borderBottom: "1px solid #222",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
    },
    panelTitle: {color: "#444", fontSize: "10px", fontWeight: "700", letterSpacing: "3px"},
    filterRow: {display: "flex", gap: "4px"},
    filterBtn: {
        backgroundColor: "transparent",
        border: "1px solid #2a2a2a",
        color: "#555",
        fontSize: "10px",
        fontWeight: "700",
        letterSpacing: "1px",
        padding: "4px 10px",
        cursor: "pointer",
        fontFamily: "inherit"
    },
    filterBtnActive: {backgroundColor: F1_RED, border: `1px solid ${F1_RED}`, color: "#fff"},
    sessionList: {maxHeight: "600px", overflowY: "auto"},
    seasonHeader: {
        padding: "8px 20px",
        color: "#333",
        fontSize: "11px",
        fontWeight: "700",
        letterSpacing: "3px",
        borderBottom: "1px solid #1a1a1a",
        backgroundColor: "#111"
    },
    sessionRow: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "12px 20px",
        borderBottom: "1px solid #1a1a1a",
        cursor: "pointer",
        transition: "background-color 0.15s"
    },
    sessionRowActive: {backgroundColor: "#222", borderLeft: `3px solid ${F1_RED}`},
    sessionRowLeft: {display: "flex", alignItems: "center", gap: "12px"},
    flagPlaceholder: {width: "20px", height: "15px", backgroundColor: "#222"},
    sessionCircuit: {color: F1_LIGHT, fontSize: "14px", fontWeight: "700", letterSpacing: "0.5px"},
    sessionMeta: {color: "#444", fontSize: "11px", letterSpacing: "0.5px"},
    typeBadge: {fontSize: "10px", fontWeight: "800", letterSpacing: "1px", padding: "3px 8px", border: "1px solid"},
    exportForm: {padding: "24px"},
    selectedInfo: {marginBottom: "24px", padding: "16px", backgroundColor: "#111", borderLeft: `3px solid ${F1_RED}`},
    selectedLabel: {color: "#444", fontSize: "10px", fontWeight: "700", letterSpacing: "3px", marginBottom: "6px"},
    selectedValue: {color: F1_LIGHT, fontSize: "18px", fontWeight: "900", letterSpacing: "-0.5px"},
    selectedSub: {color: "#444", fontSize: "12px", marginTop: "4px"},
    formatSection: {marginBottom: "24px"},
    formatLabel: {color: "#444", fontSize: "10px", fontWeight: "700", letterSpacing: "3px", marginBottom: "10px"},
    formatRow: {display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px"},
    formatBtn: {
        backgroundColor: "#111",
        border: "1px solid #2a2a2a",
        padding: "14px 16px",
        cursor: "pointer",
        textAlign: "left",
        fontFamily: "inherit",
        transition: "all 0.2s"
    },
    formatBtnActive: {border: `1px solid ${F1_RED}`, backgroundColor: F1_RED + "11"},
    formatBtnTitle: {color: F1_LIGHT, fontSize: "16px", fontWeight: "900", letterSpacing: "2px", marginBottom: "4px"},
    formatBtnSub: {color: "#444", fontSize: "11px", letterSpacing: "0.5px"},
    includes: {marginBottom: "24px"},
    includesLabel: {color: "#444", fontSize: "10px", fontWeight: "700", letterSpacing: "3px", marginBottom: "10px"},
    includesList: {display: "flex", flexDirection: "column", gap: "6px"},
    includesItem: {display: "flex", alignItems: "center", gap: "8px", color: "#666", fontSize: "13px"},
    includesDot: {color: F1_RED, fontSize: "10px"},
    exportBtn: {
        width: "100%",
        backgroundColor: F1_RED,
        color: "#fff",
        border: "none",
        padding: "14px 24px",
        fontSize: "14px",
        fontWeight: "800",
        letterSpacing: "3px",
        cursor: "pointer",
        fontFamily: "inherit",
        clipPath: "polygon(0 0, calc(100% - 8px) 0, 100% 100%, 0 100%)"
    },
    empty: {padding: "60px 24px", textAlign: "center"},
    emptyIcon: {color: "#333", fontSize: "32px", marginBottom: "12px"},
    emptyText: {color: "#444", fontSize: "14px", letterSpacing: "2px"},
    preview: {backgroundColor: F1_GRAY2, border: "1px solid #222"},
    previewHeader: {
        padding: "12px 20px",
        borderBottom: "1px solid #222",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
    },
    previewNote: {color: "#333", fontSize: "11px", letterSpacing: "1px"},
    previewCode: {
        padding: "20px",
        fontSize: "12px",
        lineHeight: "1.6",
        overflow: "auto",
        maxHeight: "300px",
        whiteSpace: "pre-wrap",
        wordBreak: "break-all"
    },
    center: {padding: "40px", textAlign: "center", color: "#444"},
};