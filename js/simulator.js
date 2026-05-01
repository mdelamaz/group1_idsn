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


  streamingActivity: 0,


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

    logicEl.innerHTML = `
  <div class="explainer-step">
    <span class="step-num">1</span>
    <span class="step-text">
      ${selectedPlatforms.length > 0 || liveEnabled
        ? "You’ve defined your audience channels."
        : "Select platforms or live performance to define your reach."}
    </span>
  </div>

  <div class="explainer-step">
    <span class="step-num">2</span>
    <span class="step-text">
      ${S.fanStrength > 0
        ? "Fan engagement determines how many people actually convert."
        : "Set your fan engagement to determine how many people show up and spend."}
    </span>
  </div>
`;
  }

  updateStatusBar();
  updateStrategyAvailability();
}

// =============================================================
//  SCREEN 3: Income Engine HANDLERS
// =============================================================

function onStrategyChange() {
  const val = parseInt(document.getElementById('strat-streaming')?.value || 0);

  S.streamingActivity = val;

  let label = "";

  if (val < 33) {
    label = "No releases";
  } else if (val < 66) {
    label = "Monthly drops";
  } else {
    label = "Weekly releases";
  }

  S.streamingActivityLabel = label;

  const el = document.getElementById('val-streaming');
  if (el) el.textContent = label;

  calcIncome();
  updateStrategyFeedback();
  updateIncomeChart();
}

function onTouringChange() {
  S.showsPerMonth = parseInt(document.getElementById('slider-shows')?.value || 4);
  S.artistCut     = parseInt(document.getElementById('slider-cut')?.value || 15);

  document.getElementById('val-shows').textContent = S.showsPerMonth;
  document.getElementById('val-cut').textContent = S.artistCut + "%";

  calcIncome();
  updateStatusBar();
  updateStrategyFeedback();
  updateIncomeChart();
}

function onMerchChange() {
  S.attachRate = parseInt(document.getElementById('slider-attach')?.value || 10);

  document.getElementById('val-attach').textContent = S.attachRate + "%";

  calcIncome();
  updateStatusBar();
  updateStrategyFeedback();
  updateIncomeChart();
}


// =============================================================
//  PIE CHART (NO NORMALIZATION HERE)
// =============================================================

function updateIncomeChart() {
  const canvas = document.getElementById('chart-income');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');

  if (window.chartIncome) {
    window.chartIncome.destroy();
  }

  const labels = [];
  const values = [];
  const colors = [];

  const streamingEnabled = document.querySelectorAll(".aud-platform:checked").length > 0;
  const liveEnabled = document.getElementById('aud-live')?.checked;

  // =========================
  // STREAMING
  // =========================
  if (streamingEnabled) {
    labels.push('Streaming');
    values.push(S.income.streaming || 1); // ensures visibility even at 0
    colors.push('#6366f1'); // purple
  }

  // =========================
  // LIVE
  // =========================
  if (liveEnabled) {
    labels.push('Live');
    values.push(S.income.touring || 1);
    colors.push('#10b981'); // green
  }

  // =========================
  // MERCH (OPTIONAL)
  // =========================
  if (S.attachRate > 0) {
    labels.push('Merch');
    values.push(S.income.merch || 1);
    colors.push('#f59e0b'); // orange
  }

  // =========================
  // EDGE CASE: NOTHING SELECTED
  // =========================
  if (labels.length === 0) {
    labels.push('No Income');
    values.push(1);
    colors.push('#e5e7eb');
  }

  const total = values.reduce((a, b) => a + b, 0);

  function pct(val) {
    if (total === 0) return "—";
    return Math.round((val / total) * 100) + "%";
  }

  const el1 = document.getElementById("pct-streaming");
  const el2 = document.getElementById("pct-touring");
  const el3 = document.getElementById("pct-merch");

  if (el1) el1.textContent = pct(S.income.streaming);
  if (el2) el2.textContent = pct(S.income.touring);
  if (el3) el3.textContent = pct(S.income.merch);

  // =========================
  // BUILD CHART
  // =========================
  window.chartIncome = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: labels,
      datasets: [{
        data: values,
        backgroundColor: colors
      }]
    },
    options: {
      responsive: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: function(context) {
              const value = context.raw;
              const total = context.dataset.data.reduce((a, b) => a + b, 0);
              const pct = Math.round((value / total) * 100);
              return `${context.label}: $${Math.round(value).toLocaleString()} (${pct}%)`;
            }
          }
        }
      }
    }
  });
}

// =============================================================
//  STRATEGY FEEDBACK (UNCHANGED)
// =============================================================

