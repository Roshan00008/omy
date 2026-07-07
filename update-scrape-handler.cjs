const fs = require('fs');
const file = 'e:\\telegram-scraper-bot\\core.js';
let content = fs.readFileSync(file, 'utf8');

// Add mmsbee and desipapa to scrape handler
const oldScrape = `  } else if (siteKey === 'mastiraja') {
    siteName = 'MastiRaja';
    scrapeFn = scrapeMastiRaja;
  }

  if (scrapeFn) {`;

const newScrape = `  } else if (siteKey === 'mmsbee') {
    siteName = 'MMSBee';
    scrapeFn = scrapeMMSBee;
  } else if (siteKey === 'desipapa') {
    siteName = 'DesiPapa';
    scrapeFn = scrapeDesiPapa;
  } else if (siteKey === 'mastiraja') {
    siteName = 'MastiRaja';
    scrapeFn = scrapeMastiRaja;
  }

  if (scrapeFn) {`;

content = content.replace(oldScrape, newScrape);

// Update validSitesPattern
const oldPattern = "const validSitesPattern = 'all|desiporn|viralmms|desisexvdo|desibabe|desihub|desibf|desileak49|mastiraja|trending_all_in_one|popular_all_in_one';";
const newPattern = "const validSitesPattern = 'all|desiporn|mmsbee|desipapa|viralmms|desisexvdo|desibabe|desihub|desibf|desileak49|mastiraja|trending_all_in_one|popular_all_in_one';";

content = content.replace(oldPattern, newPattern);

fs.writeFileSync(file, content);
console.log('Updated scrape handler and validSitesPattern');
