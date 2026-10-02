/**
 * Comprehensive Integration Test Suite
 * Tests all APIs, CRUD operations, authentication, permissions, and data flows
 */

const BASE_URL = 'http://localhost:5000/api';
let authToken = '';
let testUserId = '';
let testProjectId = '';
let testMaterialId = '';
let testSupplierId = '';
let testPurchaseOrderId = '';
let testInventoryId = '';
let testWasteRecordId = '';
let testConsumptionPlanId = '';

const testResults = {
  total: 0,
  passed: 0,
  failed: 0,
  errors: []
};

// Utility functions
async function makeRequest(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json'
  };
  
  if (authToken && !options.skipAuth) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }
  
  // Custom headers override defaults (including auth)
  Object.assign(headers, options.headers);

  try {
    const response = await fetch(url, {
      ...options,
      headers
    });

    let data;
    try {
      data = await response.json();
    } catch (e) {
      data = { message: response.statusText };
    }

    return {
      status: response.status,
      ok: response.ok,
      data
    };
  } catch (error) {
    return {
      status: 0,
      ok: false,
      data: { message: error.message }
    };
  }
}

function logTest(name, passed, details = '') {
  testResults.total++;
  if (passed) {
    testResults.passed++;
    console.log(`✅ ${name}`);
  } else {
    testResults.failed++;
    console.log(`❌ ${name}`);
    testResults.errors.push({ test: name, details });
    if (details) console.log(`   ${details}`);
  }
}

function assertEqual(actual, expected, testName) {
  const passed = actual === expected;
  logTest(testName, passed, passed ? '' : `Expected ${expected}, got ${actual}`);
  return passed;
}

function assertTrue(condition, testName, details = '') {
  logTest(testName, condition, details);
  return condition;
}

// Test Suite Functions

async function testHealthCheck() {
  console.log('\n🔍 Testing Health Check...');
  const response = await makeRequest('/health', { skipAuth: true });
  assertTrue(response.ok, 'Health check endpoint responds');
  assertTrue(response.data.status === 'ok', 'Health status is OK');
  assertTrue(response.data.dbStatus === 'connected', 'Database is connected');
}

async function testAuthAPIs() {
  console.log('\n🔐 Testing Authentication APIs...');
  
  // Test 1: Try to login with admin user; if it doesn't exist, register one first
  let loginResponse = await makeRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email: 'admin@example.com',
      password: 'admin123'
    }),
    skipAuth: true
  });

  // If login fails (user doesn't exist yet), register the admin account first
  if (!loginResponse.ok) {
    console.log('   ℹ️  Admin account not found — registering one now...');
    const registerResponse = await makeRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        email: 'admin@example.com',
        password: 'admin123',
        name: 'Admin User'
      }),
      skipAuth: true
    });
    assertTrue(registerResponse.ok, 'Admin user registration succeeds',
      !registerResponse.ok ? registerResponse.data.message : '');

    // Now login again
    loginResponse = await makeRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'admin@example.com',
        password: 'admin123'
      }),
      skipAuth: true
    });
  }
  
  assertTrue(loginResponse.ok, 'Admin user login succeeds',
    !loginResponse.ok ? loginResponse.data.message : '');
  
  if (loginResponse.ok && loginResponse.data.data) {
    authToken = loginResponse.data.data.token;
    testUserId = loginResponse.data.data.user._id || loginResponse.data.data.user.id;
    assertTrue(!!authToken, 'Login returns auth token');
  }
  
  // Test 2: Get current user profile
  const profileResponse = await makeRequest('/auth/me');
  assertTrue(profileResponse.ok, 'Get current user profile succeeds',
    !profileResponse.ok ? profileResponse.data.message : '');
  assertTrue(profileResponse.data?.data?.email === 'admin@example.com', 
    'Profile returns correct user data');
  
  // Test 3: Test unauthorized access
  const unauthorizedResponse = await makeRequest('/auth/me', {
    headers: { 'Authorization': 'Bearer invalid_token' }
  });
  assertEqual(unauthorizedResponse.status, 401, 'Invalid token returns 401');
  
  // Test 4: Register new user
  const registerData = {
    email: `test${Date.now()}@example.com`,
    password: 'Test123!@#',
    name: 'Test User',
    role: 'user'
  };
  
  const registerResponse = await makeRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify(registerData),
    skipAuth: true
  });
  
  assertTrue(registerResponse.ok, 'User registration succeeds', 
    !registerResponse.ok ? registerResponse.data.message : '');
}

