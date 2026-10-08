import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Upload,
  AlertTriangle,
  CheckCircle2,
  MapPin,
  Star,
  ArrowRight,
  ShieldAlert,
  HelpCircle,
  ImageIcon
} from 'lucide-react';
import { AIAnalysisResult, ProviderProfile } from '../../types';
import { useLocation } from '../../context/LocationContext';
import { useToast } from '../../context/ToastContext';
import { analyzeAIRequest, analyzeAIImage } from '../../lib/api';

interface AIAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProviderToBook: (provider: ProviderProfile, problemDesc?: string, isEmergency?: boolean) => void;
}

export const AIAssistantModal: React.FC<AIAssistantModalProps> = ({
  isOpen,
  onClose,
  onSelectProviderToBook
}) => {
  const { latitude, longitude } = useLocation();
  const { showToast } = useToast();

  const [promptText, setPromptText] = useState('');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AIAnalysisResult | null>(null);
  const [suggestedProviders, setSuggestedProviders] = useState<ProviderProfile[]>([]);

  if (!isOpen) return null;

  const quickSamples = [
    'My bathroom tap is leaking badly and I need someone today.',
    'Main electrical circuit breaker tripped and sparks flew from switchboard.',
    'Split AC is not cooling and leaking water onto the wall.',
    'Kitchen has severe cockroach problem behind cabinets.'
  ];

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async (textToUse?: string) => {
    const query = textToUse || promptText;
    if (!query.trim() && !photoPreview) {
      showToast({
        type: 'warning',
        title: 'Description or Photo Required',
        message: 'Please describe the issue or attach a photo for Gemini AI to diagnose.'
      });
      return;
    }

    setIsLoading(true);
    setAnalysisResult(null);
    setSuggestedProviders([]);

    try {
      if (photoPreview) {
        // Image analysis
        const res = await analyzeAIImage(photoPreview, 'image/jpeg', query, latitude, longitude);
        if (res) {
          setAnalysisResult(res.analysis);
          setSuggestedProviders(res.suggestedProviders);
        }
      } else {
        // Text analysis
        const res = await analyzeAIRequest(query, latitude, longitude);
        if (res) {
          setAnalysisResult(res.analysis);
          setSuggestedProviders(res.suggestedProviders);
        }
      }
    } catch (err) {
      showToast({ type: 'error', title: 'Analysis failed', message: 'Could not complete AI classification.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-2xl w-full overflow-hidden my-6">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-700 text-white flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center text-white">
              <Sparkles className="w-5 h-5 text-indigo-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-extrabold tracking-tight">AI Service Assistant</h3>
                <span className="text-[10px] font-bold bg-white/20 px-2 py-0.5 rounded-full">
                  Gemini Powered
                </span>
              </div>
              <p className="text-xs text-indigo-100 mt-0.5">
                Describe or photograph your issue — we identify the category, urgency, and top local match.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 max-h-[78vh] overflow-y-auto">
          {/* Query Input */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              What do you need help with?
            </label>
            <textarea
              rows={3}
              value={promptText}
              onChange={(e) => setPromptText(e.target.value)}
              placeholder="e.g. My bathroom tap is leaking badly and I need someone today."
              className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:bg-white resize-none"
            />

            {/* Quick Sample Suggestions */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              <span className="text-[10px] font-semibold text-slate-400 self-center mr-1">Examples:</span>
              {quickSamples.map((sample, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setPromptText(sample);
                    handleAnalyze(sample);
                  }}
                  className="text-[11px] bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-600 px-2.5 py-1 rounded-lg transition-colors border border-slate-200/60 truncate max-w-xs"
                >
                  "{sample.slice(0, 38)}..."
                </button>
              ))}
            </div>
          </div>

          {/* Optional Photo Diagnosis */}
          <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                <ImageIcon className="w-3.5 h-3.5 text-indigo-600" />
                <span>Multimodal Vision Diagnosis (Optional)</span>
              </div>
              {photoPreview && (
                <button
                  type="button"
                  onClick={() => setPhotoPreview(null)}
                  className="text-[11px] text-rose-600 hover:underline"
                >
                  Remove Photo
                </button>
              )}
            </div>

            <div className="flex items-center gap-3">
              <label className="flex-1 border-2 border-dashed border-slate-300 hover:border-indigo-500 rounded-xl p-3 text-center cursor-pointer bg-white transition-all">
                <Upload className="w-4 h-4 mx-auto text-slate-400 mb-1" />
                <span className="text-[11px] text-slate-600 font-medium">
                  {photoPreview ? 'Change attached photo' : 'Upload photo of broken pipe, switchboard, or appliance'}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </label>

              {photoPreview && (
                <div className="w-16 h-16 rounded-xl overflow-hidden border border-slate-200 flex-shrink-0 shadow-sm">
                  <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
          </div>

          {/* Analyze Action Button */}
          <button
            type="button"
            onClick={() => handleAnalyze()}
            disabled={isLoading}
            className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold rounded-2xl text-xs shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                <span>Gemini is analyzing your request...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Analyze Request & Match Providers</span>
              </>
            )}
          </button>

          {/* Analysis Results Display */}
          {analysisResult && (
            <div className="space-y-4 pt-2 border-t border-slate-100 animate-fade-in">
              {/* Diagnosis Summary Card */}
              <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-200/80">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-500 block">
                      Recommended Category
                    </span>
                    <h4 className="text-base font-extrabold text-slate-900">
                      {analysisResult.categoryName} • {analysisResult.problemType}
                    </h4>
                  </div>

                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                      analysisResult.urgency === 'emergency'
                        ? 'bg-rose-100 text-rose-800 border-rose-300'
                        : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                    }`}
                  >
                    {analysisResult.urgency === 'emergency' ? '🚨 Emergency Request' : 'Standard Priority'}
                  </span>
                </div>

                <p className="text-xs text-slate-700 leading-relaxed mb-3">
                  {analysisResult.explanation}
                </p>

                {/* Safety Tip Alert */}
                {analysisResult.safetyTip && (
                  <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
                    <ShieldAlert className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                    <span><strong>Immediate Safety Advice:</strong> {analysisResult.safetyTip}</span>
                  </div>
                )}
              </div>

              {/* Matched Providers List (Smart Matching) */}
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Smart Matched Local Providers ({suggestedProviders.length})
                  </h4>
                  <span className="text-[11px] text-slate-500">Sorted by match score & distance</span>
                </div>

                {suggestedProviders.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-4">No matching providers found nearby.</p>
                ) : (
                  <div className="space-y-2.5">
                    {suggestedProviders.map((provider) => (
                      <div
                        key={provider.id}
                        className="p-3.5 rounded-2xl border border-slate-200 bg-white hover:border-indigo-300 hover:shadow-md transition-all flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={provider.avatarUrl}
                            alt={provider.businessName}
                            className="w-11 h-11 rounded-xl object-cover border border-slate-100"
                          />
                          <div>
                            <div className="flex items-center gap-1.5">
                              <h5 className="font-bold text-slate-900 text-xs">{provider.businessName}</h5>
                              <span className="text-[10px] font-bold text-amber-500 flex items-center">
                                ★ {provider.rating.toFixed(1)}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                              <span>{provider.experienceYears} yrs exp</span>
                              <span>•</span>
                              <span className="text-indigo-600 font-semibold">{provider.distanceKm} km away</span>
                              <span>•</span>
                              <span className="text-emerald-700 capitalize font-medium">● {provider.availabilityStatus}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-full text-[11px] font-extrabold bg-emerald-50 text-emerald-800 border border-emerald-200">
                            {provider.matchPercentage}% Match
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              onSelectProviderToBook(
                                provider,
                                `${analysisResult.problemType}: ${promptText || 'Diagnosed by AI'}`,
                                analysisResult.urgency === 'emergency'
                              );
                              onClose();
                            }}
                            className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-xs transition-all flex items-center gap-1"
                          >
                            <span>Book</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
