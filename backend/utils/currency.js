const axios = require('axios');

// Using a free, no-key API for this hackathon. In production, use a reliable, keyed service.
const API_URL = 'https://api.exchangerate-api.com/v4/latest/';

/**
 * Converts an amount from a source currency to a target currency.
 * @param {number} amount - The amount to convert.
 * @param {string} fromCurrency - The source currency code (e.g., 'USD').
 * @param {string} toCurrency - The target currency code (e.g., 'EUR').
 * @returns {Promise<number>} The converted amount.
 */
const convertCurrency = async (amount, fromCurrency, toCurrency) => {
  if (fromCurrency === toCurrency) {
    return amount;
  }

  try {
    const { data } = await axios.get(`${API_URL}${fromCurrency}`);
    const rate = data.rates[toCurrency];
    if (!rate) {
      throw new Error(`Conversion rate from ${fromCurrency} to ${toCurrency} not found.`);
    }
    return amount * rate;
  } catch (error) {
    console.error('Currency conversion failed:', error.message);
    // In a real app, you might want to have a fallback or handle this more gracefully
    // For the hackathon, we'll return the original amount on failure.
    return amount; 
  }
};

module.exports = { convertCurrency };
