const fs = require('fs');
const file = 'e:\\telegram-scraper-bot\\core.js';
let content = fs.readFileSync(file, 'utf8');

// Add mmsbee and desipapa to csearch handler
const oldCsearch = `  } else if (siteKey === 'mastiraja') {
    siteName = 'MastiRaja';
    scrapeFn = scrapeMastiRaja;
  }

  if (scrapeFn) {
    await handleScrapeAction(ctx, siteName, page, scrapeFn, queryText, queryId);
  } else {
    await ctx.answerCbQuery('Invalid site selection.').catch(() => {});
  }
});`;

const newCsearch = `  } else if (siteKey === 'mmsbee') {
    siteName = 'MMSBee';
    scrapeFn = scrapeMMSBee;
  } else if (siteKey === 'desipapa') {
    siteName = 'DesiPapa';
    scrapeFn = scrapeDesiPapa;
  } else if (siteKey === 'mastiraja') {
    siteName = 'MastiRaja';
    scrapeFn = scrapeMastiRaja;
  }

  if (scrapeFn) {
    await handleScrapeAction(ctx, siteName, page, scrapeFn, queryText, queryId);
  } else {
    await ctx.answerCbQuery('Invalid site selection. {}'.catch(() => {});
  }
});`;

content = content.replace(oldCsearch, newCsearch);
fs.writeFileSync(file, content);
console.log('Updated csearch handler');
