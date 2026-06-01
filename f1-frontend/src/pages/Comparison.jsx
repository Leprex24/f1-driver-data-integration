import {useEffect, useState} from "react";
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid,
    Tooltip, Legend, ResponsiveContainer, BarChart, Bar, ReferenceArea
} from "recharts";
import {
    compareDrivers,
    detailCompareDrivers,
    getAvailableSessions,
    getSessionWeather,
    getTeammates
} from "../services/api";
import Navbar from "../components/Navbar";


const F1_RED = "#E8002D";
const F1_DARK = "#0a0a0a";
const F1_GRAY = "#141414";
const F1_GRAY2 = "#1a1a1a";
const F1_LIGHT = "#f5f5f5";
const DRIVER1_COLOR = "#4a9eff";
const DRIVER2_COLOR = "#FFD700";

const CIRCUITS = [
    {value: "Sakhir", label: "Bahrain – Sakhir"},
    {value: "Yas Island", label: "Abu Dhabi – Yas Island"},
    {value: "Monte Carlo", label: "Monaco – Monte Carlo"},
    {value: "Baku", label: "Azerbaijan – Baku"},
    {value: "Monza", label: "Italy – Monza"},
    {value: "Silverstone", label: "Great Britain – Silverstone"},
    {value: "Suzuka", label: "Japan – Suzuka"},
    {value: "Miami Gardens", label: "USA – Miami"},
];

const COMPOUNDS = ["SOFT", "MEDIUM", "HARD", "INTERMEDIATE", "WET"];

function formatTime(seconds) {
    if (!seconds) return "—";
    const m = Math.floor(seconds / 60);
    const s = (seconds % 60).toFixed(3);
    return `${m}:${s.padStart(6, "0")}`;
}

function StatCard({label, val1, val2, driver1, driver2, isTime}) {
    const v1 = isTime ? formatTime(val1) : val1 != null ? val1.toFixed(3) : "—";
    const v2 = isTime ? formatTime(val2) : val2 != null ? val2.toFixed(3) : "—";
    const faster =
        val1 != null && val2 != null ? (val1 < val2 ? 1 : val1 > val2 ? 2 : 0) : 0;

    return (
        <div style={statCardStyles.root}>
            <div style={statCardStyles.label}>{label}</div>
            <div style={statCardStyles.row}>
                <div style={statCardStyles.col}>
                    <div style={statCardStyles.abbr}>{driver1}</div>
                    <div style={{
                        ...statCardStyles.val,
                        color: faster === 1 ? DRIVER1_COLOR : F1_LIGHT,
                    }}>{v1}</div>
                    {faster === 1 && <div style={{
                        ...statCardStyles.tag,
                        backgroundColor: DRIVER1_COLOR + "22",
                        color: DRIVER1_COLOR
                    }}>FASTER</div>}
                </div>
                <div style={statCardStyles.divider}/>
                <div style={statCardStyles.col}>
                    <div style={statCardStyles.abbr}>{driver2}</div>
                    <div style={{
                        ...statCardStyles.val,
                        color: faster === 2 ? DRIVER2_COLOR : F1_LIGHT,
                    }}>{v2}</div>
                    {faster === 2 && <div style={{
                        ...statCardStyles.tag,
                        backgroundColor: DRIVER2_COLOR + "22",
                        color: DRIVER2_COLOR
                    }}>FASTER</div>}
                </div>
            </div>
        </div>
    );
}

function CompoundTable({data1, data2, driver1, driver2}) {
    const compounds = new Set([
        ...Object.keys(data1 || {}),
        ...Object.keys(data2 || {}),
    ]);

    return (
        <div style={tableStyles.root}>
            <div style={tableStyles.header}>
                <span style={tableStyles.th}>COMPOUND</span>
                <span style={tableStyles.th}>{driver1}</span>
                <span style={tableStyles.th}>{driver2}</span>
                <span style={tableStyles.th}>DELTA</span>
            </div>
            {[...compounds].map((c) => {
                const t1 = data1?.[c];
                const t2 = data2?.[c];
                const delta = t1 != null && t2 != null ? (t1 - t2).toFixed(3) : null;
                const compoundColor = {
                    SOFT: "#E8002D", MEDIUM: "#FFD700", HARD: "#f5f5f5",
                    INTERMEDIATE: "#00c853", WET: "#4a9eff"
                }[c] || "#888";
                return (
                    <div key={c} style={tableStyles.row}>
                        <span style={{...tableStyles.td, color: compoundColor, fontWeight: "700"}}>{c}</span>
                        <span style={tableStyles.td}>{formatTime(t1)}</span>
                        <span style={tableStyles.td}>{formatTime(t2)}</span>
                        <span style={{
                            ...tableStyles.td,
                            color: delta == null ? "#444" : delta < 0 ? DRIVER1_COLOR : delta > 0 ? DRIVER2_COLOR : "#888"
                        }}>
              {delta != null ? (delta > 0 ? "+" : "") + delta + "s" : "—"}
            </span>
                    </div>
                );
            })}
        </div>
    );
}

