import { API_URL } from '@env';
import { useQuery } from "@tanstack/react-query";

const merchant_id = "6a0c3"; //*****Set Merchant ID HEREEE***** 
//6a0c3 (basmathi rice, graph not nice)
//e8b3c (good bundle wed is peak)
//0e1b3 (ori)

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

export const getAdvice = async (merchantId = merchant_id) => {
    try {
      const response = await fetch(`${API_URL}/advice`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          merchant_id: merchantId,
        }),
      })
  
      if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.status}`)
      }
  
      const data = await response.json()
      return data.advice
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
    
    // Create safe defaults based on period
    const safeDefaults = {
      daily: {
        labels: ["8AM", "10AM", "12PM", "2PM", "4PM", "6PM", "8PM", "10PM"],
        defaultData: [0, 0, 0, 0, 0, 0, 0, 0]
      },
      weekly: {
        labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        defaultData: [0, 0, 0, 0, 0, 0, 0]
      },
      monthly: {
        labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
        defaultData: [0, 0, 0, 0]
      }
    };
    
    // Ensure we have the basic structure with defaults
    const safeData = {
      labels: data.labels || safeDefaults[period].labels,
      datasets: [],
      comparison_data: [],
      peak_hour: data.peak_hour || "",
      peak_day: data.peak_day || "",
      peak_week: data.peak_week || "",
      peak_day_increase: data.peak_day_increase || "",
      peak_week_increase: data.peak_week_increase || ""
    };
    
    // Process the main dataset first
    if (data.datasets && data.datasets.length > 0) {
      // Sanitize the data array - remove any NaN or Infinity values
      const safeDataArray = data.datasets[0].data?.map(val => 
        (val === null || val === undefined || isNaN(val) || !isFinite(val)) ? 0 : val
      ) || safeDefaults[period].defaultData;
      
      // Create the main dataset with proper color function
      safeData.datasets.push({
        data: safeDataArray,
        color: function(opacity = 1) { return `rgba(47, 174, 96, ${opacity})`; },
        strokeWidth: 2
      });
    } else {
      // Add default dataset if none exists
      safeData.datasets.push({
        data: safeDefaults[period].defaultData,
        color: function(opacity = 1) { return `rgba(47, 174, 96, ${opacity})`; },
        strokeWidth: 2
      });
    }
    
    // Process the comparison dataset
    if (data.comparison_data) {
      // Sanitize comparison data
      safeData.comparison_data = data.comparison_data.map(val => 
        (val === null || val === undefined || isNaN(val) || !isFinite(val)) ? 0 : val
      );
    } else {
      safeData.comparison_data = safeDefaults[period].defaultData;
    }
    
    return safeData;
  } catch (error) {
    console.error("Error fetching sales trend data:", error);
    
    // Return complete default safe data
    return getDefaultTrendData(period);
  }
};

// Helper function for default trend data
function getDefaultTrendData(period) {
  switch (period) {
    case "daily":
      return {
        labels: ["8AM", "10AM", "12PM", "2PM", "4PM", "6PM", "8PM", "10PM"],
        datasets: [{
          data: [0, 0, 0, 0, 0, 0, 0, 0],
          color: function(opacity = 1) { return `rgba(47, 174, 96, ${opacity})`; },
          strokeWidth: 2
        }],
        comparison_data: [0, 0, 0, 0, 0, 0, 0, 0],
        peak_hour: "N/A" 
      };
    case "weekly":
      return {
        labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        datasets: [{
          data: [0, 0, 0, 0, 0, 0, 0],
          color: function(opacity = 1) { return `rgba(47, 174, 96, ${opacity})`; },
          strokeWidth: 2
        }],
        comparison_data: [0, 0, 0, 0, 0, 0, 0],
        peak_day: "N/A",
        peak_day_increase: "N/A"
      };
    case "monthly":
    default:
      return {
        labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
        datasets: [{
          data: [0, 0, 0, 0],
          color: function(opacity = 1) { return `rgba(47, 174, 96, ${opacity})`; },
          strokeWidth: 2
        }],
        comparison_data: [0, 0, 0, 0],
        peak_week: "N/A",
        peak_week_increase: "N/A"
      };
  }
}

export const useAdviceQueryData = () => {
    return useQuery({
        queryKey: ['advice-data'],
        queryFn: async () => {
            const advices = await getAdvice()
            const advicesWithIds = advices.map((item, index) => ({
                ...item,
                id: index.toString(),
              }))
            return advicesWithIds;
        },
    })
}