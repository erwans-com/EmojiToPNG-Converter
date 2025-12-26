const fs = require('fs');
const path = require('path');

const DOMAIN = 'https://www.emojitopng.com';
const CSV_FILE = path.join(__dirname, '..', 'emojis.csv');
const PUBLIC_DIR = path.join(__dirname, '..', 'public');
const SITEMAP_FILE = path.join(PUBLIC_DIR, 'sitemap.xml');

// Helper to slugify category
const toSlug = (text) => {
  return text.toLowerCase()
    .replace(/ & /g, '-')
    .replace(/ /g, '-')
    .replace(/[^\w-]+/g, '');
};

// Ensure public directory exists
if (!fs.existsSync(PUBLIC_DIR)) {
    fs.mkdirSync(PUBLIC_DIR, { recursive: true });
}

// Read CSV
try {
    const csvData = fs.readFileSync(CSV_FILE, 'utf8');
    const lines = csvData.split(/\r?\n/);
    const slugs = [];
    const categories = new Set();

    // Skip headers and parse
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        // Simple parse assuming CSV structure
        // Column 0: slug
        // Column 8: category
        const parts = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g);
        // Fallback split if match fails or simple structure
        const cols = line.split(',');

        // Basic validation: slug is column 0
        let slug = cols[0];
        // Category is column 8 (index 8)
        let category = cols[8];

        // Clean up quotes
        if (slug) slug = slug.replace(/^"|"$/g, '').trim();
        if (category) category = category.replace(/^"|"$/g, '').trim();

        // Skip header rows or empty slugs
        if (!slug || slug.toLowerCase() === 'slug') continue;

        slugs.push(slug);
        if (category) {
            categories.add(category);
        }
    }

    console.log(`Found ${slugs.length} emojis and ${categories.size} categories to index.`);

    // Static Routes
    const urls = [
        { loc: `${DOMAIN}/`, freq: 'daily', priority: '1.0' },
    ];

    // Category Routes
    categories.forEach(cat => {
        const slug = toSlug(cat);
        if (slug) {
            urls.push({
                loc: `${DOMAIN}/category/${slug}`,
                freq: 'weekly',
                priority: '0.9'
            });
        }
    });

    // Dynamic Routes (clean URLs)
    slugs.forEach(slug => {
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
    console.log(`Sitemap generated successfully at ${SITEMAP_FILE}`);

} catch (error) {
    console.error('Error generating sitemap:', error);
    process.exit(1);
}