async function testProjectAPIs() {
  console.log('\n📁 Testing Project APIs...');
  
  // Get a manager ID for the project
  const usersResponse = await makeRequest('/users');
  let managerId = testUserId; // fallback to current user
  if (usersResponse.ok && usersResponse.data.data) {
    const manager = usersResponse.data.data.find(u => u.role === 'manager' || u.role === 'admin');
    if (manager) {
      managerId = manager._id || manager.id;
    }
  }
  
  // Test 1: Create project
  const projectData = {
    name: 'Test Project ' + Date.now(),
    code: 'TP' + Date.now(),
    description: 'Integration test project',
    location: 'Test Site Location',
    startDate: new Date().toISOString(),
    expectedEndDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'active',
    budget: 100000,
    managerId: managerId
  };
  
  const createResponse = await makeRequest('/projects', {
    method: 'POST',
    body: JSON.stringify(projectData)
  });
  
  assertTrue(createResponse.ok, 'Create project succeeds',
    !createResponse.ok ? createResponse.data.message : '');
  
  if (createResponse.ok && createResponse.data.data) {
    testProjectId = createResponse.data.data._id || createResponse.data.data.id;
    assertTrue(!!testProjectId, 'Created project has ID');
  }
  
  // Test 2: Get all projects
  const listResponse = await makeRequest('/projects');
  assertTrue(listResponse.ok, 'Get all projects succeeds');
  assertTrue(Array.isArray(listResponse.data.data), 'Projects list is an array');
  assertTrue(listResponse.data.data.length > 0, 'Projects list is not empty');
  
  // Test 3: Get single project
  if (testProjectId) {
    const getResponse = await makeRequest(`/projects/${testProjectId}`);
    assertTrue(getResponse.ok, 'Get project by ID succeeds');
    assertTrue(getResponse.data.data?.name === projectData.name, 
      'Retrieved project has correct name');
  }
  
  // Test 4: Update project
  if (testProjectId) {
    const updateData = { status: 'on_hold' }; // valid transition from active
    const updateResponse = await makeRequest(`/projects/${testProjectId}`, {
      method: 'PATCH',
      body: JSON.stringify(updateData)
    });
    assertTrue(updateResponse.ok, 'Update project succeeds',
      !updateResponse.ok ? updateResponse.data.message : '');
  }
  
  // Test 5: Search/filter projects
  const filterResponse = await makeRequest('/projects?status=active');
  assertTrue(filterResponse.ok, 'Filter projects by status succeeds');
}

async function testMaterialAPIs() {
  console.log('\n🧱 Testing Material APIs...');
  
  // Test 1: Create material
  const materialData = {
    name: 'Test Material ' + Date.now(),
    code: 'TM' + Date.now(),
    category: 'cement',
    unit: 'bag',
    reorderLevel: 100,
    description: 'Test material for integration',
    hsnCode: '2523'
  };
  
  const createResponse = await makeRequest('/materials', {
    method: 'POST',
    body: JSON.stringify(materialData)
  });
  
  assertTrue(createResponse.ok, 'Create material succeeds',
    !createResponse.ok ? createResponse.data.message : '');
  
  if (createResponse.ok && createResponse.data.data) {
    testMaterialId = createResponse.data.data._id || createResponse.data.data.id;
  }
  
  // Test 2: Get all materials
  const listResponse = await makeRequest('/materials');
  assertTrue(listResponse.ok, 'Get all materials succeeds');
  assertTrue(Array.isArray(listResponse.data.data), 'Materials list is an array');
  
  // Test 3: Get single material
  if (testMaterialId) {
    const getResponse = await makeRequest(`/materials/${testMaterialId}`);
    assertTrue(getResponse.ok, 'Get material by ID succeeds');
  }
  
  // Test 4: Update material
  if (testMaterialId) {
    const updateResponse = await makeRequest(`/materials/${testMaterialId}`, {
      method: 'PATCH',
      body: JSON.stringify({ reorderLevel: 150 })
    });
    assertTrue(updateResponse.ok, 'Update material succeeds');
  }
  
  // Test 5: Search materials
  const searchResponse = await makeRequest(`/materials?search=${materialData.name}`);
  assertTrue(searchResponse.ok, 'Search materials succeeds');
}

