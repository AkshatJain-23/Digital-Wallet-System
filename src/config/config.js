require('dotenv').config();

module.exports = {
    PORT: process.env.PORT || 3000,
    MONGODB_URI: process.env.MONGODB_URI || 'mongodb+srv://akshatt23:Sunilsushma%402002@cluster0.px1ra7o.mongodb.net/digital-wallet?retryWrites=true&w=majority&appName=Cluster0',
    JWT_SECRET: process.env.JWT_SECRET || 'your-secret-key',
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '24h',
    RATE_LIMIT_WINDOW: process.env.RATE_LIMIT_WINDOW || 15 * 60 * 1000, // 15 minutes
    RATE_LIMIT_MAX: process.env.RATE_LIMIT_MAX || 100, // max requests per window
    MIN_TRANSACTION_AMOUNT: 1,
    MAX_TRANSACTION_AMOUNT: 10000,
    MAX_DAILY_TRANSFER_LIMIT: 50000
}; 