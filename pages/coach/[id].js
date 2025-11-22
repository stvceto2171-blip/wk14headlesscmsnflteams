// pages/coach/[id].js
import Layout from '../../components/layout';
import Head from 'next/head';
import Date from '../../components/date';

const WP_BASE = 'https://dev-cs55nflteams.pantheonsite.io';

export default function Coach({ coach }) {
  if (!coach) {
    return (
      <Layout>
        <Head><title>Coach Not Found</title></Head>
        <h1>Coach not found</h1>
      </Layout>
    );
  }

  return (
    <Layout>
      <Head><title>{coach.name} | Coaching Staff</title></Head>
      <article>
        <h1>{coach.name}</h1>
        <small><Date dateString={coach.date} /></small>
        <p><strong>Role:</strong> {coach.role}</p>
        <p><strong>Experience:</strong> {coach.years_experience} years</p>
        <p><strong>Record:</strong> {coach.win_loss_record}</p>
        <p><strong>Notable Achievements:</strong> {coach.notable_achievements}</p>
      </article>
    </Layout>
  );
}

// 100% SAFE getStaticPaths – never crashes build, even if endpoint doesn't exist
export async function getStaticPaths() {
  try {
    const res = await fetch(`${WP_BASE}/wp-json/wp/v2/coach`, { method: 'GET' });

    if (!res.ok || res.status === 404) {
      console.log('Coach endpoint not available → using blocking fallback');
      return { paths: [], fallback: 'blocking' };
    }

    const data = await res.json();

    // Guard against non-array responses
    if (!Array.isArray(data)) {
      console.log('Coach endpoint returned non-array → fallback');
      return { paths: [], fallback: 'blocking' };
    }

    const paths = data.map((coach) => ({
      params: { id: coach.id.toString() },
    }));

    return { paths, fallback: 'blocking' };
  } catch (err) {
    console.error('getStaticPaths error (coach):', err);
    return { paths: [], fallback: 'blocking' };
  }
}

// getStaticProps – already solid, just slightly cleaned up
export async function getStaticProps({ params }) {
  try {
    // Try by ID first (since route is [id].js)
    let res = await fetch(
      `${WP_BASE}/wp-json/wp/v2/coach/${params.id}?_fields=id,title,slug,date,acf`
    );

    // If not found by ID, try by slug (in case someone visits /coach/john-doe)
    if (!res.ok || res.status === 404) {
      res = await fetch(
        `${WP_BASE}/wp-json/wp/v2/coach?slug=${params.id}&_fields=id,title,slug,date,acf`
      );
    }

    if (!res.ok) return { notFound: true };

    const data = await res.json();
    const item = Array.isArray(data) ? data[0] : data;

    if (!item) return { notFound: true };

    const coach = {
      id: item.id.toString(),
      name: item.title.rendered,
      slug: item.slug,
      date: item.date,
      role: item.acf?.role || '—',
      years_experience: item.acf?.years_experience || '—',
      win_loss_record: item.acf?.win_loss_record || '—',
      notable_achievements: item.acf?.notable_achievements || '—',
    };

    return {
      props: { coach },
      revalidate: 600,
    };
  } catch (err) {
    console.error('Coach fetch failed:', err);
    return { notFound: true };
  }
}
