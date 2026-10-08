import React, { useState, useRef } from 'react';
import {
  User,
  Phone,
  Briefcase,
  FileText,
  CheckCircle2,
  Save,
  Upload,
  Image as ImageIcon,
  Camera,
  Check,
  RefreshCw,
  X
} from 'lucide-react';
import { ProviderProfile, ServiceCategory } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { saveProviderProfile } from '../../lib/api';

interface ProfileEditorProps {
  categories: ServiceCategory[];
  provider: ProviderProfile | null;
  onProfileUpdated: (updated: ProviderProfile) => void;
}

export const ProfileEditor: React.FC<ProfileEditorProps> = ({
  categories,
  provider,
  onProfileUpdated,
}) => {
  const { user, updateUserProfile } = useAuth();
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [businessName, setBusinessName] = useState(provider?.businessName || 'QuickFix Professional Services');
  const [contactName, setContactName] = useState(provider?.contactName || user?.fullName || 'Vikram Sharma');
  const [phone, setPhone] = useState(provider?.phone || user?.phone || '+1 (555) 321-7890');
  const [bio, setBio] = useState(provider?.bio || 'Certified technician providing high quality neighborhood home repair services.');
  const [primaryCategoryId, setPrimaryCategoryId] = useState(provider?.primaryCategoryId || 'plumbing');
  const [experienceYears, setExperienceYears] = useState(provider?.experienceYears || 5);
  const [avatarUrl, setAvatarUrl] = useState(
    provider?.avatarUrl || 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=400&auto=format&fit=crop&q=80'
  );
  const [address, setAddress] = useState(provider?.address || 'Indiranagar 100ft Rd Metro Area');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [photoSource, setPhotoSource] = useState<'upload' | 'avatar'>(
    provider?.avatarUrl?.startsWith('data:') ? 'upload' : 'avatar'
  );
  const [uploadedFileName, setUploadedFileName] = useState<string>('');

  // 12 Curated Professional Avatars
  const presetAvatars = [
    {
      id: 'av-1',
      label: 'Vikram (Plumbing)',
      url: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=400&auto=format&fit=crop&q=80'
    },
    {
      id: 'av-2',
      label: 'Arjun (Electrical)',
      url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80'
    },
    {
      id: 'av-3',
      label: 'Suresh (Handyman)',
      url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80'
    },
    {
      id: 'av-4',
      label: 'Ananya (Cleaning)',
      url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80'
    },
    {
      id: 'av-5',
      label: 'Pooja (Home Care)',
      url: 'https://images.unsplash.com/photo-1580894732444-8ecded7900cd?w=400&auto=format&fit=crop&q=80'
    },
    {
      id: 'av-6',
      label: 'Divya (Appliance)',
      url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80'
    },
    {
      id: 'av-7',
      label: 'Rahul (Carpentry)',
      url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&auto=format&fit=crop&q=80'
    },
    {
      id: 'av-8',
      label: 'Deepak (AC / HVAC)',
      url: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&auto=format&fit=crop&q=80'
    },
    {
      id: 'av-9',
      label: 'Karan (Painting)',
      url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&auto=format&fit=crop&q=80'
    },
    {
      id: 'av-10',
      label: 'Meera (Gardening)',
      url: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=400&auto=format&fit=crop&q=80'
    },
    {
      id: 'av-11',
      label: 'Rohit (Security)',
      url: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=400&auto=format&fit=crop&q=80'
    },
    {
      id: 'av-12',
      label: 'Sunita (Tutor / Pro)',
      url: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=400&auto=format&fit=crop&q=80'
    }
  ];

  // Handle local file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast({ type: 'error', title: 'Invalid File', message: 'Please select an image file (PNG, JPG, WEBP).' });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast({ type: 'error', title: 'File Too Large', message: 'Image must be under 5MB.' });
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setAvatarUrl(reader.result);
        setPhotoSource('upload');
        setUploadedFileName(file.name);
        showToast({
          type: 'success',
          title: 'Photo Uploaded!',
          message: `Loaded "${file.name}". Click Save Profile to apply.`
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const payload: Partial<ProviderProfile> = {
      id: provider?.id || (user ? `prov-${user.id.slice(0, 8)}` : 'prov-custom-1'),
      userId: user?.id || 'user-custom-1',
      businessName,
      contactName,
      phone,
      bio,
      primaryCategoryId,
      experienceYears: Number(experienceYears),
      avatarUrl,
      address,
      latitude: provider?.latitude || 12.9716,
      longitude: provider?.longitude || 77.5946,
      serviceRadiusKm: provider?.serviceRadiusKm || 10,
      availabilityStatus: provider?.availabilityStatus || 'available',
      phoneVerified: true,
      profileComplete: true,
      servicesAdded: (provider?.services && provider.services.length > 0) || false,
    };

    const saved = await saveProviderProfile(payload);
    setIsSubmitting(false);

    if (saved) {
      // Also update auth context user profile so header avatar updates immediately
      updateUserProfile({
        avatarUrl,
        fullName: contactName,
        phone
      });

      showToast({
        type: 'success',
        title: 'Profile & Picture Updated Successfully!',
        message: 'Your profile and photo are live and immediately visible across the marketplace.'
      });
      onProfileUpdated(saved);
    } else {
      showToast({ type: 'error', title: 'Failed to save profile' });
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Business Profile Editor</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Upload your picture or pick a verified avatar, then update your business info
        </p>
      </div>

      {/* Verification Checklist Card */}
      <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
            ✓
          </div>
          <div>
            <h4 className="font-bold text-slate-900 text-xs">Provider Trust & Verification Status</h4>
            <p className="text-[11px] text-emerald-800">Helps residents book with confidence</p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-semibold text-emerald-900">
          <span className="flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Phone Verified
          </span>
          <span className="flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Profile Complete
          </span>
          <span className="flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" /> Services Listed
          </span>
        </div>
      </div>

      {/* Main Profile Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 space-y-6 shadow-xs">
        {/* ================= PHOTO SELECTION SECTION ================= */}
        <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Camera className="w-4 h-4 text-indigo-600" />
                <span>Profile & Business Photo</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Upload your own photo or choose from our verified professional avatars
              </p>
            </div>

            {/* Source indicator badge */}
            <span className={`self-start sm:self-auto px-2.5 py-1 rounded-full text-[11px] font-bold ${
              photoSource === 'upload'
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                : 'bg-indigo-100 text-indigo-800 border border-indigo-200'
            }`}>
              {photoSource === 'upload' ? '📷 Custom Uploaded Photo' : '🎨 Selected Avatar'}
            </span>
          </div>

          {/* Active Preview & Side-by-Side Options */}
          <div className="flex flex-col md:flex-row items-start gap-6">
            {/* Live Preview Card */}
            <div className="flex flex-col items-center p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex-shrink-0 w-full sm:w-auto">
              <div className="relative group">
                <img
                  src={avatarUrl}
                  alt="Current Profile Picture"
                  className="w-28 h-28 rounded-2xl object-cover border-2 border-indigo-500 shadow-md transition-transform group-hover:scale-102"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 bg-slate-900/40 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-xs font-bold gap-1"
                >
                  <Camera className="w-5 h-5" />
                  <span>Change</span>
                </button>
              </div>

              <span className="text-[11px] font-bold text-slate-800 mt-2.5 text-center">
                {contactName || 'Provider'}
              </span>
              <span className="text-[10px] text-slate-500">{businessName || 'Services'}</span>
            </div>

            {/* The Two Options: Upload OR Select Avatar */}
            <div className="flex-1 space-y-4 w-full">
              {/* Option 1: Upload Your Own Pic */}
              <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Upload className="w-4 h-4 text-indigo-600" />
                    <span className="text-xs font-bold text-slate-800">Option 1: Upload Your Own Photo</span>
                  </div>
                  <span className="text-[10px] text-slate-400">JPG, PNG, WEBP (Max 5MB)</span>
                </div>

                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />

                <div className="flex flex-wrap items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm shadow-indigo-600/20 flex items-center gap-2 transition-all"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Photo from Device</span>
                  </button>

                  {uploadedFileName && (
                    <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                      <Check className="w-3 h-3 text-emerald-600" />
                      <span className="truncate max-w-xs">{uploadedFileName}</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Option 2: Select From Professional Avatars */}
              <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-violet-600" />
                    <span className="text-xs font-bold text-slate-800">Option 2: Select a Verified Avatar</span>
                  </div>
                  <span className="text-[10px] text-slate-400">12 Professional Avatars</span>
                </div>

                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                  {presetAvatars.map((av) => {
                    const isSelected = avatarUrl === av.url;
                    return (
                      <button
                        key={av.id}
                        type="button"
                        onClick={() => {
                          setAvatarUrl(av.url);
                          setPhotoSource('avatar');
                          setUploadedFileName('');
                        }}
                        title={av.label}
                        className={`group relative rounded-xl overflow-hidden border-2 transition-all p-0.5 ${
                          isSelected
                            ? 'border-indigo-600 ring-2 ring-indigo-400 scale-105 shadow-md'
                            : 'border-slate-200 hover:border-indigo-300 opacity-80 hover:opacity-100'
                        }`}
                      >
                        <img
                          src={av.url}
                          alt={av.label}
                          className="w-full h-12 object-cover rounded-lg"
                        />
                        {isSelected && (
                          <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[9px] font-bold shadow-sm">
                            ✓
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Custom Image URL fallback */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="text"
                  value={avatarUrl.startsWith('data:') ? 'Custom uploaded image (data URL)' : avatarUrl}
                  onChange={(e) => {
                    if (!avatarUrl.startsWith('data:')) {
                      setAvatarUrl(e.target.value);
                      setPhotoSource('avatar');
                    }
                  }}
                  disabled={avatarUrl.startsWith('data:')}
                  placeholder="Or paste external image URL..."
                  className="flex-1 px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-100 disabled:text-slate-500"
                />
                {avatarUrl.startsWith('data:') && (
                  <button
                    type="button"
                    onClick={() => {
                      setAvatarUrl(presetAvatars[0].url);
                      setPhotoSource('avatar');
                      setUploadedFileName('');
                    }}
                    className="text-xs text-rose-600 hover:text-rose-800 font-bold px-2 py-1"
                  >
                    Reset Photo
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Business Name & Contact Person */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Business / Company Name</label>
            <div className="relative">
              <Briefcase className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                required
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="e.g. Apex Hydro Plumbing"
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Contact Person Name</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                required
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                placeholder="e.g. Vikram Sharma"
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Phone & Primary Category */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Contact Phone Number</label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 000-0000"
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Primary Service Category</label>
            <select
              value={primaryCategoryId}
              onChange={(e) => setPrimaryCategoryId(e.target.value)}
              className="w-full p-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 capitalize"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Experience & Address */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Years of Professional Experience</label>
            <input
              type="number"
              min={1}
              max={50}
              value={experienceYears}
              onChange={(e) => setExperienceYears(Number(e.target.value))}
              className="w-full p-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Operating Base Address / Area</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g. Indiranagar, Bangalore"
              className="w-full p-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Professional Bio */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Business Bio / Description</label>
          <textarea
            rows={3}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Tell neighborhood customers about your certifications, work ethic, and tools..."
            className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
          ></textarea>
        </div>

        {/* Submit Button */}
        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs shadow-md shadow-indigo-600/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            {isSubmitting ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Profile & Photo</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
