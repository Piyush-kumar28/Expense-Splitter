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

 async function loadData() {
  setLoading(true);
  try {
    const groupData = await getGroup(groupId);
    const balancesData = await getBalances(groupId);
    const settlementsData = await getSettlements(groupId);
    const expensesData = await getExpenses(groupId);
    setGroupName(groupData.group.name);
    setBalances(balancesData.balances);
    setSettlements(settlementsData.settlements);
    setExpenses(expensesData.expenses);
  } catch (err) {
    setError("Failed to load group data");
  } finally {
    setLoading(false);
  }
}

async function handleAddMember(e) {
  e.preventDefault();
  setError("");
  try {
    await addMember(groupId, memberEmail);
    setMemberEmail("");
    loadData();
  } catch (err) {
    const message = err.response?.data?.message || "Something went wrong";
    setError(message);
  }
}

async function handleMarkSettled(settlement, index) {
  setSettlingIndex(index);
  try {
    await recordSettlement(groupId, settlement.toUserId, settlement.amount);
    loadData();
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
  try {
    await addExpense(Number(groupId), description, Number(amount), paidBy || undefined);
    setDescription("");
    setAmount("");
    setPaidBy("");
    loadData();
  } catch (err) {
    const message = err.response?.data?.message || "Something went wrong";
    setError(message);
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
        <Link
  to="/dashboard"
  className="inline-flex items-center text-sm text-muted hover:text-ink transition mb-5"
>
  ← Back to groups
</Link>

        <h1 className="font-display text-4xl font-semibold text-ink mb-8">
          {groupName}
        </h1>

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
              className="bg-ink text-paper font-medium rounded-md px-5 py-2 hover:opacity-90 transition cursor-pointer"
            >
              Add
            </button>
          </form>
        </div>

        {error && (
          <div className="bg-negative/10 text-negative text-sm rounded-md px-4 py-3 mb-6">
            {error}
          </div>
        )}

        {/* Balances section */}
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
          className="flex items-center justify-between border border-divider rounded-md px-4 py-3"
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
            <p className="text-muted text-sm">Everyone is settled up.</p>
          ) : (
          <div className="space-y-2">
            {settlements.map((s, i) => (
  <div key={i} className="flex justify-between items-center">
    <div className="text-ink">
      <span className="font-medium">{s.from}</span>
      <span className="text-muted"> → </span>
      <span className="font-medium">{s.to}</span>
      <span className="text-muted">: ₹{s.amount.toFixed(2)}</span>
    </div>
  
  {s.fromUserId === currentUserId && (
  <button
    onClick={() => handleMarkSettled(s, i)}
    disabled={settlingIndex === i}
    className="text-xs bg-ink text-paper rounded-md px-3 py-1 hover:opacity-90 transition disabled:opacity-50 cursor-pointer"
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
        {expenses.length} {expenses.length === 1 ? "expense" : "expenses"}
      </span>
    )}
  </div>

  {expenses.length === 0 ? (
    <p className="text-muted text-sm">No expenses yet.</p>
  ) : (
    <div className="space-y-2">
      {expenses.map((e) => (
        <div
  key={e.id}
  className="flex items-center justify-between gap-4 border border-divider rounded-md px-4 py-3 hover:bg-paper transition"
>
          <div className="min-w-0">
            <p className="text-ink text-sm font-medium truncate">
              {e.description}
            </p>

            <p className="text-muted text-xs mt-1">
              Paid by {e.paidByName}
            </p>
          </div>

          <span className="text-ink font-semibold whitespace-nowrap">
            ₹{e.amount.toFixed(2)}
          </span>
        </div>
      ))}
    </div>
  )}
</div>

        {/* Add expense form */}
        <div className="bg-surface border border-divider rounded-lg p-6 mb-6">
          <h2 className="font-display text-xl font-semibold text-ink">
    Add an expense
  </h2>
  <p className="text-muted text-sm mt-1">
    Record a shared expense for this group.
  </p>
  </div>
          <form onSubmit={handleAddExpense} className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description"
              className="flex-1 border border-divider rounded-md px-3 py-2 text-ink focus:outline-none focus:ring-2 focus:ring-gold"
              required
            />
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Amount"
              step="0.01"
              min="0.01"
              className="w-32 border border-divider rounded-md px-3 py-2 text-ink focus:outline-none focus:ring-2 focus:ring-gold"
              required
            />
            
           <select
  value={paidBy}
  onChange={(e) => setPaidBy(e.target.value)}
  className="w-40 border border-divider rounded-md px-3 py-2 text-ink bg-surface focus:outline-none focus:ring-2 focus:ring-gold cursor-pointer"
>
  <option value="">You paid</option>
  {balances
  .filter((b) => b.userId !== currentUserId)
  .map((b) => (
    <option key={b.userId} value={b.userId}>
      {b.name} paid
    </option>
  ))}
</select>

            <button
              type="submit"
              className="bg-ink text-paper font-medium rounded-md px-5 py-2 hover:opacity-90 transition whitespace-nowrap cursor-pointer"
            >
              Add
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default GroupPage;