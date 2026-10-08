import React, { useState } from 'react';
import { Plus, Trash2, Wrench, CheckCircle2, DollarSign, Clock, ShieldAlert } from 'lucide-react';
import { ProviderProfile, ProviderServiceItem, ServiceCategory } from '../../types';
import { useToast } from '../../context/ToastContext';
import { addProviderService, deleteProviderService } from '../../lib/api';

interface ServicesManagerProps {
  categories: ServiceCategory[];
  provider: ProviderProfile | null;
  onRefreshProvider: () => void;
}

export const ServicesManager: React.FC<ServicesManagerProps> = ({
  categories,
  provider,
  onRefreshProvider
}) => {
  const { showToast } = useToast();

  const [isAdding, setIsAdding] = useState(false);
  const [serviceName, setServiceName] = useState('');
  const [categoryId, setCategoryId] = useState(provider?.primaryCategoryId || 'plumbing');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('45');
  const [priceUnit, setPriceUnit] = useState<'fixed' | 'hourly' | 'quote'>('fixed');
  const [duration, setDuration] = useState('1 hour');
  const [isEmergency, setIsEmergency] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!provider) {
    return <div className="text-center py-12 text-slate-500 text-xs">Please create your profile first.</div>;
  }

  const handleAddService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceName.trim()) {
      showToast({ type: 'warning', title: 'Service name is required' });
      return;
    }

    setIsSubmitting(true);
    const newService: Partial<ProviderServiceItem> = {
      categoryId,
      serviceName,
      description,
      price: parseFloat(price) || 40,
      priceUnit,
      estimatedDuration: duration,
      isEmergencyAvailable: isEmergency
    };

    const added = await addProviderService(provider.id, newService);
    setIsSubmitting(false);

    if (added) {
      showToast({
        type: 'success',
        title: 'Service Added!',
        message: `${serviceName} is now live and bookable by residents.`
      });
      setServiceName('');
      setDescription('');
      setIsAdding(false);
      onRefreshProvider();
    } else {
      showToast({ type: 'error', title: 'Failed to add service' });
    }
  };

  const handleDeleteService = async (serviceId: string) => {
    const ok = await deleteProviderService(provider.id, serviceId);
    if (ok) {
      showToast({ type: 'info', title: 'Service removed' });
      onRefreshProvider();
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Services & Pricing</h2>
          <p className="text-xs text-slate-500 mt-0.5">Define individual services, turnaround time, and rates</p>
        </div>

        <button
          onClick={() => setIsAdding(!isAdding)}
          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>{isAdding ? 'Cancel' : 'Add New Service'}</span>
        </button>
      </div>

      {/* Add New Service Drawer */}
      {isAdding && (
        <form onSubmit={handleAddService} className="bg-white rounded-3xl border border-indigo-200 p-6 space-y-4 shadow-lg animate-fade-in">
          <h3 className="font-bold text-slate-900 text-sm">Add New Service Item</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Service Title</label>
              <input
                type="text"
                required
                value={serviceName}
                onChange={(e) => setServiceName(e.target.value)}
                placeholder="e.g. Kitchen Drain Jetting & Trap Fix"
                className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 font-medium"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Service Description</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is included in this service..."
              className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Base Price ($)</label>
              <input
                type="number"
                min={5}
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Pricing Unit</label>
              <select
                value={priceUnit}
                onChange={(e) => setPriceUnit(e.target.value as any)}
                className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 font-medium"
              >
                <option value="fixed">Fixed Price</option>
                <option value="hourly">Hourly Rate</option>
                <option value="quote">Free Estimate</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Estimated Duration</label>
              <input
                type="text"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="e.g. 45 mins / 1-2 hours"
                className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={isEmergency}
              onChange={(e) => setIsEmergency(e.target.checked)}
              className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
            />
            <span className="text-xs font-semibold text-slate-700">
              🚨 Available for Emergency Priority Dispatch (Urgent Callouts)
            </span>
          </label>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs shadow-md transition-all"
          >
            {isSubmitting ? 'Adding...' : 'Add Service'}
          </button>
        </form>
      )}

      {/* Existing Services List */}
      <div className="space-y-3">
        {provider.services?.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center text-xs text-slate-400">
            No services listed yet. Click "Add New Service" above to list your offerings.
          </div>
        ) : (
          provider.services?.map((s) => (
            <div
              key={s.id}
              className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex items-center justify-between gap-4"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-bold text-slate-900 text-sm">{s.serviceName}</h4>
                  {s.isEmergencyAvailable && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-700">
                      🚨 Emergency Ready
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 line-clamp-2">{s.description}</p>
                <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-2">
                  <span>Duration: {s.estimatedDuration}</span>
                  <span>•</span>
                  <span className="capitalize">Category: {s.categoryId}</span>
                </div>
              </div>

              <div className="flex items-center gap-4 flex-shrink-0">
                <div className="text-right">
                  <span className="text-lg font-black text-slate-900">${s.price}</span>
                  <span className="text-[11px] text-slate-500 block">/ {s.priceUnit}</span>
                </div>

                <button
                  onClick={() => handleDeleteService(s.id)}
                  className="p-2 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-rose-50 transition-colors"
                  title="Remove Service"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
