// =============================================================
//  STREAMONOMICS — simulator.js
//  Depends on data.js being loaded first (CITIES, CPM, MERCH)
// =============================================================

// =============================================================
//  STATE OBJECT — single source of truth across all screens
// =============================================================

let S = {
  // Screen 1
  city:         null,   // e.g. "Los Angeles"

  // Screen 2
  audienceTier: 0,      // 0=Nano, 1=Micro, 2=Mid, 3=Macro
  fanStrength:  0,     // 0–100

  // Screen 3
  strategy: {
    streaming: 5,       // 1–10
    social:    5,       // 1–10
    touring:   5,       // 1–10
    merch:     5        // 1–10
  },

  // Screen 4 controls
  showsPerMonth: 4,
  artistCut:     15,    // percent
  attachRate:    10,    // percent
  merchItems:    ['tshirt'],

  // Computed income (updated by calcIncome())
  income: {
    streaming: 0,
    social:    0,
    touring:   0,
    merch:     0,
    total:     0
  }
};

// =============================================================
//  CONSTANTS
// =============================================================

const TIER_NAMES   = ['Nano', 'Micro', 'Mid', 'Macro'];
const TIER_STREAMS = {
  Nano:  { low: 5000,    high: 20000,   mid: 12500  },
  Micro: { low: 20000,   high: 200000,  mid: 110000 },
  Mid:   { low: 200000,  high: 1000000, mid: 600000 },
  Macro: { low: 1000000, high: 5000000, mid: 3000000}
};
const TIER_HINTS = {
  Nano:  '5K–20K monthly listeners',
  Micro: '20K–200K monthly listeners',
  Mid:   '200K–1M monthly listeners',
  Macro: '1M–5M monthly listeners'
};
const VENUE_TYPES = {
  Nano:  { label: 'Local Bar / Open Mic',  cap: 100,  ticket: 10  },
  Micro: { label: 'Club / Small Theater',  cap: 500,  ticket: 20  },
  Mid:   { label: 'Mid-size Theater',      cap: 2500, ticket: 35  },
  Macro: { label: 'Arena / Large Venue',   cap: 10000,ticket: 75  }
};
const ARTIST_TYPES = {
  Nano:  'Emerging Artist',
  Micro: 'Growing Artist',
  Mid:   'Established Artist',
  Macro: 'Major Artist'
};

  const LIVE_VENUES = {
  small:  { cap: 200,   price: 30 },
  medium: { cap: 700,   price: 60 },
  large:  { cap: 3000,  price: 90 },
  arena:  { cap: 10000, price: 120 }
};

// Chart instances (so we can destroy/recreate on updates)
let chartStrategy  = null;
let chartIncomeMix = null;
let chartGrowth    = null;

// =============================================================
//  SCREEN NAVIGATION
// =============================================================

let currentScreen = 0;

function goTo(n) {
  // Hide all screens
  document.querySelectorAll('.sim-screen').forEach(el => el.classList.remove('active'));
  // Show target
  document.getElementById('screen-' + n).classList.add('active');
  currentScreen = n;

  // On entering screen 4, calculate and populate engines
  if (n === 4) {
    calcIncome();
    populateEngines();
  }

  // On entering screen 5, calculate and populate results
  if (n === 5) {
    calcIncome();
    populateResults();
  }

  // Scroll to top
  window.scrollTo(0, 0);
}

// =============================================================
//  SCREEN 1: CITY HANDLERS
// =============================================================

function populateCityDropdown() {
  const select = document.getElementById('city-select');
  if (!select) return;

  // Sort cities alphabetically
  const cities = Object.keys(CITIES).sort();
  cities.forEach(city => {
    const opt = document.createElement('option');
    opt.value = city;
    opt.textContent = city + ', ' + CITIES[city].state;
    select.appendChild(opt);
  });
}

