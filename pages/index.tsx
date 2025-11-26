// pages/index.tsx   ← REPLACE YOUR CURRENT HOMEPAGE WITH THIS
import Layout from '@/components/layout';
import Head from 'next/head';
import Link from 'next/link';
import { getAllPlayers, getAllTeams, getAllCoaches } from '@/lib/posts';

export default function Home({ players, teams, coaches }: any) {
  return (
    <Layout home>
      <Head>
        <title>NFL Headless CMS – Week 14 Project</title>
      </Head>

      <h1 style={{ fontSize: '3rem', marginBottom: '2rem' }}>
        NFL Headless CMS
      </h1>

      <section style={{ marginBottom: '3rem' }}>
        <h2>
          <Link href="/players">Players ({players.length}) →</Link>
        </h2>
        {players.slice(0, 5).map((p: any) => (
          <div key={p.slug}>
            <Link href={`/players/${p.slug}`}>
              <strong>{p.title}</strong>
            </Link>
            {p.acf?.statistics && ` – ${p.acf.statistics}`}
          </div>
        ))}
      </section>

      <section style={{ marginBottom: '3rem' }}>
        <h2>
          <Link href="/teams">Teams ({teams.length}) →</Link>
        </h2>
        {teams.map((t: any) => (
          <div key={t.slug}>
            <Link href={`/teams/${t.slug}`}>
              <strong>{t.title}</strong>
            </Link>
          </div>
        ))}
      </section>

      <section>
        <h2>
          <Link href="/coaches">Coaches ({coaches.length}) →</Link>
        </h2>
        {coaches.map((c: any) => (
          <div key={c.slug}>
            <Link href={`/coaches/${c.slug}`}>
              <strong>{c.title}</strong>
            </Link>
          </div>
        ))}
      </section>
    </Layout>
  );
}

// This pulls real data from your WordPress site
export async function getStaticProps() {
  const [players, teams, coaches] = await Promise.all([
    getAllPlayers().catch(() => []),
    getAllTeams().catch(() => []),
    getAllCoaches().catch(() => []),
  ]);

  return {
    props: {
      players,
      teams,
      coaches,
    },
    revalidate: 60, // refresh every minute
  };
}
