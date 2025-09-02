import mongoose from 'mongoose';
import Product from './models/Product.js';
import dotenv from 'dotenv';

dotenv.config();

const sampleProducts = [
  {
    name: "Vitamin C Brightening Serum",
    brand: "GlowSkin",
    category: "Serum",
    subCategory: "Vitamin C Serums",
    price: 2800,
    originalPrice: 3500,
    currency: "BDT",
    description: "A powerful vitamin C serum that brightens skin and reduces dark spots while providing antioxidant protection.",
    images: [
      "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=500",
      "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=500&h=600",
      "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=500&h=700"
    ],
    inStock: true,
    stockQuantity: 50,
    skinType: ["Normal", "Dull", "Uneven"],
    skinConcern: ["Dark Spots", "Dullness", "Uneven Tone"],
    keyIngredients: ["Vitamin C", "Hyaluronic Acid", "Niacinamide"],
    keyBenefits: [
      "Brightens skin tone",
      "Reduces dark spots",
      "Provides antioxidant protection",
      "Hydrates and plumps skin"
    ],
    howToUse: [
      "Apply 2-3 drops to clean face",
      "Gently pat into skin",
      "Use in morning routine",
      "Follow with moisturizer and SPF"
    ],
    productType: "Serum",
    size: "30ml",
    spf: null,
    finish: "Dewy",
    coverage: null,
    rating: 4.5,
    reviewCount: 125,
    isVegan: true,
    isCrueltyFree: true,
    isOrganic: false,
    expiryDate: new Date('2025-12-31'),
    manufactureDate: new Date('2023-06-15'),
    batchNumber: "VC001-2023",
    barcode: "8901030875026"
  },
  {
    name: "Hydrating Rose Water Toner",
    brand: "PureGlow",
    category: "Toner",
    subCategory: "Hydrating Toners",
    price: 1500,
    originalPrice: 1800,
    currency: "BDT",
    description: "A gentle, alcohol-free toner infused with rose water and glycerin to hydrate and refresh your skin.",
    images: [
      "https://images.unsplash.com/photo-1570194065650-d99fb4bedf0a?w=500",
      "https://images.unsplash.com/photo-1570194065650-d99fb4bedf0a?w=500&h=600"
    ],
    inStock: true,
    stockQuantity: 75,
    skinType: ["All Skin Types", "Sensitive", "Dry"],
    skinConcern: ["Dryness", "Sensitivity", "Dullness"],
    keyIngredients: ["Rose Water", "Glycerin", "Aloe Vera"],
    keyBenefits: [
      "Hydrates and refreshes skin",
      "Balances skin pH",
      "Soothes irritated skin",
      "Prepares skin for serums"
    ],
    howToUse: [
      "Apply to cotton pad or spray directly",
      "Gently pat onto face and neck",
      "Use morning and evening",
      "Follow with serum and moisturizer"
    ],
    productType: "Toner",
    size: "150ml",
    spf: null,
    finish: "Natural",
    coverage: null,
    rating: 4.3,
    reviewCount: 89,
    isVegan: true,
    isCrueltyFree: true,
    isOrganic: true,
    expiryDate: new Date('2025-08-30'),
    manufactureDate: new Date('2023-08-15'),
    batchNumber: "RT002-2023",
    barcode: "8901030875033"
  },
  {
    name: "Niacinamide 10% + Zinc Serum",
    brand: "SkinScience",
    category: "Serum",
    subCategory: "Niacinamide Serums",
    price: 2200,
    originalPrice: 2200,
    currency: "BDT",
    description: "High-strength niacinamide serum with zinc to reduce pore appearance and control oil production.",
    images: [
      "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=500",
      "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=500&h=600"
    ],
    inStock: true,
    stockQuantity: 30,
    skinType: ["Oily", "Combination", "Acne-Prone"],
    skinConcern: ["Large Pores", "Oiliness", "Blemishes"],
    keyIngredients: ["Niacinamide 10%", "Zinc PCA", "Hyaluronic Acid"],
    keyBenefits: [
      "Minimizes pore appearance",
      "Controls oil production",
      "Reduces blemishes",
      "Improves skin texture"
    ],
    howToUse: [
      "Apply 2-3 drops to face",
      "Use morning or evening",
      "Start with every other day",
      "Build up to daily use"
    ],
    productType: "Serum",
    size: "30ml",
    spf: null,
    finish: "Matte",
    coverage: null,
    rating: 4.7,
    reviewCount: 203,
    isVegan: true,
    isCrueltyFree: true,
    isOrganic: false,
    expiryDate: new Date('2025-10-15'),
    manufactureDate: new Date('2023-04-20'),
    batchNumber: "NZ003-2023",
    barcode: "8901030875040"
  },
  {
    name: "Gentle Foaming Cleanser",
    brand: "CleanBeauty",
    category: "Cleanser",
    subCategory: "Foaming Cleansers",
    price: 1800,
    originalPrice: 2100,
    currency: "BDT",
    description: "A gentle, sulfate-free foaming cleanser that removes makeup and impurities without stripping the skin.",
    images: [
      "https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=500",
      "https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=500&h=600"
    ],
    inStock: true,
    stockQuantity: 60,
    skinType: ["All Skin Types", "Sensitive"],
    skinConcern: ["Makeup Removal", "Daily Cleansing"],
    keyIngredients: ["Coconut-derived Surfactants", "Chamomile", "Aloe Vera"],
    keyBenefits: [
      "Gently removes makeup",
      "Cleanses without stripping",
      "Soothes and calms skin",
      "Maintains skin barrier"
    ],
    howToUse: [
      "Wet face with lukewarm water",
      "Pump 1-2 times into hands",
      "Massage gently in circular motions",
      "Rinse thoroughly with water"
    ],
    productType: "Cleanser",
    size: "200ml",
    spf: null,
    finish: "Clean",
    coverage: null,
    rating: 4.4,
    reviewCount: 156,
    isVegan: true,
    isCrueltyFree: true,
    isOrganic: false,
    expiryDate: new Date('2025-09-30'),
    manufactureDate: new Date('2023-03-10'),
    batchNumber: "FC004-2023",
    barcode: "8901030875057"
  },
  {
    name: "SPF 50 Mineral Sunscreen",
    brand: "SunGuard",
    category: "Sunscreen",
    subCategory: "Mineral Sunscreens",
    price: 3200,
    originalPrice: 3800,
    currency: "BDT",
    description: "Broad-spectrum mineral sunscreen with zinc oxide and titanium dioxide for sensitive skin protection.",
    images: [
      "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500",
      "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500&h=600"
    ],
    inStock: true,
    stockQuantity: 40,
    skinType: ["All Skin Types", "Sensitive"],
    skinConcern: ["Sun Protection", "UV Damage"],
    keyIngredients: ["Zinc Oxide 20%", "Titanium Dioxide 15%", "Aloe Vera"],
    keyBenefits: [
      "Broad-spectrum SPF 50 protection",
      "Gentle on sensitive skin",
      "Water-resistant for 80 minutes",
      "No white cast formula"
    ],
    howToUse: [
      "Apply 15 minutes before sun exposure",
      "Use generously on face and neck",
      "Reapply every 2 hours",
      "Reapply after swimming or sweating"
    ],
    productType: "Sunscreen",
    size: "50ml",
    spf: 50,
    finish: "Natural",
    coverage: null,
    rating: 4.6,
    reviewCount: 178,
    isVegan: true,
    isCrueltyFree: true,
    isOrganic: false,
    expiryDate: new Date('2025-07-20'),
    manufactureDate: new Date('2023-07-25'),
    batchNumber: "MS005-2023",
    barcode: "8901030875064"
  },
  {
    name: "Retinol Night Renewal Serum",
    brand: "NightGlow",
    category: "Serum",
    subCategory: "Retinol Serums",
    price: 4500,
    originalPrice: 5200,
    currency: "BDT",
    description: "A gentle retinol serum for beginners that promotes cell turnover and reduces signs of aging.",
    images: [
      "https://images.unsplash.com/photo-1612817288484-6f916006741a?w=500",
      "https://images.unsplash.com/photo-1612817288484-6f916006741a?w=500&h=600"
    ],
    inStock: true,
    stockQuantity: 25,
    skinType: ["Normal", "Mature", "Combination"],
    skinConcern: ["Fine Lines", "Uneven Texture", "Aging"],
    keyIngredients: ["Retinol 0.5%", "Hyaluronic Acid", "Squalane"],
    keyBenefits: [
      "Reduces fine lines and wrinkles",
      "Improves skin texture",
      "Promotes cell renewal",
      "Minimizes appearance of pores"
    ],
    howToUse: [
      "Use only at night",
      "Start with 2-3 times per week",
      "Apply 2-3 drops to clean skin",
      "Always follow with SPF in morning"
    ],
    productType: "Serum",
    size: "30ml",
    spf: null,
    finish: "Smooth",
    coverage: null,
    rating: 4.8,
    reviewCount: 94,
    isVegan: true,
    isCrueltyFree: true,
    isOrganic: false,
    expiryDate: new Date('2025-11-15'),
    manufactureDate: new Date('2023-05-30'),
    batchNumber: "RN006-2023",
    barcode: "8901030875071"
  }
];

async function addSampleProducts() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing products (optional)
    await Product.deleteMany({});
    console.log('🗑️ Cleared existing products');

    // Add sample products
    const products = await Product.insertMany(sampleProducts);
    console.log(`✅ Added ${products.length} sample products with BDT pricing:`);
    
    products.forEach(product => {
      console.log(`- ${product.name}: ৳${product.price.toLocaleString()} (was ৳${product.originalPrice.toLocaleString()})`);
    });

    console.log('\n🎉 Sample products added successfully!');
    console.log('You can now visit http://localhost:5173 to see your products.');
    
  } catch (error) {
    console.error('❌ Error adding sample products:', error);
  } finally {
    await mongoose.connection.close();
    console.log('📝 Database connection closed');
    process.exit(0);
  }
}

// Run the script
addSampleProducts();
