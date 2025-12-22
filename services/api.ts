import { EmojiRecord } from '../types';

const STORAGE_KEY = 'emoji_db_csv';

export const fetchEmojis = async (): Promise<EmojiRecord[]> => {
  // 1. Try fetching from LocalStorage first (User imported data)
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    console.log("Loaded emojis from local storage.");
    return parseCSV(stored);
  }

  // 2. Fallback to static CSV file
  try {
    const response = await fetch('/emojis.csv');
    if (!response.ok) {
      throw new Error(`Failed to fetch CSV: ${response.statusText}`);
    }
    const csvText = await response.text();
    return parseCSV(csvText);
  } catch (error) {
    console.error("Failed to fetch emojis:", error);
    return [];
  }
};

export const saveEmojisCSV = (csvText: string) => {
    localStorage.setItem(STORAGE_KEY, csvText);
};

export const clearEmojisData = () => {
    localStorage.removeItem(STORAGE_KEY);
};

function parseCSV(csvText: string): EmojiRecord[] {
  const lines = csvText.split(/\r?\n/);
  const data: EmojiRecord[] = [];
  
  // Skip the header row (index 0)
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    const cols = parseCSVLine(line);
    
    // Ensure we have enough columns (slug, emoji, name, etc.)
    if (cols.length < 3) continue;

    // CSV Header Mapping:
    // 0: slug
    // 1: emoji
    // 2: name
    // 3: description (info)
    // 4: trivia
    // 5: common_uses (JSON array string)
    // 6: related_emojis (JSON array string)
    // 7: updated_at
    // 8: category
    // 9: group

    let common_uses: string[] = [];
    try {
        if (cols[5]) {
            // Remove extra outer quotes if mostly clean, but JSON.parse handles standard JSON string
            // The parser below handles CSV escaping, so we should have a raw JSON string like ["a","b"]
            common_uses = JSON.parse(cols[5]);
        }
    } catch (e) {
        // Fallback if parsing fails, treat as single string or empty
        common_uses = cols[5] ? [cols[5]] : [];
    }

    let related_emojis: string[] = [];
    try {
        if (cols[6]) {
            related_emojis = JSON.parse(cols[6]);
        }
    } catch (e) {
        related_emojis = [];
    }

    data.push({
      id: i, // Use the row index as a stable ID
      slug: cols[0],
      emoji: cols[1],
      name: cols[2],
      info: cols[3],
      trivia: cols[4],
      common_uses: common_uses,
      related_emojis: related_emojis,
      updated_at: cols[7],
      category: cols[8],
      group: cols[9]
    });
  }
  
  // Sort by name for consistency
  return data.sort((a, b) => a.name.localeCompare(b.name));
}

// Robust CSV Line Parser that handles quoted fields containing commas
function parseCSVLine(text: string): string[] {
    const result: string[] = [];
    let curVal = "";
    let inQuote = false;
    
    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        
        if (inQuote) {
            if (char === '"') {
                // Check for escaped quote ("")
                if (i + 1 < text.length && text[i+1] === '"') {
                    curVal += '"';
                    i++; // Skip the next quote
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