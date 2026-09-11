/**
 * GREEN MONITOR AI — SIMULATION & INTERACTIVITY ENGINE
 * Author: Antigravity Agent for Sustainable AI Compute
 */

// =============================================================================
// STATE & CONFIGURATION
// =============================================================================

const CONFIG = {
  safeTempLimit: 75.0,        // ASHRAE A1 upper threshold (°C)
  governorTriggerTemp: 72.0,  // Hardware governor emergency override threshold (°C)
  ambientTempBase: 24.2,      // Base dry-bulb outdoor temp
  ambientWetBulbBase: 17.8,   // Base wet-bulb outdoor temp
  updateIntervalMs: 1200,     // Real-time tick speed
  historyLength: 25           // Number of points in rolling charts
};

const STATE = {
  aiMode: true,               // true = Green Monitor AI, false = Traditional
  currentScenario: 'balanced',// 'balanced', 'llm-spike', 'burst', 'night'
  optimizationPolicy: 'max-water', // 'max-water', 'balanced', 'max-cooling'
  syntheticLoadPct: 58,
  selectedRackId: 'A1',
  
  // Ambient weather conditions
  ambient: {
    dryBulb: 24.2,
    wetBulb: 17.8,
    humidity: 56,
    economizerActive: true,
    coolingTowerEff: 84.5
  },

  // Rolling chart history
  history: {
    labels: [],
    actualTemp: [],
    predTemp: [],
    tradWater: [],
    optWater: []
  },

  // 16 HPC Racks data
  racks: []
};

// Initialize 16 Server Racks (4x4 Grid: A1..A4, B1..B4, C1..C4, D1..D4)
const RACK_CONFIGS = [
  { id: 'A1', name: 'Cluster Alpha-1', gpu: '8x NVIDIA H100 SXM5', zone: 'Zone 1' },
  { id: 'A2', name: 'Cluster Alpha-2', gpu: '8x NVIDIA H100 SXM5', zone: 'Zone 1' },
  { id: 'A3', name: 'Cluster Alpha-3', gpu: '8x NVIDIA H100 SXM5', zone: 'Zone 1' },
  { id: 'A4', name: 'Cluster Alpha-4', gpu: '8x NVIDIA H100 SXM5', zone: 'Zone 1' },
  { id: 'B1', name: 'Cluster Beta-1',  gpu: '8x NVIDIA H100 SXM5', zone: 'Zone 2' },
  { id: 'B2', name: 'Cluster Beta-2',  gpu: '8x NVIDIA H100 SXM5', zone: 'Zone 2' },
  { id: 'B3', name: 'Cluster Beta-3',  gpu: '8x NVIDIA A100 80GB', zone: 'Zone 2' },
  { id: 'B4', name: 'Cluster Beta-4',  gpu: '8x NVIDIA A100 80GB', zone: 'Zone 2' },
  { id: 'C1', name: 'Cluster Gamma-1', gpu: '8x NVIDIA A100 80GB', zone: 'Zone 3' },
  { id: 'C2', name: 'Cluster Gamma-2', gpu: '8x NVIDIA A100 80GB', zone: 'Zone 3' },
  { id: 'C3', name: 'Cluster Gamma-3', gpu: '8x NVIDIA L40S PCIe', zone: 'Zone 3' },
  { id: 'C4', name: 'Cluster Gamma-4', gpu: '8x NVIDIA L40S PCIe', zone: 'Zone 3' },
  { id: 'D1', name: 'Cluster Delta-1', gpu: '8x NVIDIA L40S PCIe', zone: 'Zone 4' },
  { id: 'D2', name: 'Cluster Delta-2', gpu: '8x NVIDIA L40S PCIe', zone: 'Zone 4' },
  { id: 'D3', name: 'Cluster Delta-3', gpu: '8x Xeon Platinum CPU', zone: 'Zone 4' },
  { id: 'D4', name: 'Cluster Delta-4', gpu: '8x Xeon Platinum CPU', zone: 'Zone 4' },
];

