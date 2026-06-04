export const createTablesSQL = `
-- Users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  first_name VARCHAR(255),
  last_name VARCHAR(255),
  role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'provider', 'medical_assistant', 'office')),
  position VARCHAR(255),
  department VARCHAR(100) NOT NULL CHECK (department IN ('executive', 'operations', 'provider', 'medical_assistant', 'philippines', 'admin', 'clinical_admin')),
  personal_email VARCHAR(255),
  company_email VARCHAR(255),
  phone_number VARCHAR(20),
  home_address TEXT,
  state VARCHAR(50),
  entity_id INTEGER,
  office_id INTEGER,
  reports_to INTEGER REFERENCES users(id),
  start_date DATE,
  is_clinical_admin BOOLEAN DEFAULT FALSE,
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'offboarded')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Entities (states/business units)
CREATE TABLE IF NOT EXISTS entities (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  state VARCHAR(50) NOT NULL,
  business_name VARCHAR(255),
  address TEXT,
  city VARCHAR(100),
  zip_code VARCHAR(10),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Offices/Locations
CREATE TABLE IF NOT EXISTS offices (
  id SERIAL PRIMARY KEY,
  entity_id INTEGER NOT NULL REFERENCES entities(id),
  name VARCHAR(255) NOT NULL,
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(50),
  zip_code VARCHAR(10),
  phone VARCHAR(20),
  contact_person VARCHAR(255),
  contact_email VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Equipment types
CREATE TABLE IF NOT EXISTS equipment_types (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100),
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Equipment inventory
CREATE TABLE IF NOT EXISTS equipment (
  id SERIAL PRIMARY KEY,
  type_id INTEGER NOT NULL REFERENCES equipment_types(id),
  serial_number VARCHAR(255) UNIQUE NOT NULL,
  prey_code VARCHAR(255),
  status VARCHAR(50) DEFAULT 'in_stock' CHECK (status IN ('in_stock', 'assigned', 'shipped', 'delivered', 'accepted', 'returned', 'damaged')),
  assigned_to INTEGER REFERENCES users(id),
  current_location VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Equipment assignments/tracking
CREATE TABLE IF NOT EXISTS equipment_assignments (
  id SERIAL PRIMARY KEY,
  equipment_id INTEGER NOT NULL REFERENCES equipment(id),
  user_id INTEGER NOT NULL REFERENCES users(id),
  assigned_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  shipment_status VARCHAR(50) DEFAULT 'preparing' CHECK (shipment_status IN ('preparing', 'shipped', 'delivered', 'accepted', 'returned')),
  tracking_number VARCHAR(255),
  shippo_label_id VARCHAR(255),
  return_label_id VARCHAR(255),
  docusign_status VARCHAR(50) DEFAULT 'pending' CHECK (docusign_status IN ('pending', 'signed', 'completed')),
  docusign_envelope_id VARCHAR(255),
  notes TEXT,
  returned_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Onboarding checklists
CREATE TABLE IF NOT EXISTS onboarding_checklists (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  department VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP,
  status VARCHAR(50) DEFAULT 'in_progress'
);

-- Onboarding steps
CREATE TABLE IF NOT EXISTS onboarding_steps (
  id SERIAL PRIMARY KEY,
  checklist_id INTEGER NOT NULL REFERENCES onboarding_checklists(id),
  step_name VARCHAR(255) NOT NULL,
  description TEXT,
  required BOOLEAN DEFAULT TRUE,
  completed BOOLEAN DEFAULT FALSE,
  completed_by VARCHAR(255),
  completed_date TIMESTAMP,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Offboarding checklists
CREATE TABLE IF NOT EXISTS offboarding_checklists (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  department VARCHAR(100) NOT NULL,
  reason VARCHAR(100) CHECK (reason IN ('resigned', 'terminated', 'contract_ended', 'other')),
  last_day_of_work DATE,
  initiated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_date TIMESTAMP,
  status VARCHAR(50) DEFAULT 'in_progress'
);

-- Offboarding steps
CREATE TABLE IF NOT EXISTS offboarding_steps (
  id SERIAL PRIMARY KEY,
  offboarding_id INTEGER NOT NULL REFERENCES offboarding_checklists(id),
  step_name VARCHAR(255) NOT NULL,
  description TEXT,
  required BOOLEAN DEFAULT TRUE,
  completed BOOLEAN DEFAULT FALSE,
  completed_by VARCHAR(255),
  completed_date TIMESTAMP,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Facilities (nursing homes)
CREATE TABLE IF NOT EXISTS facilities (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(50),
  zip_code VARCHAR(10),
  phone VARCHAR(20),
  fax VARCHAR(20),
  pcc_username VARCHAR(255),
  pcc_password VARCHAR(255),
  sigma_account VARCHAR(255),
  sigma_password VARCHAR(255),
  point_of_contact VARCHAR(255),
  contact_phone VARCHAR(20),
  progress_notes_recipient VARCHAR(255),
  progress_notes_email VARCHAR(255),
  market_state VARCHAR(50),
  entity_id INTEGER REFERENCES entities(id),
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'discontinued')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Master schedule
CREATE TABLE IF NOT EXISTS schedules (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  facility_id INTEGER NOT NULL REFERENCES facilities(id),
  day_of_week VARCHAR(10) NOT NULL,
  start_time TIME,
  end_time TIME,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, facility_id, day_of_week)
);

-- Procurement orders
CREATE TABLE IF NOT EXISTS procurement_orders (
  id SERIAL PRIMARY KEY,
  order_number VARCHAR(50) UNIQUE,
  user_id INTEGER NOT NULL REFERENCES users(id),
  office_id INTEGER REFERENCES offices(id),
  order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status VARCHAR(50) DEFAULT 'submitted' CHECK (status IN ('submitted', 'approved', 'ordered', 'received', 'completed')),
  notes TEXT,
  total_cost DECIMAL(10, 2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Procurement order items
CREATE TABLE IF NOT EXISTS procurement_order_items (
  id SERIAL PRIMARY KEY,
  order_id INTEGER NOT NULL REFERENCES procurement_orders(id),
  product_id INTEGER NOT NULL REFERENCES products(id),
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10, 2),
  subtotal DECIMAL(10, 2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Products catalog
CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100),
  description TEXT,
  mckesson_id VARCHAR(255),
  unit_price DECIMAL(10, 2),
  image_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Lab coat inventory
CREATE TABLE IF NOT EXISTS lab_coats (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  size VARCHAR(10),
  gender VARCHAR(10),
  quantity_assigned INTEGER DEFAULT 1,
  issued_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'returned')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Lab coat stock
CREATE TABLE IF NOT EXISTS lab_coat_stock (
  id SERIAL PRIMARY KEY,
  size VARCHAR(10) NOT NULL,
  gender VARCHAR(10) NOT NULL,
  quantity_in_stock INTEGER,
  entity_id INTEGER REFERENCES entities(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(size, gender, entity_id)
);

-- Password vault
CREATE TABLE IF NOT EXISTS password_vault (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  title VARCHAR(255),
  username VARCHAR(255),
  encrypted_password TEXT,
  url TEXT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Turnover data
CREATE TABLE IF NOT EXISTS turnover_records (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  employee_name VARCHAR(255),
  position VARCHAR(100),
  department VARCHAR(100),
  hire_date DATE,
  termination_date DATE,
  reason VARCHAR(100),
  voluntary BOOLEAN,
  entity_id INTEGER REFERENCES entities(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Audit log
CREATE TABLE IF NOT EXISTS audit_logs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  action VARCHAR(255),
  entity_type VARCHAR(100),
  entity_id INTEGER,
  details JSONB,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_entity_id ON users(entity_id);
CREATE INDEX idx_users_office_id ON users(office_id);
CREATE INDEX idx_equipment_assigned_to ON equipment(assigned_to);
CREATE INDEX idx_equipment_serial ON equipment(serial_number);
CREATE INDEX idx_equipment_assignments_user ON equipment_assignments(user_id);
CREATE INDEX idx_schedules_user ON schedules(user_id);
CREATE INDEX idx_schedules_facility ON schedules(facility_id);
CREATE INDEX idx_procurement_user ON procurement_orders(user_id);
CREATE INDEX idx_audit_user ON audit_logs(user_id);
`;
