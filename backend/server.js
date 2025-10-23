const express = require("express");
const path = require("path");
const crypto = require("crypto");
const { connectDB } = require("./mongoConfig");
const User = require("./models/User");
const Group = require("./models/Group");
const Message = require("./models/Message");
const Todo = require("./models/Todo");
const passport = require("passport");
const flash = require("express-flash");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const { body, validationResult } = require("express-validator");
const { sendVerificationEmail, sendWelcomeEmail } = require("./emailService");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

// ===========================
// PRODUCTION ENVIRONMENT CHECK
// ===========================

// In production, critical environment variables must be set
if (process.env.NODE_ENV === 'production') {
  const requiredEnvVars = ['SESSION_SECRET', 'MONGODB_URI'];
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.error('❌ CRITICAL: Missing required environment variables in production:');
    missingVars.forEach(varName => console.error(`   - ${varName}`));
    console.error('\nPlease set these in your .env file or hosting platform.');
    process.exit(1);
  }
  
  // Warn about email service in production
  if (!process.env.EMAIL_SERVICE) {
    console.warn('⚠️  WARNING: EMAIL_SERVICE not set - verification emails will only be logged to console!');
  }
}

// Initialize MongoDB connection
connectDB();

// ===========================
// SECURITY MIDDLEWARE
// ===========================

// Helmet - Security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// Rate limiting for authentication routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: "Too many authentication attempts, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

// General API rate limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
});

// ===========================
// PASSPORT CONFIGURATION
// ===========================

passport.serializeUser((user, done) => done(null, user._id));
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id).select('-password'); // Don't send password
    done(null, user);
  } catch (error) {
    done(error);
  }
});

// Local strategy with better error handling
const LocalStrategy = require("passport-local").Strategy;
passport.use(new LocalStrategy(
  { usernameField: "email", passwordField: "password" },
  async (email, password, done) => {
    try {
      // Normalize email
      const normalizedEmail = email.toLowerCase().trim();
      
      const user = await User.findOne({ email: normalizedEmail });
      if (!user) {
        return done(null, false, { message: "Invalid email or password" });
      }
      
      const isMatch = await user.comparePassword(password);
      if (isMatch) {
        return done(null, user);
      } else {
        return done(null, false, { message: "Invalid email or password" });
      }
    } catch (error) {
      return done(error);
    }
  }
));

// Auth0 Strategy
const Auth0Strategy = require('passport-auth0');
passport.use(new Auth0Strategy({
    domain: process.env.AUTH0_DOMAIN,
    clientID: process.env.AUTH0_CLIENT_ID,
    clientSecret: process.env.AUTH0_CLIENT_SECRET,
    callbackURL: process.env.AUTH0_CALLBACK_URL,
    state: true
  },
  async (accessToken, refreshToken, extraParams, profile, done) => {
    try {
      console.log('Auth0 profile received:', JSON.stringify(profile, null, 2));
      
      // Extract email from Auth0 profile
      let email;
      if (profile.emails && profile.emails.length > 0) {
        email = profile.emails[0].value;
      } else if (profile._json && profile._json.email) {
        email = profile._json.email;
      } else {
        console.error('No email found in Auth0 profile');
        return done(new Error('Email is required for registration'));
      }
      
      email = email.toLowerCase().trim();
      
      // Check if user exists with this auth0Id
      let user = await User.findOne({ auth0Id: profile.id });
      
      if (user) {
        // User exists, return it
        console.log(`Existing OAuth user logged in: ${user.email}`);
        return done(null, user);
      }
      
      // Check if user exists with this email (from local auth)
      user = await User.findOne({ email });
      
      if (user) {
        // Link OAuth to existing local account
        user.auth0Id = profile.id;
        user.provider = profile.provider;
        user.picture = profile.picture || (profile._json && profile._json.picture);
        user.emailVerified = true; // Auth0/Google verifies emails
        await user.save();
        console.log(`Linked Auth0 to existing user: ${user.email}`);
        return done(null, user);
      }
      
      // Create new user from OAuth
      const displayName = profile.displayName || profile.nickname || (profile._json && profile._json.name) || email.split('@')[0];
      
      const newUser = new User({
        name: displayName,
        email: email,
        auth0Id: profile.id,
        provider: profile.provider,
        picture: profile.picture || (profile._json && profile._json.picture),
        emailVerified: true,
        password: crypto.randomBytes(32).toString('hex') // Random password (won't be used)
      });
      
      await newUser.save();
      console.log(`New OAuth user created: ${newUser.email} via ${profile.provider}`);
      return done(null, newUser);
      
    } catch (error) {
      console.error('Auth0 strategy error:', error);
      console.error('Error stack:', error.stack);
      return done(error);
    }
  }
));

