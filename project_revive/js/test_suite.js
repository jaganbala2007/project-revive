/**
 * PROJECT REVIVE — Automated Test Suite
 * Automated unit & integration tests validating all core engineering requirements
 */

class ReviveTestSuite {
  constructor() {
    this.results = [];
    this.passCount = 0;
    this.failCount = 0;
  }

  assert(testName, condition, details = '') {
    if (condition) {
      this.passCount++;
      this.results.push({ name: testName, passed: true, details });
    } else {
      this.failCount++;
      this.results.push({ name: testName, passed: false, details: details || 'Assertion failed' });
    }
  }

  async runAllTests() {
    this.results = [];
    this.passCount = 0;
    this.failCount = 0;

    const ledger = new CircularityLedger();
    const diagEngine = new BatteryDiagnosticsEngine();
    const routingEngine = new BatteryRoutingEngine();
    const econEngine = new EconomicsEngine();

    // --- TEST GROUP 1: Capacity Retention & Form Validation ---
    // Test 1.1: Valid capacity calculation
    const retention1 = diagEngine.calculateRetention(40.0, 34.0);
    this.assert("Retention Math: 34.0 / 40.0 == 85.0%", retention1 === 85.0, `Got: ${retention1}`);

    // Test 1.2: Negative or Zero rated capacity handling
    const retentionInvalid = diagEngine.calculateRetention(0, 30.0);
    this.assert("Retention Math: Zero rated capacity returns null", retentionInvalid === null);

    const retentionNegative = diagEngine.calculateRetention(-40.0, 30.0);
    this.assert("Retention Math: Negative rated capacity returns null", retentionNegative === null);

    // Test 1.3: Missing data completeness evaluation
    const incompleteBattery = { batteryId: 'TEST-01', ratedCapacityKwh: 50 };
    const compScore = diagEngine.evaluateCompleteness(incompleteBattery);
    this.assert("Completeness: Incomplete battery flagged hasMinimumData=false", compScore.hasMinimumData === false);
    this.assert("Completeness: Missing fields detected", compScore.missingFields.length > 0);

    // --- TEST GROUP 2: Diagnostic Screening Workflows ---
    // Test 2.1: Insufficient data yields INSUFFICIENT DATA
    const diagInsufficient = diagEngine.runAssessment(incompleteBattery);
    this.assert("Diagnostic: Insufficient data yields 'INSUFFICIENT DATA'", diagInsufficient.category === 'INSUFFICIENT DATA');

    // Test 2.2: Healthy pack (85% retention, normal temp) yields SECOND-LIFE CANDIDATE
    const healthyBattery = {
      batteryId: 'TEST-LFP',
      chemistry: 'LFP',
      ratedCapacityKwh: 40.0,
      currentCapacityKwh: 34.0,
      voltage: 320.0,
      temperature: 24.0,
      cycleCount: 800
    };
    const diagHealthy = diagEngine.runAssessment(healthyBattery);
    this.assert("Diagnostic: Healthy pack yields 'SECOND-LIFE CANDIDATE — PENDING ENGINEERING QUALIFICATION'", 
      diagHealthy.category === 'SECOND-LIFE CANDIDATE — PENDING ENGINEERING QUALIFICATION');

    // Test 2.3: Severely degraded pack (<70% retention) yields QUALIFIED RECYCLING
    const degradedBattery = {
      batteryId: 'TEST-NCA',
      chemistry: 'NCA',
      ratedCapacityKwh: 70.0,
      currentCapacityKwh: 42.0, // 60% retention
      voltage: 310.0,
      temperature: 25.0,
      cycleCount: 2200
    };
    const diagDegraded = diagEngine.runAssessment(degradedBattery);
    this.assert("Diagnostic: <70% retention yields 'REFER FOR QUALIFIED RECYCLING ASSESSMENT'",
      diagDegraded.category === 'REFER FOR QUALIFIED RECYCLING ASSESSMENT');

    // Test 2.4: Thermal runaway hazard (>45°C) flags high risk
    const overheatedBattery = {
      batteryId: 'TEST-HOT',
      chemistry: 'NMC',
      ratedCapacityKwh: 60.0,
      currentCapacityKwh: 50.0,
      voltage: 350.0,
      temperature: 52.0, // 52°C is unsafe
      cycleCount: 500
    };
    const diagHot = diagEngine.runAssessment(overheatedBattery);
    this.assert("Diagnostic: High temperature (>45°C) flags risk", diagHot.riskLevel === 'HIGH' || diagHot.flags.some(f => f.includes('Abnormal temperature')));

    // --- TEST GROUP 3: Intelligent Routing & Engineering Approval ---
    // Test 3.1: LFP candidate routes to Solar BESS
    const routeLfp = routingEngine.getRouteDetails('SOLAR_BESS_CANDIDATE', healthyBattery, diagHealthy);
    this.assert("Routing: LFP routes to Solar BESS with chemistry match", routeLfp.isChemistryCompatible === true);
    this.assert("Routing: Engineering Gate status is PENDING", routeLfp.approvalStatus === 'PENDING_QUALIFIED_ENGINEER_SIGN_OFF');

    // --- TEST GROUP 4: Cryptographic Hash Chain Ledger ---
    // Test 4.1: Genesis block initialization
    ledger.initializeGenesis();
    this.assert("Ledger: Genesis block has index 0", ledger.chain.length === 1 && ledger.chain[0].index === 0);

    // Test 4.2: Sequential event block chaining
    const b1 = ledger.addEvent("BATTERY_REGISTERED", "TEST-001", "INGESTION_AGENT", { test: 123 });
    const b2 = ledger.addEvent("ASSESSMENT_COMPLETED", "TEST-001", "DIAGNOSTIC_AGENT", { test: 456 });
    this.assert("Ledger: Block 2 prevHash matches Block 1 hash", b2.prevHash === b1.hash);

    // Test 4.3: Valid chain verification
    const auditValid = ledger.verifyChain();
    this.assert("Ledger: Fresh chain passes cryptographic audit", auditValid.isValid === true && auditValid.issues.length === 0);

    // Test 4.4: Tamper detection algorithm
    ledger.simulateTamper(1, { fakeCapacity: 999 });
    const auditTampered = ledger.verifyChain();
    this.assert("Ledger: Simulated payload tampering is caught by SHA-256 audit", auditTampered.isValid === false && auditTampered.issues.length > 0);

    // Test 4.5: Ledger restoration
    ledger.restoreLedger();
    const auditRestored = ledger.verifyChain();
    this.assert("Ledger: Ledger successfully restored to valid state", auditRestored.isValid === true);

    // --- TEST GROUP 5: Anti-Duplicate Circularity Credits ---
    // Test 5.1: Registration event cannot issue credits
    const invalidCredit = ledger.issueCircularityCredit("BATTERY_REGISTERED", "EVT-001", "TEST-001", 30, "Auditor");
    this.assert("Credits: Registration event is rejected from minting credits", invalidCredit.success === false);

    // Test 5.2: Verified recycling issues credit
    const validCredit = ledger.issueCircularityCredit("QUALIFIED_RECYCLING_COMPLETED", "EVT-REC-100", "TEST-001", 30, "Auditor");
    this.assert("Credits: Verified recycling event issues valid credit", validCredit.success === true && validCredit.credit.status === 'VERIFIED');

    // Test 5.3: Duplicate credit prevention for same event
    const duplicateCredit = ledger.issueCircularityCredit("QUALIFIED_RECYCLING_COMPLETED", "EVT-REC-100", "TEST-001", 30, "Auditor");
    this.assert("Credits: Duplicate event ID credit issuance is blocked", duplicateCredit.success === false);

    // --- TEST GROUP 6: Financial Economics & Sensitivity ---
    // Test 6.1: Economics calculation returns positive contribution
    const fin = econEngine.calculateFinancials({ batteryIntakeCount: 1000 });
    this.assert("Economics: Financial model returns valid gross revenue", fin.revenue.grossProjectedRevenue > 0);
    this.assert("Economics: Sensitivity matrix has 4 yield tiers", fin.sensitivityMatrix.length === 4);

    return {
      total: this.results.length,
      passed: this.passCount,
      failed: this.failCount,
      results: this.results
    };
  }
}

window.ReviveTestSuite = ReviveTestSuite;
