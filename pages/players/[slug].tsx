// pages/players/[slug].tsx
import Layout from '@/components/layout.js';  // ← fixed
import Head from 'next/head';
import { GetStaticPaths, GetStaticProps } from 'next';
import { getAllPlayerSlugs, getPlayerData } from '@/lib/post';

export default function PlayerPage({ player }: { player: any }) {
  if (!player) {
    return (
      <Layout home={false}>
        <Head><title>Player Not Found</title></Head>
        <h1>Player Not Found</h1>
      </Layout>
    );
  }

  return (
    <Layout home={false}>
      <Head><title>{player.title} | NFL Player</title></Head>

      <article>
        <h1>{player.title}</h1>

        {player.featuredImage && (
          <img
            src={player.featuredImage}
            alt={player.title}
            style={{ maxWidth: '100%', borderRadius: '12px', marginBottom: '2rem' }}
          />
        )}

        <div style={{ marginTop: '3rem', display: 'grid', gap: '1.8rem', fontSize: '1.1rem' }}>
          {Object.entries(player.acf).map(([key, value]) => {
            const label = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

            if (value && typeof value === 'object' && value.url) {
              return (
                <div key={key}>
                  <strong style={{ color: '#0066cc' }}>{label}:</strong><br />
                  <img src={value.url} alt={label} style={{ maxWidth: '300px', marginTop: '0.5rem', borderRadius: '8px' }} />
                </div>
              );
            }

            return (
              <div key={key} style={{ borderBottom: '1px solid #ddd', paddingBottom: '1rem' }}>
                <strong style={{ color: '#0066cc' }}>{label}:</strong>{' '}
                {typeof value === 'string' && value.startsWith('<') ? (
                  <div dangerouslySetInnerHTML={{ __html: value }} />
                ) : value != null ? String(value) : '—'}
              </div>
            );
          })}
        </div>
      </article>
    </Layout>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const paths = await getAllPlayerSlugs();
  return { paths, fallback: 'blocking' };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const slug = params?.slug as string;
  const player = slug ? await getPlayerData(slug) : null;

  return player
    ? { props: { player }, revalidate: 60 }
    : { notFound: true };
};
