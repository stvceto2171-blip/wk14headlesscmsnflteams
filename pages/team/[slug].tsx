import Layout from '../../components/layout';
import Head from 'next/head';
import { GetStaticPaths, GetStaticProps } from 'next';

type Team = {
  id: number;
  title: { rendered: string };
  slug: string;
  acf: Record<string, any>;
};

export default function TeamPage({ team }: { team: Team | null }) {
  if (!team) {
    return (
      <Layout home={false}>
        <Head><title>Team Not Found</title></Head>
        <article><h1>Team Not Found</h1></article>
      </Layout>
    );
  }

  return (
    <Layout home={false}>
      <Head><title>{team.title.rendered} | NFL Team</title></Head>
      <article>
        <h1>{team.title.rendered}</h1>

        {Object.entries(team.acf).length > 0 ? (
          <div style={{ marginTop: '3rem', display: 'grid', gap: '1.8rem', fontSize: '1.1rem' }}>
            {Object.entries(team.acf).map(([key, value]) => {
              const label = key
                .split('_')
                .map(w => w.charAt(0).toUpperCase() + w.slice(1))
                .join(' ');

              return (
                <div key={key} style={{ borderBottom: '1px solid #333', paddingBottom: '1rem' }}>
                  <strong style={{ color: '#c00', fontSize: '1.2rem' }}>{label}:</strong>
                  <div style={{ marginTop: '0.5rem', lineHeight: '1.7' }}>
                    {typeof value === 'string' && value.trim().startsWith('<') ? (
                      <div dangerouslySetInnerHTML={{ __html: value }} />
                    ) : value != null && value !== '' ? (
                      String(value)
                    ) : (
                      <span style={{ color: '#888' }}>—</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p>No team data available yet.</p>
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
    `https://dev-cs55nflteams.pantheonsite.io/wp-json/wp/v2/team?slug=${slug}&acf_format=standard`
  );

  if (!res.ok) return { notFound: true };
  const data = await res.json();
  const team = Array.isArray(data) && data.length > 0 ? data[0] : null;

  return team ? { props: { team }, revalidate: 60 } : { notFound: true };
};
