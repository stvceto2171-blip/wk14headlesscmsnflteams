// pages/posts/[id].js
import Layout from '../../components/layout';
import Head from 'next/head';
import Date from '../../components/date';
import utilStyles from '../../styles/utils.module.css';

// -------------------------------------------------------------------
// Helper: fetch *all* post IDs from the remote WP REST API
// -------------------------------------------------------------------
async function fetchAllPostIds() {
  const endpoint = 'https://dev-cs55nflteams.pantheonsite.io/wp-json/wp/v2/posts?_fields=id';
  const res = await fetch(endpoint);

  if (!res.ok) {
    throw new Error(`Failed to fetch post IDs: ${res.status}`);
  }

  const posts = await res.json();

  return posts.map((post) => ({
    params: { id: post.id.toString() },
  }));
}

// -------------------------------------------------------------------
// Helper: fetch a single post (title, date, rendered HTML, custom name)
// -------------------------------------------------------------------
async function fetchPost(id: string) {
  const endpoint = `https://dev-cs55nflteams.pantheonsite.io/wp-json/wp/v2/posts/${id}?_fields=title,date,content`;
  const res = await fetch(endpoint);

  if (!res.ok) {
    // 404 from WP → treat as not found
    return null;
  }

  const wpPost = await res.json();

  return {
    id: wpPost.id.toString(),
    title: wpPost.title?.rendered ?? 'Untitled',
    date: wpPost.date,
    // WP already gives us rendered HTML
    contentHtml: wpPost.content?.rendered ?? '',
    // Optional: custom field `name` (ACF, etc.)
    // name: wpPost.acf?.name ?? wpPost.title?.rendered,
  };
}

// -------------------------------------------------------------------
// Page component – unchanged UI
// -------------------------------------------------------------------
export default function Post({ postData }) {
  // 404-style UI when the post is missing
  if (!postData) {
    return (
      <Layout>
        <Head><title>Post Not Found</title></Head>
        <article>
          <h1 className={utilStyles.headingXl}>Post Not Found</h1>
          <p>Sorry, this post does not exist or is unavailable.</p>
        </article>
      </Layout>
    );
  }

  return (
    <Layout>
      <Head>
        <title>{postData.title}</title>
      </Head>

      <article>
        <h1 className={utilStyles.headingXl}>{postData.title}</h1>

        <div className={utilStyles.lightText}>
          <Date dateString={postData.date} />
        </div>

        {/* WP content is already sanitized HTML */}
        <div
          className={utilStyles.postContent}
          dangerouslySetInnerHTML={{ __html: postData.contentHtml }}
        />
      </article>
    </Layout>
  );
}

// -------------------------------------------------------------------
// getStaticPaths – generate paths at build time + ISR
// -------------------------------------------------------------------
export async function getStaticPaths() {
  let paths = [];

  try {
    paths = await fetchAllPostIds();
  } catch (err) {
    console.error('getStaticPaths error:', err);
  }

  return {
    paths,
    // New posts will be generated on-demand (SSR → static)
    fallback: 'blocking',
  };
}

// -------------------------------------------------------------------
// getStaticProps – fetch the single post
// -------------------------------------------------------------------
export async function getStaticProps({ params }) {
  const postData = await fetchPost(params.id);

  if (!postData) {
    return { notFound: true };
  }

  return {
    props: { postData },
    // Regenerate in background every 10 minutes
    revalidate: 600,
  };
}
