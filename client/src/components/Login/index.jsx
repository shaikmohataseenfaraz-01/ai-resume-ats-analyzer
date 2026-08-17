import { API_BASE_URL } from "../../config.js";
import { useState } from "react";
import {
  useNavigate,
  Link,
} from "react-router-dom";
import "./index.css";

const Login = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleEmailChange = (event) => {
  setEmail(event.target.value);
};

const handlePasswordChange = (event) => {
  setPassword(event.target.value);
};

const handleSubmit = async (event) => {
  event.preventDefault();

  setLoading(true);
  setError("");

  const url = `${API_BASE_URL}/auth/login`;

  const loginDetails = {
    email,
    password,
  };

  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(loginDetails),
  };

  try {
    const response = await fetch(url, options);
    const data = await response.json();

    if (response.ok) {
      localStorage.setItem("token", data.token);
      navigate("/your-resumes");
    } else {
      setError(
        data.error ||
        data.message ||
        "Login failed"
      );
    }
  } catch (error) {
    setError(
      error.message ||
      "Network error"
    );
  } finally {
    setLoading(false);
  }
};

  return (
  <div className="auth-container">
    <form className="auth-card" onSubmit={handleSubmit}>
      <h2>Login</h2>

      {error && (
        <p className="error-text">{error}</p>
      )}

      <input
        type="email"
        name="email"
        placeholder="Email"
        value={email}
        onChange={handleEmailChange}
        required
      />

      <input
        type="password"
        name="password"
        placeholder="Password"
        value={password}
        onChange={handlePasswordChange}
        required
      />

      <button type="submit" disabled={loading}>
        {loading ? "Logging in..." : "Login"}
      </button>

      <p>
        Don&apos;t have an account?{" "}
        <Link to="/register">Register</Link>
      </p>
    </form>
  </div>
);
};

export default Login;