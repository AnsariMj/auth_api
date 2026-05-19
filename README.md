# Multi-Tenant Authentication API

A comprehensive multi-tenant authentication system built with Node.js, Express, MongoDB, and JWT. Perfect for SaaS applications where multiple organizations (tenants) need isolated user management.

## 🌟 Features

- ✅ **Multi-Tenant Support** - Completely isolated data per tenant
- ✅ **JWT Authentication** - Secure token-based authentication
- ✅ **Role-Based Access Control** - Admin, Manager, User roles
- ✅ **Password Hashing** - Bcrypt for secure password storage
- ✅ **User Management** - Create, update, delete users per tenant
- ✅ **Tenant Management** - Create and manage organizations
- ✅ **Member Management** - Add/remove users, change roles
- ✅ **Email Validation** - Unique email per tenant
- ✅ **User Limits** - Enforce max users per tenant
- ✅ **Tenant Status** - Active/inactive tenant control

## 📋 Prerequisites

- Node.js (v14+)
- MongoDB (local or Atlas)
- npm or yarn
- Postman or similar API testing tool

## 🚀 Installation

### 1. Clone the Repository
```bash
git clone <repository-url>
cd auth_api
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Create .env File
Copy `.env.example` to `.env` and update values:
```bash
PORT=5000
MONGO_URI=mongodb://localhost:27017/auth_api_multitenant
JWT_SECRET=your_super_secret_key_change_this
JWT_EXPIRE=7d
```

### 4. Start MongoDB
```bash
# Local MongoDB
mongod

# OR use MongoDB Atlas (cloud)
# Update MONGO_URI in .env
```

### 5. Run the Server
```bash
# Development (with nodemon)
npm run dev

# Production
npm start
```

Server will run on `http://localhost:5000`

## 📁 Project Structure

```
auth_api/
├── controllers/
│   ├── authController.js      # User authentication logic
│   └── tenantController.js    # Tenant management logic
├── models/
│   ├── User.js                # User schema
│   └── Tenant.js              # Tenant schema
├── routes/
│   ├── authRoutes.js          # Auth endpoints
│   └── tenantRoutes.js        # Tenant endpoints
├── middleware/
│   └── authMiddleware.js      # JWT verification & role checks
├── database/
│   └── dbConnect.js           # MongoDB connection
├── app.js                      # Express app setup
├── package.json               # Dependencies
├── .env.example               # Environment template
├── .gitignore                 # Git ignore rules
└── WORKFLOW.md                # API usage examples
```

## 🔌 API Endpoints

### Authentication Routes (`/api/auth`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/register` | ❌ | Register new user |
| POST | `/login` | ❌ | Login user |
| POST | `/verify-token` | ❌ | Verify JWT token |
| GET | `/me` | ✅ | Get current user |
| PUT | `/update-password` | ✅ | Update password |
| PUT | `/update-profile` | ✅ | Update username |
| GET | `/logout` | ✅ | Logout user |
| DELETE | `/delete` | ✅ | Delete account |
| GET | `/users` | ✅ | Get tenant members |

### Tenant Routes (`/api/tenant`)

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| POST | `/create` | ❌ | - | Create new tenant |
| GET | `/slug/:slug` | ❌ | - | Get tenant by slug |
| GET | `/all` | ✅ | - | List all tenants |
| GET | `/details` | ✅ | - | Get current tenant |
| PUT | `/update` | ✅ | Admin | Update tenant |
| DELETE | `/delete` | ✅ | Admin | Delete tenant |
| GET | `/members` | ✅ | - | List tenant members |
| POST | `/members/add` | ✅ | Admin | Add user to tenant |
| PUT | `/members/role` | ✅ | Admin | Change user role |
| POST | `/members/remove` | ✅ | Admin | Remove user |

## 📚 Usage Workflow

