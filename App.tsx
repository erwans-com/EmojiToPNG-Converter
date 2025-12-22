import React, { useEffect, useState } from 'react';
import { HashRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { EmojiDatabase } from './components/EmojiDatabase';
import { EmojiPage } from './components/EmojiPage';
import { AdminPage } from './components/AdminPage';
import { fetchEmojis } from './services/api';
import { EmojiRecord } from './types';
import { Menu, ChevronRight } from 'lucide-react';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const pathSegments = location.pathname.split('/').filter(Boolean);
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen w-full bg-white text-[#37352F] overflow-hidden">
        {/* Mobile Toggle */}
        {!isSidebarOpen && (
             <div className="fixed top-4 left-4 z-50 md:hidden">
                <button onClick={() => setSidebarOpen(true)} className="p-2 hover:bg-gray-100 rounded">
                    <Menu size={20} />
                </button>
             </div>
        )}

        {/* Sidebar */}
        <div className={`${isSidebarOpen ? 'block' : 'hidden'} md:block h-full shadow-xl md:shadow-none z-40 absolute md:relative`}>
            <Sidebar />
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col h-full overflow-hidden relative">
            {/* Top Bar / Breadcrumbs */}
            <div className="h-11 flex items-center px-4 sticky top-0 bg-white z-20 transition-opacity duration-200">
                 <div className="flex items-center gap-1 text-sm text-[#37352F] overflow-hidden whitespace-nowrap">
                    {/* Toggle Sidebar Button (Desktop) */}
                    <button 
                        onClick={() => setSidebarOpen(!isSidebarOpen)} 
                        className="p-1 mr-2 hover:bg-[#E9E9E7] rounded text-[#9B9A97] hidden md:block"
                        title={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
                    >
                        {isSidebarOpen ? <Menu size={16} /> : <ChevronRight size={16} />}
                    </button>

                    <Link to="/" className="flex items-center gap-1 hover:bg-[#E9E9E7] px-1.5 py-0.5 rounded transition-colors text-inherit decoration-0">
                         <span>🗃️</span>
                         <span className="underline decoration-transparent hover:decoration-[#37352F]">Emoji PNG Converter</span>
                    </Link>
                    
                    {pathSegments.length > 0 && (
                        <>
                            <span className="text-[#9B9A97] text-xs">/</span>
                            <span className="px-1.5 py-0.5 font-medium truncate">
                                {decodeURIComponent(pathSegments[pathSegments.length - 1])}
                            </span>
                        </>
                    )}
                 </div>
                 
                 <div className="flex-grow"></div>
                 
                 <div className="flex items-center gap-3 text-[#37352F] text-sm">
                     <span className="hover:bg-[#E9E9E7] px-2 py-0.5 rounded cursor-pointer transition-colors">Share</span>
                     <span className="hover:bg-[#E9E9E7] px-2 py-0.5 rounded cursor-pointer transition-colors">...</span>
                 </div>
            </div>

            {/* Scrollable Page Content */}
            <div className="flex-1 overflow-y-auto w-full">
                {children}
            </div>
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
        // Ensure we stop loading state even on catastrophic failure
        setData([]);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<EmojiDatabase data={data} isLoading={loading} />} />
          <Route path="/emoji/:slug" element={<EmojiPage data={data} />} />
          <Route path="/admin" element={<AdminPage />} />
        </Routes>
      </Layout>
    </Router>
  );
}