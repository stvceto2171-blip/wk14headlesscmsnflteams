// pages/coaches/index.tsx
import Layout from '@/components/layout';
import Head from 'next/head';
import Link from 'next/link';
import { getAllCoaches } from '@/lib/posts';

export default function Coaches({ coaches }: { coaches: any[] }) {
  return (
    <Layout home={false}>
      <Head><title>All Coaches</title></Head>
      <h1>All Coaches ({coaches.length})</h1>
      {coaches.length === 0 ? (
        <p>No coaching staff found.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {coaches.map((coach) => (
            <li key={coach.slug} style={{ margin: '1rem 0', padding: '1rem', border: '1px solid #ddd' }}>
              <Link href={`/coaches/${coach.slug}`}>
                <strong>{coach.title}</strong>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Layout>
  );
}

export async function getStaticProps() {
  const coaches = await getAllCoaches();
  return { props: { coaches }, revalidate: 60 };
}
