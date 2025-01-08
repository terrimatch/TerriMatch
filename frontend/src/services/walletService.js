// src/services/walletService.js
export const getWalletBalance = async (userId) => {
  try {
    const response = await fetch(`http://localhost:3001/api/wallet/${userId}/balance`);
    return await response.json();
  } catch (error) {
    console.error('Error fetching wallet balance:', error);
    return { success: false, error: error.message };
  }
};

export const addCoins = async (userId, amount, paymentMethod) => {
  try {
    const response = await fetch('http://localhost:3001/api/wallet/add-coins', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        amount,
        paymentMethod
      })
    });

    return await response.json();
  } catch (error) {
    console.error('Error adding coins:', error);
    return { success: false, error: error.message };
  }
};

export const transferCoins = async (fromUserId, toUserId, amount, serviceType) => {
  try {
    const response = await fetch('http://localhost:3001/api/wallet/transfer', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fromUserId,
        toUserId,
        amount,
        serviceType
      })
    });

    return await response.json();
  } catch (error) {
    console.error('Error transferring coins:', error);
    return { success: false, error: error.message };
  }
};

export const getTransactionHistory = async (userId) => {
  try {
    const response = await fetch(`http://localhost:3001/api/wallet/${userId}/transactions`);
    return await response.json();
  } catch (error) {
    console.error('Error fetching transaction history:', error);
    return { success: false, error: error.message };
  }
};

export const getPriceList = async () => {
  try {
    const response = await fetch('http://localhost:3001/api/wallet/price-list');
    return await response.json();
  } catch (error) {
    console.error('Error fetching price list:', error);
    return {
      success: false,
      error: error.message,
      // Returnăm o listă de prețuri implicită în caz de eroare
      data: [
        { amount: 100, price: 10, bonus: 0 },
        { amount: 500, price: 45, bonus: 50 },
        { amount: 1000, price: 85, bonus: 150 },
        { amount: 5000, price: 400, bonus: 1000 }
      ]
    };
  }
};

export const createPaymentIntent = async (userId, amount, currency = 'EUR') => {
  try {
    const response = await fetch('http://localhost:3001/api/wallet/payment-intent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        amount,
        currency
      })
    });

    return await response.json();
  } catch (error) {
    console.error('Error creating payment intent:', error);
    return { success: false, error: error.message };
  }
};

export const validatePayment = async (paymentId) => {
  try {
    const response = await fetch(`http://localhost:3001/api/wallet/validate-payment/${paymentId}`);
    return await response.json();
  } catch (error) {
    console.error('Error validating payment:', error);
    return { success: false, error: error.message };
  }
};

// Service rates and limits
export const SERVICE_RATES = {
  VIDEO_CALL: 50, // TC per minute
  PRIVATE_MESSAGE: 5, // TC per message
  PROFILE_BOOST: 100, // TC per boost
  GIFT: 20 // TC per gift
};

export const DAILY_LIMITS = {
  SEND_MESSAGES: 100,
  VIDEO_CALLS: 60, // minutes
  PROFILE_VIEWS: 50
};