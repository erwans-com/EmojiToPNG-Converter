const fs = require('fs');
const path = require('path');

const DOMAIN = 'https://www.emojitopng.com';
const CSV_FILE = path.join(__dirname, '..', 'emojis.csv');
const PUBLIC_DIR = path.join(__dirname, '..', 'public');
const SITEMAP_FILE = path.join(PUBLIC_DIR, 'sitemap.xml');

// High priority emojis to include in sitemap
const CURATED_LIST = `
✨ 👉 🔥 ✅ 💡 🚀 🌟 👇 🎉 ❤️ 📌 💪 💬 👀 🔗 🚨 🌿 🌍 💥 ✔️ 📅 🎯 ⚡ 🤔 ➡️ 🙌 🧠 💫 💙 🌱
😂 😭 🥺 ❤️‍🩹 🫶 🤍 🩷 🧡 💛 💚 💜 🖤 💔 💕 💖 💗 💓 💞 💘 💝
😍 🥰 😘 😗 😙 😚 😊 😄 😃 😀 😁 😆 😉 😋 😛 😜 🤪 😎 🤩 🥳 😇 🤗
😅 🤣 🙂 🙃 😌 😍 🤤 😴 😪 😮 😯 😲 😳 🥵 🥶 😱 😨 😰 😓 😥 😢 😤 😠 😡 🤬
🙏 🤝 👍 👎 👏 🤲 🫶 ✌️ 🤟 🤘 🤙 👌 🤌 ✋ 🖐️ 🖖 🤚 🫱 🫲 👊 ✊ 🤛 🤜
🫡 🫠 🥹 😶‍🌫️ 🤐 😶 😑 😬 🙄 😒 😏 😔 😞 😟 ☹️ 🙁
💯 ✅ ✔️ ✖️ ❌ ⚠️ ⛔ 🚫 ❓ ❗ ⁉️ ‼️ 🔥 ⭐ 🌟 ✨ 🌈 ☀️ 🌙 🌧️ ⛈️ ❄️
🎁 🎄 🎃 🎀 🎈 🎂 🥂 🍾 🍻 🍺 ☕ 🍕 🍔 🍟 🌮 🌯 🍣 🍜 🍩 🍪 🍫 🍓 🍉 🍌 🍎
⚽ 🏆 🥇 🥈 🥉 🎮 🎧 🎵 🎶 📷 📸 🎬 📝 📌 📍 🧾 📣 🔥 💡 🔔
📱 💻 ⌚ 🕒 ⏰ 🗓️ 📅 🧭 🔎 🔍 🔑 🔒 🔓 🧠 💬 🗣️ 👤 👥
🚗 ✈️ 🚀 🚲 🚌 🚆 🚇 🚢 🌍 🗺️ 📍
🐶 🐱 🐻 🐼 🐨 🐸 🐵 🦊 🐯 🦁 🐮 🐷 🐰 🐔 🐧 🐦 🐤 🐣 🐙 🐠 🐳 🐬 🦋
🌿 🌱 🌳 🌲 🌵 🌸 🌺 🌻 🌼 🌹 🍀 🌊 🔥
`;

// Helper to slugify text
const toSlug = (text) => {
  if (!text) return '';
  return text.toLowerCase()
    .replace(/ & /g, '-')
    .replace(/ /g, '-')
    .replace(/[^\w-]+/g, '');
};

// Robust CSV Line Parser to handle quoted commas correctly
const parseCSVLine = (text) => {
    const result = [];
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
};

// Ensure public directory exists
if (!fs.existsSync(PUBLIC_DIR)) {
    fs.mkdirSync(PUBLIC_DIR, { recursive: true });
}

try {
    const csvData = fs.readFileSync(CSV_FILE, 'utf8');
    const lines = csvData.split(/\r?\n/);
    
    // Create a Set of target emojis for O(1) lookup
    // Using spread operator [...] on string handles emoji surrogate pairs correctly
    const targetEmojis = new Set([...CURATED_LIST.replace(/\s/g, '')]);
    
    const matchedEmojis = [];
    const validCategories = new Set();

    // Skip headers (assuming first row is header)
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const cols = parseCSVLine(line);

        // CSV Structure from code: 
        // 0: slug, 1: emoji, 2: name, ... 8: category, 9: group
        if (cols.length < 9) continue;

        let slug = cols[0];
        let emojiChar = cols[1];
        let category = cols[8];

        // Cleanup
        if (slug) slug = slug.replace(/^"|"$/g, '').trim();
        if (emojiChar) emojiChar = emojiChar.replace(/^"|"$/g, '').trim();
        if (category) category = category.replace(/^"|"$/g, '').trim();

        // Skip invalid rows
        if (!slug || slug.toLowerCase() === 'slug' || !emojiChar) continue;

        // Add Categories (Validation to ensure clean category names)
        if (category && category.length < 30 && !category.includes('{') && !category.includes('[')) {
            validCategories.add(category);
        }

        // Check if this emoji is in our curated list
        if (targetEmojis.has(emojiChar)) {
            matchedEmojis.push(slug);
        }
    }

    console.log(`Parsed CSV. Found ${matchedEmojis.length} curated emojis out of requested set.`);
    console.log(`Found ${validCategories.size} unique categories.`);

    // 1. Static Routes
    const urls = [
        { loc: `${DOMAIN}/`, freq: 'daily', priority: '1.0' },
    ];

    // 2. Category Routes
    validCategories.forEach(cat => {
        const slug = toSlug(cat);
        if (slug) {
            urls.push({
                loc: `${DOMAIN}/category/${slug}`,
                freq: 'weekly',
                priority: '0.9'
            });
        }
    });

    // 3. Dynamic Routes (Based on Curated List)
    matchedEmojis.forEach(slug => {
        urls.push({
            loc: `${DOMAIN}/emoji/${slug}`,
            freq: 'weekly',
            priority: '0.8'
        });
    });

    const sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>${u.freq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

    fs.writeFileSync(SITEMAP_FILE, sitemapContent);
    console.log(`Sitemap generated successfully at ${SITEMAP_FILE} with ${urls.length} entries.`);

} catch (error) {
    console.error('Error generating sitemap:', error);
    process.exit(1);
}