-- ============================================================
-- ServiceNear: Supabase Database Schema & Seed Data
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES TABLE (Common for Residents and Providers)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('resident', 'provider')),
  full_name TEXT NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  address TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. CATEGORIES TABLE (The 12 Core Service Categories)
CREATE TABLE IF NOT EXISTS public.categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  icon TEXT NOT NULL,
  description TEXT,
  popular_keywords TEXT[],
  display_order INT DEFAULT 0
);

-- 3. PROVIDER PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.provider_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  business_name TEXT NOT NULL,
  bio TEXT,
  primary_category_id TEXT REFERENCES public.categories(id),
  experience_years INT DEFAULT 1,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  service_radius_km DOUBLE PRECISION DEFAULT 10,
  availability_status TEXT DEFAULT 'available' CHECK (availability_status IN ('available', 'busy', 'unavailable')),
  working_days TEXT[] DEFAULT ARRAY['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  working_hours_start TEXT DEFAULT '08:00',
  working_hours_end TEXT DEFAULT '19:00',
  phone_verified BOOLEAN DEFAULT true,
  profile_complete BOOLEAN DEFAULT true,
  services_added BOOLEAN DEFAULT true,
  rating NUMERIC(3,2) DEFAULT 4.8,
  review_count INT DEFAULT 0,
  completed_jobs INT DEFAULT 0,
  is_demo BOOLEAN DEFAULT false,
  contact_phone TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. PROVIDER SERVICES TABLE
CREATE TABLE IF NOT EXISTS public.provider_services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider_id UUID NOT NULL REFERENCES public.provider_profiles(id) ON DELETE CASCADE,
  category_id TEXT NOT NULL REFERENCES public.categories(id),
  service_name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10,2) NOT NULL,
  price_unit TEXT DEFAULT 'fixed' CHECK (price_unit IN ('fixed', 'hourly', 'quote')),
  estimated_duration TEXT DEFAULT '1-2 hours',
  is_emergency_available BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. BOOKINGS TABLE
CREATE TABLE IF NOT EXISTS public.bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  resident_id UUID NOT NULL REFERENCES auth.users(id),
  provider_id UUID NOT NULL REFERENCES public.provider_profiles(id),
  category_id TEXT NOT NULL REFERENCES public.categories(id),
  service_name TEXT NOT NULL,
  problem_description TEXT NOT NULL,
  photo_url TEXT,
  address TEXT NOT NULL,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  preferred_date DATE NOT NULL,
  preferred_time TEXT NOT NULL,
  is_emergency BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'requested' CHECK (status IN ('requested', 'accepted', 'on_the_way', 'in_progress', 'completed', 'cancelled')),
  estimated_price NUMERIC(10,2),
  provider_notes TEXT,
  resident_phone TEXT,
  provider_phone TEXT,
  resident_name TEXT,
  provider_name TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 6. REVIEWS TABLE
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID UNIQUE REFERENCES public.bookings(id) ON DELETE CASCADE,
  resident_id UUID NOT NULL REFERENCES auth.users(id),
  provider_id UUID NOT NULL REFERENCES public.provider_profiles(id),
  resident_name TEXT,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 7. FAVORITES TABLE
CREATE TABLE IF NOT EXISTS public.favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  resident_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider_id UUID NOT NULL REFERENCES public.provider_profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (resident_id, provider_id)
);

-- ============================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.provider_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.provider_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

-- Categories: readable by everyone
CREATE POLICY "Categories are viewable by everyone" ON public.categories FOR SELECT USING (true);

-- Profiles: readable by all authenticated, manageable by owner
CREATE POLICY "Profiles viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Provider Profiles: readable by everyone, editable by provider owner
CREATE POLICY "Provider profiles viewable by everyone" ON public.provider_profiles FOR SELECT USING (true);
CREATE POLICY "Providers can insert own profile" ON public.provider_profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Providers can update own profile" ON public.provider_profiles FOR UPDATE USING (auth.uid() = id);

-- Provider Services: readable by everyone, editable by provider owner
CREATE POLICY "Provider services viewable by everyone" ON public.provider_services FOR SELECT USING (true);
CREATE POLICY "Providers can manage own services" ON public.provider_services FOR ALL USING (auth.uid() = provider_id);

