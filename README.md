# Gym Management System

A comprehensive MERN stack application for managing gym operations, memberships, attendance, and payments. Built with Next.js, MongoDB, Mongoose, React, and TypeScript.

## Overview

The Gym Management System is a full-featured platform designed to streamline gym operations with role-based dashboards for Admins, Trainers, and Members. The system handles membership management, attendance tracking, payment processing, and comprehensive analytics.

## Features

- **Role-Based Access Control**: Separate dashboards for Admin, Trainer, and Member roles
- **Authentication**: JWT-based secure authentication with bcrypt password hashing
- **Membership Management**: Create, update, and manage membership plans and member accounts
- **Attendance Tracking**: Log gym attendance with automatic date/time recording
- **Payment Processing**: Simulate membership renewals and track payment history
- **Analytics Dashboard**: Real-time statistics, revenue charts, and membership insights
- **Notifications**: Toast notifications for user feedback and system events
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## Project Structure

\`\`\`
gym-management-system/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── register/route.ts       # User registration endpoint
│   │   │   └── login/route.ts          # User login endpoint
│   │   ├── admin/
│   │   │   └── stats/route.ts          # Admin statistics endpoint
│   │   ├── members/route.ts            # Member management endpoints
│   │   ├── attendance/
│   │   │   └── log/route.ts            # Attendance logging endpoint
│   │   └── payments/
│   │       └── renew/route.ts          # Payment processing endpoint
│   ├── admin/
│   │   └── dashboard/page.tsx          # Admin dashboard page
│   ├── member/
│   │   └── dashboard/page.tsx          # Member dashboard page
│   ├── trainer/
│   │   └── dashboard/page.tsx          # Trainer dashboard page
│   ├── login/page.tsx                  # Login page
│   ├── register/page.tsx               # Registration page
│   ├── layout.tsx                      # Root layout
│   ├── globals.css                     # Global styles
│   └── page.tsx                        # Home page
├── components/
│   ├── admin-dashboard.tsx             # Admin dashboard component
│   ├── member-dashboard.tsx            # Member dashboard component
│   ├── trainer-dashboard.tsx           # Trainer dashboard component
│   ├── login-form.tsx                  # Login form component
│   ├── register-form.tsx               # Registration form component
│   ├── theme-provider.tsx              # Theme provider component
│   └── ui/                             # shadcn UI components (60+ components)
├── lib/
│   ├── db.ts                           # MongoDB connection setup
│   ├── auth.ts                         # Authentication utilities
│   ├── utils.ts                        # General utility functions
│   └── models/
│       ├── User.ts                     # User model (Admin, Trainer, Member)
│       ├── Member.ts                   # Member model with membership info
│       ├── Trainer.ts                  # Trainer model
│       ├── Attendance.ts               # Attendance log model
│       ├── Payment.ts                  # Payment transaction model
│       └── Plan.ts                     # Membership plan model
├── public/
│   └── placeholder-*.{png,jpg,svg}     # Placeholder assets
├── hooks/
│   ├── use-mobile.ts                   # Mobile detection hook
│   └── use-toast.ts                    # Toast notification hook
├── styles/
│   └── globals.css                     # Global stylesheet
├── package.json                        # Dependencies and scripts
├── tsconfig.json                       # TypeScript configuration
├── next.config.mjs                     # Next.js configuration
├── postcss.config.mjs                  # PostCSS configuration
├── tailwind.config.js                  # Tailwind CSS configuration
└── README.md                           # This file
\`\`\`

## Technology Stack

### Frontend
- **Next.js 16**: React framework with App Router
- **React 19**: UI library
- **TypeScript**: Type safety
- **Tailwind CSS 4**: Utility-first CSS framework
- **shadcn/ui**: High-quality React components
- **Recharts**: Charts and data visualization
- **Sonner**: Toast notifications
- **React Hook Form**: Form state management
- **Zod**: TypeScript-first schema validation

### Backend
- **Node.js**: Runtime environment
- **Next.js API Routes**: Serverless backend functions
- **MongoDB**: NoSQL database
- **Mongoose**: MongoDB ODM (Object Document Mapper)
- **JWT (jsonwebtoken)**: Authentication token generation
- **bcryptjs**: Password hashing

### Development
- **TypeScript**: Type safety
- **ESLint**: Code linting
- **PostCSS**: CSS processing
- **Autoprefixer**: CSS vendor prefixes

## Installation

### Prerequisites

Before you begin, ensure you have the following installed:
- Node.js 18.0 or higher
- npm, yarn, or pnpm package manager
- MongoDB (local installation or MongoDB Atlas account)

### Step 1: Clone or Download the Project

\`\`\`bash
# If cloning from GitHub
git clone <repository-url>
cd gym-management-system

# Or download the ZIP and extract
cd gym-management-system
\`\`\`

### Step 2: Install Dependencies

\`\`\`bash
# Using npm
npm install

# Using yarn
yarn install

# Using pnpm
pnpm install
\`\`\`

### Step 3: Environment Configuration

Create a `.env.local` file in the root directory with the following variables:

\`\`\`env
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/gym_management
# OR for MongoDB Atlas
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/gym_management?retryWrites=true&w=majority

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production

# Application URLs
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000
\`\`\`

#### Environment Variable Explanation

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/gym_management` |
| `JWT_SECRET` | Secret key for JWT token signing | `your_secret_key_here` |
| `NEXT_PUBLIC_API_URL` | API endpoint URL (accessible on client) | `http://localhost:3000` |
| `NEXT_PUBLIC_APP_URL` | Application URL (accessible on client) | `http://localhost:3000` |