// ===========================
// STANDARD MIDDLEWARE
// ===========================

// Body parsers
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// View engine
app.set("view engine", "ejs");
app.set('views', path.join(__dirname, 'views'));

// Session with MongoDB store (more secure)
// Generate warning if SESSION_SECRET is not set
if (!process.env.SESSION_SECRET && process.env.NODE_ENV !== 'production') {
  console.warn('⚠️  WARNING: SESSION_SECRET not set! Using temporary random secret.');
  console.warn('   For production, set SESSION_SECRET in your .env file.');
  console.warn('   Generate with: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"');
}

app.use(
  session({
    secret: process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex'),
    resave: false,
    saveUninitialized: true, // Changed to true for OAuth flows
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URI || 'mongodb://localhost:27017/faceface_db',
      touchAfter: 24 * 3600, // lazy session update
      crypto: {
        secret: process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex')
      }
    }),
    cookie: {
      maxAge: 1000 * 60 * 60 * 24, // 24 hours
      httpOnly: true, // Prevents client-side JS from reading the cookie
      secure: process.env.NODE_ENV === 'production', // true in production (HTTPS required)
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax' // 'none' needed for OAuth in production
    }
  })
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

// Make user and flash messages available to all templates
app.use((req, res, next) => {
  res.locals.messages = req.flash();
  res.locals.user = req.user || null;
  res.locals.isAuthenticated = req.isAuthenticated();
  next();
});

// ===========================
// VALIDATION MIDDLEWARE
// ===========================

const registerValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters')
    .matches(/^[a-zA-ZäöüÄÖÜß\s-]+$/)
    .withMessage('Name can only contain letters, spaces, and hyphens'),
  
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail()
    .isLength({ max: 100 })
    .withMessage('Email is too long'),
  
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  
  body('password2')
    .custom((value, { req }) => value === req.body.password)
    .withMessage('Passwords do not match')
];

const loginValidation = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

const groupValidation = [
  body('name')
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Group name must be between 3 and 100 characters')
    .escape(),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must be less than 500 characters')
    .escape(),
  
  body('max_teilnehmer')
    .optional()
    .isInt({ min: 2, max: 100 })
    .withMessage('Maximum participants must be between 2 and 100')
];

// ===========================
// AUTHENTICATION MIDDLEWARE
// ===========================

function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect("/dashboard.html");
  }
  next();
}

function checkNotAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  // Save the URL they were trying to access
  req.session.returnTo = req.originalUrl;
  res.redirect("/login.html");
}

// Enhanced error handler
function handleValidationErrors(req, res, templateName, additionalData = {}) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.render(templateName, {
      errors: errors.array(),
      ...req.body,
      ...additionalData
    });
  }
  return null;
}

// ===========================
// PUBLIC ROUTES
// ===========================

// Redirect old routes
app.get("/anmelden", (req, res) => {
  if (req.isAuthenticated()) {
    return res.redirect("/gruppen.html");
  }
  res.redirect("/login.html");
});

// Test route
app.get("/test", (req, res) => {
  res.json({ 
    message: "Server is working!",
    secure: true,
    authenticated: req.isAuthenticated()
  });
});

// ===========================
// AUTHENTICATION ROUTES
// ===========================

app.get("/users/register", checkAuthenticated, (req, res) => {
  // Save return URL from query params if present
  if (req.query.returnTo) {
    req.session.returnTo = req.query.returnTo;
  }
  res.redirect("/register.html");
});

app.get("/users/login", checkAuthenticated, (req, res) => {
  // Save return URL from query params if present
  if (req.query.returnTo) {
    req.session.returnTo = req.query.returnTo;
  }
  res.redirect("/login.html");
});

