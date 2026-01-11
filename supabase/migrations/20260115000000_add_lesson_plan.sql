-- Add plan column to lessons table for storing lesson plans (drag and drop structure)
ALTER TABLE lessons 
ADD COLUMN IF NOT EXISTS plan JSONB;

-- Add comment
COMMENT ON COLUMN lessons.plan IS 'Stores the lesson plan structure with nodes, connections, and visual layout (drag and drop builder)';

