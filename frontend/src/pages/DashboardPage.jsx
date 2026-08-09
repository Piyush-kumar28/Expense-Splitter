import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getMyGroups, createGroup } from "../api/groups";
import Navbar from "../components/Navbar";

function DashboardPage() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newGroupName, setNewGroupName] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

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
      const message =
        err.response?.data?.message || "Something went wrong";
      setError(message);
    }
  }

  return (
  <div className="min-h-screen bg-paper">
    <Navbar />

    <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-8">
        <p className="text-sm text-muted mb-2">Keep track of your shared expenses</p>

        <h1 className="font-display text-4xl font-semibold text-ink">
          Your groups
        </h1>
      </div>

      <section className="bg-surface border border-divider rounded-lg p-5 mb-8">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-ink">
            Create a new group
          </h2>

          <p className="text-sm text-muted mt-1">
            Start a group to split expenses with friends or family.
          </p>
        </div>

        <form onSubmit={handleCreateGroup} className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
            placeholder="Enter group name"
            className="flex-1 border border-divider rounded-md px-4 py-3 text-ink bg-paper focus:outline-none focus:ring-2 focus:ring-gold"
            required
          />

          <button
            type="submit"
            className="bg-ink text-paper font-medium rounded-md px-6 py-3 hover:opacity-90 transition cursor-pointer"
          >
            Create group
          </button>
        </form>
      </section>

      {error && (
        <div className="bg-negative/10 text-negative text-sm rounded-md px-4 py-3 mb-6">
          {error}
        </div>
      )}

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-ink">
            Your groups
          </h2>

          {!loading && groups.length > 0 && (
            <span className="text-sm text-muted">
              {groups.length} {groups.length === 1 ? "group" : "groups"}
            </span>
          )}
        </div>

        {loading ? (
          <div className="bg-surface border border-divider rounded-lg p-6">
            <p className="text-muted">Loading your groups...</p>
          </div>
        ) : groups.length === 0 ? (
          <div className="bg-surface border border-divider rounded-lg p-8 text-center">
            <h3 className="text-lg font-semibold text-ink mb-2">
              No groups yet
            </h3>

            <p className="text-sm text-muted">
              Create your first group above to start splitting expenses.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {groups.map((group) => (
              <div
                key={group.id}
                onClick={() => navigate(`/groups/${group.id}`)}
               className="bg-surface border border-divider rounded-lg p-5 cursor-pointer hover:border-gold hover:shadow-sm transition"
              >
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-md bg-paper border border-divider flex items-center justify-center font-semibold text-ink">
                    {group.name.charAt(0).toUpperCase()}
                  </div>

                  <div className="min-w-0">
                    <h3 className="font-semibold text-ink truncate">
                      {group.name}
                    </h3>

                    <p className="text-sm text-muted mt-1">
                      View group expenses
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  </div>
);
}
export default DashboardPage;