// pages/coaching-staff/[id].js
import Layout from '../../components/layout';
import Head from 'next/head';
import Date from '../../components/date';
import utilStyles from '../../styles/utils.module.css';

const WP_BASE = 'https://dev-cs55nflteams.pantheonsite.io';

export default function Coach({ coach }) {
  if (!coach) return <Layout><Head><title>Coach Not Found</title></Head><h1>Coach Not Found</h1></Layout>;

  return (
    <Layout>
      <Head><title>{coach.name} | Coaching Staff</title></Head>
      <article>
        <h1 className={utilStyles.headingXl}>{coach.name}</h1>
        <div className={utilStyles.lightText}><Date dateString={coach.date} /></div>

        <div className={utilStyles.nflGrid}>
          <div><strong>Records:</strong><br />{coach.records || '—'}</div>
          <div><strong>Statistics:</strong><br />{coach.statistics || '—'}</div>
          <div><strong>Past Performances:</strong><br />{coach.past_performances || '—'}</div>
          <div><strong>Big Plays / Achievements:</strong><br />{coach.big_plays || '—'}</div>
        </div>
      </article>
    </Layout>
  );
}

export async function getStaticPaths() {
  const res = await fetch(`${WP_BASE}/wp-json/wp/v2/coach`);
  const staff = await res.json();
  const paths = staff.map((s) => ({ params: { id: s.id.toString() } }));
  return { paths, fallback: 'blocking' };
}

export async function getStaticProps({ params }) {
  const res = await fetch(`${WP_BASE}/wp-json/wp/v2/coach/${params.id}?_fields=id,title,date,acf`);
  if (!res.ok) return { notFound: true };
  const post = await res.json();

  const coach = {
    name: post.title.rendered,
    date: post.date,
    records: post.acf?.records || '—',
    statistics: post.acf?.statistics || '—',
    past_performances: post.acf?.past_performances || '—',
    big_plays: post.acf?.big_plays || '—',
  };

  return { props: { coach }, revalidate: 600 };
}
