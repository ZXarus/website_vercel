// Replace dynamic data fetching with static data
export const staticProperties = [
  {
    id: "prop1",
    title: "Modern Single Family Home",
    address: "123 Investment Ave, Austin, TX 78701",
    currentPrice: 425000,
    predictedPrice: 459000,
    priceChange: 34000,
    priceChangePercent: 8.0,
    bedrooms: 3,
    bathrooms: 2,
    sqft: 1850,
    type: "Single Family",
    yearBuilt: 2018,
    roi: 8.2,
    latitude: 30.2672,
    longitude: -97.7431,
    images: ["/images/single-family-1.png", "/images/single-family-2.png", "/images/single-family-3.png"],
    features: {
      hasParking: true,
      hasGarden: true,
      hasPool: false,
      hasBalcony: true,
      hasElevator: false,
      hasGym: false,
      hasDoorman: false,
      isRenovated: true,
      hasWaterView: false,
      hasCentralAir: true,
    },
  },
  // ... more static properties
]

export async function getStaticProperties() {
  // Simulate API delay for development
  await new Promise((resolve) => setTimeout(resolve, 500))
  return staticProperties
}
