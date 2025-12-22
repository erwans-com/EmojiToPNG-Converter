import { EmojiRecord } from '../types';

const STORAGE_KEY = 'emoji_db_csv';

export const fetchEmojis = async (): Promise<EmojiRecord[]> => {
  // 1. Try fetching from LocalStorage first (User imported data)
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      console.log("Loading emojis from local storage...");
      const parsed = parseCSV(stored);
      if (parsed.length > 0) {
          return parsed;
      }
      console.warn("Local storage data found but parsed to empty array. Falling back.");
    }
  } catch (e) {
    console.error("Failed to parse local storage CSV:", e);
    // We do not return here, we let it fall back to the static file
  }

  // 2. Fallback to static CSV file
  try {
    const response = await fetch('/emojis.csv');
    if (!response.ok) {
      console.error(`Failed to fetch CSV: ${response.status} ${response.statusText}`);
      return [];
    }
    
    const csvText = await response.text();
    
    // Safety check: sometimes 404s return HTML
    if (csvText.trim().startsWith('<')) {
        console.error("Fetched content appears to be HTML (likely a 404 page), not CSV.");
        return [];
    }

    return parseCSV(csvText);
  } catch (error) {
    console.error("Failed to fetch emojis:", error);
    return [];
  }
};

export const saveEmojisCSV = (csvText: string) => {
    // Validate before saving
    try {
        const parsed = parseCSV(csvText);
        if (parsed.length === 0) {
            throw new Error("No valid emoji records found in the provided CSV.");
        }
        // If valid, save
        localStorage.setItem(STORAGE_KEY, csvText);
    } catch (e) {
        console.error("Validation failed:", e);
        throw e; // Re-throw to let UI know
    }
};

export const clearEmojisData = () => {
    localStorage.removeItem(STORAGE_KEY);
};

export function parseCSV(csvText: string): EmojiRecord[] {
  if (!csvText) return [];

  const lines = csvText.split(/\r?\n/);
  const data: EmojiRecord[] = [];
  
  // Skip the header row (index 0)
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    // Basic validation: line must contain at least a few commas
    if (line.split(',').length < 3) continue;

    try {
        const cols = parseCSVLine(line);
        
        // Ensure we have enough columns (slug, emoji, name)
        if (cols.length < 3) continue;

        // CSV Header Mapping (assumed):
        // 0: slug, 1: emoji, 2: name, 3: description, 4: trivia
        // 5: common_uses, 6: related_emojis, 7: updated_at, 8: category, 9: group

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
        console.warn(`Skipping invalid line ${i}:`, lineError);
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