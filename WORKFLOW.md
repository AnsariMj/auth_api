# Multi-Tenant Authentication API - Workflow

## New Flow: Create Tenant First, Then Register Users

### Step 1: Create Tenant (Public Endpoint)
```bash
POST /api/tenant/create
Content-Type: application/json

{
  "tenantName": "Acme Corporation",
  "tenantSlug": "acme-corp",
  "description": "Our awesome company",
  "website": "https://acmecorp.com"
}
```

**Response:**
```json
{
  "message": "Tenant created successfully",
  "tenant": {
    "id": "60d5ec49f1b2c72b8c8e4a1a",
    "tenantName": "Acme Corporation",
    "tenantSlug": "acme-corp",
    "plan": "free",
    "maxUsers": 50
  }
}
```

---

### Step 2: Register Users Under That Tenant
```bash
POST /api/auth/register
Content-Type: application/json

{
  "userName": "John Doe",
  "userEmail": "john@acmecorp.com",
  "userPassword": "SecurePass123!",
  "tenantSlug": "acme-corp"
}
```

**Response:**
```json
{
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "tenant": {
    "id": "60d5ec49f1b2c72b8c8e4a1a",
    "tenantName": "Acme Corporation",
    "tenantSlug": "acme-corp"
  },
  "user": {
    "id": "60d5ec49f1b2c72b8c8e4a1b",
    "userName": "John Doe",
    "userEmail": "john@acmecorp.com",
    "role": "admin"
  }
}
```

**Note:** First user to register becomes the tenant admin (if no owner was set)

---

### Step 3: Login User
```bash
POST /api/auth/login
Content-Type: application/json

{
  "userEmail": "john@acmecorp.com",
  "userPassword": "SecurePass123!",
  "tenantSlug": "acme-corp"
}
```

---

### Step 4: Add More Users (Admin Only)
```bash
POST /api/tenant/members/add
Authorization: Bearer {token}
Content-Type: application/json

{
  "userEmail": "jane@acmecorp.com",
  "role": "user"
}
```

**Note:** User must be registered first, then added to the tenant

---

## Key Changes

✅ **Tenants created independently** - No longer tied to user registration
✅ **Users join existing tenants** - Must provide `tenantSlug` during registration
✅ **First user becomes admin** - If tenant has no owner
✅ **User limit enforcement** - Based on tenant's `maxUsers` setting
✅ **Tenant activation check** - Can't register in inactive tenants

---

## API Endpoints Summary

### Tenant Management
- `POST /api/tenant/create` - Create new tenant (public)
- `GET /api/tenant/slug/:slug` - Get tenant details by slug (public)
- `GET /api/tenant/all` - List all tenants (auth required)
- `GET /api/tenant/details` - Get current user's tenant (auth required)
- `PUT /api/tenant/update` - Update tenant (admin only)
- `DELETE /api/tenant/delete` - Delete tenant (admin only)

### Member Management
- `GET /api/tenant/members` - List tenant members (auth required)
- `POST /api/tenant/members/add` - Add user to tenant (admin only)
- `PUT /api/tenant/members/role` - Change user role (admin only)
- `POST /api/tenant/members/remove` - Remove user from tenant (admin only)

### Authentication
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (auth required)
- `PUT /api/auth/update-password` - Update password (auth required)