-- Bookings: resident can view their own, provider can view bookings assigned to them
CREATE POLICY "Residents can view own bookings" ON public.bookings FOR SELECT USING (auth.uid() = resident_id);
CREATE POLICY "Providers can view assigned bookings" ON public.bookings FOR SELECT USING (auth.uid() = provider_id);
CREATE POLICY "Residents can create bookings" ON public.bookings FOR INSERT WITH CHECK (auth.uid() = resident_id);
CREATE POLICY "Providers can update assigned bookings" ON public.bookings FOR UPDATE USING (auth.uid() = provider_id);
CREATE POLICY "Residents can cancel own bookings" ON public.bookings FOR UPDATE USING (auth.uid() = resident_id);

-- Reviews: viewable by all, insertable by resident
CREATE POLICY "Reviews viewable by everyone" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Residents can create reviews" ON public.reviews FOR INSERT WITH CHECK (auth.uid() = resident_id);

-- Favorites: manageable by resident
CREATE POLICY "Residents can manage favorites" ON public.favorites FOR ALL USING (auth.uid() = resident_id);

-- ============================================================
-- SEED DATA: 12 SERVICE CATEGORIES
-- ============================================================

INSERT INTO public.categories (id, name, icon, description, popular_keywords, display_order) VALUES
('plumbing', 'Plumbing', 'Wrench', 'Water leakages, tap repairs, pipe unclogging, bathroom fittings, geyser installation', ARRAY['leak', 'pipe', 'tap', 'drain', 'toilet', 'sink', 'geyser', 'clog'], 1),
('electrical', 'Electrical', 'Zap', 'Wiring repair, short circuit fixes, switchboard installation, ceiling fans, lighting', ARRAY['wiring', 'short circuit', 'fan', 'light', 'switch', 'fuse', 'socket', 'power'], 2),
('home-cleaning', 'Home Cleaning', 'Sparkles', 'Deep house cleaning, sofa washing, kitchen degreasing, bathroom sanitization', ARRAY['deep clean', 'dust', 'sanitize', 'sofa', 'bathroom', 'kitchen', 'floor', 'mop'], 3),
('tutoring', 'Tutoring', 'BookOpen', 'Maths, Science, English, coding, music lessons, test preparation', ARRAY['maths', 'science', 'english', 'coding', 'tutor', 'teacher', 'homework', 'exam'], 4),
('carpentry', 'Carpentry', 'Hammer', 'Furniture repair, custom cabinets, door hinges, wood polishing, lock replacement', ARRAY['wood', 'furniture', 'door', 'lock', 'cabinet', 'chair', 'table', 'hinge'], 5),
('painting', 'Painting', 'Paintbrush', 'Interior wall painting, exterior repainting, waterproofing, stencil art', ARRAY['wall', 'paint', 'color', 'waterproofing', 'whitewash', 'primer', 'texture'], 6),
('appliance-repair', 'Appliance Repair', 'Cpu', 'Washing machines, microwave ovens, refrigerators, chimney repair, mixer grinders', ARRAY['fridge', 'refrigerator', 'washing machine', 'microwave', 'oven', 'appliance', 'motor'], 7),
('ac-cooling', 'AC & Cooling Services', 'Wind', 'AC filter cleaning, gas refill, cooling coil check, compressor repair, installation', ARRAY['ac', 'air conditioner', 'cooling', 'gas leak', 'compressor', 'split ac', 'filter'], 8),
('pest-control', 'Pest Control', 'Bug', 'Cockroach management, termite treatment, bed bug control, rodent exclusion', ARRAY['termites', 'cockroach', 'bugs', 'pest', 'mosquito', 'rodent', 'ant', 'fumigation'], 9),
('beauty-personal-care', 'Beauty & Personal Care', 'Scissors', 'Salon at home, haircut, manicure, pedicure, massage, skincare treatments', ARRAY['haircut', 'salon', 'facial', 'massage', 'waxing', 'manicure', 'hair style'], 10),
('gardening', 'Gardening', 'Flower2', 'Lawn mowing, hedge trimming, plant potting, soil enrichment, landscape maintenance', ARRAY['lawn', 'plants', 'garden', 'grass', 'potting', 'trimming', 'fertilizer', 'weeds'], 11),
('it-support', 'Computer & IT Support', 'Laptop', 'Laptop formatting, Wi-Fi router setup, virus removal, printer troubleshooting', ARRAY['laptop', 'computer', 'wifi', 'router', 'windows', 'printer', 'virus', 'network'], 12)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  popular_keywords = EXCLUDED.popular_keywords,
  display_order = EXCLUDED.display_order;

-- Storage buckets setup script:
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('booking-photos', 'booking-photos', true) ON CONFLICT DO NOTHING;
