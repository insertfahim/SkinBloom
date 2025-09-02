# 📝 MongoDB Product Template for Manual Entry

This template shows you exactly how to add products manually to your MongoDB database with all required fields.

## 🗄️ Database Collection: `products`

### 📋 Required Product Structure

```json
{
  "_id": "ObjectId(auto-generated)",
  "name": "Product Name Here",
  "brand": "Brand Name",
  "category": "Select from available categories",
  "price": 1250.00,
  "originalPrice": 1500.00,
  "currency": "BDT",
  "discount": 17,
  "description": "Detailed product description here...",
  "briefDescription": "Short one-line description",
  "ingredients": [
    "Niacinamide 10%",
    "Zinc PCA 1%",
    "Hyaluronic Acid",
    "Vitamin B3"
  ],
  "keyBenefits": [
    "Reduces skin blemishes",
    "Controls oil production",
    "Minimizes pore appearance",
    "Brightens skin tone"
  ],
  "howToUse": [
    "Apply to clean skin",
    "Use morning and evening",
    "Avoid contact with eyes",
    "Use sunscreen during day"
  ],
  "image": "https://example.com/product-image.jpg",
  "images": [
    "https://example.com/product-image-1.jpg",
    "https://example.com/product-image-2.jpg",
    "https://example.com/product-image-3.jpg"
  ],
  "productLink": "https://store.com/product-page",
  "size": "30ml",
  "weight": "35g",
  "skinType": ["All skin types", "Oily skin", "Acne-prone"],
  "concerns": ["Acne", "Blemishes", "Large pores", "Oily skin"],
  "rating": 4.5,
  "reviewCount": 1250,
  "stockQuantity": 100,
  "isActive": true,
  "isFeatured": false,
  "tags": ["bestseller", "vegan", "cruelty-free", "dermatologist-tested"],
  "source": "local",
  "seoTitle": "The Ordinary Niacinamide 10% + Zinc 1% - Reduce Blemishes",
  "seoDescription": "High concentration niacinamide serum to reduce blemishes and balance oil production",
  "seoKeywords": ["niacinamide", "zinc", "blemishes", "oily skin", "the ordinary"],
  "createdAt": "2025-09-03T00:00:00.000Z",
  "updatedAt": "2025-09-03T00:00:00.000Z"
}
```

## 📚 Available Categories (Choose One)

```javascript
// Skincare Categories
"Cleanser"
"Moisturizer" 
"Serum"
"Toner"
"Sunscreen"
"Face Mask"
"Eye Cream"
"Lip Care"
"Face Oil"
"Exfoliant"
"Treatment"
"Essence"
"Mist"
"Spot Treatment"
"Night Cream"
"Day Cream"
"Anti-Aging"
"Hydrating"
"Brightening"
"Acne Treatment"

// Makeup Categories
"Foundation"
"Concealer"
"Powder"
"Blush"
"Bronzer"
"Highlighter"
"Eyeshadow"
"Mascara"
"Eyeliner"
"Eyebrow"
"Lipstick"
"Lip Gloss"
"Lip Liner"
"Setting Spray"
"Primer"

// Body Care Categories
"Body Lotion"
"Body Wash"
"Body Oil"
"Hand Cream"
"Foot Care"
"Deodorant"
"Body Scrub"
"Body Mist"

// Hair Care Categories
"Shampoo"
"Conditioner"
"Hair Mask"
"Hair Oil"
"Hair Serum"
"Styling Products"

// Tools Categories
"Brushes"
"Sponges"
"Tools"
"Accessories"
```

## 💰 Price Format (Bangladeshi Taka)

```json
{
  "price": 1250.00,        // Current price in BDT
  "originalPrice": 1500.00, // Original price (for discount calculation)
  "currency": "BDT",       // Always "BDT" for Bangladeshi Taka
  "discount": 17           // Discount percentage (auto-calculated)
}
```

## 🖼️ Image Guidelines

### Single Image
```json
"image": "https://your-image-hosting.com/product-main-image.jpg"
```

### Multiple Images (Recommended)
```json
"images": [
  "https://your-image-hosting.com/product-front.jpg",    // Main product image
  "https://your-image-hosting.com/product-back.jpg",     // Back/ingredients
  "https://your-image-hosting.com/product-texture.jpg",  // Texture/swatch
  "https://your-image-hosting.com/product-packaging.jpg" // Full packaging
]
```

