require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'elovate_dev_secret_key_change_in_prod';

// ─── Database Pool ────────────────────────────────────────────────────────────
const dbUrl = process.env.DATABASE_URL || 'postgres://postgres:password123@localhost:5432/elovate';

const pool = new Pool({
  connectionString: String(dbUrl),
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

pool.on('connect', () => console.log('[db] PostgreSQL connection established'));
pool.on('error', (err) => console.error('[db] Unexpected client error', err));

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));
app.use(express.json());

// ─── Auth Middleware ──────────────────────────────────────────────────────────
function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authorization required' });
  }
  const token = header.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

// ─── Helper: Generate user ID ─────────────────────────────────────────────────
function generateUserId(name) {
  const clean = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  return `user-${clean}-${Date.now().toString(36)}`;
}

// =============================================================================
// AUTH ROUTES
// =============================================================================

// POST /api/auth/register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { fullName, email, password, role, title, bio, company, linkedinUrl, certificateName } = req.body;

    if (!fullName || !email || !password || !role) {
      return res.status(400).json({ error: 'Full name, email, password, and role are required.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    }

    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email.toLowerCase().trim()]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const userId = generateUserId(fullName);
    const startElo = 1200;
    const eloTier = 'Novice';

    const result = await pool.query(
      `INSERT INTO users (id, full_name, email, password_hash, role, title, bio, company, linkedin_url, certificate_name, elo_rating, elo_tier, is_mentor)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
       RETURNING id, full_name, email, role, title, bio, company, linkedin_url, certificate_name, elo_rating, elo_tier, is_mentor, created_at`,
      [
        userId, 
        fullName.trim(), 
        email.toLowerCase().trim(), 
        passwordHash, 
        role.toLowerCase(), 
        title || (role.toLowerCase() === 'recruiter' ? 'Talent Partner' : 'Software Engineer'), 
        bio || '', 
        company || null, 
        linkedinUrl || null, 
        certificateName || null, 
        startElo, 
        eloTier, 
        false
      ]
    );

    const user = result.rows[0];
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });

    return res.status(201).json({
      token,
      user: {
        id: user.id,
        fullName: user.full_name,
        email: user.email,
        role: user.role,
        title: user.title,
        bio: user.bio,
        company: user.company,
        linkedinUrl: user.linkedin_url,
        certificateName: user.certificate_name,
        eloRating: user.elo_rating,
        eloTier: user.elo_tier,
        isMentor: user.is_mentor,
        verifiedBadges: [],
        githubAudits: [],
        endorsements: [],
      }
    });
  } catch (err) {
    console.error('[register]', err);
    return res.status(500).json({ error: 'Registration failed. Please try again.' });
  }
});

// POST /api/auth/login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const result = await pool.query(
      `SELECT * FROM users WHERE email = $1`,
      [email.toLowerCase().trim()]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const user = result.rows[0];
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });

    return res.json({
      token,
      user: {
        id: user.id,
        fullName: user.full_name,
        email: user.email,
        role: user.role,
        title: user.title,
        bio: user.bio,
        company: user.company,
        linkedinUrl: user.linkedin_url,
        certificateName: user.certificate_name,
        eloRating: user.elo_rating,
        eloTier: user.elo_tier,
        isMentor: user.is_mentor,
        mentorBio: user.mentor_bio,
        mentorSkills: user.mentor_skills || [],
        verifiedBadges: [],
        githubAudits: [],
        endorsements: [],
      }
    });
  } catch (err) {
    console.error('[login]', err);
    return res.status(500).json({ error: 'Login failed. Please try again.' });
  }
});

// GET /api/auth/me
app.get('/api/auth/me', requireAuth, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [req.userId]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'User not found' });
    const u = result.rows[0];
    return res.json({
      id: u.id, fullName: u.full_name, email: u.email, role: u.role,
      title: u.title, bio: u.bio, company: u.company, linkedinUrl: u.linkedin_url, certificateName: u.certificate_name,
      eloRating: u.elo_rating, eloTier: u.elo_tier,
      isMentor: u.is_mentor, mentorBio: u.mentor_bio, mentorSkills: u.mentor_skills || [],
      verifiedBadges: [], githubAudits: [], endorsements: [],
    });
  } catch (err) {
    console.error('[me]', err);
    return res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// =============================================================================
// USER ROUTES
// =============================================================================

// GET /api/users - Fetch all users from the database
app.get('/api/users', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        id, 
        full_name AS "fullName", 
        email, 
        role, 
        title, 
        bio, 
        company, 
        linkedin_url AS "linkedinUrl", 
        certificate_name AS "certificateName",
        elo_rating AS "eloRating", 
        elo_tier AS "eloTier", 
        is_mentor AS "isMentor",
        mentor_bio AS "mentorBio",
        mentor_skills AS "mentorSkills"
      FROM users 
      ORDER BY created_at DESC
    `);
    return res.json(result.rows);
  } catch (err) {
    console.error('[getUsers]', err);
    return res.status(500).json({ error: 'Failed to fetch users from database.' });
  }
});

// =============================================================================
// HEALTH CHECK
// =============================================================================
app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    return res.json({ status: 'ok', db: 'connected', timestamp: new Date().toISOString() });
  } catch {
    return res.status(503).json({ status: 'error', db: 'disconnected' });
  }
});

// ─── Start Server ─────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n  EloVate API Server running on http://localhost:${PORT}`);
  console.log(`  Health check: http://localhost:${PORT}/api/health\n`);
});
