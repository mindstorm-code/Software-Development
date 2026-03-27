import { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { findChildByPin } from "../services/users";
import { hashPin } from "../utils/pin";

const PinLogin = () => {
  const { loginWithPin, familyId, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const roleParam = new URLSearchParams(location.search).get("role");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    if (!/^[0-9]{4}$/.test(pin)) {
      setError("PIN must be exactly 4 digits.");
      return;
    }
    setLoading(true);
    try {
      if (roleParam === "parent") {
        if (pin !== "1234") throw new Error("Invalid parent PIN");
        if (!user?.uid) {
          throw new Error("Parent session missing. Please log in with email first.");
        }
        await loginWithPin({
          pin,
          forceRole: "parent",
          child: { id: user.uid, role: "parent", familyId, email: user.email || "" },
        });
        navigate("/parent/dashboard", { replace: true });
        return;
      }

      if (roleParam === "child") {
        if (!familyId) throw new Error("Family not set. Please login as parent first.");
        const hashed = await hashPin(pin);
        const child = await findChildByPin(familyId, hashed);
        if (!child) throw new Error("Invalid child PIN");
        await loginWithPin({ pin, forceRole: "child", child });
        navigate("/child/dashboard", { replace: true });
        return;
      }

      throw new Error("Select role first.");
    } catch (err) {
      setError(err.message || "PIN login failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page auth-page">
      <div className="card auth-card">
        <h1>Enter PIN</h1>
        <p className="page-subtitle">Tap → PIN → Dashboard</p>
        <form className="form" onSubmit={handleSubmit}>
          <label className="form-group">
            4-digit PIN
            <input
              inputMode="numeric"
              pattern="[0-9]{4}"
              maxLength="4"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              required
            />
          </label>
          {error && <p className="form-error">{error}</p>}
          <button className="btn primary" type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
        <p className="form-helper">
          Use email instead? <Link to="/login">Go to email login</Link>
        </p>
      </div>
    </div>
  );
};

export default PinLogin;
