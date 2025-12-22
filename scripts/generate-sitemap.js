const fs = require('fs');
const path = require('path');

const DOMAIN = 'https://www.emojitopng.com';
const CSV_FILE = path.join(__dirname, '..', 'emojis.csv');
const PUBLIC_DIR = path.join(__dirname, '..', 'public');
const SITEMAP_FILE = path.join(PUBLIC_DIR, 'sitemap.xml');

// Ensure public directory exists
if (!fs.existsSync(PUBLIC_DIR)) {
    fs.mkdirSync(PUBLIC_DIR, { recursive: true });
}

// Read CSV
try {
    const csvData = fs.readFileSync(CSV_FILE, 'utf8');
    const lines = csvData.split(/\r?\n/);
    const slugs = [];

    // Skip headers and parse
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        // Simple parse: slug is the first column. 
        // Assuming slug does not contain commas as per the provided format.
        const firstCommaIndex = line.indexOf(',');
        if (firstCommaIndex === -1) continue;

        const slug = line.substring(0, firstCommaIndex).trim();

        // Skip header rows or empty slugs
        if (slug.toLowerCase() === 'slug' || !slug) continue;

        slugs.push(slug);
    }

    console.log(`Found ${slugs.length} emojis to index.`);

    // Static Routes
    const urls = [
        { loc: `${DOMAIN}/`, freq: 'daily', priority: '1.0' },
    ];

    // Dynamic Routes (using hash routing as requested)
    slugs.forEach(slug => {
        urls.push({
            loc: `${DOMAIN}/#/emoji/${slug}`,
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