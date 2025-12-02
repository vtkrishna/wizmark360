-- Migration: Add missing columns to wizards_founders table
-- Date: 2025-10-10
-- Description: Sync wizards_founders table with TypeScript schema

ALTER TABLE wizards_founders 
ADD COLUMN IF NOT EXISTS founder_type text DEFAULT 'solo'::text NOT NULL,
ADD COLUMN IF NOT EXISTS industry_experience text,
ADD COLUMN IF NOT EXISTS technical_background boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS startup_stage text DEFAULT 'idea'::text NOT NULL,
ADD COLUMN IF NOT EXISTS goals jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS preferences jsonb DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS completed_studios jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS current_studio text,
ADD COLUMN IF NOT EXISTS journey_progress integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS learning_profile jsonb DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS achievements jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS network_connections jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS credits_balance integer DEFAULT 100,
ADD COLUMN IF NOT EXISTS subscription_tier text DEFAULT 'free'::text,
ADD COLUMN IF NOT EXISTS updated_at timestamp DEFAULT now();

-- Create indexes for commonly queried columns
CREATE INDEX IF NOT EXISTS idx_wizards_founders_stage ON wizards_founders(startup_stage);
CREATE INDEX IF NOT EXISTS idx_wizards_founders_tier ON wizards_founders(subscription_tier);
