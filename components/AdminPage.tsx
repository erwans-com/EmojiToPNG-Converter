import React, { useState, useRef } from 'react';
import { saveEmojisCSV, clearEmojisData } from '../services/api';
import { Save, Trash2, Database, Upload } from 'lucide-react';

export const AdminPage: React.FC = () => {
  const [csvContent, setCsvContent] = useState('');
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImport = () => {
    if (!csvContent.trim()) {
        setStatus('error');
        return;
    }
    try {
        saveEmojisCSV(csvContent);
        setStatus('success');
        // Reload to reflect changes
        setTimeout(() => window.location.reload(), 1000);
    } catch (e) {
        console.error(e);
        setStatus('error');
    }
  };

  const handleClear = () => {
      if(window.confirm("Are you sure you want to clear the local database and revert to the default file?")) {
          clearEmojisData();
          window.location.reload();
      }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setCsvContent(content);
    };
    reader.readAsText(file);
    
    // Reset input so same file can be selected again if needed
    event.target.value = '';
  };

  return (
    <div className="max-w-[900px] mx-auto pb-24 px-12 md:px-24 pt-[10vh]">
      <div className="flex items-center gap-4 mb-8">
         <div className="p-3 bg-[#E9E9E7] rounded text-[#37352F]">
             <Database size={32} />
         </div>
         <div>
            <h1 className="text-3xl font-bold text-[#37352F] notion-serif">Database Management</h1>
            <p className="text-[#9B9A97] text-sm mt-1">Import new emoji data via CSV</p>
         </div>
      </div>

      <div className="bg-white border border-[#E9E9E7] rounded-md shadow-sm p-6 mb-8">
          <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-[#37352F]">
                  CSV Content
              </label>
              <div>
                  <input 
                      type="file" 
                      accept=".csv,text/csv" 
                      className="hidden" 
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                  />
                  <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-2 px-3 py-1.5 text-xs bg-[#F7F7F5] hover:bg-[#E9E9E7] text-[#37352F] rounded border border-[#E9E9E7] transition-colors"
                  >
                      <Upload size={14} />
                      Upload CSV File
                  </button>
              </div>
          </div>

          <textarea 
            className="w-full h-64 p-3 border border-[#E9E9E7] rounded font-mono text-xs bg-[#F7F7F5] focus:outline-none focus:ring-2 focus:ring-[#2383E2] resize-y"
            placeholder="slug,emoji,name,description..."
            value={csvContent}
            onChange={(e) => setCsvContent(e.target.value)}
          />
          
          <div className="flex items-center justify-between mt-4">
              <button 
                onClick={handleClear}
                className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded transition-colors"
              >
                  <Trash2 size={16} />
                  Reset to Default
              </button>

              <button 
                onClick={handleImport}
                className="flex items-center gap-2 px-4 py-2 bg-[#2383E2] text-white text-sm font-medium rounded hover:bg-[#1d70c2] transition-colors"
              >
                  <Save size={16} />
                  Save & Apply
              </button>
          </div>

          {status === 'success' && (
              <div className="mt-4 p-3 bg-green-50 text-green-700 text-sm rounded border border-green-200">
                  Successfully imported data! Reloading...
              </div>
          )}
          {status === 'error' && (
              <div className="mt-4 p-3 bg-red-50 text-red-700 text-sm rounded border border-red-200">
                  Error importing data. Please check content.
              </div>
          )}
      </div>
      
      <div className="text-[#9B9A97] text-xs">
          <p>Note: Data is saved to your browser's Local Storage. Clearing your cache will revert to the default dataset.</p>
      </div>
    </div>
  );
};