// pages/posts/[id].tsx
import Layout from '../../components/layout';
import Head from 'next/head';
import Date from '../../components/date';
import utilStyles from '../../styles/utils.module.css';

import { getAllPostIds, getPostData } from '../../lib/posts';

// -------------------------------------------------------------------
// Page Component
// -------------------------------------------------------------------
export default function Post({ postData }: { postData: any }) {
  // 404: Post not found or invalid
  if (!postData) {
    return (
      <Layout home={false}>
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

  // Normal post render
  return (
    <Layout home={false}>
      <Head>
        <title>{postData.title}</title>
      </Head>

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
// getStaticPaths – Generate paths at build time
// -------------------------------------------------------------------
export async function getStaticPaths() {
  const paths = await getAllPostIds();

  return {
    paths,
    fallback: 'blocking', // On-demand static generation
  };
}

// -------------------------------------------------------------------
// getStaticProps – Fetch single post
// -------------------------------------------------------------------
export async function getStaticProps({ params }: { params: { id: string } }) {
  if (!params?.id) {
    return { notFound: true };
  }

  const postData = await getPostData(params.id);

  if (!postData) {
    return { notFound: true };
  }

  return {
    props: {
      postData,
    },
    revalidate: 600, // Refresh every 10 minutes
  };
}
