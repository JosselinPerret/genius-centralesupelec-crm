-- Drop the old enum and create new one with updated statuses
ALTER TYPE company_status RENAME TO company_status_old;

CREATE TYPE company_status AS ENUM (
  'NOT_TO_CONTACT',
  'TO_CONTACT', 
  'CONTACTED',
  'FIRST_FOLLOWUP',
  'SECOND_FOLLOWUP',
  'THIRD_FOLLOWUP',
  'IN_DISCUSSION',
  'COMING',
  'NOT_COMING',
  'NEXT_YEAR'
);

-- Update the companies table to use the new enum
ALTER TABLE companies 
  ALTER COLUMN status DROP DEFAULT,
  ALTER COLUMN status TYPE company_status USING 
    CASE status::text
      WHEN 'PROSPECT' THEN 'TO_CONTACT'::company_status
      WHEN 'ACTIVE' THEN 'IN_DISCUSSION'::company_status
      WHEN 'INACTIVE' THEN 'NOT_COMING'::company_status
      WHEN 'FORMER' THEN 'NEXT_YEAR'::company_status
      ELSE 'TO_CONTACT'::company_status
    END,
  ALTER COLUMN status SET DEFAULT 'TO_CONTACT'::company_status;

-- Drop the old enum
DROP TYPE company_status_old;