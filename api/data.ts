export interface CustomOptionChoice {
  id: string;
  name: string;
  priceExtra?: number;
}

export interface CustomOptionGroup {
  id: string;
  title: string;
  type: 'single' | 'multiple';
  required?: boolean;
  choices: CustomOptionChoice[];
}

export interface MenuItem {
  id: string;
  name: string;
  spanishName?: string;
  category: 'small-plates' | 'tandoor' | 'curries' | 'mains' | 'desserts' | 'drinks' | 'breads';
  price: number;
  description: string;
  image: string;
  isVegetarian: boolean;
  isGlutenFree: boolean;
  spiceLevel: 0 | 1 | 2 | 3;
  originBadge?: string;
  flavorBridge?: {
    ecuadorianComponent: string;
    indianTechnique: string;
  };
  ecuadorianIngredients?: string[];
  indianSpices?: string[];
  isAvailable: boolean;
  isFeatured?: boolean;
  customOptions?: CustomOptionGroup[];
}

export interface RestaurantConfig {
  whatsappNumber: string;
  restaurantName: string;
  address: string;
  city: string;
  googleMapsCidUrl: string;
  openingHours: {
    weekdays: string;
    weekends: string;
  };
}

export const INITIAL_RESTAURANT_CONFIG: RestaurantConfig = {
  whatsappNumber: '593987900005',
  restaurantName: 'Sher E Punjab',
  address: 'Juan León Mera N26-77 y La Pinta, La Mariscal',
  city: 'Quito 170522, Ecuador',
  googleMapsCidUrl: 'https://www.google.com/maps/place/Sher+E+Punjab/@-0.1989787,-78.4922942,17z/data=!3m1!4b1!4m6!3m5!1s0x91d59a6c5488b57f:0x4ae3c72657a8d207!8m2!3d-0.1989841!4d-78.4897193!16s%2Fg%2F1hc6q9480',
  openingHours: {
    weekdays: '12:00 PM - 10:30 PM',
    weekends: '12:00 PM - 11:30 PM',
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
      ecuadorianComponent: 'Fresh Pacific Prawns & Tuna in Wild Achiote Coconut Milk',
      indianTechnique: 'Slow-Dum Basmati Layering with Saffron & Star Anise Pot-Sealing'
    },
    ecuadorianIngredients: ['Esmeraldas Coconut Milk', 'Wild Pacific Prawns', 'Culantro Changgua', 'Achiote Oil'],
    indianSpices: ['Aged Basmati Rice', 'Kashmiri Saffron', 'Green Cardamom', 'Crispy Shallots (Birista)'],
    isAvailable: true,
    isFeatured: true,
    customOptions: [
      {
        id: 'opt-2-1',
        title: 'Spice Level',
        type: 'single',
        required: true,
        choices: [
          { id: 'sp-1', name: 'Mild (Suave)', priceExtra: 0 },
          { id: 'sp-2', name: 'Medium (Tradicional)', priceExtra: 0 },
          { id: 'sp-3', name: 'Desi Hot (Picante Ecuatoriano/Indio)', priceExtra: 0 }
        ]
      }
    ]
  },
  {
    id: 'dish-3',
    name: 'Butter Chicken & Sweet Plantain Tawa',
    spanishName: 'Pollo a la Mantequilla con Maduro Frito',
    category: 'curries',
    price: 15.50,
    description: 'Tender tandoor-roasted chicken simmered in a velvety tomato, cashew, and honey gravy, paired with caramelized sweet maduro plantain medallions and fenugreek butter.',
    image: 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?auto=format&fit=crop&w=800&q=80',
    isVegetarian: false,
    isGlutenFree: true,
    spiceLevel: 1,
    originBadge: 'Manabí Maduro × Old Delhi Butter Makhani',
    flavorBridge: {
      ecuadorianComponent: 'Caramelized Sweet Plantain (Plátano Maduro) Slices',
      indianTechnique: 'Smoked Charcoal Murgh Makhani Gravy with Toasted Kasuri Methi'
    },
    ecuadorianIngredients: ['Sweet Maduro Plantains', 'Panela Cane Sugar', 'Coastal Butter'],
    indianSpices: ['Dried Fenugreek (Kasuri Methi)', 'Makhani Cashew Paste', 'Kashmiri Chili Degi', 'Cardamom Powder'],
    isAvailable: true,
    isFeatured: true
  },
  {
    id: 'dish-4',
    name: 'Palak Paneer con Chocho Criollo',
    spanishName: 'Palak Paneer con Chochos Andinos y Espinaca',
    category: 'curries',
    price: 13.50,
    description: 'Fresh house-made paneer cheese cubes and Andean protein-rich chochos stewed in vibrant pureed spinach, roasted garlic, and toasted garam masala.',
    image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80',
    isVegetarian: true,
    isGlutenFree: true,
    spiceLevel: 1,
    originBadge: 'Andean Chocho Superfood × Punjabi Saag',
    flavorBridge: {
      ecuadorianComponent: 'Mineral-rich Andean Chochos (Lupin Beans)',
      indianTechnique: 'Slow-cooked Punjabi Saag Puree with Ghee-roasted Garlic Tarka'
    },
    ecuadorianIngredients: ['Lupinus Mutabilis (Andean Chochos)', 'Highland Fresh Spinach', 'Sierra Butter'],
    indianSpices: ['Cumin Seeds', 'Garam Masala', 'Fresh Ginger', 'Turmeric'],
    isAvailable: true
  },
  {
    id: 'dish-5',
    name: 'Maracuyá & Mango Lassi Frappé',
    spanishName: 'Lassi de Mango y Fruta de la Pasión (Maracuyá)',
    category: 'drinks',
    price: 5.00,
    description: 'Traditional Punjabi churned yogurt blended with ripe Ecuadorian Alphonso mango and tart coastal maracuyá (passionfruit), topped with crushed green cardamom.',
    image: 'https://images.unsplash.com/photo-1527661591475-527312dd65f5?auto=format&fit=crop&w=800&q=80',
    isVegetarian: true,
    isGlutenFree: true,
    spiceLevel: 0,
    originBadge: 'Coastal Maracuyá × Amritsari Sweet Lassi',
    flavorBridge: {
      ecuadorianComponent: 'Fresh Tart Golden Passion Fruit (Maracuyá)',
      indianTechnique: 'Hand-churned Dahi (Yogurt) with Green Cardamom Essence'
    },
    ecuadorianIngredients: ['Golden Maracuyá Pulp', 'Ecuadorian Wild Honey'],
    indianSpices: ['Green Cardamom (Elaichi)', 'Saffron Strands', 'Rose Water'],
    isAvailable: true,
    isFeatured: true
  },
  {
    id: 'dish-6',
    name: 'Garlic & Cilantro Tandoori Naan',
    spanishName: 'Pan Naan Tradicional al Tandoor con Ajo y Cilantro',
    category: 'breads',
    price: 3.50,
    description: 'Leavened flatbread slapped against the clay walls of our 450°C tandoor, brushed with warm spiced ghee, roasted garlic slivers, and fresh mountain cilantro.',
    image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80',
    isVegetarian: true,
    isGlutenFree: false,
    spiceLevel: 0,
    originBadge: 'Highland Cilantro × Clay Oven Tandoori Art',
    flavorBridge: {
      ecuadorianComponent: 'Fresh Pichincha Mountain Cilantro',
      indianTechnique: 'Live Charcoal Tandoor Wall Slapping with Clarified Desi Ghee'
    },
    ecuadorianIngredients: ['Fresh Pichincha Cilantro', 'Organic Andean Sea Salt'],
    indianSpices: ['Kalonji (Nigella Seeds)', 'Toasted Garlic', 'Desi Ghee'],
    isAvailable: true
  },
  {
    id: 'dish-7',
    name: 'Samosas de Cordero y Ají de Tomate de Árbol',
    spanishName: 'Samosas Rellenas de Cordero con Ají de Tomate de Árbol',
    category: 'small-plates',
    price: 9.00,
    description: 'Two crisp golden pyramid pastries packed with slow-braised spiced lamb, green peas, and toasted coriander, paired with tangy tree tomato ají chutney.',
    image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80',
    isVegetarian: false,
    isGlutenFree: false,
    spiceLevel: 2,
    originBadge: 'Tomate de Árbol Chutney × Punjabi Lamb Samosa',
    flavorBridge: {
      ecuadorianComponent: 'Sweet & Tangy Tree Tomato (Tomate de Árbol) Relish',
      indianTechnique: 'Flaky Ajwain-infused Shortcrust Deep Fried in Pure Ghee'
    },
    ecuadorianIngredients: ['Tomate de Árbol', 'Ají Rocoto', 'Andean Purple Onion'],
    indianSpices: ['Ajwain (Carom Seeds)', 'Crushed Coriander', 'Cinnamon', 'Black Cumin'],
    isAvailable: true
  },
  {
    id: 'dish-8',
    name: 'Gulab Jamun al Canelazo de Naranjilla',
    spanishName: 'Gulab Jamun Flameado en Almíbar de Canelazo y Naranjilla',
    category: 'desserts',
    price: 6.50,
    description: 'Golden reduced-milk dumplings soaked in warm spiced panela syrup infused with highland naranjilla, aromatic cinnamon, and Ecuadorian sugar cane spirit essence.',
    image: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?auto=format&fit=crop&w=800&q=80',
    isVegetarian: true,
    isGlutenFree: false,
    spiceLevel: 0,
    originBadge: 'Highland Canelazo × Royal Moghul Sweet',
    flavorBridge: {
      ecuadorianComponent: 'Panela, Cinnamon & Tart Naranjilla Hot Canelazo Reduction',
      indianTechnique: 'Slow-fried Milk Solid (Khoya) Spheres Steeped in Rose & Cardamom'
    },
    ecuadorianIngredients: ['Highland Naranjilla', 'Panela Molida', 'Ecuadorian Cinnamon Bark'],
    indianSpices: ['Green Cardamom', 'Rose Water', 'Pistachio Flakes'],
    isAvailable: true,
    isFeatured: true
  }
];
