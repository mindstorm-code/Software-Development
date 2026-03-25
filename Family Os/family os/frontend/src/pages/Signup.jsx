import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const Signup = () => {
  const { signupParent } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    displayName: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");

  const handleChange = (event) => {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    try {
      await signupParent(form);
      navigate("/");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="page auth-page">
      <div className="card auth-card">
        <h1>Create parent account</h1>
        <p className="page-subtitle">Set up your family workspace.</p>
        <form onSubmit={handleSubmit} className="form">
          <label className="form-group">
            Display name
            <input
              name="displayName"
              required
              value={form.displayName}
              onChange={handleChange}
            />
          </label>
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
            Create account
          </button>
        </form>
        <p className="form-helper">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
