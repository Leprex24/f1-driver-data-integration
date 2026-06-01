import { useState } from "react";
import { login } from "../services/api";

const F1_RED = "#E8002D";
const F1_DARK = "#0a0a0a";
const F1_GRAY = "#1a1a1a";
const F1_LIGHT = "#f5f5f5";

export default function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await login(username, password);
      if (data.access_token) {
        localStorage.setItem("token", data.access_token);
        onLogin(data.access_token);
      } else {
        setError("Invalid username or password");
      }
    } catch {
      setError("Connection error. Is the server running?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.root}>
      {/* Background grid */}
      <div style={styles.gridOverlay} />

      {/* Left panel – branding */}
      <div style={styles.leftPanel}>
        <div style={styles.brandingInner}>
          <div style={styles.f1Badge}>F1</div>
          <h1 style={styles.brandTitle}>Analytics<br />Platform</h1>
          <p style={styles.brandSub}>
            Compare drivers. Dissect lap times.<br />
            Uncover the data behind the race.
          </p>
          <div style={styles.statRow}>
            {["4 Seasons", "6 Circuits", "40+ Drivers"].map((s) => (
              <div key={s} style={styles.stat}>{s}</div>
            ))}
          </div>
        </div>
        <div style={styles.redStripe} />
      </div>

      {/* Right panel – form */}
      <div style={styles.rightPanel}>
        <div style={styles.formCard}>
          <div style={styles.formHeader}>
            <span style={styles.formTag}>SIGN IN</span>
            <h2 style={styles.formTitle}>Welcome back</h2>
            <p style={styles.formSub}>Enter your credentials to access the platform</p>
          </div>

          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>USERNAME</label>
              <input
                style={styles.input}
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. admin"
                required
                autoFocus
              />
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>PASSWORD</label>
              <input
                style={styles.input}
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            {error && <div style={styles.error}>{error}</div>}

            <button
              type="submit"
              style={{ ...styles.button, opacity: loading ? 0.7 : 1 }}
              disabled={loading}
            >
              {loading ? "SIGNING IN..." : "SIGN IN →"}
            </button>
          </form>

          <div style={styles.formFooter}>
            <span style={styles.footerDot} />
            <span style={styles.footerDot} />
            <span style={styles.footerDot} />
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  root: {
    display: "flex",
    minHeight: "100vh",
    backgroundColor: F1_DARK,
    fontFamily: "'Rajdhani', 'Barlow Condensed', sans-serif",
    overflow: "hidden",
    position: "relative",
  },
  gridOverlay: {
    position: "absolute",
    inset: 0,
    backgroundImage:
      "linear-gradient(rgba(232,0,45,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(232,0,45,0.04) 1px, transparent 1px)",
    backgroundSize: "40px 40px",
    pointerEvents: "none",
    zIndex: 0,
  },
  leftPanel: {
    flex: "1 1 55%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "60px",
    position: "relative",
    zIndex: 1,
  },
  redStripe: {
    position: "absolute",
    right: 0,
    top: "10%",
    height: "80%",
    width: "3px",
    backgroundColor: F1_RED,
    borderRadius: "2px",
  },
  brandingInner: {
    maxWidth: "480px",
  },
  f1Badge: {
    display: "inline-block",
    backgroundColor: F1_RED,
    color: "#fff",
    fontWeight: "900",
    fontSize: "14px",
    letterSpacing: "4px",
    padding: "6px 14px",
    marginBottom: "32px",
    clipPath: "polygon(0 0, calc(100% - 10px) 0, 100% 100%, 0 100%)",
  },
  brandTitle: {
    color: F1_LIGHT,
    fontSize: "clamp(48px, 6vw, 80px)",
    fontWeight: "900",
    lineHeight: "0.95",
    letterSpacing: "-2px",
    textTransform: "uppercase",
    margin: "0 0 24px 0",
  },
  brandSub: {
    color: "#777",
    fontSize: "16px",
    lineHeight: "1.6",
    marginBottom: "40px",
    letterSpacing: "0.3px",
  },
  statRow: {
    display: "flex",
    gap: "24px",
    flexWrap: "wrap",
  },
  stat: {
    color: F1_RED,
    fontSize: "13px",
    fontWeight: "700",
    letterSpacing: "2px",
    textTransform: "uppercase",
    borderLeft: `2px solid ${F1_RED}`,
    paddingLeft: "10px",
  },
  rightPanel: {
    flex: "1 1 45%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "40px",
    zIndex: 1,
  },
  formCard: {
    backgroundColor: F1_GRAY,
    border: "1px solid #2a2a2a",
    borderTop: `3px solid ${F1_RED}`,
    padding: "48px",
    width: "100%",
    maxWidth: "400px",
    position: "relative",
  },
  formHeader: {
    marginBottom: "36px",
  },
  formTag: {
    color: F1_RED,
    fontSize: "11px",
    fontWeight: "700",
    letterSpacing: "4px",
    display: "block",
    marginBottom: "12px",
  },
  formTitle: {
    color: F1_LIGHT,
    fontSize: "28px",
    fontWeight: "800",
    margin: "0 0 8px 0",
    letterSpacing: "-0.5px",
  },
  formSub: {
    color: "#666",
    fontSize: "14px",
    margin: 0,
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  fieldGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  label: {
    color: "#555",
    fontSize: "11px",
    fontWeight: "700",
    letterSpacing: "2px",
  },
  input: {
    backgroundColor: "#111",
    border: "1px solid #333",
    borderBottom: `2px solid #444`,
    color: F1_LIGHT,
    fontSize: "16px",
    padding: "12px 16px",
    outline: "none",
    fontFamily: "inherit",
    transition: "border-color 0.2s",
  },
  error: {
    backgroundColor: "rgba(232,0,45,0.1)",
    border: "1px solid rgba(232,0,45,0.3)",
    color: "#ff4466",
    fontSize: "13px",
    padding: "10px 14px",
    letterSpacing: "0.3px",
  },
  button: {
    backgroundColor: F1_RED,
    color: "#fff",
    border: "none",
    padding: "14px 24px",
    fontSize: "14px",
    fontWeight: "800",
    letterSpacing: "3px",
    cursor: "pointer",
    fontFamily: "inherit",
    textTransform: "uppercase",
    transition: "background-color 0.2s, transform 0.1s",
    marginTop: "8px",
    clipPath: "polygon(0 0, calc(100% - 8px) 0, 100% 100%, 0 100%)",
  },
  formFooter: {
    display: "flex",
    gap: "6px",
    marginTop: "32px",
    justifyContent: "center",
  },
  footerDot: {
    width: "6px",
    height: "6px",
    backgroundColor: "#333",
    borderRadius: "50%",
    display: "inline-block",
  },
};