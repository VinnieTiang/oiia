import { API_URL } from '@env';
const merchant_id = "0e1b3"; //*****Set Merchant ID HEREEE***** 

export const fetchLowStockItems = async () => {
  try {
    console.log('Fetching low stock items from:', `${API_URL}/inventory/low-stock`);
    const response = await fetch(`${API_URL}/inventory/low-stock`);
    
    if (!response.ok) {
      throw new Error(`Network response was not ok: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Received data:', data);
    return data;
  } catch (error) {
    console.error('Error fetching low stock items:', error);
    throw error;
  }
};

export const askAI = async (question, merchantId = merchant_id) => {
  try {
    console.log("Sending question to AI:", question)
    const response = await fetch(`${API_URL}/ask`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        merchant_id: merchantId,
        question: question,
      }),
    })

    if (!response.ok) {
      throw new Error(`Network response was not ok: ${response.status}`)
    }

    const data = await response.json()
    console.log("AI response:", data)
    return data.reply
  } catch (error) {
    console.error("Error asking AI:", error)
    throw error
  }
}

export const fetchForecast = async (merchantId = merchant_id, days = 7) => {
  try {
    const url = `${API_URL}/forecast/${merchantId}?days=${days}`;
    console.log('Fetching forecast data from:', url);

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Network response was not ok: ${response.status}`);
    }

    const data = await response.json();
    console.log('Forecast data received:', data);
    return data;
  } catch (error) {
    console.error('Error fetching forecast data:', error);
    throw error;
  }
};


export const fetchTodaySales = async (merchantId = merchant_id) => {
  try {
    const url = `${API_URL}/merchant/${merchantId}/today`;
    console.log('Fetching today sales data from:', url);

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Network response was not ok: ${response.status}`);
    }

    const data = await response.json();
    console.log('Today sales data received:', data);
    return data;
  } catch (error) {
    console.error('Error fetching today sales data:', error);
    throw error;
  }
};

export const generatePromoContent = async (prompt) => {
  try {
    console.log("Sending prompt to AI:", prompt)
    const response = await fetch(`${API_URL}/generate-content`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: prompt,
      }),
    })

    if (!response.ok) {
      throw new Error(`Network response was not ok: ${response.status}`)
    }

    const data = await response.json()
    console.log("AI response:", data)
    return data.reply
  } catch (error) {
    console.error("Error asking AI:", error)
    throw error
  }
}

export const preloadMerchantData = async (merchantId = merchant_id) => {
  try {
    console.log('Preloading merchant data for:', merchantId);
    const endpoint = `${API_URL}/merchant/${merchantId}/summary`;
    
    const response = await fetch(endpoint);
    
    if (!response.ok) {
      throw new Error(`Network response was not ok: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Merchant data preloaded successfully');
    return data;
  } catch (error) {
    console.error('Error preloading merchant data:', error);
    // Don't throw the error - just log it since this is a preloading operation
    return { status: 'error', message: error.toString() };
  }
};

