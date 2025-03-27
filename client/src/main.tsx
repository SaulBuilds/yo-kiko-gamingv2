import { createRoot } from "react-dom/client";
import App from "./App";
// Temporarily commenting out CSS import to get server running
// import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);