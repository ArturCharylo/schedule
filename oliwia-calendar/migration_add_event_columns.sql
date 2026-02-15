-- Add type and color columns to lessons table
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS type text DEFAULT 'class';
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS color text DEFAULT '#3B82F6'; -- Blue-500
