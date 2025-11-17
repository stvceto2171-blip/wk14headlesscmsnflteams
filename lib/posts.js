// lib/posts.js
const WP_REST_ENDPOINT = 'https://dev-cs55nflteams.pantheonsite.io/wp-json/wp/v2/posts';

// ------------------------------------------------------------------
// Central fetcher – gets ALL posts (paginated if needed)
// ------------------------------------------------------------------
async function fetchAllPosts() {
  try {
    let allPosts = [];
    let page = 1;
    const perPage = 100; // WP max per page

    while (true) {
      const res = await fetch(
        `${WP_REST_ENDPOINT}?per_page=${perPage}&page=${page}&_fields=id,title,date,status`
      );
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const posts = await res.json();
      if (!Array.isArray(posts) || posts.length === 0) {
        break;
      }

      // Filter only published posts (skip drafts/private)
      const publishedPosts = posts.filter((post) => post.status === 'publish');
      allPosts = allPosts.concat(publishedPosts);

      if (posts.length < perPage) {
        break; // No more pages
      }
      page++;
    }

    return allPosts;
  } catch (err) {
    console.error('Failed to fetch posts:', err);
    return [];
  }
}

// ------------------------------------------------------------------
// 1. getAllPostIds – for getStaticPaths (all published IDs)
// ------------------------------------------------------------------
export async function getAllPostIds() {
  const posts = await fetchAllPosts();
  return posts
    .filter((post) => post && post.id != null)
    .map((post) => ({
      params: { id: String(post.id) },
    }));
}

// ------------------------------------------------------------------
// 2. getSortedPostsData – for index page (Home)
// ------------------------------------------------------------------
export async function getSortedPostsData() {
  const posts = await fetchAllPosts();
  const validPosts = posts.filter(
    (post) => post && post.id != null && post.title && post.date
  );

  // Sort alphabetically by title (use .rendered for HTML-safe)
  const sorted = validPosts.sort((a, b) =>
    (a.title?.rendered || '').localeCompare(b.title?.rendered || '')
  );

  return sorted.map((post) => ({
    id: String(post.id),
    name: post.title?.rendered || 'Untitled',
    date: post.date,
  }));
}

// ------------------------------------------------------------------
// 3. getPostData – for individual post page
// ------------------------------------------------------------------
export async function getPostData(idRequested) {
  // Check if ID exists in full list
  const posts = await fetchAllPosts();
  const postStub = posts.find((p) => String(p.id) === idRequested);
  if (!postStub) {
    return null;
  }

  let contentHtml = '<p>No content available.</p>';

  try {
    const fullRes = await fetch(`${WP_REST_ENDPOINT}/${postStub.id}?_fields=title,content,date`);
    if (fullRes.ok) {
      const fullPost = await fullRes.json();
      contentHtml = fullPost.content?.rendered || contentHtml;
    }
  } catch (err) {
    console.error(`Failed to fetch full post ${idRequested}:`, err);
  }

  return {
    id: String(postStub.id),
    title: postStub.title?.rendered || 'Untitled',
    date: postStub.date || '',
    contentHtml,
  };
}
