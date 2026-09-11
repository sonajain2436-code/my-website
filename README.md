# 💧 Green Monitor AI — Predictive Data Center Cooling & Water Optimization

> **"Don't cool everything equally. Predict the heat, cool only as much as needed, and minimize water and energy."**

Green Monitor AI is an AI-powered predictive thermal intelligence and resource optimization platform for hyperscale and enterprise AI data centers. It transforms cooling from a reactive, uniform energy-and-water drain into a proactive, non-uniform, model-predictive operation.

---

## 🚀 How to Run the Website

This application is built with **zero external dependencies** — no `npm install`, Node.js, or Python server setup required.

1. Navigate to the project directory:
   ```
   C:\Users\Sona Jain\.gemini\antigravity\scratch\green-monitor-ai\
   ```
2. Simply **double-click** [`index.html`](file:///C:/Users/Sona%20Jain/.gemini/antigravity/scratch/green-monitor-ai/index.html) to open the interactive live demo in any modern browser (Chrome, Edge, Firefox, Brave, Safari).
3. Alternatively, you can launch a local web server if desired:
   ```powershell
   # In PowerShell / Terminal:
   python -m http.server 8080
   # or
   npx serve .
   ```

---

## 🌟 Key Features Built Into the Website

1. **Live 16-Rack Floor Heatmap (4x4 HPC Matrix)**:
   - Real-time thermal telemetry for NVIDIA H100 SXM5, A100 80GB, and L40S clusters.
   - Dynamic color-coding (Cool `<55°C`, Optimal `55–70°C`, Warm `70–75°C`, Critical Alert `>75°C`).
   - Click on any rack to inspect its IPMI telemetry, pump RPM, $\Delta T$, and 15-min forecast.

2. **Interactive Workload Spike Simulator**:
   - **Inject 70B LLM Training**: Spikes Racks A1–A4 to 95% GPU compute load.
   - **Burst Inference Wave**: Surges query traffic to Racks B & C.
   - **Night Off-Peak**: Simulates idle compute and maximum free-air economizer savings.
   - **Custom Workload Slider**: Real-time slider (10% to 100% compute load).

3. **Real-Time Predictive vs Reactive Canvas Graphs**:
   - **15-Min Heat Anticipation Curve**: Displays actual GPU die temperature, AI 15-minute forecast line, and the ASHRAE A1 safe threshold ($75^\circ\text{C}$).
   - **Water & Energy Demand Comparison**: Rolling side-by-side comparison of Traditional baseline vs Green Monitor AI demand.

4. **Resource KPI Dashboard**:
   - **Water Consumption**: Displays live consumption and model-estimated potential water saved (`~1,820 L/day / -22.1%`).
   - **Cooling Power**: Dynamic chiller and pump power reduction (`~740 kW / -28.4%`).
   - **PUE & WUE Ratings**: PUE `1.14` (vs industry standard `1.58`), WUE `0.41 L/kWh` (vs industry standard `1.80`).
   - **Carbon & Cost Avoided**: Live daily dollar savings and $\text{kg CO}_2\text{e}$ offsets.

5. **60-Second Guided Pitch Tour**:
   - One-click button in navbar that highlights key features step-by-step for hackathon judges.

6. **Judges' Technical Deep-Dive Modal**:
   - Contains the full mathematical optimization formulation, 4-tier closed-loop system architecture, water evaporation thermodynamics, and answers to judges' tough questions.

---

## 📐 Mathematical Optimization Model

Green Monitor AI frames cooling as a constrained model predictive control (MPC) problem solved dynamically over a receding horizon $H$:

$$\min_{\mathbf{u}_t} \quad \sum_{k=0}^{H-1} \Big[ \alpha \cdot \text{Cost}_{\text{water}}(\mathbf{u}_{t+k}) + \beta \cdot \text{Cost}_{\text{energy}}(\mathbf{u}_{t+k}) \Big]$$

### Hard Physical Constraints:
1. **Die Temperature Safety Limit:**
   $$T_{\text{die}, i}(t + k) \le T_{\text{safe}} \quad (75.0^\circ\text{C}) \quad \forall \text{ rack } i$$
2. **Valve & Pump Actuator Limits:**
   $$\mathbf{u}_{\min} \le \mathbf{u}_t \le \mathbf{u}_{\max} \quad (5 \le F_i \le 25 \text{ L/min})$$
3. **Anti-Condensation Limit:**
   $$T_{\text{inlet}} \ge T_{\text{dew\_point}} + 2.0^\circ\text{C}$$

---

## 🎤 2-Minute Hackathon Pitch Script

When presenting to judges, follow this structure:

1. **Hook (15 seconds):**
   > *"AI models are becoming massive, and the data centers running them consume trillions of liters of clean drinking water every year just for cooling. The problem is that traditional cooling treats the entire facility uniformly—blasting maximum chilled water even to idle servers."*

2. **The Solution (30 seconds):**
   > *"We built Green Monitor AI. Instead of reacting after servers overheat, our system uses time-series forecasting to predict thermal spikes 15 minutes ahead. It routes coolant proportionally: high cooling for active GPU training racks, minimum cooling for idle racks."*

3. **Live Demo (45 seconds):**
   > *"Notice our live heatmap. Now let me click 'Inject 70B LLM Training'. Watch Racks A1–A4 jump to 95% workload. Instead of waiting for temperatures to breach 80°C, the green predictive curve ramps up coolant flow 8 minutes ahead. We keep every GPU under 75°C, while cutting water consumption by over 22%—saving 1,800+ liters of water every day in this cluster alone."*

4. **Safety & Enterprise Readiness (30 seconds):**
   > *"Judges often ask: What if the AI makes a mistake? Green Monitor AI operates as an advisory layer with a hardwired BMS safety governor. If any rack comes within 3°C of the limit, hardware bypass instantly forces 100% emergency cooling. Zero hardware risk, maximum sustainability."*

---

## 🛡️ Answers to Judges' Toughest Questions

* **Q: "Why not just run fans at a fixed medium speed?"**
  * **Answer:** Fixed cooling either under-cools during peak LLM training bursts (leading to thermal throttling or hardware degradation) or constantly over-cools during idle periods (wasting thousands of liters of evaporative cooling water).
* **Q: "Are these water savings verified?"**
  * **Answer:** In our prototype, savings are computed via ASHRAE TC 9.9 thermodynamic heat dissipation equations. In real deployments, savings are verified via magnetic flow sensors on the cooling tower makeup water line.

---

## 📁 Directory Structure

```
green-monitor-ai/
├── index.html        # Main interactive web dashboard
├── styles.css        # Enterprise glassmorphism styling & animations
├── app.js            # Real-time simulation loop, MPC logic & Canvas charts
└── README.md         # Documentation, pitch script, and architecture guide
```
