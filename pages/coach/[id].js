// pages/coach/[id].js   OR   pages/coach/[slug].js
import Layout from '../../components/layout';
import Date from '../../components/date';

export default function Coach({ coach }) {
  if (!coach) {
    return <Layout><h1>Coach not found</h1></Layout>;
  }

  return (
    <Layout>
      <article>
        <h1>{coach.name}</h1>
        <small><Date dateString={coach.date} /></small>
        <p><strong>Role:</strong> {coach.role}</p>
        <p><strong>Experience:</strong> {coach.years_experience} years</p>
        <p><strong>Record:</strong> {coach.win_loss_record}</p>
        <p><strong>Notable:</strong> {coach.notable_achievements}</p>
      </article>
    </Layout>
  );
}

// This version NEVER crashes the build even if WP is down
export async function getStaticPaths() {
  return {
    paths: [],              // Generate no paths at build time
    fallback: 'blocking',   // Will fetch on-demand on first request
  };
}

export async function getStaticProps({ params }) {
  const WP_BASE = 'https://dev-cs55nflteams.pantheonsite.io';
  const slugOrId = params.id || params.slug;

  try {
    const res = await fetch(
      `${WP_BASE}/wp-json/wp/v2/coach?slug=${slugOrId}&_fields=id,title,acf,slug,date`
    );

    if (!res.ok) throw new Error('Not found');

    const data = await res.json();
    const item = data[0];

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

    return { props: { coach }, revalidate: 600 };
  } catch (err) {
    console.error('Coach fetch failed:', err.message);
    return { notFound: true };  // Graceful 404 instead of crashing build
  }
}
