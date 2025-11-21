// pages/teams/[id].js
import Layout from '../../components/layout';
import Head from 'next/head';
import Date from '../../components/date';
import utilStyles from '../../styles/utils.module.css';

const WP_BASE = 'https://dev-cs55nflteams.pantheonsite.io';

export default function Team({ team }) {
  if (!team) return <Layout><Head><title>Team Not Found</title></Head><h1>Team Not Found</h1></Layout>;

  return (
    <Layout>
      <Head><title>{team.name} | NFL Teams</title></Head>
      <article>
        <h1 className={utilStyles.headingXl}>{team.name}</h1>
        <div className={utilStyles.lightText}><Date dateString={team.date} /></div>

        <div className={utilStyles.nflGrid}>
          <div><strong>Records:</strong><br />{team.records || '—'}</div>
          <div><strong>Statistics:</strong><br />{team.statistics || '—'}</div>
          <div><strong>Past Performances:</strong><br />{team.past_performances || '—'}</div>
          <div><strong>Big Plays:</strong><br />{team.big_plays || '—'}</div>
        </div>
      </article>
    </Layout>
  );
}

export async function getStaticPaths() {
  const res = await fetch(`${WP_BASE}/wp-json/wp/v2/team`);
  const teams = await res.json();
  const paths = teams.map((t) => ({ params: { id: t.id.toString() } }));
  return { paths, fallback: 'blocking' };
}

export async function getStaticProps({ params }) {
  const res = await fetch(`${WP_BASE}/wp-json/wp/v2/team/${params.id}?_fields=id,title,date,acf`);
  if (!res.ok) return { notFound: true };
  const post = await res.json();

  const team = {
    name: post.title.rendered,
    date: post.date,
    records: post.acf?.records || '—',
    statistics: post.acf?.statistics || '—',
    past_performances: post.acf?.past_performances || '—',
    big_plays: post.acf?.big_plays || '—',
  };

  return { props: { team }, revalidate: 600 };
}