### Step 1: Create a Tenant
```bash
POST http://localhost:5000/api/tenant/create
Content-Type: application/json

{
  "tenantName": "Acme Corporation",
  "tenantSlug": "acme-corp",
  "description": "Our company",
  "website": "https://acme.com",
  "ownerEmail": "john@acme.com"
}
```

### Step 2: Register a User
```bash
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "userName": "John Doe",
  "userEmail": "john@acme.com",
  "userPassword": "SecurePass123",
  "tenantSlug": "acme-corp"
}
```

**Response includes token:**
```json
{
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "...",
    "userName": "John Doe",
    "role": "admin"
  }
}
```

### Step 3: Login
```bash
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "userEmail": "john@acme.com",
  "userPassword": "SecurePass123",
  "tenantSlug": "acme-corp"
}
```

### Step 4: Use Token for Protected Routes
```bash
GET http://localhost:5000/api/auth/me
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

## 🔐 Authentication

- Passwords are hashed using **bcryptjs**
- Tokens expire after **7 days** (configurable)
- Tokens include user ID and tenant ID
- Protected routes require `Authorization: Bearer {token}` header

## 👥 Roles

- **Admin** - Full control over tenant, manage users
- **Manager** - Can view and manage team members
- **User** - Regular user, limited access

## 📊 Data Models

### User Schema
```javascript
{
  userName: String (required),
  userEmail: String (required, unique per tenant),
  userPassword: String (hashed),
  tenant: ObjectId (reference to Tenant),
  role: String (admin/manager/user),
  isActive: Boolean,
  emailVerified: Boolean,
  lastLogin: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Tenant Schema
```javascript
{
  tenantName: String (required),
  tenantSlug: String (required, unique),
  description: String,
  owner: ObjectId (reference to User),
  logo: String,
  website: String,
  isActive: Boolean,
  maxUsers: Number (default: 50),
  plan: String (free/pro/enterprise),
  settings: {
    allowRegistration: Boolean,
    requireEmailVerification: Boolean,
    twoFactorAuth: Boolean
  },
  createdAt: Date,
  updatedAt: Date
}
```

## 🧪 Testing with Postman

1. Create a new collection named "Auth API"
2. Add requests following the [WORKFLOW.md](WORKFLOW.md) file
3. Save tokens in Postman variables
4. Use `{{token}}` in request headers

## 📦 Dependencies

- **express** - Web framework
- **mongoose** - MongoDB ODM
- **bcryptjs** - Password hashing
- **jsonwebtoken** - JWT authentication
- **express-async-handler** - Async error handling
- **dotenv** - Environment variables
- **axios** - HTTP client (optional)

## 🔧 Development

### Available Scripts

```bash
# Start development server (with auto-reload)
npm run dev

# Start production server
npm start

# Stop server
Ctrl + C
```

## 📝 Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| PORT | 5000 | Server port |
| MONGO_URI | - | MongoDB connection string |
| JWT_SECRET | - | Secret key for JWT signing |
| JWT_EXPIRE | 7d | Token expiration time |

## 🐛 Common Issues

### MongoDB Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Solution:** Start MongoDB or update `MONGO_URI` to use MongoDB Atlas

### Duplicate Key Error
```
MongoError: E11000 duplicate key error
```
**Solution:** Email already exists in tenant or slug is taken

### Invalid Token Error
```
Error: Not authorized to access this route
```
**Solution:** Token expired or invalid. Re-login to get new token

## 🚀 Deployment

### Deploy to Heroku
```bash
# Create .env.production with production values
heroku create your-app-name
heroku config:set MONGO_URI=your_atlas_uri
git push heroku main
```

### Deploy to AWS/Azure
1. Use MongoDB Atlas for database
2. Deploy Node.js app to EC2/App Service
3. Update `MONGO_URI` environment variable
4. Set `JWT_SECRET` in production

## 📄 License

ISC

## 👨‍💻 Author

MJ Ansari

## 🤝 Contributing

Feel free to submit issues and pull requests.

## 📞 Support

For issues or questions, please create an issue in the repository.

---

**Happy Coding! 🎉**