function LapChart({laps1, laps2, driver1, driver2}) {
    if (!laps1?.length && !laps2?.length) return null;

    const [refAreaLeft, setRefAreaLeft] = useState(null);
    const [refAreaRight, setRefAreaRight] = useState(null);
    const [isSelecting, setIsSelecting] = useState(false);
    const [zoomDomain, setZoomDomain] = useState(null);

    const COMPOUND_COLORS = {
        SOFT: "#E8002D", MEDIUM: "#FFD700", HARD: "#ffffff",
        INTERMEDIATE: "#00c853", WET: "#4a9eff", UNKNOWN: "#888",
    };

    const maxLap = Math.max(
        ...(laps1 || []).map((l) => l.lap_number),
        ...(laps2 || []).map((l) => l.lap_number)
    );

    const map1 = Object.fromEntries(
        (laps1 || []).map((l) => [l.lap_number, {lap_time: l.lap_time, compound: l.compound}])
    );
    const map2 = Object.fromEntries(
        (laps2 || []).map((l) => [l.lap_number, {lap_time: l.lap_time, compound: l.compound}])
    );

    const allData = Array.from({length: maxLap}, (_, i) => ({
        lap: i + 1,
        [driver1]: map1[i + 1]?.lap_time || null,
        [driver2]: map2[i + 1]?.lap_time || null,
        [`${driver1}_compound`]: map1[i + 1]?.compound || null,
        [`${driver2}_compound`]: map2[i + 1]?.compound || null,
    })).filter((d) => d[driver1] || d[driver2]);

    const visibleData = zoomDomain
        ? allData.filter(d => d.lap >= zoomDomain[0] && d.lap <= zoomDomain[1])
        : allData;

    const CustomTooltip = ({active, payload, label}) => {
        if (!active || !payload?.length) return null;
        return (
            <div style={tooltipStyles.root}>
                <div style={tooltipStyles.label}>LAP {label}</div>
                {payload.map((p) => {
                    const compound = p.payload[`${p.name}_compound`];
                    const compoundColor = COMPOUND_COLORS[compound] || "#888";
                    return (
                        <div key={p.name} style={{display: "flex", alignItems: "center", gap: "8px", marginTop: "4px"}}>
                            <div style={{width: "8px", height: "8px", borderRadius: "50%", backgroundColor: p.color}}/>
                            <span style={{color: p.color, fontSize: "13px"}}>{p.name}:</span>
                            <span style={{color: F1_LIGHT, fontSize: "13px"}}>{formatTime(p.value)}</span>
                            {compound && (
                                <div style={{display: "flex", alignItems: "center", gap: "4px"}}>
                                    <div style={{
                                        width: "8px",
                                        height: "8px",
                                        borderRadius: "50%",
                                        backgroundColor: compoundColor
                                    }}/>
                                    <span style={{color: compoundColor, fontSize: "11px"}}>{compound}</span>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <div style={chartStyles.root}>
            <div style={{display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px"}}>
                <div style={chartStyles.title}>LAP TIME PROGRESSION</div>
                {zoomDomain && (
                    <button onClick={() => setZoomDomain(null)} style={{
                        backgroundColor: "transparent", border: "1px solid #333",
                        color: "#666", fontSize: "11px", letterSpacing: "2px",
                        padding: "4px 12px", cursor: "pointer", fontFamily: "inherit",
                    }}>
                        RESET ZOOM
                    </button>
                )}
            </div>
            <div style={{userSelect: "none"}}>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart
                        data={visibleData}
                        onMouseDown={(e) => {
                            if (e?.activeLabel) {
                                setRefAreaLeft(e.activeLabel);
                                setIsSelecting(true);
                            }
                        }}
                        onMouseMove={(e) => {
                            if (isSelecting && e?.activeLabel) setRefAreaRight(e.activeLabel);
                        }}
                        onMouseUp={() => {
                            if (refAreaLeft && refAreaRight) {
                                const l = Math.min(refAreaLeft, refAreaRight);
                                const r = Math.max(refAreaLeft, refAreaRight);
                                if (l !== r) setZoomDomain([l, r]);
                            }
                            setIsSelecting(false);
                            setRefAreaLeft(null);
                            setRefAreaRight(null);
                        }}
                        margin={{top: 10, right: 20, left: 10, bottom: 10}}
                    >
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e1e1e"/>
                        <XAxis dataKey="lap" stroke="#444" tick={{fill: "#555", fontSize: 11}}/>
                        <YAxis stroke="#444" tick={{fill: "#555", fontSize: 11}} tickFormatter={(v) => formatTime(v)}
                               width={70} domain={['auto', 'auto']}/>
                        <Tooltip content={<CustomTooltip/>}/>
                        <Legend wrapperStyle={{color: "#666", fontSize: "12px", letterSpacing: "2px"}}/>
                        <Line type="monotone" dataKey={driver1} stroke={DRIVER1_COLOR} dot={false} strokeWidth={2}
                              connectNulls={false}/>
                        <Line type="monotone" dataKey={driver2} stroke={DRIVER2_COLOR} dot={false} strokeWidth={2}
                              connectNulls={false}/>
                        {isSelecting && refAreaLeft && refAreaRight && (
                            <ReferenceArea x1={refAreaLeft} x2={refAreaRight} fill="rgba(255,255,255,0.05)"/>
                        )}
                    </LineChart>
                </ResponsiveContainer>
            </div>
            {!zoomDomain && (
                <div style={{
                    color: "#333",
                    fontSize: "11px",
                    letterSpacing: "1px",
                    marginTop: "8px",
                    textAlign: "right"
                }}>
                    DRAG TO ZOOM
                </div>
            )}
        </div>
    );
}

function SectorChart({sectors1, sectors2, driver1, driver2}) {
    if (!sectors1 || !sectors2) return null;
    const data = [
        {sector: "S1", [driver1]: sectors1.sector1, [driver2]: sectors2.sector1},
        {sector: "S2", [driver1]: sectors1.sector2, [driver2]: sectors2.sector2},
        {sector: "S3", [driver1]: sectors1.sector3, [driver2]: sectors2.sector3},
    ];

    return (
        <div style={chartStyles.root}>
            <div style={chartStyles.title}>AVG SECTOR TIMES</div>
            <ResponsiveContainer width="100%" height={240}>
                <BarChart data={data} margin={{top: 10, right: 20, left: 10, bottom: 10}}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e1e1e"/>
                    <XAxis dataKey="sector" stroke="#444" tick={{fill: "#555", fontSize: 12}}/>
                    <YAxis stroke="#444" tick={{fill: "#555", fontSize: 11}} tickFormatter={(v) => v?.toFixed(1) + "s"}
                           width={50}/>
                    <Tooltip
                        contentStyle={{backgroundColor: "#111", border: "1px solid #333", borderRadius: 0}}
                        formatter={(v) => formatTime(v)}
                        labelStyle={{color: "#888", fontSize: "11px"}}
                    />
                    <Legend wrapperStyle={{color: "#666", fontSize: "12px", letterSpacing: "2px"}}/>
                    <Bar dataKey={driver1} fill={DRIVER1_COLOR} radius={0}/>
                    <Bar dataKey={driver2} fill={DRIVER2_COLOR} radius={0}/>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}

function WeatherCard({weather}) {
    if (!weather) return null;
    return (
        <div style={statCardStyles.root}>
            <div style={statCardStyles.label}>WEATHER CONDITIONS</div>
            <div style={{display: "flex", gap: "24px", alignItems: "center"}}>
                <div style={{textAlign: "center"}}>
                    <div style={{color: "#555", fontSize: "10px", letterSpacing: "2px", marginBottom: "4px"}}>AIR TEMP
                    </div>
                    <div style={{color: F1_LIGHT, fontSize: "22px", fontWeight: "900"}}>{weather.avg_air_temp}°C</div>
                </div>
                <div style={{width: "1px", height: "40px", backgroundColor: "#222"}}/>
                <div style={{textAlign: "center"}}>
                    <div style={{color: "#555", fontSize: "10px", letterSpacing: "2px", marginBottom: "4px"}}>TRACK
                        TEMP
                    </div>
                    <div style={{color: F1_LIGHT, fontSize: "22px", fontWeight: "900"}}>{weather.avg_track_temp}°C</div>
                </div>
                <div style={{width: "1px", height: "40px", backgroundColor: "#222"}}/>
                <div style={{textAlign: "center"}}>
                    <div style={{color: "#555", fontSize: "10px", letterSpacing: "2px", marginBottom: "4px"}}>RAINFALL
                    </div>
                    <div style={{
                        fontSize: "18px", fontWeight: "900",
                        color: weather.rainfall ? "#4a9eff" : "#00c853"
                    }}>
                        {weather.rainfall ? "WET 🌧" : "DRY ☀️"}
                    </div>
                </div>
            </div>
        </div>
    );
}

function CircuitCard({circuit}) {
    if (!circuit) return null;
    const typeColor = {
        high_downforce: "#E8002D",
        low_downforce: "#4a9eff",
        balanced: "#FFD700",
    }[circuit.circuit_type] || "#888";
    const surfaceColor = circuit.surface_type === "street" ? "#FFD700" : "#888";
    return (
        <div style={statCardStyles.root}>
            <div style={statCardStyles.label}>CIRCUIT INFO</div>
            <div style={{marginBottom: "12px"}}>
                <div style={{
                    color: F1_LIGHT,
                    fontSize: "20px",
                    fontWeight: "900",
                    letterSpacing: "-0.5px"
                }}>{circuit.name}</div>
                <div style={{
                    color: "#555",
                    fontSize: "12px",
                    letterSpacing: "1px"
                }}>{circuit.city}, {circuit.country}</div>
            </div>
            <div style={{display: "flex", gap: "8px", flexWrap: "wrap"}}>
                <span style={{
                    backgroundColor: surfaceColor + "22",
                    color: surfaceColor,
                    border: `1px solid ${surfaceColor}44`,
                    fontSize: "10px",
                    fontWeight: "800",
                    letterSpacing: "2px",
                    padding: "4px 10px"
                }}>
                    {circuit.surface_type?.toUpperCase()}
                </span>
                <span style={{
                    backgroundColor: typeColor + "22",
                    color: typeColor,
                    border: `1px solid ${typeColor}44`,
                    fontSize: "10px",
                    fontWeight: "800",
                    letterSpacing: "2px",
                    padding: "4px 10px"
                }}>
                    {circuit.circuit_type?.replace("_", " ").toUpperCase()}
                </span>
            </div>
        </div>
    );
}

function EngineCard({engine1, engine2, driver1, driver2}) {
    if (!engine1 && !engine2) return null;
    const sameEngine = engine1?.engine === engine2?.engine;
    return (
        <div style={statCardStyles.root}>
            <div style={statCardStyles.label}>POWER UNIT</div>
            <div style={{display: "flex", gap: "16px", alignItems: "center"}}>
                <div style={{flex: 1, textAlign: "center"}}>
                    <div style={{
                        color: "#555",
                        fontSize: "11px",
                        fontWeight: "700",
                        letterSpacing: "2px",
                        marginBottom: "4px"
                    }}>{driver1}</div>
                    <div style={{
                        color: DRIVER1_COLOR,
                        fontSize: "16px",
                        fontWeight: "900"
                    }}>{engine1?.engine || "—"}</div>
                    <div style={{color: "#444", fontSize: "11px", marginTop: "2px"}}>{engine1?.team}</div>
                </div>
                <div style={{width: "1px", height: "50px", backgroundColor: "#222"}}/>
                <div style={{flex: 1, textAlign: "center"}}>
                    <div style={{
                        color: "#555",
                        fontSize: "11px",
                        fontWeight: "700",
                        letterSpacing: "2px",
                        marginBottom: "4px"
                    }}>{driver2}</div>
                    <div style={{
                        color: DRIVER2_COLOR,
                        fontSize: "16px",
                        fontWeight: "900"
                    }}>{engine2?.engine || "—"}</div>
                    <div style={{color: "#444", fontSize: "11px", marginTop: "2px"}}>{engine2?.team}</div>
                </div>
            </div>
            <div style={{marginTop: "12px", textAlign: "center"}}>
                <span style={{
                    fontSize: "10px", fontWeight: "800", letterSpacing: "2px", padding: "4px 12px",
                    backgroundColor: sameEngine ? "#00c85322" : "#E8002D22",
                    color: sameEngine ? "#00c853" : "#E8002D",
                    border: `1px solid ${sameEngine ? "#00c85344" : "#E8002D44"}`,
                }}>
                    {sameEngine ? "SAME ENGINE" : "DIFFERENT ENGINES"}
                </span>
            </div>
        </div>
    );
}

function WeatherDetailChart({data}) {
    if (!data?.length) return null;

    const [metric, setMetric] = useState("track_temp");

    const metrics = [
        {key: "track_temp", label: "TRACK TEMP", unit: "°C", color: "#E8002D"},
        {key: "air_temp", label: "AIR TEMP", unit: "°C", color: "#4a9eff"},
        {key: "humidity", label: "HUMIDITY", unit: "%", color: "#FFD700"},
        {key: "wind_speed", label: "WIND SPEED", unit: "m/s", color: "#00c853"},
    ];

    const current = metrics.find(m => m.key === metric);

    const CustomTooltip = ({active, payload, label}) => {
        if (!active || !payload?.length) return null;
        return (
            <div style={tooltipStyles.root}>
                <div style={tooltipStyles.label}>SNAPSHOT {label}</div>
                <div style={{color: current.color, fontSize: "13px"}}>
                    {current.label}: {payload[0]?.value?.toFixed(1)}{current.unit}
                </div>
                {payload[0]?.payload?.rainfall && (
                    <div style={{color: "#4a9eff", fontSize: "11px", marginTop: "4px"}}>🌧 RAINFALL</div>
                )}
            </div>
        );
    };

    return (
        <div style={chartStyles.root}>
            <div style={{display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px"}}>
                <div style={chartStyles.title}>WEATHER PROGRESSION</div>
                <div style={{display: "flex", gap: "6px"}}>
                    {metrics.map(m => (
                        <button key={m.key} onClick={() => setMetric(m.key)} style={{
                            backgroundColor: metric === m.key ? m.color + "22" : "transparent",
                            border: `1px solid ${metric === m.key ? m.color : "#2a2a2a"}`,
                            color: metric === m.key ? m.color : "#555",
                            fontSize: "10px", fontWeight: "700", letterSpacing: "1px",
                            padding: "5px 12px", cursor: "pointer", fontFamily: "inherit",
                        }}>
                            {m.label}
                        </button>
                    ))}
                </div>
            </div>
            <ResponsiveContainer width="100%" height={200}>
                <LineChart data={data} margin={{top: 10, right: 20, left: 10, bottom: 10}}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e1e1e"/>
                    <XAxis dataKey="index" stroke="#444" tick={{fill: "#555", fontSize: 11}}/>
                    <YAxis stroke="#444" tick={{fill: "#555", fontSize: 11}}
                           tickFormatter={v => v.toFixed(1) + current.unit} width={60}/>
                    <Tooltip content={<CustomTooltip/>}/>
                    <Line type="monotone" dataKey={metric} stroke={current.color}
                          dot={false} strokeWidth={2} connectNulls/>
                </LineChart>
            </ResponsiveContainer>
            <div style={{marginTop: "12px", display: "flex", gap: "16px", flexWrap: "wrap"}}>
                {[
                    {label: "MIN", value: Math.min(...data.map(d => d[metric]).filter(Boolean))},
                    {label: "MAX", value: Math.max(...data.map(d => d[metric]).filter(Boolean))},
                    {label: "AVG", value: data.reduce((s, d) => s + (d[metric] || 0), 0) / data.length},
                    {label: "RAIN", value: data.some(d => d.rainfall) ? "YES" : "NO"},
                ].map(({label, value}) => (
                    <div key={label} style={{textAlign: "center"}}>
                        <div style={{color: "#444", fontSize: "10px", letterSpacing: "2px"}}>{label}</div>
                        <div style={{color: F1_LIGHT, fontSize: "16px", fontWeight: "900"}}>
                            {typeof value === "number" ? value.toFixed(1) + current.unit : value}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default function Comparison({token, onNavigate, onLogout, userRole, defaults = {}}) {
    const [form, setForm] = useState({
        driver1: defaults.driver1 || "", driver2: "", circuit_id: "",
        season: "2023", session_type: "Race",
        lap_from: "", lap_to: "", compound: "",
    });
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [mode, setMode] = useState("summary");
    const [availableCircuits, setAvailableCircuits] = useState([])
    const [availableTypes, setAvailableTypes] = useState([])
    const [allCircuits, setAllCircuits] = useState([])
    const [weatherData, setWeatherData] = useState(null)
    const [teamMode, setTeamMode] = useState(false)
    const [teams, setTeams] = useState([])
    const [selectedTeam, setSelectedTeam] = useState(null)

    useEffect(() => {
        if (defaults && Object.keys(defaults).length > 0) {
            setForm(f => ({
                ...f,
                driver1: defaults.driver1 || f.driver1,
                circuit_id: defaults.circuit_id || f.circuit_id,
                season: defaults.season || f.season,
                session_type: defaults.session_type || f.session_type,
            }))
        }
    }, [defaults, availableCircuits])

    useEffect(() => {
        console.log("defaults:", defaults)
        console.log("availableCircuits:", availableCircuits)
        console.log("includes?", availableCircuits.includes(defaults?.circuit_id))
    }, [defaults, availableCircuits])

    useEffect(() => {
        if (!form.season) return
        getAvailableSessions(token, form.season).then(data => {
            const circuits = [...new Set(data.map(s => s.circuit))].sort()
            setAvailableCircuits(circuits)
            setForm(f => ({
                ...f,
                circuit_id: circuits.includes(f.circuit_id) ? f.circuit_id : '',
                session_type: ''
            }))
        })
    }, [form.season])

    useEffect(() => {
        if (!form.season) return
        getTeammates(token, form.season, form.circuit_id || null).then(setTeams)
    }, [form.season, form.circuit_id])

    useEffect(() => {
        if (!form.circuit_id) return
        getAvailableSessions(token, form.season, form.circuit_id).then(data => {
            const types = [...new Set(data.map(s => s.session_type))]
            setAvailableTypes(types)
            setForm(f => ({...f, session_type: types[0] || ''}))
        })
    }, [form.circuit_id])

    useEffect(() => {
        setResult(null)
        setWeatherData(null)
    }, [mode])


    const handleChange = (e) => {
        setForm({...form, [e.target.name]: e.target.value});
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setResult(null);
        setLoading(true);
        try {
            const params = {
                driver1: form.driver1.toUpperCase(),
                driver2: form.driver2.toUpperCase(),
                circuit_id: form.circuit_id,
                season: parseInt(form.season),
                session_type: form.session_type,
            };
            if (mode === "detailed") {
                if (form.lap_from) params.lap_from = parseInt(form.lap_from);
                if (form.lap_to) params.lap_to = parseInt(form.lap_to);
                if (form.compound) params.compound = form.compound;
            }
            const data = mode === "summary"
                ? await compareDrivers(token, params)
                : await detailCompareDrivers(token, params);
            if (data.detail) throw new Error(data.detail);
            setResult(data);
            if (mode === 'detailed' && data.session) {
                const sessionId = typeof data.session === 'object' ? data.session.id : data.session
                const weather = await getSessionWeather(token, sessionId)
                setWeatherData(weather)
            } else {
                setWeatherData(null)
            }
        } catch (err) {
            setError(err.message || "Comparison failed");
        } finally {
            setLoading(false);
        }
    };

    const d1 = result?.driver1;
    const d2 = result?.driver2;

    return (
        <div style={pageStyles.root}>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;600;700;900&display=swap');
        * { font-family: 'Rajdhani', sans-serif; }
        select option { background: #1a1a1a; }
        input::placeholder { color: #333; }
      `}</style>
            <Navbar onNavigate={onNavigate} currentPage="comparison" onLogout={onLogout} userRole={userRole}/>

            <div style={pageStyles.inner}>
                {/* Header */}
                <div style={pageStyles.header}>
                    <div style={pageStyles.headerTag}>ANALYSIS</div>
                    <h1 style={pageStyles.headerTitle}>Driver Comparison</h1>
                    <p style={pageStyles.headerSub}>Compare lap times, sectors and tyre performance</p>
                </div>

                {/* Form */}
                <div style={formStyles.root}>
                    {/* Mode toggle */}
                    <div style={formStyles.modeRow}>
                        {["summary", "detailed"].map((m) => (
                            <button key={m} onClick={() => setMode(m)} style={{
                                ...formStyles.modeBtn,
                                ...(mode === m ? formStyles.modeBtnActive : {})
                            }}>
                                {m.toUpperCase()}
                            </button>
                        ))}
                    </div>

                    <div style={{display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px"}}>
                        <button
                            type="button"
                            onClick={() => {
                                setTeamMode(!teamMode);
                                setSelectedTeam(null)
                            }}
                            style={{
                                backgroundColor: teamMode ? "#FFD70022" : "transparent",
                                border: `1px solid ${teamMode ? "#FFD700" : "#2a2a2a"}`,
                                color: teamMode ? "#FFD700" : "#555",
                                fontSize: "11px", fontWeight: "700", letterSpacing: "2px",
                                padding: "6px 14px", cursor: "pointer", fontFamily: "inherit",
                            }}
                        >
                            TEAM MODE
                        </button>
                        {teamMode && teams.length > 0 && (
                            <select
                                value={selectedTeam || ""}
                                onChange={(e) => {
                                    const team = teams.find(t => t.team_id === e.target.value)
                                    setSelectedTeam(e.target.value)
                                    if (team?.drivers?.length >= 2) {
                                        setForm(f => ({
                                            ...f,
                                            driver1: team.drivers[0].abbreviation,
                                            driver2: team.drivers[1].abbreviation,
                                        }))
                                    }
                                }}
                                style={formStyles.select}
                            >
                                <option value="">Select team...</option>
                                {teams.map(t => (
                                    <option key={t.team_id} value={t.team_id}>
                                        {t.team_name}
                                    </option>
                                ))}
                            </select>
                        )}
                    </div>

                    <form onSubmit={handleSubmit} style={formStyles.grid}>
                        <Field label="DRIVER 1" name="driver1" value={form.driver1} onChange={handleChange}
                               placeholder="e.g. HAM"/>
                        <Field label="DRIVER 2" name="driver2" value={form.driver2} onChange={handleChange}
                               placeholder="e.g. RUS"/>

                        <div style={formStyles.field}>
                            <label style={formStyles.label}>CIRCUIT</label>
                            <select name="circuit_id" value={form.circuit_id} onChange={handleChange}
                                    style={formStyles.select} required>
                                <option value="">Select circuit...</option>
                                {(form.season && availableCircuits.length > 0 ? availableCircuits : allCircuits).map(c => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </select>
                        </div>

                        <div style={formStyles.field}>
                            <label style={formStyles.label}>SEASON</label>
                            <select name="season" value={form.season} onChange={handleChange} style={formStyles.select}>
                                {[2021, 2022, 2023, 2024].map((y) => (
                                    <option key={y} value={y}>{y}</option>
                                ))}
                            </select>
                        </div>

                        <div style={formStyles.field}>
                            <label style={formStyles.label}>SESSION TYPE</label>
                            <select name="session_type" value={form.session_type} onChange={handleChange}
                                    style={formStyles.select}>
                                {availableTypes.map(t => (
                                    <option key={t} value={t}>{t}</option>
                                ))}
                            </select>
                        </div>

                        {mode === "detailed" && <>
                            <Field label="LAP FROM" name="lap_from" value={form.lap_from} onChange={handleChange}
                                   placeholder="e.g. 10" type="number"/>
                            <Field label="LAP TO" name="lap_to" value={form.lap_to} onChange={handleChange}
                                   placeholder="e.g. 40" type="number"/>
                            <div style={formStyles.field}>
                                <label style={formStyles.label}>COMPOUND</label>
                                <select name="compound" value={form.compound} onChange={handleChange}
                                        style={formStyles.select}>
                                    <option value="">All compounds</option>
                                    {COMPOUNDS.map((c) => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                        </>}

                        <div style={formStyles.submitRow}>
                            <button type="submit" style={formStyles.submit} disabled={loading}>
                                {loading ? "ANALYSING..." : "RUN COMPARISON →"}
                            </button>
                        </div>
                    </form>
                </div>

                {error && <div style={pageStyles.error}>{error}</div>}

                {/* Results */}
                {result && d1 && d2 && (
                    <div style={resultsStyles.root}>
                        {/* Driver header */}
                        <div style={resultsStyles.driverHeader}>
                            <div style={{...resultsStyles.driverBadge, borderColor: DRIVER1_COLOR}}>
                                <span style={{
                                    color: DRIVER1_COLOR,
                                    fontSize: "32px",
                                    fontWeight: "900"
                                }}>{d1.driver}</span>
                            </div>
                            <div style={resultsStyles.vs}>VS</div>
                            <div style={{...resultsStyles.driverBadge, borderColor: DRIVER2_COLOR}}>
                                <span style={{
                                    color: DRIVER2_COLOR,
                                    fontSize: "32px",
                                    fontWeight: "900"
                                }}>{d2.driver}</span>
                            </div>
                        </div>

                        {/* Stat cards */}
                        <div style={resultsStyles.statsGrid}>
                            <StatCard label="AVG LAP TIME" val1={d1.avg_lap_time} val2={d2.avg_lap_time}
                                      driver1={d1.driver} driver2={d2.driver} isTime/>
                            <StatCard label="FASTEST LAP" val1={d1.fastest_lap} val2={d2.fastest_lap}
                                      driver1={d1.driver} driver2={d2.driver} isTime/>
                            <StatCard label="AVG SECTOR 1" val1={d1.avg_sectors?.sector1} val2={d2.avg_sectors?.sector1}
                                      driver1={d1.driver} driver2={d2.driver} isTime/>
                            <StatCard label="AVG SECTOR 2" val1={d1.avg_sectors?.sector2} val2={d2.avg_sectors?.sector2}
                                      driver1={d1.driver} driver2={d2.driver} isTime/>
                            <StatCard label="AVG SECTOR 3" val1={d1.avg_sectors?.sector3} val2={d2.avg_sectors?.sector3}
                                      driver1={d1.driver} driver2={d2.driver} isTime/>
                        </div>

                        <div style={resultsStyles.contextGrid}>
                            <WeatherCard weather={result.weather}/>
                            <CircuitCard circuit={result.circuit}/>
                            <EngineCard engine1={result.engine1} engine2={result.engine2} driver1={d1.driver}
                                        driver2={d2.driver}/>
                        </div>

                        {/* Compound table */}
                        <div style={resultsStyles.section}>
                            <div style={resultsStyles.sectionTitle}>AVG TIME PER COMPOUND</div>
                            <CompoundTable data1={d1.avg_time_per_compound} data2={d2.avg_time_per_compound}
                                           driver1={d1.driver} driver2={d2.driver}/>
                        </div>

                        {/* Charts */}
                        <div style={resultsStyles.chartsGrid}>
                            <SectorChart sectors1={d1.avg_sectors} sectors2={d2.avg_sectors} driver1={d1.driver}
                                         driver2={d2.driver}/>
                            {(d1.laps || d2.laps) && (
                                <LapChart laps1={d1.laps} laps2={d2.laps} driver1={d1.driver} driver2={d2.driver}/>
                            )}
                        </div>
                        {mode === 'detailed' && weatherData && <WeatherDetailChart data={weatherData}/>}
                    </div>
                )}
            </div>
        </div>
    );
}

function Field({label, name, value, onChange, placeholder, type = "text"}) {
    return (
        <div style={formStyles.field}>
            <label style={formStyles.label}>{label}</label>
            <input
                type={type}
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                style={formStyles.input}
            />
        </div>
    );
}

/* ── Styles ── */
const pageStyles = {
    root: {backgroundColor: F1_DARK, minHeight: "100vh", color: F1_LIGHT},
    inner: {maxWidth: "1400px", margin: "0 auto", padding: "48px 40px"},
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
    error: {
        backgroundColor: "rgba(232,0,45,0.08)",
        border: "1px solid rgba(232,0,45,0.2)",
        color: "#ff4466",
        padding: "16px 20px",
        fontSize: "14px",
        marginBottom: "24px"
    },
};

const formStyles = {
    root: {
        backgroundColor: F1_GRAY2,
        border: "1px solid #222",
        borderTop: `3px solid ${F1_RED}`,
        padding: "32px",
        marginBottom: "32px"
    },
    modeRow: {display: "flex", gap: "8px", marginBottom: "24px"},
    modeBtn: {
        backgroundColor: "transparent",
        border: "1px solid #2a2a2a",
        color: "#555",
        fontSize: "12px",
        fontWeight: "700",
        letterSpacing: "2px",
        padding: "8px 20px",
        cursor: "pointer",
        fontFamily: "inherit",
        transition: "all 0.2s"
    },
    modeBtnActive: {backgroundColor: F1_RED, border: `1px solid ${F1_RED}`, color: "#fff"},
    grid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
        gap: "20px",
        alignItems: "end"
    },
    field: {display: "flex", flexDirection: "column", gap: "8px"},
    label: {color: "#555", fontSize: "11px", fontWeight: "700", letterSpacing: "2px"},
    input: {
        backgroundColor: "#111",
        border: "1px solid #2a2a2a",
        borderBottom: "2px solid #333",
        color: F1_LIGHT,
        fontSize: "16px",
        padding: "10px 14px",
        outline: "none",
        fontFamily: "inherit"
    },
    select: {
        backgroundColor: "#111",
        border: "1px solid #2a2a2a",
        borderBottom: "2px solid #333",
        color: F1_LIGHT,
        fontSize: "14px",
        padding: "10px 14px",
        outline: "none",
        fontFamily: "inherit",
        cursor: "pointer"
    },
    submitRow: {display: "flex", alignItems: "flex-end"},
    submit: {
        backgroundColor: F1_RED,
        color: "#fff",
        border: "none",
        padding: "12px 28px",
        fontSize: "13px",
        fontWeight: "800",
        letterSpacing: "2px",
        cursor: "pointer",
        fontFamily: "inherit",
        clipPath: "polygon(0 0, calc(100% - 8px) 0, 100% 100%, 0 100%)",
        width: "100%"
    },
};

const resultsStyles = {
    root: {animation: "fadeUp 0.4s ease both"},
    driverHeader: {display: "flex", alignItems: "center", gap: "24px", marginBottom: "32px"},
    driverBadge: {
        flex: 1,
        backgroundColor: F1_GRAY2,
        border: "1px solid #222",
        borderTop: "3px solid",
        padding: "24px",
        textAlign: "center"
    },
    vs: {color: "#333", fontSize: "20px", fontWeight: "900", letterSpacing: "4px"},
    statsGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
        gap: "12px",
        marginBottom: "32px"
    },
    section: {marginBottom: "32px"},
    sectionTitle: {color: "#444", fontSize: "11px", fontWeight: "700", letterSpacing: "3px", marginBottom: "12px"},
    chartsGrid: {display: "grid", gridTemplateColumns: "1fr 2fr", gap: "16px"},
    contextGrid: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr 1fr",
        gap: "12px",
        marginBottom: "32px",
    },
};

const statCardStyles = {
    root: {backgroundColor: F1_GRAY2, border: "1px solid #222", padding: "20px"},
    label: {color: "#444", fontSize: "10px", fontWeight: "700", letterSpacing: "3px", marginBottom: "14px"},
    row: {display: "flex", gap: "16px", alignItems: "center"},
    col: {flex: 1, textAlign: "center"},
    abbr: {color: "#555", fontSize: "11px", fontWeight: "700", letterSpacing: "2px", marginBottom: "4px"},
    val: {fontSize: "18px", fontWeight: "900", letterSpacing: "-0.5px"},
    tag: {
        fontSize: "9px",
        fontWeight: "800",
        letterSpacing: "2px",
        padding: "2px 6px",
        marginTop: "4px",
        display: "inline-block"
    },
    divider: {width: "1px", height: "40px", backgroundColor: "#222"},
};

const tableStyles = {
    root: {backgroundColor: F1_GRAY2, border: "1px solid #222"},
    header: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr 1fr 1fr",
        padding: "10px 20px",
        borderBottom: "1px solid #222",
        backgroundColor: "#111"
    },
    th: {color: "#444", fontSize: "10px", fontWeight: "700", letterSpacing: "2px"},
    row: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr 1fr 1fr",
        padding: "12px 20px",
        borderBottom: "1px solid #1a1a1a"
    },
    td: {color: "#888", fontSize: "14px", fontWeight: "600"},
};

const chartStyles = {
    root: {backgroundColor: F1_GRAY2, border: "1px solid #222", padding: "24px"},
    title: {color: "#444", fontSize: "10px", fontWeight: "700", letterSpacing: "3px", marginBottom: "20px"},
};

const tooltipStyles = {
    root: {backgroundColor: "#111", border: "1px solid #333", padding: "12px 16px"},
    label: {color: "#555", fontSize: "10px", letterSpacing: "2px", marginBottom: "8px"},
};