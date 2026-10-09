/**
 * PROJECT REVIVE — Deterministic Seed Data
 * Seed batteries, initial hash-chain ledger blocks, lease proposals, and pilot milestones
 */

const SEED_BATTERIES = [
  {
    batteryId: 'REV-LFP-9024',
    manufacturer: 'Tata AutoComp / Gotion',
    model: 'Nexon EV Prime Gen2 Pack',
    chemistry: 'LFP',
    ratedCapacityKwh: 40.5,
    currentCapacityKwh: 34.8,
    voltage: 320.4,
    temperature: 24.5,
    cycleCount: 940,
    sourceCustody: 'Commercial Fleet Decommission - Bangalore Hub',
    inspectionNotes: 'Clean aluminum casing, zero cell swelling, contactor relays tested nominal.',
    evidenceInstruments: ['Chroma 17020 Regenerative Battery Pack Cycler', 'Keysight DAQ970A Temperature Logger'],
    registeredAt: '2026-10-02T10:14:00.000Z',
    status: 'SECOND_LIFE_CANDIDATE',
    suggestedRoute: 'SOLAR_BESS_CANDIDATE',
    approvalStatus: 'PENDING_QUALIFIED_ENGINEER_SIGN_OFF'
  },
  {
    batteryId: 'REV-NMC-8102',
    manufacturer: 'LG Energy Solution',
    model: 'Z-Series 600V Traction Pack',
    chemistry: 'NMC_622',
    ratedCapacityKwh: 64.0,
    currentCapacityKwh: 51.8,
    voltage: 388.2,
    temperature: 28.0,
    cycleCount: 1220,
    sourceCustody: 'OEM Warranty Replacement - Chennai Depot',
    inspectionNotes: 'Mild road debris scuff on underbelly shield; internal cell module telemetry healthy.',
    evidenceInstruments: ['Hioki BT3562 Internal Resistance Meter'],
    registeredAt: '2026-10-03T14:30:00.000Z',
    status: 'SECOND_LIFE_CANDIDATE',
    suggestedRoute: 'TELECOM_BACKUP_CANDIDATE',
    approvalStatus: 'PENDING_QUALIFIED_ENGINEER_SIGN_OFF'
  },
  {
    batteryId: 'REV-LFP-3041',
    manufacturer: 'Exide Leclanche',
    model: 'Commercial Swappable Module',
    chemistry: 'LFP',
    ratedCapacityKwh: 15.0,
    currentCapacityKwh: 10.8,
    voltage: 51.2,
    temperature: 31.0,
    cycleCount: 1950,
    sourceCustody: 'Delhi 3-Wheeler Logistics Fleet',
    inspectionNotes: 'High cycle count, slight cell delta V (48mV). Needs module-level rebalancing.',
    evidenceInstruments: ['Bitrode FTV Pack Tester'],
    registeredAt: '2026-10-04T09:00:00.000Z',
    status: 'REVIEW_REQUIRED',
    suggestedRoute: 'FURTHER_ENGINEERING_INSPECTION',
    approvalStatus: 'PENDING_QUALIFIED_ENGINEER_SIGN_OFF'
  },
  {
    batteryId: 'REV-NCA-4099',
    manufacturer: 'Panasonic Energy',
    model: 'Model-3 Cylindrical Module Batch',
    chemistry: 'NCA',
    ratedCapacityKwh: 75.0,
    currentCapacityKwh: 48.0,
    voltage: 340.0,
    temperature: 36.5,
    cycleCount: 2850,
    sourceCustody: 'Insurance Salvage Yard - Pune',
    inspectionNotes: 'Heavy degradation, 64% retention, minor thermal scorch mark near terminal fuse.',
    evidenceInstruments: ['Fluke Ti480 Thermal Imager'],
    registeredAt: '2026-10-05T11:20:00.000Z',
    status: 'REFER_FOR_RECYCLING',
    suggestedRoute: 'QUALIFIED_RECYCLING_HYDROMET',
    approvalStatus: 'APPROVED_FOR_DISPATCH'
  },
  {
    batteryId: 'REV-UNK-1002',
    manufacturer: 'Unknown / Unlabeled',
    model: 'Imported Prototype Pack',
    chemistry: 'Unknown',
    ratedCapacityKwh: null,
    currentCapacityKwh: null,
    voltage: null,
    temperature: null,
    cycleCount: null,
    sourceCustody: 'Municipal E-Waste Intake Facility',
    inspectionNotes: 'Missing OEM label plate. Telemetry connector damaged.',
    evidenceInstruments: [],
    registeredAt: '2026-10-06T16:45:00.000Z',
    status: 'INSUFFICIENT_DATA',
    suggestedRoute: 'FURTHER_ENGINEERING_INSPECTION',
    approvalStatus: 'BLOCKED_MISSING_TELEMETRY'
  }
];

