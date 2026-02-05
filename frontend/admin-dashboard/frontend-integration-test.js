/**
 * Frontend Integration Test
 * Tests API connection, authentication, and all stores
 * 
 * Run in browser console at http://localhost:3000
 */

// Copy this entire script and paste it in browser console

(async function testFrontendIntegration() {
  console.log('%c🧪 Testing Frontend Integration...', 'color: blue; font-size: 16px; font-weight: bold');
  console.log('═══════════════════════════════════════\n');

  const results = {
    passed: 0,
    failed: 0,
    tests: []
  };

  function log(message, status = 'info') {
    const colors = {
      pass: 'color: green; font-weight: bold',
      fail: 'color: red; font-weight: bold',
      info: 'color: blue',
      warn: 'color: orange'
    };
    console.log(`%c${message}`, colors[status] || colors.info);
  }

  function test(name, passed, error = null) {
    results.tests.push({ name, passed, error });
    if (passed) {
      results.passed++;
      log(`✅ ${name}`, 'pass');
    } else {
      results.failed++;
      log(`❌ ${name}`, 'fail');
      if (error) log(`   Error: ${error}`, 'fail');
    }
  }

  try {
    // Test 1: Check if API service exists
    log('\n1️⃣ Testing API Service...', 'info');
    const apiModule = await import('/src/services/api.js');
    const api = apiModule.default;
    test('API service imported', !!api);
    test('API has auth methods', !!api.auth);
    test('API has admin methods', !!api.admin);
    test('API has devices methods', !!api.devices);

    // Test 2: Check stores
    log('\n2️⃣ Testing Pinia Stores...', 'info');
    try {
      const { useAuthStore } = await import('/src/store/index.js');
      test('Auth store imported', !!useAuthStore);
      
      const { useAdminStore } = await import('/src/store/index.js');
      test('Admin store imported', !!useAdminStore);
      
      const { useDevicesStore } = await import('/src/store/index.js');
      test('Devices store imported', !!useDevicesStore);
    } catch (error) {
      test('Stores import', false, error.message);
    }

    // Test 3: Test API connection
    log('\n3️⃣ Testing Backend Connection...', 'info');
    try {
      const response = await fetch('http://localhost:5000/api/health');
      const data = await response.json();
      test('Backend is reachable', response.ok);
      test('Health check returns success', data.success === true);
    } catch (error) {
      test('Backend connection', false, 'Backend not running or unreachable');
    }

    // Test 4: Test registration
    log('\n4️⃣ Testing User Registration...', 'info');
    const testEmail = `frontend-test-${Date.now()}@test.com`;
    try {
      const registerResponse = await api.auth.register({
        email: testEmail,
        password: 'Test123!',
        full_name: 'Frontend Test User',
        company_name: 'Test Co'
      });
      test('User registration', registerResponse.data.success);
      test('Registration returns token', !!registerResponse.data.data.accessToken);
      
      // Store token for next tests
      window.testToken = registerResponse.data.data.accessToken;
      window.testUser = registerResponse.data.data.user;
      
      log(`   📧 Test user: ${testEmail}`, 'info');
    } catch (error) {
      test('User registration', false, error.response?.data?.message || error.message);
    }

    // Test 5: Test login
    log('\n5️⃣ Testing User Login...', 'info');
    try {
      const loginResponse = await api.auth.login({
        email: testEmail,
        password: 'Test123!'
      });
      test('User login', loginResponse.data.success);
      test('Login returns token', !!loginResponse.data.data.accessToken);
      
      // Update token
      window.testToken = loginResponse.data.data.accessToken;
    } catch (error) {
      test('User login', false, error.response?.data?.message || error.message);
    }

    // Test 6: Test authenticated endpoints
    log('\n6️⃣ Testing Authenticated Endpoints...', 'info');
    if (window.testToken) {
      // Set token in localStorage for API client
      localStorage.setItem('accessToken', window.testToken);
      
      try {
        const profileResponse = await api.auth.getProfile();
        test('Get profile with token', profileResponse.data.success);
      } catch (error) {
        test('Get profile', false, error.response?.data?.message || error.message);
      }

      try {
        const devicesResponse = await api.devices.getAll();
        test('Get devices list', devicesResponse.data.success);
      } catch (error) {
        test('Get devices', false, error.response?.data?.message || error.message);
      }

      try {
        const ticketsResponse = await api.tickets.getAll();
        test('Get tickets list', ticketsResponse.data.success);
      } catch (error) {
        test('Get tickets', false, error.response?.data?.message || error.message);
      }

      try {
        const plansResponse = await api.subscriptions.getPlans();
        test('Get subscription plans', plansResponse.data.success);
      } catch (error) {
        test('Get plans', false, error.response?.data?.message || error.message);
      }
    }

    // Test 7: Test store initialization
    log('\n7️⃣ Testing Store Initialization...', 'info');
    try {
      const { useAuthStore } = await import('/src/store/index.js');
      const { createPinia, setActivePinia } = await import('pinia');
      
      // Create a test pinia instance
      const pinia = createPinia();
      setActivePinia(pinia);
      
      const authStore = useAuthStore();
      test('Auth store creates instance', !!authStore);
      test('Auth store has login method', typeof authStore.login === 'function');
      test('Auth store has logout method', typeof authStore.logout === 'function');
      test('Auth store has state', !!authStore.$state);
    } catch (error) {
      test('Store initialization', false, error.message);
    }

    // Test 8: Test environment variables
    log('\n8️⃣ Testing Environment Configuration...', 'info');
    const apiUrl = import.meta.env.VITE_API_URL;
    test('API URL configured', !!apiUrl);
    if (apiUrl) {
      log(`   🔗 API URL: ${apiUrl}`, 'info');
    }

  } catch (error) {
    log(`\n❌ Test suite crashed: ${error.message}`, 'fail');
    console.error(error);
  }

  // Final Results
  log('\n═══════════════════════════════════════', 'info');
  log('📊 TEST RESULTS', 'info');
  log('═══════════════════════════════════════', 'info');
  log(`✅ Passed: ${results.passed}`, 'pass');
  log(`❌ Failed: ${results.failed}`, 'fail');
  log(`📋 Total: ${results.tests.length}`, 'info');
  
  if (results.failed === 0) {
    log('\n🎉 ALL TESTS PASSED!', 'pass');
    log('✅ Frontend is ready!', 'pass');
    log('✅ Backend connection working!', 'pass');
    log('✅ Authentication working!', 'pass');
    log('✅ API endpoints responding!', 'pass');
    log('\n🚀 Ready to build remaining pages!', 'pass');
  } else {
    log(`\n⚠️ ${results.failed} test(s) failed`, 'warn');
    log('Check the errors above', 'warn');
  }

  // Detailed results
  console.log('\n📋 Detailed Results:');
  console.table(results.tests);

  return results;
})();