app.get("/users/dashboard", checkNotAuthenticated, (req, res) => {
  res.redirect("/dashboard.html");
});

// API endpoint to get current user info
app.get("/api/user", (req, res) => {
  if (req.isAuthenticated()) {
    res.json({ 
      id: req.user._id.toString(),
      name: req.user.name,
      email: req.user.email
    });
  } else {
    res.status(401).json({ error: "Not authenticated" });
  }
});

// Get current user's full profile
app.get("/api/profile", checkNotAuthenticated, apiLimiter, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password -verificationToken -resetPasswordToken');
    if (!user) {
      return res.status(404).json({ error: "Benutzer nicht gefunden" });
    }
    res.json(user);
  } catch (error) {
    console.error("Profile fetch error:", error);
    res.status(500).json({ error: "Serverfehler" });
  }
});

// Update current user's profile
app.put("/api/profile", checkNotAuthenticated, apiLimiter, [
  body('studiengang').optional().trim().isLength({ max: 200 }).withMessage('Studiengang zu lang'),
  body('semester').optional().isInt({ min: 1, max: 20 }).withMessage('Semester muss zwischen 1 und 20 liegen'),
  body('module').optional().isArray().withMessage('Module müssen ein Array sein'),
  body('module.*').optional().trim().isLength({ max: 200 }).withMessage('Modulname zu lang')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array()[0].msg });
  }

  try {
    const { studiengang, semester, module } = req.body;
    const updateData = {};
    
    if (studiengang !== undefined) updateData.studiengang = studiengang;
    if (semester !== undefined) updateData.semester = semester;
    if (module !== undefined) updateData.module = module;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password -verificationToken -resetPasswordToken');

    if (!user) {
      return res.status(404).json({ error: "Benutzer nicht gefunden" });
    }

    console.log(`Profile updated for user: ${user.email}`);
    res.json(user);
  } catch (error) {
    console.error("Profile update error:", error);
    res.status(500).json({ error: "Serverfehler beim Update" });
  }
});

// Get another user's public profile (only for authenticated users)
app.get("/api/users/:userId", checkNotAuthenticated, apiLimiter, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select('name email studiengang semester module createdAt');
    if (!user) {
      return res.status(404).json({ error: "Benutzer nicht gefunden" });
    }
    res.json(user);
  } catch (error) {
    console.error("User fetch error:", error);
    res.status(500).json({ error: "Serverfehler" });
  }
});

app.post("/users/register", authLimiter, registerValidation, async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMsg = errors.array().map(e => e.msg).join(', ');
    return res.redirect(`/register.html?error=${encodeURIComponent(errorMsg)}`);
  }

  let { name, email, password } = req.body;
  
  // Normalize data
  name = name.trim();
  email = email.toLowerCase().trim();

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.redirect(`/register.html?error=${encodeURIComponent('Email bereits registriert')}`);
    }

    // Generate 6-digit verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Create new user (password hashing happens in the model)
    const user = new User({
      name,
      email,
      password,
      emailVerified: false,
      verificationToken: verificationCode // Store code in verificationToken field
    });
    
    await user.save();
    console.log(`New user registered: ${email}`);
    
    // Send verification email with code
    try {
      await sendVerificationEmail(email, name, verificationCode);
      console.log(`Verification code sent to: ${email} (Code: ${verificationCode})`);
    } catch (emailError) {
      console.error("Failed to send verification email:", emailError);
      // Continue anyway - user can request resend later
    }
    
    // Redirect to verification code entry page
    return res.redirect(`/verify-code.html?email=${encodeURIComponent(email)}`);
    
  } catch (error) {
    console.error("Registration error:", error);
    res.redirect(`/register.html?error=${encodeURIComponent('Ein Fehler ist aufgetreten. Bitte erneut versuchen.')}`);
  }
});

