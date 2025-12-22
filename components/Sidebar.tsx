import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Search, 
  Settings, 
  Plus, 
  ChevronRight, 
  FileText,
  Database,
  Shuffle
} from 'lucide-react';
import { fetchEmojis } from '../services/api';

export const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const MenuItem = ({ icon, label, onClick, active }: { icon: React.ReactNode, label: string, onClick?: () => void, active?: boolean }) => (
    <div 
      onClick={onClick}
      className={`group flex items-center gap-2 px-3 py-1 min-h-[28px] text-sm rounded-[3px] cursor-pointer select-none transition-colors
        ${active ? 'bg-[#37352F] bg-opacity-[0.08] text-[#37352F] font-medium' : 'text-[#5F5E5B] hover:bg-[#37352F] hover:bg-opacity-[0.08]'}`}
    >
      <span className="text-[#9B9A97] group-hover:text-[#5F5E5B]">{icon}</span>
      <span className="truncate">{label}</span>
    </div>
  );

  const handleRandom = async () => {
      const emojis = await fetchEmojis();
      if (emojis.length > 0) {
          const random = emojis[Math.floor(Math.random() * emojis.length)];
          navigate(`/emoji/${random.slug}`);
      }
  };

  return (
    <div className="w-60 bg-[#F7F7F5] border-r border-[#E9E9E7] flex flex-col h-full flex-shrink-0 transition-all duration-300 ease-in-out">
      {/* User / Workspace Switcher */}
      <div className="h-12 flex items-center px-4 hover:bg-[#37352F] hover:bg-opacity-[0.08] cursor-pointer transition-colors m-1 rounded-[3px]">
        <div className="w-5 h-5 bg-[#E16D46] rounded-[3px] flex items-center justify-center text-white text-xs font-bold mr-2">E</div>
        <span className="text-sm font-medium text-[#37352F] truncate">Emoji Workspace</span>
        <div className="flex-grow"></div>
        <div className="text-[#9B9A97] text-xs px-1 border border-[#9B9A97] rounded flex items-center h-4">Free</div>
      </div>

      {/* Main Navigation */}
      <div className="flex flex-col px-1 py-1">
        <MenuItem icon={<Search size={16} />} label="Search" />
        <MenuItem icon={<Settings size={16} />} label="Settings & members" />
      </div>

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto px-1 pt-2">
        <div className="mb-2">
            <div className="px-3 py-1 text-xs font-semibold text-[#9B9A97] mt-2 mb-1">Favorites</div>
            <MenuItem 
                icon={<FileText size={16} />} 
                label="Emoji Database" 
                onClick={() => navigate('/')}
                active={location.pathname === '/'}
            />
            <MenuItem 
                icon={<Shuffle size={16} />} 
                label="Random Emoji" 
                onClick={handleRandom}
            />
        </div>

        <div>
           <div className="px-3 py-1 text-xs font-semibold text-[#9B9A97] mt-4 mb-1">Workspace</div>
             <MenuItem 
                icon={<Database size={16} />} 
                label="Import Data" 
                onClick={() => navigate('/admin')}
                active={location.pathname === '/admin'}
            />
        </div>
      </div>
      
      {/* Bottom Actions */}
      <div className="border-t border-[#E9E9E7] p-1">
         <MenuItem icon={<Plus size={16} />} label="New page" />
      </div>
    </div>
  );
};