async function testSupplierAPIs() {
  console.log('\n🏢 Testing Supplier APIs...');
  
  // Test 1: Create supplier
  const supplierData = {
    name: 'Test Supplier ' + Date.now(),
    code: 'SUP' + Date.now(),
    contactPerson: 'John Doe',
    email: 'john@supplier.com',
    phone: '1234567890',
    address: '123 Test Street',
    rating: 4
  };
  
  const createResponse = await makeRequest('/suppliers', {
    method: 'POST',
    body: JSON.stringify(supplierData)
  });
  
  assertTrue(createResponse.ok, 'Create supplier succeeds',
    !createResponse.ok ? createResponse.data.message : '');
  
  if (createResponse.ok && createResponse.data.data) {
    testSupplierId = createResponse.data.data._id || createResponse.data.data.id;
  }
  
  // Test 2: Get all suppliers
  const listResponse = await makeRequest('/suppliers');
  assertTrue(listResponse.ok, 'Get all suppliers succeeds');
  
  // Test 3: Get single supplier
  if (testSupplierId) {
    const getResponse = await makeRequest(`/suppliers/${testSupplierId}`);
    assertTrue(getResponse.ok, 'Get supplier by ID succeeds');
  }
  
  // Test 4: Update supplier
  if (testSupplierId) {
    const updateResponse = await makeRequest(`/suppliers/${testSupplierId}`, {
      method: 'PATCH',
      body: JSON.stringify({ rating: 5 })
    });
    assertTrue(updateResponse.ok, 'Update supplier succeeds');
  }
}

async function testPurchaseOrderAPIs() {
  console.log('\n🛒 Testing Purchase Order APIs...');
  
  if (!testSupplierId || !testMaterialId || !testProjectId) {
    console.log('⚠️ Skipping PO tests - missing supplier, material, or project');
    return;
  }
  
  // Test 1: Create purchase order
  const poData = {
    projectId: testProjectId,
    supplierId: testSupplierId,
    items: [{
      materialId: testMaterialId,
      quantity: 1000,
      unitPrice: 50
    }],
    expectedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    notes: 'Test purchase order'
  };
  
  const createResponse = await makeRequest('/purchase-orders', {
    method: 'POST',
    body: JSON.stringify(poData)
  });
  
  assertTrue(createResponse.ok, 'Create purchase order succeeds',
    !createResponse.ok ? createResponse.data.message : '');
  
  if (createResponse.ok && createResponse.data.data) {
    testPurchaseOrderId = createResponse.data.data._id || createResponse.data.data.id;
  }
  
  // Test 2: Get all purchase orders
  const listResponse = await makeRequest('/purchase-orders');
  assertTrue(listResponse.ok, 'Get all purchase orders succeeds');
  
  // Test 3: Get single purchase order
  if (testPurchaseOrderId) {
    const getResponse = await makeRequest(`/purchase-orders/${testPurchaseOrderId}`);
    assertTrue(getResponse.ok, 'Get purchase order by ID succeeds');
  }
  
  // Test 4: Approve purchase order
  if (testPurchaseOrderId) {
    const approveResponse = await makeRequest(`/purchase-orders/${testPurchaseOrderId}/approve`, {
      method: 'PATCH'
    });
    assertTrue(approveResponse.ok, 'Approve purchase order succeeds',
      !approveResponse.ok ? approveResponse.data.message : '');
  }
  
  // Test 5: Receive purchase order (creates inventory)
  if (testPurchaseOrderId) {
    const receiveResponse = await makeRequest(`/purchase-orders/${testPurchaseOrderId}/receive`, {
      method: 'POST',
      body: JSON.stringify({
        items: [{
          materialId: testMaterialId,
          quantity: 1000
        }]
      })
    });
    assertTrue(receiveResponse.ok, 'Receive purchase order succeeds',
      !receiveResponse.ok ? receiveResponse.data.message : '');
  }
}

