import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { GoogleOAuthProvider } from "@react-oauth/google";
import "./index.css";
import { ThemeProvider } from "./components/theme-provider";
import { initKeyboardAccessibility } from "./utils/keyboardAccessibility";

// Enable global Enter/Space keyboard accessibility for role="button" elements
// and orphan inputs (inputs outside <form> elements) across the entire app.
initKeyboardAccessibility();

createRoot(document.getElementById("root")!).render(
	<GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || "YOUR_GOOGLE_CLIENT_ID"}>
	<ThemeProvider>
		<App />
	</ThemeProvider>
	</GoogleOAuthProvider>,
);

