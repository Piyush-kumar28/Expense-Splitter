const jwt = require("jsonwebtoken");
const express = require("express");
const cors = require("cors");
require("dotenv").config();
const bcrypt = require("bcrypt");
const prisma = require("./prismaClient");
const verifyToken = require("./middleware");
const app = express();

async function checkGroupMembership(groupId, userId) {
  const group = await prisma.group.findUnique({ where: { id: groupId } });
  if (!group) {
    return { error: "Group not found", status: 404 };
  }

  const membership = await prisma.groupMember.findFirst({
    where: { groupId: groupId, userId: userId },
  });

  if (!membership) {
    return { error: "You are not a member of this group", status: 403 };
  }
  return { group, membership };
}

app.use(cors());
app.use(express.json());
app.get("/", (req, res) => {
  res.send("Backend is working");
});

app.post("/signup", async (req, res) => {
  try {
    const { name, password } = req.body || {};
const email = req.body?.email?.trim().toLowerCase();

if (!name || !email || !password) {
  return res.status(400).json({ message: "Name, email and password are required" });
}

if (password.length < 6) {
  return res.status(400).json({ message: "Password must be at least 6 characters" });
}
    const existingUser = await prisma.user.findUnique({
      where: { email: email },
    });

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        name: name,
        email: email,
        password: hashedPassword,
      },
    });

    res.status(201).json({ message: "User created successfully", userId: newUser.id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong" });
  }
});

