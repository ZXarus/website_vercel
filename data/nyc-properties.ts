// lib/nyc-properties.ts

// This is a sophisticated version of the data fetching function
// that generates unique images for each property based on its characteristics

// Define a type for a single property for better type-safety
export type Property = {
  id: string;
  title: string;
  address: string;
  currentPrice: number;
  predictedPrice: number;
  priceChange: number;
  priceChangePercent: number;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  type: string;
  yearBuilt: number;
  roi: number;
  latitude: number;
  longitude: number;
  images: string[];
  allImages: {
    exterior: string[];
    interior: string[];
    bedroom: string[];
    bathroom: string[];
  };
  features: {
    hasParking: boolean;
    hasGarden: boolean;
    hasPool: boolean;
    hasBalcony: boolean;
    hasElevator: boolean;
    hasGym: boolean;
    hasDoorman: boolean;
    isRenovated: boolean;
    hasWaterView: boolean;
    hasCentralAir: boolean;
  };
};

// --- IMAGE ARRAYS ---
// Pool of exterior images
const exteriorImages = [
  "/images/apartment-variation-1.png",
  "/images/apartment_0002.jpg",
  "/images/apartment_0003.jpg",
  "/images/apartment_0004.jpg",
  "/images/apartment_0005.jpg",
  "/images/apartment_0006.jpg",
  "/images/apartment_0007.jpg",
  "/images/apartment_0008.jpg",
  "/images/apartment_0009.jpg",
  "/images/apartment_0010.jpg",
  "/images/apartment_0012.jpg",
  "/images/apartment_0013.jpg",
  "/images/apartment_0014.jpg",
  "/images/apartment_0015.jpg",
  "/images/apartment_0016.jpg",
  "/images/apartment_0017.jpg",
  "/images/apartment_0018.jpg",
  "/images/apartment_0019.jpg",
  "/images/apartment_0020.jpg",
  "/images/apartment_0021.jpg",
];

// Pool of bathroom images
const bathroomImagesPool = [
  "/images/bath_100.jpg",
  "/images/bath_1001.jpg",
  "/images/bath_1003.jpg",
  "/images/bath_1004.jpg",
  "/images/bath_1005.jpg",
  "/images/bath_1006.jpg",
  "/images/bath_1007.jpg",
  "/images/bath_1010.jpg",
  "/images/bath_1011.jpg",
  "/images/bath_1012.jpg",
];

// Pool of bedroom images
const bedroomImagesPool = [
  "/images/bed_100.jpg",
  "/images/bed_10.jpg",
  "/images/bed_101.jpg",
  "/images/bed_102.jpg",
  "/images/bed_103.jpg",
  "/images/bed_104.jpg",
  "/images/bed_105.jpg",
  "/images/bed_106.jpg",
  "/images/bed_107.jpg",
  "/images/bed_1000.jpg",
];

// Pool of interior (living/dining room) images
const interiorImagesPool = [
  "/images/din_1.jpg",
  "/images/din_10.jpg",
  "/images/din_100.jpg",
  "/images/din_1000.jpg",
  "/images/din_102.jpg",
  "/images/din_104.jpg",
  "/images/din_105.jpg",
  "/images/din_106.jpg",
  "/images/din_108.jpg",
  "/images/din_110.jpg",
];

// ✨ FIX: The shuffle function is now a pure utility, correctly placed.
// Function to shuffle an array (Fisher-Yates algorithm)
function shuffleArray<T>(array: T[]): T[] {
    const newArray = [...array]; // Create a shallow copy to avoid modifying the original
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}

// ✨ FIX: Global shuffled image arrays are removed from here to prevent state conflicts.

