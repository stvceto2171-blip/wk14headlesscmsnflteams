// pages/teams/index.js
import Head from 'next/head';
import Link from 'next/link';
import Layout from '../../components/layout';
import utilStyles from '../../styles/utils.module.css';

const WP_BASE = 'https://dev-cs55nflteams.pantheonsite.io';

export default function TeamsIndex({ teams }) {
  return (
    <Layout>
      <Head>
        <title>All NFL Teams | NFL Headless CMS</title>
        <meta name="description" content="Complete list of all NFL teams with links to detailed records, stats, and history." />
      </Head>

      <section className={`${utilStyles.headingMd} ${utilStyles.padding1px}`}>
        <h1 className={utilStyles.headingXl}>All NFL Teams</h1>

        {(!teams || teams.length === 0) ? (
          <p>No teams found.</p>
        ) : (
          <ul className={utilStyles.list}>
            {teams.map((team) => (
              <li className={utilStyles.listItem} key={team.id}>
                <Link href={`/teams/${team.id}`}>
                  <a className={utilStyles.headingMd}>
                    <strong>{team.name}</strong>
                  </a>
                </Link>
                <br />
                <small className={utilStyles.lightText}>
                  {team.city ? `${team.city} • ` : ''}{team.conference} {team.division}
                </small>
                <div className={utilStyles.nflDetails}>
                  <strong>Stadium:</strong> {team.stadium || '—'} <br />
                  <strong>Head Coach:</strong> {team.head_coach || '—'} <br />
                  <strong>Super Bowls:</strong> {team.super_bowls || '0'} <br />
                  <strong>Current Record:</strong> {team.records || '—'}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </Layout>
  );
}

// -------------------------------------------------------------------
// getStaticProps – matches your [id].js fields exactly
// -------------------------------------------------------------------
export async function getStaticProps() {
  try {
    const res = await fetch(
      `${WP_BASE}/wp-json/wp/v2/team?_fields=id,title.rendered,slug,date,acf`
    );
    const rawTeams = await res.json();

    const teams = rawTeams.map((t) => ({
      id: t.id.toString(),
      name: t.title.rendered,
      slug: t.slug,
      date: t.date,
      // ACF fields used in your single team page + extra useful ones
      city: t.acf?.city || null,
      stadium: t.acf?.stadium || null,
      conference: t.acf?.conference || '—',
      division: t.acf?.division || '—',
      head_coach: t.acf?.head_coach || null,
      super_bowls: t.acf?.super_bowls || '0',
      records: t.acf?.records || '—',
      statistics: t.acf?.statistics || null,
      past_performances: t.acf?.past_performances || null,
      big_plays: t.acf?.big_plays || null,
    }));

    return {
      props: {
        teams,
      },
      revalidate: 600, // 10 minutes ISR – same as your detail pages
    };
  } catch (error) {
    console.error('Failed to fetch teams list:', error);
    return {
      props: {
        teams: [],
      },
      revalidate: 600,
    };
  }
}
