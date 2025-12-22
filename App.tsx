import React, { useEffect, useState } from 'react';
import { HashRouter as Router, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { EmojiDatabase } from './components/EmojiDatabase';
import { EmojiPage } from './components/EmojiPage';
import { AdminPage } from './components/AdminPage';
import { fetchEmojis } from './services/api';
import { EmojiRecord } from './types';
import { Shuffle, Database, LayoutGrid } from 'lucide-react';

const TopNavbar: React.FC<{ data: EmojiRecord[] }> = ({ data }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const pathSegments = location.pathname.split('/').filter(Boolean);

  const handleRandom = () => {
    if (data.length > 0) {
        const random = data[Math.floor(Math.random() * data.length)];
        navigate(`/emoji/${random.slug}`);
    }
  };

  return (
    <div className="h-14 flex items-center px-4 md:px-8 border-b border-[#E9E9E7] sticky top-0 bg-white/95 backdrop-blur-sm z-50">
         <div className="flex items-center gap-1 text-sm text-[#37352F] overflow-hidden whitespace-nowrap flex-1">
            <Link to="/" className="flex items-center gap-2 hover:bg-[#E9E9E7] px-2 py-1 rounded transition-colors text-inherit decoration-0">
                 <span className="text-lg">🧁</span>
                 <span className="font-semibold hidden sm:inline">EmojiToPNG</span>
            </Link>
            
            {pathSegments.length > 0 && (
                <>
                    <span className="text-[#9B9A97] text-xs">/</span>
                    <span className="px-1.5 py-0.5 font-medium truncate max-w-[100px] md:max-w-none">
                        {decodeURIComponent(pathSegments[pathSegments.length - 1])}
                    </span>
                </>
            )}
         </div>
         
         <div className="flex items-center gap-2 md:gap-4 text-[#37352F] text-sm">
             <Link to="/" className="flex items-center gap-1 hover:bg-[#E9E9E7] px-2 py-1.5 rounded cursor-pointer transition-colors">
                 <LayoutGrid size={16} />
                 <span className="hidden md:inline">Categories</span>
             </Link>
             <button 
                onClick={handleRandom}
                className="flex items-center gap-1.5 hover:bg-[#E9E9E7] px-3 py-1.5 rounded cursor-pointer transition-colors border border-[#E9E9E7] shadow-sm bg-white"
             >
                 <Shuffle size={14} />
                 <span className="hidden md:inline">Random Emoji</span>
                 <span className="md:hidden">Random</span>
             </button>
         </div>
    </div>
  );
};

export default function App() {
  const [data, setData] = useState<EmojiRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const records = await fetchEmojis();
        setData(records);
      } catch (e) {
        console.error("Critical failure loading emoji data:", e);
        setData([]);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  return (
    <Router>
      <div className="flex flex-col h-screen w-full bg-white text-[#37352F] overflow-hidden">
        <TopNavbar data={data} />
        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto w-full">
            <Routes>
              <Route path="/" element={<EmojiDatabase data={data} isLoading={loading} />} />
              <Route path="/emoji/:slug" element={<EmojiPage data={data} />} />
              <Route path="/admin" element={<AdminPage />} />
            </Routes>
        </div>
      </div>
    </Router>
  );
}