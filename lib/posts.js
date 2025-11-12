// lib/posts.js
// ---------------------------------------------------------------
//  IMPORTANT: npm install got@9.6.0   (as you noted)
// ---------------------------------------------------------------

import got from 'got';

// ------------------------------------------------------------------
// 1. The endpoint – NOTE the **single** slash after .io
// ------------------------------------------------------------------
const DATA_URL =
  'https://dev-cs55nflteams.pantheonsite.io/wp-json/twentytwentyone-child/v1/latest-posts/1';

// ------------------------------------------------------------------
// 2. Helper – fetch *once* and parse JSON safely
// ------------------------------------------------------------------
async function fetchPosts() {
  try {
    // .json() automatically parses the body and throws on non-2xx
    const data = await got(DATA_URL).json();

    // The Pantheon endpoint returns an **array** of post objects.
    // Guard against malformed payloads.
    return Array.isArray(data) ? data : [];
  } catch (err) {
    // Log the real error – helps debugging on Pantheon
    console.error('Failed to fetch posts from Pantheon:', err);
    return []; // fallback – never break the build
  }
}

// ------------------------------------------------------------------
// 3. getAllIds – for getStaticPaths
// ------------------------------------------------------------------
export async function getAllIds() {
  const posts = await fetchPosts();

  return posts.map((post) => ({
    params: {
      id: String(post.ID), // Next.js expects strings
    },
  }));
}

// ------------------------------------------------------------------
// 4. getSortedList – for a preview / index page
// ------------------------------------------------------------------
export async function getSortedList() {
  const posts = await fetchPosts();

  // Sort in-memory (Pantheon returns unsorted)
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

  // Return an empty object when nothing matches – safe for rendering
  return post ?? {};
}
