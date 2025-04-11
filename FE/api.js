import { API_URL } from '@env';


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

export const askAI = async (question, merchantId = "5c1f8") => {
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