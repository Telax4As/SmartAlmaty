import axios from 'axios';

const API_TOKEN = 'demo'; 
const CITY = 'almaty';

export const fetchAirData = async () => {
  try {
    const response = await axios.get(`https://api.waqi.info/feed/${CITY}/?token=${API_TOKEN}`);
    console.log("Air API Response:", response.data);
    if (response.data.status === 'ok') {
      return { aqi: response.data.data.aqi };
    }
    console.warn("Air API returned non-ok status:", response.data.status);
    return { aqi: null };
  } catch (error) {
    console.error("Air API Error:", error);
    return { aqi: null };
  }
};