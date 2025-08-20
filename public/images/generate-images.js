// This is a helper script to generate image placeholders for the first 100 properties
// In a real application, you would use actual property images

const fs = require("fs")
const path = require("path")

const propertyTypes = ["single-family", "townhouse", "multi-family", "condo", "co-op"]
const viewTypes = ["exterior", "interior", "bedroom", "bathroom"]

// Create directories if they don't exist
const imagesDir = path.join(__dirname, "images")
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir)
}

// Generate placeholder image files for the first 100 properties
for (let i = 1; i <= 100; i++) {
  const propertyId = `prop${i}`
  const propertyType = propertyTypes[i % propertyTypes.length]

  for (let typeIndex = 1; typeIndex <= 20; typeIndex++) {
    for (let viewIndex = 0; viewIndex < viewTypes.length; viewIndex++) {
      const viewType = viewTypes[viewIndex]

      // Generate 3 angles for each view type
      for (let angleIndex = 1; angleIndex <= 3; angleIndex++) {
        const filename = `${propertyType}-${typeIndex}-${viewType}-${angleIndex}.png`
        const filePath = path.join(imagesDir, filename)

        // Create a placeholder file
        fs.writeFileSync(filePath, `This is a placeholder for ${filename}`)
        console.log(`Created ${filename}`)
      }
    }
  }
}

console.log("Image placeholders generated successfully!")
