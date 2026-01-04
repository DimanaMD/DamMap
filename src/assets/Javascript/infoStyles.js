export const THEME = {
  primary: "hsla(213, 40%, 22%, 1.00)",
  primaryLight: "hsla(213, 40%, 35%, 1.00)",
  danger: "#dc1d1d",
  success: "#4caf50",
  warning: "#ff9800",
  info: "#00bcd4",
  gray: "#f4f4f4",
  textGray: "#666",
  white: "#ffffff",
  shadow: "0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)"
};
export const styles = {
  fixedHeader: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    zIndex: 1000,
    boxShadow: "0 2px 10px rgba(0,0,0,0.1)"
  },
  mainContent: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "2rem",
    paddingTop: "100px" 
  },
  controlPanel: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "1rem",
    marginBottom: "2rem"
  },
  buttonGroup: {
    display: "flex",
    backgroundColor: "#eee",
    padding: "4px",
    borderRadius: "8px",
    gap: "4px"
  },
  tabBtn: {
    padding: "8px 20px",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "bold",
    transition: "all 0.2s"
  },
  filterBtn: {
    padding: "8px 16px",
    backgroundColor: "transparent",
    border: "1px solid",
    borderRadius: "20px",
    cursor: "pointer",
    fontSize: "0.85rem"
  },
  chartWrapper: {
    backgroundColor: THEME.white,
    padding: "2rem",
    borderRadius: "16px",
    boxShadow: THEME.shadow,
    marginBottom: "2rem"
  },
  backBtn: {
    display: "inline-block",
    padding: "12px 24px",
    backgroundColor: THEME.primary,
    color: THEME.white,
    borderRadius: "8px",
    textDecoration: "none",
    fontWeight: "600",
    transition: "transform 0.2s"
  }
};

export const panelStyle = {
  position: "absolute",
  background: "#ffffff",
  padding: "12px 14px",
  borderRadius: "8px",
  boxShadow: "0 6px 18px rgba(0,0,0,0.15)",
  zIndex: 1000,
  fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif"
};
