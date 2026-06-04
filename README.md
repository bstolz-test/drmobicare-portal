# Dr. MobiCare Internal Portal

Complete employee, equipment, and operations management system for Dr. MobiCare wound care company.

## Features

### 👥 Employee Management
- Create and manage employee profiles
- Assign roles: Admin, Provider, Medical Assistant
- Track employment status and details
- Office location assignment

### 🚀 Onboarding
- Automated checklists for each role (Provider: 42 steps, MA: 27 steps, Admin: 28 steps)
- Track completion status
- Document all onboarding tasks
- Different checklists per department

### 🚪 Offboarding
- Initiate offboarding with departure reason
- Track equipment returns
- Automated equipment return checklists
- Archive employee records

### 📦 Equipment Management
- Serial number database (Laptop, Moleculight, Doppler, ABI)
- Prey code tracking for laptops
- Equipment assignment to employees
- Shipment status tracking
- DocuSign acceptance integration

### 🚚 Shipment Tracking
- UPS/Shippo integration for live tracking
- Create shipping labels directly from portal
- Internal tracking without external links
- Status: Preparing → Shipped → Delivered → Accepted

### 🏥 Facilities & Scheduling
- Nursing home database with contacts
- PCC and Sigma credentials (encrypted)
- Master schedule for providers and MAs
- Mon-Fri facility assignments
- Progress notes recipient tracking

### 🛒 Procurement Orders
- Internal supply order form (replaces JotForm)
- Product catalog with images and categories
- Order history and tracking
- Admin approval workflow

### 📊 Analytics & Reports
- Hiring/firing statistics
- Turnover reports by position and date
- Order spend analytics
- Product cost tracking
- Employee metrics by department

### 🔐 Password Vault
- Encrypted credential storage
- Personal to each user
- Facility credentials included
- Simple, secure password management

### 📝 Lab Coat Inventory
- Track issued lab coats by size and gender
- Entity-level inventory management
- Clinical admin flag for who gets lab coats

---

## Tech Stack

**Backend:**
- Node.js 18+
- Express.js
- PostgreSQL
- JWT Authentication
- AES-256 Encryption

**Frontend:**
- React 18
- React Router
- Axios
- Lucide React Icons

**Deployment:**
- Railway (PostgreSQL + Node.js + React)
- Free tier

---

## Project Structure

```
drmobicare-portal/
├── backend/
│   ├── src/
│   │   ├── server.js           # Express app
│   │   ├── db.js               # PostgreSQL connection
│   │   ├── schema.js           # Database schema
│   │   ├── auth.js             # JWT & password utils
│   │   ├── encryption.js       # AES-256 encryption
│   │   ├── migrations/
│   │   │   └── migrate.js       # Database initialization
│   │   └── routes/
│   │       ├── auth.js         # Login/auth
│   │       ├── employees.js    # Employee CRUD
│   │       ├── equipment.js    # Equipment tracking
│   │       ├── onboarding.js   # Onboarding checklists
│   │       ├── offboarding.js  # Offboarding checklists
│   │       ├── facilities.js   # Facilities & scheduling
│   │       ├── procurement.js  # Orders & vault
│   │       └── analytics.js    # Reports & metrics
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── App.js              # Main app
│   │   ├── App.css             # Styles
│   │   ├── pages/
│   │   │   ├── LoginPage.js
│   │   │   ├── Dashboard.js
│   │   │   └── index.js        # Other pages
│   │   └── components/
│   │       └── Navigation.js
│   └── package.json
├── DEPLOYMENT.md               # Deployment guide
├── README.md                   # This file
└── package.json                # Root scripts
```

---

## Quick Start (Local Development)

### Prerequisites
- Node.js 18+
- PostgreSQL 12+
- npm 9+

### Setup

1. **Clone and install:**
```bash
git clone https://github.com/bstolz-test/drmobicare-portal.git
cd drmobicare-portal
npm install-all
```

2. **Create .env files:**

Backend (`backend/.env`):
```
NODE_ENV=development
PORT=5000
DATABASE_URL=postgresql://user:password@localhost:5432/drmobicare
JWT_SECRET=your-super-secret-key-min-32-chars
ENCRYPTION_KEY=your-encryption-key-min-32-chars
FRONTEND_URL=http://localhost:3000
```

3. **Initialize database:**
```bash
cd backend
npm run migrate
```

4. **Start dev servers:**
```bash
npm run dev
```

Backend runs on `http://localhost:5000`
Frontend runs on `http://localhost:3000`