### Step 4: Set Up MongoDB

#### Option A: Local MongoDB Installation

\`\`\`bash
# Start MongoDB service (Linux/Mac)
brew services start mongodb-community

# Start MongoDB service (Windows)
# Run MongoDB as a service or use MongoDB Compass GUI

# Verify MongoDB is running
mongosh
\`\`\`

#### Option B: MongoDB Atlas (Cloud)

1. Visit [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account
3. Create a new cluster
4. Get your connection string from "Connect" → "Drivers"
5. Update `MONGODB_URI` in `.env.local` with your connection string

### Step 5: Run the Application

\`\`\`bash
# Development mode
npm run dev

# Production build
npm run build
npm start

# Run linting
npm run lint
\`\`\`

The application will be available at `http://localhost:3000`

## Usage

### First Time Setup

1. **Visit Home Page**: Navigate to `http://localhost:3000`
2. **Register an Account**: Click "Register" and choose your role:
   - **Admin**: Full access to all features, user management, and analytics
   - **Trainer**: Manage assigned members and track attendance
   - **Member**: View membership details, attendance logs, and renew membership
3. **Login**: Use your credentials to access the dashboard

### Admin Dashboard

- **View Statistics**: See total members, active/expired memberships, trainers, and monthly revenue
- **Revenue Charts**: Visualize monthly income trends
- **Membership Distribution**: View pie chart of active vs expired memberships
- **Manage Members**: Add, update, and manage member accounts
- **Create Plans**: Define membership plans with pricing and duration
- **Track Revenue**: Monitor payment transactions and gym income

### Trainer Dashboard

- **Assigned Members**: View list of members assigned to you
- **Member Details**: See membership type, expiry date, and contact info
- **Log Attendance**: Mark member attendance during workouts
- **Quick Actions**: Easy buttons for common tasks

### Member Dashboard

- **Membership Info**: View current membership type and expiry date
- **Active Status**: Check if membership is active or expired
- **Log Attendance**: Record your gym visits
- **Renew Membership**: Process renewal payments
- **Attendance History**: View past attendance logs

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - User login with credentials

### Admin
- `GET /api/admin/stats` - Get dashboard statistics

### Members
- `GET /api/members` - Get list of members
- `POST /api/members` - Create new member
- `PUT /api/members/:id` - Update member info
- `DELETE /api/members/:id` - Delete member

### Attendance
- `POST /api/attendance/log` - Log attendance for member

### Payments
- `POST /api/payments/renew` - Process membership renewal

## Database Schema

### User Model
- `_id`: ObjectId
- `email`: String (unique)
- `password`: String (hashed)
- `role`: String (Admin, Trainer, Member)
- `name`: String
- `createdAt`: Date

### Member Model
- `_id`: ObjectId
- `userId`: ObjectId (reference to User)
- `membershipPlan`: ObjectId (reference to Plan)
- `joinDate`: Date
- `expiryDate`: Date
- `isActive`: Boolean
- `createdAt`: Date

