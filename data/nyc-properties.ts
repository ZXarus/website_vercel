// This is a sophisticated version of the data fetching function
// that generates unique images for each property based on its characteristics

export async function fetchNYCProperties() {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 1000))

  const properties = []

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
  ]

  // Property types
  const propertyTypes = ["Condo", "Co-op", "Townhouse", "Multi-Family", "Single Family"]

  // Street names
  const streets = [
    "Broadway",
    "Park Avenue",
    "5th Avenue",
    "Madison Avenue",
    "Lexington Avenue",
    "Amsterdam Avenue",
    "Columbus Avenue",
    "West End Avenue",
    "Riverside Drive",
    "Central Park West",
    "Bedford Avenue",
    "Metropolitan Avenue",
    "Court Street",
    "Atlantic Avenue",
    "Flatbush Avenue",
    "Ocean Avenue",
    "Eastern Parkway",
  ]

  // Predefined exterior images for first 20 properties
  const exteriorImages = [
    "/images/property-1-exterior.png",
    "/images/property-2-exterior.png",
    "/images/property-3-exterior.png",
    "/images/property-4-exterior.png",
    "/images/property-5-exterior.png",
    "/images/property-6-exterior.png",
    "/images/property-7-exterior.png",
    "/images/property-8-exterior.png",
    "/images/property-9-exterior.png",
    "/images/property-10-exterior.png",
    "/images/property-11-exterior.png",
    "/images/property-12-exterior.png",
    "/images/property-13-exterior.png",
    "/images/property-14-exterior.png",
    "/images/property-15-exterior.png",
    "/images/property-16-exterior.png",
    "/images/property-17-exterior.png",
    "/images/property-18-exterior.png",
    "/images/property-19-exterior.png",
    "/images/property-20-exterior.png",
  ]

  // Generate a unique seed for each property to ensure consistent but varied images
  const generateSeed = (propertyId, suffix = "") => {
    return `${propertyId}${suffix}`
  }

  // Generate a unique image URL based on property characteristics
  const generateImageUrl = (property, viewType, index) => {
    const { id, type, bedrooms, bathrooms, yearBuilt, currentPrice, address } = property

    // Create a unique seed for this specific image
    const seed = generateSeed(id, `${viewType}${index}`)

    // Generate a hash from the seed
    const hash = Math.abs(hashCode(seed))

    // Determine style variations based on property characteristics
    const isLuxury = currentPrice > 1500000
    const isModern = yearBuilt > 2000
    const isHistoric = yearBuilt < 1950
    const isRenovated = hash % 3 === 0
    const hasWaterView = hash % 7 === 0
    const hasCityView = hash % 5 === 0

    // Build the image description
    let description = ""

    if (viewType === "exterior") {
      description = `${isLuxury ? "Luxury " : ""}${isModern ? "Modern " : ""}${isHistoric ? "Historic " : ""}${type} in ${address.split(",")[1]?.trim() || "NYC"}`

      if (hasWaterView) description += " with water view"
      if (hasCityView) description += " with city skyline view"

      // Add angle variation
      if (index % 3 === 0) description += " - front view"
      else if (index % 3 === 1) description += " - angle view"
      else description += " - side view"
    } else if (viewType === "interior") {
      const rooms = ["Living Room", "Kitchen", "Dining Area", "Foyer", "Den"]
      const room = rooms[hash % rooms.length]

      description = `${isLuxury ? "Luxury " : ""}${isModern ? "Modern " : ""}${isRenovated ? "Renovated " : ""}${room} in ${type}`

      if (hasWaterView) description += " with water view"
      if (hasCityView) description += " with city view"

      // Add style variation
      const styles = ["contemporary", "traditional", "minimalist", "elegant", "cozy"]
      const style = styles[hash % styles.length]
      description += ` - ${style} style`
    } else if (viewType === "bedroom") {
      description = `${bedrooms} Bedroom${bedrooms > 1 ? "s" : ""} in ${type} - ${isLuxury ? "Luxury " : ""}${isModern ? "Modern " : ""}Master Suite`

      if (hasWaterView) description += " with water view"
      if (hasCityView) description += " with city view"

      // Add angle variation
      if (index % 3 === 0) description += " - main view"
      else if (index % 3 === 1) description += " - bed view"
      else description += " - closet view"
    } else if (viewType === "bathroom") {
      description = `${bathrooms} Bathroom${bathrooms > 1 ? "s" : ""} in ${type} - ${isLuxury ? "Luxury " : ""}${isModern ? "Modern " : ""}${isRenovated ? "Renovated " : ""}Bath`
    }

    // For the first 100 properties, use more specific image URLs
    if (Number.parseInt(id.replace("prop", "")) <= 100) {
      // Generate a unique image URL based on property type and index
      const typeFolder = type.toLowerCase().replace(/\s+/g, "-")
      const uniqueIndex = (hash % 20) + 1 // 20 variations per type
      return `/images/${typeFolder}-${uniqueIndex}-${viewType}-${index}.png`
    }

    // For other properties, use placeholder with unique descriptions
    return `/placeholder.svg?height=600&width=1200&text=${encodeURIComponent(description)}`
  }

  // Hash function to generate consistent but varied indices
  const hashCode = (str) => {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = (hash << 5) - hash + char
      hash = hash & hash // Convert to 32bit integer
    }
    return hash
  }

  // Generate properties
  for (let i = 1; i <= 2703; i++) {
    // Select a random neighborhood
    const neighborhood = neighborhoods[Math.floor(Math.random() * neighborhoods.length)]

    // Create small random offset for latitude and longitude to spread properties out
    const latOffset = (Math.random() - 0.5) * 0.02
    const lngOffset = (Math.random() - 0.5) * 0.02

    // Generate random property details
    const propertyType = propertyTypes[Math.floor(Math.random() * propertyTypes.length)]
    const bedrooms = Math.floor(Math.random() * 4) + 1
    const bathrooms = Math.floor(Math.random() * 3) + 1
    const sqft = Math.floor(Math.random() * 2000) + 500

    // Generate price based on neighborhood and property details
    let basePrice = 0
    if (neighborhood.name.includes("Manhattan")) {
      basePrice = Math.floor(Math.random() * 3000000) + 1000000
    } else if (neighborhood.name.includes("Brooklyn")) {
      basePrice = Math.floor(Math.random() * 2000000) + 800000
    } else if (neighborhood.name.includes("Queens")) {
      basePrice = Math.floor(Math.random() * 1500000) + 600000
    } else {
      basePrice = Math.floor(Math.random() * 1000000) + 400000
    }

    // Adjust price based on property details
    const currentPrice = basePrice + bedrooms * 100000 + bathrooms * 50000 + sqft * 500

    // Generate price change (between -20% and +25%)
    const priceChangePercent = Math.random() * 45 - 20
    const priceChange = currentPrice * (priceChangePercent / 100)
    const predictedPrice = currentPrice + priceChange

    // Generate ROI (between 3% and 15%)
    const roi = Math.floor(Math.random() * 12) + 3

    // Generate street number and address
    const streetNumber = Math.floor(Math.random() * 300) + 1
    const street = streets[Math.floor(Math.random() * streets.length)]
    const address = `${streetNumber} ${street}, ${neighborhood.name.split(" - ")[1]}, NY`

    // Generate property title
    const title = `${bedrooms}BR ${bathrooms}BA ${propertyType} in ${neighborhood.name.split(" - ")[1]}`

    // Generate year built (between 1900 and 2020)
    const yearBuilt = Math.floor(Math.random() * 120) + 1900

    // Create property object first so we can pass it to generateImageUrl
    const property = {
      id: `prop${i}`,
      title,
      address,
      currentPrice,
      predictedPrice,
      priceChange,
      priceChangePercent,
      bedrooms,
      bathrooms,
      sqft,
      type: propertyType,
      yearBuilt,
      roi,
      latitude: neighborhood.lat + latOffset,
      longitude: neighborhood.lng + lngOffset,
    }

    // Generate unique images for this property
    let propertyExteriorImages = []
    let interiorImages = []
    let bedroomImages = []

    // For the first 20 properties, use the predefined exterior images
    if (i <= 20) {
      propertyExteriorImages = [
        exteriorImages[i - 1], // Use the specific exterior image for this property
        generateImageUrl(property, "exterior", 2),
        generateImageUrl(property, "exterior", 3),
      ]
    } else {
      propertyExteriorImages = [
        generateImageUrl(property, "exterior", 1),
        generateImageUrl(property, "exterior", 2),
        generateImageUrl(property, "exterior", 3),
      ]
    }

    interiorImages = [
      generateImageUrl(property, "interior", 1),
      generateImageUrl(property, "interior", 2),
      generateImageUrl(property, "interior", 3),
    ]

    bedroomImages = [
      generateImageUrl(property, "bedroom", 1),
      generateImageUrl(property, "bedroom", 2),
      generateImageUrl(property, "bedroom", 3),
    ]

    // Use real bathroom images for the first 10 properties
    const bathroomImages = []

    if (i <= 10) {
      // For the first 10 properties, use our real bathroom images
      if (i === 1) bathroomImages.push("/images/bathroom-1.jpeg")
      else if (i === 2) bathroomImages.push("/images/bathroom-2.jpeg")
      else if (i === 3) bathroomImages.push("/images/bathroom-3.jpeg")
      else if (i === 4) bathroomImages.push("/images/bathroom-4.jpeg")
      else if (i === 5) bathroomImages.push("/images/bathroom-5.jpeg")
      else if (i === 6) bathroomImages.push("/images/bathroom-6.jpeg")
      else if (i === 7) bathroomImages.push("/images/bathroom-7.jpeg")
      else if (i === 8) bathroomImages.push("/images/bathroom-8.jpeg")
      else if (i === 9) bathroomImages.push("/images/bathroom-9.jpeg")
      else if (i === 10) bathroomImages.push("/images/bathroom-10.jpeg")
    } else {
      // For other properties, use generated placeholder images
      bathroomImages.push(generateImageUrl(property, "bathroom", 1))
      bathroomImages.push(generateImageUrl(property, "bathroom", 2))
    }

    // Select primary images (one from each category)
    let primaryImages = []

    // For the first 20 properties, use the specific exterior image as primary
    if (i <= 20) {
      if (i <= 10) {
        primaryImages = [exteriorImages[i - 1], interiorImages[0], bedroomImages[0], bathroomImages[0]]
      } else {
        primaryImages = [exteriorImages[i - 1], interiorImages[0], bedroomImages[0]]
      }
    } else {
      primaryImages = [propertyExteriorImages[0], interiorImages[0], bedroomImages[0]]
    }

    // Add all images to the property
    property.images = primaryImages
    property.allImages = {
      exterior: propertyExteriorImages,
      interior: interiorImages,
      bedroom: bedroomImages,
      bathroom: bathroomImages,
    }

    // Add property features
    property.features = {
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
    }

    // Add property to array
    properties.push(property)
  }

  return properties
}