function onCityChange() {
  const select  = document.getElementById('city-select');
  const city    = select.value;
  if (!city) return;

  S.city = city;
  const data = CITIES[city];

  // Show the right panel
  document.getElementById('city-panel').style.display = 'block';

  // Populate cost breakdown
  document.getElementById('panel-city-name').textContent = city + ', ' + data.state;
  document.getElementById('cost-housing').textContent    = fmt(data.housing);
  document.getElementById('cost-food').textContent       = fmt(data.food);
  document.getElementById('cost-transport').textContent  = fmt(data.transportation);
  document.getElementById('cost-medical').textContent    = fmt(data.medical);
  document.getElementById('cost-internet').textContent   = fmt(data.internet);
  document.getElementById('cost-civic').textContent      = fmt(data.civic);
  document.getElementById('cost-other').textContent      = fmt(data.other);

  const total = data.housing + data.food + data.transportation +
                data.medical + data.internet + data.civic + data.other;

  document.getElementById('cost-total').textContent    = fmt(total);
 

  // Enable next button
  document.getElementById('btn-1-next').disabled = false;

  // Update status bar
  updateStatusBar();
}

// =============================================================
//  SCREEN 2: AUDIENCE HANDLERS
// =============================================================

function onAudienceChange() {
  S.fanStrength = parseInt(document.getElementById('slider-fanstrength').value);

  function setText(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  }

  const selectedPlatforms = Array.from(
    document.querySelectorAll(".aud-platform:checked")
  ).map(el => el.value);

  const streamingEnabled = selectedPlatforms.length > 0;
  const liveEnabled = document.getElementById('aud-live')?.checked;

  const streamingSize = document.getElementById('streaming-size')?.value;
  const liveSize = document.getElementById('live-size')?.value;

  const liveBlock = document.getElementById("audience-live-size");
if (liveBlock) {
  liveBlock.style.display = liveEnabled ? "block" : "none";
}

  // show/hide streaming size
  const streamingBlock = document.getElementById("audience-streaming-size");
  if (streamingBlock) {
    streamingBlock.style.display = streamingEnabled ? "block" : "none";
  }

  

  let reach = 0;
  let mix = [];

  S.audienceTier = null;

  // ----------------------------
  // EARLY STATE
  // ----------------------------
  if (
    selectedPlatforms.length === 0 &&
    (!liveEnabled || !liveSize)
  ) {
    setText("profile-mix", "—");
    setText("profile-reach", "—");
    setText("profile-engagement", S.fanStrength + "%");

    setText("logic-output", "Select platforms or live performance to define your reach.");

    updateStatusBar();
    return;
  }

  // ----------------------------
  // PLATFORM LABELS (ALWAYS SHOW)
  // ----------------------------
  if (selectedPlatforms.length > 0) {
    const platformLabels = selectedPlatforms.map(
      p => p.charAt(0).toUpperCase() + p.slice(1)
    );

    mix.push(platformLabels.join(", "));
  }

  // ----------------------------
  // STREAMING REACH
  // ----------------------------
  const tierMap = {
    nano: 0,
    micro: 1,
    mid: 2,
    macro: 3
  };

  const reachMap = {
    nano: 10000,
    micro: 50000,
    mid: 200000,
    macro: 1000000
  };

  if (streamingEnabled && streamingSize) {
    S.audienceTier = tierMap[streamingSize];

    const baseReach = reachMap[streamingSize];

    const platformMultiplier = 1 + (selectedPlatforms.length - 1) * 0.1;
    const cappedMultiplier = Math.min(platformMultiplier, 1.25);

    reach += Math.round(baseReach * cappedMultiplier);
  }

  // ----------------------------
  // LIVE
  // ----------------------------
  if (liveEnabled && liveSize) {
    const venueMap = {
      small: 200,
      medium: 700,
      large: 3000,
      arena: 10000
    };

    reach += venueMap[liveSize] * 4;
    mix.push("Live");
  }

  // ----------------------------
  // ENGAGEMENT
  // ----------------------------
  if (reach > 0) {
    const engagementMult = 0.5 + (S.fanStrength / 100) * 0.5;
    reach = Math.round(reach * engagementMult);
  }

  // ----------------------------
  // UI
  // ----------------------------
  setText("profile-mix", mix.join(" + "));
  setText("profile-reach", reach.toLocaleString());
  setText("profile-engagement", S.fanStrength + "%");

  // ----------------------------
  // LOGIC TEXT
  // ----------------------------
  const logicEl = document.getElementById("logic-output");

  if (logicEl) {
    let text = `You reach about ${reach.toLocaleString()} people per month. `;

    if (S.fanStrength < 20) {
      text += "Most of your audience is passive — awareness is high, but engagement is low.";
    } else if (S.fanStrength < 40) {
      text += "Your audience is casual — some interest, limited action.";
    } else if (S.fanStrength < 60) {
      text += "You have an engaged audience with growing conversion potential.";
    } else if (S.fanStrength < 80) {
      text += "Your core fans are reliable and likely to support you.";
    } else {
      text += "You have superfans — strong loyalty and high monetization potential.";
    }

    logicEl.innerText = text;
  }

  updateStatusBar();
}

