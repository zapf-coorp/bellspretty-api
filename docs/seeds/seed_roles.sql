-- Seed default roles for BellsPretty API (v2.0)
-- Run this manually against your DB if you don't use migrations.

INSERT INTO roles (id, name, description, created_at) VALUES
('role-owner-uuid', 'owner', 'Salon owner with full access', CURRENT_TIMESTAMP),
('role-admin-uuid', 'admin', 'Administrator with management access', CURRENT_TIMESTAMP),
('role-worker-uuid', 'worker', 'Worker/Professional who provides services', CURRENT_TIMESTAMP),
('role-client-uuid', 'client', 'Customer who books appointments', CURRENT_TIMESTAMP);
