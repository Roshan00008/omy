const fs = require('fs');
const file = 'e:\\telegram-scraper-bot\\scraper.js';
let content = fs.readFileSync(file, 'utf8');

// Find and replace the export block
const oldExport = `export {
  normalizeUrl,
  getRequestHeaders,
  ensureClearance,
  scrapeDesiPorn,
  scrapeViralMms,
  scrapeDesiSexVdo,
  scrapeDesiBabe,
  scrapeDesiHub,
  scrapeDesiBF,
  scrapeDesiLeak49,
  scrapeMastiRaja,
  getCached,
  setCached,
  cache,
  CACHE_TTL
};`;

const newExport = `export {
  normalizeUrl,
  getRequestHeaders,
  ensureClearance,
  scrapeDesiPorn,
  scrapeMMSBee,
  scrapeDesiPapa,
  scrapeViralMms,
  scrapeDesiSexVdo,
  scrapeDesiBabe,
  scrapeDesiHub,
  scrapeDesiBF,
  scrapeDesiLeak49,
  scrapeMastiRaja,
  getCached,
  setCached,
  cache,
  CACHE_TTL
};`;

if (content.includes(oldExport)) {
    content = content.replace(oldExport, newExport);
    fs.writeFileSync(file, content);
    console.log('Updated exports');
} else {
    console.log('Old export not found, trying partial match...');
    // Try without trailing semicolon
    const oldExport2 = oldExport.replace(';', '');
    if (content.includes(oldExport2)) {
        content = content.replace(oldExport2, newExport.replace(';', ''));
        fs.writeFileSync(file, content);
        console.log('Updated exports (alt)');
    } else {
        console.log('Could not find export block');
    }
}
