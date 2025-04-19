import { API_URL } from '@env';
import { useQuery } from "@tanstack/react-query";

const merchant_id = "e8b3c"; //*****Set Merchant ID HEREEE***** 
//6a0c3 (basmathi rice, graph not nice)
//e8b3c (good bundle wed is peak)
//0e1b3 (ori)
//0e1f9

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
    
    // Preload merchant summary
    const summaryEndpoint = `${API_URL}/merchant/${merchantId}/summary`;
    console.log('Fetching merchant summary from:', summaryEndpoint);
    const summaryResponse = await fetch(summaryEndpoint);
    
    if (!summaryResponse.ok) {
      throw new Error(`Failed to fetch merchant summary: ${summaryResponse.status}`);
    }
    
    const summaryData = await summaryResponse.json();
    
    // Preload bundle suggestions
    const bundleEndpoint = `${API_URL}/merchant/${merchantId}/bundle-suggestions`;
    console.log('Preloading bundle suggestions from:', bundleEndpoint);
    const bundleResponse = await fetch(bundleEndpoint);
    
    if (!bundleResponse.ok) {
      console.warn(`Bundle suggestions preload failed: ${bundleResponse.status}`);
    } else {
      const bundleData = await bundleResponse.json();
      console.log('Bundle suggestions preloaded successfully');
    }
    
    console.log('Merchant data preloaded successfully');
    return {
      status: 'success',
      summary: summaryData
    };
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

export const fetchInsights = async (timePeriod, merchantId = merchant_id) => {
  try {
    console.log(`Fetching insights for ${timePeriod} period`);
    
    // Using the existing /ask endpoint with a structured prompt
    const response = await fetch(`${API_URL}/insights/${merchantId}/${timePeriod}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json"
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch insights data: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log(`Insights for ${timePeriod} received:`, data);
    return data;
  } catch (error) {
    console.error(`Error fetching insights for ${timePeriod}:`, error);
    
    // Return default insights if API fails
    return {
      best_selling_time: {
        title: "Best Selling Time",
        description: timePeriod === "daily"
          ? "Lunch hours (12PM-2PM) account for 35% of daily sales"
          : timePeriod === "weekly"
            ? "Weekends generate 40% more revenue than weekdays" 
            : "The last week of the month sees a 20% sales increase"
      },
      menu_performance: {
        title: "Menu Performance",
        description: "Nasi Lemak with Ayam Goreng combo accounts for 45% of main course orders. Consider promoting it as a bundle deal."
      },
      opportunity: {
        title: "Opportunity",
        description: "Beverage sales are lower than industry average. Consider introducing new drinks or combo meals to boost this category."
      }
    };
  }
};

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


export const fetchTopSellingItems = async ( merchantId = merchant_id) => {
  try {
    const response = await fetch(`${API_URL}/merchant/${merchantId}/top-items`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch top selling items: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // If we get a loading status, return it
    if (data.status === "loading") {
      return data;
    }
    
    // If we got an error, return it
    if (data.status === "error") {
      console.error("Error from server:", data.message);
      return data;
    }
    
    // We got successful data - all data is now monthly regardless of period parameter
    return {
      ...data,
      // Override with consistent time period message
      time_period: "Last 30 Days" 
    };
  } catch (error) {
    console.error("Error fetching top selling items data:", error);
    return {
      status: "error",
      message: error.message
    };
  }
};

export const fetchBestSeller = async(merchantId=merchant_id) => {
  try{
    const response = await fetch(`${API_URL}/merchant/${merchantId}/best-seller`);
    if (!response.ok) {
      throw new Error(`Failed to fetch best seller: ${response.statusText}`);
    }
    
    const data = await response.json();
    return {
      name: data.name || "No best seller found",
      percentage: data.percentage || 0
    };
  } catch (error) {
    console.error("Error fetching best seller:", error);
    return {
      name: "Unable to load",
      percentage: 0,
      error: error.message
    };
  }
}

export async function getMerchantItems(merchantId = merchant_id) {
  try {
    const response = await fetch(`${API_URL}/merchant-items/${merchantId}`);
    if (!response.ok) {
      throw new Error("Failed to fetch merchant items");
    }

    const data = await response.json();

    return data.map((item, index) => ({
      id: index + 1, 
      name: item.item_name,
      price: item.item_price,
      category: item.cuisine_tag,
    }));
  } catch (error) {
    console.error("Error fetching merchant items:", error);
    return [];
  }
}

export const fetchInventoryData = async () => {
  try {
    const response = await fetch(`${API_URL}/ingredients/predict`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch inventory data: ${response.statusText}`);
    }
    
    const responseData = await response.json();
    
    // Access the ingredients array inside the data field
    const ingredients = responseData.data;
    
    if (!ingredients || !Array.isArray(ingredients)) {
      console.warn("No ingredients found in response or invalid format");
      return []; // Return an empty array as a fallback
    }
    
    // Process the inventory data
    const formattedData = ingredients.map((item) => {
      let lastRestocked = "Never"; // Default value
      let daysLeft = "N/A"; // Default value
      
      if (item.last_restock) {
        try {
          // Convert MM/DD/YYYY to a valid Date object
          const [month, day, year] = item.last_restock.split("/");
          const parsedDate = new Date(year, month - 1, day); // Month is 0-indexed
          
          lastRestocked = {
            parsedDate,
            rawFormat: item.last_restock
          };
        } catch (error) {
          console.warn(`Invalid date format for item ${item.ingredient_name}:`, item.last_restock);
        }
      }

      // Use the predicted days_left from the API response
      daysLeft = item.days_left || "N/A";

      return {
        id: item.ingredient_id,
        name: item.ingredient_name,
        current: item.stock_left,
        recommended: item.recommended,
        lastRestocked,
        daysLeft, // Include days_left in the returned data
      };
    });
    
    return formattedData;
  } catch (error) {
    console.error("Error fetching inventory data:", error);
    throw error;
  }
};

export const updateInventoryItem = async (itemId, newQuantity) => {
  try {
    const response = await fetch(`${API_URL}/ingredients/${itemId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        stock_left: newQuantity,
        last_restock: new Date().toLocaleDateString("en-US") // MM/DD/YYYY format
      }),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to update inventory: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error updating inventory:", error);
    throw error;
  }
};

export const generateImage = async (prompt, size = "1024x1024") => {
  try {
    console.log("Generating image with prompt:", prompt);
    
    const response = await fetch(`${API_URL}/generate-image`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: prompt,
        size: size
      }),
    });

    if (!response.ok) {
      throw new Error(`Network response was not ok: ${response.status}`);
    }

    const data = await response.json();
    console.log("Image generation complete");
    return data;
  } catch (error) {
    console.error("Error generating image:", error);
    throw error;
  }
};

export const fetchBundleSuggestions = async (merchantId = merchant_id) => {
  try {
    console.log('Fetching bundle suggestions from:', `${API_URL}/merchant/${merchantId}/bundle-suggestions`);
    const response = await fetch(`${API_URL}/merchant/${merchantId}/bundle-suggestions`);
    
    if (!response.ok) {
      throw new Error(`Network response was not ok: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.status === "error") {
      console.error("Error from server:", data.message);
      return { status: "error", message: data.message };
    }
    
    return {
      status: "success",
      suggestions: data.suggestions
    };
  } catch (error) {
    console.error("Error fetching bundle suggestions:", error);
    return {
      status: "error",
      message: error.message
    };
  }
};



