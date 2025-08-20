-- Enable Row Level Security
ALTER TABLE IF EXISTS property_images DISABLE ROW LEVEL SECURITY;
DROP TABLE IF EXISTS property_images;

-- Create property_images table
CREATE TABLE property_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id TEXT NOT NULL,
  image_url TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  category TEXT DEFAULT 'general',
  caption TEXT,
  is_primary BOOLEAN DEFAULT FALSE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_property_images_property_id ON property_images(property_id);
CREATE INDEX idx_property_images_category ON property_images(category);
CREATE INDEX idx_property_images_is_primary ON property_images(is_primary);
CREATE INDEX idx_property_images_display_order ON property_images(display_order);

-- Enable Row Level Security
ALTER TABLE property_images ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (adjust based on your needs)
CREATE POLICY "Allow public read access" ON property_images
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert" ON property_images
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update" ON property_images
  FOR UPDATE USING (true);

CREATE POLICY "Allow public delete" ON property_images
  FOR DELETE USING (true);

-- Create storage bucket for property images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('property-images', 'property-images', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies
CREATE POLICY "Allow public uploads" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'property-images');

CREATE POLICY "Allow public access" ON storage.objects
  FOR SELECT USING (bucket_id = 'property-images');

CREATE POLICY "Allow public updates" ON storage.objects
  FOR UPDATE USING (bucket_id = 'property-images');

CREATE POLICY "Allow public deletes" ON storage.objects
  FOR DELETE USING (bucket_id = 'property-images');

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
CREATE TRIGGER update_property_images_updated_at
  BEFORE UPDATE ON property_images
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
