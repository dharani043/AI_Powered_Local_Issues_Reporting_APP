// Simple test to check if server routes are working
const testRoutes = async () => {
  const baseUrl = 'http://localhost:5000';
  
  const routes = [
    '/api/health',
    '/api/notifications/test',
    '/api/notifications/direct-test'
  ];
  
  for (const route of routes) {
    try {
      const response = await fetch(baseUrl + route);
      const data = await response.json();
      console.log(`✅ ${route}: ${response.status} -`, data);
    } catch (error) {
      console.log(`❌ ${route}: Error -`, error.message);
    }
  }
};

// Run if this file is executed directly
if (typeof window === 'undefined') {
  testRoutes();
}