app.post("/users/login", authLimiter, loginValidation, (req, res, next) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMsg = errors.array().map(e => e.msg).join(', ');
    return res.redirect(`/login.html?error=${encodeURIComponent(errorMsg)}`);
  }

  passport.authenticate("local", (err, user, info) => {
    if (err) {
      console.error("Login error:", err);
      return res.redirect(`/login.html?error=${encodeURIComponent('Ein Fehler ist aufgetreten')}`);
    }
    
    if (!user) {
      return res.redirect(`/login.html?error=${encodeURIComponent(info.message || 'Login fehlgeschlagen')}`);
    }
    
    // Check if email is verified
    if (!user.emailVerified) {
      console.log(`Login attempt with unverified email: ${user.email}`);
      return res.redirect(`/login.html?error=${encodeURIComponent('Bitte bestätige zuerst deine Email-Adresse. Überprüfe dein Postfach.')}`);
    }
    
    req.logIn(user, (err) => {
      if (err) {
        console.error("Login error:", err);
        return res.redirect(`/login.html?error=${encodeURIComponent('Ein Fehler ist aufgetreten')}`);
      }
      
      console.log(`User logged in: ${user.email}`);
      
      // Redirect to the page they were trying to access, or default to /gruppen.html
      const returnTo = req.session.returnTo || "/gruppen.html";
      delete req.session.returnTo; // Clear it after use
      
      return res.redirect(returnTo);
    });
  })(req, res, next);
});

// Auth0 Routes
app.get('/auth/auth0', passport.authenticate('auth0', {
  scope: 'openid email profile',
  state: true // Enable state parameter for security
}));

app.get('/auth/callback', (req, res, next) => {
  passport.authenticate('auth0', (err, user, info) => {
    if (err) {
      console.error('Auth0 callback error:', err);
      return res.redirect('/login.html?error=' + encodeURIComponent('Login fehlgeschlagen: ' + err.message));
    }
    
    if (!user) {
      console.error('Auth0 callback: No user returned', info);
      return res.redirect('/login.html?error=' + encodeURIComponent('Login fehlgeschlagen'));
    }
    
    req.logIn(user, (err) => {
      if (err) {
        console.error('Auth0 login error:', err);
        return res.redirect('/login.html?error=' + encodeURIComponent('Login fehlgeschlagen'));
      }
      
      console.log(`User logged in via Auth0: ${user.email}`);
      res.redirect('/gruppen.html');
    });
  })(req, res, next);
});

app.get("/users/logout", (req, res) => {
  const userEmail = req.user ? req.user.email : 'unknown';
  
  // Clear cookie and redirect immediately (faster UX)
  res.clearCookie('connect.sid');
  
  // Logout and destroy session asynchronously (don't wait)
  req.logout((err) => {
    if (err) {
      console.error("Logout error:", err);
    }
    
    req.session.destroy((err) => {
      if (err) {
        console.error("Session destroy error:", err);
      }
      console.log(`User logged out: ${userEmail}`);
    });
  });
  
  // Redirect immediately without waiting
  res.redirect("/");
});

// Email verification endpoint (with 6-digit code)
app.post("/verify-code", authLimiter, [
  body('email').isEmail().normalizeEmail().withMessage('Gültige Email-Adresse erforderlich'),
  body('code').isLength({ min: 6, max: 6 }).isNumeric().withMessage('Code muss 6 Ziffern haben')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array()[0].msg });
  }
  
  try {
    const { email, code } = req.body;
    
    // Find user with this email and verification code
    const user = await User.findOne({ 
      email: email.toLowerCase().trim(), 
      verificationToken: code 
    });
    
    if (!user) {
      return res.status(400).json({ error: 'Ungültiger Code oder Email-Adresse' });
    }
    
    // Check if already verified
    if (user.emailVerified) {
      return res.json({ success: true, message: 'Email bereits verifiziert' });
    }
    
    // Update user - mark as verified and remove code
    user.emailVerified = true;
    user.verificationToken = undefined;
    await user.save();
    
    console.log(`Email verified for user: ${user.email}`);
    
    // Send welcome email
    try {
      await sendWelcomeEmail(user.email, user.name);
      console.log(`Welcome email sent to: ${user.email}`);
    } catch (emailError) {
      console.error("Failed to send welcome email:", emailError);
      // Continue anyway
    }
    
    return res.json({ 
      success: true, 
      message: 'Email erfolgreich bestätigt! Du kannst dich jetzt anmelden.',
      redirect: '/login.html'
    });
    
  } catch (error) {
    console.error("Email verification error:", error);
    return res.status(500).json({ error: 'Ein Fehler ist aufgetreten. Bitte erneut versuchen.' });
  }
});

