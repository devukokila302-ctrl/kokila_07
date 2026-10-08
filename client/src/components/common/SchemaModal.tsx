import React, { useState } from 'react';
import { X, Copy, Check, Database, ExternalLink } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

interface SchemaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SchemaModal: React.FC<SchemaModalProps> = ({ isOpen, onClose }) => {
  const { showToast } = useToast();
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const sqlSnippet = `-- ServiceNear Supabase Schema (HC8: Local Service Provider Marketplace)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('resident', 'provider')),
  full_name TEXT NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  address TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION
);

CREATE TABLE IF NOT EXISTS public.categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  icon TEXT NOT NULL,
  description TEXT,
  popular_keywords TEXT[],
  display_order INT DEFAULT 0
);

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
  completed_jobs INT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
  estimated_price NUMERIC(10,2)
);

CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID UNIQUE REFERENCES public.bookings(id) ON DELETE CASCADE,
  resident_id UUID NOT NULL REFERENCES auth.users(id),
  provider_id UUID NOT NULL REFERENCES public.provider_profiles(id),
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT
);

CREATE TABLE IF NOT EXISTS public.favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resident_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider_id UUID NOT NULL REFERENCES public.provider_profiles(id) ON DELETE CASCADE,
  UNIQUE (resident_id, provider_id)
);`;

  const handleCopy = () => {
    navigator.clipboard.writeText(sqlSnippet);
    setCopied(true);
    showToast({
      type: 'success',
      title: 'SQL Schema Copied!',
      message: 'Paste into your Supabase SQL editor to create all tables and RLS policies.'
    });
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-2xl w-full overflow-hidden my-6">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Supabase Database Schema</h3>
              <p className="text-xs text-slate-500">PostgreSQL tables, relationships, and RLS policies</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <p className="text-xs text-slate-600 leading-relaxed">
            This application is connected to Supabase URL <code>https://kkpqfbelzwwlmhljdcbf.supabase.co</code>. If running on a new Supabase project, execute this SQL script in your Supabase SQL Editor. The app also features an automatic resilient fallback store pre-seeded with all 12 categories and realistic providers.
          </p>

          <div className="relative rounded-2xl bg-slate-900 text-slate-100 p-4 font-mono text-[11px] max-h-72 overflow-y-auto">
            <button
              onClick={handleCopy}
              className="absolute top-3 right-3 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-sans text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy SQL'}</span>
            </button>
            <pre className="pr-20 whitespace-pre">{sqlSnippet}</pre>
          </div>

          <div className="pt-2 flex items-center justify-between">
            <span className="text-xs text-slate-500">Full migration file: <code>supabase_schema.sql</code> in root</span>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
