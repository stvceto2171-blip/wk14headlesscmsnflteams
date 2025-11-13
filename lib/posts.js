// lib/posts.js
// ---------------------------------------------------------------
const DATA_URL =
  'https://dev-cs55nflteams.pantheonsite.io/wp-json/twentytwentyone-child/v1/latest-posts/1';

/**
 * Centralised fetch – returns an empty array on any error.
 */
async function fetchPosts() {
  try {
    const res = await fetch(DATA_URL, { cache: 'no-store' }); // fresh on every build
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.error('Failed to fetch posts from Pantheon:', err);
    return [];
  }
}

// ------------------------------------------------------------------
// 1. getAllPostIds – returns the array expected by getStaticPaths
// ------------------------------------------------------------------
export async function getAllPostIds() {
  const posts = await fetchPosts();

  return posts
    .filter(
      (post) =>
        post && (typeof post.ID === 'string' || typeof post.ID === 'number')
    )
    .map((post) => ({
      params: {
        id: String(post.ID),
      },
    }));
}

// ------------------------------------------------------------------
// 2. getSortedPostsData – returns the array used on the index page
// ------------------------------------------------------------------
export async function getSortedPostsData() {
  const posts = await fetchPosts();

  const validPosts = posts.filter(
    (post) =>
      post &&
      post.ID &&
      post.post_title &&
      post.post_date
  );

  const sorted = [...validPosts].sort((a, b) =>
    a.post_title.localeCompare(b.post_title)
  );

  return sorted.map((post) => ({
    id: String(post.ID),
    name: post.post_title,
    date: post.post_date,
  }));
}

// ------------------------------------------------------------------
// 3. getPostData – returns null if the post is not found (JSON-safe)
// ------------------------------------------------------------------
export async function getPostData(idRequested) {
  const posts = await fetchPosts();

  const post = posts.find((p) => String(p.ID) === idRequested);

  if (!post || !post.ID) {
    return null; // <-- crucial for getStaticProps fallback handling
  }

  return {
    id: String(post.ID),
    title: post.post_title || 'Untitled',
    date: post.post_date || '',
    contentHtml: post.post_content || '',
  };
}
