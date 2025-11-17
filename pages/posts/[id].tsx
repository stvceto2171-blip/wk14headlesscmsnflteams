// pages/posts/[id].tsx
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
  return posts
    .filter((post: any) => post && post.id)
    .map((post: any) => ({
      params: { id: String(post.id) },
    }));
}

// -------------------------------------------------------------------
// Helper: fetch a single post – NOW SAFE
// -------------------------------------------------------------------
async function fetchPost(id: string) {
  const endpoint = `https://dev-cs55nflteams.pantheonsite.io/wp-json/wp/v2/posts/${id}?_fields=title,date,content`;
  const res = await fetch(endpoint);

  if (!res.ok) {
    console.warn(`Post ${id} not found: ${res.status}`);
    return null;
  }

  let wpPost;
  try {
    wpPost = await res.json();
  } catch (err) {
    console.error(`Failed to parse JSON for post ${id}`);
    return null;
  }

  if (!wpPost || typeof wpPost !== 'object' || !wpPost.id) {
    console.warn(`Invalid post data for ID ${id}:`, wpPost);
    return null;
  }

  return {
    id: String(wpPost.id),
    title: wpPost.title?.rendered ?? 'Untitled',
    date: wpPost.date ?? '',
    contentHtml: wpPost.content?.rendered ?? '',
  };
}

// -------------------------------------------------------------------
// Page component
// -------------------------------------------------------------------
export default function Post({ postData }: { postData: any }) {
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
      <Head><title>{postData.title}</title></Head>
      <article>
        <h1 className={utilStyles.headingXl}>{postData.title}</h1>
        <div className={utilStyles.lightText}>
          <Date dateString={postData.date} />
        </div>
        <div
          className={utilStyles.postContent}
          dangerouslySetInnerHTML={{ __html: postData.contentHtml }}
        />
      </article>
    </Layout>
  );
}

// -------------------------------------------------------------------
// getStaticPaths
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
    fallback: 'blocking',
  };
}

// -------------------------------------------------------------------
// getStaticProps – safe params
// -------------------------------------------------------------------
export async function getStaticProps({ params }: { params: { id?: string } }) {
  if (!params?.id) {
    return { notFound: true };
  }

  const postData = await fetchPost(params.id);
  if (!postData) {
    return { notFound: true };
  }

  return {
    props: { postData },
    revalidate: 600,
  };
}
