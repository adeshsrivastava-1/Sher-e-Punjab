import { MenuItem, RestaurantConfig } from '../types';

export const INITIAL_RESTAURANT_CONFIG: RestaurantConfig = {
  whatsappNumber: '593987900005', // Official WhatsApp for Sher E Punjab Quito (+593 98 790 0005)
  restaurantName: 'Sher E Punjab',
  address: 'Juan León Mera N26-77 y La Pinta, La Mariscal',
  city: 'Quito 170522, Ecuador',
  googleMapsCidUrl: 'https://www.google.com/maps/place/Sher+E+Punjab/@-0.1989787,-78.4922942,17z/data=!3m1!4b1!4m6!3m5!1s0x91d59a6c5488b57f:0x4ae3c72657a8d207!8m2!3d-0.1989841!4d-78.4897193!16s%2Fg%2F1hc6q9480',
  openingHours: {
    weekdays: '12:00 PM - 10:30 PM',
    weekends: '12:00 PM - 11:30 PM',
  },
  payphone: {
    enabled: true,
    storeId: process.env.PAYPHONE_STORE_ID || '',
    token: process.env.PAYPHONE_TOKEN || '',
    isSandbox: process.env.NODE_ENV !== 'production' || !process.env.PAYPHONE_TOKEN,
  },
};

