const API_URL = 'http://localhost:5000/api';
let token = localStorage.getItem('token');

// Check if user is logged in
if (token) {
    showWalletSection();
    updateBalance();
    loadTransactions();
}

// Register new user
async function register() {
    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, email, password })
        });

        const data = await response.json();
        if (response.ok) {
            showMessage('Registration successful! Please login.', 'success');
        } else {
            showMessage(data.error || 'Registration failed', 'error');
        }
    } catch (error) {
        showMessage('An error occurred', 'error');
    }
}

// Login user
async function login() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();
        if (response.ok) {
            token = data.token;
            localStorage.setItem('token', token);
            showWalletSection();
            updateBalance();
            loadTransactions();
        } else {
            showMessage(data.error || 'Login failed', 'error');
        }
    } catch (error) {
        showMessage('An error occurred', 'error');
    }
}

// Deposit money
async function deposit() {
    const amount = document.getElementById('depositAmount').value;

    try {
        const response = await fetch(`${API_URL}/wallet/deposit`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                amount: parseFloat(amount),
                currency: 'USD',
                description: 'Deposit via web interface'
            })
        });

        const data = await response.json();
        if (response.ok) {
            showMessage('Deposit successful!', 'success');
            updateBalance();
            loadTransactions();
            document.getElementById('depositAmount').value = '';
        } else {
            showMessage(data.error || 'Deposit failed', 'error');
        }
    } catch (error) {
        showMessage('An error occurred', 'error');
    }
}

// Withdraw money
async function withdraw() {
    const amount = document.getElementById('withdrawAmount').value;

    try {
        const response = await fetch(`${API_URL}/wallet/withdraw`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                amount: parseFloat(amount),
                currency: 'USD',
                description: 'Withdraw via web interface'
            })
        });

        const data = await response.json();
        if (response.ok) {
            showMessage('Withdrawal successful!', 'success');
            updateBalance();
            loadTransactions();
            document.getElementById('withdrawAmount').value = '';
        } else {
            showMessage(data.error || 'Withdrawal failed', 'error');
        }
    } catch (error) {
        showMessage('An error occurred', 'error');
    }
}

// Transfer money
async function transfer() {
    const receiverEmail = document.getElementById('receiverEmail').value;
    const amount = document.getElementById('transferAmount').value;

    try {
        const response = await fetch(`${API_URL}/wallet/transfer`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                amount: parseFloat(amount),
                currency: 'USD',
                receiverEmail,
                description: 'Transfer via web interface'
            })
        });

        const data = await response.json();
        if (response.ok) {
            showMessage('Transfer successful!', 'success');
            updateBalance();
            loadTransactions();
            document.getElementById('receiverEmail').value = '';
            document.getElementById('transferAmount').value = '';
        } else {
            showMessage(data.error || 'Transfer failed', 'error');
        }
    } catch (error) {
        showMessage('An error occurred', 'error');
    }
}

// Update balance display
async function updateBalance() {
    try {
        const response = await fetch(`${API_URL}/wallet/balance`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();
        if (response.ok) {
            document.getElementById('balance').textContent = `$${data.balance.toFixed(2)}`;
        }
    } catch (error) {
        showMessage('Failed to update balance', 'error');
    }
}

// Load transactions
async function loadTransactions() {
    try {
        const response = await fetch(`${API_URL}/wallet/transactions`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();
        if (response.ok) {
            const transactionsList = document.getElementById('transactionsList');
            transactionsList.innerHTML = '';

            data.forEach(transaction => {
                const transactionElement = document.createElement('div');
                transactionElement.className = 'transaction-item';
                let description = transaction.description;
                if (transaction.type === 'TRANSFER') {
                    // Outgoing or incoming transfer?
                    if (transaction.sender && transaction.sender.username && token) {
                        // Decode token to get current user id
                        const tokenData = parseJwt(token);
                        if (transaction.sender._id === tokenData.userId) {
                            // Outgoing transfer
                            if (transaction.receiver && transaction.receiver.username) {
                                description = `transferred to ${transaction.receiver.username}`;
                            } else {
                                description = 'transferred to recipient';
                            }
                        } else {
                            // Incoming transfer
                            description = `transferred by ${transaction.sender.username}`;
                        }
                    } else {
                        description = 'transfer';
                    }
                } else if (transaction.type === 'DEPOSIT') {
                    description = 'deposited by self';
                }
                transactionElement.innerHTML = `
                    <div>
                        <strong>${transaction.type}</strong>
                        <p>${description}</p>
                    </div>
                    <div>
                        <strong>$${transaction.amount.toFixed(2)}</strong>
                        <p>${new Date(transaction.createdAt).toLocaleDateString()}</p>
                    </div>
                `;
                transactionsList.appendChild(transactionElement);
            });
        }
    } catch (error) {
        showMessage('Failed to load transactions', 'error');
    }
}

// Logout
function logout() {
    token = null;
    localStorage.removeItem('token');
    showAuthSection();
}

// Show/hide sections
function showWalletSection() {
    document.getElementById('authSection').classList.add('hidden');
    document.getElementById('walletSection').classList.remove('hidden');
    displayUserInfo();
}

function showAuthSection() {
    document.getElementById('walletSection').classList.add('hidden');
    document.getElementById('authSection').classList.remove('hidden');
}

function displayUserInfo() {
    // Get user info from token or backend
    const tokenData = parseJwt(token);
    fetch(`${API_URL}/auth/user`, {
        headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => {
        document.getElementById('userName').textContent = data.username || '';
        document.getElementById('userEmail').textContent = data.email ? `(${data.email})` : '';
    })
    .catch(() => {
        document.getElementById('userName').textContent = '';
        document.getElementById('userEmail').textContent = '';
    });
}

// Helper to decode JWT (if needed)
function parseJwt (token) {
    try {
        return JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
        return {};
    }
}

// Show message
function showMessage(message, type) {
    const messageElement = document.createElement('div');
    messageElement.className = type;
    messageElement.textContent = message;
    
    const container = document.querySelector('.container');
    container.insertBefore(messageElement, container.firstChild);
    
    setTimeout(() => {
        messageElement.remove();
    }, 3000);
} 