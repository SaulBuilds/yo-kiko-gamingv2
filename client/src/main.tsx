import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import "@nfid/identitykit/react/styles.css"; // Import NFID official styles directly
import "./styles/global-nfid-fixes.css"; // Import our NFID fixes

createRoot(document.getElementById("root")!).render(<App />);
