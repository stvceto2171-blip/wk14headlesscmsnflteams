// lib/posts.js
const LIST_ENDPOINT =
  'https://dev-cs55nflteams.pantheonsite.io/wp-json/twentytwentyone-child/v1/latest-posts/1';

const WP_REST_ENDPOINT = 'https://dev-cs55nflteams.pantheonsite.io/wp-json/wp/v2/posts';

// ------------------------------------------------------------------
// Central fetcher – used by all functions
// ------------------------------------------------------------------
async function fetchPostList() {
  try {
    // During `next build`, this runs in Node.js → use default fetch behavior (cached)
    // In dev mode (`next dev`), it will re-fetch on every request
    const res = await fetch(LIST_ENDPOINT, {
      // Let Next.js handle caching: cached in build, fresh in dev
      // Remove `no-store` – it breaks static generation
      // cache: 'no-store' → removed
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status} from custom endpoint`);
    }

    const data = await res.json();

    if (!Array.isArray(data)) {
      console.warn('Custom endpoint did not return an array:', data);
      return [];
    }

    return data;
  } catch (err) {
    console.error('Failed to fetch post list from custom endpoint:', err);
    return [];
  }
}

// ------------------------------------------------------------------
// 1. getAllPostIds – for getStaticPaths
// ------------------------------------------------------------------
export async function getAllPostIds() {
  const posts = await fetchPostList();

  return posts
    .filter((post) => post && post.id != null)
    .map((post) => ({
      params: {
        id: String(post.id),
      },
    }));
}

// ------------------------------------------------------------------
// 2. getSortedPostsData – for index page (Home)
// ------------------------------------------------------------------
export async function getSortedPostsData() {
  const posts = await fetchPostList();

  const validPosts = posts.filter(
    (post) => post && post.id != null && post.title && post.date
  );

  // Sort alphabetically by title (or change to date if preferred)
  const sorted = validPosts.sort((a, b) =>
    a.title.localeCompare(b.title)
  );

  return sorted.map((post) => ({
    id: String(post.id),
    name: post.title,
    date: post.date,
  }));
}

// ------------------------------------------------------------------
// 3. getPostData – for individual post page [id].js
// ------------------------------------------------------------------
export async function getPostData(idRequested) {
  const posts = await fetchPostList();

  const postStub = posts.find((p) => String(p.id) === idRequested);
  if (!postStub || !postStub.id) {
    return null;
  }

  let contentHtml = '<p>No content available.</p>';

  try {
    const fullRes = await fetch(`${WP_REST_ENDPOINT}/${postStub.id}`, {
      // Same caching strategy as above
    });

    if (fullRes.ok) {
      const fullPost = await fullRes.json();
      contentHtml = fullPost.content?.rendered || contentHtml;
    }
  } catch (err) {
    console.error(`Failed to fetch full post content for ID ${idRequested}:`, err);
  }

  return {
    id: String(postStub.id),
    title: postStub.title || 'Untitled',
    date: postStub.date || '',
    contentHtml,
  };
}
