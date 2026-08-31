
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getMyGroups, createGroup } from "../api/groups";
import Navbar from "../components/Navbar";

function DashboardPage() {
  const [creating, setCreating] = useState(false);
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
    setCreating(true);

    try {
      await createGroup(newGroupName);
      setNewGroupName("");
      loadGroups();
    } catch (err) {
      const message =
        err.response?.data?.message || "Something went wrong";
      setError(message);
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="min-h-screen bg-paper">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        {/* Page heading */}
        <div className="mb-8">
          <p className="text-sm text-muted mb-2">
            Keep track of your shared expenses
          </p>

          <h1 className="font-display text-4xl font-semibold text-ink tracking-tight">
            Your groups
          </h1>
        </div>

        {/* Create group */}
        <section className="bg-surface border border-divider rounded-lg p-6 mb-9">
          <div className="mb-5">
            <h2 className="text-lg font-semibold text-ink">
              Create a new group
            </h2>

            <p className="text-sm text-muted mt-1">
              Start a group to split expenses with friends or family.
            </p>
          </div>

          <form
            onSubmit={handleCreateGroup}
            className="flex flex-col sm:flex-row gap-3"
          >
            <input
              type="text"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              placeholder="Enter group name"
              className="flex-1 h-11 border border-divider rounded-md px-3.5 text-sm text-ink bg-paper focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent transition"
              required
            />

            <button
              type="submit"
              disabled={creating}
              className="h-11 bg-ink text-paper font-medium rounded-md px-6 hover:opacity-90 transition cursor-pointer disabled:opacity-50"
            >
              {creating ? "Creating..." : "Create group"}
            </button>
          </form>
        </section>

        {/* Error */}
        {error && (
          <div className="bg-negative/10 text-negative text-sm rounded-md px-4 py-3 mb-6">
            {error}
          </div>
        )}

        {/* Groups */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-ink">
              Your groups
            </h2>

            {!loading && groups.length > 0 && (
              <span className="text-sm text-muted">
                {groups.length}{" "}
                {groups.length === 1 ? "group" : "groups"}
              </span>
            )}
          </div>

          {loading ? (
            <div className="bg-surface border border-divider rounded-lg p-6">
              <p className="text-sm text-muted">
                Loading your groups...
              </p>
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
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {groups.map((group) => (
                <button
                  key={group.id}
                  type="button"
                  onClick={() => navigate(`/groups/${group.id}`)}
                  className="text-left bg-surface border border-divider rounded-lg p-5 hover:border-gold hover:bg-[#faf9f6] transition cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 shrink-0 rounded-full bg-paper border border-divider flex items-center justify-center font-semibold text-ink">
                      {group.name.charAt(0).toUpperCase()}
                    </div>

                    <div className="min-w-0">
                      <h3 className="font-semibold text-ink truncate">
                        {group.name}
                      </h3>

                      <p className="text-xs text-muted mt-1">
                        Created on{" "}
                        {new Date(group.createdAt).toLocaleDateString(
                          "en-IN",
                          {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          }
                        )}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default DashboardPage;
