// index.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

console.log('Starting server debug...');
console.log('Working directory:', process.cwd());
console.log('Node version:', process.version);
console.log('MONGODB_URI present?:', !!process.env.MONGODB_URI);

const app = express();
app.use(express.json());
app.use(cors());

const JWT_SECRET = process.env.JWT_SECRET || 'devsecret';
const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || '').toLowerCase().trim();

// --- Mongo ---
const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error('MONGODB_URI missing in env — server will not attempt connection.');
} else {
  mongoose
    .connect(uri)
    .then(async () => {
      console.log('MongoDB connected ✅');
      await ensureSingleAdmin();
      const PORT = process.env.PORT || 5000;
      app.listen(PORT, () => console.log(`Server listening on ${PORT}`));
    })
    .catch((err) => {
      console.error('MongoDB connection error ❌', err && err.message ? err.message : err);
    });
}

// --- Schemas & Models ---
const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ['student', 'recruiter', 'admin'],
      default: 'student',
      index: true,
    },
    // Students must complete profile; others can skip (default true)
    profileCompleted: {
      type: Boolean,
      default: function () {
        return this.role !== 'student';
      },
    },
    // Keep the submitted profile embedded on the user (ONE profile per user)
    profile: {
      name: String,
      img: String,
      email: String,
      links: {
        website: String,
        linkedin: String,
        github: String,
      },
      jobTitle: String,
      location: {
        city: String,
        state: String,
        country: String,
      },
      skills: [String],       // <-- (a) added
      tracks: [String],       // <-- (a) optional: frontend/backend/ui
      status: String,
    },
  },
  { timestamps: true }
);

const User = mongoose.model('User', userSchema);

