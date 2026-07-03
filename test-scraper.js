import {
  scrapeKamaClips,
  scrapeViralMms,
  scrapeDesiSexVdo,
  scrapeDesiBabe,
  scrapeDesiHub,
  scrapeDesiBF,
  scrapeDesiLeak49,
  scrapeMastiRaja
} from './scraper.js';

async function testScraper(name, fn, ...args) {
  console.log(`\nTesting ${name}...`);
  try {
    const start = Date.now();
    const results = await fn(...args);
    const duration = Date.now() - start;
    console.log(`${name} scraped ${results.length} posts in ${duration}ms.`);
    if (results.length > 0) {
      console.log('Sample:', JSON.stringify(results[0], null, 2));
    }
  } catch (err) {
    console.error(`Error testing ${name}:`, err.message);
  }
}

async function runTests() {
  console.log('--- Starting Scraper Tests ---');

  await testScraper('KamaClips', scrapeKamaClips);
  await testScraper('ViralMMS', scrapeViralMms);
  await testScraper('DesiSexVdo', scrapeDesiSexVdo);
  await testScraper('DesiBabe', scrapeDesiBabe);
  await testScraper('DesiHub', scrapeDesiHub);
  await testScraper('DesiBF', scrapeDesiBF);
  await testScraper('DesiLeak49', scrapeDesiLeak49);
  await testScraper('MastiRaja', scrapeMastiRaja);

  console.log('\n--- Testing Search (Tamil) ---');
  await testScraper('MastiRaja Search', scrapeMastiRaja, 1, 'Tamil');

  console.log('\n--- Scraper Tests Finished ---');
}

runTests();
