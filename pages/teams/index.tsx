// pages/teams/index.tsx
import Layout from '@/components/layout';
import Head from 'next/head';
import Link from 'next/link';
import { getAllTeams } from '@/lib/posts';

export default function Teams({ teams }: { teams: any[] }) {
  return (
    <Layout home={false}>
      <Head><title>All Teams</title></Head>
      <h1>All Teams ({teams.length})</h1>
      {teams.length === 0 ? (
        <p>No teams found.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {teams.map((team) => (
            <li key={team.slug} style={{ margin: '1rem 0', padding: '1rem', border: '1px solid #ddd' }}>
              <Link href={`/teams/${team.slug}`}>
                <strong>{team.title}</strong>
              </Link>
              <br />
              Stadium: {team.acf.stadium || '—'} | 
              Record: {team.acf.record || '—'} | 
              Super Bowls: {team.acf.super_bowls || 0}
            </li>
          ))}
        </ul>
      )}
    </Layout>
  );
}

export async function getStaticProps() {
  const teams = await getAllTeams();
  return { props: { teams }, revalidate: 60 };
}
