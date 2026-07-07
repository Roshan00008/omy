const fs = require('fs');
const file = 'e:\\telegram-scraper-bot\\scraper.js';
let content = fs.readFileSync(file, 'utf8');

// The exact export block with \r\n line endings
const oldExport = `export {\r
  normalizeUrl,\r
  getRequestHeaders,\r
  ensureClearance,\r
  scrapeDesiPorn,\r
  scrapeViralMms,\r
  scrapeDesiSexVdo,\r
  scrapeDesiBabe,\r
  scrapeDesiHub,\r
  scrapeDesiBF,\r
  scrapeDesiLeak49,\r
  scrapeMastiRaja,\r
  getCached,\r
  setCached,\r
  cache,\r
  CACHE_TTL\r
};`;

const newExport = `export {\r
  normalizeUrl,\r
  getRequestHeaders,\r
  ensureClearance,\r
  scrapeDesiPorn,\r
  scrapeMMSBee,\r
  scrapeDesiPapa,\r
  scrapeViralMms,\r
  scrapeDesiSexVdo,\r
  scrapeDesiBabe,\r
  scrapeDesiHub,\r
  scrapeDesiBF,\r
  scrapeDesiLeak49,\r
  scrapeMastiRaja,\r
  getCached,\r
  setCached,\r
  cache,\r
  CACHE_TTL\r
};`;

if (content.includes(oldExport)) {
    const newContent = content.replace(oldExport, newExport);
    fs.writeFileSync(file, newContent);
    console.log('Updated exports successfully with CRLF');
} else {
    console.log('Still not found');
}
