// pages/coaches/[slug].tsx
import Layout from '@/components/layout';
import Head from 'next/head';
import { GetStaticPaths, GetStaticProps } from 'next';
import { getAllCoachSlugs, getCoachData } from '@/lib/posts';

export default function CoachPage({ coach }: { coach: any }) {
  if (!coach) {
    return (
      <Layout home={false}>
        <Head><title>Coach Not Found</title></Head>
        <h1>Coach Not Found</h1>
      </Layout>
    );
  }

  return (
    <Layout home={false}>
      <Head><title>{coach.title} | NFL Coach</title></Head>

      <article>
        <h1>{coach.title}</h1>

        {coach.featuredImage && (
          <img
            src={coach.featuredImage}
            alt={coach.title}
            style={{ maxWidth: '100%', borderRadius: '12px', marginBottom: '2rem' }}
          />
        )}

        <div style={{ marginTop: '3rem', display: 'grid', gap: '1.8rem', fontSize: '1.1rem' }}>
          {Object.entries(coach.acf || {}).map(([key, value]) => {
            const label = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

            // Proper type guard for ACF image objects
            const isImageObject = value && typeof value === 'object' && 'url' in value && typeof (value as any).url === 'string';

            if (isImageObject) {
              return (
                <div key={key}>
                  <strong style={{ color: '#0066cc' }}>{label}:</strong><br />
                  <img
                    src={(value as any).url}
                    alt={label}
                    style={{ maxWidth: '300px', marginTop: '0.5rem', borderRadius: '8px' }}
                  />
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
  const paths = await getAllCoachSlugs();
  return { paths, fallback: 'blocking' };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const slug = params?.slug as string;
  const coach = slug ? await getCoachData(slug) : null;
  return coach ? { props: { coach }, revalidate: 60 } : { notFound: true };
};
