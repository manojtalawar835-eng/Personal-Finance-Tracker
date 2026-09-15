# 💰 FinAI — Full-Stack AI Personal Finance & Wealth Management Tracker

> **Placement-Grade Full-Stack Project** featuring React 19, TypeScript, Express.js, MySQL-compatible relational architecture, and Google Gemini 2.5 Flash financial intelligence.

---

## 📌 Project Overview

**FinAI** is an end-to-end, enterprise-ready personal finance tracker built to demonstrate full-stack engineering proficiency, database design, and real-world AI integration. It goes beyond basic expense logging by providing **predictive cash flow forecasting**, **voice-driven natural language expense parsing**, **financial health scoring (0–100)**, **smart subscription & spending leak detection**, **emergency fund runway calculation**, and an **interactive AI financial advisor chatbot**.

### 🌟 Key Highlights
- **Full-Stack REST Architecture**: Express.js server providing RESTful APIs with JWT authentication, bcrypt password hashing, and clean error handling.
- **Relational Database Design**: Production-ready MySQL 8.0 DDL schema with 8 normalized entities, foreign keys, cascade deletes, indices, and ACID compliance.
- **Google Gemini 2.5 Flash Integration**: Server-side AI for automatic transaction categorization, natural language entity extraction (speech/text), financial diagnostics, and predictive cash flow modeling.
- **Voice Expense Input**: Web Speech API with fallback sample prompts to log transactions naturally (e.g., *"Spent $45 on dinner with friends yesterday"*).
- **Portfolio & Debt Management**: Track unrealized gains across equities, crypto, and mutual funds, with structured debt payoff schedules.
- **Multi-Currency & Theming**: Instant conversion across USD ($), INR (₹), EUR (€), GBP (£), and JPY (¥), with custom dark and light modes.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, TypeScript, Tailwind CSS v4, Motion, Lucide Icons |
| **Backend** | Node.js, Express.js, ESBuild, TSX |
| **AI / ML** | Google GenAI SDK (`@google/genai`), Gemini 2.5 Flash |
| **Auth & Security** | JWT (JSON Web Tokens), BCrypt.js password hashing |
| **Database** | Relational In-Memory Store with exportable MySQL 8.0 InnoDB DDL (`schema.sql`) |
| **Build & Tooling** | Vite 6, TypeScript 5.8 |

---

## 🚀 Step-by-Step Installation & Setup