// Resend verification email endpoint
app.post("/resend-verification", authLimiter, [
  body('email').isEmail().normalizeEmail().withMessage('Gültige Email-Adresse erforderlich')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array()[0].msg });
  }
  
  try {
    const { email } = req.body;
    // Email is already normalized by express-validator's normalizeEmail()
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    
    if (!user) {
      // Don't reveal if user exists or not
      return res.json({ message: 'Falls ein Account mit dieser Email existiert, wurde eine neue Verifizierungs-Email gesendet.' });
    }
    
    if (user.emailVerified) {
      return res.status(400).json({ error: 'Diese Email-Adresse ist bereits verifiziert.' });
    }
    
    // Generate new 6-digit verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    user.verificationToken = verificationCode;
    await user.save();
    
    // Send verification email with new code
    await sendVerificationEmail(user.email, user.name, verificationCode);
    console.log(`Verification code resent to: ${user.email} (Code: ${verificationCode})`);
    
    return res.json({ message: 'Verifizierungs-Email wurde erneut gesendet. Überprüfe dein Postfach.' });
    
  } catch (error) {
    console.error("Resend verification error:", error);
    return res.status(500).json({ error: 'Ein Fehler ist aufgetreten. Bitte erneut versuchen.' });
  }
});

// ===========================
// PROTECTED PAGE ROUTES
// ===========================

// Protected pages (require authentication) - BEFORE static middleware
app.get("/profile.html", checkNotAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, '../public/profile.html'));
});

app.get("/user-profile.html", checkNotAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, '../public/user-profile.html'));
});

app.get("/gruppe-erstellen.html", checkNotAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, '../public/gruppe-erstellen.html'));
});

app.get("/dashboard.html", checkNotAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, '../public/dashboard.html'));
});

// Serve static files from public directory (for all other files)
app.use(express.static(path.join(__dirname, '../public')));

// Semi-protected pages (can view but some features need login)
// gruppen.html and gruppe-details.html are now publicly accessible

// ===========================
// API ROUTES (Protected & Rate Limited)
// ===========================

// Get all groups (public - no auth required)
app.get("/api/groups", apiLimiter, async (req, res) => {
  try {
    const groups = await Group.find()
      .populate('created_by', 'name email')
      .populate('members', 'name email')
      .sort({ createdAt: -1 });
    res.json(groups);
  } catch (error) {
    console.error("Error fetching groups:", error);
    res.status(500).json({ error: "Failed to fetch groups" });
  }
});

app.post("/api/groups", checkNotAuthenticated, apiLimiter, groupValidation, async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { name, description, max_teilnehmer } = req.body;
    
    const group = new Group({
      name: name.trim(),
      description: description ? description.trim() : '',
      created_by: req.user._id,
      max_teilnehmer: max_teilnehmer || 10,
      members: [] // Members list (creator is separate)
    });
    
    await group.save();
    await group.populate('created_by', 'name email');
    
    console.log(`Group created: ${name} by ${req.user.email}`);
    res.json(group);
  } catch (error) {
    console.error("Error creating group:", error);
    res.status(500).json({ error: "Failed to create group" });
  }
});

// Get single group (public - no auth required)
app.get("/api/groups/:id", apiLimiter, async (req, res) => {
  try {
    const group = await Group.findById(req.params.id)
      .populate('created_by', 'name email')
      .populate('members', 'name email');
    
    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }
    
    res.json(group);
  } catch (error) {
    console.error("Error fetching group:", error);
    res.status(500).json({ error: "Failed to fetch group" });
  }
});

