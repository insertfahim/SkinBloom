// Sample Product Insert Script for Testing
// Run this in MongoDB Compass or MongoDB Shell

// Sample products to test the detailed product view
db.products.insertMany([
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
    "image": "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=500",
    "images": [
      "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=500",
      "https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=500",
      "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=500"
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
  },
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
    "image": "https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=500",
    "images": [
      "https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=500",
      "https://images.unsplash.com/photo-1570194065650-d99fb4bedf0a?w=500",
      "https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=500"
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
  },
  {
    "name": "Fenty Beauty Pro Filt'r Soft Matte Longwear Foundation",
    "brand": "Fenty Beauty",
    "category": "Foundation",
    "price": 2850.00,
    "originalPrice": 3200.00,
    "currency": "BDT",
    "discount": 11,
    "description": "A longwearing, buildable foundation with medium to full coverage and a soft matte finish. Available in 50 shades, Pro Filt'r Foundation is designed to work for a wide range of skin tones and undertones. The climate-adaptive, soft matte formula is designed to withstand sweat and humidity.",
    "briefDescription": "Longwear soft matte foundation with 50 shades",
    "ingredients": [
      "Water/Aqua/Eau",
      "Dimethicone",
      "Isododecane",
      "Alcohol Denat.",
      "Trimethylsiloxysilicate",
      "PEG-10 Dimethicone",
      "Nylon-12",
      "Magnesium Sulfate",
      "Phenoxyethanol",
      "Sodium Chloride",
      "Hydrogen Dimethicone",
      "Disteardimonium Hectorite",
      "Tocopheryl Acetate",
      "Glycerin",
      "Propylene Carbonate",
      "Ethylhexylglycerin"
    ],
    "keyBenefits": [
      "Medium to full buildable coverage",
      "Soft matte finish",
      "Longwearing formula",
      "Sweat and humidity resistant",
      "Available in 50 inclusive shades"
    ],
    "howToUse": [
      "Apply with Fenty Beauty brush, sponge, or fingers",
      "Start with a small amount and build coverage as needed",
      "Blend outward from center of face",
      "Set with powder for longer wear"
    ],
    "image": "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=500",
    "images": [
      "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=500",
      "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=500",
      "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=500"
    ],
    "productLink": "https://fentybeauty.com/products/pro-filtr-soft-matte-longwear-foundation",
    "size": "32ml",
    "weight": "45g",
    "skinType": ["All skin types", "Oily skin", "Combination skin"],
    "concerns": ["Long wear", "Coverage", "Oil control", "Sweat resistance"],
    "rating": 4.4,
    "reviewCount": 25670,
    "stockQuantity": 45,
    "isActive": true,
    "isFeatured": true,
    "tags": ["inclusive", "longwear", "soft-matte", "sweat-resistant", "buildable"],
    "source": "local",
    "seoTitle": "Fenty Beauty Pro Filt'r Foundation - Soft Matte Longwear",
    "seoDescription": "Get flawless coverage with Fenty Beauty's inclusive Pro Filt'r Foundation. 50 shades, longwear, soft matte finish.",
    "seoKeywords": ["fenty beauty", "foundation", "longwear", "soft matte", "inclusive shades", "pro filtr"]
  },
  {
    "name": "Neutrogena Hydro Boost Water Gel",
    "brand": "Neutrogena",
    "category": "Moisturizer",
    "price": 750.00,
    "currency": "BDT",
    "description": "Neutrogena Hydro Boost Water Gel is a refreshing gel moisturizer with hyaluronic acid that instantly quenches dry skin. The unique water gel formula absorbs quickly like a gel, but has the long-lasting intense moisturizing power of a cream.",
    "briefDescription": "Hyaluronic acid water gel moisturizer",
    "ingredients": [
      "Water",
      "Dimethicone",
      "Glycerin",
      "Cetearyl Olivate",
      "Sorbitan Olivate",
      "Sodium Hyaluronate",
      "Dimethicone Crosspolymer",
      "Synthetic Beeswax",
      "Dimethiconol",
      "Carbomer",
      "Sodium Hydroxide",
      "Ethylhexylglycerin",
      "Phenoxyethanol",
      "Caprylyl Glycol",
      "Blue 1"
    ],
    "keyBenefits": [
      "Instantly quenches dry skin",
      "Contains hyaluronic acid",
      "Oil-free and non-comedogenic",
      "Absorbs quickly like a gel",
      "24-hour hydration"
    ],
    "howToUse": [
      "Apply to clean face and neck",
      "Use morning and evening",
      "Can be used under makeup",
      "Perfect for daily use"
    ],
    "image": "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=500",
    "images": [
      "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=500",
      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=500"
    ],
    "size": "50g",
    "weight": "55g",
    "skinType": ["All skin types", "Dry skin", "Sensitive skin"],
    "concerns": ["Hydration", "Dry skin", "Daily moisturizing"],
    "rating": 4.2,
    "reviewCount": 5430,
    "stockQuantity": 120,
    "isActive": true,
    "isFeatured": false,
    "tags": ["hyaluronic-acid", "oil-free", "non-comedogenic", "24-hour-hydration"],
    "source": "local",
    "seoTitle": "Neutrogena Hydro Boost Water Gel - Hyaluronic Acid Moisturizer",
    "seoDescription": "Instantly hydrate your skin with Neutrogena Hydro Boost Water Gel. Contains hyaluronic acid for 24-hour moisture.",
    "seoKeywords": ["neutrogena", "hydro boost", "water gel", "hyaluronic acid", "moisturizer", "hydration"]
  }
])

// Verify the products were inserted
db.products.find({}, {name: 1, brand: 1, price: 1, currency: 1}).pretty()
