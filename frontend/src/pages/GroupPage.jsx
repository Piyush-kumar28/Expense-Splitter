import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  getBalances,
  getSettlements,
  addExpense,
  addMember,
  getGroup,
  getExpenses,
  recordSettlement,
  deleteExpense,
  deleteGroup,
  updateExpense,
} from "../api/groups";
import { jwtDecode } from "jwt-decode";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
function GroupPage() {

  const { groupId } = useParams();
  const [balances, setBalances] = useState([]);
  const [groupName, setGroupName] = useState("");
  const [settlements, setSettlements] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [paidBy, setPaidBy] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [memberEmail, setMemberEmail] = useState("");
  const { token } = useAuth();
  const [settlingIndex, setSettlingIndex] = useState(null);
  const [addingMember, setAddingMember] = useState(false);
  const [deletingExpenseId, setDeletingExpenseId] = useState(null);
  const [deletingGroup, setDeletingGroup] = useState(false);
const [addingExpense, setAddingExpense] = useState(false);
const [groupCreatorId, setGroupCreatorId] = useState(null);
const [editingExpenseId, setEditingExpenseId] = useState(null);
const [editDescription, setEditDescription] = useState("");
const [editAmount, setEditAmount] = useState("");
const [editPaidBy, setEditPaidBy] = useState("");
const [updatingExpense, setUpdatingExpense] = useState(false);
const currentUserId = token ? jwtDecode(token).userId : null;

const avatarPalette = [
  { bg: "#EEEDFE", text: "#3C3489" },
  { bg: "#FAECE7", text: "#993C1D" },
  { bg: "#E1F5EE", text: "#0F6E56" },
  { bg: "#FBEAF0", text: "#993556" },
  { bg: "#FAEEDA", text: "#854F0B" },
];

function getInitials(name) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function avatarStyle(index) {
  return avatarPalette[index % avatarPalette.length];
}


  useEffect(() => {
    loadData();
  }, [groupId]);

 async function loadData(showLoading = true) {
  if (showLoading) {
    setLoading(true);
  }

  try {
    const [groupData, balanceData, settlementData, expenseData] =
      await Promise.all([
        getGroup(groupId),
        getBalances(groupId),
        getSettlements(groupId),
        getExpenses(groupId),
      ]);

    setGroupName(groupData.group.name);
    setGroupCreatorId(groupData.group.createdBy);
    setBalances(balanceData.balances);
    setSettlements(settlementData.settlements);
    setExpenses(expenseData.expenses);
  } catch (err) {
    setError("Failed to load group");
  } finally {
    if (showLoading) {
      setLoading(false);
    }
  }
}

const totalExpenses = expenses.reduce(
  (total, expense) => total + expense.amount,
  0
);

async function handleAddMember(e) {
  e.preventDefault();
  setError("");
  setAddingMember(true);

  try {
    await addMember(groupId, memberEmail);
    setMemberEmail("");
    await loadData(false);
  } catch (err) {
    const message =
      err.response?.data?.message || "Something went wrong";
    setError(message);
  } finally {
    setAddingMember(false);
  }
}

async function handleMarkSettled(settlement, index) {
  setSettlingIndex(index);
  try {
    await recordSettlement(groupId, settlement.toUserId, settlement.amount);
    await loadData(false);
  } catch (err) {
    const message = err.response?.data?.message || "Something went wrong";
    setError(message);
  } finally {
    setSettlingIndex(null);
  }
}

async function handleAddExpense(e) {
  e.preventDefault();
  setError("");
  setAddingExpense(true);

  try {
    await addExpense(
      Number(groupId),
      description,
      Number(amount),
      paidBy || undefined
    );

    setDescription("");
    setAmount("");
    setPaidBy("");
    await loadData(false);
  } catch (err) {
    const message =
      err.response?.data?.message || "Something went wrong";
    setError(message);
  } finally {
    setAddingExpense(false);
  }
}

function handleStartEdit(expense) {
  setEditingExpenseId(expense.id);
  setEditDescription(expense.description);
  setEditAmount(expense.amount);

  console.log("Edit function ready");
}

async function handleUpdateExpense(e) {
  e.preventDefault();
  setError("");
  setUpdatingExpense(true);

  try {
    await updateExpense(
      editingExpenseId,
      editDescription,
      Number(editAmount)
    );

    setEditingExpenseId(null);
    setEditDescription("");
    setEditAmount("");

    await loadData(false);
  } catch (err) {
    const message =
      err.response?.data?.message || "Failed to update expense";
    setError(message);
  } finally {
    setUpdatingExpense(false);
  }
}



async function handleDeleteExpense(expenseId) {
  setError("");

  try {
    await deleteExpense(expenseId);

    // Refresh expenses, balances, settlements and total expense
    await loadData(false);
  } catch (err) {
    const message =
      err.response?.data?.message || "Failed to delete expense";

    setError(message);
  }
}

async function handleDeleteGroup() {
  const confirmed = window.confirm(
    "Are you sure you want to delete this group? This action cannot be undone."
  );

  if (!confirmed) {
    return;
  }

  setDeletingGroup(true);
  setError("");

  try {
    await deleteGroup(groupId);
    window.location.href = "/dashboard";
  } catch (err) {
    const message =
      err.response?.data?.message || "Failed to delete group";
    setError(message);
  } finally {
    setDeletingGroup(false);
  }
}

  if (loading) {
    return <div className="min-h-screen bg-paper p-8 text-muted">Loading...</div>;
  }

  return (
  <div className="min-h-screen bg-paper">
    <Navbar />
    <div className="px-4 py-8">
      <div className="max-w-2xl mx-auto">
       <div className="mb-8">
  <Link
    to="/dashboard"
    className="inline-flex items-center text-sm text-muted hover:text-ink transition mb-3 cursor-pointer"
  >
    ← Back to groups
  </Link>

  <div className="flex items-center justify-between gap-4 mb-8">
  <h1 className="font-display text-4xl font-semibold text-ink">
    {groupName}
  </h1>

  <div className="bg-surface border border-divider rounded-lg px-5 py-4 mb-6">
  <p className="text-muted text-sm">Total group expenses</p>
  <p className="text-2xl font-semibold text-ink mt-1">
    ₹{totalExpenses.toFixed(2)}
  </p>
</div>

  {groupCreatorId === currentUserId && (
    <button
      onClick={handleDeleteGroup}
      disabled={deletingGroup}
      className="text-sm text-negative border border-negative/30 rounded-md px-4 py-2 hover:bg-negative/10 transition cursor-pointer disabled:opacity-50"
    >
      {deletingGroup ? "Deleting..." : "Delete group"}
    </button>
  )}
</div>
</div>

         <div className="bg-surface border border-divider rounded-lg p-6 mb-6">
          <h2 className="font-display text-xl font-semibold text-ink mb-4">
            Add a member
          </h2>
          <form onSubmit={handleAddMember} className="flex gap-2">
            <input
              type="email"
              value={memberEmail}
              onChange={(e) => setMemberEmail(e.target.value)}
              placeholder="Friend's email"
              className="flex-1 border border-divider rounded-md px-3 py-2 text-ink focus:outline-none focus:ring-2 focus:ring-gold"
              required
            />
            <button
  type="submit"
  disabled={addingMember}
  className="bg-ink text-paper font-medium rounded-md px-5 py-2 hover:opacity-90 transition cursor-pointer disabled:opacity-50"
>
  {addingMember ? "Adding..." : "Add"}
</button>
          </form>
        </div>

        {error && (
          <div className="bg-negative/10 text-negative text-sm rounded-md px-4 py-3 mb-6">
            {error}
          </div>
        )}

        {/* Add expense form */}
          <div className="bg-surface border border-divider rounded-lg p-6 mb-6">
            <div className="mb-4">
              <h2 className="font-display text-xl font-semibold text-ink">
                Add an expense
              </h2>

              <p className="text-muted text-sm mt-1">
                Record a shared expense for this group.
              </p>
            </div>

            <form
              onSubmit={handleAddExpense}
              className="flex flex-col sm:flex-row gap-3"
            >
              <input
                type="text"
                value={description}
                onChange={(e) =>
                  setDescription(e.target.value)
                }
                placeholder="Description"
                className="flex-1 border border-divider rounded-md px-3 py-2 text-ink focus:outline-none focus:ring-2 focus:ring-gold"
                required
              />

              <input
                type="number"
                value={amount}
                onChange={(e) =>
                  setAmount(e.target.value)
                }
                placeholder="Amount"
                step="0.01"
                min="0.01"
                className="w-32 border border-divider rounded-md px-3 py-2 text-ink focus:outline-none focus:ring-2 focus:ring-gold"
                required
              />

              <select
                value={paidBy}
                onChange={(e) =>
                  setPaidBy(e.target.value)
                }
                className="w-40 border border-divider rounded-md px-3 py-2 text-ink bg-surface focus:outline-none focus:ring-2 focus:ring-gold cursor-pointer font-medium"
              >
                <option value="">You paid</option>

                {balances
                  .filter(
                    (b) => b.userId !== currentUserId
                  )
                  .map((b) => (
                    <option
                      key={b.userId}
                      value={b.userId}
                    >
                      {b.name} paid
                    </option>
                  ))}
              </select>

            <button
  type="submit"
  disabled={addingExpense}
  className="bg-ink text-paper font-medium rounded-md px-5 py-2 hover:opacity-90 transition whitespace-nowrap cursor-pointer disabled:opacity-50"
>
  {addingExpense ? "Adding..." : "Add"}
</button>
            </form>
          </div>

        
{/* Balances section */}
<div className="bg-surface border border-divider rounded-lg p-6 mb-6">
  <div className="flex items-center justify-between mb-4">
    <h2 className="font-display text-xl font-semibold text-ink">
      Balances
    </h2>

    <span className="text-sm text-muted">
      {balances.length} {balances.length === 1 ? "member" : "members"}
    </span>
  </div>

  {balances.length === 0 ? (
    <p className="text-muted text-sm">No members yet.</p>
  ) : (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {balances.map((b, i) => (
        <div
          key={b.userId || i}
          className="flex items-center justify-between border border-divider rounded-md px-4 py-3 hover:bg-paper transition"
        >
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-medium shrink-0"
              style={{
                backgroundColor: avatarStyle(i).bg,
                color: avatarStyle(i).text,
              }}
            >
              {getInitials(b.name)}
            </div>

            <div>
              <p className="text-ink text-sm font-medium">
                {b.name}
              </p>

              <p
                className={
                  b.balance > 0
                    ? "text-positive text-xs font-medium"
                    : b.balance < 0
                    ? "text-negative text-xs font-medium"
                    : "text-muted text-xs"
                }
              >
                {b.balance > 0
                  ? `is owed ₹${b.balance.toFixed(2)}`
                  : b.balance < 0
                  ? `owes ₹${Math.abs(b.balance).toFixed(2)}`
                  : "settled up"}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )}
</div>

{/* Settlements section */}
<div className="bg-surface border border-divider rounded-lg p-6 mb-6">
  <h2 className="font-display text-xl font-semibold text-ink mb-4">
    Suggested settlements
  </h2>

  {settlements.length === 0 ? (
    <p className="text-muted text-sm">
      Everyone is settled up.
    </p>
  ) : (
    <div className="space-y-2">
      {settlements.map((s, i) => (
        <div
          key={i}
          className="flex justify-between items-center gap-4 border border-divider rounded-md px-4 py-3"
        >
          <div className="text-ink">
            <span className="font-medium">{s.from}</span>
            <span className="text-muted"> → </span>
            <span className="font-medium">{s.to}</span>
            <span className="text-ink font-semibold whitespace-nowrap ml-2">
              ₹{s.amount.toFixed(2)}
            </span>
          </div>

          {s.fromUserId === currentUserId && (
            <button
              type="button"
              onClick={() => handleMarkSettled(s, i)}
              disabled={settlingIndex === i}
              className="text-xs bg-ink text-paper rounded-md px-3 py-1.5 hover:opacity-80 transition disabled:opacity-50 cursor-pointer"
            >
              {settlingIndex === i ? "Settling..." : "Mark settled"}
            </button>
          )}
        </div>
      ))}
    </div>
  )}
</div>


{/* Expense history section */}
<div className="bg-surface border border-divider rounded-lg p-6 mb-6">
  <div className="flex items-center justify-between mb-4">
    <h2 className="font-display text-xl font-semibold text-ink">
      Recent expenses
    </h2>

    {expenses.length > 0 && (
      <span className="text-sm text-muted">
        {expenses.length}{" "}
        {expenses.length === 1 ? "expense" : "expenses"}
      </span>
    )}
  </div>

  {expenses.length === 0 ? (
    <p className="text-muted text-sm">
      No expenses yet.
    </p>
  ) : (
    <div className="space-y-2">
      {expenses.map((e) => (
        <div key={e.id}>
          
          {/* Expense row */}
          <div
            className="flex items-center justify-between gap-4 border border-divider rounded-md px-4 py-3 hover:bg-paper transition"
          >
            <div className="min-w-0">
              <p className="text-ink text-sm font-medium truncate">
                {e.description}
              </p>

              <p className="text-muted text-xs mt-1">
                Paid by {e.paidByName}
              </p>

              <p className="text-muted text-xs mt-1">
                {new Date(e.createdAt).toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-ink font-semibold whitespace-nowrap">
                ₹{e.amount.toFixed(2)}
              </span>

              <button
                type="button"
                onClick={() => handleStartEdit(e)}
                className="text-xs border border-divider text-ink rounded-md px-3 py-1.5 hover:bg-paper transition cursor-pointer"
              >
                Edit
              </button>

              <button
                type="button"
                onClick={() => handleDeleteExpense(e.id)}
                className="text-xs border border-divider text-negative rounded-md px-3 py-1.5 hover:bg-negative/10 transition cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>


          {/* Edit form */}
          {editingExpenseId === e.id && (
            <form
              onSubmit={handleUpdateExpense}
              className="mt-2 border border-divider rounded-md p-3 flex flex-wrap gap-2"
            >
              <input
                type="text"
                value={editDescription}
                onChange={(event) =>
                  setEditDescription(event.target.value)
                }
                placeholder="Description"
                className="flex-1 min-w-[180px] border border-divider rounded-md px-3 py-2 text-sm"
                required
              />

              <input
                type="number"
                value={editAmount}
                onChange={(event) =>
                  setEditAmount(event.target.value)
                }
                placeholder="Amount"
                min="0.01"
                step="0.01"
                className="w-28 border border-divider rounded-md px-3 py-2 text-sm"
                required
              />

              <button
                type="submit"
                disabled={updatingExpense}
                className="bg-ink text-paper rounded-md px-3 py-2 text-sm hover:opacity-80 transition disabled:opacity-50 cursor-pointer"
              >
                {updatingExpense ? "Saving..." : "Save"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setEditingExpenseId(null);
                  setEditDescription("");
                  setEditAmount("");
                }}
                className="border border-divider rounded-md px-3 py-2 text-sm hover:bg-paper transition cursor-pointer"
              >
                Cancel
              </button>
            </form>
          )}

        </div>
      ))}
    </div>
  )}
</div>

        
              

        </div>
      </div>
    </div>
  );
}

export default GroupPage;