async function testInventoryAPIs() {
  console.log('\n📦 Testing Inventory APIs...');
  
  // Test 1: Get all inventory
  const listResponse = await makeRequest('/inventory');
  assertTrue(listResponse.ok, 'Get all inventory succeeds');
  assertTrue(Array.isArray(listResponse.data.data), 'Inventory list is an array');
  
  if (listResponse.data.data.length > 0) {
    testInventoryId = listResponse.data.data[0]._id || listResponse.data.data[0].id;
  }
  
  // Test 2: Get inventory by material
  if (testMaterialId) {
    const materialInvResponse = await makeRequest(`/inventory?material=${testMaterialId}`);
    assertTrue(materialInvResponse.ok, 'Get inventory by material succeeds');
  }
  
  // Test 3: Get single inventory item
  if (testInventoryId) {
    const getResponse = await makeRequest(`/inventory/${testInventoryId}`);
    assertTrue(getResponse.ok, 'Get inventory by ID succeeds');
  }
  
  // Test 4: Issue material from inventory
  if (testMaterialId && testProjectId) {
    const issueResponse = await makeRequest(`/inventory/issue`, {
      method: 'POST',
      body: JSON.stringify({
        materialId: testMaterialId,
        projectId: testProjectId,
        quantity: 50,
        notes: 'Test issue to site worker'
      })
    });
    assertTrue(issueResponse.ok, 'Issue material from inventory succeeds',
      !issueResponse.ok ? issueResponse.data.message : '');
  }
  
  // Test 5: Get inventory transactions
  const transactionsResponse = await makeRequest('/inventory/transactions');
  assertTrue(transactionsResponse.ok, 'Get inventory transactions succeeds');
}

async function testWasteAPIs() {
  console.log('\n🗑️ Testing Waste APIs...');
  
  if (!testMaterialId || !testProjectId) {
    console.log('⚠️ Skipping waste tests - missing material or project');
    return;
  }
  
  // Test 1: Create waste record
  const wasteData = {
    materialId: testMaterialId,
    projectId: testProjectId,
    quantity: 10,
    reason: 'damaged',
    description: 'Test waste record',
    date: new Date().toISOString()
  };
  
  const createResponse = await makeRequest('/waste', {
    method: 'POST',
    body: JSON.stringify(wasteData)
  });
  
  assertTrue(createResponse.ok, 'Create waste record succeeds',
    !createResponse.ok ? createResponse.data.message : '');
  
  if (createResponse.ok && createResponse.data.data) {
    testWasteRecordId = createResponse.data.data._id || createResponse.data.data.id;
  }
  
  // Test 2: Get all waste records
  const listResponse = await makeRequest('/waste');
  assertTrue(listResponse.ok, 'Get all waste records succeeds');
  
  // Test 3: Get single waste record
  if (testWasteRecordId) {
    const getResponse = await makeRequest(`/waste/${testWasteRecordId}`);
    assertTrue(getResponse.ok, 'Get waste record by ID succeeds');
  }
  
  // Test 4: Filter waste by project
  const filterResponse = await makeRequest(`/waste?projectId=${testProjectId}`);
  assertTrue(filterResponse.ok, 'Filter waste by project succeeds');
}

async function testConsumptionAPIs() {
  console.log('\n📊 Testing Consumption Plan APIs...');
  
  if (!testProjectId || !testMaterialId) {
    console.log('⚠️ Skipping consumption tests - missing project or material');
    return;
  }
  
  // Test 1: Create consumption plan
  const consumptionData = {
    projectId: testProjectId,
    materialId: testMaterialId,
    plannedQuantity: 500,
    plannedUnitCost: 50,
    period: '2026-10',
    notes: 'Test consumption plan'
  };
  
  const createResponse = await makeRequest('/consumption-plans', {
    method: 'POST',
    body: JSON.stringify(consumptionData)
  });
  
  assertTrue(createResponse.ok, 'Create consumption plan succeeds',
    !createResponse.ok ? createResponse.data.message : '');
  
  if (createResponse.ok && createResponse.data.data) {
    testConsumptionPlanId = createResponse.data.data._id || createResponse.data.data.id;
  }
  
  // Test 2: Get all consumption plans
  const listResponse = await makeRequest('/consumption-plans');
  assertTrue(listResponse.ok, 'Get all consumption plans succeeds');
  
  // Test 3: Get single consumption plan
  if (testConsumptionPlanId) {
    const getResponse = await makeRequest(`/consumption-plans/${testConsumptionPlanId}`);
    assertTrue(getResponse.ok, 'Get consumption plan by ID succeeds');
  }
  
  // Test 4: Update consumption plan
  if (testConsumptionPlanId) {
    const updateResponse = await makeRequest(`/consumption-plans/${testConsumptionPlanId}`, {
      method: 'PATCH',
      body: JSON.stringify({ actualQuantity: 450, actualUnitCost: 52 })
    });
    assertTrue(updateResponse.ok, 'Update consumption plan succeeds');
  }
}

