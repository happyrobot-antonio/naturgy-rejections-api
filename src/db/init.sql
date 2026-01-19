-- Naturgy Rejections Database Schema

-- Drop tables if they exist (for development)
DROP TABLE IF EXISTS case_events CASCADE;
DROP TABLE IF EXISTS rejection_cases CASCADE;

-- Create rejection_cases table
CREATE TABLE IF NOT EXISTS rejection_cases (
  id SERIAL PRIMARY KEY,
  codigo_sc VARCHAR(255) UNIQUE NOT NULL,
  
  -- Client Information
  dni_cif VARCHAR(255) NOT NULL,
  nombre_apellidos VARCHAR(255) NOT NULL,
  
  -- Contract Information
  cups VARCHAR(255) NOT NULL,
  contrato_nc VARCHAR(255) NOT NULL,
  linea_negocio VARCHAR(255) NOT NULL,
  
  -- Address Information
  direccion_completa TEXT NOT NULL,
  codigo_postal VARCHAR(10) NOT NULL,
  municipio VARCHAR(255) NOT NULL,
  provincia VARCHAR(255) NOT NULL,
  ccaa VARCHAR(255) NOT NULL,
  
  -- Distribution Information
  distribuidora VARCHAR(255) NOT NULL,
  grupo_distribuidora VARCHAR(255) NOT NULL,
  
  -- Contact Information
  email_contacto VARCHAR(255) NOT NULL,
  telefono_contacto VARCHAR(50) NOT NULL,
  
  -- Process Information
  proceso VARCHAR(255) NOT NULL,
  potencia_actual VARCHAR(50),
  potencia_solicitada VARCHAR(50),
  
  -- Status
  status VARCHAR(50) DEFAULT 'In progress' NOT NULL,
  
  -- Email
  email_thread_id VARCHAR(255),
  fecha_primer_contacto TIMESTAMP NOT NULL,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Create case_events table
CREATE TABLE IF NOT EXISTS case_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id VARCHAR(255) NOT NULL REFERENCES rejection_cases(codigo_sc) ON DELETE CASCADE,
  
  -- Event type
  type VARCHAR(100) NOT NULL,
  
  -- Event details
  description TEXT NOT NULL,
  metadata JSONB,
  
  -- Timestamp
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_rejection_cases_codigo_sc ON rejection_cases(codigo_sc);
CREATE INDEX IF NOT EXISTS idx_rejection_cases_status ON rejection_cases(status);
CREATE INDEX IF NOT EXISTS idx_rejection_cases_created_at ON rejection_cases(created_at);
CREATE INDEX IF NOT EXISTS idx_case_events_case_id ON case_events(case_id);
CREATE INDEX IF NOT EXISTS idx_case_events_timestamp ON case_events(timestamp);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_rejection_cases_updated_at ON rejection_cases;
CREATE TRIGGER update_rejection_cases_updated_at
    BEFORE UPDATE ON rejection_cases
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Success message
SELECT 'Database schema initialized successfully!' AS message;
