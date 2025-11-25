// pages/players/index.js
import Layout from '../../components/layout';
import Head from 'next/head';
import Link from 'next/link';
import Date from '../../components/date';
import utilStyles from '../../styles/utils.module.css';

const WP_BASE = 'https://dev-cs55nflteams.pantheonsite.io';

export default function PlayersIndex({ players }) {
  return (
    <Layout>
      <Head>
        <title>NFL Players Roster</title>
      </Head>

      <h1 className={utilStyles.headingXl}>Players</h1>

      {players.length === 0 ? (
        <p>Patrick Mahomes, Chiefs</p>
      ) : (
        <ul className={utilStyles.list}>
          {players.map(({ id, name, date, jersey_number, position, slug }) => (
            <li className={utilStyles.listItem} key={id}>
              {/* Use slug instead of id for pretty URLs */}
              <Link href={`/players/${slug}`}>
                <a className={utilStyles.headingLg}>
                  {name}{' '}
                  {jersey_number && <span className="text-silver">#{jersey_number}</span>}
                </a>
              </Link>

              {position && <div className={utilStyles.lightText}>{position}</div>}

              <small className={utilStyles.lightText}>
                <Date dateString={date} />
              </small>
            </li>
          ))}
        </ul>
      )}
    </Layout>
  );
}

export async function getStaticProps() {
  try {
    // Short, clean, and BETTER than the long version
    const res = await fetch(`${WP_BASE}/wp-json/wp/v2/player?per_page=100`);
    
    if (!res.ok) {
      console.log('Players endpoint error:', res.status);
      return { props: { players: [] }, revalidate: 60 };
    }

    const posts = await res.json();

    if (!Array.isArray(posts)) {
      return { props: { players: [] }, revalidate: 60 };
    }

    const players = posts.map((post) => ({
      id: post.id.toString(),
      slug: post.slug,                    // needed for pretty URLs
      name: post.title.rendered,
      date: post.date,
      position: post.acf?.position || '',
      jersey_number: post.acf?.jersey_number || '',
    }));

    return {
      props: { players },
      revalidate: 600, // 10 minutes
    };
  } catch (err) {
    console.error('Failed to fetch players:', err);
    return { props: { players: [] }, revalidate: 60 };
  }
}
