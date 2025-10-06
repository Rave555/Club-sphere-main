// Environment configuration
const ENV = {
  development: {
    API_BASE_URL: "http://localhost:5000/api", // Default for local development
    // For physical device testing, replace 'localhost' with your computer's IP address
    // Example: 'http://192.168.1.100:5000/api'
  },
  production: {
    API_BASE_URL: "https://your-production-api.com/api", // Replace with your production API URL
  },
};

// Auto-detect environment (you can also set this manually)
const getCurrentEnvironment = () => {
  // In a real app, you might want to check __DEV__ or other indicators
  return __DEV__ ? "development" : "production";
};

export const config = ENV[getCurrentEnvironment()];

// Helper function to get API URL with fallback
export const getApiUrl = () => {
  // If running on physical device, you might need to use your computer's IP
  // This will be automatically detected or can be manually configured
  return config.API_BASE_URL;
};

// Network utility to help users find their IP
export const getNetworkInstructions = () => {
  return {
    windows: 'Run "ipconfig" in Command Prompt and look for IPv4 Address',
    mac: 'Run "ifconfig | grep inet" in Terminal',
    linux: 'Run "hostname -I" or "ip addr show" in Terminal',
  };
};

// Development helper to test API connectivity
export const testApiConnection = async () => {
  try {
    const response = await fetch(`${getApiUrl().replace("/api", "")}/`);
    return { success: true, status: response.status };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      suggestions: [
        "Check if the server is running",
        "Verify the API URL in config.js",
        "For physical devices, use your computer's IP address instead of localhost",
        "Ensure your phone and computer are on the same WiFi network",
      ],
    };
  }
};