---

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for step-by-step Railway deployment guide.

Quick summary:
1. Push to GitHub
2. Connect Railway to your repo
3. Add PostgreSQL
4. Configure environment variables
5. Deploy backend & frontend
6. Create first admin user
7. Login and start testing!

---

## User Roles & Permissions

**Admin** (HR/Procurement/Executives)
- Create/edit/delete employees
- Manage equipment
- View all data
- Create onboarding/offboarding
- Approve orders
- View analytics

**Provider (NP)**
- View own profile
- View own equipment
- Submit supply orders
- Access password vault
- View own schedule

**Medical Assistant (MA)**
- View own profile
- View own equipment
- Submit supply orders
- Access password vault
- View own schedule

**Office Staff**
- View own profile
- Submit supply orders
- Access password vault

---

## Database Schema

- **users** - Employee accounts
- **entities** - Business units (states)
- **offices** - Physical locations
- **equipment** - Laptop, Moleculight, Doppler, ABI
- **equipment_assignments** - Track who has what
- **equipment_types** - Equipment categories
- **facilities** - Nursing homes serviced
- **schedules** - Provider assignments
- **onboarding_checklists** - Onboarding tracking
- **onboarding_steps** - Individual tasks
- **offboarding_checklists** - Offboarding tracking
- **offboarding_steps** - Individual tasks
- **procurement_orders** - Supply orders
- **procurement_order_items** - Order line items
- **products** - Product catalog
- **password_vault** - Encrypted credentials
- **lab_coats** - Lab coat inventory
- **turnover_records** - Historical hire/fire data
- **audit_logs** - System activity log

---

## API Endpoints

### Auth
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Current user

### Employees
- `GET /api/employees` - List all
- `POST /api/employees` - Create
- `GET /api/employees/:id` - Get one
- `PUT /api/employees/:id` - Update

### Equipment
- `GET /api/equipment/inventory` - All equipment
- `POST /api/equipment` - Add equipment
- `POST /api/equipment/assign` - Assign to user
- `PUT /api/equipment/:id/status` - Update shipment status
- `GET /api/equipment/user/:userId` - User's equipment

### Onboarding
- `POST /api/onboarding` - Create checklist
- `GET /api/onboarding/:checklistId` - Get checklist
- `PUT /api/onboarding/step/:stepId/complete` - Mark step done

### Offboarding
- `POST /api/offboarding` - Initiate offboarding
- `GET /api/offboarding/:checklistId` - Get checklist
- `PUT /api/offboarding/step/:stepId/complete` - Mark step done

### Facilities
- `GET /api/facilities/facilities` - All facilities
- `POST /api/facilities/facilities` - Add facility
- `GET /api/facilities/schedules` - All schedules
- `POST /api/facilities/schedules` - Add schedule

### Procurement
- `POST /api/procurement/orders` - Create order
- `GET /api/procurement/orders` - List orders
- `GET /api/procurement/products` - Product catalog
- `POST /api/procurement/vault` - Add credential
- `GET /api/procurement/vault` - Get credentials

### Analytics
- `GET /api/analytics/turnover` - Turnover data
- `GET /api/analytics/orders` - Order analytics
- `GET /api/analytics/spending` - Spend by product

---

## Security

- ✅ JWT authentication
- ✅ Password hashing (bcrypt)
- ✅ AES-256 encryption for credentials
- ✅ Role-based access control
- ✅ Private GitHub repo
- ✅ Environment variables for secrets
- ✅ CORS protection
- ✅ No plain-text passwords in logs

---

## Testing the System

1. Login with your admin account
2. Create a test employee
3. Trigger onboarding
4. Assign equipment
5. Create procure order
6. View analytics

See notes in each page for what's fully implemented vs. placeholder.

---

## Next Steps After Deployment

1. ✅ Test login
2. ✅ Create first admin user
3. ✅ Import existing employees from spreadsheet
4. ✅ Add all offices and entities
5. ✅ Add all facilities
6. ✅ Test onboarding workflow
7. ✅ Test equipment tracking
8. ✅ Add product catalog
9. ✅ Test procurement orders
10. ✅ View analytics

---

## Support & Issues

If you encounter any issues during deployment or testing:

1. Check the logs in Railway dashboard
2. Check browser console (F12)
3. Verify environment variables are set correctly
4. Make sure PostgreSQL is running

Contact me with error messages and I'll help debug!

---

## License

Proprietary - Dr. MobiCare

---

**Built with ❤️ for Dr. MobiCare**
