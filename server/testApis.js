import externalApiService from './services/externalApiService.js'
import dotenv from 'dotenv'

dotenv.config()

async function testExternalApis() {
  console.log('🧪 Testing External API Integrations...\n')

  // Test Makeup API (Free)
  console.log('📱 Testing Makeup API...')
  try {
    const makeupData = await externalApiService.fetchMakeupProducts('maybelline')
    console.log(`✅ Makeup API: Found ${makeupData.products?.length || 0} products`)
    if (makeupData.products && makeupData.products.length > 0) {
      console.log(`   Sample: ${makeupData.products[0].name} by ${makeupData.products[0].brand}`)
    }
  } catch (error) {
    console.log(`❌ Makeup API Error: ${error.message}`)
  }

  console.log()

  // Test SkinCare API (Free)
  console.log('🧴 Testing SkinCare API...')
  try {
    const skincareData = await externalApiService.fetchSkincareProducts()
    console.log(`✅ SkinCare API: Found ${skincareData.products?.length || 0} products`)
    if (skincareData.products && skincareData.products.length > 0) {
      console.log(`   Sample: ${skincareData.products[0].name} - ${skincareData.products[0].category}`)
    }
  } catch (error) {
    console.log(`❌ SkinCare API Error: ${error.message}`)
  }

  console.log()

  // Test Sephora API (Requires RapidAPI key)
  console.log('🛍️ Testing Sephora API...')
  try {
    const sephoraData = await externalApiService.fetchSephoraProducts('moisturizer', 5)
    if (sephoraData.error) {
      console.log(`⚠️ Sephora API: ${sephoraData.error}`)
    } else {
      console.log(`✅ Sephora API: Found ${sephoraData.products?.length || 0} products`)
      if (sephoraData.products && sephoraData.products.length > 0) {
        console.log(`   Sample: ${sephoraData.products[0].name} by ${sephoraData.products[0].brand}`)
      }
    }
  } catch (error) {
    console.log(`❌ Sephora API Error: ${error.message}`)
  }

  console.log()

  // Test combined fetch
  console.log('🔄 Testing Combined API Fetch...')
  try {
    const allData = await externalApiService.fetchAllExternalProducts()
    console.log(`✅ Combined APIs: Found ${allData.products?.length || 0} total products`)
    console.log(`   Sources: ${JSON.stringify(allData.sources, null, 2)}`)
    
    if (allData.products && allData.products.length > 0) {
      console.log('\n📋 Sample Products:')
      allData.products.slice(0, 3).forEach((product, index) => {
        console.log(`   ${index + 1}. ${product.name} (${product.brand}) - $${product.price}`)
        console.log(`      Category: ${product.category} | Source: ${product.source}`)
      })
    }
  } catch (error) {
    console.log(`❌ Combined API Error: ${error.message}`)
  }

  console.log('\n✨ API Test Complete!')
}

// Run the test
testExternalApis().catch(console.error)
