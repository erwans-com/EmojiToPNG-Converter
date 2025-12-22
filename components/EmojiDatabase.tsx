import React, { useState } from 'react';
import { EmojiRecord } from '../types';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, ArrowUpDown, MoreHorizontal } from 'lucide-react';

interface Props {
  data: EmojiRecord[];
  isLoading: boolean;
}

export const EmojiDatabase: React.FC<Props> = ({ data, isLoading }) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredData = data.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    item.emoji.includes(searchTerm) ||
    (typeof item.info === 'string' && item.info.toLowerCase().includes(searchTerm.toLowerCase())) ||
    item.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
        <div className="p-12 space-y-4">
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
    <div className="max-w-[900px] mx-auto pb-24">
      {/* Page Header */}
      <div className="group relative pt-[10vh] pb-8 px-12 md:px-24">
        <div className="text-7xl mb-6">🗃️</div>
        <h1 className="text-4xl font-bold text-[#37352F] notion-serif mb-4">Emoji PNG Converter</h1>
        
        <div className="flex items-center text-[#787774] space-x-4 text-sm border-b border-[#E9E9E7] pb-4">
            <span className="hover:bg-[#efefef] px-2 py-1 rounded cursor-pointer transition-colors">
                Convert any emoji to a high-resolution PNG file. Public database of 1635 emojis in PNG.
            </span>
        </div>
      </div>

      {/* Database Controls */}
      <div className="px-12 md:px-24 mb-4 flex items-center justify-between sticky top-0 bg-white z-10 py-2 border-b border-[#E9E9E7]">
         <div className="flex items-center gap-2">
             <div className="flex items-center gap-1 text-sm text-[#37352F] hover:bg-[#efefef] px-2 py-1 rounded cursor-pointer">
                 <Filter size={14} />
                 <span>Filter</span>
             </div>
             <div className="flex items-center gap-1 text-sm text-[#37352F] hover:bg-[#efefef] px-2 py-1 rounded cursor-pointer">
                 <ArrowUpDown size={14} />
                 <span>Sort</span>
             </div>
         </div>
         <div className="flex items-center gap-2">
            <div className="relative">
                <Search size={14} className="absolute left-2 top-1/2 transform -translate-y-1/2 text-[#9B9A97]" />
                <input 
                    type="text" 
                    placeholder="Search..." 
                    className="pl-7 pr-2 py-1 text-sm border border-[#E9E9E7] rounded-sm focus:outline-none focus:ring-1 focus:ring-blue-400 placeholder-[#9B9A97] w-48"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <div className="hover:bg-[#efefef] p-1 rounded cursor-pointer text-[#37352F]">
                <MoreHorizontal size={16} />
            </div>
            <button className="bg-[#2383E2] text-white text-sm px-3 py-1 rounded hover:bg-[#1d70c2] transition-colors">
                New
            </button>
         </div>
      </div>

      {/* Database Table */}
      <div className="px-12 md:px-24 overflow-x-auto">
        <table className="w-full text-left border-collapse">
            <thead>
                <tr className="border-b border-[#E9E9E7] text-xs font-semibold text-[#787774]">
                    <th className="py-2 pr-4 font-normal w-1/3">
                        <div className="flex items-center gap-1 hover:bg-[#efefef] w-fit px-1 py-0.5 rounded cursor-pointer">Aa Name</div>
                    </th>
                    <th className="py-2 pr-4 font-normal w-16">
                         <div className="flex items-center gap-1 hover:bg-[#efefef] w-fit px-1 py-0.5 rounded cursor-pointer">Icon</div>
                    </th>
                    <th className="py-2 pr-4 font-normal w-1/4">
                        <div className="flex items-center gap-1 hover:bg-[#efefef] w-fit px-1 py-0.5 rounded cursor-pointer">Category</div>
                    </th>
                    <th className="py-2 font-normal">
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
                        <td className="py-2 pr-4 text-sm font-medium text-[#37352F]">
                            <span className="border-b border-[#E9E9E7] group-hover:border-[#37352F] pb-[1px]">{record.name}</span>
                        </td>
                        <td className="py-2 pr-4 text-xl">{record.emoji}</td>
                        <td className="py-2 pr-4">
                            <span className="inline-block px-1.5 py-0.5 rounded bg-[#F1F0EF] text-[#37352F] text-xs">
                                {record.category || 'General'}
                            </span>
                        </td>
                         <td className="py-2 text-sm text-[#9B9A97]">
                             <div className="truncate w-32 text-xs">
                                 {typeof record.info === 'string' ? record.info : '-'}
                             </div>
                        </td>
                    </tr>
                ))}
                {filteredData.length === 0 && (
                    <tr>
                        <td colSpan={4} className="py-8 text-center text-[#9B9A97] text-sm">
                            No emojis found matching "{searchTerm}"
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
  );
};