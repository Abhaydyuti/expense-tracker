# 💰 Expense Tracker

A full-stack web application to track personal expenses with
authentication, data visualisation, and monthly summaries.

🔗 **Live Demo:** [expense-tracker-xxxx.onrender.com](https://expense-tracker-xxxx.onrender.com)

---

## Features

- 🔐 User signup, login, logout with session-based auth
- 🔑 Passwords hashed with bcrypt (10 salt rounds)
- ➕ Add, edit, delete expenses with full validation
- 🗂️ 7 expense categories (Food, Travel, Shopping, Bills, etc.)
- 🔍 Filter by category, month, year, and date range
- 📊 Dashboard with animated summary cards
- 📈 Bar chart — monthly spending (last 6 months)
- 🍩 Doughnut chart — category breakdown
- 📉 Line chart — daily spending this month
- 📋 Reports page with horizontal category comparison
- 🛡️ Security: helmet, rate limiting, IDOR protection
- 📱 Fully responsive (Bootstrap 5)

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Node.js, Express.js |
| Frontend | EJS, Bootstrap 5, Chart.js |
| Database | PostgreSQL |
| Auth | express-session, bcryptjs |
| Security | helmet, express-rate-limit |
| Deployment | Render |

---

## Folder Structure

expense-tracker/
├── config/         # Database connection
├── controllers/    # Request handlers (MVC)
├── middlewares/    # Auth, validation, security, errors
├── models/         # Database queries
├── routes/         # Express routers
├── views/          # EJS templates
│   ├── partials/   # Shared navbar, footer, flash
│   ├── auth/       # Login, signup
│   ├── dashboard/  # Dashboard, reports
│   └── expenses/   # List, add, edit
├── public/         # Static CSS and JS
├── schema.sql      # Database setup script
└── app.js          # Express app configuration

---

## Local Setup

### Prerequisites
- Node.js v18+
- PostgreSQL

### Steps

```bash
# 1. Clone the repo
git clone https://github.com/YOUR_USERNAME/expense-tracker.git
cd expense-tracker

# 2. Install dependencies
npm install

# 3. Create .env file
cp .env.example .env
# Fill in your PostgreSQL credentials in .env

# 4. Set up the database
psql -U postgres
CREATE DATABASE expense_tracker;
\c expense_tracker
\i schema.sql

# 5. Start the development server
npm run dev
```

Visit `http://localhost:3000`

---

## Database Schema

```sql
users       — id, name, email, password, created_at
categories  — id, name
expenses    — id, user_id, category_id, title,
              amount, expense_date, notes, created_at
```

---

## Security Features

- Passwords hashed with **bcrypt** (10 salt rounds)
- Sessions use **httpOnly + sameSite cookies**
- **Helmet** sets secure HTTP headers
- **Rate limiting** on auth routes (10 req / 15 min)
- **IDOR protection** — every query filters by `user_id`
- Input **sanitization** before all DB writes

---

## Author

**Your Name** — [github.com/YOUR_USERNAME](https://github.com/YOUR_USERNAME)