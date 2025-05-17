const axios = require('axios');

const API_URL = 'http://localhost:4000/api';

// Test user data
const user1 = {
    username: 'testuser1',
    email: 'test1@example.com',
    password: 'password123'
};

const user2 = {
    username: 'testuser2',
    email: 'test2@example.com',
    password: 'password123'
};

let user1Token;
let user2Token;
let user2Id;

// Helper function to make authenticated requests
const makeAuthRequest = async (token, method, endpoint, data = null) => {
    try {
        const response = await axios({
            method,
            url: `${API_URL}${endpoint}`,
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            data
        });
        return response.data;
    } catch (error) {
        console.error('Error:', error.response?.data || error.message);
        return null;
    }
};

// Test the wallet system
const testWalletSystem = async () => {
    console.log('🚀 Testing Digital Wallet System\n');

    // 1. Register users
    console.log('1. Registering users...');
    try {
        await axios.post(`${API_URL}/auth/register`, user1);
        await axios.post(`${API_URL}/auth/register`, user2);
        console.log('✅ Users registered successfully\n');
    } catch (error) {
        if (error.response?.status === 409) {
            console.log('ℹ️ Users already exist, proceeding with login...\n');
        } else {
            console.log('❌ Error registering users:', error.response?.data || error.message);
            return;
        }
    }

    // 2. Login users
    console.log('2. Logging in users...');
    try {
        const login1 = await axios.post(`${API_URL}/auth/login`, {
            email: user1.email,
            password: user1.password
        });
        const login2 = await axios.post(`${API_URL}/auth/login`, {
            email: user2.email,
            password: user2.password
        });
        user1Token = login1.data.token;
        user2Token = login2.data.token;
        user2Id = login2.data.user.id;
        console.log('✅ Users logged in successfully\n');
    } catch (error) {
        console.log('❌ Error logging in:', error.response?.data || error.message);
        return;
    }

    // 3. Deposit money to user1
    console.log('3. Depositing money to user1...');
    const deposit = await makeAuthRequest(user1Token, 'post', '/wallet/deposit', {
        amount: 1000,
        currency: 'USD',
        description: 'Initial deposit'
    });
    if (deposit) {
        console.log('✅ Deposit successful:', deposit);
    }

    // 4. Check user1's balance
    console.log('\n4. Checking user1 balance...');
    const balance = await makeAuthRequest(user1Token, 'get', '/wallet/balance');
    if (balance) {
        console.log('✅ Current balance:', balance);
    }

    // 5. Transfer money to user2
    console.log('\n5. Transferring money to user2...');
    const transfer = await makeAuthRequest(user1Token, 'post', '/wallet/transfer', {
        amount: 500,
        currency: 'USD',
        receiverId: user2Id,
        description: 'Transfer to user2'
    });
    if (transfer) {
        console.log('✅ Transfer successful:', transfer);
    }

    // 6. Check both users' balances
    console.log('\n6. Checking final balances...');
    const balance1 = await makeAuthRequest(user1Token, 'get', '/wallet/balance');
    const balance2 = await makeAuthRequest(user2Token, 'get', '/wallet/balance');
    if (balance1 && balance2) {
        console.log('✅ User1 balance:', balance1);
        console.log('✅ User2 balance:', balance2);
    }

    // 7. View transaction history
    console.log('\n7. Viewing transaction history...');
    const history = await makeAuthRequest(user1Token, 'get', '/wallet/transactions');
    if (history) {
        console.log('✅ Transaction history:', history);
    }
};

// Run the test
testWalletSystem().catch(console.error); 