// =============================================================
//  SCREEN 3: Income Engine HANDLERS
// =============================================================

function onStrategyChange() {
  S.streamingActivity = parseInt(document.getElementById('strat-streaming')?.value || 5);

  const el = document.getElementById('val-streaming');
  if (el) {
    el.textContent = S.streamingActivity;
  }

  calcIncome();
  updateStatusBar();
  updateStrategyFeedback();
  updateIncomeChart();
}


function onTouringChange() {
  S.showsPerMonth = parseInt(document.getElementById('slider-shows')?.value || 4);
  S.artistCut     = parseInt(document.getElementById('slider-cut')?.value || 15);

  const showsEl = document.getElementById('val-shows');
  const cutEl   = document.getElementById('val-cut');

  if (showsEl) showsEl.textContent = S.showsPerMonth;
  if (cutEl)   cutEl.textContent   = S.artistCut + "%";

  calcIncome();
  updateStatusBar();
  updateStrategyFeedback();
  updateIncomeChart();
}


function onMerchChange() {
  S.attachRate = parseInt(document.getElementById('slider-attach')?.value || 10);

  const attachEl = document.getElementById('val-attach');
  if (attachEl) attachEl.textContent = S.attachRate + "%";

  S.merchItems = [];
  if (document.getElementById('merch-tshirt')?.checked) S.merchItems.push('tshirt');
  if (document.getElementById('merch-vinyl')?.checked)  S.merchItems.push('vinyl');
  if (document.getElementById('merch-hoodie')?.checked) S.merchItems.push('hoodie');

  calcIncome();
  updateStatusBar();
  updateStrategyFeedback();
  updateIncomeChart();
}

function updateIncomeChart() {
  const canvas = document.getElementById('chart-income');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');

  if (window.chartIncome) {
    window.chartIncome.destroy();
  }

  const values = [
    S.income.streaming,
    S.income.touring,
    S.income.merch
  ];

  const total = values.reduce((a, b) => a + b, 0);

  const safeValues = total === 0 ? [1, 1, 1] : values;

  window.chartIncome = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: ['Streaming', 'Touring', 'Merch'],
      datasets: [{
        data: safeValues,
        backgroundColor: [
          '#6366f1',
          '#10b981',
          '#f59e0b'
        ]
      }]
    },
    options: {
      responsive: false,
      plugins: {
        legend: {
          position: 'bottom'
        }
      }
    }
  });
}

