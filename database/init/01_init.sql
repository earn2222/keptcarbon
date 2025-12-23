-- Enable PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    province VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create plots table with geometry
CREATE TABLE IF NOT EXISTS plots (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    planting_year INTEGER NOT NULL,
    area_sqm FLOAT DEFAULT 0,
    area_rai FLOAT DEFAULT 0,
    geometry GEOMETRY(POLYGON, 4326),
    notes TEXT,
    status VARCHAR(50) DEFAULT 'pending',
    owner_id INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create carbon_assessments table
CREATE TABLE IF NOT EXISTS carbon_assessments (
    id SERIAL PRIMARY KEY,
    plot_id INTEGER REFERENCES plots(id),
    assessment_year INTEGER NOT NULL,
    tree_age INTEGER NOT NULL,
    biomass_tons FLOAT DEFAULT 0,
    carbon_tons FLOAT DEFAULT 0,
    co2_equivalent_tons FLOAT DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create spatial index
CREATE INDEX IF NOT EXISTS idx_plots_geometry ON plots USING GIST(geometry);

-- Insert sample user
INSERT INTO users (email, hashed_password, name, province)
VALUES ('demo@keptcarbon.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.IJ7J5B.QJ5.5Nm', 'Demo User', 'นครศรีธรรมราช')
ON CONFLICT (email) DO NOTHING;
