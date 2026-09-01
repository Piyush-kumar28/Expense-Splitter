# 💰 Expense Splitter

Expense Splitter is a full-stack web application that helps users manage and split expenses with friends, roommates, or other group members.

Users can create groups, add members, record shared expenses, and check the balance of each member. The application also suggests settlements to make it easier to clear pending amounts between members.

## 💡 Why Expense Splitter?

Splitting bills manually can become confusing, especially when multiple people pay different amounts. Expense Splitter makes this process easier by keeping track of expenses, calculating individual balances, and showing who needs to pay whom.

Instead of dealing with messy calculations and keeping track of everything manually, users can manage their group expenses in one place and settle payments more easily.

## 🚀 Live Demo

**Frontend:** https://expense-splitter-rho-seven.vercel.app/

## ✨ Features

* 🔐 User registration and login
* 🔑 JWT-based authentication
* 👥 Create groups and add members
* 💸 Add and track shared expenses
* 📊 Automatically calculate group balances
* 🤝 Get suggested settlements
* ✅ Mark settlements as completed
* 🧾 View recent group expenses

## 🛠️ Technologies Used

### Frontend

* React
* Vite
* React Router
* Axios
* Tailwind CSS

### Backend

* Node.js
* Express.js
* Prisma ORM
* JWT

### Database & Deployment

* PostgreSQL
* Neon
* Render
* Vercel

## 📁 Project Structure

```text
Expense-Splitter/
│
├── Backend/
│   ├── prisma/
│   ├── package.json
│   └── ...
│
├── frontend/
│   ├── src/
│   ├── package.json
│   └── ...
│
└── README.md
```

## 🔄 How It Works

```text
User
  ↓
React Frontend
  ↓
Axios API Requests
  ↓
Express.js Backend
  ↓
Prisma ORM
  ↓
PostgreSQL Database
```

After logging in, users can create a group and add members. When an expense is added, the backend stores the expense and calculates the amount each member owes or should receive. The application then provides suggested settlements between members.

## ⚙️ Run Locally

### Backend

```bash
cd Backend
npm install
npx prisma generate
```

### Environment Variables

Create a `.env` file inside the `Backend` folder:

```env
DATABASE_URL="your_postgresql_connection_string"
JWT_SECRET="your_jwt_secret"
```

Start the backend:

```bash
npm start
```

### Frontend

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

## 🌐 Deployment

* **Frontend:** Vercel
* **Backend:** Render
* **Database:** Neon PostgreSQL

The deployed frontend communicates with the Render backend through the API configured in Axios.

## 👨‍💻 Author

**Piyush Kumar**

GitHub: https://github.com/Piyush-kumar28
