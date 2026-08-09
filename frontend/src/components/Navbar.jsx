import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Navbar() {
  const navigate = useNavigate();
  const { logoutUser } = useAuth();

  function handleLogout() {
    logoutUser();
    navigate("/login");
  }

  return (
    <nav className="bg-surface border-b border-divider">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link
          to="/dashboard"
          className="font-display text-2xl font-bold text-ink"
        >
          Expense Splitter
        </Link>

        <div className="flex items-center gap-6">
          <Link
            to="/dashboard"
            className="text-muted hover:text-ink transition"
          >
            Dashboard
          </Link>

          <button
            onClick={handleLogout}
            className="text-sm font-medium text-ink border border-divider rounded-md px-4 py-2 hover:bg-paper transition cursor-pointer"
          >
            Log out
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;