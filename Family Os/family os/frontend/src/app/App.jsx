import React, { useState } from "react";
import AppRoutes from "../routes/AppRoutes";
import { useAuth } from "../contexts/AuthContext";
import { isDemoMode } from "../utils/mode";

const REQUIRED_ENV = [
  "VITE_FIREBASE_API_KEY",
  "VITE_FIREBASE_AUTH_DOMAIN",
  "VITE_FIREBASE_PROJECT_ID",
  "VITE_FIREBASE_STORAGE_BUCKET",
  "VITE_FIREBASE_MESSAGING_SENDER_ID",
  "VITE_FIREBASE_APP_ID",
];

class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error) {
    console.error("[App] Uncaught error:", error);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback(this.state.error);
    }
    return this.props.children;
  }
}

const App = () => {
  const { loading, authError, user, role, familyId } = useAuth();
  const demoMode = isDemoMode();
  const [caughtError, setCaughtError] = useState(null);

  if (loading) {
    return (
      <div className="app-loading">
        <div className="spinner" />
        <p>Loading your family dashboard...</p>
      </div>
    );
  }

  if (authError) {
    const message =
      authError === "firebase_init"
        ? "Firebase is not configured correctly. Please check your .env file."
        : authError === "missing_role"
        ? "Your account is missing a role. Ask a parent to finish setup."
        : authError === "missing_family"
        ? "Your account is missing a family assignment. Ask a parent to add you."
        : "Authentication error. Please refresh.";
    return (
      <FallbackSetup
        title="App Setup Required"
        message={message}
        showGuide={authError === "firebase_init"}
      />
    );
  }

  if (user && (!role || !familyId)) {
    return (
      <div className="app-loading">
        <div className="spinner" />
        <p>Loading your family dashboard...</p>
      </div>
    );
  }

  const renderFallback = (error) => (
    <FallbackSetup
      title="App Setup Required"
      message="Firebase is not configured correctly. Please check your .env file."
      error={error}
      showGuide
    />
  );

  return (
    <div className="app-shell">
      {demoMode && <div className="demo-banner">Demo mode (no Firebase required)</div>}
      <AppErrorBoundary fallback={(err) => renderFallback(err)}>
        <AppRoutes />
      </AppErrorBoundary>
    </div>
  );
};

const FallbackSetup = ({ title, message, showGuide = false, error }) => {
  return (
    <div className="fallback">
      <div className="fallback-card">
        <h1>{title}</h1>
        <p>{message}</p>
        {error && <p className="muted">Error: {error?.message}</p>}
        <p className="fallback-subtitle">Required Firebase environment variables:</p>
        <ul className="fallback-list">
          {REQUIRED_ENV.map((key) => (
            <li key={key}>{key}</li>
          ))}
        </ul>
        {showGuide && (
          <div className="fallback-guide">
            <p>To fix this:</p>
            <ol>
              <li>Go to Firebase Console</li>
              <li>Create a web app</li>
              <li>Copy config</li>
              <li>Create frontend/.env file</li>
              <li>Paste values with VITE_ prefix</li>
              <li>Restart dev server</li>
            </ol>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