### 1. Prerequisites
Ensure you have the following installed on your machine:
- **Node.js**: v18.0.0 or later (v20+ recommended)
- **npm**: v9.0.0 or later (comes with Node.js)
- **Git**: For cloning the repository
- **Google Gemini API Key**: (Optional but recommended for AI features) Get a free key at [Google AI Studio](https://aistudio.google.com/).

---

### 2. Clone the Repository
```bash
git clone <your-repository-url>
cd personal-finance-tracker
```

---

### 3. Install Dependencies
Install all required frontend and backend packages:
```bash
npm install
```

---

### 4. Configure Environment Variables
Create a `.env` file in the root directory by copying the sample:
```bash
cp .env.example .env
```

Open `.env` and configure your keys:
```env
# Google Gemini API key for AI categorization, voice parsing, insights & cashflow forecast
GEMINI_API_KEY="your-actual-gemini-api-key"

# App URL (optional for local development, defaults to http://localhost:3000)
APP_URL="http://localhost:3000"
```

> **Note**: If `GEMINI_API_KEY` is not provided, the application will gracefully fall back to intelligent heuristic financial modeling so all features remain fully interactive!

---

### 5. Run the Application in Development Mode
Start the unified full-stack server (Express backend + Vite frontend middleware on port 3000):
```bash
npm run dev
```

Open your browser and navigate to:
```
http://localhost:3000
```

---

### 6. Build and Run in Production
To test the production build:
```bash
# Build Vite client and compile server with esbuild
npm run build

# Start the compiled CommonJS server
npm run start
```

---

## 🗄️ Database Architecture (MySQL 8.0)

The application includes an industrial-grade, normalized relational database schema. You can view, copy, or download the full `schema.sql` script directly inside the app under the **Schema & API Docs** tab (`/schema-docs`).

### Entity Relationship Model (8 Tables)
1. **`users`**: User account credentials, hashed password, currency preference, and timestamps.
2. **`transactions`**: Double-entry financial records (income vs. expense), categories, payment methods, receipts, recurring status.
3. **`budgets`**: Monthly category expenditure caps with alert thresholds (e.g., 80%, 100%).
4. **`savings_goals`**: Milestone savings trackers with target dates, target amounts, and monthly contribution pacing.
5. **`bills`**: Scheduled bills, utilities, EMIs, due dates, autopay flags, and payment status logs.
6. **`investments`**: Asset portfolio holdings (stocks, crypto, mutual funds, gold) with purchase price and live valuations.
7. **`debts`**: Credit card balances, personal/education loans, interest rates, minimum dues, and payoff tenure.
8. **`emergency_funds`**: Liquidity reserve tracking with target survival months calculation.

### Running with a Live MySQL Server
To import the schema into your local or cloud MySQL instance (e.g., AWS RDS, Cloud SQL, Docker MySQL):
```bash
# Log into your MySQL server
mysql -u root -p

# Create the database
CREATE DATABASE finance_tracker CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# Import the schema file
mysql -u root -p finance_tracker < schema.sql
```

---

## 🔌 REST API Endpoints Reference

The Express backend serves standard JSON REST endpoints protected by JWT Bearer token authentication:

### Authentication
- `POST /api/auth/register` — Create user account with bcrypt password hashing
- `POST /api/auth/login` — Authenticate credentials and issue JWT bearer token
- `GET  /api/auth/profile` — Fetch currently authenticated user profile
- `PUT  /api/auth/profile` — Update user preferences (currency, theme)

### Transactions & CSV
- `GET    /api/transactions` — List all user transactions (supports category & type filters)
- `POST   /api/transactions` — Record new transaction with optional receipt URL
- `DELETE /api/transactions/:id` — Delete a transaction
- `POST   /api/transactions/batch-import` — Batch bulk insert parsed CSV bank statement entries

### Budgets & Recurring Bills
- `GET    /api/budgets` — Get all budgets with spent percentage and overrun warnings
- `POST   /api/budgets` — Create or update category monthly budget cap
- `DELETE /api/budgets/:id` — Remove a budget
- `GET    /api/bills` — Get scheduled bills and subscription obligations
- `POST   /api/bills` — Register a recurring bill / EMI
- `POST   /api/bills/:id/pay` — Mark bill paid and automatically log an expense transaction

### Savings, Investments & Debt
- `GET  /api/savings` — List active savings goals and milestone targets
- `POST /api/savings` — Create a new savings goal
- `POST /api/savings/:id/deposit` — Add funds toward a specific goal
- `GET  /api/emergency-fund` — Fetch emergency runway metrics and benchmark analysis
- `PUT  /api/emergency-fund` — Update emergency fund liquidity balance
- `GET  /api/investments` — List portfolio holdings with unrealized P&L
- `POST /api/investments` — Add new stock/crypto/mutual fund holding
- `GET  /api/debts` — List liabilities, interest rates, and monthly payoff obligations
- `POST /api/debts` — Record new loan or credit liability

### AI & Diagnostics (Gemini 2.5 Flash)
- `POST /api/ai/categorize` — Classify merchant description into high-accuracy budget category
- `POST /api/ai/voice-parse` — Speech-to-text NLU entity extraction (amount, category, type, date)
- `GET  /api/ai/insights` — Calculate Financial Health Score (0–100), anomalies, and leak alerts
- `GET  /api/ai/predict-cashflow` — Generate 3-month forward-looking income/burn projections
- `POST /api/ai/chat` — Conversational AI Financial Advisor grounded in user ledger data
- `GET  /api/docs/mysql-schema` — Returns the raw MySQL DDL script for developer review

---

## 📱 App Modules & Features Walkthrough

1. **Executive Dashboard**:
   - High-level financial KPIs: Total Balance, Monthly Income, Monthly Burn, and Net Savings.
   - SVG visual trajectory charts for 6-month trends and category spending distribution.
   - Upcoming bill reminders and urgent alerts for budget limit overruns.

2. **Transactions Ledger & CSV Engine**:
   - Instant search and dual-filter pills (Type: All/Income/Expense; Categories).
   - Receipt attachment preview.
   - 1-click **Export to CSV** and **Drag-and-Drop CSV Import** with live field validation.

3. **Smart Voice Expense Logger**:
   - Tap the microphone button in the top bar to dictate expenses naturally using the Web Speech API.
   - AI extracts the amount, categorizes the vendor, sets the date, and populates the form automatically.

4. **Budgets & Bills**:
   - Visual progress bars turning amber at 80% and red at 100% cap.
   - Auto-detected recurring subscriptions to identify "silent drain" streaming services.
   - 1-click bill payment logging.

5. **Savings Milestones & Emergency Runway**:
   - Milestone progress circles with visual confetti celebrations upon completion.
   - Emergency runway indicator showing exact number of survival months without income based on 90-day average burn.

6. **Investments & Debt Payoff**:
   - Asset distribution breakdown across Equities, Crypto, Mutual Funds, and Gold.
   - Debt payoff priority tracker highlighting high-interest liabilities first (Avalanche method).

7. **Predictive Cash Flow & Smart Analytics**:
   - Machine learning forward-looking models forecasting next 3 months of income, burn, and surplus with confidence scoring.

8. **FinAI Conversational Advisor**:
   - Interactive chat window grounded in real portfolio figures, answering complex questions like *"How can I save $400 more every month?"* or *"Should I pay off debt or invest first?"*.

---

## 📂 Project Directory Structure

```
├── .env.example              # Template environment variables
├── index.html                # HTML entry point with meta tags & typography
├── metadata.json             # Applet descriptor & capabilities
├── package.json              # Project dependencies & build scripts
├── server.ts                 # Express REST backend + Vite middleware integration
├── server/
│   ├── db.ts                 # Relational in-memory data store with MySQL schema parity
│   └── gemini.ts             # Google GenAI SDK integration (categorization, chat, forecasting)
├── src/
│   ├── main.tsx              # React client root entry
│   ├── App.tsx               # Top-level state coordinator & tab switcher
│   ├── index.css             # Tailwind CSS global styles
│   ├── types.ts              # TypeScript interfaces for all domain entities & DTOs
│   ├── lib/
│   │   ├── api.ts            # Client HTTP API client with auth token headers
│   │   └── currency.ts       # Currency formatter & exchange rate utility
│   └── components/
│       ├── Navbar.tsx        # Top navigation with currency switcher & theme toggle
│       ├── Sidebar.tsx       # Navigation tabs with live Financial Health badge
│       ├── AuthModal.tsx     # Login & registration modal with demo credentials
│       ├── TransactionModal.tsx # Add/edit transaction form with receipt preview
│       ├── VoiceExpenseModal.tsx# Speech recognition modal with AI entity extraction
│       ├── CsvImportModal.tsx# Bank statement CSV drag-and-drop parser
│       └── views/
│           ├── DashboardView.tsx    # Executive overview & visual charts
│           ├── TransactionsView.tsx # Ledger with search, filters & CSV export
│           ├── BudgetsBillsView.tsx # Budgets, bill countdowns & subscriptions
│           ├── SavingsGoalsView.tsx # Savings milestones & emergency runway
│           ├── InvestmentsDebtView.tsx # Portfolio assets & debt payoff tracker
│           ├── AnalyticsView.tsx    # 3-month predictive cash flow forecasting
│           ├── AiAdvisorView.tsx    # Health score diagnostic & AI chatbot
│           └── SchemaDocsView.tsx   # Interactive MySQL DDL & REST API docs
├── tsconfig.json             # TypeScript compiler configuration
└── vite.config.ts            # Vite bundler configuration
```

---

## 🎓 Placement & Interview Talking Points

When presenting this project in technical interviews, highlight:
1. **Unified Full-Stack Architecture**: How Vite is mounted as Express middleware in development while serving compiled static assets alongside bundled CommonJS via ESBuild in production.
2. **Schema Normalization & ACID Compliance**: Why the database is split across 8 tables with proper foreign key cascades (`ON DELETE CASCADE`), index coverage on `user_id` and `date`, avoiding data anomalies.
3. **Optimized AI Token Consumption**: Rather than sending entire transaction histories to Gemini, the backend pre-aggregates figures into statistical vectors (e.g., category sums, monthly deltas), reducing latency and token costs.
4. **Resilient Offline / Fallback Design**: How client and server handle scenarios where external AI services are unavailable by falling back to robust deterministic algorithms.
5. **State Management & UX Polish**: Using TypeScript interfaces end-to-end to prevent runtime type mismatch bugs, coupled with responsive layout design and accessible contrast ratios.

---

## 📄 License
This project is licensed under the Apache-2.0 License.
