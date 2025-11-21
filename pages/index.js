// pages/index.js
import Head from 'next/head';
import Layout, { siteTitle } from '../components/layout';
import utilStyles from '../styles/utils.module.css';
import Link from 'next/link';
import Date from '../components/date';

const WP_BASE = 'https://dev-cs55nflteams.pantheonsite.io';

// -------------------------------------------------------------------
// Fetch all data in parallel
// -------------------------------------------------------------------
async function fetchNFLData() {
  const endpoints = [
    `${WP_BASE}/wp-json/wp/v2/player?_fields=id,title,date,acf,slug`,
    `${WP_BASE}/wp-json/wp/v2/team?_fields=id,title,date,acf,slug`,
    `${WP_BASE}/wp-json/wp/v2/coach?_fields=id,title,date,acf,slug`,
  ];

  const [playersRes, teamsRes, coachesRes] = await Promise.all(
    endpoints.map((url) => fetch(url).then((res) => res.json()))
  );

  // Transform Players
  const players = (playersRes || []).map((item) => ({
    id: item.id.toString(),
    name: item.title?.rendered || 'Unnamed Player',
    date: item.date,
    slug: item.slug || item.id.toString(),
    position: item.acf?.position || '—',
    jersey_number: item.acf?.jersey_number || '—',
    height: item.acf?.height || '—',
    weight: item.acf?.weight || '—',
    college: item.acf?.college || '—',
    statistics: item.acf?.statistics || 'No stats available',
    big_plays: item.acf?.big_plays || '—',
  }));

  // Transform Teams
  const teams = (teamsRes || []).map((item) => ({
    id: item.id.toString(),
    name: item.title?.rendered || 'Unnamed Team',
    date: item.date,
    slug: item.slug || item.id.toString(),
    city: item.acf?.city || '—',
    stadium: item.acf?.stadium || '—',
    founded: item.acf?.founded || '—',
    head_coach: item.acf?.head_coach || '—',
    owner: item.acf?.owner || '—',
    super_bowls: item.acf?.super_bowls || '0',
    conference: item.acf?.conference || '—',
    division: item.acf?.division || '—',
    records: item.acf?.records || 'No record',
  }));

  // Transform Coaches
  const coaches = (coachesRes || []).map((item) => ({
    id: item.id.toString(),
    name: item.title?.rendered || 'Unnamed Coach',
    date: item.date,
    slug: item.slug || item.id.toString(),
    role: item.acf?.role || 'Assistant Coach',
    years_experience: item.acf?.years_experience || '—',
    previous_teams: item.acf?.previous_teams || '—',
    coaching_style: item.acf?.coaching_style || '—',
    win_loss_record: item.acf?.win_loss_record || '—',
    notable_achievements: item.acf?.notable_achievements || '—',
  }));

  return { players, teams, coaches };
}

// -------------------------------------------------------------------
// Home Page Component
// -------------------------------------------------------------------
export default function Home({ players, teams, coaches }) {
  return (
    <Layout home>
      <Head>
        <title>NFL Headless CMS | {siteTitle}</title>
      </Head>

      <section className={utilStyles.headingMd}>
        <p>
          <strong>Steve A. – Full-Stack Developer | Santa Rosa, CA</strong>
        </p>
        <p>Week 14 Project – Headless WordPress + Next.js + Custom Post Types</p>
      </section>

      <Section title="Players" data={players} type="player" />
      <Section title="Teams" data={teams} type="team" />
      <Section title="Coaching Staff" data={coaches} type="coach" />
    </Layout>
  );
}

// -------------------------------------------------------------------
// Reusable Section with type-specific rendering
// -------------------------------------------------------------------
function Section({ title, data, type }) {
  if (!data || data.length === 0) {
    return (
      <section className={`${utilStyles.headingMd} ${utilStyles.padding1px}`}>
        <h2 className={utilStyles.headingLg}>{title}</h2>
        <p>No {title.toLowerCase()} found.</p>
      </section>
    );
  }

  return (
    <section className={`${utilStyles.headingMd} ${utilStyles.padding1px}`}>
      <h2 className={utilStyles.headingLg}>{title}</h2>
      <ul className={utilStyles.list}>
        {data.map((item) => (
          <li className={utilStyles.listItem} key={item.id}>
            {type === 'player' && (
              <>
                <Link href={`/players/${item.slug || item.id}`}>
                  <strong>{item.name}</strong>
                </Link>
                <br />
                <small className={utilStyles.lightText}>
                  #{item.jersey_number} • {item.position} • {item.college}
                </small>
                <div className={utilStyles.nflDetails}>
                  <strong>Height/Weight:</strong> {item.height} / {item.weight} <br />
                  <strong>Key Stats:</strong> {item.statistics} <br />
                  <strong>Big Plays:</strong> {item.big_plays}
                </div>
              </>
            )}

            {type === 'team' && (
              <>
                <Link href={`/teams/${item.slug}`}>
                  <strong>{item.name}</strong>
                </Link>
                <br />
                <small className={utilStyles.lightText}>
                  {item.city} • {item.conference} {item.division}
                </small>
                <div className={utilStyles.nflDetails}>
                  <strong>Stadium:</strong> {item.stadium} <br />
                  <strong>Head Coach:</strong> {item.head_coach} <br />
                  <strong>Super Bowls:</strong> {item.super_bowls} <br />
                  <strong>Record:</strong> {item.records}
                </div>
              </>
            )}

            {type === 'coach' && (
              <>
                <Link href={`/coaches/${item.slug || item.id}`}>
                  <strong>{item.name}</strong> ({item.role})
                </Link>
                <br />
                <small className={utilStyles.lightText}>
                  {item.years_experience}+ years experience
                </small>
                <div className={utilStyles.nflDetails}>
                  <strong>Career Record:</strong> {item.win_loss_record} <br />
                  <strong>Previous Teams:</strong> {item.previous_teams} <br />
                  <strong>Notable:</strong> {item.notable_achievements}
                </div>
              </>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}

// -------------------------------------------------------------------
// getStaticProps with ISR
// -------------------------------------------------------------------
export async function getStaticProps() {
  let data = { players: [], teams: [], coaches: [] };

  try {
    data = await fetchNFLData();
  } catch (err) {
    console.error('Failed to fetch NFL data:', err);
  }

  return {
    props: {
      players: data.players,
      teams: data.teams,
      coaches: data.coaches, // fixed: was coachingStaff
    },
    revalidate: 600, // Revalidate every 10 minutes
  };
}
