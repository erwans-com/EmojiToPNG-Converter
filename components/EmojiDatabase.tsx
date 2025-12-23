import React, { useState, useMemo } from 'react';
import { EmojiRecord } from '../types';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';

interface Props {
  data: EmojiRecord[];
  isLoading: boolean;
}

export const EmojiDatabase: React.FC<Props> = ({ data, isLoading }) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('All');

  // Extract Categories and sort by count (descending)
  const categories = useMemo(() => {
      const counts: Record<string, number> = {};
      
      data.forEach(item => {
          if (item.category) {
              counts[item.category] = (counts[item.category] || 0) + 1;
          }
      });

      const sortedCats = Object.keys(counts).sort((a, b) => counts[b] - counts[a]);
      
      return ['All', ...sortedCats];
  }, [data]);

  const filteredData = data.filter(item => {
    const matchesSearch = 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        item.emoji.includes(searchTerm) ||
        (typeof item.info === 'string' && item.info.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = activeTab === 'All' || item.category === activeTab;

    return matchesSearch && matchesCategory;
  });

  if (isLoading) {
    return (
        <div className="p-12 space-y-4 max-w-[1000px] mx-auto">
             <div className="h-8 bg-gray-200 rounded w-1/3 animate-pulse"></div>
             <div className="h-4 bg-gray-100 rounded w-1/4 animate-pulse"></div>
             <div className="mt-8 space-y-2">
                 {[...Array(10)].map((_, i) => (
                     <div key={i} className="h-10 bg-gray-50 rounded w-full animate-pulse"></div>
                 ))}
             </div>
        </div>
    )
  }

  return (
    <div className="max-w-[1000px] mx-auto pb-24">
      {/* Page Header */}
      <div className="group relative pt-12 pb-8 px-4 md:px-24">
        <div className="text-6xl md:text-7xl mb-6">🗃️</div>
        <h1 className="text-3xl md:text-4xl font-bold text-[#37352F] notion-serif mb-4">Emoji to PNG Converter – Free Emoji PNG Downloads</h1>
        
        <div className="flex items-center text-[#787774] space-x-4 text-sm border-b border-[#E9E9E7] pb-4">
            <span className="bg-[#efefef] px-2 py-1 rounded cursor-pointer transition-colors block w-fit">
                Convert any emoji to a high-resolution PNG with transparent background.
                <span className="hidden md:inline"> Free emoji PNG downloads from a public library of 1,600+ emojis, perfect for designers, developers, and content creators.</span>
            </span>
        </div>
      </div>

      {/* Tabs / Categories */}
      <div className="px-4 md:px-24 mb-6">
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 mask-linear">
              {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setActiveTab(cat)}
                    className={`whitespace-nowrap px-3 py-1.5 rounded-md text-sm font-medium transition-colors border ${
                        activeTab === cat 
                        ? 'bg-[#E9E9E7] text-[#37352F] border-[#d4d4d4]' 
                        : 'text-[#787774] hover:bg-[#F7F7F5] border-transparent hover:border-[#E9E9E7]'
                    }`}
                  >
                      {cat}
                  </button>
              ))}
          </div>
      </div>

      {/* Database Controls (Search Only) */}
      <div className="px-4 md:px-24 mb-0 flex items-center sticky top-0 bg-white z-10 py-3 border-b border-[#E9E9E7]">
         <div className="relative w-full">
            <Search size={14} className="absolute left-2 top-1/2 transform -translate-y-1/2 text-[#9B9A97]" />
            <input 
                type="text" 
                placeholder="Search emojis..." 
                className="pl-7 pr-2 py-1.5 text-sm border border-[#E9E9E7] rounded-sm focus:outline-none focus:ring-1 focus:ring-blue-400 placeholder-[#9B9A97] w-full bg-[#F7F7F5] focus:bg-white transition-colors"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
         </div>
      </div>

      {/* Database Table */}
      <div className="px-4 md:px-24">
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse table-fixed">
                <thead>
                    <tr className="border-b border-[#E9E9E7] text-xs font-semibold text-[#787774]">
                        <th className="py-2 pr-4 font-normal w-[60%] md:w-[30%]">
                            <div className="flex items-center gap-1 hover:bg-[#efefef] w-fit px-1 py-0.5 rounded cursor-pointer">Aa Name</div>
                        </th>
                        <th className="py-2 pr-4 font-normal w-[20%] md:w-[10%]">
                            <div className="flex items-center gap-1 hover:bg-[#efefef] w-fit px-1 py-0.5 rounded cursor-pointer">Icon</div>
                        </th>
                        <th className="hidden md:table-cell py-2 pr-4 font-normal w-[25%]">
                            <div className="flex items-center gap-1 hover:bg-[#efefef] w-fit px-1 py-0.5 rounded cursor-pointer">Category</div>
                        </th>
                        <th className="hidden lg:table-cell py-2 font-normal">
                            <div className="flex items-center gap-1 hover:bg-[#efefef] w-fit px-1 py-0.5 rounded cursor-pointer">Info</div>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {filteredData.map((record) => (
                        <tr 
                            key={record.id} 
                            onClick={() => navigate(`/emoji/${record.slug}`)}
                            className="group border-b border-[#E9E9E7] hover:bg-[rgba(55,53,47,0.04)] cursor-pointer transition-colors"
                        >
                            <td className="py-2 pr-4 text-sm font-medium text-[#37352F] truncate">
                                <span className="border-b border-[#E9E9E7] group-hover:border-[#37352F] pb-[1px] transition-colors">
                                    {record.name}
                                </span>
                            </td>
                            <td className="py-2 pr-4 text-2xl">{record.emoji}</td>
                            <td className="hidden md:table-cell py-2 pr-4">
                                <span className="inline-block px-1.5 py-0.5 rounded bg-[#F1F0EF] text-[#37352F] text-xs whitespace-nowrap">
                                    {record.category || 'General'}
                                </span>
                            </td>
                            <td className="hidden lg:table-cell py-2 text-sm text-[#9B9A97]">
                                <div className="truncate w-full text-xs">
                                    {typeof record.info === 'string' ? record.info : '-'}
                                </div>
                            </td>
                        </tr>
                    ))}
                    {filteredData.length === 0 && (
                        <tr>
                            <td colSpan={4} className="py-12 text-center text-[#9B9A97] text-sm">
                                <p>No emojis found matching "{searchTerm}"</p>
                                {activeTab !== 'All' && <p className="text-xs mt-1">Try switching categories or clearing filters.</p>}
                            </td>
                        </tr>
                    )}
                </tbody>
                <tfoot>
                    <tr>
                        <td colSpan={4} className="py-3 text-right text-xs text-[#9B9A97] border-t border-[#E9E9E7]">
                            Count: {filteredData.length}
                        </td>
                    </tr>
                </tfoot>
            </table>
        </div>
      </div>
    </div>
  );
};