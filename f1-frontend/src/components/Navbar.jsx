const F1_RED = "#E8002D";
const F1_LIGHT = "#f5f5f5";

export default function Navbar({ onNavigate, currentPage, onLogout, userRole }) {
  const tabs = [
    { id: "dashboard", label: "DASHBOARD" },
    { id: "comparison", label: "COMPARE" },
    { id: "drivers", label: "DRIVERS" },
    { id: "export", label: "EXPORT" },
      ...(userRole === 'admin' ? [{ id: "admin", label: "ADMIN"}] : []),
  ];

  return (
    <nav style={navStyles.root}>
      <div style={navStyles.inner}>
        <div style={navStyles.logo}>
          <span style={navStyles.logoBadge}>F1</span>
          <span style={navStyles.logoText}>ANALYTICS</span>
        </div>
        <div style={navStyles.tabs}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onNavigate(tab.id)}
              style={{
                ...navStyles.tab,
                ...(currentPage === tab.id ? navStyles.tabActive : {}),
              }}
            >
              {tab.label}
              {currentPage === tab.id && <div style={navStyles.tabIndicator} />}
            </button>
          ))}
        </div>
        <button onClick={onLogout} style={navStyles.logout}>
          SIGN OUT
        </button>
      </div>
    </nav>
  );
}

const navStyles = {
  root: {
    backgroundColor: "#0d0d0d",
    borderBottom: "1px solid #222",
    position: "sticky",
    top: 0,
    zIndex: 100,
  },
  inner: {
    maxWidth: "1400px",
    margin: "0 auto",
    padding: "0 40px",
    height: "60px",
    display: "flex",
    alignItems: "center",
    gap: "40px",
  },
  logo: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginRight: "20px",
  },
  logoBadge: {
    backgroundColor: F1_RED,
    color: "#fff",
    fontWeight: "900",
    fontSize: "12px",
    letterSpacing: "3px",
    padding: "4px 10px",
    clipPath: "polygon(0 0, calc(100% - 8px) 0, 100% 100%, 0 100%)",
  },
  logoText: {
    color: F1_LIGHT,
    fontWeight: "900",
    fontSize: "15px",
    letterSpacing: "4px",
  },
  tabs: { display: "flex", gap: "4px", flex: 1 },
  tab: {
    backgroundColor: "transparent",
    border: "none",
    color: "#555",
    fontSize: "12px",
    fontWeight: "700",
    letterSpacing: "2px",
    padding: "8px 16px",
    cursor: "pointer",
    position: "relative",
    transition: "color 0.2s",
    fontFamily: "inherit",
  },
  tabActive: { color: F1_LIGHT },
  tabIndicator: {
    position: "absolute",
    bottom: "-1px",
    left: "16px",
    right: "16px",
    height: "2px",
    backgroundColor: F1_RED,
  },
  logout: {
    backgroundColor: "transparent",
    border: "1px solid #333",
    color: "#555",
    fontSize: "11px",
    fontWeight: "700",
    letterSpacing: "2px",
    padding: "6px 14px",
    cursor: "pointer",
    fontFamily: "inherit",
  },
};