function updateStrategyFeedback() {
  const msg = document.getElementById('reaction-message');
  const touringEl = document.getElementById('profile-touring-focus');
  const merchEl = document.getElementById('profile-merch-focus');
  const streamingEl = document.getElementById('profile-streaming-focus');
  const streamingEnabled = document.querySelectorAll(".aud-platform:checked").length > 0;
  const liveEnabled = document.getElementById('aud-live')?.checked;

  if (!streamingEnabled && liveEnabled) {
  msg.textContent = "You rely entirely on live performance. Expanding your online presence could significantly grow your audience and income.";
  return;
}

if (streamingEnabled && !liveEnabled) {
  msg.textContent = "You are building an audience online but not converting it through live shows. Performing could unlock meaningful revenue.";
  return;
}

if (!streamingEnabled && !liveEnabled) {
  msg.textContent = "You currently have no active audience channels. You need to build reach before income becomes viable.";
  return;
}

  if (!msg || !touringEl || !merchEl || !streamingEl) return;

  let touringLevel = "Low";
  if (S.showsPerMonth > 10) touringLevel = "Heavy";
  else if (S.showsPerMonth > 5) touringLevel = "Active";

  let merchLevel = "Weak";
  if (S.attachRate > 20) merchLevel = "Strong";
  else if (S.attachRate > 10) merchLevel = "Moderate";

  let streamingLevel = "Light";
if (S.streamingActivity > 66) streamingLevel = "Aggressive";
else if (S.streamingActivity > 33) streamingLevel = "Balanced";

  touringEl.textContent = touringLevel;
  merchEl.textContent = merchLevel;
  streamingEl.textContent = streamingLevel;

  let text = "";

  if (touringLevel === "Heavy") {
    text += "You're relying heavily on live performances. ";
  } else if (touringLevel === "Low") {
    text += "Low live performance limits your income potential. ";
  }

  if (merchLevel === "Strong") {
    text += "Your fans are highly engaged. ";
  }

  if (streamingLevel === "Aggressive") {
    text += "You're prioritizing audience growth. ";
  }

  if (!text) text = "Balanced strategy across income streams.";

  msg.textContent = text;
}


// =============================================================
//  STRATEGY AVAILABILITY BASED ON STEP 2 AUDIENCE SELECTONS
// =============================================================

function updateStrategyAvailability() {
  const streamingEnabled = document.querySelectorAll(".aud-platform:checked").length > 0;
  const liveEnabled = document.getElementById('aud-live')?.checked;

  const streamingBlock = document.querySelector('[data-step="1"]');
  const liveBlock = document.querySelector('[data-step="2"]');

  if (streamingBlock) {
    streamingBlock.style.opacity = streamingEnabled ? "1" : "0.4";
    streamingBlock.style.pointerEvents = streamingEnabled ? "auto" : "none";
  }

  if (liveBlock) {
    liveBlock.style.opacity = liveEnabled ? "1" : "0.4";
    liveBlock.style.pointerEvents = liveEnabled ? "auto" : "none";
  }
}

// =============================================================
//  CORE INCOME CALCULATION (FIXED MODEL)
// =============================================================

function calcIncome() {


  console.log("INPUTS:", {
  streaming: S.streamingActivity,
  shows: S.showsPerMonth,
  merch: S.attachRate
});

  S.income.streaming = 0;
  S.income.social = 0;
  S.income.touring = 0;
  S.income.merch = 0;
  S.income.total = 0;

  const fanMult = S.fanStrength / 100;

  const baseStreaming = 1000;
  const baseTouring   = 1000;
  const baseMerch     = 1000;

  const wStreaming = S.streamingActivity / 100; 
  const cutMultiplier = S.artistCut / 100;
  const wTouring = (S.showsPerMonth / 10) * cutMultiplier;
  const wMerch     = S.attachRate / 30;

  const totalW = wStreaming + wTouring + wMerch || 1;

  const nStreaming = wStreaming / totalW;
  const nTouring   = wTouring / totalW;
  const nMerch     = wMerch / totalW;

  S.income.streaming = baseStreaming * nStreaming;
  S.income.touring   = baseTouring   * nTouring;
  S.income.merch     = baseMerch     * nMerch;

  S.income.social = S.income.streaming * 0.3;

  S.income.total =
    S.income.streaming +
    S.income.social +
    S.income.touring +
    S.income.merch;

  // ✅ MOVE THESE INSIDE
  console.log("INCOME TOTAL:", S.income.total);
  updateStatusBar();
}

// =============================================================
//  SCREEN 4: FINAL CHART
// =============================================================

