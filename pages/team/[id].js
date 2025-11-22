// pages/teams/[id].js
import Layout from '../../components/layout';
import Head from 'next/head';
import Date from '../../components/date';
import utilStyles from '../../styles/utils.module.css';

const WP_BASE = 'https://dev-cs55nflteams.pantheonsite.io';

export default function Team({ team }) {
  if (!team) {
    return (
      <Layout>
        <Head><title>Team Not Found</title></Head>
        <h1>Team Not Found</h1>
      </Layout>
    );
  }

  return (
    <Layout>
      <Head><title>{team.name} | NFL Teams</title></Head>
      <article>
        <h1 className={utilStyles.headingXl}>{team.name}</h1>
        <div className={utilStyles.lightText}>
          Added on <Date dateString={team.date} />
        </div>
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

// SAFE getStaticPaths – will NEVER crash your Vercel build
export async function getStaticPaths() {
  try {
    const res = await fetch(`${WP_BASE}/wp-json/wp/v2/team`, { method: 'GET' });

    // If the CPT endpoint doesn't exist (404) or any error → just use blocking fallback
    if (!res.ok) {
      console.log('Team endpoint not reachable → using blocking fallback');
      return { paths: [], fallback: 'blocking' };
    }

    const data = await res.json();

    // WordPress sometimes returns {} or error object instead of []
    if (!Array.isArray(data)) {
      console.log('Team endpoint returned non-array → using blocking fallback');
      return { paths: [], fallback: 'blocking' };
    }

    const paths = data.map((t) => ({
      params: { id: t.id.toString() },
    }));

    return { paths, fallback: 'blocking' };
  } catch (err) {
    console.error('getStaticPaths error (teams):', err);
    return { paths: [], fallback: 'blocking' };
  }
}

// getStaticProps – already safe, just wrapped in try/catch for extra protection
export async function getStaticProps({ params }) {
  try {
    const res = await fetch(
      `${WP_BASE}/wp-json/wp/v2/team/${params.id}?_fields=id,title,date,acf`
    );

    if (!res.ok) return { notFound: true };

    const post = await res.json();

    const team = {
      id: post.id.toString(),
      name: post.title.rendered,
      date: post.date,
      records: post.acf?.records || '—',
      statistics: post.acf?.statistics || '—',
      past_performances: post.acf?.past_performances || '—',
      big_plays: post.acf?.big_plays || '—',
    };

    return {
      props: { team },
      revalidate: 600,
    };
  } catch (err) {
    console.error('getStaticProps failed for team ID:', params.id);
    return { notFound: true };
  }
}
