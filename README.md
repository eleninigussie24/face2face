# FaceFace - Study Group Platform 🎓

A secure, modern web application for university students to create and join study groups. Built with Node.js, Express, and MongoDB.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D14.0.0-brightgreen.svg)
![MongoDB](https://img.shields.io/badge/mongodb-%3E%3D4.0-green.svg)

## ✨ Features

- 🔐 **Secure Authentication** - bcrypt password hashing, session management
- 👥 **User Management** - Register, login, profile management
- 📚 **Study Groups** - Create, browse, and join study groups
- 🛡️ **Enterprise Security** - Rate limiting, input validation, CSRF protection
- 💾 **MongoDB Integration** - Fast, scalable database
- 📱 **Responsive Design** - Works on desktop and mobile

## 🔒 Security Features

- **Helmet.js** - Security headers (XSS, clickjacking protection)
- **Rate Limiting** - Prevents brute force attacks (5 attempts/15 min)
- **Input Validation** - express-validator with sanitization
- **Password Requirements** - Enforced strong passwords (min 8 chars, uppercase, lowercase, number)
- **HTTP-Only Cookies** - Prevents XSS cookie theft
- **MongoDB Session Store** - Persistent, secure sessions
- **CSRF Protection** - SameSite cookies

## 🚀 Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) (v14 or higher)
- [MongoDB](https://www.mongodb.com/try/download/community) (v4.0 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/faceface-app.git
   cd faceface-app
   ```

2. **Install dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your configuration:
   ```env
   NODE_ENV=development
   PORT=3000
   SESSION_SECRET=your_generated_secret_here  # Generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   MONGODB_URI=mongodb://localhost:27017/faceface_db
   ```

4. **Start MongoDB**
   ```bash
   # macOS (Homebrew)
   brew services start mongodb-community
   
   # Linux
   sudo systemctl start mongod
   
   # Windows
   net start MongoDB
   ```

5. **Run the application**
   ```bash
   npm start
   ```

6. **Open your browser**
   ```
   http://localhost:3000
   ```

## 📁 Project Structure

```
faceface-app/
├── backend/
│   ├── models/
│   │   ├── User.js          # User model with password hashing
│   │   └── Group.js         # Study group model
│   ├── views/               # EJS templates
│   │   ├── register.ejs
│   │   ├── login.ejs
│   │   ├── dashboard.ejs
│   │   └── index.ejs
│   ├── mongoConfig.js       # MongoDB connection
│   ├── server.js            # Express server with security
│   ├── package.json
│   ├── .env                 # Environment variables (not in git)
│   └── .env.example         # Environment template
├── frontend/                # Static HTML/CSS/JS files
│   ├── index.html
│   ├── anmelden.html
│   ├── gruppen.html
│   ├── gruppe-erstellen.html
│   └── gruppe-details.html
├── setup.sh                 # Setup script
├── view-data.sh             # Database viewer script
├── .gitignore
├── LICENSE
└── README.md
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `development` or `production` |
| `PORT` | Server port | `3000` |
| `SESSION_SECRET` | Session encryption key | Generated 64-char hex string |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/faceface_db` |

### Password Requirements

- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number

### Rate Limits

- Login/Register: 5 attempts per 15 minutes
- API calls: 100 requests per 15 minutes

## 🎯 Usage

### For Users

1. **Register** - Create an account at `/users/register`
2. **Login** - Sign in at `/users/login`
3. **Browse Groups** - View available study groups
4. **Create Group** - Start your own study group
5. **Join Groups** - Connect with other students

### For Developers

**Start development server:**
```bash
npm run dev  # Auto-reload on changes
```

**View database:**
```bash
./view-data.sh
```

**MongoDB shell:**
```bash
mongosh faceface_db
```

## 🗄️ Database

### Collections

**users**
```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique, indexed),
  password: String (bcrypt hash),
  createdAt: Date,
  updatedAt: Date
}
```

**groups**
```javascript
{
  _id: ObjectId,
  name: String,
  description: String,
  created_by: ObjectId (ref: User),
  max_teilnehmer: Number,
  members: [ObjectId] (ref: User),
  createdAt: Date,
  updatedAt: Date
}
```

## 🌐 API Endpoints

### Authentication
- `GET /users/register` - Registration page
- `POST /users/register` - Create new user
- `GET /users/login` - Login page
- `POST /users/login` - Authenticate user
- `GET /users/logout` - Logout user
- `GET /users/dashboard` - User dashboard (protected)

### Groups (Protected)
- `GET /api/groups` - Get all groups
- `POST /api/groups` - Create new group
- `GET /api/groups/:id` - Get group details
- `POST /api/groups/:id/join` - Join a group
- `POST /api/groups/:id/leave` - Leave a group

## 🧪 Development

### Available Scripts

```bash
npm start          # Start production server
npm run dev        # Start development server (nodemon)
```

### Helper Scripts

```bash
./setup.sh         # Quick setup script
./view-data.sh     # Interactive database viewer
```

## 🚢 Deployment

### MongoDB Atlas (Cloud Database)

1. Create free cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Get connection string
3. Update `MONGODB_URI` in production environment

### Environment Setup

For production, ensure:
- [ ] `NODE_ENV=production`
- [ ] Strong `SESSION_SECRET` (different from dev)
- [ ] MongoDB Atlas or secured MongoDB instance
- [ ] HTTPS enabled (secure cookies auto-enable)
- [ ] Environment variables set in hosting platform

### Deployment Platforms

Works with:
- [Heroku](https://www.heroku.com/)
- [Railway](https://railway.app/)
- [Render](https://render.com/)
- [DigitalOcean App Platform](https://www.digitalocean.com/products/app-platform)
- [AWS EC2](https://aws.amazon.com/ec2/)

## 🛡️ Security Best Practices

✅ **Implemented:**
- bcrypt password hashing (10 rounds)
- Session-based authentication
- HTTP-only, SameSite cookies
- Rate limiting on auth routes
- Input validation and sanitization
- Security headers (Helmet.js)
- CSRF protection
- MongoDB injection prevention

⚠️ **For Production:**
- Enable HTTPS
- Use environment-specific secrets
- Set up monitoring and logging
- Regular security audits (`npm audit`)
- Keep dependencies updated

## 📊 Tech Stack

- **Backend:** Node.js, Express.js
- **Database:** MongoDB, Mongoose ODM
- **Authentication:** Passport.js (Local Strategy)
- **Security:** Helmet, express-rate-limit, express-validator
- **Sessions:** express-session, connect-mongo
- **Password Hashing:** bcrypt
- **Template Engine:** EJS
- **Frontend:** HTML, CSS, JavaScript

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🐛 Troubleshooting

### MongoDB Connection Error
```bash
# Check if MongoDB is running
brew services list | grep mongodb

# Start MongoDB
brew services start mongodb-community
```

### Port Already in Use
```bash
# Find process on port 3000
lsof -i :3000

# Kill process
kill -9 <PID>
```

### Session Issues
If sessions aren't persisting, check:
- MongoDB is running
- `SESSION_SECRET` is set in `.env`
- `MONGODB_URI` is correct

## 📧 Contact

For questions or support, please open an issue on GitHub.

---

**Built with ❤️ for students, by students**
