export type CategoryId = 'all' | 'small-plates' | 'mains' | 'ceviches-chaats' | 'cocktails-drinks';

export interface FlavorBridge {
  ecuadorianComponent: string;
  indianTechnique: string;
}

export interface CustomOptionChoice {
  id: string;
  name: string;
  priceExtra: number; // e.g. 0 or 2.50
}

export interface CustomOptionGroup {
  id: string;
  title: string; // e.g., "Protein Choice", "Spice Customization", "Extra Sides"
  type: 'single' | 'multiple';
  isRequired?: boolean;
  choices: CustomOptionChoice[];
}

export interface MenuItem {
  id: string;
  name: string;
  spanishName?: string;
  category: 'small-plates' | 'mains' | 'ceviches-chaats' | 'cocktails-drinks';
  price: number; // in USD
  description: string;
  image: string;
  isVegetarian: boolean;
  isGlutenFree: boolean;
  spiceLevel: 0 | 1 | 2 | 3; // 0=None, 1=Mild, 2=Medium Ají, 3=Fiery
  flavorBridge: FlavorBridge;
  ecuadorianIngredients: string[];
  indianSpices: string[];
  isAvailable: boolean;
  isFeatured?: boolean;
  originBadge: string; // e.g., "Andean Root × Kerala Coconut"
  customOptions?: CustomOptionGroup[]; // Unlimited custom specifications added by admin
}

export interface SelectedOptionSelection {
  groupId: string;
  groupTitle: string;
  choiceId: string;
  choiceName: string;
  priceExtra: number;
}

export interface CartItem {
  cartItemId: string; // unique identifier for cart line item
  dish: MenuItem;
  quantity: number;
  selectedOptions?: SelectedOptionSelection[];
  customerNote?: string; // customer's specific modification note for this dish
  unitPrice: number; // base price + options priceExtra sum
}

export interface CustomerInfo {
  fullName: string;
  phone: string;
  orderType: 'delivery' | 'takeaway';
  address: string;
  locationLink?: string;
  specialInstructions: string;
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

export interface ReservationData {
  name: string;
  phone: string;
  email: string;
  date: string;
  time: string;
  guests: number;
  seatingArea: 'garden-terrace' | 'main-dining' | 'private-lounge';
  specialRequests: string;
}
