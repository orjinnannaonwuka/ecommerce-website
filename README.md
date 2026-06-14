# E-Commerce Website

A complete full-stack e-commerce platform with customer and admin functionality.

## Features

### Customer Side
- Home page with featured products
- Product catalog with search and filtering
- Product details page
- Shopping cart management
- Checkout flow
- User registration and login
- Order history
- Wishlist functionality

### Admin Side
- Admin dashboard with analytics
- Product management (Add/Edit/Delete)
- Product image uploads
- Order management
- User management
- Sales analytics and reports

## Tech Stack

### Frontend
- React 18 with TypeScript
- Tailwind CSS for styling
- Redux Toolkit for state management
- Axios for API calls

### Backend
- Node.js with Express
- PostgreSQL database
- JWT authentication
- Stripe payment integration
- Multer for file uploads

### Deployment
- Docker & Docker Compose
- GitHub Actions CI/CD
- Production-ready configuration

## Project Structure

```
ecommerce-website/
├── frontend/                 # React frontend application
├── backend/                  # Express backend API
├── database/                 # Database migrations and seeds
├── docker-compose.yml        # Docker orchestration
├── Dockerfile               # Backend containerization
├── .github/workflows/       # CI/CD pipelines
└── README.md
```

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL 12+
- Docker & Docker Compose
- Git

### Installation

1. Clone the repository
```bash
git clone https://github.com/orjinnannaonwuka/ecommerce-website.git
cd ecommerce-website
```

2. Install dependencies
```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

3. Setup environment variables
```bash
# Backend .env
DATABASE_URL=postgresql://user:password@localhost:5432/ecommerce
JWT_SECRET=your_jwt_secret_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_PUBLIC_KEY=your_stripe_public_key
NODE_ENV=development
```

4. Setup database
```bash
cd backend
npm run migrate
npm run seed
```

5. Start the application

**Development:**
```bash
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend
cd frontend && npm start
```

**Docker:**
```bash
docker-compose up
```

## API Endpoints

### Auth
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product details
- `POST /api/products` - Create product (Admin)
- `PUT /api/products/:id` - Update product (Admin)
- `DELETE /api/products/:id` - Delete product (Admin)

### Orders
- `GET /api/orders` - Get user orders
- `POST /api/orders` - Create order
- `GET /api/orders/:id` - Get order details
- `PUT /api/orders/:id` - Update order (Admin)

### Cart
- `GET /api/cart` - Get cart
- `POST /api/cart/add` - Add to cart
- `PUT /api/cart/update` - Update cart item
- `DELETE /api/cart/remove/:id` - Remove from cart

### Wishlist
- `GET /api/wishlist` - Get wishlist
- `POST /api/wishlist/add` - Add to wishlist
- `DELETE /api/wishlist/remove/:id` - Remove from wishlist

## Deployment

### Environment
Set environment variables in your hosting platform:
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - JWT signing secret
- `STRIPE_SECRET_KEY` - Stripe API key
- `STRIPE_PUBLIC_KEY` - Stripe public key
- `NODE_ENV` - Production

### Docker Deployment
```bash
docker build -t ecommerce-backend .
docker run -d -p 5000:5000 --env-file .env ecommerce-backend
```

## License

MIT License - feel free to use this project for your own purposes.

## Support

For issues and feature requests, please open a GitHub issue.
