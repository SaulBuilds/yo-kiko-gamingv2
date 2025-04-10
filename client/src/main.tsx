import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import "./styles/nfid-styles.css"; // Import NFID styles

createRoot(document.getElementById("root")!).render(<App />);