function buildFinalChart() {
  const canvas = document.getElementById('chart-income-final');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');

  if (window.finalChart) {
    window.finalChart.destroy();
  }

  const labels = [];
  const values = [];
  const colors = [];

  if (S.income.streaming > 0) {
    labels.push('Streaming');
    values.push(S.income.streaming);
    colors.push('#6366f1');
  }

  if (S.income.touring > 0) {
    labels.push('Live');
    values.push(S.income.touring);
    colors.push('#10b981');
  }

  if (S.income.merch > 0) {
    labels.push('Merch');
    values.push(S.income.merch);
    colors.push('#f59e0b');
  }

  if (values.length === 0) {
    labels.push('No Income');
    values.push(1);
    colors.push('#e5e7eb');
  }

  window.finalChart = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: labels,
      datasets: [{
        data: values,
        backgroundColor: colors
      }]
    },
   options: {
  responsive: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      callbacks: {
        label: function(context) {
          const value = context.raw;
          const total = context.dataset.data.reduce((a, b) => a + b, 0);
          const pct = Math.round((value / total) * 100);
          return `${context.label}: $${value.toLocaleString()} (${pct}%)`;
        }
      }
    }
  }
}
  });
}




// =============================================================
//  SCREEN 5: RESULTS
// =============================================================



function populateResults() {
  if (!S.city || !CITIES[S.city]) return;

  const data = CITIES[S.city];

  const cost =
    data.housing +
    data.food +
    data.transportation +
    data.medical +
    data.internet +
    data.civic +
    data.other;

  const total = S.income.total;
  const net = total - cost;

  // =========================
  // VERDICT
  // =========================
  let status = "";
  let statusClass = "";

  if (total < cost * 0.7) {
    status = "🔴 Below Survival";
    statusClass = "verdict-red";
  } else if (total < cost) {
    status = "🟡 Below Living Wage";
    statusClass = "verdict-yellow";
  } else if (total < data.postTaxMin * 1.2) {
    status = "🟢 Sustainable";
    statusClass = "verdict-green";
  } else {
    status = "🚀 Scalable";
    statusClass = "verdict-blue";
  }

  const banner = document.getElementById("verdict-banner");
  banner.className = "verdict-banner " + statusClass;

  document.getElementById("verdict-income").textContent = fmt(total) + " / mo";
  document.getElementById("verdict-status").textContent = status;
  document.getElementById("verdict-delta").textContent =
    (net >= 0 ? "+" : "") + fmt(net);

  // =========================
  // NUMBERS
  // =========================
  setText("res-streaming", fmt(S.income.streaming));
  setText("res-touring", fmt(S.income.touring));
  setText("res-merch", fmt(S.income.merch));
  setText("res-total", fmt(total));
  setText("res-cost", fmt(cost));
  setText("res-net", fmt(net));

  // =========================
  // STRATEGY SUMMARY (LEFT COLUMN)
  // =========================
  setText("res-strategy-streaming", S.streamingActivityLabel || "—");
  setText("res-strategy-touring", S.showsPerMonth + " shows/mo");
  setText("res-strategy-merch", S.attachRate + "% attach");

  // =========================
  // CHART
  // =========================
  buildFinalChart();

  // =========================
  // PERSONA
  // =========================
  buildPersona();

  // =========================
  // EXPLANATION + RECS (we’ll wire next)
  // =========================
  buildFinalExplanation(total, cost);
  buildRecommendations(cost);

  // =========================
  // STATUS BAR
  // =========================
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
  const streaming = S.income.streaming;
  const touring   = S.income.touring;
  const merch     = S.income.merch;

  let persona = {};

  if (streaming >= touring && streaming >= merch) {
    persona = {
      name: "The Cataloger",
      desc: "You build slow, passive income through catalog and playlists."
    };
  } else if (touring >= streaming && touring >= merch) {
    persona = {
      name: "The Headliner",
      desc: "You convert fans in person. High effort, high reward."
    };
  } else {
    persona = {
      name: "The Brand Builder",
      desc: "You turn fans into customers through direct-to-fan products."
    };
  }

  document.getElementById('persona-card').innerHTML = `
    <div class="kicker">Your Artist Persona</div>
    <h3>${persona.name}</h3>
    <p>${persona.desc}</p>
  `;
}


