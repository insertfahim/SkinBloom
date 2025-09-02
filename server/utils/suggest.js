export function suggestProductsForSkin(products, skinType){
  if(!skinType) return products.slice(0,10)
  return products.filter(p => (p.skinTypeSuitability||[]).includes(skinType))
}