const SEED_LEASE_PROPOSALS = [
  {
    proposalId: 'REV-BAAS-2026-001',
    customerName: 'SunGrid Microgrids Ltd.',
    customerType: 'Commercial Solar Developer',
    assetId: 'REV-LFP-9024',
    batteryModel: 'Nexon EV Prime Gen2 Pack (LFP)',
    applicationCategory: 'Stationary Commercial Solar ESS',
    allocatedCapacityKwh: 34.8,
    leaseTermMonths: 36,
    monthlyTariffInr: 11136, // ~₹320 / kWh / month
    maintenanceTier: 'PREMIUM_SLA_REMOTE_BMS_TELEMETRY',
    status: 'DRAFT_PROPOSAL',
    createdAt: '2026-10-07T12:00:00.000Z',
    disclaimer: 'Draft lease proposal. Not an executed commercial contract.'
  },
  {
    proposalId: 'REV-BAAS-2026-002',
    customerName: 'Indus Infra Towers',
    customerType: 'Telecom Infrastructure',
    assetId: 'REV-NMC-8102',
    batteryModel: 'Z-Series 600V Traction Pack (NMC)',
    applicationCategory: 'Telecom Base Station Backup UPS',
    allocatedCapacityKwh: 51.8,
    leaseTermMonths: 24,
    monthlyTariffInr: 16576,
    maintenanceTier: 'STANDARD_CYCLE_WARRANTY',
    status: 'DRAFT_PROPOSAL',
    createdAt: '2026-10-08T09:30:00.000Z',
    disclaimer: 'Draft lease proposal. Not an executed commercial contract.'
  }
];

const SEED_PILOT_PHASES = [
  {
    phaseNumber: 1,
    title: 'Site Selection & Safety Protocol',
    timeline: 'Month 1',
    status: 'IN_PROGRESS',
    progressPct: 85,
    ownerPlaceholder: 'Lead Safety & Thermal Systems Engineer (REVIVE Core Team)',
    completionCriteria: 'NFPA 855 / CEA fire-suppression protocols ratified, isolated high-voltage test bench commissioned with Class 00 safety gear.',
    tasks: [
      { name: 'Commission fire-rated 1,000V DC bench with active aerosol suppression', done: true },
      { name: 'Draft Standard Operating Procedure (SOP) for damaged/swollen pack intake', done: true },
      { name: 'Install high-precision thermal chamber (-10°C to +60°C) with exhaust scrubber', done: false }
    ],
    evidenceRequired: 'Site safety audit certificate & local fire authority clearance.'
  },
  {
    phaseNumber: 2,
    title: 'Diagnostic Benchmark & Ground-Truth Comparison',
    timeline: 'Month 2',
    status: 'PLANNED',
    progressPct: 40,
    ownerPlaceholder: 'Battery Diagnostic Algorithm Specialist',
    completionCriteria: 'Demonstrate <15 min rapid screening correlation with 5-hour laboratory C-rate ground truth across 50 benchmark cells.',
    tasks: [
      { name: 'Collect electrochemical impedance spectroscopy (EIS) dataset on 50 retired packs', done: true },
      { name: 'Calibrate machine-learning regression weights against full discharge curves', done: false },
      { name: 'Publish formal ground-truth variance report (<3% error tolerance target)', done: false }
    ],
    evidenceRequired: 'Comparative C-rate vs Rapid Screening correlation dataset (R² > 0.94).'
  },
  {
    phaseNumber: 3,
    title: 'Controlled Second-Life Qualification',
    timeline: 'Month 3',
    status: 'PLANNED',
    progressPct: 15,
    ownerPlaceholder: 'Mechanical & Power Electronics Engineer',
    completionCriteria: 'Refurbish, balance, and assemble 5 demonstration 10kWh second-life modules meeting IEC 62619 vibration and thermal standards.',
    tasks: [
      { name: 'Engineer modular swappable casing with integrated liquid/air cooling channels', done: false },
      { name: 'Validate multi-string BMS master-slave CAN communication protocol', done: false },
      { name: 'Perform 100 continuous diurnal 1C/1C charge-discharge stress cycles', done: false }
    ],
    evidenceRequired: 'IEC 62619 module stress test report and BMS telemetry logs.'
  },
  {
    phaseNumber: 4,
    title: 'Lifecycle Ledger & Compliance Audit',
    timeline: 'Month 4',
    status: 'PLANNED',
    progressPct: 0,
    ownerPlaceholder: 'Traceability Systems & Compliance Architect',
    completionCriteria: 'End-to-end integration of SHA-256 hash-chain ledger with partner recycling manifests and Battery Passport schemas.',
    tasks: [
      { name: 'Map REVIVE ledger schema to EU Battery Passport & India EPR compliance standards', done: false },
      { name: 'Implement tamper-evident API endpoints for certified recycling partners', done: false },
      { name: 'Deploy anti-duplicate Circularity Credit issuance verifier', done: false }
    ],
    evidenceRequired: 'Cryptographic ledger audit log and EPR compliance mapping documentation.'
  },
  {
    phaseNumber: 5,
    title: 'Supervised Field Pilot Deployments',
    timeline: 'Month 5',
    status: 'PLANNED',
    progressPct: 0,
    ownerPlaceholder: 'Field Operations & Energy Systems Lead',
    completionCriteria: 'Deploy 50 kWh second-life stationary storage asset at pilot solar farm under 24/7 cloud telemetry supervision.',
    tasks: [
      { name: 'Install 50 kWh REVIVE BESS at host agricultural solar pumping station', done: false },
      { name: 'Connect IoT gateway for second-by-second thermal and cell-voltage telemetry', done: false },
      { name: 'Measure round-trip energy efficiency (target >86%) and thermal stability', done: false }
    ],
    evidenceRequired: '30-day continuous field telemetry logs and grid integration sign-off.'
  },
  {
    phaseNumber: 6,
    title: 'Independent Techno-Economic Review & Scale Decision',
    timeline: 'Month 6',
    status: 'PLANNED',
    progressPct: 0,
    ownerPlaceholder: 'Joint Project Steering Committee & Independent Evaluators',
    completionCriteria: 'Third-party validated unit economics, audited degradation curves, and formal decision on commercial scaling.',
    tasks: [
      { name: 'Calculate real-world Levelized Cost of Storage (LCOS) vs new battery alternatives', done: false },
      { name: 'Conduct end-of-pilot safety teardown of field-tested modules', done: false },
      { name: 'Prepare final commercial investment memorandum for scale deployment', done: false }
    ],
    evidenceRequired: 'Independent techno-economic assessment report and audited financial ledger.'
  }
];

