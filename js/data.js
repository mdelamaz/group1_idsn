// =============================================================
//  STREAMONOMICS — data.js
//  Fetches all three PHP endpoints, loads into memory,
//  then populates the tables on data.html
// =============================================================

// --- Endpoint URLs ---
const ENDPOINTS = {
  cpm:   'https://mdelamaz.webdev.iyaserver.com/json%20outputs%20of%20data/cpm_benchmarks_data.php',
  merch: 'https://mdelamaz.webdev.iyaserver.com/json%20outputs%20of%20data/merch_pricing_data.php',
  col:   'https://mdelamaz.webdev.iyaserver.com/json%20outputs%20of%20data/cost_of_living_data.php'
};

// --- In-memory data stores ---
let CITIES = {};
let CPM    = {};
let MERCH  = {};

// =============================================================
//  1. FETCH & BUILD — load all data into memory
// =============================================================

async function initAllData() {
  try {
    const [colRaw, cpmRaw, merchRaw] = await Promise.all([
      fetch(ENDPOINTS.col).then(r => r.json()),
      fetch(ENDPOINTS.cpm).then(r => r.json()),
      fetch(ENDPOINTS.merch).then(r => r.json())
    ]);

    buildCities(colRaw);
    buildCPM(cpmRaw);
    buildMerch(merchRaw);

    // Once all data is in memory, populate the tables
    populateStreamingTable();
    populateSocialTable();

    console.log('✅ All data loaded into memory');
    console.log('CITIES:', CITIES);
    console.log('CPM:', CPM);
    console.log('MERCH:', MERCH);

  } catch (err) {
    console.error('❌ Failed to load data:', err);
  }
}

// --- Build CITIES lookup (keyed by MetroArea, values converted to monthly) ---
function buildCities(rows) {
  rows.forEach(row => {
    CITIES[row.MetroArea] = {
      state:          row.State,
      livingWage:     (parseFloat(row.LivingWage) * 40 * 52) / 12,
      housing:        parseFloat(row.Housing)           / 12,
      food:           parseFloat(row.Food)              / 12,
      medical:        parseFloat(row.Medical)           / 12,
      transportation: parseFloat(row.Transportation)    / 12,
      civic:          parseFloat(row.Civic)             / 12,
      internet:       parseFloat(row['Internet&Mobile'])/ 12,
      other:          parseFloat(row.Other)             / 12,
      postTaxMin:     parseFloat(row['Post-taxIncomeMin']) / 12
    };
  });
}

// --- Build CPM lookup (keyed by Tier → platform, null for missing values) ---
function buildCPM(rows) {
  rows.forEach(row => {
    if (!CPM[row.Tier]) CPM[row.Tier] = {};
    const mid = parseFloat(row.cpm_mid);
    CPM[row.Tier][row.platform] = mid > 0 ? mid : null;
  });
  // Mid-tier TikTok is often missing from source data; use average of Micro + Macro TikTok when absent
  if (CPM.Mid) {
    const microTk = CPM.Micro && CPM.Micro.tiktok;
    const macroTk = CPM.Macro && CPM.Macro.tiktok;
    if ((CPM.Mid.tiktok == null || CPM.Mid.tiktok === 0) && microTk && macroTk) {
      CPM.Mid.tiktok = (microTk + macroTk) / 2;
    } else if ((CPM.Mid.tiktok == null || CPM.Mid.tiktok === 0) && (microTk || macroTk)) {
      CPM.Mid.tiktok = microTk || macroTk;
    }
  }
}

// --- Build MERCH lookup (keyed by item_key) ---
function buildMerch(rows) {
  rows.forEach(row => {
    MERCH[row.item_key] = {
      name:   row.item_name,
      retail: parseFloat(row.retail_price),
      margin: parseFloat(row.margin_pct),
      profit: parseFloat(row.profit_per_unit)
    };
  });
}

// =============================================================
//  2. POPULATE TABLES — inject rows into data.html
// =============================================================

// --- Dataset 01: Streaming revenue (CPM by Tier, Spotify as streaming proxy) ---
function populateStreamingTable() {
  const tbody = document.getElementById('tbody-streaming');
  if (!tbody) return;

  tbody.innerHTML = '';

  const tiers = ['Nano', 'Micro', 'Mid', 'Macro'];

  tiers.forEach(tier => {
    const cpmData = CPM[tier];
    if (!cpmData) return;

    const spotifyCPM = cpmData['spotify'];
    const tierData   = Object.values(CPM[tier] || {});

    // Use midpoint of views range from the raw data as representative streams
    const viewRanges = {
      Nano:  { low: 5000,    high: 20000   },
      Micro: { low: 20000,   high: 200000  },
      Mid:   { low: 200000,  high: 1000000 },
      Macro: { low: 1000000, high: 5000000 }
    };

    const range       = viewRanges[tier];
    const midStreams   = Math.round((range.low + range.high) / 2);
    const monthlyIncome = spotifyCPM
      ? ((spotifyCPM / 1000) * midStreams).toFixed(2)
      : 'N/A';

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${tier}</td>
      <td>${midStreams.toLocaleString()}</td>
      <td>${monthlyIncome !== 'N/A' ? '$' + parseFloat(monthlyIncome).toLocaleString() : 'N/A'}</td>
      <td>Spotify CPM: $${spotifyCPM ?? 'N/A'}</td>
    `;
    tbody.appendChild(tr);
  });
}

// --- Dataset 02: Social media revenue (CPM by Platform, Mid tier as baseline) ---
function populateSocialTable() {
  const tbody = document.getElementById('tbody-social');
  if (!tbody) return;

  tbody.innerHTML = '';

  const platforms = ['instagram', 'tiktok', 'youtube'];
  const baseTier  = 'Mid'; // Use Mid tier as the baseline for this table
  const baseViews = 500000; // Midpoint of Mid tier range

  platforms.forEach(platform => {
    const cpm = CPM[baseTier] && CPM[baseTier][platform];
    const monthlyIncome = cpm
      ? ((cpm / 1000) * baseViews).toFixed(2)
      : 'N/A';

    const platformLabels = {
      instagram: 'Instagram',
      tiktok:    'TikTok',
      youtube:   'YouTube'
    };

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${platformLabels[platform]}</td>
      <td>${baseViews.toLocaleString()}</td>
      <td>${monthlyIncome !== 'N/A' ? '$' + parseFloat(monthlyIncome).toLocaleString() : 'N/A'}</td>
      <td>CPM: $${cpm ?? 'Not available'}</td>
    `;
    tbody.appendChild(tr);
  });
}

// =============================================================
//  3. INIT — run everything on page load
// =============================================================

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('tbody-streaming')) {
    initAllData();
  }
});