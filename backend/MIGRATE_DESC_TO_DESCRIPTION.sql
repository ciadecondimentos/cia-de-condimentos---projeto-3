-- ================================================
-- SCRIPT DE MIGRAÇÃO: desc → description
-- ================================================
-- Execute este script no seu banco PostgreSQL
-- para corrigir a coluna DESC (palavra reservada)
-- ================================================

-- OPÇÃO 1: Se você quer PRESERVAR os dados existentes
-- Renomear a coluna existente
ALTER TABLE products RENAME COLUMN desc TO description;

-- OPÇÃO 2: Se você quer LIMPAR os dados e recriar do zero
-- (Descomente abaixo se escolher esta opção)

-- -- Dropar tabela completamente
-- DROP TABLE IF EXISTS products;

-- -- Recriar com estrutura correta
-- CREATE TABLE IF NOT EXISTS products (
--   id SERIAL PRIMARY KEY,
--   name VARCHAR(255) NOT NULL,
--   category VARCHAR(100) NOT NULL,
--   emoji VARCHAR(10),
--   description TEXT,
--   price DECIMAL(10, 2) NOT NULL,
--   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--   updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
-- );

-- Verificar que a coluna foi renomeada
-- SELECT column_name FROM information_schema.columns WHERE table_name = 'products';
