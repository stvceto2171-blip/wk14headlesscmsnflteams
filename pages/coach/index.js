// pages/coaching_staff/index.js
import Layout from '../../components/layout';
import Head from 'next/head';
import Link from 'next/link';
import Date from '../../components/date';

const WP_BASE = 'https://dev-cs55nflteams.pantheonsite.io';

export default function CoachingStaffIndex({ coaches }) {
  return (
    <Layout>
      <Head>
        <title>Coaching Staff</title>
      </Head>

      <h1>Coaching Staff</h1>

      {coaches.length === 0 ? (
        <p>No coaches found.</p>
      ) : (
        <div style={{ display: 'grid', gap: '2rem', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
          {coaches.map(({ id, name, role, years_experience, slug }) => (
            <article key={id} style={{ border: '1px solid #ddd', padding: '1.5rem', borderRadius: '8px' }}>
              <h2 style={{ margin: '0 0 0.5rem' }}>
                <Link href={`/coaching_staff/${slug || id}`}>
                  <a style={{ textDecoration: 'none', color: '#0070f3' }}>{name}</a>
                </Link>
              </h2>
              {role && <p><strong>{role}</strong></p>}
              {years_experience && <p>{years_experience} years experience</p>}
            </article>
          ))}
        </div>
      )}
    </Layout>
  );
}

export async function getStaticProps() {
  try {
    const res = await fetch(
      `${WP_BASE}/wp-json/wp/v2/coach?_fields=id,title,slug,acf.role,acf.years_experience&per_page=50`
    );
    const posts = await res.json();

    const coaches = posts.map((post) => ({
      id: post.id.toString(),
      slug: post.slug,
      name: post.title.rendered,
      role: post.acf?.role || '',
      years_experience: post.acf?.years_experience || '',
    }));

    return {
      props: { coaches },
      revalidate: 600,
    };
  } catch (err) {
    console.error('Failed to fetch coaches:', err);
    return { props: { coaches: [] }, revalidate: 60 };
  }
}