function buildFinalExplanation(total, cost) {
  const el = document.getElementById("final-explanation");
  if (!el) return;

  const streamingEnabled = document.querySelectorAll(".aud-platform:checked").length > 0;
  const liveEnabled = document.getElementById('aud-live')?.checked;

  const streaming = S.income.streaming;
  const live = S.income.touring;
  const merch = S.income.merch;

  // =========================
  // DETERMINE DOMINANT STREAM
  // =========================
  let dominant = "none";

  if (streaming >= live && streaming >= merch) dominant = "streaming";
  else if (live >= streaming && live >= merch) dominant = "live";
  else dominant = "merch";

  let text = "";

  // =========================
  // 1. VIABILITY
  // =========================
  if (total < cost) {
    text += "Your current strategy does not generate enough income to sustain your cost of living. ";
  } else {
    text += "Your strategy is financially sustainable at your current scale. ";
  }

  // =========================
  // 2. DOMINANT STRATEGY
  // =========================
  if (dominant === "streaming") {
    text += "Your income is primarily driven by streaming, which creates passive but slower-growing revenue. ";
  }

  if (dominant === "live") {
    text += "Your income is driven by live performance, which can generate strong revenue but requires constant effort. ";
  }

  if (dominant === "merch") {
    text += "Your income relies heavily on fan spending, meaning your audience engagement is strong. ";
  }

  // =========================
  // 3. STRUCTURAL GAPS
  // =========================
  if (!streamingEnabled && liveEnabled) {
    text += "However, without an online presence, your ability to grow your audience is limited. ";
  }

  if (streamingEnabled && !liveEnabled) {
    text += "However, you are not converting your audience into live revenue, which limits your earning potential. ";
  }

  if (!streamingEnabled && !liveEnabled) {
    text += "You currently lack both audience growth and monetization channels, which makes income generation difficult. ";
  }

  // =========================
  // 4. BALANCE / NEXT MOVE
  // =========================
  if (dominant === "streaming" && liveEnabled) {
    text += "Increasing live performances could help convert your audience into more immediate income.";
  }

  if (dominant === "live" && streamingEnabled) {
    text += "Investing in streaming and content could help you scale beyond local audiences.";
  }

  if (dominant === "merch") {
    text += "Strengthening either streaming or live performance could help stabilize and grow your income.";
  }

  if (total >= cost && dominant !== "none") {
    text += " Your next step is to scale what is already working.";
  }

  el.textContent = text;
}


function buildRecommendations(cost) {
  const el = document.getElementById("recommendations-list");
  if (!el) return;

  let recs = [];

  if (S.income.streaming < S.income.touring) {
    recs.push("Invest in streaming to build a larger, scalable audience.");
  }

  if (S.income.touring < S.income.streaming) {
    recs.push("Increase live performances to convert your audience into revenue.");
  }

  if (S.attachRate < 15) {
    recs.push("Improve merch strategy — stronger branding can increase fan spending.");
  }

  if (S.income.total < cost) {
    recs.push("Your current model is not sustainable — focus on scaling one core revenue stream.");
  }

  if (recs.length === 0) {
    recs.push("Your strategy is well balanced. Focus on scaling what is already working.");
  }

  el.innerHTML = recs.map(r => `<div class="wit-card">${r}</div>`).join("");
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
  if (currentScreen >= 3 && S.income.total > 0) {
  document.getElementById('status-income').textContent = fmt(S.income.total);
} else {
  document.getElementById('status-income').textContent = '—';
}

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
    showsPerMonth: 0,
    artistCut: 0,
    attachRate: 0,
    streamingActivity: 0,

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

function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

// =============================================================
//  INIT — runs after data.js has loaded everything
// =============================================================


function initStrategySteps() {
  const steps = document.querySelectorAll('.strategy-step');

  if (!steps.length) return;

  steps.forEach(step => {
    const sliders = step.querySelectorAll('input[type="range"]');

    sliders.forEach(slider => {
      slider.addEventListener('input', () => {
        steps.forEach(s => s.classList.remove('active'));
        step.classList.add('active');
      });
    });
  });

  // Set initial active step
  steps[0].classList.add('active');
}

document.addEventListener('DOMContentLoaded', async () => {
  if (typeof initAllData === "function") {
  await initAllData();
} else {
  console.error("initAllData not found");
}

  populateCityDropdown();

  // Force defaults to sync with UI
  onAudienceChange();
  onStrategyChange();
  onTouringChange();
  onMerchChange();
  updateIncomeChart();


// ===== FORCE EVENT BINDING =====

// Streaming slider
const streamingSlider = document.getElementById('strat-streaming');
if (streamingSlider) {
  streamingSlider.addEventListener('input', onStrategyChange);
}

// Touring sliders
const showsSlider = document.getElementById('slider-shows');
const cutSlider = document.getElementById('slider-cut');

if (showsSlider) {
  showsSlider.addEventListener('input', onTouringChange);
}
if (cutSlider) {
  cutSlider.addEventListener('input', onTouringChange);
}

// Merch slider
const merchSlider = document.getElementById('slider-attach');
if (merchSlider) {
  merchSlider.addEventListener('input', onMerchChange);
}

});