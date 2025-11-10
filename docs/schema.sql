-- =====================================================
-- BellsPretty API - Database Schema
-- Versão: 1.0.0
-- Data: 2025-11-10
-- Descrição: Schema completo do banco de dados
-- =====================================================

-- =====================================================
-- TABELA: users
-- Descrição: Armazena informações dos usuários do sistema
-- =====================================================

CREATE TABLE users (
    -- Identificação
    id VARCHAR(36) PRIMARY KEY,  -- UUID gerado automaticamente
    
    -- Dados pessoais
    name VARCHAR(100) NOT NULL,  -- Nome completo do usuário
    email VARCHAR(255) UNIQUE NOT NULL,  -- Email único para login
    
    -- Segurança
    password VARCHAR(255) NOT NULL,  -- Senha criptografada com bcrypt
    
    -- Status
    isActive BOOLEAN DEFAULT TRUE,  -- Usuário ativo no sistema
    
    -- Auditoria
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para performance
CREATE UNIQUE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_active ON users(isActive);

-- =====================================================
-- TABELA: refresh_tokens
-- Descrição: Armazena refresh tokens JWT para autenticação
-- =====================================================

CREATE TABLE refresh_tokens (
    -- Identificação
    id VARCHAR(36) PRIMARY KEY,  -- UUID gerado automaticamente
    
    -- Token
    token TEXT NOT NULL,  -- String do JWT refresh token
    
    -- Relacionamento
    userId VARCHAR(36) NOT NULL,  -- FK para users.id
    
    -- Validade
    expiresAt DATETIME NOT NULL,  -- Data/hora de expiração
    isRevoked BOOLEAN DEFAULT FALSE,  -- Token foi revogado (logout)
    
    -- Auditoria
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign Key
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

-- Índices para performance
CREATE INDEX idx_refresh_tokens_token ON refresh_tokens(token);
CREATE INDEX idx_refresh_tokens_userId ON refresh_tokens(userId);
CREATE INDEX idx_refresh_tokens_expires ON refresh_tokens(expiresAt);

-- =====================================================
-- VIEWS ÚTEIS
-- =====================================================

-- View: Usuários ativos com contagem de tokens
CREATE VIEW v_users_with_token_count AS
SELECT 
    u.id,
    u.name,
    u.email,
    u.isActive,
    u.createdAt,
    COUNT(rt.id) as total_tokens,
    SUM(CASE WHEN rt.isRevoked = FALSE AND rt.expiresAt > datetime('now') THEN 1 ELSE 0 END) as active_tokens
FROM users u
LEFT JOIN refresh_tokens rt ON rt.userId = u.id
GROUP BY u.id, u.name, u.email, u.isActive, u.createdAt;

-- =====================================================
-- DADOS DE EXEMPLO (OPCIONAL - APENAS DESENVOLVIMENTO)
-- =====================================================

-- NOTA: Senha é "senha123" criptografada com bcrypt
-- INSERT INTO users (id, name, email, password, isActive) VALUES
-- ('550e8400-e29b-41d4-a716-446655440000', 'João Silva', 'joao@example.com', '$2b$10$YourHashedPasswordHere', TRUE),
-- ('550e8400-e29b-41d4-a716-446655440001', 'Maria Santos', 'maria@example.com', '$2b$10$YourHashedPasswordHere', TRUE);

-- =====================================================
-- MANUTENÇÃO E LIMPEZA
-- =====================================================

-- Query para limpar tokens expirados há mais de 30 dias
-- DELETE FROM refresh_tokens
-- WHERE expiresAt < datetime('now', '-30 days');

-- Query para revogar todos os tokens de um usuário
-- UPDATE refresh_tokens 
-- SET isRevoked = TRUE 
-- WHERE userId = 'USER_ID_HERE';

-- =====================================================
-- QUERIES DE MONITORAMENTO
-- =====================================================

-- Total de usuários ativos
-- SELECT COUNT(*) as total_active_users FROM users WHERE isActive = TRUE;

-- Tokens ativos no sistema
-- SELECT COUNT(*) as active_tokens 
-- FROM refresh_tokens 
-- WHERE isRevoked = FALSE AND expiresAt > datetime('now');

-- Usuários sem tokens válidos
-- SELECT u.id, u.name, u.email
-- FROM users u
-- LEFT JOIN refresh_tokens rt ON rt.userId = u.id 
--     AND rt.isRevoked = FALSE 
--     AND rt.expiresAt > datetime('now')
-- WHERE rt.id IS NULL;

-- =====================================================
-- PERFORMANCE E OTIMIZAÇÃO
-- =====================================================

-- Análise de uso de índices (SQLite)
-- SELECT * FROM sqlite_stat1;

-- Vacuum e otimização do banco
-- VACUUM;
-- ANALYZE;

-- =====================================================
-- SEGURANÇA
-- =====================================================

-- IMPORTANTE:
-- 1. Nunca retorne o campo 'password' em queries de API
-- 2. Use prepared statements para prevenir SQL injection
-- 3. Implemente rate limiting para prevenir força bruta
-- 4. Rotate refresh tokens regularmente
-- 5. Monitore tentativas de login falhas

-- =====================================================
-- BACKUP E RESTORE
-- =====================================================

-- Backup (SQLite)
-- .backup backup_file.db

-- Restore (SQLite)
-- .restore backup_file.db

-- Export para SQL
-- .output backup.sql
-- .dump

-- =====================================================
-- VERSIONING
-- =====================================================

-- Para rastrear versão do schema, criar tabela de migrations:
-- CREATE TABLE migrations (
--     id INTEGER PRIMARY KEY AUTOINCREMENT,
--     name VARCHAR(255) NOT NULL,
--     executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
-- );

-- =====================================================
-- FIM DO SCHEMA
-- =====================================================