function updateStrategyFeedback() {
  const msg = document.getElementById('reaction-message');
  const touringEl = document.getElementById('profile-touring-focus');
  const merchEl = document.getElementById('profile-merch-focus');
  const streamingEl = document.getElementById('profile-streaming-focus');

  // Guard: if elements aren't on screen yet, do nothing
  if (!msg || !touringEl || !merchEl || !streamingEl) return;

  // --- Touring ---
  let touringLevel = "Low";
  if (S.showsPerMonth > 10) touringLevel = "High";
  else if (S.showsPerMonth > 5) touringLevel = "Moderate";

  // --- Merch ---
  let merchLevel = "Weak";
  if (S.attachRate > 20) merchLevel = "Strong";
  else if (S.attachRate > 10) merchLevel = "Moderate";

  // --- Streaming ---
  let streamingLevel = "Light";
  if (S.streamingActivity > 7) streamingLevel = "Aggressive";
  else if (S.streamingActivity > 4) streamingLevel = "Balanced";

// --- Touring ---
touringEl.textContent = touringLevel;
touringEl.className = "card-value " + (
  touringLevel === "High" ? "high" :
  touringLevel === "Moderate" ? "balanced" :
  "weak"
);

// --- Merch ---
merchEl.textContent = merchLevel;
merchEl.className = "card-value " + (
  merchLevel === "Strong" ? "high" :
  merchLevel === "Moderate" ? "balanced" :
  "weak"
);

// --- Streaming ---
streamingEl.textContent = streamingLevel;
streamingEl.className = "card-value " + (
  streamingLevel === "Aggressive" ? "high" :
  streamingLevel === "Balanced" ? "balanced" :
  "weak"
);

  // --- Message ---
  let text = "";

  if (touringLevel === "High") {
    text += "You're relying heavily on touring. High income potential, but demanding. ";
  } else if (touringLevel === "Low") {
    text += "Low touring activity limits your income potential. ";
  }

  if (merchLevel === "Strong") {
    text += "Your fans are highly engaged and likely to spend. ";
  }

  if (streamingLevel === "Aggressive") {
    text += "You're prioritizing audience growth. ";
  }

  if (!text) {
    text = "Balanced strategy across income streams.";
  }

  msg.textContent = text;
}


// =============================================================
//  CORE INCOME CALCULATIONS
// =============================================================

function calcIncome() {

  // --- Reset ---
  S.income.streaming = 0;
  S.income.social = 0;
  S.income.touring = 0;
  S.income.merch = 0;
  S.income.total = 0;

  const selectedPlatforms = Array.from(
  document.querySelectorAll(".aud-platform:checked")
);

const streamingEnabled = selectedPlatforms.length > 0;
  const streamingSize = document.getElementById('streaming-size')?.value;

  const liveEnabled = document.getElementById('aud-live')?.checked;
  const liveSize = document.getElementById('live-size')?.value;

  const fanMult = S.fanStrength / 100;

  let attendance = 0; // 👈 important (used later)

  // -------------------
  // STREAMING
  // -------------------
  if (streamingEnabled && streamingSize) {

    const tierMap = {
      nano: "Nano",
      micro: "Micro",
      mid: "Mid",
      macro: "Macro"
    };

    const tierName = tierMap[streamingSize];

    const streams = TIER_STREAMS[tierName].mid;
    const cpm = CPM[tierName]?.spotify || 0;

    const streamingWeight = S.strategy.streaming / 10;

    S.income.streaming = (cpm / 1000) * streams * streamingWeight;
  }

  // -------------------
  // TOURING
  // -------------------
  if (liveEnabled && liveSize !== "") {

    const venue = LIVE_VENUES[liveSize];

    if (venue) {

      const attendanceRate = 0.4 + (fanMult * 0.5);
      attendance = Math.round(venue.cap * attendanceRate);

      const grossPerShow = attendance * venue.price;
      const artistEarnings = grossPerShow * (S.artistCut / 100);

      const touringWeight = S.strategy.touring / 10;

      S.income.touring =
        artistEarnings * S.showsPerMonth * touringWeight;
    }
  }

  // -------------------
  // SOCIAL (leave simple)
  // -------------------
  S.income.social = S.income.streaming * 0.3;

  // -------------------
  // MERCH (safe version)
  // -------------------
  if (attendance > 0) {
    const attachFraction = S.attachRate / 100;

    let avgProfit = 0;
    if (S.merchItems.length > 0) {
      const totalProfit = S.merchItems.reduce(
        (sum, k) => sum + (MERCH[k]?.profit || 0),
        0
      );
      avgProfit = totalProfit / S.merchItems.length;
    }

    const totalAttendance = attendance * S.showsPerMonth;

    S.income.merch =
      totalAttendance * attachFraction * avgProfit;
  }

  // -------------------
  // TOTAL
  // -------------------
  S.income.total =
    S.income.streaming +
    S.income.social +
    S.income.touring +
    S.income.merch;
}
// =============================================================
//  SCREEN 4: POPULATE ENGINE CARDS
// =============================================================

