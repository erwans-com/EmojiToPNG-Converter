import { EmojiRecord } from '../types';
// @ts-ignore
import defaultCsvData from '../emojis.csv?raw';

const STORAGE_KEY_CSV = 'emoji_db_csv';

export const fetchEmojis = async (): Promise<EmojiRecord[]> => {
  // 1. Try fetching from LocalStorage CSV (User imported data manually via Admin)
  try {
    const stored = localStorage.getItem(STORAGE_KEY_CSV);
    if (stored) {
      console.log("Loading emojis from local storage CSV...");
      const parsed = parseCSV(stored);
      if (parsed.length > 0) {
          return parsed;
      }
    }
  } catch (e) {
    console.error("Failed to parse local storage CSV:", e);
  }

  // 2. Fallback to bundled CSV file (Vite raw import)
  try {
    if (defaultCsvData) {
        return parseCSV(defaultCsvData);
    }
  } catch (error) {
    console.error("Failed to load bundled emojis:", error);
  }

  return [];
};

export const saveEmojisCSV = (csvText: string) => {
    // Validate before saving
    try {
        const parsed = parseCSV(csvText);
        if (parsed.length === 0) {
            throw new Error("No valid emoji records found in the provided CSV.");
        }
        // If valid, save
        localStorage.setItem(STORAGE_KEY_CSV, csvText);
    } catch (e) {
        console.error("Validation failed:", e);
        throw e; // Re-throw to let UI know
    }
};

export const clearEmojisData = () => {
    localStorage.removeItem(STORAGE_KEY_CSV);
};

export function parseCSV(csvText: string): EmojiRecord[] {
  if (!csvText) return [];

  const lines = csvText.split(/\r?\n/);
  const data: EmojiRecord[] = [];
  
  // Skip the header row (index 0)
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    // Basic validation
    if (line.split(',').length < 3) continue;

    try {
        const cols = parseCSVLine(line);
        
        // Skip lines that look like duplicate headers
        if (cols[0] === 'slug' && cols[1] === 'emoji') continue;
        
        if (cols.length < 3) continue;

        let common_uses: string[] = [];
        try {
            if (cols[5]) {
                const cleaned = cols[5].replace(/^"|"$/g, '').replace(/""/g, '"');
                if (cleaned.startsWith('[')) {
                    common_uses = JSON.parse(cleaned);
                } else {
                    common_uses = [cols[5]];
                }
            }
        } catch (e) {
            common_uses = cols[5] ? [cols[5]] : [];
        }

        let related_emojis: string[] = [];
        try {
            if (cols[6]) {
                const cleaned = cols[6].replace(/^"|"$/g, '').replace(/""/g, '"');
                if (cleaned.startsWith('[')) {
                    related_emojis = JSON.parse(cleaned);
                } else {
                    related_emojis = cols[6].split(',').map(s => s.trim());
                }
            }
        } catch (e) {
            related_emojis = [];
        }

        data.push({
          id: i,
          slug: cols[0] || `emoji-${i}`,
          emoji: cols[1] || '❓',
          name: cols[2] || 'Unknown',
          info: cols[3] || '',
          trivia: cols[4] || '',
          common_uses: common_uses,
          related_emojis: related_emojis,
          updated_at: cols[7],
          category: cols[8],
          group: cols[9]
        });
    } catch (lineError) {
        continue;
    }
  }
  
  return data.sort((a, b) => a.name.localeCompare(b.name));
}

function parseCSVLine(text: string): string[] {
    const result: string[] = [];
    let curVal = "";
    let inQuote = false;
    
    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        
        if (inQuote) {
            if (char === '"') {
                if (i + 1 < text.length && text[i+1] === '"') {
                    curVal += '"';
                    i++; 
                } else {
                    inQuote = false;
                }
            } else {
                curVal += char;
            }
        } else {
            if (char === '"') {
                inQuote = true;
            } else if (char === ',') {
                result.push(curVal);
                curVal = "";
            } else {
                curVal += char;
            }
        }
    }
    result.push(curVal);
    return result;
}

export const toSlug = (text: string): string => {
  return text.toLowerCase()
    .replace(/ & /g, '-')
    .replace(/ /g, '-')
    .replace(/[^\w-]+/g, '');
};