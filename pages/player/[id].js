// pages/players/[id].js
import Layout from '../../components/layout';
import Head from 'next/head';
import Date from '../../components/date';
import utilStyles from '../../styles/utils.module.css';

const WP_BASE = 'https://dev-cs55nflteams.pantheonsite.io';

export default function Player({ player }) {
  if (!player) {
    return (
      <Layout>
        <Head><title>Player Not Found</title></Head>
        <h1>Player Not Found</h1>
      </Layout>
    );
  }

  return (
    <Layout>
      <Head><title>{player.name} | NFL Players</title></Head>
      <article>
        <h1 className={utilStyles.headingXl}>{player.name}</h1>
        <div className={utilStyles.lightText}>
          Added on <Date dateString={player.date} />
        </div>
        <div className={utilStyles.nflGrid}>
          <div><strong>Records:</strong><br />{player.records || '—'}</div>
          <div><strong>Statistics:</strong><br />{player.statistics || '—'}</div>
          <div><strong>Past Performances:</strong><br />{player.past_performances || '—'}</div>
          <div><strong>Big Plays:</strong><br />{player.big_plays || '—'}</div>
        </div>
      </article>
    </Layout>
  );
}

export async function getStaticPaths() {
  try {
    const res = await fetch(`${WP_BASE}/wp-json/wp/v2/players`, { method: 'GET' });

    if (!res.ok) {
      console.log('Players endpoint not reachable → blocking fallback');
      return { paths: [], fallback: 'blocking' };
    }

    const data = await res.json();

    if (!Array.isArray(data)) {
      return { paths: [], fallback: 'blocking' };
    }

    const paths = data.map((player) => ({
      params: { id: player.id.toString() },
    }));

    return { paths, fallback: 'blocking' };
  } catch (err) {
    console.error('getStaticPaths error (players):', err);
    return { paths: [], fallback: 'blocking' };
  }
}

export async function getStaticProps({ params }) {
  try {
    const res = await fetch(
      `${WP_BASE}/wp-json/wp/v2/players/${params.id}?_fields=id,title,date,acf`
    );

    if (!res.ok) return { notFound: true };

    const post = await res.json();

    const player = {
      id: post.id.toString(),
      name: post.title.rendered,
      date: post.date,
      records: post.acf?.records || '—',
      statistics: post.acf?.statistics || '—',
      past_performances: post.acf?.past_performances || '—',
      big_plays: post.acf?.big_plays || '—',
    };

    return {
      props: { player },
      revalidate: 600,
    };
  } catch (err) {
    console.error('getStaticProps error for player', params.id);
    return { notFound: true };
  }
}
