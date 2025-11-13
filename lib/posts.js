// lib/posts.js
// ---------------------------------------------------------------
// IMPORTANT: npm install got@9.6.0
// ---------------------------------------------------------------
import got from 'got';

// ------------------------------------------------------------------
// 1. The endpoint – single slash after .io
// ------------------------------------------------------------------
const DATA_URL =
  'https://dev-cs55nflteams.pantheonsite.io/wp-json/twentytwentyone-child/v1/latest-posts/1';

// ------------------------------------------------------------------
// 2. Helper – fetch once, safely parse JSON
// ------------------------------------------------------------------
async function fetchPosts() {
  try {
    const data = await got(DATA_URL).json();
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.error('Failed to fetch posts from Pantheon:', err);
    return []; // ← Critical: prevents build crash
  }
}

// ------------------------------------------------------------------
// 3. getAllIds – for getStaticPaths
// ------------------------------------------------------------------
export async function getAllIds() {
  const posts = await fetchPosts();
  return posts.map((post) => ({
    params: {
      id: String(post.ID), // ← Matches WP 'ID' field
    },
  }));
}

// ------------------------------------------------------------------
// 4. getSortedList – for index / preview
// ------------------------------------------------------------------
export async function getSortedList() {
  const posts = await fetchPosts();
  const sorted = [...posts].sort((a, b) =>
    a.post_title.localeCompare(b.post_title)
  );
  return sorted.map((post) => ({
    id: String(post.ID),
    name: post.post_title,
  }));
}

// ------------------------------------------------------------------
// 5. getData – single post by ID (used in getStaticProps)
// ------------------------------------------------------------------
export async function getData(idRequested) {
  const posts = await fetchPosts();
  const post = posts.find((p) => String(p.ID) === idRequested);

  if (!post) {
    return {}; // ← Safe fallback
  }

  return {
    id: String(post.ID),
    title: post.post_title,
    date: post.post_date,
    contentHtml: post.post_content, // ← Enables full HTML rendering in [id].js
  };
}
