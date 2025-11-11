-- =====================================================
-- BellsPretty API - Complete Database Schema v2.0
-- Date: 2025-11-10
-- Description: Multi-tenant salon management system
-- =====================================================

-- =====================================================
-- TABLE: users
-- Description: All system users (owners, admins, workers, clients)
-- =====================================================

CREATE TABLE users (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    global_role VARCHAR(20) DEFAULT 'user' CHECK(global_role IN ('super_admin', 'user')),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_global_role ON users(global_role);
CREATE INDEX idx_users_active ON users(is_active);

-- =====================================================
-- TABLE: roles
-- Description: User roles within salons (RBAC)
-- =====================================================

CREATE TABLE roles (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed default roles
INSERT INTO roles (id, name, description) VALUES
('role-owner-uuid', 'owner', 'Salon owner with full access'),
('role-admin-uuid', 'admin', 'Administrator with management access'),
('role-worker-uuid', 'worker', 'Worker/Professional who provides services'),
('role-client-uuid', 'client', 'Customer who books appointments');

-- =====================================================
-- TABLE: salons
-- Description: Beauty salons/establishments
-- =====================================================

CREATE TABLE salons (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    address TEXT,
    phone VARCHAR(20),
    email VARCHAR(255),
    business_hours JSON,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX idx_salons_slug ON salons(slug);
CREATE INDEX idx_salons_active ON salons(is_active);

-- =====================================================
-- TABLE: user_salon_roles
-- Description: Pivot table connecting users to salons with specific roles
-- =====================================================

CREATE TABLE user_salon_roles (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    salon_id VARCHAR(36) NOT NULL,
    role_id VARCHAR(36) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (salon_id) REFERENCES salons(id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE RESTRICT,
    
    UNIQUE(user_id, salon_id, role_id)
);

CREATE INDEX idx_usr_user_salon ON user_salon_roles(user_id, salon_id);
CREATE INDEX idx_usr_salon_role ON user_salon_roles(salon_id, role_id);


-- =====================================================
-- TABLE: permissions
-- Description: Granular permissions for RBAC
-- =====================================================

CREATE TABLE permissions (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(150) UNIQUE NOT NULL,
    description TEXT,
    scope VARCHAR(20) DEFAULT 'salon' CHECK(scope IN ('global', 'salon')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_permissions_name ON permissions(name);
CREATE INDEX idx_permissions_scope ON permissions(scope);

-- =====================================================
-- TABLE: role_permissions
-- Description: Pivot table connecting roles to permissions
-- =====================================================

CREATE TABLE role_permissions (
    id VARCHAR(36) PRIMARY KEY,
    role_id VARCHAR(36) NOT NULL,
    permission_id VARCHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE,
    
    UNIQUE(role_id, permission_id)
);

CREATE INDEX idx_role_permissions_role ON role_permissions(role_id);
CREATE INDEX idx_role_permissions_permission ON role_permissions(permission_id);

-- =====================================================
-- TABLE: services
-- Description: Services offered by each salon
-- =====================================================

CREATE TABLE services (
    id VARCHAR(36) PRIMARY KEY,
    salon_id VARCHAR(36) NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    duration_minutes INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (salon_id) REFERENCES salons(id) ON DELETE CASCADE
);

CREATE INDEX idx_services_salon ON services(salon_id);
CREATE INDEX idx_services_active ON services(is_active);

-- =====================================================
-- TABLE: service_roles
-- Description: Which roles (worker types) are qualified to perform each service
-- =====================================================

CREATE TABLE service_roles (
    id VARCHAR(36) PRIMARY KEY,
    service_id VARCHAR(36) NOT NULL,
    role_id VARCHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE RESTRICT,

    UNIQUE(service_id, role_id)
);

CREATE INDEX idx_service_roles_service ON service_roles(service_id);
CREATE INDEX idx_service_roles_role ON service_roles(role_id);

-- =====================================================
-- TABLE: products
-- Description: Products sold or used by each salon
-- =====================================================

CREATE TABLE products (
    id VARCHAR(36) PRIMARY KEY,
    salon_id VARCHAR(36) NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    brand VARCHAR(50),
    price DECIMAL(10,2) NOT NULL,
    stock_quantity INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (salon_id) REFERENCES salons(id) ON DELETE CASCADE
);

CREATE INDEX idx_products_salon ON products(salon_id);
CREATE INDEX idx_products_active ON products(is_active);

-- =====================================================
-- TABLE: appointments
-- Description: Service appointments/bookings
-- =====================================================

CREATE TABLE appointments (
    id VARCHAR(36) PRIMARY KEY,
    salon_id VARCHAR(36) NOT NULL,
    client_id VARCHAR(36) NOT NULL,
    worker_id VARCHAR(36),
    scheduled_at DATETIME NOT NULL,
    total_duration_minutes INTEGER NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'scheduled' 
        CHECK(status IN ('scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled')),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (salon_id) REFERENCES salons(id) ON DELETE CASCADE,
    FOREIGN KEY (client_id) REFERENCES users(id) ON DELETE RESTRICT,
    FOREIGN KEY (worker_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_appointments_salon_date ON appointments(salon_id, scheduled_at);
CREATE INDEX idx_appointments_client ON appointments(client_id);
CREATE INDEX idx_appointments_worker ON appointments(worker_id);
CREATE INDEX idx_appointments_status ON appointments(status);

-- =====================================================
-- TABLE: appointment_services
-- Description: Services included in each appointment
-- =====================================================

CREATE TABLE appointment_services (
    id VARCHAR(36) PRIMARY KEY,
    appointment_id VARCHAR(36) NOT NULL,
    service_id VARCHAR(36) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    duration_minutes INTEGER NOT NULL,
    
    FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE CASCADE,
    FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE RESTRICT
);

CREATE INDEX idx_appt_services_appointment ON appointment_services(appointment_id);
CREATE INDEX idx_appt_services_service ON appointment_services(service_id);

-- =====================================================
-- TABLE: appointment_products
-- Description: Products used/sold in appointments
-- =====================================================

CREATE TABLE appointment_products (
    id VARCHAR(36) PRIMARY KEY,
    appointment_id VARCHAR(36) NOT NULL,
    product_id VARCHAR(36) NOT NULL,
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    
    FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT
);

CREATE INDEX idx_appt_products_appointment ON appointment_products(appointment_id);
CREATE INDEX idx_appt_products_product ON appointment_products(product_id);

-- =====================================================
-- TABLE: messages
-- Description: Message history (WhatsApp, Email, SMS, Messenger)
-- =====================================================

CREATE TABLE messages (
    id VARCHAR(36) PRIMARY KEY,
    salon_id VARCHAR(36) NOT NULL,
    recipient_id VARCHAR(36) NOT NULL,
    recipient_email VARCHAR(255),
    recipient_phone VARCHAR(20),
    type VARCHAR(20) NOT NULL CHECK(type IN ('whatsapp', 'email', 'sms', 'messenger')),
    subject VARCHAR(255),
    content TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' 
        CHECK(status IN ('pending', 'sent', 'delivered', 'failed')),
    metadata JSON,
    scheduled_for DATETIME,
    sent_at DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (salon_id) REFERENCES salons(id) ON DELETE CASCADE,
    FOREIGN KEY (recipient_id) REFERENCES users(id) ON DELETE RESTRICT
);

CREATE INDEX idx_messages_status ON messages(status);
CREATE INDEX idx_messages_scheduled ON messages(scheduled_for);
CREATE INDEX idx_messages_salon_recipient ON messages(salon_id, recipient_id);
CREATE INDEX idx_messages_type ON messages(type);

-- =====================================================
-- TABLE: refresh_tokens
-- Description: JWT refresh tokens for authentication
-- =====================================================

CREATE TABLE refresh_tokens (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    token TEXT UNIQUE NOT NULL,
    expires_at DATETIME NOT NULL,
    is_revoked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_refresh_tokens_user ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_expires ON refresh_tokens(expires_at);

-- =====================================================
-- VIEWS
-- =====================================================

CREATE VIEW v_user_salons AS
SELECT 
    u.id as user_id,
    u.name as user_name,
    u.email as user_email,
    s.id as salon_id,
    s.name as salon_name,
    r.name as role_name,
        u.is_active as is_active_in_salon
FROM users u
JOIN user_salon_roles usr ON usr.user_id = u.id
JOIN salons s ON s.id = usr.salon_id
JOIN roles r ON r.id = usr.role_id
WHERE u.is_active = TRUE 
  AND s.is_active = TRUE
  AND u.is_active = TRUE;

CREATE VIEW v_appointment_summary AS
SELECT 
    a.id,
    a.scheduled_at,
    a.status,
    s.name as salon_name,
    c.name as client_name,
    c.email as client_email,
    c.phone as client_phone,
    w.name as worker_name,
    a.total_price,
    a.total_duration_minutes,
    GROUP_CONCAT(DISTINCT serv.name) as services,
    COUNT(DISTINCT aps.id) as service_count
FROM appointments a
JOIN salons s ON s.id = a.salon_id
JOIN users c ON c.id = a.client_id
LEFT JOIN users w ON w.id = a.worker_id
LEFT JOIN appointment_services aps ON aps.appointment_id = a.id
LEFT JOIN services serv ON serv.id = aps.service_id
GROUP BY a.id;


-- WHERE usr.user_id = 'USER_ID' AND r.name = 'owner' AND u.is_active = TRUE;

-- Client history at specific salon
-- SELECT * FROM v_appointment_summary
-- WHERE client_email = 'CLIENT_EMAIL' AND salon_name = 'SALON_NAME'
-- ORDER BY scheduled_at DESC;

-- Pending messages to send
-- SELECT m.*, u.name, u.email, u.phone
-- FROM messages m
-- JOIN users u ON u.id = m.recipient_id
-- WHERE m.status = 'pending'
--   AND (m.scheduled_for IS NULL OR m.scheduled_for <= datetime('now'));

-- Worker's appointments for today
-- SELECT * FROM v_appointment_summary
-- WHERE worker_name = 'WORKER_NAME'
--   AND DATE(scheduled_at) = DATE('now')
--   AND status IN ('scheduled', 'confirmed')
-- ORDER BY scheduled_at;

-- Salon revenue by period
-- SELECT 
--     DATE(a.scheduled_at) as date,
--     SUM(a.total_price) as revenue,
--     COUNT(*) as appointments
-- FROM appointments a
-- WHERE a.salon_id = 'SALON_ID'
--   AND a.status = 'completed'
--   AND a.scheduled_at BETWEEN 'START_DATE' AND 'END_DATE'
-- GROUP BY DATE(a.scheduled_at)
-- ORDER BY date DESC;

-- =====================================================
-- TRIGGERS (SQLite)
-- =====================================================

-- Update updated_at timestamp automatically
CREATE TRIGGER trg_users_updated_at
AFTER UPDATE ON users
FOR EACH ROW
BEGIN
    UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER trg_salons_updated_at
AFTER UPDATE ON salons
FOR EACH ROW
BEGIN
    UPDATE salons SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER trg_services_updated_at
AFTER UPDATE ON services
FOR EACH ROW
BEGIN
    UPDATE services SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER trg_products_updated_at
AFTER UPDATE ON products
FOR EACH ROW
BEGIN
    UPDATE products SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER trg_appointments_updated_at
AFTER UPDATE ON appointments
FOR EACH ROW
BEGIN
    UPDATE appointments SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- =====================================================
-- SEED DATA (Optional - for development)
-- =====================================================

-- Super admin user (password: admin123)
-- INSERT INTO users (id, name, email, password, global_role) VALUES
-- ('super-admin-uuid', 'Super Admin', 'admin@bellspretty.com', '$2b$10$YourHashedPasswordHere', 'super_admin');

-- Sample salon
-- INSERT INTO salons (id, name, slug, description, address, phone, email) VALUES
-- ('salon-1-uuid', 'Bella Studio', 'bella-studio', 'Premium beauty salon', 'Rua Example, 123', '+5511999999999', 'contact@bellastudio.com');

-- =====================================================
-- END OF SCHEMA
-- =====================================================
