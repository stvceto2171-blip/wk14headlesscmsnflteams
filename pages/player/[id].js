// pages/player/[id].js
import Layout from '../../components/layout';
import Head from 'next/head';

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
      <Head><title>{player.title} | Player</title></Head>
      <article>
        <h1>{player.title}</h1>
        {player.featuredImage && (
          <img src={player.featuredImage} alt={player.title} style={{ maxWidth: '100%', height: 'auto' }} />
        )}
        <div>
          <h3>Records</h3>
          <div dangerouslySetInnerHTML={{ __html: player.records || '—' }} />
        </div>
        <div>
          <h3>Statistics</h3>
          <div dangerouslySetInnerHTML={{ __html: player.statistics || '—' }} />
        </div>
        <div>
          <h3>Past Performances</h3>
          <div dangerouslySetInnerHTML={{ __html: player.past_performances || '—' }} />
        </div>
        <div>
          <h3>Big Plays</h3>
          <p>{player.big_plays || '—'}</p>
        </div>
      </article>
    </Layout>
  );
}

// This prevents the .map() crash
export async function getStaticPaths() {
  try {
    const res = await fetch(`${WP_BASE}/wp-json/wp/v2/player`);
    const players = await res.json();

    // Safety: make sure players is an array
    if (!Array.isArray(players)) {
      return { paths: [], fallback: 'blocking' };
    }

    const paths = players.map((p) => ({
      params: { id: p.id.toString() },
    }));

    return { paths, fallback: 'blocking' };
  } catch (e) {
    console.error('Error in getStaticPaths for players:', e);
    return { paths: [], fallback: 'blocking' };
  }
}

export async function getStaticProps({ params }) {
  try {
    const res = await fetch(`${WP_BASE}/wp-json/wp/v2/player/${params.id}`);
    if (!res.ok) return { notFound: true };

    const post = await res.json();

    const player = {
      title: post.title.rendered,
      records: post.acf?.records || '—',
      statistics: post.acf?.statistics || '—',
      past_performances: post.acf?.past_performances || '—',
      big_plays: post.acf?.big_plays || '—',
      featuredImage: post.featured_media ? post._embedded?.['wp:featuredmedia']?.[0]?.source_url : null,
    };

    return { props: { player }, revalidate: 600 };
  } catch (e) {
    console.error('Error fetching player:', e);
    return { notFound: true };
  }
}
