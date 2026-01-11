-- Add workflow column to lessons table for storing workflow plans (n8n-like structure)
ALTER TABLE lessons 
ADD COLUMN IF NOT EXISTS workflow JSONB;

-- Add comment
COMMENT ON COLUMN lessons.workflow IS 'Stores the workflow plan structure with nodes, edges, and visual layout (n8n-like builder)';

