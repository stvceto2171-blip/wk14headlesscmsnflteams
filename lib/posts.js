// lib/wp.js
// Central WordPress data layer for Teams, Players & Coaches (ACF CPTs)

const WP_URL = "https://dev-cs55nflteams.pantheonsite.io";
const API_BASE = `${WP_URL}/wp-json/wp/v2`;

// ------------------------------------------------------------------
// Generic fetcher – gets ALL published posts of any CPT with ACF + embeds
// ------------------------------------------------------------------
async function fetchAllFromCPT(cpt) {
  const endpoint = `${API_BASE}/${cpt}`;
  const allItems = [];
  let page = 1;
  const perPage = 100;

  while (true) {
    const url = new URL(endpoint);
    url.searchParams.append("per_page", perPage);
    url.searchParams.append("page", page);
    url.searchParams.append("status", "publish");
    url.searchParams.append("acf_format", "standard");
    url.searchParams.append("_embed", "true"); // featured image, author, etc.

    const res = await fetch(url, {
      next: { revalidate: 60 }, // ISR: refresh every 60 seconds
    });

    if (!res.ok) {
      const text = await res.text();
      console.error(`WP API Error [${cpt} page ${page}]:`, res.status, text);
      break;
    }

    const items = await res.json();

    if (!Array.isArray(items) || items.length === 0) break;

    allItems.push(...items);

    if (items.length < perPage) break;
    page++;
  }

  return allItems;
}

// ------------------------------------------------------------------
// TEAMS
// ------------------------------------------------------------------
export async function getAllTeams() {
  return await fetchAllFromCPT("teams");
}

export async function getAllTeamSlugs() {
  const teams = await getAllTeams();
  return teams.map((team) => ({
    params: { slug: team.slug },
  }));
}

export async function getTeamData(slug) {
  const teams = await getAllTeams();
  const team = teams.find((t) => t.slug === slug);
  if (!team) return null;

  return {
    slug: team.slug,
    title: team.title?.rendered || "Unnamed Team",
    date: team.date,
    content: team.content?.rendered || "",
    acf: team.acf || {},
    featuredImage: team._embedded?.["wp:featuredmedia"]?.[0]?.source_url || null,
  };
}

// ------------------------------------------------------------------
// PLAYERS
// ------------------------------------------------------------------
export async function getAllPlayers() {
  return await fetchAllFromCPT("players");
}

export async function getAllPlayerSlugs() {
  const players = await getAllPlayers();
  return players.map((player) => ({
    params: { slug: player.slug },
  }));
}

export async function getPlayerData(slug) {
  const players = await getAllPlayers();
  const player = players.find((p) => p.slug === slug);
  if (!player) return null;

  return {
    slug: player.slug,
    title: player.title?.rendered || "Unnamed Player",
    date: player.date,
    content: player.content?.rendered || "",
    acf: player.acf || {},
    featuredImage: player._embedded?.["wp:featuredmedia"]?.[0]?.source_url || null,
    // Example easy access to common ACF fields
    number: player.acf?.jersey_number || player.acf?.number || null,
    position: player.acf?.position || null,
    team: player.acf?.team?.post_name || null, // if using Post Object field
  };
}

// ------------------------------------------------------------------
// COACHES
// ------------------------------------------------------------------
export async function getAllCoaches() {
  return await fetchAllFromCPT("coaches");
}

export async function getAllCoachSlugs() {
  const coaches = await getAllCoaches();
  return coaches.map((coach) => ({
    params: { slug: coach.slug },
  }));
}

export async function getCoachData(slug) {
  const coaches = await getAllCoaches();
  const coach = coaches.find((c) => c.slug === slug);
  if (!coach) return null;

  return {
    slug: coach.slug,
    title: coach.title?.rendered || "Unnamed Coach",
    date: coach.date,
    content: coach.content?.rendered || "",
    acf: coach.acf || {},
    featuredImage: coach._embedded?.["wp:featuredmedia"]?.[0]?.source_url || null,
    role: coach.acf?.role || coach.acf?.position || null,
  };
}

// ------------------------------------------------------------------
// BONUS: Get all data for homepage or navigation
// ------------------------------------------------------------------
export async function getHomepageData() {
  const [teams, players, coaches] = await Promise.all([
    getAllTeams(),
    getAllPlayers(),
    getAllCoaches(),
  ]);

  return {
    teams: teams.map((t) => ({
      slug: t.slug,
      name: t.title.rendered,
      logo: t.acf?.logo?.url || t._embedded?.["wp:featuredmedia"]?.[0]?.source_url || null,
      conference: t.acf?.conference || null,
    })),
    recentPlayers: players.slice(0, 6).map((p) => ({
      slug: p.slug,
      name: p.title.rendered,
      number: p.acf?.jersey_number || null,
      photo: p._embedded?.["wp:featuredmedia"]?.[0]?.source_url || null,
    })),
    headCoaches: coaches
      .filter((c) => (c.acf?.role || "").toLowerCase().includes("head"))
      .map((c) => ({
        slug: c.slug,
        name: c.title.rendered,
        photo: c._embedded?.["wp:featuredmedia"]?.[0]?.source_url || null,
      })),
  };
}