function populateEngines() {
  const tierName = TIER_NAMES[S.audienceTier];
  const streams  = TIER_STREAMS[tierName].mid;
  const fanMult  = S.fanStrength / 100;
  const venue    = VENUE_TYPES[tierName];
  const attendance = Math.round(venue.cap * fanMult);

  // Streaming
  const spotifyCPM = CPM[tierName] ? CPM[tierName]['spotify'] : 0;
  document.getElementById('eng-stream-tier').textContent   = tierName;
  document.getElementById('eng-stream-count').textContent  = streams.toLocaleString();
  document.getElementById('eng-stream-cpm').textContent    = spotifyCPM ? '$' + spotifyCPM : 'N/A';
  document.getElementById('eng-stream-income').textContent = fmt(S.income.streaming);

  // Social
  const socialPlatforms = ['youtube', 'instagram', 'tiktok'];
  let bestCPM = 0, bestPlatform = 'YouTube';
  socialPlatforms.forEach(p => {
    const cpm = CPM[tierName] && CPM[tierName][p];
    if (cpm && cpm > bestCPM) { bestCPM = cpm; bestPlatform = p; }
  });
  document.getElementById('eng-social-platform').textContent = capitalize(bestPlatform);
  document.getElementById('eng-social-reach').textContent    = Math.round(streams * 0.3).toLocaleString();
  document.getElementById('eng-social-cpm').textContent      = bestCPM ? '$' + bestCPM : 'N/A';
  document.getElementById('eng-social-income').textContent   = fmt(S.income.social);

  // Touring
  document.getElementById('eng-tour-venue').textContent   = venue.label;
  document.getElementById('eng-tour-cap').textContent     = venue.cap.toLocaleString();
  document.getElementById('eng-tour-ticket').textContent  = '$' + venue.ticket;
  document.getElementById('eng-tour-income').textContent  = fmt(S.income.touring);

  // Merch
  document.getElementById('eng-merch-attendance').textContent = (attendance * S.showsPerMonth).toLocaleString() + ' fans/mo';
  document.getElementById('eng-merch-income').textContent     = fmt(S.income.merch);

  // Summary bar
  document.getElementById('sum-streaming').textContent = fmt(S.income.streaming);
  document.getElementById('sum-social').textContent    = fmt(S.income.social);
  document.getElementById('sum-touring').textContent   = fmt(S.income.touring);
  document.getElementById('sum-merch').textContent     = fmt(S.income.merch);
  document.getElementById('sum-total').textContent     = fmt(S.income.total);

  if (S.city && CITIES[S.city]) {
    const data  = CITIES[S.city];
    const cost  = data.housing + data.food + data.transportation +
                  data.medical + data.internet + data.civic + data.other;
    const net   = S.income.total - cost;
    document.getElementById('sum-cost').textContent = fmt(cost);
    document.getElementById('sum-net').textContent  = fmt(net);
  }
}

// =============================================================
//  SCREEN 5: RESULTS
// =============================================================



