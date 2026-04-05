import { THEME } from "./infoStyles";

export const routeStyles = {
  pageWrapper: {
    minHeight: "100vh",
    backgroundColor: "#f0f2f5",
    padding: "80px 20px 40px",
  },
  contentCard: {
    maxWidth: "1200px",
    margin: "0 auto",
    backgroundColor: THEME.white,
    padding: "2rem",
    borderRadius: "15px",
    boxShadow: THEME.shadow,
    position: "relative"
  },
  title: {
    color: THEME.primary,
    marginBottom: "1.5rem",
    fontSize: "1.8rem",
    fontWeight: "700",
  },
  searchForm: {
    display: "flex",
    gap: "12px",
    marginBottom: "2rem",
    flexWrap: "wrap",
  },
  inputField: {
    flex: 1,
    minWidth: "280px",
    padding: "14px 18px",
    borderRadius: "10px",
    border: "2px solid #edf2f7",
    fontSize: "1rem",
    outline: "none",
  },
  searchButton: {
    padding: "12px 30px",
    backgroundColor: THEME.primary,
    color: THEME.white,
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: "600",
  },
  mapWrapper: {
    height: "600px",
    borderRadius: "14px",
    overflow: "hidden",
    border: "1px solid #e2e8f0",
  },
  resultPanel: {
    marginTop: "1.5rem",
    padding: "1.2rem",
    backgroundColor: "#eef2ff",
    borderRadius: "10px",
    borderLeft: `5px solid ${THEME.primaryLight}`,
  },
  disclaimer: {
    display: "block",
    marginTop: "8px",
    color: "#718096",
    fontSize: "0.85rem",
    fontStyle: "italic",
  }
};