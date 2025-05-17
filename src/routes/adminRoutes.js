const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
    getFlaggedTransactions,
    getTotalBalances,
    getTopUsersByBalance,
    getTopUsersByVolume,
    softDeleteUser,
    softDeleteTransaction
} = require('../controllers/adminController');

// Admin middleware (you should implement proper admin role checking)
const isAdmin = (req, res, next) => {
    // TODO: Implement proper admin role checking
    next();
};

// Protected admin routes
router.use(auth);
router.use(isAdmin);

// Reporting endpoints
router.get('/flagged-transactions', getFlaggedTransactions);
router.get('/total-balances', getTotalBalances);
router.get('/top-users/balance', getTopUsersByBalance);
router.get('/top-users/volume', getTopUsersByVolume);

// Management endpoints
router.delete('/users/:userId', softDeleteUser);
router.delete('/transactions/:transactionId', softDeleteTransaction);

module.exports = router; 