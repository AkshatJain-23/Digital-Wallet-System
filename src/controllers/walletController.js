const User = require('../models/User');
const Transaction = require('../models/Transaction');

const deposit = async (req, res) => {
    try {
        const { amount, description } = req.body;
        const userId = req.user._id;
        const currency = req.body.currency || 'USD';

        // Create transaction record
        const transaction = new Transaction({
            type: 'DEPOSIT',
            amount,
            currency,
            receiver: userId,
            description,
            metadata: req.fraudDetection
        });

        // Update user wallet balance
        const user = await User.findById(userId);
        let wallet = user.wallets.find(w => w.currency === currency);
        if (!wallet) {
            wallet = user.wallets.create({ currency, balance: 0 }); // Use Mongoose subdocument
            user.wallets.push(wallet);
        }
        wallet.balance += amount;
        user.markModified('wallets');
        await user.save();

        // Save transaction
        transaction.status = 'COMPLETED';
        await transaction.save();

        res.json({
            message: 'Deposit successful',
            transaction,
            newBalance: wallet.balance
        });
    } catch (error) {
        res.status(500).json({ error: 'Error processing deposit' });
    }
};

const withdraw = async (req, res) => {
    try {
        const { amount, description } = req.body;
        const userId = req.user._id;
        const currency = req.body.currency || 'USD';

        // Update user wallet balance
        const user = await User.findById(userId);
        let wallet = user.wallets.find(w => w.currency === currency);
        if (!wallet || wallet.balance < amount) {
            return res.status(400).json({ error: 'Insufficient balance' });
        }

        // Create transaction record
        const transaction = new Transaction({
            type: 'WITHDRAWAL',
            amount,
            currency,
            sender: userId,
            description,
            metadata: req.fraudDetection
        });

        wallet.balance -= amount;
        await user.save();

        // Save transaction
        transaction.status = 'COMPLETED';
        await transaction.save();

        res.json({
            message: 'Withdrawal successful',
            transaction,
            newBalance: wallet.balance
        });
    } catch (error) {
        res.status(500).json({ error: 'Error processing withdrawal' });
    }
};

const transfer = async (req, res) => {
    try {
        const { amount, receiverEmail, receiverId, description, currency = 'USD' } = req.body;
        const senderId = req.user._id;

        // Input validation
        if (!amount || amount <= 0) {
            return res.status(400).json({ error: 'Invalid amount' });
        }

        // Find receiver by email or id
        let receiver;
        if (receiverId) {
            receiver = await User.findById(receiverId);
        } else if (receiverEmail) {
            receiver = await User.findOne({ email: receiverEmail });
        }
        if (!receiver) {
            return res.status(404).json({ error: 'Receiver not found' });
        }
        if (senderId.toString() === receiver._id.toString()) {
            return res.status(400).json({ error: 'Cannot transfer to yourself' });
        }

        // Start a session for transaction
        const session = await User.startSession();
        session.startTransaction();

        try {
            // Update sender wallet
            const sender = await User.findById(senderId).session(session);
            let senderWallet = sender.wallets.find(w => w.currency === currency);
            if (!senderWallet || senderWallet.balance < amount) {
                await session.abortTransaction();
                return res.status(400).json({ error: 'Insufficient balance' });
            }
            senderWallet.balance -= amount;
            sender.dailyTransferAmount += amount;
            sender.markModified('wallets');

            // Update receiver wallet
            let receiverWallet = receiver.wallets.find(w => w.currency === currency);
            if (!receiverWallet) {
                receiverWallet = receiver.wallets.create({ currency, balance: 0 });
                receiver.wallets.push(receiverWallet);
            }
            receiverWallet.balance += amount;
            receiver.markModified('wallets');

            // Create transaction record
            const transaction = new Transaction({
                type: 'TRANSFER',
                amount,
                currency,
                sender: senderId,
                receiver: receiver._id,
                description,
                metadata: req.fraudDetection,
                status: 'COMPLETED'
            });

            // Save all changes
            await Promise.all([
                sender.save({ session }),
                receiver.save({ session }),
                transaction.save({ session })
            ]);

            // Logging for debugging
            console.log('Receiver new balance:', receiver.wallets.find(w => w.currency === currency).balance);

            await session.commitTransaction();

            res.json({
                message: 'Transfer successful',
                transaction,
                newBalance: senderWallet.balance
            });
        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            session.endSession();
        }
    } catch (error) {
        console.error('Transfer error:', error);
        res.status(500).json({ error: 'Error processing transfer' });
    }
};

const getBalance = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        // Find USD wallet
        const wallet = user.wallets.find(w => w.currency === 'USD');
        res.json({
            balance: wallet ? wallet.balance : 0
        });
    } catch (error) {
        res.status(500).json({ error: 'Error fetching balance' });
    }
};

const getTransactionHistory = async (req, res) => {
    try {
        const userId = req.user._id;
        const transactions = await Transaction.find({
            $or: [{ sender: userId }, { receiver: userId }]
        })
        .sort({ createdAt: -1 })
        .limit(50)
        .populate('sender receiver', 'username email');

        res.json(transactions);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching transaction history' });
    }
};

module.exports = {
    deposit,
    withdraw,
    transfer,
    getBalance,
    getTransactionHistory
}; 