### Image Hosting Options
- **Cloudinary** (Recommended): Free tier available
- **AWS S3**: Professional hosting
- **Google Drive**: Make sure links are public
- **GitHub**: Store in repository assets folder

## 📝 Sample Product Entries

### Example 1: The Ordinary Niacinamide Serum

```json
{
  "name": "The Ordinary Niacinamide 10% + Zinc 1%",
  "brand": "The Ordinary",
  "category": "Serum",
  "price": 1199.00,
  "originalPrice": 1350.00,
  "currency": "BDT",
  "discount": 11,
  "description": "Niacinamide (Vitamin B3) is indicated to reduce the appearance of skin blemishes and congestion. A high 10% concentration of this vitamin is supported in the formula by zinc PCA. Contraindications: If topical Vitamin C (L-Ascorbic Acid and/or Ethylated L-Ascorbic Acid) is used as part of skincare, it should be applied at alternate times with this formula (ideally Vitamin C in the AM, Niacinamide in the PM). Otherwise, Niacinamide can affect integrity of the Vitamin C.",
  "briefDescription": "High-strength vitamin and mineral blemish formula",
  "ingredients": [
    "Niacinamide 10%",
    "Zinc PCA 1%",
    "Aqua (Water)",
    "Pentylene Glycol",
    "Tamarindus Indica Seed Gum",
    "Carrageenan",
    "Acacia Senegal Gum",
    "Xanthan Gum",
    "Isoceteth-20",
    "Ethoxydiglycol",
    "Phenoxyethanol",
    "Chlorphenesin"
  ],
  "keyBenefits": [
    "Reduces appearance of skin blemishes",
    "Reduces appearance of skin congestion", 
    "Balances visible aspects of sebum activity",
    "Suitable for daily use"
  ],
  "howToUse": [
    "Apply to entire face morning and evening before heavier creams",
    "Avoid eye area",
    "Patch test prior to use",
    "Use sunscreen when using this product"
  ],
  "image": "https://example.com/the-ordinary-niacinamide.jpg",
  "images": [
    "https://example.com/the-ordinary-niacinamide-front.jpg",
    "https://example.com/the-ordinary-niacinamide-ingredients.jpg",
    "https://example.com/the-ordinary-niacinamide-texture.jpg"
  ],
  "productLink": "https://theordinary.com/product/rdn-niacinamide-10pct-zinc-1pct-30ml",
  "size": "30ml",
  "weight": "35g",
  "skinType": ["All skin types", "Oily skin", "Combination skin", "Acne-prone skin"],
  "concerns": ["Acne", "Blemishes", "Large pores", "Oily skin", "Uneven texture"],
  "rating": 4.3,
  "reviewCount": 15420,
  "stockQuantity": 150,
  "isActive": true,
  "isFeatured": true,
  "tags": ["bestseller", "vegan", "cruelty-free", "oil-free", "water-based"],
  "source": "local",
  "seoTitle": "The Ordinary Niacinamide 10% + Zinc 1% Serum - Blemish Treatment",
  "seoDescription": "Reduce blemishes and control oil with The Ordinary's high-strength niacinamide serum. Perfect for oily and acne-prone skin.",
  "seoKeywords": ["niacinamide", "zinc", "blemishes", "oily skin", "the ordinary", "serum", "acne treatment"]
}
```

### Example 2: CeraVe Foaming Cleanser