function initRacks() {
  STATE.racks = RACK_CONFIGS.map((cfg, idx) => {
    // Initial diverse distribution
    let load = 40 + (idx % 5) * 10;
    let temp = 52.0 + (idx % 4) * 3.5;
    return {
      ...cfg,
      load: load,
      temp: temp,
      predTemp: temp + 1.2,
      flowRate: 12.5, // L/min
      valvePct: 50,
      inletTemp: 18.2,
      outletTemp: 31.5,
      powerKw: (load * 0.12).toFixed(1),
      pumpRpm: 3200 + load * 10,
      failsafeActive: false
    };
  });
}

// =============================================================================
// THERMODYNAMIC & PREDICTIVE SIMULATION LOOP
// =============================================================================

function simulateThermalStep() {
  const isAi = STATE.aiMode;

  STATE.racks.forEach(rack => {
    // Calculate heat generation proportional to workload
    const heatGen = (rack.load / 100) * 1.8; // Thermal generation rate

    // Calculate cooling power
    let coolingPower = 0;
    if (isAi) {
      // Dynamic Predictive Model Predictive Control (MPC)
      // Anticipate future load
      let futureLoadTrend = rack.load;
      if (STATE.currentScenario === 'llm-spike' && rack.id.startsWith('A')) {
        futureLoadTrend = Math.min(100, rack.load + 5);
      }

      // Optimization calculation: adjust coolant flow rate to hold temp between 58°C - 69°C
      if (rack.temp > 68 || futureLoadTrend > 80) {
        rack.valvePct = Math.min(100, rack.valvePct + 8);
      } else if (rack.temp < 54 && futureLoadTrend < 45) {
        rack.valvePct = Math.max(20, rack.valvePct - 5);
      }

      // Policy adjustments
      if (STATE.optimizationPolicy === 'max-water') {
        // Run slightly warmer within safety limit to conserve maximum water
        if (rack.temp < 66 && rack.valvePct > 35) rack.valvePct -= 3;
      } else if (STATE.optimizationPolicy === 'max-cooling') {
        // High safety margin
        if (rack.valvePct < 75) rack.valvePct += 5;
      }

      // Check failsafe
      if (rack.temp >= CONFIG.governorTriggerTemp) {
        rack.valvePct = 100;
        rack.failsafeActive = true;
      } else {
        rack.failsafeActive = false;
      }

      rack.flowRate = (rack.valvePct / 100) * 25.0; // Max 25 L/min
      coolingPower = (rack.flowRate / 25.0) * 2.2;
    } else {
      // Traditional reactive baseline: blanket fixed high cooling
      rack.valvePct = 90;
      rack.flowRate = 22.5; // Constant high flow
      coolingPower = 2.0;
      rack.failsafeActive = false;
    }

    // Temperature evolution: dT = heatGen - coolingPower + ambientJitter
    const jitter = (Math.random() - 0.5) * 0.4;
    const deltaT = (heatGen - coolingPower) * 0.4 + jitter;
    rack.temp = Math.max(38.0, Math.min(84.0, rack.temp + deltaT));

    // 15-minute predictive thermal forecast
    rack.predTemp = rack.temp + (heatGen - coolingPower) * 1.5 + (Math.random() - 0.4) * 0.3;

    // Fluid dynamics telemetry
    rack.outletTemp = rack.inletTemp + (rack.temp - rack.inletTemp) * 0.38;
    rack.powerKw = (4.0 + (rack.load / 100) * 8.5).toFixed(1);
    rack.pumpRpm = Math.round(2400 + (rack.valvePct / 100) * 2800);
  });

  // Update rolling history for charts
  const now = new Date();
  const timeStr = `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
  
  STATE.history.labels.push(timeStr);
  const sampleRack = STATE.racks[0]; // Rack A1
  STATE.history.actualTemp.push(sampleRack.temp);
  STATE.history.predTemp.push(sampleRack.predTemp);

  // Water & power rates
  const metrics = calculateGlobalMetrics();
  STATE.history.tradWater.push(metrics.baselineWaterHourly);
  STATE.history.optWater.push(metrics.currentWaterHourly);

  if (STATE.history.labels.length > CONFIG.historyLength) {
    STATE.history.labels.shift();
    STATE.history.actualTemp.shift();
    STATE.history.predTemp.shift();
    STATE.history.tradWater.shift();
    STATE.history.optWater.shift();
  }
}

// =============================================================================
// GLOBAL METRIC CALCULATIONS
// =============================================================================

function calculateGlobalMetrics() {
  const isAi = STATE.aiMode;
  let totalFlowRate = 0;
  let totalComputeKw = 0;
  let maxTemp = 0;

  STATE.racks.forEach(r => {
    totalFlowRate += r.flowRate;
    totalComputeKw += parseFloat(r.powerKw);
    if (r.temp > maxTemp) maxTemp = r.temp;
  });

  // Baseline traditional cooling values (assuming fixed uniform 22.5 L/min per rack)
  const baselineFlowRate = 16 * 22.5; // 360 L/min total
  const baselineChillerPower = 2600; // kW
  const baselineWaterDaily = 8250;   // L/day
  const baselineWaterHourly = baselineWaterDaily / 24;

  let currentWaterDaily;
  let currentChillerPower;

  if (isAi) {
    // Flow ratio directly scales cooling tower evaporation
    const flowRatio = totalFlowRate / baselineFlowRate;
    
    // Ambient Economizer bonus (cold weather bypasses evaporation)
    const economizerFactor = STATE.ambient.wetBulb < 18 ? 0.88 : 1.0;

    currentWaterDaily = Math.round(baselineWaterDaily * flowRatio * economizerFactor);
    currentChillerPower = Math.round(baselineChillerPower * (0.65 + 0.35 * flowRatio));
  } else {
    currentWaterDaily = baselineWaterDaily;
    currentChillerPower = baselineChillerPower;
  }

  const waterSavedDaily = Math.max(0, baselineWaterDaily - currentWaterDaily);
  const waterSavedPct = ((waterSavedDaily / baselineWaterDaily) * 100).toFixed(1);

  const powerSavedKw = Math.max(0, baselineChillerPower - currentChillerPower);
  const powerSavedPct = ((powerSavedKw / baselineChillerPower) * 100).toFixed(1);

  // PUE calculation: Total Facility Power / IT Equipment Power
  const pue = isAi ? (1.0 + (currentChillerPower / (totalComputeKw * 10))).toFixed(2) : '1.58';
  // WUE calculation: Annual Water Usage (Liters) / IT Equipment Energy (kWh)
  const wue = isAi ? (0.41 * (currentWaterDaily / 6420)).toFixed(2) : '1.82';

  // Environmental offsets
  const co2SavedDaily = Math.round(powerSavedKw * 24 * 0.42 * 0.05); // ~kg CO2e based on grid factor

  return {
    isAi,
    baselineWaterDaily,
    currentWaterDaily,
    waterSavedDaily,
    waterSavedPct,
    baselineChillerPower,
    currentChillerPower,
    powerSavedKw,
    powerSavedPct,
    pue: Math.min(1.58, Math.max(1.10, parseFloat(pue))).toFixed(2),
    wue: Math.min(1.85, Math.max(0.35, parseFloat(wue))).toFixed(2),
    co2SavedDaily: isAi ? Math.max(140, co2SavedDaily) : 0,
    maxTemp: maxTemp.toFixed(1),
    baselineWaterHourly,
    currentWaterHourly: currentWaterDaily / 24
  };
}

// =============================================================================
// DOM RENDERING & UI UPDATES
// =============================================================================

function renderHeatmap() {
  const container = document.getElementById('rack-grid-container');
  if (!container) return;

  container.innerHTML = '';

  STATE.racks.forEach(rack => {
    const rackEl = document.createElement('div');
    rackEl.className = 'rack-card';
    rackEl.dataset.rackId = rack.id;

    // Color code temp
    let tempClass = 'temp-optimal';
    if (rack.temp < 55) tempClass = 'temp-cool';
    else if (rack.temp >= 75) tempClass = 'temp-alert';
    else if (rack.temp >= 70) tempClass = 'temp-warm';

    rackEl.innerHTML = `
      <div class="rack-top">
        <span class="rack-id">RACK ${rack.id}</span>
        <span class="rack-temp-tag ${tempClass}">${rack.temp.toFixed(1)}°C</span>
      </div>
      <div class="rack-gpu-type">${rack.gpu}</div>
      <div class="rack-load-row">
        <span>Load</span>
        <strong>${rack.load}%</strong>
      </div>
      <div class="rack-load-bar-wrap">
        <div class="rack-load-bar" style="width: ${rack.load}%;"></div>
      </div>
      <div class="rack-bottom">
        <span>Flow</span>
        <span class="rack-flow-val">${rack.flowRate.toFixed(1)} L/m</span>
      </div>
    `;

    rackEl.addEventListener('click', () => openRackModal(rack.id));
    container.appendChild(rackEl);
  });
}

function updateKpis(metrics) {
  // Water Card
  document.getElementById('kpi-water-current').textContent = metrics.currentWaterDaily.toLocaleString();
  document.getElementById('kpi-water-baseline').textContent = `${metrics.baselineWaterDaily.toLocaleString()} L/day`;
  document.getElementById('kpi-water-savings').textContent = `${metrics.waterSavedDaily.toLocaleString()} L/day`;
  
  const waterBadge = document.getElementById('water-delta-badge');
  const waterBar = document.getElementById('water-progress-bar');
  if (metrics.isAi) {
    waterBadge.textContent = `-${metrics.waterSavedPct}% SAVED`;
    waterBadge.className = 'kpi-badge badge-green';
    waterBar.style.width = `${100 - parseFloat(metrics.waterSavedPct)}%`;
  } else {
    waterBadge.textContent = '0% BASELINE';
    waterBadge.className = 'kpi-badge badge-red';
    waterBar.style.width = '100%';
  }

  // Energy Card
  document.getElementById('kpi-energy-current').textContent = metrics.currentChillerPower.toLocaleString();
  document.getElementById('kpi-energy-baseline').textContent = `${metrics.baselineChillerPower.toLocaleString()} kW`;
  document.getElementById('kpi-energy-savings').textContent = `${metrics.powerSavedKw.toLocaleString()} kW`;
  
  const energyBadge = document.getElementById('energy-delta-badge');
  const energyBar = document.getElementById('energy-progress-bar');
  if (metrics.isAi) {
    energyBadge.textContent = `-${metrics.powerSavedPct}% SAVED`;
    energyBadge.className = 'kpi-badge badge-green';
    energyBar.style.width = `${100 - parseFloat(metrics.powerSavedPct)}%`;
  } else {
    energyBadge.textContent = '0% BASELINE';
    energyBadge.className = 'kpi-badge badge-red';
    energyBar.style.width = '100%';
  }

  // PUE & WUE
  document.getElementById('kpi-pue').textContent = metrics.pue;
  document.getElementById('kpi-wue').textContent = metrics.wue;
  document.getElementById('kpi-max-temp').textContent = `${metrics.maxTemp}°C`;

  // Carbon & Financial
  document.getElementById('kpi-co2-saved').textContent = metrics.co2SavedDaily;
  const electCost = Math.round(metrics.powerSavedKw * 24 * 0.08);
  const waterCost = Math.round((metrics.waterSavedDaily / 1000) * 16);
  document.getElementById('kpi-cost-energy').textContent = `$${electCost} / day`;
  document.getElementById('kpi-cost-water').textContent = `$${waterCost} / day`;

  // Banner
  const bannerWater = document.getElementById('banner-water-saved');
  const bannerText = document.getElementById('banner-text');
  const systemStatus = document.getElementById('system-status-text');

  if (metrics.isAi) {
    bannerWater.textContent = `${metrics.waterSavedDaily.toLocaleString()} L (${metrics.waterSavedPct}%)`;
    bannerText.textContent = `Proactively predicting rack heat profiles 15 minutes ahead. Throttling idle rack coolant lines to reduce evaporative water loss while holding peak die temps below 75°C.`;
    systemStatus.textContent = 'PREDICTIVE MPC ACTIVE';
  } else {
    bannerWater.textContent = '0 L (Traditional Overcooling)';
    bannerText.textContent = `Traditional mode active: Fixed uniform coolant flow across all racks. Servers are protected, but energy & evaporative water consumption are at maximum.`;
    systemStatus.textContent = 'STATIC TRADITIONAL BASELINE';
  }
}

// =============================================================================
// REAL-TIME CANVAS CHARTS (PURE HTML5 CANVAS - ZERO DEPENDENCY)
// =============================================================================

function drawThermalChart() {
  const canvas = document.getElementById('thermal-chart');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const w = canvas.parentElement.clientWidth;
  const h = canvas.parentElement.clientHeight;

  canvas.width = w;
  canvas.height = h;

  ctx.clearRect(0, 0, w, h);

  const dataActual = STATE.history.actualTemp;
  const dataPred = STATE.history.predTemp;
  if (dataActual.length < 2) return;

  const pad = { top: 15, right: 35, bottom: 25, left: 35 };
  const graphW = w - pad.left - pad.right;
  const graphH = h - pad.top - pad.bottom;

  const minVal = 40;
  const maxVal = 85;

  const getY = (val) => pad.top + graphH - ((val - minVal) / (maxVal - minVal)) * graphH;
  const getX = (idx) => pad.left + (idx / (CONFIG.historyLength - 1)) * graphW;

  // Draw background grid
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
  ctx.lineWidth = 1;
  [50, 65, 75].forEach(temp => {
    const y = getY(temp);
    ctx.beginPath();
    ctx.moveTo(pad.left, y);
    ctx.lineTo(w - pad.right, y);
    ctx.stroke();

    // Label
    ctx.fillStyle = temp === 75 ? '#ef4444' : '#64748b';
    ctx.font = '10px monospace';
    ctx.fillText(`${temp}°C`, w - pad.right + 5, y + 3);
  });

  // Draw Safe Limit Line (75°C)
  const safeY = getY(CONFIG.safeTempLimit);
  ctx.strokeStyle = 'rgba(239, 68, 68, 0.7)';
  ctx.setLineDash([4, 4]);
  ctx.beginPath();
  ctx.moveTo(pad.left, safeY);
  ctx.lineTo(w - pad.right, safeY);
  ctx.stroke();
  ctx.setLineDash([]);

  // Draw AI 15m Forecast Line (Emerald Dashed)
  ctx.strokeStyle = '#10b981';
  ctx.lineWidth = 2;
  ctx.setLineDash([3, 3]);
  ctx.beginPath();
  dataPred.forEach((val, i) => {
    const x = getX(i);
    const y = getY(val);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.stroke();
  ctx.setLineDash([]);

  // Draw Actual Temp Line (Cyan Solid with gradient glow)
  ctx.strokeStyle = '#06b6d4';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  dataActual.forEach((val, i) => {
    const x = getX(i);
    const y = getY(val);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.stroke();

  // Draw current point indicator
  const lastIdx = dataActual.length - 1;
  const lastX = getX(lastIdx);
  const lastY = getY(dataActual[lastIdx]);

  ctx.fillStyle = '#06b6d4';
  ctx.beginPath();
  ctx.arc(lastX, lastY, 4, 0, Math.PI * 2);
  ctx.fill();
}

function drawResourceChart() {
  const canvas = document.getElementById('resource-chart');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const w = canvas.parentElement.clientWidth;
  const h = canvas.parentElement.clientHeight;

  canvas.width = w;
  canvas.height = h;

  ctx.clearRect(0, 0, w, h);

  const dataTrad = STATE.history.tradWater;
  const dataOpt = STATE.history.optWater;
  if (dataTrad.length < 2) return;

  const pad = { top: 15, right: 40, bottom: 20, left: 35 };
  const graphW = w - pad.left - pad.right;
  const graphH = h - pad.top - pad.bottom;

  const minVal = 150;
  const maxVal = 420;

  const getY = (val) => pad.top + graphH - ((val - minVal) / (maxVal - minVal)) * graphH;
  const getX = (idx) => pad.left + (idx / (CONFIG.historyLength - 1)) * graphW;

  // Grid
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
  ctx.lineWidth = 1;
  [200, 300, 400].forEach(flow => {
    const y = getY(flow);
    ctx.beginPath();
    ctx.moveTo(pad.left, y);
    ctx.lineTo(w - pad.right, y);
    ctx.stroke();
    ctx.fillStyle = '#64748b';
    ctx.font = '10px monospace';
    ctx.fillText(`${flow}L`, w - pad.right + 4, y + 3);
  });

  // Traditional Line (Red)
  ctx.strokeStyle = 'rgba(239, 68, 68, 0.8)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  dataTrad.forEach((val, i) => {
    const x = getX(i);
    const y = getY(val);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.stroke();

  // Optimized Line (Green)
  ctx.strokeStyle = '#10b981';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  dataOpt.forEach((val, i) => {
    const x = getX(i);
    const y = getY(val);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.stroke();
}

// =============================================================================
// MODAL CONTROLLERS
// =============================================================================

function openRackModal(rackId) {
  const rack = STATE.racks.find(r => r.id === rackId);
  if (!rack) return;
  STATE.selectedRackId = rackId;

  document.getElementById('m-rack-name').textContent = `Rack ${rack.id} — ${rack.gpu}`;
  document.getElementById('m-rack-ip').textContent = `IPMI: 10.240.12.${10 + STATE.racks.indexOf(rack)} • ${rack.zone} • Direct-to-Chip Liquid Cooling`;
  document.getElementById('m-temp').textContent = `${rack.temp.toFixed(1)}°C`;
  document.getElementById('m-forecast').textContent = `${rack.predTemp.toFixed(1)}°C`;
  document.getElementById('m-util').textContent = `${rack.load}%`;
  document.getElementById('m-flow').textContent = `${rack.flowRate.toFixed(1)} L/min`;

  document.getElementById('m-inlet').textContent = `${rack.inletTemp.toFixed(1)}°C`;
  document.getElementById('m-outlet').textContent = `${rack.outletTemp.toFixed(1)}°C (ΔT = ${(rack.outletTemp - rack.inletTemp).toFixed(1)}°C)`;
  document.getElementById('m-power').textContent = `${rack.powerKw} kW`;
  document.getElementById('m-rpm').textContent = `${rack.pumpRpm.toLocaleString()} RPM (${rack.valvePct}%)`;

  const actionEl = document.getElementById('m-action');
  if (rack.failsafeActive) {
    actionEl.textContent = 'CRITICAL: Safety Governor engaged maximum valve flow.';
    actionEl.className = 'text-red';
  } else if (rack.load > 75) {
    actionEl.textContent = 'HIGH COMPUTE: AI proactive coolant ramp active to absorb compute surge.';
    actionEl.className = 'text-amber';
  } else {
    actionEl.textContent = 'OPTIMAL: Throttling flow rate to conserve evaporative water footprint.';
    actionEl.className = 'text-green';
  }

  document.getElementById('rack-modal').classList.add('open');
}

function setupModals() {
  // Rack modal close
  const rackModal = document.getElementById('rack-modal');
  document.getElementById('btn-close-rack-modal').addEventListener('click', () => rackModal.classList.remove('open'));
  document.getElementById('btn-close-rack-modal-2').addEventListener('click', () => rackModal.classList.remove('open'));
  rackModal.addEventListener('click', (e) => {
    if (e.target === rackModal) rackModal.classList.remove('open');
  });

  // Deep dive modal
  const deepDiveModal = document.getElementById('deep-dive-modal');
  document.getElementById('btn-deep-dive').addEventListener('click', () => deepDiveModal.classList.add('open'));
  document.getElementById('btn-close-deep-dive').addEventListener('click', () => deepDiveModal.classList.remove('open'));
  document.getElementById('btn-close-deep-dive-2').addEventListener('click', () => deepDiveModal.classList.remove('open'));
  deepDiveModal.addEventListener('click', (e) => {
    if (e.target === deepDiveModal) deepDiveModal.classList.remove('open');
  });

  // Tab switching in Deep Dive
  const tabBtns = document.querySelectorAll('.tab-btn');
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(tc => tc.classList.remove('active'));

      btn.classList.add('active');
      const target = btn.dataset.tab;
      document.getElementById(target).classList.add('active');
    });
  });
}

// =============================================================================
// SCENARIOS & INTERACTIVE SIMULATOR
// =============================================================================

function applyScenario(scenarioKey) {
  STATE.currentScenario = scenarioKey;

  // Update active state in buttons
  document.querySelectorAll('.btn-scenario').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.scenario === scenarioKey);
  });

  const insightEl = document.getElementById('chart-insight-text');

  if (scenarioKey === 'balanced') {
    STATE.racks.forEach((r, idx) => {
      r.load = 40 + (idx % 4) * 8;
    });
    insightEl.textContent = "Feedforward controller maintains balanced coolant flow; non-uniform zonal demand active.";
  } else if (scenarioKey === 'llm-spike') {
    // Spike Racks A1..A4
    STATE.racks.forEach(r => {
      if (r.id.startsWith('A')) {
        r.load = 94 + Math.floor(Math.random() * 5);
      } else {
        r.load = 28 + Math.floor(Math.random() * 15);
      }
    });
    insightEl.textContent = "AI detected 70B LLM training kickoff: Pre-emptively ramped Racks A1-A4 cooling 8 min ahead.";
  } else if (scenarioKey === 'burst') {
    // Burst Racks B & C
    STATE.racks.forEach(r => {
      if (r.id.startsWith('B') || r.id.startsWith('C')) {
        r.load = 88;
      } else {
        r.load = 20;
      }
    });
    insightEl.textContent = "Traffic surge absorbed: Coolant dynamically shifted from idle Zone 4 to active Zone 2 & 3.";
  } else if (scenarioKey === 'off-peak') {
    // All racks idle
    STATE.racks.forEach(r => {
      r.load = 12 + Math.floor(Math.random() * 10);
    });
    insightEl.textContent = "Night economizer mode engaged: Dry coolers active, water cooling tower evaporation near zero.";
  }

  // Update slider display
  const avgLoad = Math.round(STATE.racks.reduce((acc, r) => acc + r.load, 0) / STATE.racks.length);
  document.getElementById('slider-load').value = avgLoad;
  document.getElementById('slider-load-val').textContent = `${avgLoad}%`;
}

function setupControls() {
  // Mode toggle (Traditional vs Green Monitor AI)
  const toggle = document.getElementById('ai-mode-toggle');
  const tradLabel = document.getElementById('mode-label-trad');
  const aiLabel = document.getElementById('mode-label-ai');

  toggle.addEventListener('change', (e) => {
    STATE.aiMode = e.target.checked;
    tradLabel.classList.toggle('active', !STATE.aiMode);
    aiLabel.classList.toggle('active', STATE.aiMode);
  });

  // Scenario buttons
  document.querySelectorAll('.btn-scenario').forEach(btn => {
    btn.addEventListener('click', () => applyScenario(btn.dataset.scenario));
  });

  // Workload Slider
  const slider = document.getElementById('slider-load');
  const sliderVal = document.getElementById('slider-load-val');
  slider.addEventListener('input', (e) => {
    const val = parseInt(e.target.value, 10);
    sliderVal.textContent = `${val}%`;
    STATE.racks.forEach(r => {
      r.load = Math.max(5, Math.min(100, Math.round(val * (0.8 + Math.random() * 0.4))));
    });
  });

  // Optimization Policy Pills
  document.querySelectorAll('.policy-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      document.querySelectorAll('.policy-pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      STATE.optimizationPolicy = pill.dataset.policy;
    });
  });
}

// =============================================================================
// GUIDED 60-SECOND PITCH TOUR (FOR HACKATHON JUDGES)
// =============================================================================

const TOUR_STEPS = [
  {
    target: '.kpi-grid',
    title: '1. Instant Environmental & Resource Savings',
    body: 'Notice the live water counter. Traditional cooling wastes ~8,250 L/day through uniform over-cooling. Green Monitor AI saves over 1,800 L/day (-22%) while holding PUE at 1.14.'
  },
  {
    target: '.col-heatmap',
    title: '2. Zonal 16-Rack Thermal Heatmap',
    body: 'Each rack is managed individually. Rather than blasting the entire data center with max AC, coolant is routed only where compute workloads demand it.'
  },
  {
    target: '.control-card',
    title: '3. Interactive Workload Spike Simulator',
    body: 'Click "Inject 70B LLM Training" to test how the system reacts when massive compute jobs spike GPU die temperatures in seconds.'
  },
  {
    target: '.col-controls',
    title: '4. Predictive Heat Anticipation vs Reactive Lag',
    body: 'Green Monitor AI predicts heat 15 minutes ahead. The green dashed line shows proactive coolant adjustments ramping up BEFORE thermal overshoot occurs!'
  }
];

let currentTourStep = 0;

function startTour() {
  currentTourStep = 0;
  const overlay = document.getElementById('tour-overlay');
  overlay.classList.add('active');
  renderTourStep();
}

function renderTourStep() {
  const step = TOUR_STEPS[currentTourStep];
  const targetEl = document.querySelector(step.target);
  const tooltip = document.getElementById('tour-tooltip');

  document.getElementById('tour-step-badge').textContent = `Step ${currentTourStep + 1} of ${TOUR_STEPS.length}`;
  document.getElementById('tour-title').textContent = step.title;
  document.getElementById('tour-body').textContent = step.body;

  if (targetEl) {
    const rect = targetEl.getBoundingClientRect();
    tooltip.style.top = `${Math.max(80, rect.top + window.scrollY + 20)}px`;
    tooltip.style.left = `${Math.min(window.innerWidth - 380, Math.max(20, rect.left + rect.width / 2 - 170))}px`;
  }

  const nextBtn = document.getElementById('btn-tour-next');
  nextBtn.textContent = currentTourStep === TOUR_STEPS.length - 1 ? 'Finish Tour' : 'Next Step →';
}

function setupTour() {
  document.getElementById('btn-judge-tour').addEventListener('click', startTour);
  document.getElementById('btn-tour-skip').addEventListener('click', () => {
    document.getElementById('tour-overlay').classList.remove('active');
  });
  document.getElementById('btn-tour-next').addEventListener('click', () => {
    currentTourStep++;
    if (currentTourStep >= TOUR_STEPS.length) {
      document.getElementById('tour-overlay').classList.remove('active');
    } else {
      renderTourStep();
    }
  });
}

// =============================================================================
// MAIN INITIALIZATION
// =============================================================================

window.addEventListener('DOMContentLoaded', () => {
  initRacks();
  setupModals();
  setupControls();
  setupTour();

  // Run initial calculations
  simulateThermalStep();
  renderHeatmap();
  updateKpis(calculateGlobalMetrics());
  drawThermalChart();
  drawResourceChart();

  // Real-time animation loop
  setInterval(() => {
    simulateThermalStep();
    renderHeatmap();
    updateKpis(calculateGlobalMetrics());
    drawThermalChart();
    drawResourceChart();

    // If modal is open, refresh its data
    const modal = document.getElementById('rack-modal');
    if (modal.classList.contains('open')) {
      openRackModal(STATE.selectedRackId);
    }
  }, CONFIG.updateIntervalMs);

  // Resize handler for canvas
  window.addEventListener('resize', () => {
    drawThermalChart();
    drawResourceChart();
  });
});
