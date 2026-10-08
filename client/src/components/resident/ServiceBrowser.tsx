import React, { useState } from 'react';
import {
  Wrench,
  Zap,
  Sparkles,
  BookOpen,
  Hammer,
  Paintbrush,
  Cpu,
  Wind,
  Bug,
  Scissors,
  Flower2,
  Laptop,
  Search,
  ArrowRight
} from 'lucide-react';
import { ServiceCategory } from '../../types';

interface ServiceBrowserProps {
  categories: ServiceCategory[];
  selectedCategoryId?: string;
  onSelectCategory: (categoryId: string) => void;
}

const ICON_MAP: Record<string, React.ElementType> = {
  Wrench,
  Zap,
  Sparkles,
  BookOpen,
  Hammer,
  Paintbrush,
  Cpu,
  Wind,
  Bug,
  Scissors,
  Flower2,
  Laptop
};

export const ServiceBrowser: React.FC<ServiceBrowserProps> = ({
  categories,
  selectedCategoryId,
  onSelectCategory
}) => {
  const [searchFilter, setSearchFilter] = useState('');

  const filtered = categories.filter(c =>
    c.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
    c.description.toLowerCase().includes(searchFilter.toLowerCase()) ||
    c.popularKeywords.some(kw => kw.toLowerCase().includes(searchFilter.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Search & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Explore 12 Service Categories</h2>
          <p className="text-xs text-slate-500 mt-0.5">Select a category to view verified neighborhood providers</p>
        </div>

        <div className="relative max-w-xs w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="Search category, service, keyword..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 shadow-2xs"
          />
        </div>
      </div>

      {/* Grid of 12 Categories */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filtered.map((cat) => {
          const Icon = ICON_MAP[cat.icon] || Wrench;
          const isSelected = selectedCategoryId === cat.id;

          return (
            <div
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`p-5 rounded-2xl border transition-all duration-300 cursor-pointer flex flex-col justify-between group ${
                isSelected
                  ? 'bg-indigo-50/70 border-indigo-500 shadow-md shadow-indigo-500/10'
                  : 'bg-white border-slate-200/80 hover:border-indigo-300 hover:shadow-lg hover:-translate-y-0.5'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center transition-colors ${
                      isSelected
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-100 text-slate-700 group-hover:bg-indigo-600 group-hover:text-white'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    #{cat.displayOrder}
                  </span>
                </div>

                <h3 className="font-bold text-slate-900 text-sm mb-1 group-hover:text-indigo-600 transition-colors">
                  {cat.name}
                </h3>
                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-3">
                  {cat.description}
                </p>
              </div>

              <div>
                <div className="flex flex-wrap gap-1 mb-3">
                  {cat.popularKeywords.slice(0, 3).map((kw, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded-md bg-slate-50 border border-slate-200/60 text-[10px] text-slate-600 font-medium"
                    >
                      {kw}
                    </span>
                  ))}
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-indigo-600">
                  <span>View Providers</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
