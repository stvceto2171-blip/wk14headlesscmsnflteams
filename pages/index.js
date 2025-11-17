// pages/index.js
import Head from 'next/head';
import Layout, { siteTitle } from '../components/layout';
import utilStyles from '../styles/utils.module.css';
import Link from 'next/link';
import Date from '../components/date';

// -------------------------------------------------------------------
// Helper: fetch posts from the remote WP REST API
// -------------------------------------------------------------------
async function fetchPosts() {
  const endpoint = 'https://dev-cs55nflteams.pantheonsite.io/wp-json/wp/v2/posts';

  // You can add query params here, e.g. ?_fields=id,title,date,custom_field_name
  const res = await fetch(endpoint, {
    // Optional: add authentication if your site is protected
    // headers: { Authorization: `Bearer ${YOUR_TOKEN}` },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch posts: ${res.status} ${res.statusText}`);
  }

  const posts = await res.json();

  // Transform WP post objects → shape expected by the component
  return posts.map((post) => ({
    id: post.id.toString(),
    // WP returns title.rendered
    name: post.title?.rendered ?? 'Untitled',
    // WP returns date in ISO format – our <Date> component accepts that
    date: post.date,
    // If you have a custom field called `name` (ACF, etc.)
    // name: post.acf?.name ?? post.title?.rendered,
  }));
}

// -------------------------------------------------------------------
// Page component (unchanged UI)
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
                {/* Adjust the link if you have a different post route */}
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
// getStaticProps – pull data at build time + ISR
// -------------------------------------------------------------------
export async function getStaticProps() {
  let allPostsData = [];

  try {
    allPostsData = await fetchPosts();
  } catch (err) {
    console.error('Error fetching posts:', err);
    // You could also re-throw to trigger a 500 page:
    // throw err;
  }

  return {
    props: {
      allPostsData,
    },
    // Re-generate the page in the background every N seconds
    revalidate: 600, // 10 minutes (adjust as needed)
  };
}
