// pages/teams/[slug].tsx
import Layout from '@/components/layout';
import Head from 'next/head';
import { GetStaticPaths, GetStaticProps } from 'next';
import { getAllTeamSlugs, getTeamData } from '@/lib/post';   // ← your real file

export default function TeamPage({ team }: { team: any }) {
  if (!team) {
    return (
      <Layout home={false}>
        <Head><title>Team Not Found</title></Head>
        <h1>Team Not Found</h1>
      </Layout>
    );
  }

  return (
    <Layout home={false}>
      <Head><title>{team.title} | NFL Team</title></Head>

      <article>
        <h1>{team.title}</h1>

        {team.featuredImage && (
          <img
            src={team.featuredImage}
            alt={team.title}
            style={{ maxWidth: '100%', borderRadius: '12px', marginBottom: '2rem' }}
          />
        )}

        <div style={{ marginTop: '3rem', display: 'grid', gap: '1.8rem', fontSize: '1.1rem' }}>
          {Object.entries(team.acf).map(([key, value]) => {
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
  const paths = await getAllTeamSlugs();
  return { paths, fallback: 'blocking' };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const slug = params?.slug as string;
  const team = slug ? await getTeamData(slug) : null;

  return team
    ? { props: { team }, revalidate: 60 }
    : { notFound: true };
};
