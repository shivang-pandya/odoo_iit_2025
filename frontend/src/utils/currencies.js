export const fetchCurrencies = async () => {
  try {
    // Using a free, reliable source for currency data
    const response = await fetch('https://open.er-api.com/v6/latest/USD');
    const data = await response.json();
    if (data.result === 'success') {
      return Object.keys(data.rates);
    }
    return [];
  } catch (error) {
    console.error('Failed to fetch currencies:', error);
    // Fallback to a basic list in case of API failure
    return ['USD', 'EUR', 'GBP', 'INR', 'JPY', 'CAD', 'AUD'];
  }
};