async function testDashboardAPIs() {
  console.log('\n📈 Testing Dashboard APIs...');
  
  // Test 1: Get dashboard summary
  const summaryResponse = await makeRequest('/dashboard/summary');
  assertTrue(summaryResponse.ok, 'Get dashboard summary succeeds',
    !summaryResponse.ok ? summaryResponse.data.message : '');
  
  if (summaryResponse.ok && summaryResponse.data.data) {
    const summary = summaryResponse.data.data;
    assertTrue(typeof summary === 'object', 'Dashboard summary is an object');
  }
  
  // Test 2: Get project-specific dashboard
  if (testProjectId) {
    const projectDashResponse = await makeRequest(`/dashboard/project/${testProjectId}`);
    assertTrue(projectDashResponse.ok, 'Get project dashboard succeeds',
      !projectDashResponse.ok ? projectDashResponse.data.message : '');
  }
}

async function testAnalyticsAPIs() {
  console.log('\n📊 Testing Analytics APIs...');
  
  if (!testProjectId) {
    console.log('⚠️ Skipping analytics tests - missing project ID');
    return;
  }
  
  // Test 1: Cost analytics
  const costResponse = await makeRequest(`/analytics/cost?projectId=${testProjectId}`);
  assertTrue(costResponse.ok, 'Get cost analysis succeeds',
    !costResponse.ok ? costResponse.data.message : '');
  
  // Test 2: ABC classification
  const abcResponse = await makeRequest(`/analytics/abc?projectId=${testProjectId}`);
  assertTrue(abcResponse.ok, 'Get ABC analysis succeeds',
    !abcResponse.ok ? abcResponse.data.message : '');
  
  // Test 3: SDE classification
  const sdeResponse = await makeRequest(`/analytics/sde?projectId=${testProjectId}`);
  assertTrue(sdeResponse.ok, 'Get SDE analysis succeeds',
    !sdeResponse.ok ? sdeResponse.data.message : '');
  
  // Test 4: EOQ analysis
  const eoqResponse = await makeRequest(`/analytics/eoq?projectId=${testProjectId}`);
  assertTrue(eoqResponse.ok, 'Get EOQ analysis succeeds',
    !eoqResponse.ok ? eoqResponse.data.message : '');
}

async function testUserAPIs() {
  console.log('\n👤 Testing User APIs...');
  
  // Test 1: Get all users (admin only)
  const listResponse = await makeRequest('/users');
  assertTrue(listResponse.ok, 'Get all users succeeds');
}

// Run all tests
async function runAllTests() {
  console.log('🚀 Starting Comprehensive Integration Tests\n');
  console.log('='.repeat(60));
  
  try {
    await testHealthCheck();
    await testAuthAPIs();

    // If we didn't get a token, all remaining tests will fail with 401 — abort early
    if (!authToken) {
      console.log('\n❌ No auth token obtained. Aborting remaining tests.');
      console.log('   Make sure the backend is running at http://localhost:5000');
      process.exit(1);
    }

    await testUserAPIs();
    await testProjectAPIs();
    await testMaterialAPIs();
    await testSupplierAPIs();
    await testPurchaseOrderAPIs();
    await testInventoryAPIs();
    await testWasteAPIs();
    await testConsumptionAPIs();
    await testDashboardAPIs();
    await testAnalyticsAPIs();
    
    console.log('\n' + '='.repeat(60));
    console.log('\n📊 TEST RESULTS SUMMARY\n');
    console.log(`Total Tests: ${testResults.total}`);
    console.log(`✅ Passed: ${testResults.passed}`);
    console.log(`❌ Failed: ${testResults.failed}`);
    console.log(`Success Rate: ${((testResults.passed / testResults.total) * 100).toFixed(2)}%`);
    
    if (testResults.errors.length > 0) {
      console.log('\n❌ Failed Tests:');
      testResults.errors.forEach((error, index) => {
        console.log(`${index + 1}. ${error.test}`);
        if (error.details) console.log(`   ${error.details}`);
      });
    }
    
    console.log('\n' + '='.repeat(60));
    
  } catch (error) {
    console.error('\n❌ Test suite error:', error);
    process.exit(1);
  }
}

// Run the tests
runAllTests().catch(console.error);
