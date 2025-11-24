import Layout from '../../components/layout';
import Head from 'next/head';
import { GetStaticPaths, GetStaticProps } from 'next';

type Player = {
  id: number;
  title: { rendered: string };
  slug: string;
  acf: Record<string, any>;
};

export default function PlayerPage({ player }: { player: Player | null }) {
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
      <Head><title>{player.title.rendered} | NFL Player</title></Head>
      <article>
        <h1>{player.title.rendered}</h1>

        {Object.entries(player.acf).length > 0 ? (
          <div style={{ marginTop: '3rem', display: 'grid', gap: '1.8rem', fontSize: '1.1rem' }}>
            {Object.entries(player.acf).map(([key, value]) => {
              const label = key
                .split('_')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ');

              return (
                <div key={key} style={{ borderBottom: '1px solid #333', paddingBottom: '1rem' }}>
                  <strong style={{ color: '#0066cc', fontSize: '1.2rem' }}>{label}:</strong>
                  <div style={{ marginTop: '0.5rem', lineHeight: '1.7' }}>
                    {typeof value === 'string' && value.trim().startsWith('<') ? (
                      <div dangerouslySetInnerHTML={{ __html: value }} />
                    ) : value !== null && value !== undefined && value !== '' ? (
                      <span>{String(value)}</span>
                    ) : (
                      <span style={{ color: '#888' }}>—</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p>No player data available yet.</p>
        )}
      </article>
    </Layout>
  );
}

export const getStaticPaths: GetStaticPaths = async () => ({
  paths: [],
  fallback: 'blocking',
});

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const slug = params?.slug as string;
  if (!slug) return { notFound: true };

  const res = await fetch(
    `https://dev-cs55nflteams.pantheonsite.io/wp-json/wp/v2/player?slug=${slug}&acf_format=standard`
  );

  if (!res.ok) return { notFound: true };
  const data = await res.json();
  const player = Array.isArray(data) && data.length > 0 ? data[0] : null;

  return player
    ? { props: { player }, revalidate: 60 }
    : { notFound: true };
};
