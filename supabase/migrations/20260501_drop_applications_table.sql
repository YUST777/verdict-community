-- 1. Add missing columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS student_id_encrypted text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS student_id_blind_index text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS national_id_encrypted text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS national_id_blind_index text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS telephone_encrypted text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS telephone_blind_index text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS faculty text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS student_level text;

-- 2. Migrate data from applications to users
UPDATE users u
SET 
    faculty = a.faculty,
    student_level = a.student_level,
    student_id_encrypted = a.student_id,
    student_id_blind_index = a.student_id_blind_index,
    national_id_encrypted = a.national_id,
    national_id_blind_index = a.national_id_blind_index,
    telephone_encrypted = a.telephone,
    telephone_blind_index = a.telephone_blind_index
FROM applications a
WHERE u.application_id = a.id;

-- 3. Drop application_id from users
ALTER TABLE users DROP COLUMN IF EXISTS application_id;

-- 4. Drop applications table (CASCADE to drop related policies/views)
DROP TABLE IF EXISTS applications CASCADE;
