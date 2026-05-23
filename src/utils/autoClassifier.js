/* ============================================
   KOALA — AI Auto-Classifier Engine
   Analyzes product name/brand to auto-assign
   category, department, and brand.
   Used by both Admin and Store sides.
   ============================================ */

const CATEGORY_RULES = [
  { category: 'Tenis y Zapatos', keywords: ['teni', 'zapato', 'sneaker', 'bota', 'sandalia', 'shoe'] },
  { category: 'Ropa - T-Shirts', keywords: ['t-shirt', 'tee', 'camiseta'] },
  { category: 'Ropa - Polos', keywords: ['polo'] },
  { category: 'Ropa - Hoodies', keywords: ['hoodie', 'sudadera'] },
  { category: 'Ropa - Pantalones Largos', keywords: ['pantalon', 'jean', 'jogger', 'sweatpant', 'largo'] },
  { category: 'Ropa - Pantalones Cortos', keywords: ['short', 'bermuda', 'corto'] },
  { category: 'Ropa - Camisas Manga Larga', keywords: ['manga larga', 'long sleeve'] },
  { category: 'Ropa - Ropa Deportiva', keywords: ['gym', 'deportiv', 'activewear'] },
  { category: 'Ropa - Sets', keywords: ['set', 'conjunto', 'matching'] },
  { category: 'Ropa - Vestidos', keywords: ['vestido', 'dress'] },
  { category: 'Ropa - Trajes de Baños', keywords: ['baño', 'swim', 'bikini'] },
  { category: 'Ropa - Camisas sin manga', keywords: ['sin manga', 'tank top'] },
  { category: 'Ropa - Crop Top', keywords: ['crop top', 'crop'] },
  { category: 'Gorras', keywords: ['gorra', 'hat', 'cap', 'beanie'] },
  { category: 'Gafas', keywords: ['gafa', 'lente', 'sunglass', 'anteojos'] },
  { category: 'Prendas - Collares', keywords: ['collar', 'choker'] },
  { category: 'Prendas - Pantallas', keywords: ['pantalla', 'arete', 'earring'] },
  { category: 'Prendas - Pulseras', keywords: ['pulsera', 'bracelet'] },
  { category: 'Prendas - Sortijas', keywords: ['sortija', 'anillo', 'ring'] },
  { category: 'Prendas - Cadenas', keywords: ['cadena', 'chain'] },
  { category: 'Carteras', keywords: ['cartera', 'bols', 'wallet', 'bag', 'purse', 'handbag', 'mochila'] },
  { category: 'Relojes', keywords: ['reloj', 'watch', 'smartwatch'] },
  { category: 'Splash', keywords: ['splash', 'perfume', 'fraganc', 'body mist'] },
  { category: 'Medias', keywords: ['media', 'sock', 'calcetin'] },
  { category: 'Accesorios', keywords: ['accesorio', 'cinturón', 'belt', 'bufanda', 'guante', 'joyería'] }
];

const DEPARTMENT_RULES = [
  { department: 'Mujer', keywords: ['mujer', 'dama', 'lady', 'women', 'femenin', 'her', 'ella'] },
  { department: 'Hombre', keywords: ['hombre', 'caballero', 'men', 'masculin', 'him', 'él'] },
  { department: 'Niños', keywords: ['niñ', 'kid', 'boy', 'girl', 'infant', 'bebé', 'junior', 'youth', 'jr'] }
];

const BRAND_RULES = [
  { brand: 'Nike', keywords: ['nike', 'air max', 'air force', 'dunk', 'cortez'] },
  { brand: 'Adidas', keywords: ['adidas', 'yeezy', 'samba', 'gazelle', 'superstar'] },
  { brand: 'Jordan', keywords: ['jordan', 'retro aj'] },
  { brand: 'New Balance', keywords: ['new balance', 'nb 550', 'nb 530', 'nb 990', 'nb 574'] },
  { brand: 'Puma', keywords: ['puma'] },
  { brand: 'Alo Yoga', keywords: ['alo'] },
  { brand: 'Gucci', keywords: ['gucci'] },
  { brand: 'Prada', keywords: ['prada'] },
  { brand: 'Louis Vuitton', keywords: ['louis vuitton', 'lv '] },
  { brand: 'Versace', keywords: ['versace'] },
  { brand: 'Ralph Lauren', keywords: ['ralph lauren', 'polo ralph'] },
  { brand: 'Tommy Hilfiger', keywords: ['tommy'] },
  { brand: 'Lacoste', keywords: ['lacoste'] },
  { brand: 'Converse', keywords: ['converse', 'chuck taylor'] },
  { brand: 'Vans', keywords: ['vans', 'old skool'] },
  { brand: 'Fila', keywords: ['fila'] },
  { brand: 'Reebok', keywords: ['reebok'] },
  { brand: 'Under Armour', keywords: ['under armour', 'ua '] },
  { brand: 'Balenciaga', keywords: ['balenciaga'] },
  { brand: 'Dior', keywords: ['dior'] },
  { brand: 'Ray-Ban', keywords: ['ray-ban', 'rayban', 'ray ban'] },
  { brand: 'Oakley', keywords: ['oakley'] },
  { brand: 'Casio', keywords: ['casio', 'g-shock'] },
  { brand: 'Rolex', keywords: ['rolex'] },
  { brand: 'Michael Kors', keywords: ['michael kors', 'mk '] },
  { brand: 'Coach', keywords: ['coach'] },
  { brand: 'Zara', keywords: ['zara'] },
  { brand: 'H&M', keywords: ['h&m'] },
  { brand: 'Levi\'s', keywords: ['levi', 'levis'] }
];

/**
 * Classify a product based on its name and existing data.
 * Returns { category, department, brand } — only fills missing fields.
 */
export function classifyProduct(product) {
  const lowerName = (product.name || '').toLowerCase();
  const lowerBrand = (product.brand || '').toLowerCase();
  const combined = lowerName + ' ' + lowerBrand;

  const result = {};

  // --- Category ---
  if (!product.category || product.category === 'Sin Categoría') {
    for (const rule of CATEGORY_RULES) {
      if (rule.keywords.some(kw => combined.includes(kw))) {
        result.category = rule.category;
        break;
      }
    }
  }

  // --- Department ---
  if (!product.department || product.department === 'Sin Departamento') {
    for (const rule of DEPARTMENT_RULES) {
      if (rule.keywords.some(kw => combined.includes(kw))) {
        result.department = rule.department;
        break;
      }
    }
    // Default if still unset
    if (!result.department && !product.department) {
      result.department = 'Unisex';
    }
  }

  // --- Brand ---
  if (!product.brand || product.brand === 'Sin Marca') {
    for (const rule of BRAND_RULES) {
      if (rule.keywords.some(kw => lowerName.includes(kw))) {
        result.brand = rule.brand;
        break;
      }
    }
  }

  return result;
}

/**
 * Run auto-classification on an array of products.
 * Returns products that were modified (for batch saving).
 */
export function classifyAllProducts(products) {
  const modified = [];

  for (const product of products) {
    const suggestions = classifyProduct(product);
    let changed = false;

    if (suggestions.category && suggestions.category !== product.category) {
      product.category = suggestions.category;
      changed = true;
    }
    if (suggestions.department && suggestions.department !== product.department) {
      product.department = suggestions.department;
      changed = true;
    }
    if (suggestions.brand && suggestions.brand !== product.brand) {
      product.brand = suggestions.brand;
      changed = true;
    }

    if (changed) {
      modified.push(product);
    }
  }

  return modified;
}
