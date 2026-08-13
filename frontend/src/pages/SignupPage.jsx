
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { signup } from "../api/auth";

function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    try {
      await signup(name, email, password);
      navigate("/login");
    } catch (err) {
      const message =
        err.response?.data?.message || "Something went wrong";
      setError(message);
    }
  }

  return (
    <div className="min-h-screen bg-paper flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="bg-surface border border-divider rounded-xl px-7 py-8 sm:px-9 sm:py-9">
          
          <div className="mb-7">
            <h1 className="font-display text-3xl font-semibold text-ink tracking-tight">
              Create your account
            </h1>

            <p className="text-sm text-muted mt-2">
              Start keeping track of shared expenses with ease.
            </p>
          </div>

          {error && (
            <div className="bg-negative/10 text-negative text-sm rounded-md px-4 py-3 mb-5">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-ink mb-2">
                Name
              </label>

              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="w-full h-11 border border-divider rounded-md px-3.5 text-sm text-ink bg-paper focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent transition"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-ink mb-2">
                Email
              </label>

              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full h-11 border border-divider rounded-md px-3.5 text-sm text-ink bg-paper focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent transition"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-ink mb-2">
                Password
              </label>

              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a password"
                className="w-full h-11 border border-divider rounded-md px-3.5 text-sm text-ink bg-paper focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent transition"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full h-11 bg-ink text-paper font-medium rounded-md hover:opacity-90 transition cursor-pointer"
            >
              Sign up
            </button>
          </form>

          <p className="text-sm text-muted mt-5 text-center">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-ink font-medium hover:underline"
            >
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default SignupPage;
