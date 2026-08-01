import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { login } from "../api/auth";
import { useAuth } from "../context/AuthContext";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { loginUser } = useAuth();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    try {
      const data = await login(email, password);
      loginUser(data.token);
      navigate("/dashboard");
    } catch (err) {
      const message = err.response?.data?.message || "Something went wrong";
      setError(message);
    }
  }

  return (
    <div className="min-h-screen bg-paper flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-surface border border-divider rounded-lg p-8">
        <h1 className="font-display text-3xl font-semibold text-ink mb-6">
          Welcome back
        </h1>

        {error && (
          <div className="bg-negative/10 text-negative text-sm rounded-md px-4 py-3 mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-muted mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-divider rounded-md px-3 py-2 text-ink focus:outline-none focus:ring-2 focus:ring-gold"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-muted mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-divider rounded-md px-3 py-2 text-ink focus:outline-none focus:ring-2 focus:ring-gold"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-ink text-paper font-medium rounded-md py-2 mt-2 hover:opacity-90 transition"
          >
            Log in
          </button>
        </form>

        <p className="text-sm text-muted mt-6 text-center">
          Don't have an account?{" "}
          <Link to="/signup" className="text-ink font-medium underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;