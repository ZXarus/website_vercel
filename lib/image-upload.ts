import { supabase } from "./supabase"

export interface UploadResult {
  success: boolean
  url?: string
  error?: string
  path?: string
}

export interface ImageUploadOptions {
  maxSizeInMB?: number
  allowedTypes?: string[]
  quality?: number
}

const DEFAULT_OPTIONS: ImageUploadOptions = {
  maxSizeInMB: 5,
  allowedTypes: ["image/jpeg", "image/png", "image/webp"],
  quality: 0.8,
}

// Compress image before upload
export const compressImage = (file: File, quality = 0.8): Promise<File> => {
  return new Promise((resolve) => {
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")!
    const img = new Image()

    img.onload = () => {
      // Calculate new dimensions (max 1920px width)
      const maxWidth = 1920
      const ratio = Math.min(maxWidth / img.width, maxWidth / img.height)
      canvas.width = img.width * ratio
      canvas.height = img.height * ratio

      // Draw and compress
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

      canvas.toBlob(
        (blob) => {
          if (blob) {
            const compressedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now(),
            })
            resolve(compressedFile)
          } else {
            resolve(file)
          }
        },
        file.type,
        quality,
      )
    }

    img.src = URL.createObjectURL(file)
  })
}

// Validate file before upload
export const validateFile = (file: File, options: ImageUploadOptions = {}): string | null => {
  const opts = { ...DEFAULT_OPTIONS, ...options }

  // Check file type
  if (!opts.allowedTypes!.includes(file.type)) {
    return `File type ${file.type} is not allowed. Allowed types: ${opts.allowedTypes!.join(", ")}`
  }

  // Check file size
  const maxSizeInBytes = opts.maxSizeInMB! * 1024 * 1024
  if (file.size > maxSizeInBytes) {
    return `File size ${(file.size / 1024 / 1024).toFixed(2)}MB exceeds maximum allowed size of ${opts.maxSizeInMB}MB`
  }

  return null
}

// Upload single image to Supabase storage
export const uploadImage = async (
  file: File,
  propertyId: string,
  category = "general",
  options: ImageUploadOptions = {},
): Promise<UploadResult> => {
  try {
    // Validate file
    const validationError = validateFile(file, options)
    if (validationError) {
      return { success: false, error: validationError }
    }

    // Compress image
    const compressedFile = await compressImage(file, options.quality)

    // Generate unique filename
    const fileExt = file.name.split(".").pop()
    const fileName = `${propertyId}/${category}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`

    // Upload to Supabase storage
    const { data, error } = await supabase.storage.from("property-images").upload(fileName, compressedFile, {
      cacheControl: "3600",
      upsert: false,
    })

    if (error) {
      return { success: false, error: error.message }
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("property-images").getPublicUrl(fileName)

    return {
      success: true,
      url: publicUrl,
      path: fileName,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    }
  }
}

// Upload multiple images
export const uploadMultipleImages = async (
  files: File[],
  propertyId: string,
  category = "general",
  options: ImageUploadOptions = {},
  onProgress?: (progress: number) => void,
): Promise<UploadResult[]> => {
  const results: UploadResult[] = []

  for (let i = 0; i < files.length; i++) {
    const result = await uploadImage(files[i], propertyId, category, options)
    results.push(result)

    if (onProgress) {
      onProgress(((i + 1) / files.length) * 100)
    }
  }

  return results
}

// Delete image from storage
export const deleteImage = async (path: string): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase.storage.from("property-images").remove([path])

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    }
  }
}
