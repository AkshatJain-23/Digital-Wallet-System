const User = require('../models/User');
const Transaction = require('../models/Transaction');

// Get flagged transactions
const getFlaggedTransactions = async (req, res) => {
    try {
        const transactions = await Transaction.find({
            isFraudulent: true,
            isDeleted: false
        })
        .sort({ createdAt: -1 })
        .populate('sender receiver', 'username email');

        res.json({ transactions });
    } catch (error) {
        res.status(500).json({ error: 'Error fetching flagged transactions' });
    }
};

// Get total balances by currency
const getTotalBalances = async (req, res) => {
    try {
        const users = await User.find({ isDeleted: false });
        const balances = {
            USD: 0,
            EUR: 0,
            GBP: 0,
            JPY: 0
        };

        users.forEach(user => {
            user.wallets.forEach(wallet => {
                balances[wallet.currency] += wallet.balance;
            });
        });

        res.json({ balances });
    } catch (error) {
        res.status(500).json({ error: 'Error calculating total balances' });
    }
};

// Get top users by balance
const getTopUsersByBalance = async (req, res) => {
    try {
        const { currency = 'USD', limit = 10 } = req.query;
        
        const users = await User.find({ isDeleted: false })
            .sort({ [`wallets.${currency}.balance`]: -1 })
            .limit(parseInt(limit))
            .select('username email wallets');

        res.json({ users });
    } catch (error) {
        res.status(500).json({ error: 'Error fetching top users' });
    }
};

// Get top users by transaction volume
const getTopUsersByVolume = async (req, res) => {
    try {
        const { currency = 'USD', limit = 10 } = req.query;
        
        const transactions = await Transaction.aggregate([
            {
                $match: {
                    currency,
                    status: 'COMPLETED',
                    isDeleted: false
                }
            },
            {
                $group: {
                    _id: '$sender',
                    totalVolume: { $sum: '$amount' }
                }
            },
            {
                $sort: { totalVolume: -1 }
            },
            {
                $limit: parseInt(limit)
            },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'user'
                }
            },
            {
                $unwind: '$user'
            },
            {
                $project: {
                    username: '$user.username',
                    email: '$user.email',
                    totalVolume: 1
                }
            }
        ]);

        res.json({ users: transactions });
    } catch (error) {
        res.status(500).json({ error: 'Error fetching top users by volume' });
    }
};

// Soft delete user
const softDeleteUser = async (req, res) => {
    try {
        const { userId } = req.params;
        
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        user.isDeleted = true;
        user.isActive = false;
        await user.save();

        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Error deleting user' });
    }
};

// Soft delete transaction
const softDeleteTransaction = async (req, res) => {
    try {
        const { transactionId } = req.params;
        
        const transaction = await Transaction.findById(transactionId);
        if (!transaction) {
            return res.status(404).json({ error: 'Transaction not found' });
        }

        transaction.isDeleted = true;
        await transaction.save();

        res.json({ message: 'Transaction deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Error deleting transaction' });
    }
};

module.exports = {
    getFlaggedTransactions,
    getTotalBalances,
    getTopUsersByBalance,
    getTopUsersByVolume,
    softDeleteUser,
    softDeleteTransaction
}; 