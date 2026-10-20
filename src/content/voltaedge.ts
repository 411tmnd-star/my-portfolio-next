/** VoltaEdge case study copy, ported verbatim from the live voltaedge.html. */

export const VOLTA = {
  badge: "⚡ Concept & Prototype Architecture",
  titleBefore: "VoltaEdge AI — ",
  titleAccent: "Physical Intelligence",
  titleAfter: " for Unreliable Energy Networks",
  lead: "An edge-computing energy management platform engineered to monitor electricity consumption, classify appliance-level usage via TinyML, and protect sensitive hardware across Nigerian grid, generator, and solar installations.",

  problem: {
    label: "01 / Problem Space",
    title: "Electricity in Nigeria is an economic and protection challenge",
    sub: "Managing power requires constant manual intervention—balancing prepaid token depletion, generator fuel usage, unstable grid voltages, and unmonitored heavy loads.",
    cards: [
      {
        title: "⚠️ Blind Token Depletion",
        desc: "Prepaid meters run out abruptly because users lack real-time visibility into which appliance is burning through units.",
      },
      {
        title: "⚡ Voltage Instability",
        desc: "Surges, sag, and brownouts during grid-to-generator switchovers frequently damage expensive compressors and electronics.",
      },
      {
        title: "🔌 Multi-Source Complexity",
        desc: "Managing load priorities between Solar Inverters, Public Grid (DisCo), and Petrol/Diesel Generators is entirely unautomated.",
      },
    ],
  },

  system: {
    label: "02 / System Concept",
    title: "One intelligence layer between the meter and the building",
    sub: "VoltaEdge integrates energy sensing, localized compute, non-intrusive load recognition, and automated relay control into a DIN-rail form factor.",
    pipe: [
      { step: "01", name: "CT / Voltage Sensor", sub: "Analog waveform at the mains feed", icon: "sensor" },
      { step: "02", name: "ESP32-S3", sub: "Sampling in embedded C/C++", icon: "chip" },
      { step: "03", name: "AI Processing", sub: "TinyML / NILM load recognition", icon: "ml" },
      { step: "04", name: "Telemetry Ingest", sub: "Readings upstream, not waveforms", icon: "antenna" },
      { step: "05", name: "Web Dashboard", sub: "Cost and insight in the browser", icon: "screen" },
    ],
    noteBefore: "Stages ",
    noteStrong: "01–03 run on the device",
    noteAfter: " at the meter. Only classified readings travel upstream — which is what keeps this workable on an intermittent connection.",
  },

  ui: {
    label: "03 / Product Design",
    title: "Consumer UI: Actionable Intelligence",
    sub: "Designed like a modern fintech app—converting complex telemetry into clear financial metrics, estimated runtimes, and actionable insights.",
    mockLabel: "Design mockup — illustrative figures, not live data",
    appName: "VOLTAEDGE MOBILE",
    appStatus: "● LIVE TELEMETRY",
    costLabel: "Today's Energy Cost",
    cost: "₦428.50",
    subcost: "↓ 12% vs yesterday · 18.4 Units Remaining",
    insightTitle: "💡 AI Insight: Air Conditioner",
    insight: "AC consumed 41% of power today (₦185). Setting thermostat +2°C will stretch current token by ~2.5 days.",
  },

  nilm: {
    label: "04 / Edge ML Architecture",
    title: "Non-Intrusive Load Monitoring (NILM)",
    sub: "Instead of placing a smart plug on every appliance, VoltaEdge samples aggregate current waveforms at the main distribution board and uses TinyML feature extraction to identify active appliances.",
    pipelineTitle: "NILM Execution Pipeline",
    pipeline:
      "High-frequency sampling (1–10 kHz) → Active/Reactive power signature extraction → Harmonics analysis → On-device TinyML classification → Appliance state identified.",
  },

  specs: {
    label: "05 / Hardware Specifications",
    title: "Technical Specifications & Architecture",
    sub: "Progressively disclosed technical details. All component selections represent the current prototype engineering path.",
    core: {
      summary: "Core Processing & Sensing Stack",
      rows: [
        ["Processing", "ESP32-S3 (Dual-core LX7)", "Edge compute, Wi-Fi/BLE, Vector instructions for TinyML"],
        ["Current Sensing", "SCT-013 Split-Core CT", "Non-invasive AC current sampling up to 100A"],
        ["Voltage / Energy", "ADE7753 / PZEM-004T Path", "Isolated voltage waveform & active power calculation"],
        ["Isolation", "Optocouplers / Galvanic Isolation", "Mains voltage separation from micro-controller digital logic"],
      ],
    },
    safety: {
      summary: "Electrical Safety & Protection Considerations",
      noticeStrong: "Engineering Verification Notice:",
      notice: " Production readiness requires formal compliance testing under applicable standards. Key design areas under evaluation:",
      items: [
        "Creepage and clearance distances matched to working voltages and pollution degrees.",
        "Transient surge protection using matched Metal Oxide Varistors (MOVs) and Thermal Fuses.",
        "Contactor/Relay selection matched to inductive motor startup loads (AC-3 rating).",
      ],
    },
  },

  roadmap: {
    label: "06 / Development Roadmap",
    title: "Current Development Status",
    sub: "A transparent look at where VoltaEdge AI currently stands in its development lifecycle.",
    items: [
      { badge: "PHASE 1 · PROTOTYPE", active: true, desc: "ESP32-S3 firmware, CT sensor calibration, basic Wi-Fi telemetry transmission, and mobile UI/UX layouts." },
      { badge: "PHASE 2 · TINYML", desc: "Collecting localized Nigerian appliance current waveforms to train the NILM classification model." },
      { badge: "PHASE 3 · HARDWARE", desc: "Custom PCB layout design, DIN-rail enclosure selection, and thermal/electrical safety testing." },
      { badge: "PHASE 4 · PILOT", desc: "Field testing across controlled residential and commercial installations in Nigeria." },
    ],
  },

  footer: "VoltaEdge AI · Part of the 411 Ecosystem · Engineered by Michael Ikhine",
} as const;