function populateResults() {
  const data    = CITIES[S.city];
  const cost    = data.housing + data.food + data.transportation +
                  data.medical + data.internet + data.civic + data.other;
  const net     = S.income.total - cost;
  

  // Verdict
  let status, statusClass;
  if (S.income.total < cost * 0.7)         { status = '🔴 Below Survival';  statusClass = 'verdict-red';    }
  else if (S.income.total < cost)           { status = '🟡 Below Living Wage'; statusClass = 'verdict-yellow'; }
  else if (S.income.total < data.postTaxMin * 1.2) { status = '🟢 Sustainable'; statusClass = 'verdict-green';  }
  else                                      { status = '🚀 Scalable';        statusClass = 'verdict-blue';   }

  const banner = document.getElementById('verdict-banner');
  banner.className = 'verdict-banner ' + statusClass;
  document.getElementById('verdict-income').textContent = fmt(S.income.total) + ' / mo';
  document.getElementById('verdict-status').textContent = status;
  document.getElementById('verdict-delta').textContent  =
    (surplus >= 0 ? '+' : '') + fmt(surplus) + ' vs survival line';

  // Income breakdown
  document.getElementById('res-streaming').textContent = fmt(S.income.streaming);
  document.getElementById('res-social').textContent    = fmt(S.income.social);
  document.getElementById('res-touring').textContent   = fmt(S.income.touring);
  document.getElementById('res-merch').textContent     = fmt(S.income.merch);
  document.getElementById('res-total').textContent     = fmt(S.income.total);
  document.getElementById('res-cost').textContent      = fmt(cost);
  document.getElementById('res-net').textContent       = fmt(net);

  // Income mix pie chart
  buildIncomeMixChart();

  // Growth curve chart
  buildGrowthChart();

  // What it would take
  buildWhatItTakes(cost);

  // Persona
  buildPersona();

  // Update status bar
  updateStatusBar();
}

function buildIncomeMixChart() {
  const ctx = document.getElementById('chart-income-mix').getContext('2d');
  if (chartIncomeMix) chartIncomeMix.destroy();

  chartIncomeMix = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: ['Streaming', 'Social', 'Touring', 'Merch'],
      datasets: [{
        data: [
          Math.round(S.income.streaming),
          Math.round(S.income.social),
          Math.round(S.income.touring),
          Math.round(S.income.merch)
        ],
        backgroundColor: ['#6366f1','#8b5cf6','#ec4899','#f59e0b']
      }]
    },
    options: { responsive: false }
  });
}

function buildGrowthChart() {
  const ctx    = document.getElementById('chart-growth').getContext('2d');
  if (chartGrowth) chartGrowth.destroy();

  const tiers  = ['Nano', 'Micro', 'Mid', 'Macro'];
  const labels = tiers.map(t => t + ' (' + TIER_STREAMS[t].mid.toLocaleString() + ')');
  const data   = tiers.map(tier => {
    const streams    = TIER_STREAMS[tier].mid;
    const cpm        = CPM[tier] ? CPM[tier]['spotify'] : 0;
    const fanMult    = S.fanStrength / 100;
    const venue      = VENUE_TYPES[tier];
    const attendance = Math.round(venue.cap * fanMult);
    const touring    = attendance * venue.ticket * (S.artistCut / 100) * S.showsPerMonth * (S.strategy.touring / 10);
    const streaming  = cpm ? (cpm / 1000) * streams * (S.strategy.streaming / 10) : 0;
    return Math.round(streaming + touring);
  });

  chartGrowth = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: 'Estimated Monthly Income',
        data,
        borderColor: '#6366f1',
        backgroundColor: 'rgba(99,102,241,0.1)',
        fill: true,
        tension: 0.4
      }]
    },
    options: { responsive: false }
  });
}

function buildWhatItTakes(cost) {
  const tierName  = TIER_NAMES[S.audienceTier];
  const spotifyCPM = CPM[tierName] ? CPM[tierName]['spotify'] : 3;
  const venue      = VENUE_TYPES[tierName];
  const fanMult    = S.fanStrength / 100;
  const attendance = Math.round(venue.cap * fanMult);
  const perShow    = attendance * venue.ticket * (S.artistCut / 100);

  const streamsNeeded = spotifyCPM ? Math.ceil(cost / (spotifyCPM / 1000)) : '∞';
  const showsNeeded   = perShow    ? Math.ceil(cost / perShow)              : '∞';
  const avgProfit     = S.merchItems.length
    ? S.merchItems.reduce((s, k) => s + (MERCH[k] ? MERCH[k].profit : 0), 0) / S.merchItems.length
    : 20;
  const unitsNeeded   = Math.ceil(cost / avgProfit);

  document.getElementById('what-it-takes').innerHTML = `
    <div class="wit-card">
      <span>🎵 Streams needed (Spotify only)</span>
      <strong>${typeof streamsNeeded === 'number' ? streamsNeeded.toLocaleString() : streamsNeeded}</strong>
    </div>
    <div class="wit-card">
      <span>🎤 Shows needed (at current cut)</span>
      <strong>${typeof showsNeeded === 'number' ? showsNeeded.toLocaleString() : showsNeeded}</strong>
    </div>
    <div class="wit-card">
      <span>👕 Merch units needed</span>
      <strong>${unitsNeeded.toLocaleString()}</strong>
    </div>
  `;
}

