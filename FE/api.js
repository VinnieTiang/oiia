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


/**
 * Fetch sales data for different time periods
 * @param {string} period - The time period ('today', 'week', or 'month')
 * @param {string} merchantId - The merchant ID
 * @returns {Promise<Object>} - Sales data for the specified period
 */
export const fetchSalesData = async (period = 'today', merchantId = merchant_id) => {
  try {
    // Determine the correct endpoint based on period
    let endpoint;
    if (period === 'today') {
      endpoint = `${API_URL}/merchant/${merchantId}/today`;
    } else {
      endpoint = `${API_URL}/merchant/${merchantId}/summary/${period}`;
    }
    
    console.log(`Fetching ${period} sales data from:`, endpoint);
    
    const response = await fetch(endpoint);
    
    if (!response.ok) {
      throw new Error(`Network response was not ok: ${response.status}`);
    }
    
    const data = await response.json();
    console.log(`${period} sales data received:`, data);
    return data;
  } catch (error) {
    console.error(`Error fetching ${period} sales data:`, error);
    throw error;
  }
};

export const fetchSalesTrend = async (period, merchantId = merchant_id) => {
  try {
    const response = await fetch(`${API_URL}/merchant/${merchantId}/trends/${period}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch sales trend data: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Sanitize data to prevent invalid numbers
    if (data.datasets && data.datasets.length > 0) {
      data.datasets = data.datasets.map(dataset => {
        // Replace Infinity or NaN values with 0
        const sanitizedData = dataset.data.map(value => 
          (isNaN(value) || !isFinite(value)) ? 0 : value
        );
        
        return {
          ...dataset,
          data: sanitizedData,
          // Ensure color is a function
          color: typeof dataset.color === 'string' 
            ? function(opacity = 1) { 
                return dataset.color.includes('rgba') 
                  ? dataset.color.replace('${opacity}', opacity)
                  : `rgba(47, 174, 96, ${opacity})`;
              } 
            : dataset.color
        };
      });
    }
    
    // Sanitize comparison data too
    if (data.comparison_data) {
      data.comparison_data = data.comparison_data.map(value => 
        (isNaN(value) || !isFinite(value)) ? 0 : value
      );
    }
    
    return data;
  } catch (error) {
    console.error("Error fetching sales trend data:", error);
    
    // Return default fallback data
    return {
      labels: period === "daily" 
        ? ["8:00", "10:00", "12:00", "14:00", "16:00", "18:00", "20:00", "22:00"]
        : period === "weekly"
          ? ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] 
          : ["Week 1", "Week 2", "Week 3", "Week 4"],
      datasets: [{
        data: [0, 0, 0, 0, 0, 0, 0],
        color: function(opacity = 1) { return `rgba(47, 174, 96, ${opacity})`; },
        strokeWidth: 2
      }],
      comparison_data: [0, 0, 0, 0, 0, 0, 0]
    };
  }
};