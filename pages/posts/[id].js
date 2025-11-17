// pages/posts/[id].js   (or .tsx if you prefer TypeScript)
import Layout from '../../components/layout';
import Head from 'next/head';
import Date from '../../components/date';
import utilStyles from '../../styles/utils.module.css';

import { getAllPostIds, getPostData } from '../../lib/posts';

// -------------------------------------------------------------------
// Page component – unchanged UI
// -------------------------------------------------------------------
export default function Post({ postData }) {
  // 404-style UI when the post is missing
  if (!postData) {
    return (
      <Layout>
        <Head>
          <title>Post Not Found</title>
        </Head>
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

        {/* WP content is already rendered HTML */}
        <div
          className={utilStyles.postContent}
          dangerouslySetInnerHTML={{ __html: postData.contentHtml }}
        />
      </article>
    </Layout>
  );
}

// -------------------------------------------------------------------
// getStaticPaths – use the shared lib function
// -------------------------------------------------------------------
export async function getStaticPaths() {
  const paths = await getAllPostIds(); // ← from lib/posts.js

  return {
    paths,
    fallback: 'blocking', // on-demand static generation
  };
}

// -------------------------------------------------------------------
// getStaticProps – use the shared lib function
// -------------------------------------------------------------------
export async function getStaticProps({ params }) {
  const postData = await getPostData(params.id); // ← from lib/posts.js

  if (!postData) {
    return { notFound: true };
  }

  return {
    props: { postData },
    revalidate: 600, // 10-minute ISR
  };
}
