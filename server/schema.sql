-- =============================================================================
-- EloVate Platform Database Schema (PostgreSQL)
-- =============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(64) PRIMARY KEY,
    full_name VARCHAR(128) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(32) NOT NULL DEFAULT 'candidate' CHECK (role IN ('candidate', 'recruiter', 'admin')),
    title VARCHAR(255) DEFAULT 'Software Engineer',
    bio TEXT DEFAULT '',
    company VARCHAR(128),
    github_username VARCHAR(128),
    elo_rating INT NOT NULL DEFAULT 1200,
    elo_tier VARCHAR(32) NOT NULL DEFAULT 'Novice',
    is_mentor BOOLEAN NOT NULL DEFAULT FALSE,
    mentor_bio TEXT,
    mentor_skills TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_elo ON users(elo_rating DESC);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- 3. SKILLS DOMAINS TABLE
CREATE TABLE IF NOT EXISTS skills (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(128) NOT NULL,
    category VARCHAR(64) NOT NULL,
    icon VARCHAR(64) DEFAULT 'Code',
    color VARCHAR(128) DEFAULT 'from-blue-500 to-indigo-600',
    description TEXT,
    base_elo INT NOT NULL DEFAULT 1200,
    questions_count INT NOT NULL DEFAULT 15,
    tags TEXT[]
);

-- 4. ASSESSMENT QUESTIONS TABLE
CREATE TABLE IF NOT EXISTS questions (
    id VARCHAR(64) PRIMARY KEY,
    skill_id VARCHAR(64) NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    question_type VARCHAR(32) NOT NULL DEFAULT 'mcq',
    options JSONB NOT NULL,
    correct_index INT NOT NULL,
    explanation TEXT
);

CREATE INDEX IF NOT EXISTS idx_questions_skill ON questions(skill_id);