### Trainer Model
- `_id`: ObjectId
- `userId`: ObjectId (reference to User)
- `specialization`: String
- `assignedMembers`: [ObjectId] (references to Members)
- `createdAt`: Date

### Attendance Model
- `_id`: ObjectId
- `memberId`: ObjectId (reference to Member)
- `date`: Date
- `timeIn`: String
- `createdAt`: Date

### Payment Model
- `_id`: ObjectId
- `memberId`: ObjectId (reference to Member)
- `amount`: Number
- `planDuration`: Number (months)
- `status`: String (success, pending, failed)
- `transactionDate`: Date

### Plan Model
- `_id`: ObjectId
- `name`: String
- `price`: Number
- `duration`: Number (months)
- `description`: String
- `createdAt`: Date

## Authentication & Security

### Password Security
- Passwords are hashed using bcryptjs with salt rounds of 10
- Never store plain text passwords
- Passwords are validated on registration and login

### JWT Tokens
- JWT tokens are issued upon successful login
- Tokens expire after 7 days (configurable)
- Tokens are validated on protected API routes
- Store tokens in secure HTTP-only cookies or localStorage

### Protected Routes
- Admin routes require `role === 'Admin'`
- Trainer routes require `role === 'Trainer'`
- Member routes require `role === 'Member'`
- All protected routes validate JWT tokens

## Troubleshooting

### MongoDB Connection Issues

**Error: "connect ECONNREFUSED 127.0.0.1:27017"**
- Ensure MongoDB is running
- Check MongoDB connection string in `.env.local`
- For local MongoDB: `brew services start mongodb-community` (Mac)

**Error: "authentication failed"**
- Verify MongoDB Atlas credentials
- Check username, password, and cluster name in connection string
- Ensure IP is whitelisted in MongoDB Atlas security settings

### Port Already in Use

**Error: "EADDRINUSE: address already in use :::3000"**
\`\`\`bash
# Kill process using port 3000
lsof -ti:3000 | xargs kill -9

# Or use a different port
PORT=3001 npm run dev
\`\`\`

### JWT/Authentication Errors

**Error: "Invalid token"**
- Ensure `JWT_SECRET` is set in `.env.local`
- Clear browser cookies and login again
- Check token expiration time

### TypeScript Errors

\`\`\`bash
# Rebuild TypeScript cache
rm -rf .next node_modules
npm install
npm run dev
\`\`\`

## Development Tips

### Console Logging
Use the debug pattern for troubleshooting:
\`\`\`typescript
console.log("[v0] Debug message:", data)
\`\`\`

### Hot Reload
The development server auto-reloads on file changes. Just save and refresh your browser.

### Database Inspection
\`\`\`bash
# Connect to MongoDB and inspect collections
mongosh
use gym_management
db.users.find()
db.members.find()
\`\`\`

## Performance Optimization

- MongoDB connections are cached per request
- JWT tokens reduce database queries
- Charts are rendered client-side with Recharts
- UI components are optimized with React 19

## Deployment

### Deploy to Vercel

1. Push code to GitHub
2. Visit [Vercel](https://vercel.com)
3. Import your GitHub repository
4. Add environment variables in Vercel dashboard
5. Deploy with one click

\`\`\`bash
# Or deploy via CLI
npm i -g vercel
vercel
\`\`\`

### Deploy to Other Platforms

Ensure your hosting platform supports:
- Node.js runtime
- Environment variables
- MongoDB connectivity (local or Atlas)

## Future Enhancements

- Email notifications for membership expiry
- SMS alerts for attendance
- Mobile app (React Native)
- Payment gateway integration (Stripe/PayPal)
- Advanced analytics and reports
- Member workout history tracking
- Nutritionist consultation scheduling

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For issues, questions, or suggestions:
- Create an issue on GitHub
- Contact support@gymmanagement.com
- Visit our documentation at [docs.gymmanagement.com](https://docs.gymmanagement.com)

## Changelog

### Version 0.1.0
- Initial release with core features
- Admin, Trainer, Member role-based dashboards
- Attendance tracking and payment processing
- Analytics and notifications system
- Full authentication with JWT and bcrypt

---

**Happy Gym Management! 🏋️**
