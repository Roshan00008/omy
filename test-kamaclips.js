import { scrapeKamaClips } from './scraper.js';

(async () => {
  try {
    const posts = await scrapeKamaClips(1);
    console.log('Fetched', posts.length, 'posts');
    console.log(JSON.stringify(posts.slice(0, 3), null, 2));
  } catch (e) {
    console.error('Error during scrapeKamaClips:', e);
  }
})();
