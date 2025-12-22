import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { EmojiRecord } from '../types';
import { Download, RefreshCw, Image as ImageIcon, Lightbulb, BookOpen, Hash, CornerDownRight, Copy, Check } from 'lucide-react';

interface Props {
  data: EmojiRecord[];
}

export const EmojiPage: React.FC<Props> = ({ data }) => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [record, setRecord] = useState<EmojiRecord | null>(null);
  const [pngDataUrl, setPngDataUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (data.length > 0 && slug) {
      const found = data.find(r => r.slug === slug);
      setRecord(found || null);
    }
  }, [data, slug]);

  const generateImage = (emoji: string) => {
    setIsGenerating(true);
    // Use a timeout to allow UI to update before heavy canvas op
    setTimeout(() => {
        const canvas = document.createElement('canvas');
        canvas.width = 1024;
        canvas.height = 1024;
        const ctx = canvas.getContext('2d');
        
        if (ctx) {
            // Clear
            ctx.clearRect(0, 0, 1024, 1024);
            
            // Draw
            // Font selection is crucial. We try standard system emoji fonts.
            ctx.font = '800px "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            
            // Adjust vertical alignment slightly as emojis often sit high
            ctx.fillText(emoji, 512, 580); 
            
            const dataUrl = canvas.toDataURL('image/png');
            setPngDataUrl(dataUrl);
        }
        setIsGenerating(false);
    }, 100);
  };

  useEffect(() => {
    if (record) {
      generateImage(record.emoji);
      setCopied(false);
    }
  }, [record]);

  const handleCopyEmoji = () => {
      if (record) {
          navigator.clipboard.writeText(record.emoji);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
      }
  };

  if (!record) {
    return (
        <div className="p-12 text-center text-[#9B9A97]">
             {data.length === 0 ? "Loading database..." : "Emoji not found."}
        </div>
    );
  }

  // Format helper for text lists
  const renderList = (data?: string | string[]) => {
      if (!data) return <p className="text-[#37352F] italic">No data available.</p>;
      
      let items: string[] = [];
      
      if (Array.isArray(data)) {
          items = data.map(String);
      } else if (typeof data === 'string') {
          items = data.split('\n');
      } else {
          // Fallback if data is number or object
          items = [String(data)];
      }

      items = items.filter(Boolean);

      if (items.length === 0) return <p className="text-[#37352F] italic">No data available.</p>;

      return (
          <ul className="list-disc list-inside space-y-1 text-[#37352F]">
              {items.map((item, i) => <li key={i}>{item.replace(/^- /, '')}</li>)}
          </ul>
      );
  };

  // Helper to get related emojis array safely
  const getRelatedEmojis = (related?: string | string[]) => {
      if (!related) return [];
      if (Array.isArray(related)) return related;
      if (typeof related === 'string') return related.split(',');
      return [];
  }

  const relatedList = getRelatedEmojis(record.related_emojis);

  return (
    <div className="max-w-[900px] mx-auto pb-24 animate-in fade-in duration-300">
      {/* Cover Image Placeholder */}
      <div className="h-[30vh] w-full bg-gradient-to-r from-pink-50 to-blue-50 relative group">
         <div className="absolute bottom-4 right-12 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 px-3 py-1 rounded shadow-sm text-xs text-[#37352F] cursor-pointer hover:bg-white border border-[#E9E9E7]">
             Change cover
         </div>
      </div>

      <div className="px-12 md:px-24 relative -mt-16">
        {/* Icon */}
        <div 
            onClick={handleCopyEmoji}
            className="text-8xl mb-4 select-none cursor-pointer filter drop-shadow-sm hover:scale-105 transition-transform origin-bottom-left w-fit relative group"
            title="Click to copy"
        >
            {record.emoji}
            <div className={`absolute -right-20 top-1/2 -translate-y-1/2 text-sm bg-black/80 text-white px-2 py-1 rounded transition-opacity ${copied ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                {copied ? <div className="flex items-center gap-1"><Check size={12} /> Copied</div> : <div className="flex items-center gap-1"><Copy size={12} /> Copy</div>}
            </div>
        </div>

        {/* Title */}
        <h1 className="text-4xl font-bold text-[#37352F] notion-serif mb-6 border-b border-transparent focus:border-[#E9E9E7] outline-none">
            "{record.name}" emoji PNG download {record.emoji}
        </h1>

        {/* Properties / Meta */}
        <div className="space-y-1 mb-12">
            <div className="flex items-center h-8 group">
                <div className="w-40 flex items-center gap-2 text-[#787774] text-sm">
                    <ImageIcon size={14} />
                    <span>Type</span>
                </div>
                <div className="flex-1">
                    <span className="px-1.5 py-0.5 bg-[#E3E2E0] text-[#32302C] text-sm rounded">PNG 1024px</span>
                </div>
            </div>
            <div className="flex items-center h-8 group">
                <div className="w-40 flex items-center gap-2 text-[#787774] text-sm">
                    <span className="text-xs border border-[#787774] rounded px-[3px] font-mono">#</span>
                    <span>Unicode</span>
                </div>
                <div className="flex-1">
                     <span className="text-[#37352F] text-sm font-mono bg-[rgba(227,226,224,0.5)] px-1 rounded">
                        {record.emoji.codePointAt(0)?.toString(16).toUpperCase()}
                     </span>
                </div>
            </div>
             <div className="flex items-center h-8 group">
                <div className="w-40 flex items-center gap-2 text-[#787774] text-sm">
                    <Hash size={14} />
                    <span>Category</span>
                </div>
                <div className="flex-1">
                     <span className="px-1.5 py-0.5 bg-orange-100 text-orange-800 text-sm rounded">
                        {record.category || 'Standard'}
                     </span>
                </div>
            </div>
        </div>

        <hr className="border-[#E9E9E7] mb-12" />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
             {/* Left Column: Generator (Top-Left on Desktop) */}
             <div>
                 <div className="bg-white border border-[#E9E9E7] rounded-lg shadow-sm p-4">
                    <div className="bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-gray-50 border border-[#E9E9E7] rounded flex items-center justify-center p-8 aspect-square relative overflow-hidden group">
                        {isGenerating ? (
                            <div className="flex flex-col items-center gap-2 text-[#9B9A97]">
                                <RefreshCw className="animate-spin" />
                                <span className="text-sm">Rendering...</span>
                            </div>
                        ) : pngDataUrl ? (
                            <img 
                                src={pngDataUrl} 
                                alt={`${record.name} High Res`} 
                                className="w-full h-full object-contain filter drop-shadow-md transition-transform duration-300 group-hover:scale-105"
                            />
                        ) : (
                            <span className="text-red-400">Error</span>
                        )}
                        <div className="absolute bottom-2 right-2 bg-black/10 text-black/50 text-[10px] px-1.5 py-0.5 rounded backdrop-blur-sm">1024x1024</div>
                    </div>
                    
                    <div className="mt-4 flex flex-col gap-2">
                         {pngDataUrl && (
                             <a 
                                href={pngDataUrl} 
                                download={`${record.slug || 'emoji'}.png`}
                                className="flex items-center justify-center gap-2 px-4 py-2 bg-[#2383E2] text-white hover:bg-[#1d70c2] rounded shadow-sm font-medium transition-colors w-full"
                             >
                                <Download size={16} />
                                Download PNG
                            </a>
                        )}
                        <button 
                            onClick={() => generateImage(record.emoji)}
                            className="flex items-center justify-center gap-2 px-4 py-2 text-sm text-[#37352F] hover:bg-[#F7F7F5] rounded transition-colors font-medium w-full border border-transparent hover:border-[#E9E9E7]"
                        >
                            <RefreshCw size={14} />
                            Regenerate
                        </button>
                    </div>
                </div>
            </div>

            {/* Right Column: Description */}
            <div className="space-y-6">
                <section>
                    <h2 className="text-xl font-semibold text-[#37352F] notion-serif flex items-center gap-2 mb-4">
                        <BookOpen size={20} className="text-[#E16D46]" />
                        Description
                    </h2>
                    <div className="text-[#37352F] leading-relaxed">
                        {record.info || "No description available for this emoji."}
                    </div>
                </section>
            </div>
        </div>

        {/* Bottom Content Blocks */}
        <div className="space-y-12">
             {/* Common Uses */}
             <section>
                <h2 className="text-xl font-semibold text-[#37352F] notion-serif flex items-center gap-2 mb-4">
                    <CornerDownRight size={20} className="text-[#E16D46]" />
                    Common Uses
                </h2>
                <div className="pl-4 border-l-2 border-[#E16D46] bg-[#F7F7F5] py-2 rounded-r">
                   {renderList(record.common_uses)}
                </div>
            </section>

             {/* Trivia */}
             <section>
                <h2 className="text-xl font-semibold text-[#37352F] notion-serif flex items-center gap-2 mb-3">
                    <Lightbulb size={20} className="text-[#E16D46]" />
                    Trivia
                </h2>
                <div className="text-sm text-[#37352F] bg-yellow-50 p-4 rounded border border-yellow-100 italic">
                    {renderList(record.trivia)}
                </div>
            </section>
            
             {/* Related Emojis */}
            {relatedList.length > 0 && (
                <section>
                     <h2 className="text-xl font-semibold text-[#37352F] notion-serif mb-4">Related</h2>
                     <div className="flex flex-wrap gap-2">
                         {relatedList.map((e, i) => (
                             <span key={i} className="text-2xl cursor-pointer hover:bg-[#E9E9E7] p-2 rounded transition-colors" title="Click to view">
                                 {e.trim()}
                             </span>
                         ))}
                     </div>
                </section>
            )}
        </div>
        
        <div className="mt-20 pt-8 border-t border-[#E9E9E7] text-center text-[#9B9A97] text-xs">
            <p>Emoji content provided by Supabase • {record.emoji} • Fetched for static display</p>
        </div>
      </div>
    </div>
  );
};