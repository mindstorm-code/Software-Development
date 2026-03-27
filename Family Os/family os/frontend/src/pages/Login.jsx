import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const handleChange = (event) => {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    try {
      await login(form);
      navigate("/select-role");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="page auth-page">
      <div className="card auth-card">
        <h1>Welcome back</h1>
        <p className="page-subtitle">Sign in to manage chores and rewards.</p>
        <form onSubmit={handleSubmit} className="form">
          <label className="form-group">
            Email
            <input
              name="email"
              type="email"
              required
              value={form.email}
              onChange={handleChange}
            />
          </label>
          <label className="form-group">
            Password
            <input
              name="password"
              type="password"
              required
              value={form.password}
              onChange={handleChange}
            />
          </label>
          {error && <p className="form-error">{error}</p>}
          <button className="btn primary" type="submit">
            Sign in
          </button>
        </form>
        <p className="form-helper">
          New parent? <Link to="/signup">Create an account</Link>
        </p>
        <p className="form-helper">
          Prefer PIN? <Link to="/select-role">Use PIN login</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