app.post("/api/groups/:id/join", checkNotAuthenticated, apiLimiter, async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    
    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }
    
    // Check if user is the creator
    if (group.created_by.toString() === req.user._id.toString()) {
      return res.status(400).json({ error: "You are the creator of this group" });
    }
    
    // Check if user is already a member
    if (group.members.some(memberId => memberId.toString() === req.user._id.toString())) {
      return res.status(400).json({ error: "You are already a member of this group" });
    }
    
    // Check if group is full (members + 1 for creator)
    if (group.members.length + 1 >= group.max_teilnehmer) {
      return res.status(400).json({ error: "Group is full" });
    }
    
    group.members.push(req.user._id);
    await group.save();
    
    console.log(`User ${req.user.email} joined group: ${group.name}`);
    res.json({ success: true, message: "Successfully joined the group" });
  } catch (error) {
    console.error("Error joining group:", error);
    res.status(500).json({ error: "Failed to join group" });
  }
});

app.post("/api/groups/:id/leave", checkNotAuthenticated, apiLimiter, async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    
    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }
    
    // Check if user is the creator
    if (group.created_by.toString() === req.user._id.toString()) {
      return res.status(400).json({ error: "Group creator cannot leave the group" });
    }
    
    // Remove user from members
    group.members = group.members.filter(
      memberId => memberId.toString() !== req.user._id.toString()
    );
    
    await group.save();
    
    console.log(`User ${req.user.email} left group: ${group.name}`);
    res.json({ success: true, message: "Successfully left the group" });
  } catch (error) {
    console.error("Error leaving group:", error);
    res.status(500).json({ error: "Failed to leave group" });
  }
});

// ===========================
// CHAT MESSAGES API
// ===========================

// Get messages for a group (members only)
app.get("/api/groups/:id/messages", checkNotAuthenticated, apiLimiter, async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    
    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }
    
    // Check if user is a member
    const isMember = group.members.some(
      memberId => memberId.toString() === req.user._id.toString()
    ) || group.created_by.toString() === req.user._id.toString();
    
    if (!isMember) {
      return res.status(403).json({ error: "You must be a member to view messages" });
    }
    
    const messages = await Message.find({ group: req.params.id })
      .sort({ createdAt: 1 })
      .limit(100); // Last 100 messages
    
    res.json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

// Post a message to a group (members only)
app.post("/api/groups/:id/messages", checkNotAuthenticated, apiLimiter, async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message || message.trim().length === 0) {
      return res.status(400).json({ error: "Message cannot be empty" });
    }
    
    if (message.length > 1000) {
      return res.status(400).json({ error: "Message too long (max 1000 characters)" });
    }
    
    const group = await Group.findById(req.params.id);
    
    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }
    
    // Check if user is a member
    const isMember = group.members.some(
      memberId => memberId.toString() === req.user._id.toString()
    ) || group.created_by.toString() === req.user._id.toString();
    
    if (!isMember) {
      return res.status(403).json({ error: "You must be a member to send messages" });
    }
    
    const newMessage = new Message({
      group: req.params.id,
      user: req.user._id,
      userName: req.user.name,
      message: message.trim()
    });
    
    await newMessage.save();
    
    res.status(201).json(newMessage);
  } catch (error) {
    console.error("Error posting message:", error);
    res.status(500).json({ error: "Failed to post message" });
  }
});

// ===========================
// ROADMAP TODOS API
// ===========================

// Get todos for a group (members only)
app.get("/api/groups/:id/todos", checkNotAuthenticated, apiLimiter, async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    
    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }
    
    // Check if user is a member
    const isMember = group.members.some(
      memberId => memberId.toString() === req.user._id.toString()
    ) || group.created_by.toString() === req.user._id.toString();
    
    if (!isMember) {
      return res.status(403).json({ error: "You must be a member to view todos" });
    }
    
    const todos = await Todo.find({ group: req.params.id })
      .sort({ order: 1, createdAt: 1 });
    
    res.json(todos);
  } catch (error) {
    console.error("Error fetching todos:", error);
    res.status(500).json({ error: "Failed to fetch todos" });
  }
});