app.post("/login", async (req, res) => {
  try {
    const { password } = req.body || {};
    const email = req.body?.email?.trim().toLowerCase();

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await prisma.user.findUnique({
      where: { email: email },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({ message: "Login successful", token: token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong" });
  }
});

app.post("/groups", verifyToken, async (req, res) => {
  try {
    const name = req.body?.name?.trim();

    if (!name) {
      return res.status(400).json({ message: "Group name is required" });
    }

    const newGroup = await prisma.group.create({
      data: {
        name: name,
        createdBy: req.userId,
      },
    });

    await prisma.groupMember.create({
      data: {
        userId: req.userId,
        groupId: newGroup.id,
      },
    });
    res.status(201).json({ message: "Group created successfully", group: newGroup });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong" });
  }
});

   app.get("/groups/:groupId", verifyToken, async (req, res) => {
  try {
    const { groupId } = req.params;
    if (isNaN(Number(groupId))) {
      return res.status(400).json({ message: "Invalid group ID" });
    }

    const check = await checkGroupMembership(Number(groupId), req.userId);
    if (check.error) {
      return res.status(check.status).json({ message: check.error });
    }

    res.status(200).json({ group: check.group });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong" });
  }
});

app.post("/groups/:groupId/members", verifyToken, async (req, res) => {
  try {
    const { groupId } = req.params;
    if (isNaN(Number(groupId))) {
      return res.status(400).json({ message: "Invalid group ID" });
    }

    const email = req.body?.email?.trim().toLowerCase();

    if (!email) {
      return res.status(400).json({ message: "email is required" });
    }

    const group = await prisma.group.findUnique({ where: { id: Number(groupId) } });
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    const requesterMembership = await prisma.groupMember.findFirst({
      where: { groupId: Number(groupId), userId: req.userId },
    });
    if (!requesterMembership) {
      return res.status(403).json({ message: "You are not a member of this group" });
    }

    const userToAdd = await prisma.user.findUnique({ where: { email: email } });
    if (!userToAdd) {
      return res.status(404).json({ message: "No user found with this email" });
    }

    const existingMembership = await prisma.groupMember.findFirst({
      where: {
        groupId: Number(groupId),
        userId: userToAdd.id,
      },
    });

    if (existingMembership) {
      return res.status(400).json({ message: "User is already a member of this group" });
    }

    const newMember = await prisma.groupMember.create({
      data: {
        userId: userToAdd.id,
        groupId: Number(groupId),
      },
    });

    res.status(201).json({ message: "Member added successfully", member: newMember });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong" });
  }
});

app.post("/expenses", verifyToken, async (req, res) => {
  try {
    const description = req.body?.description?.trim();
    const amount = Number(req.body?.amount);
    const groupId = Number(req.body?.groupId);

    if (!groupId || !description || typeof amount !== "number" || amount <= 0) {
  return res.status(400).json({ message: "Valid groupId, description and a positive amount are required" });
}

const check = await checkGroupMembership(groupId, req.userId);
if (check.error) {
  return res.status(check.status).json({ message: check.error });
}

    const groupMembers = await prisma.groupMember.findMany({
      where: { groupId: groupId },
    });

    if (groupMembers.length === 0) {
      return res.status(400).json({ message: "This group has no members" });
    }

   const paidBy = req.body?.paidBy ? Number(req.body.paidBy) : req.userId;

const payerIsMember = groupMembers.some((m) => m.userId === paidBy);
if (!payerIsMember) {
  return res.status(400).json({ message: "The selected payer is not a member of this group" });
}

const newExpense = await prisma.expense.create({
  data: {
    description: description,
    amount: amount,
    paidBy: paidBy,
    groupId: groupId,
  },
});

    const totalPaise = Math.round(amount * 100);
    const numMembers = groupMembers.length;
    const basePaise = Math.floor(totalPaise / numMembers);
    const remainderPaise = totalPaise - basePaise * numMembers;

    const shareData = groupMembers.map((member, index) => {
      const sharePaise = basePaise + (index < remainderPaise ? 1 : 0);
      return {
        expenseId: newExpense.id,
        userId: member.userId,
        amountOwed: sharePaise / 100,
      };
    });

    await prisma.expenseShare.createMany({
      data: shareData,
    });

    res.status(201).json({ message: "Expense added successfully", expense: newExpense });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong" });
  }
});
  app.get("/groups/:groupId/balances", verifyToken, async (req, res) => {
  try {
    const { groupId } = req.params;
    if (isNaN(Number(groupId))) {
  return res.status(400).json({ message: "Invalid group ID" });
}
    const groupMembers = await prisma.groupMember.findMany({
      where: { groupId: Number(groupId) },
      include: { user: true },
    });

    const check = await checkGroupMembership(Number(groupId), req.userId);
if (check.error) {
  return res.status(check.status).json({ message: check.error });
}
    const balances = [];

    for (const member of groupMembers) {
      const expensesPaid = await prisma.expense.findMany({
        where: { groupId: Number(groupId), paidBy: member.userId },
      });

      const totalPaid = expensesPaid.reduce((sum, expense) => sum + expense.amount, 0);

      const sharesOwed = await prisma.expenseShare.findMany({
        where: { userId: member.userId, expense: { groupId: Number(groupId) } },
      });

      const totalOwed = sharesOwed.reduce((sum, share) => sum + share.amountOwed, 0);

      balances.push({
      userId: member.userId,
      name: member.user.name,
      balance: Math.round((totalPaid - totalOwed) * 100) / 100,
    });
    }

    res.status(200).json({ balances: balances });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong" });
  }
});

app.get("/groups/:groupId/settlements", verifyToken, async (req, res) => {
  try {
    const { groupId } = req.params;
    if (isNaN(Number(groupId))) {
      return res.status(400).json({ message: "Invalid group ID" });
    }

    const groupMembers = await prisma.groupMember.findMany({
      where: { groupId: Number(groupId) },
      include: { user: true },
    });

   const check = await checkGroupMembership(Number(groupId), req.userId);
if (check.error) {
  return res.status(check.status).json({ message: check.error });
}

    const balances = [];

    for (const member of groupMembers) {
      const expensesPaid = await prisma.expense.findMany({
        where: { groupId: Number(groupId), paidBy: member.userId },
      });

      const totalPaid = expensesPaid.reduce((sum, expense) => sum + expense.amount, 0);

      const sharesOwed = await prisma.expenseShare.findMany({
        where: { userId: member.userId, expense: { groupId: Number(groupId) } },
      });

      const totalOwed = sharesOwed.reduce((sum, share) => sum + share.amountOwed, 0);

      balances.push({
        userId: member.userId,
        name: member.user.name,
        balance: totalPaid - totalOwed,
      });
    }

    const debtors = balances.filter((b) => b.balance < 0).map((b) => ({ ...b }));
    const creditors = balances.filter((b) => b.balance > 0).map((b) => ({ ...b }));

    const settlements = [];

    while (debtors.length > 0 && creditors.length > 0) {
      debtors.sort((a, b) => a.balance - b.balance);
      creditors.sort((a, b) => b.balance - a.balance);

      const debtor = debtors[0];
      const creditor = creditors[0];

      const amountToSettle = Math.round(Math.min(-debtor.balance, creditor.balance) * 100) / 100;

      settlements.push({
      from: debtor.name,
      to: creditor.name,
      amount: amountToSettle,
    });

      debtor.balance = Math.round((debtor.balance + amountToSettle) * 100) / 100;
      creditor.balance = Math.round((creditor.balance - amountToSettle) * 100) / 100;

      if (Math.abs(debtor.balance) < 0.01) debtors.shift();
      if (Math.abs(creditor.balance) < 0.01) creditors.shift();
    }

    res.status(200).json({ settlements: settlements });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong" });
  }
});
app.get("/my-groups", verifyToken, async (req, res) => {
  try {
    const memberships = await prisma.groupMember.findMany({
      where: { userId: req.userId },
      include: { group: true },
    });

    const groups = memberships.map((m) => m.group);

    res.status(200).json({ groups: groups });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong" });
  }
});


const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});