```json
{
  "name": "CeraVe Foaming Facial Cleanser",
  "brand": "CeraVe",
  "category": "Cleanser",
  "price": 850.00,
  "originalPrice": 950.00,
  "currency": "BDT",
  "discount": 11,
  "description": "Developed with dermatologists, CeraVe Foaming Facial Cleanser has a unique formula with three essential ceramides (1, 3, 6-II) that cleanses and removes oil without disrupting the protective skin barrier. Gentle foaming action refreshes and cleanses skin, including removing makeup.",
  "briefDescription": "Gentle foaming cleanser for normal to oily skin",
  "ingredients": [
    "Aqua/Water",
    "Cocamidopropyl Hydroxysultaine", 
    "Sodium Lauroyl Sarcosinate",
    "Niacinamide",
    "Ceramide NP",
    "Ceramide AP", 
    "Ceramide EOP",
    "Carbomer",
    "Hyaluronic Acid",
    "Cholesterol",
    "Sodium Chloride",
    "Sodium Lauroyl Lactylate",
    "Citric Acid",
    "Capryloyl Glycine",
    "Caprylyl Glycol",
    "Phenoxyethanol"
  ],
  "keyBenefits": [
    "Removes excess oil and dirt",
    "Maintains skin's natural barrier",
    "Contains 3 essential ceramides",
    "Suitable for daily use",
    "Non-comedogenic and fragrance-free"
  ],
  "howToUse": [
    "Wet skin with lukewarm water",
    "Massage cleanser into skin in a gentle circular motion",
    "Rinse and pat dry with a clean towel",
    "Use morning and evening"
  ],
  "image": "https://example.com/cerave-foaming-cleanser.jpg",
  "images": [
    "https://example.com/cerave-cleanser-front.jpg",
    "https://example.com/cerave-cleanser-back.jpg",
    "https://example.com/cerave-cleanser-pump.jpg"
  ],
  "productLink": "https://cerave.com/skincare/cleansers/foaming-facial-cleanser",
  "size": "236ml",
  "weight": "250g", 
  "skinType": ["Normal skin", "Oily skin", "Combination skin"],
  "concerns": ["Daily cleansing", "Oily skin", "Makeup removal"],
  "rating": 4.6,
  "reviewCount": 8920,
  "stockQuantity": 80,
  "isActive": true,
  "isFeatured": false,
  "tags": ["dermatologist-developed", "ceramides", "hyaluronic-acid", "non-comedogenic"],
  "source": "local",
  "seoTitle": "CeraVe Foaming Facial Cleanser - Gentle Daily Cleanser",
  "seoDescription": "Gentle foaming cleanser with ceramides and niacinamide for normal to oily skin. Developed by dermatologists.",
  "seoKeywords": ["cerave", "cleanser", "foaming", "ceramides", "oily skin", "gentle", "daily cleanser"]
}
```

## 🛠️ How to Add Products to MongoDB

### Method 1: MongoDB Compass (GUI)
1. Open MongoDB Compass
2. Connect to your database
3. Navigate to your database → `products` collection
4. Click "INSERT DOCUMENT"
5. Paste the JSON template
6. Fill in your product details
7. Click "INSERT"

### Method 2: MongoDB Shell
```bash
# Connect to MongoDB
mongosh "your_connection_string"

# Switch to your database
use your_database_name

# Insert single product
db.products.insertOne({
  // Paste your product JSON here
})

# Insert multiple products
db.products.insertMany([
  {
    // Product 1 JSON
  },
  {
    // Product 2 JSON  
  }
])
```

### Method 3: Using Node.js Script
Create a file `addProducts.js`:

```javascript
import mongoose from 'mongoose'
import Product from './models/Product.js'

// Connect to MongoDB
mongoose.connect('your_mongodb_connection_string')

const products = [
  {
    // Your product JSON here
  }
]

// Insert products
Product.insertMany(products)
  .then(() => {
    console.log('Products added successfully!')
    process.exit(0)
  })
  .catch(err => {
    console.error('Error adding products:', err)
    process.exit(1)
  })
```

## 💡 Tips for Product Entry

### 1. Price Formatting
- Always use numbers (not strings) for prices
- Use 2 decimal places: `1250.00` not `1250`
- Currency should always be "BDT"

### 2. Image URLs
- Use high-quality images (at least 800x800px)
- Ensure images are publicly accessible
- Test image URLs before adding

### 3. Categories
- Use exact category names from the list above
- Categories are case-sensitive
- Stick to existing categories for consistency

### 4. SEO Fields
- Always fill SEO title, description, and keywords
- Keep titles under 60 characters
- Keep descriptions under 160 characters

### 5. Stock Management
- Set realistic stock quantities
- Use `isActive: true` for available products
- Use `isFeatured: true` for homepage products

## 🔄 Bulk Import Template

For importing multiple products, use this array format:

```json
[
  {
    // Product 1
  },
  {
    // Product 2  
  },
  {
    // Product 3
  }
]
```

This template will ensure your products display correctly in both the grid view (2nd image style) and detailed view (1st image style) with proper Bangladeshi Taka pricing! 🇧🇩
