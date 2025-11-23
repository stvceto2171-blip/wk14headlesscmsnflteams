// pages/player/[id].js
import Layout from '../../components/layout';
import Head from 'next/head';
import Date from '../../components/date';
import utilStyles from '../../styles/utils.module.css';

const WP_BASE = 'https://dev-cs55nflteams.pantheonsite.io';

export default function Player({ player }) {
  if (!player) return (
    <Layout>
      <Head><title>Player Not Found</title></Head>
      <h1>Player Not Found</h1>
    </Layout>
  );

  return (
    <Layout>
      <Head><title>{player.name} | NFL Players</title></Head>
      <article>
        <h1 className={utilStyles.headingXl}>{player.name}</h1>
        <div className={utilStyles.lightText}><Date dateString={player.date} /></div>
        <small className={utilStyles.headingMd}>
          #{player.jersey_number} • {player.position} • {player.college}
        </small>
        <div className={utilStyles.nflGrid}>
          <div><strong>Height/Weight:</strong><br />{player.height} / {player.weight}</div>
          <div><strong>Key Stats:</strong><br />{player.statistics}</div>
          <div><strong>Big Plays:</strong><br />{player.big_plays}</div>
        </div>
      </article>
    </Layout>
  );
}

export async function getStaticPaths() {
  const res = await fetch(`${WP_BASE}/wp-json/wp/v2/player`);
  const players = await res.json();
  const paths = players.map((p) => ({ params: { id: p.id.toString() } }));
  return { paths, fallback: 'blocking' };
}

export async function getStaticProps({ params }) {
  const res = await fetch(`${WP_BASE}/wp-json/wp/v2/player/${params.id}?_fields=id,title,date,acf`);
  if (!res.ok) return { notFound: true };
  const post = await res.json();
  const player = {
    name: post.title.rendered,
    date: post.date,
    jersey_number: post.acf?.jersey_number || '—',
    position: post.acf?.position || '—',
    height: post.acf?.height || '—',
    weight: post.acf?.weight || '—',
    college: post.acf?.college || '—',
    statistics: post.acf?.statistics || '—',
    big_plays: post.acf?.big_plays || '—',
  };
  return { props: { player }, revalidate: 600 };
}
