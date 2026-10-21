export const donorStats = {
  totalDonations: "24",
  completed: "18",
  mealsSaved: "156",
  activeRequests: "4",
};

export const ngoStats = {
  availableNearby: "12",
  activeRequests: "3",
  mealsReceived: "482",
  successfulPickups: "94%",
};

export const volunteerStats = {
  todayPickups: "3",
  completed: "47",
  mealsDelivered: "680",
  distance: "124 km",
};

export const donations = [
  {
    id: 1,
    food: "Fresh Vegetable Biryani",
    quantity: "45 meals",
    category: "Cooked Meals",
    expiry: "2 hours",
    location: "Laxmi Nagar",
    distance: "1.8 km",
    status: "Available",
    donor: "Spice Garden",
    image: "🍛",
  },
  {
    id: 2,
    food: "Packed Lunch Boxes",
    quantity: "60 meals",
    category: "Cooked Meals",
    expiry: "4 hours",
    location: "Preet Vihar",
    distance: "2.4 km",
    status: "Claimed",
    donor: "City Events",
    image: "🍱",
  },
  {
    id: 3,
    food: "Fresh Fruits",
    quantity: "25 kg",
    category: "Fruits",
    expiry: "6 hours",
    location: "Mayur Vihar",
    distance: "3.1 km",
    status: "Available",
    donor: "FreshMart",
    image: "🍎",
  },
  {
    id: 4,
    food: "Assorted Bakery Items",
    quantity: "30 packs",
    category: "Bakery",
    expiry: "8 hours",
    location: "Patparganj",
    distance: "4.2 km",
    status: "Completed",
    donor: "Bake House",
    image: "🥐",
  },
];

export const myDonations = [
  {
    id: 1,
    food: "Vegetable Biryani",
    quantity: "45 meals",
    date: "8 Sep 2026",
    status: "Available",
  },
  {
    id: 2,
    food: "Packed Sandwiches",
    quantity: "30 meals",
    date: "5 Sep 2026",
    status: "Picked Up",
  },
  {
    id: 3,
    food: "Fresh Fruits",
    quantity: "20 kg",
    date: "1 Sep 2026",
    status: "Delivered",
  },
  {
    id: 4,
    food: "Bakery Items",
    quantity: "25 packs",
    date: "28 Aug 2026",
    status: "Delivered",
  },
];

export const pickupTasks = [
  {
    id: 1,
    food: "Fresh Vegetable Biryani",
    quantity: "45 meals",
    distance: "1.8 km",
    donor: "Spice Garden",
    pickup: "Laxmi Nagar",
    drop: "Hope Community Kitchen, Shakarpur",
    status: "Assigned",
  },
  {
    id: 2,
    food: "Packed Lunch Boxes",
    quantity: "60 meals",
    distance: "2.7 km",
    donor: "City Events",
    pickup: "Preet Vihar",
    drop: "Helping Hands Shelter, Anand Vihar",
    status: "In Transit",
  },
  {
    id: 3,
    food: "Fresh Fruits",
    quantity: "25 kg",
    distance: "3.4 km",
    donor: "FreshMart",
    pickup: "Mayur Vihar",
    drop: "Seva Kitchen, Pandav Nagar",
    status: "Assigned",
  },
];
