import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getMyGroups, createGroup } from "../api/groups";
import { useAuth } from "../context/AuthContext";

function DashboardPage() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newGroupName, setNewGroupName] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { logoutUser } = useAuth();

  useEffect(() => {
    loadGroups();
  }, []);

  async function loadGroups() {
    try {
      const data = await getMyGroups();
      setGroups(data.groups);
    } catch (err) {
      setError("Failed to load groups");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateGroup(e) {
    e.preventDefault();
    setError("");

    try {
      await createGroup(newGroupName);
      setNewGroupName("");
      loadGroups();
    } catch (err) {
      const message = err.response?.data?.message || "Something went wrong";
      setError(message);
    }
  }

  function handleLogout() {
    logoutUser();
    navigate("/login");
  }

  return (
    <div className="min-h-screen bg-paper px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="font-display text-4xl font-semibold text-ink">
            Your groups
          </h1>
          <button
            onClick={handleLogout}
            className="text-sm text-muted hover:text-ink underline"
          >
            Log out
          </button>
        </div>

        <form onSubmit={handleCreateGroup} className="flex gap-2 mb-8">
          <input
            type="text"
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
            placeholder="New group name"
            className="flex-1 border border-divider rounded-md px-3 py-2 text-ink focus:outline-none focus:ring-2 focus:ring-gold"
            required
          />
          <button
            type="submit"
            className="bg-ink text-paper font-medium rounded-md px-5 py-2 hover:opacity-90 transition"
          >
            Create
          </button>
        </form>

        {error && (
          <div className="bg-negative/10 text-negative text-sm rounded-md px-4 py-3 mb-4">
            {error}
          </div>
        )}

        {loading ? (
          <p className="text-muted">Loading...</p>
        ) : groups.length === 0 ? (
          <p className="text-muted">
            You're not part of any groups yet. Create one above to get started.
          </p>
        ) : (
          <div className="space-y-3">
            {groups.map((group) => (
              <div
                key={group.id}
                onClick={() => navigate(`/groups/${group.id}`)}
                className="bg-surface border border-divider rounded-lg p-5 cursor-pointer hover:border-gold transition"
              >
                <h2 className="font-display text-xl font-semibold text-ink">
                  {group.name}
                </h2>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default DashboardPage;