-- 5. VERIFIED BADGES TABLE
CREATE TABLE IF NOT EXISTS verified_badges (
    id VARCHAR(64) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    skill_id VARCHAR(64) NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
    skill_name VARCHAR(128) NOT NULL,
    tier VARCHAR(32) NOT NULL CHECK (tier IN ('gold', 'silver', 'bronze')),
    score INT NOT NULL,
    elo_delta INT NOT NULL DEFAULT 0,
    integrity_score INT NOT NULL DEFAULT 100,
    verified_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_badges_user ON verified_badges(user_id);

-- 6. GITHUB AUTHENTIC AUDITS TABLE
CREATE TABLE IF NOT EXISTS github_audits (
    id VARCHAR(64) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    repo_name VARCHAR(255) NOT NULL,
    repo_url VARCHAR(512) NOT NULL,
    language VARCHAR(64),
    commits INT NOT NULL DEFAULT 0,
    authorship_ratio INT NOT NULL DEFAULT 100,
    elo_bonus INT NOT NULL DEFAULT 80,
    authenticity_rating VARCHAR(32) NOT NULL DEFAULT 'verified',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audits_user ON github_audits(user_id);

-- 7. TEAMS & SQUADS TABLE
CREATE TABLE IF NOT EXISTS teams (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(128) NOT NULL,
    hackathon_track VARCHAR(128) NOT NULL,
    tagline VARCHAR(255) NOT NULL,
    lead_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    members_count INT NOT NULL DEFAULT 1,
    max_members INT NOT NULL DEFAULT 4,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. TEAM VACANCY SLOTS TABLE
CREATE TABLE IF NOT EXISTS team_slots (
    id VARCHAR(64) PRIMARY KEY,
    team_id VARCHAR(64) NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    title VARCHAR(128) NOT NULL,
    required_skill_id VARCHAR(64) REFERENCES skills(id) ON DELETE SET NULL,
    required_skill_name VARCHAR(128),
    min_elo INT NOT NULL DEFAULT 1200,
    min_tier VARCHAR(32) NOT NULL DEFAULT 'bronze',
    assigned_user_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'filled', 'reserved')),
    challenge_question TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_slots_team ON team_slots(team_id);

-- 9. TEAM APPLICATIONS TABLE
CREATE TABLE IF NOT EXISTS team_applications (
    id VARCHAR(64) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    team_id VARCHAR(64) NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    slot_id VARCHAR(64) NOT NULL REFERENCES team_slots(id) ON DELETE CASCADE,
    applicant_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    challenge_response TEXT NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_apps_team ON team_applications(team_id);
CREATE INDEX IF NOT EXISTS idx_apps_applicant ON team_applications(applicant_id);

-- 10. RECRUITMENT INTERVIEWS TABLE
CREATE TABLE IF NOT EXISTS interviews (
    id VARCHAR(64) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    recruiter_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    candidate_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(128) NOT NULL,
    date VARCHAR(64) NOT NULL,
    time VARCHAR(64) NOT NULL,
    notes TEXT,
    status VARCHAR(32) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_interviews_candidate ON interviews(candidate_id);
CREATE INDEX IF NOT EXISTS idx_interviews_recruiter ON interviews(recruiter_id);

-- 11. MENTORSHIP SESSIONS TABLE
CREATE TABLE IF NOT EXISTS mentorship_sessions (
    id VARCHAR(64) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    mentor_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    candidate_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    topic VARCHAR(255) NOT NULL,
    date VARCHAR(64) NOT NULL,
    time VARCHAR(64) NOT NULL,
    notes TEXT,
    status VARCHAR(32) NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'completed', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_mentorship_candidate ON mentorship_sessions(candidate_id);
CREATE INDEX IF NOT EXISTS idx_mentorship_mentor ON mentorship_sessions(mentor_id);

-- 12. USER NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS notifications (
    id VARCHAR(64) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    notif_type VARCHAR(64) NOT NULL,
    link_tab VARCHAR(64),
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifs_user ON notifications(user_id);

-- =============================================================================
-- INITIAL SEED DATA
-- =============================================================================

-- Seed default skills
INSERT INTO skills (id, name, category, icon, color, description, base_elo, questions_count, tags)
VALUES
  ('skill-frontend', 'Frontend Engineering', 'frontend', 'Layout', 'from-blue-500 to-indigo-600', 'React, component lifecycle, virtual DOM, Tailwind CSS, performance optimization, state management.', 1200, 15, ARRAY['React', 'TypeScript', 'Tailwind', 'Next.js']),
  ('skill-backend', 'Backend Architecture', 'backend', 'Server', 'from-emerald-500 to-teal-600', 'REST & GraphQL APIs, Node.js, database schema design, indexing, caching, authentication.', 1200, 15, ARRAY['Node.js', 'PostgreSQL', 'Redis', 'Auth']),
  ('skill-dsa', 'Data Structures & Algorithms', 'dsa', 'Cpu', 'from-amber-500 to-orange-600', 'Algorithmic efficiency, Big-O, tree & graph traversals, dynamic programming, space complexity.', 1200, 15, ARRAY['Trees', 'Graphs', 'DP', 'Time Complexity']),
  ('skill-design', 'UI/UX & Product Design', 'design', 'Palette', 'from-pink-500 to-rose-600', 'Visual hierarchy, accessibility standards (WCAG), wireframing, typography, interaction design.', 1200, 15, ARRAY['Figma', 'WCAG', 'Design Systems', 'UX'])
ON CONFLICT (id) DO NOTHING;

-- Seed default personas (passwords hashed for 'password123')
INSERT INTO users (id, full_name, email, password_hash, role, title, bio, elo_rating, elo_tier, is_mentor, mentor_bio, mentor_skills)
VALUES
  ('user-harshika', 'Harshika Sharma', 'harshika@elovate.dev', '$2a$10$X8eLqT9tU6QnZ/H2Oq7m9eO0I.zUfM6t4j6L5lQe9kU9yD1G6jSiy', 'candidate', 'Frontend Specialist & React Architect', 'Passionate about high-performance React applications, micro-frontends, and component design systems.', 1540, 'Specialist', false, null, null),
  ('user-eshan', 'Eshan Roy', 'eshan@elovate.dev', '$2a$10$X8eLqT9tU6QnZ/H2Oq7m9eO0I.zUfM6t4j6L5lQe9kU9yD1G6jSiy', 'candidate', 'Fullstack & Backend Engineer', 'Building distributed microservices, Postgres optimization, and scalable APIs.', 1880, 'Expert', true, 'Available to mentor junior backend & distributed systems engineers.', ARRAY['Backend Architecture', 'Distributed Systems', 'PostgreSQL', 'Go']),
  ('user-yajur', 'Yajur Mehta', 'yajur@venturehire.io', '$2a$10$X8eLqT9tU6QnZ/H2Oq7m9eO0I.zUfM6t4j6L5lQe9kU9yD1G6jSiy', 'recruiter', 'Technical Talent Partner @ VentureHire', 'Screening for proven engineering depth without resume fluff. Evaluating verified candidates for top engineering teams.', 2150, 'Grandmaster', true, 'Helping candidates ace technical interviews and navigate the job market.', ARRAY['Career Strategy', 'Interview Prep', 'Resume Review', 'Recruitment'])
ON CONFLICT (id) DO NOTHING;
