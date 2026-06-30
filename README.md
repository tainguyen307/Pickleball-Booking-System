# Pickleball Booking System

A comprehensive full-stack web application for managing pickleball court bookings, equipment rentals, and user engagement. Built with a modern architecture combining Express.js backend, React frontend, and MongoDB database.

## 📋 Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Core Features](#core-features)
- [User Roles & Permissions](#user-roles--permissions)
- [Project Structure](#project-structure)
- [Database Schema](#database-schema)
- [Setup & Installation](#setup--installation)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Environment Configuration](#environment-configuration)
- [Development Guidelines](#development-guidelines)

---

## Overview

The Pickleball Booking System is a multi-tenant platform designed to facilitate court bookings, equipment management, and community engagement for pickleball enthusiasts. It supports role-based access control, real-time notifications, points/rewards system, and integrated payment processing.

**Key Highlights:**
- Multi-role architecture (Admin, Vendor, User, Maintenance Staff, Shipper)
- Real-time booking and slot management
- Equipment rental system with inventory tracking
- Points and rewards program
- Coupon and discount system
- Review and rating system
- Maintenance request management
- Email notifications and alerts

---

## Architecture

### High-Level Architecture Diagram

```
┌───────────────────────────────────────────────────────────────────┐
│                      Frontend (React + Vite)                      │
│  ├─ Components       ├─ Features       ├─ Services      └─ Hooks  │
└────────────────────────┬──────────────────────────────────────────┘
                         │ HTTP/REST API + JWT Auth
                         ▼
┌───────────────────────────────────────────────────────────────────┐
│                   Backend (Express.js)                            │
│  ├─ Routes          ├─ Controllers    ├─ Services                 │
│  └─ Middlewares     └─ Repositories   └─ Models (Mongoose)        │
└────────────────────────┬──────────────────────────────────────────┘
                  ┌──────┴──────┐
                  ▼             ▼
        ┌─────────────────┐  ┌─────────────────┐
        │ MongoDB Atlas   │  │ Redis Cache     │
        │ (Data Store)    │  │ (Session/Rate   │
        │                 │  │  Limiting)      │
        └─────────────────┘  └─────────────────┘
```

### Backend Architecture Pattern (MVC + Repository)

```
Request Flow:
  Route → Middleware (Auth/Validation) → Controller → Service → Repository → Model → DB
  Response: Repository → Service → Controller → Route → Client
```

**Layered Architecture Components:**

1. **Routes Layer** (`src/routes/`)
   - Defines API endpoints and route handlers
   - Implements route-level access control
   - Delegates to controllers

2. **Middleware Layer** (`src/middlewares/`)
   - Authentication & authorization
   - Request validation
   - Rate limiting
   - CORS handling

3. **Controllers Layer** (`src/controllers/`)
   - Handles HTTP request/response
   - Input validation
   - Calls appropriate services
   - Returns formatted responses

4. **Services Layer** (`src/services/`)
   - Business logic implementation
   - Data transformation
   - External service integration (Cloudinary, Email, Google Auth)
   - Cross-cutting concerns

5. **Repositories Layer** (`src/repositories/`)
   - Database queries abstraction
   - Query optimization
   - Data access pattern implementation
   - Provides loose coupling between services and models

6. **Models Layer** (`src/models/`)
   - Mongoose schema definitions
   - Data validation rules
   - Indexes for performance
   - Virtual fields and computed properties

7. **Utilities** (`src/utils/`)
   - JWT token management
   - Error handling
   - Email utilities
   - Google authentication
   - Scheduled tasks (Slot scheduling)

### Frontend Architecture Pattern (Component-Based with Feature Slices)

```
├─ Components/       # Reusable UI components (CourtCard, FormInput, etc.)
├─ Features/         # Feature-based modules with pages
│  ├─ admin/
│  ├─ auth/
│  ├─ court/
│  ├─ user/
│  ├─ vendor/
│  ├─ shipper/
│  └─ maintenance-staff/
├─ Services/         # API integration layer
├─ Hooks/            # Custom React hooks
├─ Layouts/          # Layout components for role-based views
├─ Routes/           # Route configuration with protection
└─ Store/            # Zustand state management (auth, admin state)
```

---

## Tech Stack

### Backend
| Technology | Purpose | Version |
|------------|---------|---------|
| **Node.js** | Runtime environment | v18+ |
| **Express.js** | Web framework | ^5.2.1 |
| **MongoDB** | Primary database | Latest |
| **Mongoose** | MongoDB ODM | ^9.6.2 |
| **Redis** | Caching & session store | ^5.10.1 |
| **JWT (jsonwebtoken)** | Authentication | ^9.0.3 |
| **Bcryptjs** | Password hashing | ^3.0.3 |
| **Nodemailer** | Email service | ^8.0.7 |
| **Cloudinary** | Image storage | ^1.41.3 |
| **Google Auth Library** | OAuth 2.0 | ^10.6.2 |
| **Express Rate Limit** | API rate limiting | ^8.5.2 |
| **Express Validator** | Input validation | ^7.3.2 |
| **Multer** | File upload handling | ^2.1.1 |

### Frontend
| Technology | Purpose | Version |
|------------|---------|---------|
| **React** | UI library | ^19.2.5 |
| **Vite** | Build tool & dev server | ^8.0.10 |
| **React Router** | Client-side routing | ^7.15.1 |
| **Tailwind CSS** | Styling framework | ^3.4.19 |
| **Axios** | HTTP client | ^1.16.1 |
| **Zustand** | State management | ^5.0.13 |
| **Google OAuth** | Social authentication | ^0.13.5 |
| **PostCSS** | CSS transformation | ^8.5.15 |

---

## Core Features

### 1. **Authentication & Authorization**
- Email/password registration and login
- Google OAuth 2.0 integration
- JWT-based token authentication (Access + Refresh tokens)
- Role-based access control (RBAC)
- Password reset via email
- Auto logout on token expiration

### 2. **Court Management**
- Create, read, update, delete courts
- Court slot scheduling (automatic 30-day rolling generation)
- Court availability management
- Court views and analytics
- Favorite courts tracking
- Court ratings and reviews

### 3. **Booking System**
- Real-time court availability checking
- Slot-based booking with time slots
- Booking confirmation and cancellation
- Equipment bundling with bookings
- Coupon and discount application
- Booking history and status tracking

### 4. **Equipment Management**
- Equipment inventory management
- Equipment rental pricing
- Equipment availability tracking
- Equipment bundled with court bookings
- Import order management for restocking

### 5. **Vendor Management**
- Court vendor dashboard
- Equipment vendor dashboard
- Vendor-specific analytics
- Revenue tracking and reports
- Equipment import orders
- Court slot management

### 6. **User Engagement**
- **Points & Rewards System**
  - Points earning on bookings
  - Points spending for discounts
  - Points wallet with transaction history
  - Reward logs and tier system

- **Coupon System**
  - Coupon creation and management
  - Coupon usage tracking
  - Discount code application
  - Expiration date management

- **Review System**
  - Court and equipment reviews
  - 5-star rating system
  - Review moderation by admins
  - Reviewer feedback

### 7. **Maintenance Management**
- Maintenance staff assignment
- Court/equipment maintenance tracking
- Maintenance request creation and updates
- Skill-based staff assignment
- Maintenance history

### 8. **Shipper/Delivery System**
- Equipment delivery management
- Shipment tracking
- Delivery status updates
- Shipper assignment

### 9. **Notifications**
- Email notifications
- In-app notifications
- Booking confirmations
- Reminder notifications
- Real-time updates

### 10. **Admin Dashboard**
- System-wide analytics
- User management
- Booking management
- Equipment management
- Court management
- Review moderation
- Revenue reports
- System settings

---

## User Roles & Permissions

| Role | Capabilities |
|------|--------------|
| **USER** | Browse courts, make bookings, rent equipment, leave reviews, earn points, use coupons |
| **ADMIN** | Full system access, user management, moderation, system settings, analytics |
| **VENDOR** | Manage own courts/equipment, view bookings, track revenue, manage inventory |
| **MAINTENANCE_STAFF** | View maintenance requests, update status, track maintenance history |
| **SHIPPER** | Manage deliveries, update shipment status, track equipment deliveries |

---

## Project Structure

### Backend Structure
```
backend/
├── src/
│   ├── config/                      # Configuration files
│   │   ├── db.js                    # MongoDB connection
│   │   ├── redis.js                 # Redis client setup
│   │   └── cloudinary.js            # Cloudinary config
│   │
│   ├── controllers/                 # Request handlers
│   │   ├── auth.controller.js
│   │   ├── booking.controller.js
│   │   ├── court.controller.js
│   │   ├── user.controller.js
│   │   ├── admin.controller.js
│   │   ├── vendor.controller.js
│   │   ├── coupon.controller.js
│   │   ├── points.controller.js
│   │   ├── review.controller.js
│   │   ├── maintenance.controller.js
│   │   ├── notification.controller.js
│   │   └── shipper.controller.js
│   │
│   ├── services/                    # Business logic
│   │   ├── auth.service.js
│   │   ├── booking.service.js
│   │   ├── court.service.js
│   │   ├── user.service.js
│   │   ├── admin.service.js
│   │   ├── vendor.service.js
│   │   ├── coupon.service.js
│   │   ├── points.service.js
│   │   ├── review.service.js
│   │   ├── notification.service.js
│   │   ├── upload.service.js
│   │   ├── revenue.service.js
│   │   ├── systemSetting.service.js
│   │   └── shipper.service.js
│   │
│   ├── repositories/                # Database abstraction
│   │   ├── user.repository.js
│   │   ├── booking.repository.js
│   │   ├── court.repository.js
│   │   ├── equipment.repository.js
│   │   └── admin.repository.js
│   │
│   ├── models/                      # Mongoose schemas (20+ models)
│   │   ├── user.model.js
│   │   ├── booking.model.js
│   │   ├── bookingEquipment.model.js
│   │   ├── court.model.js
│   │   ├── courtSlot.model.js
│   │   ├── coupon.model.js
│   │   ├── equipment.model.js
│   │   ├── pointTransaction.model.js
│   │   ├── review.model.js
│   │   ├── notification.model.js
│   │   ├── maintenance.model.js
│   │   ├── delivery.model.js
│   │   ├── wallet.model.js
│   │   └── ... (more models)
│   │
│   ├── middlewares/                 # Express middlewares
│   │   ├── auth.middleware.js       # JWT verification
│   │   ├── validation.middleware.js # Input validation
│   │   └── rateLimiter.middleware.js # Rate limiting
│   │
│   ├── routes/                      # API route definitions
│   │   ├── auth.routes.js
│   │   ├── booking.routes.js
│   │   ├── court.routes.js
│   │   ├── user.routes.js
│   │   ├── admin.routes.js
│   │   ├── vendor.routes.js
│   │   ├── coupon.routes.js
│   │   ├── points.routes.js
│   │   ├── review.routes.js
│   │   ├── notification.routes.js
│   │   ├── maintenance.routes.js
│   │   └── shipper.routes.js
│   │
│   ├── utils/                       # Utility functions
│   │   ├── errorHandler.js          # Error handling
│   │   ├── jwt.util.js              # JWT helpers
│   │   ├── mail.util.js             # Email sending
│   │   ├── googleAuth.util.js       # Google OAuth
│   │   └── slotScheduler.js         # Slot scheduling task
│   │
│   ├── server.js                    # Express app setup
│   └── seed.js                      # Database seeding
│
├── .env                             # Environment variables
├── .babelrc                         # Babel configuration
├── package.json                     # Dependencies
└── README.md
```

### Frontend Structure
```
frontend/
├── src/
│   ├── components/                  # Reusable UI components
│   │   ├── CourtCard.jsx
│   │   ├── CourtRail.jsx
│   │   ├── FavoriteButton.jsx
│   │   ├── FormInput.jsx
│   │   ├── NotificationBell.jsx
│   │   ├── ReviewsSection.jsx
│   │   └── SkeletonCard.jsx
│   │
│   ├── features/                    # Feature-based modules
│   │   ├── admin/
│   │   │   └── pages/
│   │   │       ├── Dashboard.jsx
│   │   │       ├── UserManagement.jsx
│   │   │       ├── CourtManagement.jsx
│   │   │       ├── BookingManagement.jsx
│   │   │       ├── EquipmentManagement.jsx
│   │   │       ├── CouponManagement.jsx
│   │   │       ├── ReviewManagement.jsx
│   │   │       ├── MaintenanceManagement.jsx
│   │   │       └── Settings.jsx
│   │   │
│   │   ├── auth/
│   │   │   └── pages/
│   │   │       ├── Login.jsx
│   │   │       ├── Register.jsx
│   │   │       ├── ForgotPassword.jsx
│   │   │       └── ResetPassword.jsx
│   │   │
│   │   ├── court/
│   │   │   └── pages/
│   │   │       ├── CourtList.jsx
│   │   │       └── CourtDetail.jsx
│   │   │
│   │   ├── user/
│   │   │   └── pages/
│   │   │       ├── UserProfile.jsx
│   │   │       ├── Favorites.jsx
│   │   │       └── RewardPage.jsx
│   │   │
│   │   ├── vendor/
│   │   │   └── pages/
│   │   │       ├── Dashboard.jsx
│   │   │       ├── CourtManagement.jsx
│   │   │       ├── EquipmentManagement.jsx
│   │   │       ├── BookingManagement.jsx
│   │   │       ├── MaintenanceManagement.jsx
│   │   │       └── Reviews.jsx
│   │   │
│   │   ├── shipper/
│   │   │   └── pages/
│   │   │       └── ShipperDashboard.jsx
│   │   │
│   │   ├── maintenance-staff/
│   │   │   └── pages/
│   │   │       └── MaintenanceDashboard.jsx
│   │   │
│   │   └── home/
│   │       └── pages/
│   │           └── Home.jsx
│   │
│   ├── services/                    # API integration layer
│   │   ├── auth.service.js
│   │   ├── court.service.js
│   │   ├── booking.service.js
│   │   ├── user.service.js
│   │   ├── admin.service.js
│   │   ├── vendor.service.js
│   │   ├── engagement.service.js    # Points, coupons, reviews
│   │   ├── notification.service.js
│   │   ├── maintenanceStaff.service.js
│   │   ├── shipper.service.js
│   │   └── commerce.service.js
│   │
│   ├── hooks/                       # Custom React hooks
│   │   └── useGoogleAuth.js
│   │
│   ├── layouts/                     # Layout components
│   │   ├── MainLayout.jsx
│   │   ├── AuthLayout.jsx
│   │   ├── AdminLayout.jsx
│   │   ├── VendorLayout.jsx
│   │   ├── UserLayout.jsx
│   │   ├── ShipperLayout.jsx
│   │   └── MaintenanceStaffLayout.jsx
│   │
│   ├── routes/                      # Route configuration
│   │   ├── index.jsx                # Route definitions
│   │   └── ProtectedRoute.jsx       # Route protection HOC
│   │
│   ├── store/                       # Zustand state management
│   │   ├── authStore.js             # Auth state
│   │   └── adminStore.js            # Admin-specific state
│   │
│   ├── config/                      # Configuration
│   │   └── tailwindTheme.js
│   │
│   ├── styles/                      # Global styles
│   │   └── index.css
│   │
│   ├── api/                         # API client setup
│   │   └── axios.js
│   │
│   ├── App.jsx                      # Root component
│   └── main.jsx                     # Entry point
│
├── public/                          # Static assets
├── index.html                       # HTML template
├── vite.config.js                   # Vite configuration
├── tailwind.config.js               # Tailwind CSS config
├── postcss.config.js                # PostCSS config
├── eslint.config.js                 # ESLint rules
├── package.json                     # Dependencies
└── README.md
```

---

## Database Schema

### Core Collections

#### 1. **User Collection**
```javascript
{
  fullName: String,
  email: String (unique),
  password: String (hashed),
  phone: String,
  avatar: String (Cloudinary URL),
  role: ["USER", "ADMIN", "VENDOR", "SHIPPER", "MAINTENANCE_STAFF"],
  vendorType: ["COURT", "EQUIPMENT"],
  maintenanceSkills: ["COURT", "EQUIPMENT"],
  status: ["ACTIVE", "BLOCKED"],
  lastLogin: Date,
  timestamps: { createdAt, updatedAt }
}
```

#### 2. **Court Collection**
```javascript
{
  name: String,
  location: String,
  description: String,
  images: [String],
  vendor: ObjectId (User ref),
  courtType: String,
  pricePerHour: Number,
  amenities: [String],
  status: ["ACTIVE", "INACTIVE"],
  averageRating: Number,
  totalReviews: Number,
  timestamps: { createdAt, updatedAt }
}
```

#### 3. **Booking Collection**
```javascript
{
  user: ObjectId (User ref),
  court: ObjectId (Court ref),
  courtSlot: ObjectId (CourtSlot ref),
  bookingDate: Date,
  startTime: String,
  endTime: String,
  totalPrice: Number,
  status: ["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED"],
  equipment: [ObjectId],
  couponUsed: ObjectId,
  pointsUsed: Number,
  timestamps: { createdAt, updatedAt }
}
```

#### 4. **CourtSlot Collection**
```javascript
{
  court: ObjectId (Court ref),
  slotDate: Date,
  startTime: String,
  endTime: String,
  status: ["AVAILABLE", "BOOKED", "MAINTENANCE"],
  booking: ObjectId (Booking ref),
  isRecurring: Boolean,
  timestamps: { createdAt, updatedAt }
}
```

#### 5. **Coupon Collection**
```javascript
{
  code: String (unique),
  description: String,
  discountType: ["PERCENTAGE", "FIXED"],
  discountValue: Number,
  maxUsages: Number,
  currentUsages: Number,
  startDate: Date,
  endDate: Date,
  minOrderValue: Number,
  createdBy: ObjectId (Admin ref),
  timestamps: { createdAt, updatedAt }
}
```

#### 6. **PointTransaction Collection**
```javascript
{
  user: ObjectId (User ref),
  points: Number,
  type: ["EARNED", "SPENT"],
  reason: String,
  relatedBooking: ObjectId,
  timestamps: { createdAt, updatedAt }
}
```

#### 7. **Review Collection**
```javascript
{
  user: ObjectId (User ref),
  court: ObjectId (Court ref),
  rating: Number (1-5),
  comment: String,
  status: ["PENDING", "APPROVED", "REJECTED"],
  timestamps: { createdAt, updatedAt }
}
```

#### 8. **Equipment Collection**
```javascript
{
  name: String,
  description: String,
  vendor: ObjectId (User ref),
  rentalPrice: Number,
  quantity: Number,
  image: String,
  status: ["AVAILABLE", "UNAVAILABLE"],
  timestamps: { createdAt, updatedAt }
}
```

**Additional Collections:** NotificationModel, MaintenanceModel, DeliveryModel, WalletModel, WalletTransactionModel, SystemSettingModel, and more...

---

## Setup & Installation

### Prerequisites
- **Node.js** v18+ and npm/yarn
- **MongoDB** (Atlas or local instance)
- **Redis** (for caching and rate limiting)
- **Git**
- Environment variables configured

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables** (`.env`):
   ```env
   PORT=5000
   MONGO_URL=mongodb://127.0.0.1:27017/pickleball_booking
   REDIS_URL=redis://127.0.0.1:6379

   JWT_ACCESS_SECRET=your_access_secret_key
   JWT_REFRESH_SECRET=your_refresh_secret_key
   JWT_ACCESS_EXPIRATION=15m
   JWT_REFRESH_EXPIRATION=7d

   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret

   MAIL_HOST=smtp.gmail.com
   MAIL_PORT=465
   MAIL_USER=your_email@gmail.com
   MAIL_PASSWORD=your_app_password

   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret

   FRONTEND_URL=http://localhost:5173
   ```

4. **Seed database (optional):**
   ```bash
   npm run seed
   ```

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables** (`.env`):
   ```env
   VITE_API_URL=http://localhost:5000/api
   VITE_GOOGLE_CLIENT_ID=your_google_client_id
   ```

4. **Install Tailwind CSS and build tools** (already included):
   ```bash
   npm install
   ```

---

## Running the Application

### Backend

**Development mode with auto-reload:**
```bash
cd backend
npm run dev
```

The backend will start on `http://localhost:5000`

**Production build:**
```bash
NODE_ENV=production node src/server.js
```

### Frontend

**Development mode with hot reload:**
```bash
cd frontend
npm run dev
```

The frontend will be available at `http://localhost:5173`

**Production build:**
```bash
npm run build
npm run preview
```

### Running Both Simultaneously

Open two terminals:
```bash
# Terminal 1: Backend
cd backend && npm run dev

# Terminal 2: Frontend
cd frontend && npm run dev
```

---

## API Documentation

### Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | User registration |
| POST | `/api/auth/login` | User login |
| POST | `/api/auth/google-login` | Google OAuth login |
| POST | `/api/auth/refresh-token` | Refresh access token |
| POST | `/api/auth/logout` | User logout |
| POST | `/api/auth/forgot-password` | Request password reset |
| POST | `/api/auth/reset-password` | Reset password with token |

### Court Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/courts` | List all courts |
| GET | `/api/courts/:id` | Get court details |
| POST | `/api/courts` | Create court (Vendor only) |
| PUT | `/api/courts/:id` | Update court (Vendor only) |
| DELETE | `/api/courts/:id` | Delete court (Vendor only) |
| GET | `/api/courts/:id/slots` | Get court slots |
| POST | `/api/courts/favorite/:id` | Add to favorites |
| DELETE | `/api/courts/favorite/:id` | Remove from favorites |

### Booking Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/bookings` | List user bookings |
| POST | `/api/bookings` | Create booking |
| GET | `/api/bookings/:id` | Get booking details |
| PUT | `/api/bookings/:id` | Update booking status |
| DELETE | `/api/bookings/:id` | Cancel booking |
| GET | `/api/bookings/analytics/summary` | Booking analytics |

### Additional API Routes
- `/api/users/` - User management
- `/api/coupons/` - Coupon management
- `/api/points/` - Points transactions
- `/api/reviews/` - Reviews and ratings
- `/api/equipment/` - Equipment management
- `/api/admin/` - Admin operations
- `/api/notifications/` - Notifications
- `/api/maintenance/` - Maintenance requests
- `/api/shipper/` - Delivery management

**Full API documentation available at:** Backend routes folder with detailed endpoint specifications in each route file.

---

## Environment Configuration

### Backend Environment Variables

```env
# Server
PORT=5000
FRONTEND_URL=http://localhost:5173

# Database
MONGO_URL=mongodb://127.0.0.1:27017/pickleball_booking

# Cache
REDIS_URL=redis://127.0.0.1:6379

# Authentication
JWT_ACCESS_SECRET=your_secret_key
JWT_REFRESH_SECRET=your_refresh_secret_key
JWT_ACCESS_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d

# Google OAuth
GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_client_secret

# Email Service
MAIL_HOST=smtp.gmail.com
MAIL_PORT=465
MAIL_USER=your_email@gmail.com
MAIL_PASSWORD=your_app_specific_password

# Image Storage
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Frontend Environment Variables

```env
VITE_API_URL=http://localhost:5000/api
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

---

## Development Guidelines

### Code Standards

1. **Naming Conventions:**
   - Controllers: `feature.controller.js`
   - Services: `feature.service.js`
   - Models: `feature.model.js`
   - Routes: `feature.routes.js`
   - Variables: camelCase
   - Constants: UPPER_SNAKE_CASE
   - React components: PascalCase

2. **Error Handling:**
   - Use custom error handler utility
   - Return meaningful error messages
   - Log errors appropriately
   - Use proper HTTP status codes

3. **Validation:**
   - Validate all inputs using express-validator
   - Implement server-side validation always
   - Use proper error response format

4. **Security:**
   - Use JWT for authentication
   - Hash passwords with bcryptjs
   - Implement CORS restrictions
   - Use rate limiting for API endpoints
   - Validate and sanitize all inputs
   - Set secure HTTP headers

5. **Performance:**
   - Use MongoDB indexes on frequently queried fields
   - Implement Redis caching for expensive operations
   - Use repository pattern for database queries
   - Optimize queries with proper pagination

### Git Workflow

```bash
# Create feature branch
git checkout -b feature/feature-name

# Make changes and commit
git commit -m "feat: add feature description"

# Push to remote
git push origin feature/feature-name

# Create pull request and merge after review
```

### Linting (Frontend)

```bash
cd frontend
npm run lint
```

---

## Deployment Considerations

### Backend Deployment
- Set `NODE_ENV=production`
- Use production MongoDB Atlas connection
- Configure HTTPS/SSL
- Set up proper logging and monitoring
- Use environment variable management system
- Implement database backup strategy
- Use PM2 or similar for process management

### Frontend Deployment
- Build optimized bundle: `npm run build`
- Deploy to CDN or static hosting
- Configure API endpoint for production
- Enable compression and caching headers
- Set up error tracking

---

## Troubleshooting

### Common Issues

**MongoDB Connection Error:**
- Ensure MongoDB service is running
- Verify MONGO_URL in .env
- Check firewall/network connectivity

**Redis Connection Error:**
- Ensure Redis service is running
- Verify REDIS_URL in .env
- Check port and network settings

**CORS Errors:**
- Verify FRONTEND_URL in backend .env
- Check frontend API_URL configuration
- Ensure credentials flag is set correctly

**JWT Token Expiration:**
- Token expires in 15m by default (configurable)
- Use refresh token to get new access token
- Check token expiration settings in .env

---

## Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request
5. Code review and merge

---

## License

ISC

---

## Support

For issues, feature requests, or improvements, please create an issue or contact the development team.

---

**Last Updated:** June 30, 2026  
**Version:** 1.0.0