function buildPersona() {
  const maxStrat = Object.entries(S.strategy).sort((a,b) => b[1]-a[1])[0][0];
  const personas = {
    streaming: { name: 'The Cataloger',    desc: 'You build slow, passive income through catalog and playlists.' },
    social:    { name: 'The Marketer',     desc: 'You grow audiences and monetize through brand and content.' },
    touring:   { name: 'The Road Warrior', desc: 'You convert fans in person. High effort, high reward.' },
    merch:     { name: 'The Brand Builder',desc: 'You turn fans into customers through direct-to-fan products.' }
  };

  const p = personas[maxStrat];
  document.getElementById('persona-card').innerHTML = `
    <div class="kicker">Your Artist Persona</div>
    <h3>${p.name}</h3>
    <p>${p.desc}</p>
  `;
}

// =============================================================
//  PERSISTENT STATUS BAR
// =============================================================

function updateStatusBar() {
  if (!S.city) return;

  const bar  = document.getElementById('sim-statusbar');
  const data = CITIES[S.city];
  const cost = data.housing + data.food + data.transportation +
               data.medical + data.internet + data.civic + data.other;

  bar.style.display = 'block';
  document.getElementById('status-city').textContent   = S.city;
  document.getElementById('status-goal').textContent   = fmt(data.postTaxMin) + '/mo';
  document.getElementById('status-income').textContent = '—';

 const badge = document.getElementById('status-badge');

if (currentScreen < 3) {
  badge.textContent = '—';
  badge.className = 'status-badge';
} else if (S.income.total === 0) {
  badge.textContent = '—';
  badge.className = 'status-badge';
} else if (S.income.total < cost) {
  badge.textContent = 'Below';
  badge.className = 'status-badge badge-red';
} else if (S.income.total < data.postTaxMin) {
  badge.textContent = 'Close';
  badge.className = 'status-badge badge-yellow';
} else {
  badge.textContent = 'Viable';
  badge.className = 'status-badge badge-green';
}
}
// =============================================================
//  RESTART
// =============================================================

function restartSim() {
  S = {
    city: null,

    // Audience
    audienceTier: null,
    fanStrength: 50,

    // NEW MODEL (real controls)
    showsPerMonth: 4,
    artistCut: 15,
    attachRate: 10,
    streamingActivity: 5,

    // COMPAT LAYER (do not remove yet)
    strategy: {
      streaming: 5,
      social: 5,
      touring: 5,
      merch: 5
    },

    merchItems: ['tshirt'],

    income: {
      streaming: 0,
      social: 0,
      touring: 0,
      merch: 0,
      total: 0
    }
  };

  document.getElementById('sim-statusbar').style.display = 'none';
  goTo(0);
}

// =============================================================
//  UTILITIES
// =============================================================

function fmt(n) {
  return '$' + Math.round(n).toLocaleString();
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// =============================================================
//  INIT — runs after data.js has loaded everything
// =============================================================

document.addEventListener('DOMContentLoaded', async () => {
  await initAllData();       // from data.js — loads CITIES, CPM, MERCH
  populateCityDropdown();    // fill the city select with real cities
  onAudienceChange();        // set default audience panel state
  onStrategyChange();        // set default strategy chart
});