export async function fetchNYCProperties(): Promise<Property[]> {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const properties: Property[] = [];
  
  // ✨ FIX: Shuffling now happens *inside* the function.
  // This creates a new random order for every API call, making the function stateless.
  const shuffledExteriorImages = shuffleArray(exteriorImages);
  const shuffledInteriorImages = shuffleArray(interiorImagesPool);
  const shuffledBedroomImages = shuffleArray(bedroomImagesPool);
  const shuffledBathroomImages = shuffleArray(bathroomImagesPool);


  // NYC neighborhoods
  const neighborhoods = [
    { name: "Manhattan - Upper East Side", lat: 40.7735, lng: -73.9565 },
    { name: "Manhattan - Upper West Side", lat: 40.787, lng: -73.9754 },
    { name: "Manhattan - Midtown", lat: 40.7549, lng: -73.984 },
    { name: "Manhattan - Chelsea", lat: 40.7465, lng: -74.0014 },
    { name: "Manhattan - Greenwich Village", lat: 40.7339, lng: -74.0011 },
    { name: "Manhattan - Financial District", lat: 40.7075, lng: -74.0113 },
    { name: "Brooklyn - Williamsburg", lat: 40.7081, lng: -73.9571 },
    { name: "Brooklyn - Park Slope", lat: 40.671, lng: -73.9814 },
    { name: "Brooklyn - DUMBO", lat: 40.7032, lng: -73.9892 },
    { name: "Brooklyn - Brooklyn Heights", lat: 40.6959, lng: -73.9936 },
    { name: "Queens - Astoria", lat: 40.7643, lng: -73.9235 },
    { name: "Queens - Long Island City", lat: 40.7447, lng: -73.9485 },
    { name: "Bronx - Riverdale", lat: 40.89, lng: -73.9122 },
    { name: "Staten Island - St. George", lat: 40.6447, lng: -74.0776 },
  ];

  // Property types
  const propertyTypes = ["Condo", "Co-op", "Townhouse", "Multi-Family", "Single Family"];

  // Street names
  const streets = [
    "Broadway", "Park Avenue", "5th Avenue", "Madison Avenue", "Lexington Avenue",
    "Amsterdam Avenue", "Columbus Avenue", "West End Avenue", "Riverside Drive",
    "Central Park West", "Bedford Avenue", "Metropolitan Avenue", "Court Street",
    "Atlantic Avenue", "Flatbush Avenue", "Ocean Avenue", "Eastern Parkway",
  ];

  // Generate properties
  for (let i = 1; i <= 2703; i++) {
    const neighborhood = neighborhoods[Math.floor(Math.random() * neighborhoods.length)];
    const latOffset = (Math.random() - 0.5) * 0.02;
    const lngOffset = (Math.random() - 0.5) * 0.02;
    const propertyType = propertyTypes[Math.floor(Math.random() * propertyTypes.length)];
    const bedrooms = Math.floor(Math.random() * 4) + 1;
    const bathrooms = Math.floor(Math.random() * 3) + 1;
    const sqft = Math.floor(Math.random() * 2000) + 500;

    let basePrice = 0;
    if (neighborhood.name.includes("Manhattan")) basePrice = Math.floor(Math.random() * 3000000) + 1000000;
    else if (neighborhood.name.includes("Brooklyn")) basePrice = Math.floor(Math.random() * 2000000) + 800000;
    else if (neighborhood.name.includes("Queens")) basePrice = Math.floor(Math.random() * 1500000) + 600000;
    else basePrice = Math.floor(Math.random() * 1000000) + 400000;

    const currentPrice = basePrice + bedrooms * 100000 + bathrooms * 50000 + sqft * 500;
    const priceChangePercent = Math.random() * 24 + 1;
    const priceChange = currentPrice * (priceChangePercent / 100);
    const streetNumber = Math.floor(Math.random() * 300) + 1;
    const street = streets[Math.floor(Math.random() * streets.length)];

    const property: Property = {
      id: `prop${i}`,
      title: `${bedrooms}BR ${bathrooms}BA ${propertyType} in ${neighborhood.name.split(" - ")[1]}`,
      address: `${streetNumber} ${street}, ${neighborhood.name.split(" - ")[1]}, NY`,
      currentPrice,
      predictedPrice: currentPrice + priceChange,
      priceChange,
      priceChangePercent,
      bedrooms,
      bathrooms,
      sqft,
      type: propertyType,
      yearBuilt: Math.floor(Math.random() * 120) + 1900,
      roi: Math.floor(Math.random() * 12) + 3,
      latitude: neighborhood.lat + latOffset,
      longitude: neighborhood.lng + lngOffset,
      images: [],
      allImages: { exterior: [], interior: [], bedroom: [], bathroom: [] },
      features: {
        hasParking: Math.random() > 0.5,
        hasGarden: Math.random() > 0.7,
        hasPool: Math.random() > 0.9,
        hasBalcony: Math.random() > 0.6,
        hasElevator: (propertyType === "Condo" || propertyType === "Co-op") && Math.random() > 0.3,
        hasGym: (propertyType === "Condo" || propertyType === "Co-op") && Math.random() > 0.6,
        hasDoorman: (propertyType === "Condo" || propertyType === "Co-op") && Math.random() > 0.7,
        isRenovated: Math.random() > 0.5,
        hasWaterView: Math.random() > 0.8,
        hasCentralAir: Math.random() > 0.4,
      },
    };

    // The modulo logic now correctly uses the newly shuffled arrays for this specific call.
    const propertyExteriorImage = shuffledExteriorImages[(i - 1) % shuffledExteriorImages.length];
    const propertyInteriorImage = shuffledInteriorImages[(i - 1) % shuffledInteriorImages.length];
    const propertyBedroomImage = shuffledBedroomImages[(i - 1) % shuffledBedroomImages.length];
    const propertyBathroomImage = shuffledBathroomImages[(i - 1) % shuffledBathroomImages.length];

    // Assign primary images for gallery previews
    property.images = [
      propertyExteriorImage,
      propertyInteriorImage,
      propertyBedroomImage,
      propertyBathroomImage,
    ].filter(Boolean);

    // Assign all images to their specific categories
    property.allImages = {
      exterior: [propertyExteriorImage],
      interior: [propertyInteriorImage],
      bedroom: [propertyBedroomImage],
      bathroom: [propertyBathroomImage],
    };

    properties.push(property);
  }

  return properties;
}