// Create a todo (members only)
app.post("/api/groups/:id/todos", checkNotAuthenticated, apiLimiter, async (req, res) => {
  try {
    const { title, description } = req.body;
    
    if (!title || title.trim().length === 0) {
      return res.status(400).json({ error: "Title cannot be empty" });
    }
    
    if (title.length > 200) {
      return res.status(400).json({ error: "Title too long (max 200 characters)" });
    }
    
    const group = await Group.findById(req.params.id);
    
    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }
    
    // Check if user is a member
    const isMember = group.members.some(
      memberId => memberId.toString() === req.user._id.toString()
    ) || group.created_by.toString() === req.user._id.toString();
    
    if (!isMember) {
      return res.status(403).json({ error: "You must be a member to create todos" });
    }
    
    // Get the current max order
    const maxTodo = await Todo.findOne({ group: req.params.id }).sort({ order: -1 });
    const nextOrder = maxTodo ? maxTodo.order + 1 : 0;
    
    const newTodo = new Todo({
      group: req.params.id,
      title: title.trim(),
      description: description ? description.trim() : '',
      createdBy: req.user._id,
      createdByName: req.user.name,
      order: nextOrder
    });
    
    await newTodo.save();
    
    res.status(201).json(newTodo);
  } catch (error) {
    console.error("Error creating todo:", error);
    res.status(500).json({ error: "Failed to create todo" });
  }
});

// Update a todo (toggle completed or edit)
app.patch("/api/groups/:id/todos/:todoId", checkNotAuthenticated, apiLimiter, async (req, res) => {
  try {
    const todo = await Todo.findById(req.params.todoId);
    
    if (!todo) {
      return res.status(404).json({ error: "Todo not found" });
    }
    
    if (todo.group.toString() !== req.params.id) {
      return res.status(400).json({ error: "Todo does not belong to this group" });
    }
    
    const group = await Group.findById(req.params.id);
    
    // Check if user is a member
    const isMember = group.members.some(
      memberId => memberId.toString() === req.user._id.toString()
    ) || group.created_by.toString() === req.user._id.toString();
    
    if (!isMember) {
      return res.status(403).json({ error: "You must be a member to update todos" });
    }
    
    // Update fields
    if (req.body.hasOwnProperty('completed')) {
      todo.completed = req.body.completed;
    }
    if (req.body.title) {
      todo.title = req.body.title.trim();
    }
    if (req.body.hasOwnProperty('description')) {
      todo.description = req.body.description ? req.body.description.trim() : '';
    }
    
    await todo.save();
    
    res.json(todo);
  } catch (error) {
    console.error("Error updating todo:", error);
    res.status(500).json({ error: "Failed to update todo" });
  }
});

// Delete a todo
app.delete("/api/groups/:id/todos/:todoId", checkNotAuthenticated, apiLimiter, async (req, res) => {
  try {
    const todo = await Todo.findById(req.params.todoId);
    
    if (!todo) {
      return res.status(404).json({ error: "Todo not found" });
    }
    
    if (todo.group.toString() !== req.params.id) {
      return res.status(400).json({ error: "Todo does not belong to this group" });
    }
    
    const group = await Group.findById(req.params.id);
    
    // Check if user is a member
    const isMember = group.members.some(
      memberId => memberId.toString() === req.user._id.toString()
    ) || group.created_by.toString() === req.user._id.toString();
    
    if (!isMember) {
      return res.status(403).json({ error: "You must be a member to delete todos" });
    }
    
    await Todo.findByIdAndDelete(req.params.todoId);
    
    res.json({ success: true, message: "Todo deleted" });
  } catch (error) {
    console.error("Error deleting todo:", error);
    res.status(500).json({ error: "Failed to delete todo" });
  }
});

// ===========================
// ERROR HANDLING
// ===========================

// 404 handler
app.use((req, res) => {
  res.status(404).send("404 - Page Not Found");
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Server error:", err);
  res.status(500).send("500 - Internal Server Error");
});

// ===========================
// START SERVER
// ===========================

app.listen(PORT, () => {
  console.log(`Secure server running on port ${PORT}`);
  console.log(`Security features enabled:`);
  console.log(`   - Helmet (Security headers)`);
  console.log(`   - Rate limiting`);
  console.log(`   - Input validation & sanitization`);
  console.log(`   - Secure session storage (MongoDB)`);
  console.log(`   - Bcrypt password hashing`);
  console.log(`   - HTTP-only cookies`);
  console.log(`   - Password strength requirements`);
});

