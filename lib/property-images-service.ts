import { supabase } from "./supabase"

export interface PropertyImage {
  id: string
  property_id: string
  image_url: string
  storage_path: string
  category: string
  caption?: string
  is_primary: boolean
  display_order: number
  created_at: string
  updated_at: string
}

export interface CreatePropertyImageData {
  property_id: string
  image_url: string
  storage_path: string
  category?: string
  caption?: string
  is_primary?: boolean
  display_order?: number
}

// Get all images for a property
export const getPropertyImages = async (propertyId: string): Promise<PropertyImage[]> => {
  try {
    const { data, error } = await supabase
      .from("property_images")
      .select("*")
      .eq("property_id", propertyId)
      .order("display_order", { ascending: true })
      .order("created_at", { ascending: true })

    if (error) {
      console.error("Error fetching property images:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("Error fetching property images:", error)
    return []
  }
}

// Get images by category
export const getPropertyImagesByCategory = async (propertyId: string, category: string): Promise<PropertyImage[]> => {
  try {
    const { data, error } = await supabase
      .from("property_images")
      .select("*")
      .eq("property_id", propertyId)
      .eq("category", category)
      .order("display_order", { ascending: true })
      .order("created_at", { ascending: true })

    if (error) {
      console.error("Error fetching property images by category:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("Error fetching property images by category:", error)
    return []
  }
}

// Add new property image
export const addPropertyImage = async (imageData: CreatePropertyImageData): Promise<PropertyImage | null> => {
  try {
    const { data, error } = await supabase.from("property_images").insert([imageData]).select().single()

    if (error) {
      console.error("Error adding property image:", error)
      return null
    }

    return data
  } catch (error) {
    console.error("Error adding property image:", error)
    return null
  }
}

// Update property image
export const updatePropertyImage = async (
  id: string,
  updates: Partial<CreatePropertyImageData>,
): Promise<PropertyImage | null> => {
  try {
    const { data, error } = await supabase.from("property_images").update(updates).eq("id", id).select().single()

    if (error) {
      console.error("Error updating property image:", error)
      return null
    }

    return data
  } catch (error) {
    console.error("Error updating property image:", error)
    return null
  }
}

// Delete property image
export const deletePropertyImage = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase.from("property_images").delete().eq("id", id)

    if (error) {
      console.error("Error deleting property image:", error)
      return false
    }

    return true
  } catch (error) {
    console.error("Error deleting property image:", error)
    return false
  }
}

// Set primary image
export const setPrimaryImage = async (propertyId: string, imageId: string): Promise<boolean> => {
  try {
    // First, unset all primary images for this property
    await supabase.from("property_images").update({ is_primary: false }).eq("property_id", propertyId)

    // Then set the selected image as primary
    const { error } = await supabase.from("property_images").update({ is_primary: true }).eq("id", imageId)

    if (error) {
      console.error("Error setting primary image:", error)
      return false
    }

    return true
  } catch (error) {
    console.error("Error setting primary image:", error)
    return false
  }
}

// Update display order
export const updateDisplayOrder = async (imageId: string, newOrder: number): Promise<boolean> => {
  try {
    const { error } = await supabase.from("property_images").update({ display_order: newOrder }).eq("id", imageId)

    if (error) {
      console.error("Error updating display order:", error)
      return false
    }

    return true
  } catch (error) {
    console.error("Error updating display order:", error)
    return false
  }
}

// Get primary image for a property
export const getPrimaryImage = async (propertyId: string): Promise<PropertyImage | null> => {
  try {
    const { data, error } = await supabase
      .from("property_images")
      .select("*")
      .eq("property_id", propertyId)
      .eq("is_primary", true)
      .single()

    if (error) {
      // If no primary image found, get the first image
      const { data: firstImage } = await supabase
        .from("property_images")
        .select("*")
        .eq("property_id", propertyId)
        .order("display_order", { ascending: true })
        .order("created_at", { ascending: true })
        .limit(1)
        .single()

      return firstImage || null
    }

    return data
  } catch (error) {
    console.error("Error getting primary image:", error)
    return null
  }
}
