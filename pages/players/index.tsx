// pages/players/index.tsx
import Layout from '@/components/layout';
import Head from 'next/head';
import Link from 'next/link';
import { getAllPlayers } from '@/lib/posts';

export default function Players({ players }: { players: any[] }) {
  return (
    <Layout home={false}>
      <Head><title>All Players</title></Head>
      <h1>All Players ({players.length})</h1>
      {players.length === 0 ? (
        <p>No players found.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {players.map((player) => (
            <li key={player.slug} style={{ margin: '1rem 0', padding: '1rem', border: '1px solid #ddd' }}>
              <Link href={`/players/${player.slug}`}>
                <strong>{player.title}</strong>
              </Link>
              <br />
              Record: {player.acf.records || '—'} | 
              Stats: {player.acf.statistics || '—'}
            </li>
          ))}
        </ul>
      )}
    </Layout>
  );
}

export async function getStaticProps() {
  const players = await getAllPlayers();
  return { props: { players }, revalidate: 60 };
}
