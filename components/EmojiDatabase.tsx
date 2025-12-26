import React, { useMemo, useEffect } from 'react';
import { EmojiRecord } from '../types';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import { toSlug } from '../services/api';

interface Props {
  data: EmojiRecord[];
  isLoading: boolean;
}

export const EmojiDatabase: React.FC<Props> = ({ data, isLoading }) => {
  const navigate = useNavigate();
  const { slug } = useParams<{ slug: string }>();
  const [searchTerm, setSearchTerm] = React.useState('');

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

  // Determine active category from URL slug
  const activeCategory = useMemo(() => {
    if (!slug) return 'All';
    return categories.find(cat => toSlug(cat) === slug) || 'All';
  }, [slug, categories]);

  const filteredData = data.filter(item => {
    const matchesSearch = 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        item.emoji.includes(searchTerm) ||
        (typeof item.info === 'string' && item.info.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = activeCategory === 'All' || item.category === activeCategory;

    return matchesSearch && matchesCategory;
  });

  // Update Page Title and Meta Description based on Category
  useEffect(() => {
    const metaDescription = document.querySelector('meta[name="description"]');
    
    if (activeCategory === 'All') {
        document.title = "Emoji to PNG Converter | EmojiToPNG";
        if (metaDescription) {
            metaDescription.setAttribute('content', "Free online tool to convert any emoji into a high-resolution 1024px PNG image. Browse our database of 1600+ emojis. Perfect for graphic design, social media, Canva, and Figma.");
        }
    } else {
        document.title = `${activeCategory} Emojis - Free PNG Download | EmojiToPNG`;
        if (metaDescription) {
            metaDescription.setAttribute('content', `Browse our collection of ${activeCategory} emojis. Download high-resolution transparent PNGs for all ${activeCategory.toLowerCase()} icons free.`);
        }
    }
  }, [activeCategory]);

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
        <div className="text-6xl md:text-7xl mb-6">
            {activeCategory === 'All' ? '🗃️' : filteredData[0]?.emoji || '📂'}
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-[#37352F] notion-serif mb-4">
            {activeCategory === 'All' ? 'Emoji to PNG Converter – Free Emoji PNG Downloads' : `${activeCategory} Emojis`}
        </h1>
        
        <div className="flex items-center text-[#787774] space-x-4 text-sm border-b border-[#E9E9E7] pb-4">
            <span className="bg-[#efefef] px-2 py-1 rounded cursor-pointer transition-colors block w-fit">
                {activeCategory === 'All' ? (
                    <>
                        Convert any emoji to a high-resolution PNG with transparent background.
                        <span className="hidden md:inline"> Free emoji PNG downloads from a public library of 1,600+ emojis, perfect for designers, developers, and content creators.</span>
                    </>
                ) : (
                    `Browse ${filteredData.length} ${activeCategory.toLowerCase()} emojis and convert them to high-resolution PNGs.`
                )}
            </span>
        </div>
      </div>

      {/* Tabs / Categories */}
      <div className="px-4 md:px-24 mb-6">
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 mask-linear">
              {categories.map(cat => (
                  <Link
                    key={cat}
                    to={cat === 'All' ? '/' : `/category/${toSlug(cat)}`}
                    className={`whitespace-nowrap px-3 py-1.5 rounded-md text-sm font-medium transition-colors border block ${
                        activeCategory === cat 
                        ? 'bg-[#E9E9E7] text-[#37352F] border-[#d4d4d4]' 
                        : 'text-[#787774] hover:bg-[#F7F7F5] border-transparent hover:border-[#E9E9E7]'
                    }`}
                  >
                      {cat}
                  </Link>
              ))}
          </div>
      </div>

      {/* Database Controls (Search Only) */}
      <div className="px-4 md:px-24 mb-0 flex items-center sticky top-0 bg-white z-10 py-3 border-b border-[#E9E9E7]">
         <div className="relative w-full">
            <Search size={14} className="absolute left-2 top-1/2 transform -translate-y-1/2 text-[#9B9A97]" />
            <input 
                type="text" 
                placeholder={`Search ${activeCategory === 'All' ? 'emojis' : activeCategory}...`}
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
                                {activeCategory !== 'All' && <p className="text-xs mt-1">Try switching categories or clearing filters.</p>}
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