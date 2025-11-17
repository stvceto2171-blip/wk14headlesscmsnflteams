// pages/index.js   (plain JavaScript – keep the .js extension)
import Head from 'next/head';
import Layout, { siteTitle } from '../components/layout';
import utilStyles from '../styles/utils.module.css';
import Link from 'next/link';
import Date from '../components/date';

import { getSortedPostsData } from '../lib/posts';

// -------------------------------------------------------------------
// Page component – unchanged UI
// -------------------------------------------------------------------
export default function Home({ allPostsData }) {
  return (
    <Layout home>
      <Head>
        <title>{siteTitle}</title>
      </Head>

      <section className={utilStyles.headingMd}>
        <p>[My name is Steve A. I am a web developer from Santa Rosa CA]</p>
        <p>
          (This site will integrate various techniques to synthesize design
          motifs{' '}
          <a href="https://nextjs.org/learn">our Next.js tutorial</a>.)
        </p>
      </section>

      <section className={`${utilStyles.headingMd} ${utilStyles.padding1px}`}>
        <h2 className={utilStyles.headingLg}>Blog</h2>

        {allPostsData.length === 0 ? (
          <p>No posts found.</p>
        ) : (
          <ul className={utilStyles.list}>
            {allPostsData.map(({ id, date, name }) => (
              <li className={utilStyles.listItem} key={id}>
                <Link href={`/posts/${id}`}>{name}</Link>
                <br />
                <small className={utilStyles.lightText}>
                  <Date dateString={date} />
                </small>
              </li>
            ))}
          </ul>
        )}
      </section>
    </Layout>
  );
}

// -------------------------------------------------------------------
// getStaticProps – use the shared lib function
// -------------------------------------------------------------------
export async function getStaticProps() {
  const allPostsData = await getSortedPostsData(); // ← from lib/posts.js

  return {
    props: { allPostsData },
    revalidate: 600, // 10‑minute ISR
  };
}
