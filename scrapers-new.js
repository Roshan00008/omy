/**
 * Scrapes MMSBee.org  (WordPress-based, accessible, good desi content)
 * Listing: article.post > h2.title > a  |  Categories: /indian/, /desi/, /latest/
 * Search: /?s=term
 */
async function scrapeMMSBee(page = 1, searchTerm = '', limit = 10) {
  const cacheKey = `mmsbee_${page}_${searchTerm || 'default'}_l${limit}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const baseUrl = 'https://www.mmsbee.org';
  let url;
  if (searchTerm) {
    url = page === 1
      ? `${baseUrl}/?s=${encodeURIComponent(searchTerm)}`
      : `${baseUrl}/page/${page}/?s=${encodeURIComponent(searchTerm)}`;
  } else {
    url = page === 1 ? `${baseUrl}/latest/` : `${baseUrl}/latest/page/${page}/`;
  }

  try {
    await ensureClearance(baseUrl);
    const res = await axiosGetWithRetry(url, { headers: getRequestHeaders(baseUrl) });
    const $ = cheerio.load(res.data);
    const posts = [];

    // Main post listing - articles with title links
    $('article.post, .post-item, .entry').each((_, el) => {
      const a = $(el).find('h2 a, h3 a, .entry-title a, .post-title a').first();
      if (!a.length) return;
      const title = a.text().trim() || a.attr('title');
      const href = a.attr('href');
      const imgSrc = $(el).find('img').first().attr('src') || $(el).find('img').first().attr('data-src');

      if (title && href) {
        posts.push({
          title,
          url: normalizeUrl(href, baseUrl),
          thumbnail: normalizeUrl(imgSrc, baseUrl),
          siteName: 'MMSBee',
          siteBaseUrl: baseUrl
        });
      }
    });

    // Fallback: any link in content area
    if (posts.length === 0) {
      $('.content a[href*="/"]').each((_, el) => {
        const a = $(el);
        const title = a.text().trim();
        const href = a.attr('href');
        if (title && href && href.includes(baseUrl) && posts.length < limit * 2) {
          posts.push({
            title,
            url: normalizeUrl(href, baseUrl),
            thumbnail: '',
            siteName: 'MMSBee',
            siteBaseUrl: baseUrl
          });
        }
      });
    }

    const uniquePosts = [];
    const urls = new Set();
    for (const post of posts) {
      if (!urls.has(post.url)) {
        urls.add(post.url);
        uniquePosts.push(post);
      }
      if (uniquePosts.length >= limit) break;
    }

    // Resolve video URLs from individual post pages
    const resolvedPosts = await Promise.all(
      uniquePosts.map(async (post) => {
        try {
          const postRes = await axiosGetWithRetry(post.url, { headers: getRequestHeaders(baseUrl) });
          const post$ = cheerio.load(postRes.data);

          // WP sites often have video in iframe, video tag, or og:video
          let videoUrl = post$('meta[property="og:video"]').attr('content')
            || post$('meta[itemprop="contentURL"]').attr('content')
            || post$('video source').attr('src')
            || post$('iframe[src*="video"], iframe[src*="embed"]').attr('src');

          // Try to find video in content
          if (!videoUrl) {
            post$('.entry-content, .post-content, .content').find('video, iframe').each((_, el) => {
              const src = $(el).attr('src');
              if (src && (src.includes('.mp4') || src.includes('.m3u8') || src.includes('video'))) {
                videoUrl = src;
                return false;
              }
            });
          }

          post.videoUrl = normalizeUrl(videoUrl, baseUrl);
          if (!post.thumbnail) {
            post.thumbnail = post$('meta[property="og:image"]').attr('content') || post$('.entry-content img').first().attr('src');
          }
          return post;
        } catch (_) {
          return post;
        }
      })
    );

    const validPosts = resolvedPosts.filter(p => p.videoUrl);
    setCached(cacheKey, validPosts);
    return validPosts;
  } catch (err) {
    console.error(`Error scraping MMSBee (Page ${page}, Search: ${searchTerm}):`, err.message);
    return [];
  }
}

/**
 * Scrapes DesiPapa.com  (Simple HTML site, accessible)
 * Listing: div.video-item or similar  |  Categories: latest, indian, etc.
 */
async function scrapeDesiPapa(page = 1, searchTerm = '', limit = 10) {
  const cacheKey = `desipapa_${page}_${searchTerm || 'default'}_l${limit}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const baseUrl = 'https://www.desipapa.com';
  let url;
  if (searchTerm) {
    url = `${baseUrl}/search?q=${encodeURIComponent(searchTerm)}`;
  } else {
    url = page === 1 ? `${baseUrl}/` : `${baseUrl}/page/${page}/`;
  }

  try {
    await ensureClearance(baseUrl);
    const res = await axiosGetWithRetry(url, { headers: getRequestHeaders(baseUrl) });
    const $ = cheerio.load(res.data);
    const posts = [];

    // Try multiple selectors for video listings
    const selectors = [
      '.video-item', '.video-block', '.post-item', '.item',
      'article', '.thumb-block', '.video-thumb'
    ];

    for (const sel of selectors) {
      $(sel).each((_, el) => {
        const a = $(el).find('a[href]').first();
        const title = a.attr('title') || a.text().trim() || $(el).find('img').attr('alt');
        const href = a.attr('href');
        const imgSrc = $(el).find('img').attr('src') || $(el).find('img').attr('data-src');

        if (title && href) {
          posts.push({
            title,
            url: normalizeUrl(href, baseUrl),
            thumbnail: normalizeUrl(imgSrc, baseUrl),
            siteName: 'DesiPapa',
            siteBaseUrl: baseUrl
          });
        }
      });
      if (posts.length > 0) break;
    }

    // Fallback: any video links
    if (posts.length === 0) {
      $('a[href*="/video"], a[href*="/watch"]').each((_, el) => {
        const a = $(el);
        const title = a.attr('title') || a.text().trim();
        const href = a.attr('href');
        if (title && href) {
          posts.push({
            title,
            url: normalizeUrl(href, baseUrl),
            thumbnail: '',
            siteName: 'DesiPapa',
            siteBaseUrl: baseUrl
          });
        }
      });
    }

    const uniquePosts = [];
    const urls = new Set();
    for (const post of posts) {
      if (!urls.has(post.url)) {
        urls.add(post.url);
        uniquePosts.push(post);
      }
      if (uniquePosts.length >= limit) break;
    }

    const resolvedPosts = await Promise.all(
      uniquePosts.map(async (post) => {
        try {
          const postRes = await axiosGetWithRetry(post.url, { headers: getRequestHeaders(baseUrl) });
          const post$ = cheerio.load(postRes.data);

          let videoUrl = post$('meta[property="og:video"]').attr('content')
            || post$('video source').attr('src')
            || post$('video').attr('src')
            || post$('iframe[src*="video"]').attr('src');

          post.videoUrl = normalizeUrl(videoUrl, baseUrl);
          if (!post.thumbnail) {
            post.thumbnail = post$('meta[property="og:image"]').attr('content') || post$('img').first().attr('src');
          }
          return post;
        } catch (_) {
          return post;
        }
      })
    );

    const validPosts = validPosts.filter(p => p.videoUrl);
    setCached(cacheKey, validPosts);
    return validPosts;
  } catch (err) {
    console.error(`Error scraping DesiPapa (Page ${page}, Search: ${searchTerm}):`, err.message);
    return [];
  }
}