// Seed initial ledger blocks
function seedInitialLedger(ledger) {
  ledger.initializeGenesis();
  
  // Block 1: Initial Batch Intake
  ledger.addEvent("BATTERY_REGISTERED", "REV-LFP-9024", "INGESTION_AGENT_01", {
    chemistry: "LFP",
    ratedCapacityKwh: 40.5,
    currentCapacityKwh: 34.8,
    calculatedRetentionPct: 85.93,
    sourceCustody: "Bangalore Logistics Fleet Depot"
  });

  // Block 2: Diagnostic Assessment
  ledger.addEvent("ASSESSMENT_COMPLETED", "REV-LFP-9024", "DIAGNOSTIC_ENGINE_V2", {
    category: "SECOND-LIFE CANDIDATE — PENDING ENGINEERING QUALIFICATION",
    capacityRetentionPct: 85.93,
    riskLevel: "LOW",
    suggestedRoute: "SOLAR_BESS_CANDIDATE"
  });

  // Block 3: Route Proposed
  ledger.addEvent("ROUTE_PROPOSED", "REV-LFP-9024", "ROUTING_AI_AGENT", {
    targetApplication: "Stationary Commercial Solar ESS",
    safetyConstraintsVerified: true,
    approvalGate: "PENDING_QUALIFIED_ENGINEER_SIGN_OFF"
  });

  // Block 4: Second-Life Proposal Created
  ledger.addEvent("LEASE_PROPOSAL_CREATED", "REV-LFP-9024", "BAAS_ALLOCATION_DESK", {
    proposalId: "REV-BAAS-2026-001",
    customer: "SunGrid Microgrids Ltd.",
    monthlyTariffInr: 11136,
    contractStatus: "DRAFT"
  });

  // Block 5: Recycling Manifest for End-of-Life Pack
  ledger.addEvent("RECYCLER_HANDOFF_RECORDED", "REV-NCA-4099", "HAZMAT_DISPATCH_OFFICER", {
    recyclerPartner: "EcoRecycle Hydrometallurgical Refinery Ltd.",
    manifestId: "HAZ-EPR-2026-9901",
    weightKg: 420.0,
    intendedExtraction: "Li2CO3, NiSO4, CoSO4"
  });

  // Issue one legitimate Circularity Credit for an earlier verified recycling event
  ledger.issueCircularityCredit(
    "QUALIFIED_RECYCLING_COMPLETED",
    "EVT-REC-2026-081",
    "REV-NCA-4099",
    48.0,
    "National Bureau of Clean Energy Auditing",
    "doc://revive/manifests/epr-cert-4099.pdf"
  );
}

window.SEED_BATTERIES = SEED_BATTERIES;
window.SEED_LEASE_PROPOSALS = SEED_LEASE_PROPOSALS;
window.SEED_PILOT_PHASES = SEED_PILOT_PHASES;
window.seedInitialLedger = seedInitialLedger;