export const INITIAL_MENU_ITEMS: MenuItem[] = [
  {
    id: 'dish-1',
    name: 'Aloo Tikki Llapingachos',
    spanishName: 'Llapingachos con Tikkis de Papa y Comino',
    category: 'small-plates',
    price: 8.50,
    description: 'Gold-crusted Andean potato cakes stuffed with melted quesillo and tempered with crushed mustard seed, cumin, and Kashmiri chili, served over warm peanut curry sauce (salsa de maní).',
    image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80',
    isVegetarian: true,
    isGlutenFree: true,
    spiceLevel: 1,
    originBadge: 'Highland Potato × Punjabi Spicing',
    flavorBridge: {
      ecuadorianComponent: 'Sierra Potato & Melted Quesillo with Creamy Peanut Ají',
      indianTechnique: 'Aloo Tikki Tarka with Pan-Crisped Mustard Seeds & Amchur'
    },
    ecuadorianIngredients: ['Andean Papa Chola', 'Quesillo de Hoja', 'Toasted Maní (Peanut)', 'Ají Criollo'],
    indianSpices: ['Whole Cumin', 'Yellow Mustard Seed', 'Kashmiri Red Chili', 'Amchur (Mango Powder)'],
    isAvailable: true,
    isFeatured: true,
    customOptions: [
      {
        id: 'opt-1-1',
        title: 'Dip & Sauce Extras',
        type: 'multiple',
        choices: [
          { id: 'c-1', name: 'Extra Salsa de Maní (Peanut Sauce)', priceExtra: 1.50 },
          { id: 'c-2', name: 'Artisanal Ají Criollo Shot', priceExtra: 1.00 },
          { id: 'c-3', name: 'Toasted Chulpi Corn Cup', priceExtra: 2.00 }
        ]
      }
    ]
  },
  {
    id: 'dish-2',
    name: 'Coast Encocado Biryani',
    spanishName: 'Biryani Encocado de Mariscos de la Costa',
    category: 'mains',
    price: 32.00,
    description: 'Fragrant Dum-cooked Basmati rice layered with Esmeraldas coastal prawns, fresh tuna, lemongrass, achiote infused coconut milk, and saffron threads baked under a puff pastry dome.',
    image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80',
    isVegetarian: false,
    isGlutenFree: false,
    spiceLevel: 2,
    originBadge: 'Esmeraldas Coconut × Malabar Biryani',
    flavorBridge: {
      ecuadorianComponent: 'Esmeraldas Fresh Coconut Cream & Artisanal Achiote Oil',
      indianTechnique: 'Dum Biryani Seal Technique with Saffron, Star Anise & Garam Masala'
    },
    ecuadorianIngredients: ['Coastal Jumbo Prawns', 'Esmeraldas Coconut Milk', 'Fresh Achiote Paste', 'Sweet Peppers'],
    indianSpices: ['Aged Basmati Rice', 'Kashmiri Saffron', 'Green Cardamom', 'Star Anise', 'Mace'],
    isAvailable: true,
    isFeatured: true,
    customOptions: [
      {
        id: 'opt-2-1',
        title: 'Protein Choice',
        type: 'single',
        isRequired: true,
        choices: [
          { id: 'p-1', name: 'Coastal Jumbo Prawns & Galápagos Tuna', priceExtra: 0.00 },
          { id: 'p-2', name: 'Charred Tandoori Chicken Tikka', priceExtra: -2.00 },
          { id: 'p-3', name: 'Wild Amazonian Paiche Fish', priceExtra: 4.00 },
          { id: 'p-4', name: 'Organic Tofu & Mushrooms (Vegetarian)', priceExtra: -4.00 }
        ]
      },
      {
        id: 'opt-2-2',
        title: 'Fresh Baked Naan Bread',
        type: 'single',
        choices: [
          { id: 'n-1', name: 'Garlic Butter Naan', priceExtra: 3.50 },
          { id: 'n-2', name: 'Peshwari Dry Fruit & Honey Naan', priceExtra: 4.50 },
          { id: 'n-3', name: 'Queso de Hoja Cheese Naan', priceExtra: 4.00 }
        ]
      },
      {
        id: 'opt-2-3',
        title: 'Spice Adjustment',
        type: 'single',
        choices: [
          { id: 's-1', name: 'Standard Medium Ají (Level 2)', priceExtra: 0.00 },
          { id: 's-2', name: 'Mild Coconut & Saffron (Level 1)', priceExtra: 0.00 },
          { id: 's-3', name: 'Extra Fiery Bhut Jolokia Heat (Level 3)', priceExtra: 1.00 }
        ]
      }
    ]
  },
  {
    id: 'dish-3',
    name: 'Ceviche Tamarindo Pani Puri',
    spanishName: 'Pani Puri con Ceviche de Camarón y Tamarindo',
    category: 'ceviches-chaats',
    price: 11.00,
    description: 'Crisp semolina spheres filled with chilled Galápagos shrimp ceviche, roasted corn chulpi, and topped with tart tamarind-mint mint agua fresca shot.',
    image: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=800&q=80',
    isVegetarian: false,
    isGlutenFree: false,
    spiceLevel: 2,
    originBadge: 'Pacific Shrimp Ceviche × Street Pani Puri',
    flavorBridge: {
      ecuadorianComponent: 'Shrimp Ceviche with Lime, Red Onion & Toasted Chulpi Corn',
      indianTechnique: 'Crispy Puris with Roasted Cumin & Tangy Tamarind Pani'
    },
    ecuadorianIngredients: ['Pacific Shrimp', 'Toasted Chulpi Corn', 'Sacha Inchi Oil', 'Red Onion & Coriander'],
    indianSpices: ['Semolina Puris', 'Tamarind Pulp', 'Black Salt (Kala Namak)', 'Roasted Cumin Powder'],
    isAvailable: true,
    isFeatured: true
  },
  {
    id: 'dish-4',
    name: 'Seco de Chivo Rogan Josh',
    spanishName: 'Seco de Chivo al Curry Kashmiri Rogan Josh',
    category: 'mains',
    price: 24.50,
    description: 'Slow-braised highland goat shank cooked in dark chicha de jora fermented corn nectar and deeply aromatic Kashmiri chili curry, served with saffron turmeric pilaf and ripe plantain chips.',
    image: 'https://images.unsplash.com/photo-1545247181-516773cae754?auto=format&fit=crop&w=800&q=80',
    isVegetarian: false,
    isGlutenFree: true,
    spiceLevel: 3,
    originBadge: 'Andean Chicha Braise × Kashmiri Lamb',
    flavorBridge: {
      ecuadorianComponent: 'Slow Fermented Chicha de Jora Corn Beer & Sweet Naranjilla',
      indianTechnique: 'Slow Kashmir Braise with Ratanjot Root & Kashmiri Red Chili Sauce'
    },
    ecuadorianIngredients: ['Highland Goat Shank', 'Chicha de Jora', 'Fresh Naranjilla Juice', 'Sweet Plantain Chips'],
    indianSpices: ['Kashmiri Chili', 'Black Cardamom', 'Cinnamon Bark', 'Fennel Seed Powder'],
    isAvailable: true,
    isFeatured: true
  },
  {
    id: 'dish-5',
    name: 'Humita Samosa with Guava Chutney',
    spanishName: 'Samosa de Humita y Guayaba',
    category: 'small-plates',
    price: 7.50,
    description: 'Flaky handmade pastry triangles filled with sweet tender corn paste, melted fresh cheese, and green chilies, served with spicy pink guava & nigella seed chutney.',
    image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80',
    isVegetarian: true,
    isGlutenFree: false,
    spiceLevel: 1,
    originBadge: 'Sweet Andean Corn × Punjabi Samosa',
    flavorBridge: {
      ecuadorianComponent: 'Fresh Sweet Corn Humita Mash & Sweet Amazonian Guava',
      indianTechnique: 'Hand-crimped Ajwain Pastry & Kalonji (Nigella) Tempered Chutney'
    },
    ecuadorianIngredients: ['Fresh Sweet Maize', 'Highland Queso Blanco', 'Amazonian Guava (Guayaba)'],
    indianSpices: ['Ajwain Seeds', 'Nigella Seeds (Kalonji)', 'Garam Masala', 'Green Chili'],
    isAvailable: true,
    isFeatured: false
  },
  {
    id: 'dish-6',
    name: 'Tandoori Amazonian Paiche',
    spanishName: 'Paiche Amazónico al Horno Tandoor',
    category: 'mains',
    price: 28.00,
    description: 'Sustainably sourced Amazonian Paiche fish marinated in wild coriander, turmeric, ginger garlic paste, and coconut yogurt, charred in our clay Tandoor oven.',
    image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=800&q=80',
    isVegetarian: false,
    isGlutenFree: true,
    spiceLevel: 2,
    originBadge: 'Amazon River Paiche × Punjabi Tandoori',
    flavorBridge: {
      ecuadorianComponent: 'Fresh Wild Amazonian Fish & Wild Coriander Leaves',
      indianTechnique: 'High-Heat Charcoal Clay Tandoor Sear & Hung Curd Marinade'
    },
    ecuadorianIngredients: ['Amazonian Paiche Fillet', 'Culantro de Monte', 'Wild Amazonian Ginger'],
    indianSpices: ['Hung Coconut Curd', 'Kashmiri Red Chili', 'Fenugreek (Kasuri Methi)', 'Chat Masala'],
    isAvailable: true,
    isFeatured: false
  },
  {
    id: 'dish-7',
    name: 'Arroz Chaufa Tikka Masala',
    spanishName: 'Arroz Chaufa Fusion Tikka Masala',
    category: 'mains',
    price: 18.50,
    description: 'Wok-tossed Ecuadorian coastal spiced rice with paneer or charred chicken tikka cubes, caramelized plantains, toasted cashews, and micro-coriander.',
    image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=800&q=80',
    isVegetarian: true,
    isGlutenFree: true,
    spiceLevel: 2,
    originBadge: 'Coast Chaufa Rice × Mughlai Tikka',
    flavorBridge: {
      ecuadorianComponent: 'High-Heat Wok Chaufa with Sweet Fried Plantain Dices',
      indianTechnique: 'Charred Tandoori Tikka Spicing & Toasted Cashew Gravy Glaze'
    },
    ecuadorianIngredients: ['Plátano Maduro Dices', 'Coastal Rice', 'Spring Onions'],
    indianSpices: ['House Tikka Masala Spice Blend', 'Roasted Cashews', 'Kasuri Methi'],
    isAvailable: true,
    isFeatured: false
  },
  {
    id: 'dish-8',
    name: 'Cacao Garam Masala Mousse',
    spanishName: 'Mousse de Cacao Fino de Aroma y Garam Masala',
    category: 'small-plates',
    price: 9.00,
    description: 'Silky dark chocolate mousse crafted from 72% Ecuadorian Cacao Fino de Aroma infused with cardamom, nutmeg, and clove, topped with caramelized pistachio brittle.',
    image: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?auto=format&fit=crop&w=800&q=80',
    isVegetarian: true,
    isGlutenFree: true,
    spiceLevel: 0,
    originBadge: '72% Ecuadorian Cacao × Sweet Garam Masala',
    flavorBridge: {
      ecuadorianComponent: 'Ecuadorian Organic Cacao Fino de Aroma (Manabí)',
      indianTechnique: 'Cardamom & Nutmeg Infusion with Pistachio Chikki Brittle'
    },
    ecuadorianIngredients: ['72% Organic Dark Chocolate', 'Amazonian Vanilla Bean'],
    indianSpices: ['Green Cardamom', 'Nutmeg', 'Cloves', 'Toasted Pistachios'],
    isAvailable: true,
    isFeatured: true
  },
  {
    id: 'dish-9',
    name: 'Canelazo Cardamom Spiced Toddy',
    spanishName: 'Canelazo de Cardamomo y Agua de Azahar',
    category: 'cocktails-drinks',
    price: 10.00,
    description: 'Warm traditional Andean cocktail made with sugarcane aguardiente, fresh naranjilla juice, Ceylon cinnamon sticks, and cracked green cardamom pods.',
    image: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=800&q=80',
    isVegetarian: true,
    isGlutenFree: true,
    spiceLevel: 1,
    originBadge: 'Andean Hot Canelazo × Kerala Cardamom',
    flavorBridge: {
      ecuadorianComponent: 'Sugarcane Aguardiente & Naranjilla Citrus Fruit',
      indianTechnique: 'Whole Spice Decoction with Cardamom & Orange Blossom Water'
    },
    ecuadorianIngredients: ['Artisanal Aguardiente', 'Fresh Naranjilla Pulp', 'Panela Cane Sugar'],
    indianSpices: ['Green Cardamom Pods', 'Ceylon Cinnamon Sticks', 'Orange Blossom Water'],
    isAvailable: true,
    isFeatured: false
  },
  {
    id: 'dish-10',
    name: 'Mango Lassi Colada',
    spanishName: 'Lassi de Mango y Coco al Estilo Cumbayá',
    category: 'cocktails-drinks',
    price: 6.50,
    description: 'Chilled Alphonso mango pulp blended with homemade yogurt, Esmeraldas coconut cream, rosewater, and a touch of crushed saffron.',
    image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80',
    isVegetarian: true,
    isGlutenFree: true,
    spiceLevel: 0,
    originBadge: 'Alphonso Mango × Coastal Coconut Cream',
    flavorBridge: {
      ecuadorianComponent: 'Fresh Esmeraldas Coconut Milk & Ecuadorian Sugarcane',
      indianTechnique: 'Alphonso Mango Lassi Churning with Rosewater & Saffron'
    },
    ecuadorianIngredients: ['Esmeraldas Coconut Cream', 'Fresh Mint'],
    indianSpices: ['Alphonso Mango Puree', 'Kashmiri Saffron', 'Rosewater', 'Green Cardamom'],
    isAvailable: true,
    isFeatured: false
  }
];
