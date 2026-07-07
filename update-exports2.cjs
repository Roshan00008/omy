const fs = require('fs');
const file = 'e:\\telegram-scraper-bot\\scraper.js';
const content = fs.readFileSync(file, 'utf8');

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
    const newContent = content.replace(oldExport, newExport);
    fs.writeFileSync(file, newContent);
    console.log('Updated exports successfully');
} else {
    console.log('Old export not found - checking for slight variations...');
    // Try with different whitespace
    const lines = content.split('\n');
    for (let i = 1167; i < 1186; i++) {
        console.log(i+1 + ': ' + JSON.stringify(lines[i]));
    }
}
