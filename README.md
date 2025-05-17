# Digital Wallet System

A secure digital wallet system with cash management and fraud detection capabilities.

## Features

- User registration and authentication
- Virtual cash deposits and withdrawals
- Fund transfers between users
- Transaction history
- Basic fraud detection
- Rate limiting
- Session security

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- npm or yarn

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd digital-wallet-system
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with the following variables:
```
PORT=3000
MONGODB_URI=mongodb://localhost:27017/digital-wallet
JWT_SECRET=your-super-secret-key-change-this-in-production
JWT_EXPIRES_IN=24h
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX=100
```

4. Start the server:
```bash
npm start
```

## API Endpoints

### Authentication
- POST `/api/auth/register` - Register a new user
- POST `/api/auth/login` - Login user

### Wallet Operations
- POST `/api/wallet/deposit` - Deposit funds
- POST `/api/wallet/withdraw` - Withdraw funds
- POST `/api/wallet/transfer` - Transfer funds to another user
- GET `/api/wallet/balance` - Get current balance
- GET `/api/wallet/transactions` - Get transaction history

## Security Features

- Password hashing using bcrypt
- JWT-based authentication
- Rate limiting
- Transaction amount limits
- Fraud detection for suspicious patterns
- Daily transfer limits

## Error Handling

The API uses standard HTTP status codes:
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 404: Not Found
- 500: Internal Server Error

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request 