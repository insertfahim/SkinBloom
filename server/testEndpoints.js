import fetch from 'node-fetch'

const BASE_URL = 'http://localhost:5000'

async function testApiEndpoints() {
  console.log('🧪 Testing SkinBloom API Endpoints...\n')

  // Test 1: Get all products (should include external data)
  console.log('1️⃣ Testing GET /api/products (all sources)')
  try {
    const response = await fetch(`${BASE_URL}/api/products`)
    const data = await response.json()
    console.log(`✅ Found ${data.products?.length || 0} total products`)
    console.log(`📊 Sources: ${JSON.stringify(data.sources)}`)
    
    if (data.products && data.products.length > 0) {
      console.log(`📝 Sample: ${data.products[0].name} (${data.products[0].source || 'local'})`)
    }
  } catch (error) {
    console.log(`❌ Error: ${error.message}`)
  }

  console.log()

  // Test 2: Get external products only
  console.log('2️⃣ Testing GET /api/products/external')
  try {
    const response = await fetch(`${BASE_URL}/api/products/external`)
    const data = await response.json()
    console.log(`✅ Found ${data.products?.length || 0} external products`)
    
    if (data.products && data.products.length > 0) {
      console.log(`📝 Sample: ${data.products[0].name} from ${data.products[0].source}`)
    }
  } catch (error) {
    console.log(`❌ Error: ${error.message}`)
  }

  console.log()

  // Test 3: Search products
  console.log('3️⃣ Testing search functionality')
  try {
    const response = await fetch(`${BASE_URL}/api/products?search=lipstick`)
    const data = await response.json()
    console.log(`✅ Found ${data.products?.length || 0} products for "lipstick"`)
    
    if (data.products && data.products.length > 0) {
      data.products.slice(0, 3).forEach((product, i) => {
        console.log(`   ${i + 1}. ${product.name} - ${product.brand} ($${product.price})`)
      })
    }
  } catch (error) {
    console.log(`❌ Error: ${error.message}`)
  }

  console.log()

  // Test 4: Filter by category
  console.log('4️⃣ Testing category filter')
  try {
    const response = await fetch(`${BASE_URL}/api/products?category=Foundation`)
    const data = await response.json()
    console.log(`✅ Found ${data.products?.length || 0} foundation products`)
  } catch (error) {
    console.log(`❌ Error: ${error.message}`)
  }

  console.log()

  // Test 5: Get makeup API products only
  console.log('5️⃣ Testing makeup API products')
  try {
    const response = await fetch(`${BASE_URL}/api/products/external?source=makeup`)
    const data = await response.json()
    console.log(`✅ Found ${data.products?.length || 0} makeup API products`)
    
    if (data.products && data.products.length > 0) {
      const brands = [...new Set(data.products.map(p => p.brand))].slice(0, 5)
      console.log(`🏷️ Brands: ${brands.join(', ')}`)
    }
  } catch (error) {
    console.log(`❌ Error: ${error.message}`)
  }

  console.log('\n✨ API Test Complete!')
  console.log('\n🌐 Frontend available at: http://localhost:5174')
  console.log('📚 API Documentation: See API_INTEGRATION_GUIDE.md')
}

// Run the test
testApiEndpoints().catch(console.error)