// --- Helpers ---
function signToken(user) {
  return jwt.sign(
    { userId: user._id.toString(), email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

function auth(req, res, next) {
  const hdr = req.headers.authorization || '';
  const token = hdr.startsWith('Bearer ') ? hdr.slice(7) : null;
  if (!token) return res.status(401).json({ message: 'Missing token' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid token' });
  }
}

function requireAdmin(req, res, next) {
  if (req.user?.role !== 'admin') return res.status(403).json({ message: 'Admins only' });
  next();
}

/**
 * Ensure ADMIN_EMAIL is the single admin.
 * - Promotes existing ADMIN_EMAIL to admin, or
 * - Creates it with a random password if it doesn't exist.
 */
async function ensureSingleAdmin() {
  if (!ADMIN_EMAIL) {
    console.log('ADMIN_EMAIL not set; skipping admin bootstrap.');
    return;
  }
  const existing = await User.findOne({ email: ADMIN_EMAIL });
  if (existing) {
    if (existing.role !== 'admin') {
      existing.role = 'admin';
      existing.profileCompleted = true; // admins can skip profile
      await existing.save();
      console.log(`Promoted existing user ${ADMIN_EMAIL} to admin.`);
    } else {
      console.log(`Admin user already present: ${ADMIN_EMAIL}`);
    }
    return;
  }
  // Create admin user with random password
  const rawPass = `Admin!${crypto.randomBytes(4).toString('hex')}`;
  const salt = await bcrypt.genSalt(10);
  const hashed = await bcrypt.hash(rawPass, salt);
  const user = await User.create({
    fullName: 'Administrator',
    email: ADMIN_EMAIL,
    password: hashed,
    role: 'admin',
    profileCompleted: true,
  });
  console.log('Created admin user:');
  console.log('  email:', ADMIN_EMAIL);
  console.log('  temp password:', rawPass);
  console.log('  userId:', user._id.toString());
}

// --- Routes ---

// health check
app.get('/', (req, res) => res.send('Server is running'));

// Debug list users (no passwords)
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find({}, { password: 0 }).lean();
    return res.json({ count: users.length, users });
  } catch (err) {
    console.error('GET /api/users error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Current user (from token)
app.get('/api/me', auth, async (req, res) => {
  try {
    const doc = await User.findById(req.user.userId, { password: 0 }).lean();
    if (!doc) return res.status(404).json({ message: 'Not found' });
    return res.json({ user: doc });
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
});

// Example protected admin route
app.get('/api/admin/health', auth, requireAdmin, (req, res) => {
  res.json({ ok: true, who: req.user.email, role: req.user.role });
});

// Register
app.post('/api/register', async (req, res) => {
  console.log('POST /api/register - received body:', req.body);
  try {
    let { fullName, email, password, role } = req.body;
    if (!fullName || !email || !password) {
      console.warn('Register validation failed - missing fields', req.body);
      return res.status(400).json({ message: 'Missing required fields' });
    }
    if (!email.includes('@') || password.length < 8) {
      console.warn('Register validation failed - invalid email/password', { email, passwordLength: password?.length });
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Only allow student or recruiter from client
    role = role === 'recruiter' ? 'recruiter' : 'student';

    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      console.warn('Register attempt with existing email:', email);
      return res.status(409).json({ message: 'Email already in use' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);
    const user = await User.create({
      fullName,
      email: email.toLowerCase().trim(),
      password: hashed,
      role,
      // profileCompleted default is based on role (schema default)
    });

    console.log('User created:', user._id.toString(), 'role:', user.role, 'profileCompleted:', user.profileCompleted);
    const token = signToken(user);

    return res.status(201).json({
      message: 'User created',
      token,
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        profileCompleted: user.profileCompleted,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (err) {
    console.error('Register route error:', err);
    if (err.code === 11000) {
      return res.status(409).json({ message: 'Duplicate key error: email already exists' });
    }
    return res.status(500).json({ message: 'Server error' });
  }
});

// Login
app.post('/api/login', async (req, res) => {
  console.log('>>> Received POST /api/login body:', req.body);
  try {
    const { email, password } = req.body; // desiredRole from client is ignored (security)
    if (!email || !password) {
      return res.status(400).json({ message: 'Missing email or password' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() }).exec();
    if (!user) {
      console.warn('Login failed - user not found:', email);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      console.warn('Login failed - wrong password for:', email);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = signToken(user);
    const safeUser = {
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      profileCompleted: user.profileCompleted,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    console.log('Login success for:', email, 'role:', user.role, 'profileCompleted:', user.profileCompleted);
    return res.json({ message: 'Login success', token, user: safeUser });
  } catch (err) {
    console.error('POST /api/login error:', err && err.message ? err.message : err);
    return res.status(500).json({ message: 'Server error' });
  }
});

/**
 * (b) Profile creation — allowed ONCE per user.
 * Use PUT /api/profile to update later.
 */
app.post('/api/profile', auth, async (req, res) => {
  try {
    const u = await User.findById(req.user.userId);
    if (!u) return res.status(404).json({ message: 'User not found' });

    if (u.profileCompleted) {
      return res.status(409).json({ message: 'Profile already exists. Use PUT /api/profile to update.' });
    }

    // Save normalized profile payload from client
    u.profile = req.body && typeof req.body === 'object' ? req.body : {};
    u.profileCompleted = true;
    await u.save();

    return res.json({
      message: 'Profile created',
      user: {
        _id: u._id,
        profileCompleted: u.profileCompleted,
        profile: u.profile,
      },
    });
  } catch (e) {
    console.error('POST /api/profile error:', e);
    return res.status(500).json({ message: 'Server error' });
  }
});

/**
 * (b) Profile update — safe to call multiple times; does not create duplicates.
 */
app.put('/api/profile', auth, async (req, res) => {
  try {
    const u = await User.findById(req.user.userId);
    if (!u) return res.status(404).json({ message: 'User not found' });

    // merge/replace (simple replace here; change to deep merge if you prefer)
    u.profile = req.body && typeof req.body === 'object' ? req.body : (u.profile || {});
    u.profileCompleted = true;
    await u.save();

    return res.json({
      message: 'Profile updated',
      user: {
        _id: u._id,
        profileCompleted: u.profileCompleted,
        profile: u.profile,
      },
    });
  } catch (e) {
    console.error('PUT /api/profile error:', e);
    return res.status(500).json({ message: 'Server error' });
  }
});

// (Optional) Google login endpoint stub — replace with real verification later
app.post('/api/google-login', async (req, res) => {
  return res.status(501).json({ message: 'google-login not implemented on server' });
});
