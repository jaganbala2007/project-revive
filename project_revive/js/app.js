/**
 * PROJECT REVIVE — Core Application Controller & UI View Renderers
 */

class ReviveApp {
  constructor() {
    this.currentView = 'entry';
    this.selectedBatteryId = 'REV-LFP-9024';
    
    // Core Engine Instances
    this.ledger = new CircularityLedger();
    this.diagnosticsEngine = new BatteryDiagnosticsEngine();
    this.routingEngine = new BatteryRoutingEngine();
    this.economicsEngine = new EconomicsEngine();
    this.demoController = new DemoController(this);
    this.testSuite = new ReviveTestSuite();

    // Application State
    this.batteries = [];
    this.assessments = {};
    this.proposals = [];
    this.pilotPhases = [];
    this.economicsAssumptions = {};

    this.init();
  }

  init() {
    this.loadOrSeedData();
    this.bindNavigation();
    this.navigate('entry');
    this.updateHeaderLedgerStatus();
  }

  // Load from localStorage or Seed deterministically
  loadOrSeedData(forceReset = false) {
    const saved = localStorage.getItem('REVIVE_APP_STATE_V2');
    if (saved && !forceReset) {
      try {
        const state = JSON.parse(saved);
        this.batteries = state.batteries || [...SEED_BATTERIES];
        this.proposals = state.proposals || [...SEED_LEASE_PROPOSALS];
        this.pilotPhases = state.pilotPhases || [...SEED_PILOT_PHASES];
        this.assessments = state.assessments || {};
        this.economicsAssumptions = state.economicsAssumptions || { ...this.economicsEngine.defaultAssumptions };
        
        // Restore ledger
        this.ledger.initializeGenesis();
        if (state.ledgerChain && state.ledgerChain.length > 1) {
          state.ledgerChain.slice(1).forEach(b => {
            this.ledger.addEvent(b.eventType, b.batteryId, b.actor, b.details);
          });
        } else {
          seedInitialLedger(this.ledger);
        }
        if (state.credits) {
          this.ledger.credits = state.credits;
        }
        return;
      } catch (e) {
        console.warn('Failed to parse saved state, reseeding:', e);
      }
    }

    // Default Deterministic Seed
    this.batteries = JSON.parse(JSON.stringify(SEED_BATTERIES));
    this.proposals = JSON.parse(JSON.stringify(SEED_LEASE_PROPOSALS));
    this.pilotPhases = JSON.parse(JSON.stringify(SEED_PILOT_PHASES));
    this.economicsAssumptions = { ...this.economicsEngine.defaultAssumptions };
    this.assessments = {};
    
    // Seed initial assessments for existing seed batteries
    this.batteries.forEach(b => {
      this.assessments[b.batteryId] = this.diagnosticsEngine.runAssessment(b);
    });

    seedInitialLedger(this.ledger);
    this.saveState();
  }

  saveState() {
    const state = {
      batteries: this.batteries,
      proposals: this.proposals,
      pilotPhases: this.pilotPhases,
      assessments: this.assessments,
      economicsAssumptions: this.economicsAssumptions,
      ledgerChain: this.ledger.chain,
      credits: this.ledger.credits
    };
    try {
      localStorage.setItem('REVIVE_APP_STATE_V2', JSON.stringify(state));
    } catch (e) {
      console.warn('LocalStorage save failed:', e);
    }
  }

  resetAllData() {
    if (confirm('Reset all demo records back to deterministic factory seed state?')) {
      this.loadOrSeedData(true);
      this.navigate(this.currentView, this.selectedBatteryId);
      this.updateHeaderLedgerStatus();
      alert('Project REVIVE state restored to initial deterministic seed data.');
    }
  }

  bindNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const view = item.getAttribute('data-view');
        if (view) {
          this.navigate(view);
        }
      });
    });
  }

  navigate(viewName, targetBatteryId = null) {
    this.currentView = viewName;
    if (targetBatteryId) {
      this.selectedBatteryId = targetBatteryId;
    }

    // Update Nav Active State
    document.querySelectorAll('.nav-item').forEach(el => {
      if (el.getAttribute('data-view') === viewName) {
        el.classList.add('active');
      } else {
        el.classList.remove('active');
      }
    });

    // Update Header Title
    const titleMap = {
      'entry': 'Product Overview & Platform Entry',
      'overview': 'Operations & Fleet Inventory Overview',
      'register': 'Register Retired EV Battery',
      'diagnostics': 'Diagnostic Workbench & Rapid Screening',
      'routing': 'Intelligent Second-Life & Recycling Routing',
      'baas': 'Battery-as-a-Service (BaaS) Asset Allocation',
      'ledger': 'SHA-256 Tamper-Evident Circularity Ledger',
      'economics': 'Impact, Unit Economics & Sensitivity Model',
      'pilot': '6-Month Field Pilot Readiness Tracker',
      'tests': 'Automated Engineering Test Suite'
    };
    const titleEl = document.getElementById('current-page-title');
    if (titleEl) titleEl.textContent = titleMap[viewName] || 'REVIVE Console';

    const viewport = document.getElementById('content-viewport');
    if (!viewport) return;

    window.scrollTo(0, 0);

    // Render corresponding screen
    switch (viewName) {
      case 'entry':
        this.renderScreenEntry(viewport);
        break;
      case 'overview':
        this.renderScreenOverview(viewport);
        break;
      case 'register':
        this.renderScreenRegister(viewport);
        break;
      case 'diagnostics':
        this.renderScreenDiagnostics(viewport);
        break;
      case 'routing':
        this.renderScreenRouting(viewport);
        break;
      case 'baas':
        this.renderScreenBaaS(viewport);
        break;
      case 'ledger':
        this.renderScreenLedger(viewport);
        break;
      case 'economics':
        this.renderScreenEconomics(viewport);
        break;
      case 'pilot':
        this.renderScreenPilot(viewport);
        break;
      case 'tests':
        this.renderScreenTests(viewport);
        break;
      default:
        this.renderScreenOverview(viewport);
    }
  }

  updateHeaderLedgerStatus() {
    const statusDot = document.getElementById('header-ledger-dot');
    const statusText = document.getElementById('header-ledger-text');
    if (!statusDot || !statusText) return;

    const audit = this.ledger.verifyChain();
    if (audit.isValid) {
      statusDot.className = 'status-dot';
      statusText.textContent = `Ledger Verified (${this.ledger.chain.length} Blocks)`;
    } else {
      statusDot.className = 'status-dot tampered';
      statusText.textContent = `TAMPER DETECTED (${audit.issues.length} Errors)`;
    }
  }

  // ==========================================
  // SCREEN A: PRODUCT ENTRY
  // ==========================================
  renderScreenEntry(container) {
    container.innerHTML = `
      <div style="max-width: 1050px; margin: 0 auto; display: flex; flex-direction: column; gap: 32px; padding: 20px 0 40px;">
        <!-- Hero Header -->
        <div class="glass-card" style="padding: 40px; background: linear-gradient(135deg, rgba(17, 24, 39, 0.95) 0%, rgba(10, 14, 23, 0.98) 100%); border-color: var(--border-accent); position: relative; overflow: hidden;">
          <div style="position: absolute; right: -40px; top: -40px; width: 300px; height: 300px; background: radial-gradient(circle, rgba(132, 204, 22, 0.08) 0%, transparent 70%); pointer-events: none;"></div>
          
          <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 12px;">
            <span class="proto-pill">RMK REVOLT HACKATHON PROTOTYPE</span>
            <span style="font-size: 11px; color: var(--text-muted);">Simulated Environment v2.4</span>
          </div>

          <h1 style="font-size: 42px; font-weight: 800; letter-spacing: -0.5px; line-height: 1.15; margin-bottom: 12px;">
            PROJECT REVIVE
          </h1>
          <div style="font-size: 18px; color: var(--accent-lime-light); font-weight: 600; margin-bottom: 16px;">
            Battery Circularity Intelligence Platform
          </div>
          <p style="font-size: 16px; color: var(--text-secondary); max-width: 720px; line-height: 1.6; margin-bottom: 28px;">
            "Give every battery its safest next chapter."<br/>
            Transforming retired electric vehicle batteries into high-value circular energy storage assets through rapid health screening, second-life BaaS deployment, and tamper-evident lifecycle traceability.
          </p>

          <div style="display: flex; align-items: center; gap: 14px; flex-wrap: wrap;">
            <button class="quick-action-btn primary" onclick="window.app.navigate('overview')" style="padding: 12px 24px; font-size: 14px;">
              Launch REVIVE Console →
            </button>
            <button class="quick-action-btn" onclick="window.app.demoController.startGuidedDemo()" style="padding: 12px 20px; font-size: 14px; border-color: var(--accent-lime); color: var(--accent-lime-light);">
              ⭐ Start 10-Step Guided Demo
            </button>
            <button class="quick-action-btn" onclick="window.app.demoController.openPresentationMode()" style="padding: 12px 20px; font-size: 14px; border-color: var(--accent-teal); color: var(--accent-teal);">
              🎙️ 2-Minute Jury Cinema Mode
            </button>
          </div>
        </div>

        <!-- Three Core Capabilities Grid -->
        <div>
          <div style="font-size: 13px; text-transform: uppercase; letter-spacing: 1px; color: var(--text-muted); font-weight: 700; margin-bottom: 14px;">
            Three Core Platform Capabilities
          </div>
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px;">
            <div class="glass-card" style="display: flex; flex-direction: column; gap: 12px;">
              <div style="display: flex; align-items: center; justify-content: space-between;">
                <div style="width: 40px; height: 40px; border-radius: 8px; background: rgba(132, 204, 22, 0.15); display: flex; align-items: center; justify-content: center; font-size: 20px;">
                  ⚡
                </div>
                <span class="badge badge-candidate">Rapid Screening</span>
              </div>
              <h3 style="font-size: 17px; font-weight: 700;">1. Rapid Diagnostics</h3>
              <p style="font-size: 13px; color: var(--text-secondary); line-height: 1.55;">
                Deterministic electrochemical triage and capacity retention calculation. Evaluates data completeness and enforces strict safety and thermal gates before recommendation.
              </p>
              <button class="quick-action-btn" onclick="window.app.navigate('diagnostics')" style="margin-top: auto; align-self: flex-start; font-size: 12px;">
                Open Workbench →
              </button>
            </div>

            <div class="glass-card" style="display: flex; flex-direction: column; gap: 12px;">
              <div style="display: flex; align-items: center; justify-content: space-between;">
                <div style="width: 40px; height: 40px; border-radius: 8px; background: rgba(6, 182, 212, 0.15); display: flex; align-items: center; justify-content: center; font-size: 20px;">
                  🔄
                </div>
                <span class="badge badge-deployed">BaaS Redeployment</span>
              </div>
              <h3 style="font-size: 17px; font-weight: 700;">2. Battery-as-a-Service</h3>
              <p style="font-size: 13px; color: var(--text-secondary); line-height: 1.55;">
                Matches qualified second-life packs to stationary solar microgrids and telecom UPS towers. Unlocks predictable recurring lease revenue with indicative service economics.
              </p>
              <button class="quick-action-btn" onclick="window.app.navigate('baas')" style="margin-top: auto; align-self: flex-start; font-size: 12px;">
                Explore BaaS Desk →
              </button>
            </div>

            <div class="glass-card" style="display: flex; flex-direction: column; gap: 12px;">
              <div style="display: flex; align-items: center; justify-content: space-between;">
                <div style="width: 40px; height: 40px; border-radius: 8px; background: rgba(139, 92, 246, 0.15); display: flex; align-items: center; justify-content: center; font-size: 20px;">
                  ⛓️
                </div>
                <span class="badge badge-review">SHA-256 Chaining</span>
              </div>
              <h3 style="font-size: 17px; font-weight: 700;">3. Trace & Recover Ledger</h3>
              <p style="font-size: 13px; color: var(--text-secondary); line-height: 1.55;">
                Tamper-evident local hash-chain ledger tracking every intake, assessment, and recycler handoff. Anti-duplicate Circularity Credits reward verified physical recycling.
              </p>
              <button class="quick-action-btn" onclick="window.app.navigate('ledger')" style="margin-top: auto; align-self: flex-start; font-size: 12px;">
                Audit Hash Ledger →
              </button>
            </div>
          </div>
        </div>

        <!-- Honest Engineering & Safety Disclaimer -->
        <div class="alert-box alert-amber">
          <div style="font-size: 20px;">⚠️</div>
          <div>
            <div style="font-weight: 700; margin-bottom: 2px;">Responsible Engineering & Certification Boundary Notice</div>
            <div style="color: #fef3c7; line-height: 1.5;">
              Software screening alone does not constitute a certified physical battery safety clearance. Real commercial deployment mandates physical electrochemical impedance spectroscopy (EIS), calibrated thermal chamber testing, qualified engineering sign-off, and strict adherence to IEC 62619 / UL 1974 safety standards.
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // ==========================================
  // SCREEN B: OPERATIONS OVERVIEW
  // ==========================================
  renderScreenOverview(container) {
    const totalBatteries = this.batteries.length;
    const completedAssessments = Object.keys(this.assessments).length;
    
    let candidateCount = 0;
    let reviewCount = 0;
    let recycleCount = 0;
    let insufficientCount = 0;

    Object.values(this.assessments).forEach(a => {
      if (a.category.includes('SECOND-LIFE CANDIDATE')) candidateCount++;
      else if (a.category.includes('REVIEW REQUIRED')) reviewCount++;
      else if (a.category.includes('RECYCLING')) recycleCount++;
      else if (a.category.includes('INSUFFICIENT')) insufficientCount++;
    });

    const totalEvents = this.ledger.chain.length;
    const totalCredits = this.ledger.credits.length;

    container.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 24px;">
        <!-- Header & Quick Actions -->
        <div style="display: flex; align-items: center; justify-content: space-between;">
          <div>
            <h2 style="font-size: 22px; font-weight: 800;">Fleet Operations Overview</h2>
            <div style="font-size: 12.5px; color: var(--text-muted); display: flex; align-items: center; gap: 8px; margin-top: 2px;">
              <span>Simulated Fleet Intake</span>
              <span>•</span>
              <span class="proto-pill" style="margin: 0;">Deterministic Demo Data</span>
            </div>
          </div>

          <div style="display: flex; align-items: center; gap: 10px;">
            <button class="quick-action-btn" onclick="window.app.demoController.startGuidedDemo()">
              ⭐ Start Guided Demo
            </button>
            <button class="quick-action-btn primary" onclick="window.app.navigate('register')">
              + Register Battery
            </button>
          </div>
        </div>

        <!-- KPI Metrics Grid -->
        <div class="metrics-grid">
          <div class="metric-card">
            <div class="metric-label">Batteries Registered</div>
            <div class="metric-value">${totalBatteries}</div>
            <div class="metric-sub text-lime">● Active Fleet Intake</div>
          </div>

          <div class="metric-card teal">
            <div class="metric-label">Assessments Done</div>
            <div class="metric-value">${completedAssessments}</div>
            <div class="metric-sub text-teal">● Deterministic Screening</div>
          </div>

          <div class="metric-card">
            <div class="metric-label">2nd-Life Candidates</div>
            <div class="metric-value" style="color: var(--accent-lime);">${candidateCount}</div>
            <div class="metric-sub text-secondary">● Pending Eng Qualification</div>
          </div>

          <div class="metric-card amber">
            <div class="metric-label">Review Required</div>
            <div class="metric-value" style="color: var(--status-amber);">${reviewCount + insufficientCount}</div>
            <div class="metric-sub text-amber">● Lab Inspection Needed</div>
          </div>

          <div class="metric-card red">
            <div class="metric-label">Recycling Referrals</div>
            <div class="metric-value" style="color: var(--status-red);">${recycleCount}</div>
            <div class="metric-sub text-secondary">● Mineral Recovery (Li/Ni)</div>
          </div>

          <div class="metric-card purple">
            <div class="metric-label">Lifecycle Events</div>
            <div class="metric-value" style="color: var(--status-purple);">${totalEvents}</div>
            <div class="metric-sub text-muted">● SHA-256 Chained Blocks</div>
          </div>
        </div>

        <!-- Main Split: Fleet Table & Lifecycle Distribution -->
        <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 24px;">
          <!-- Fleet Table -->
          <div class="glass-card">
            <div class="card-header">
              <div>
                <div class="card-title">📦 Battery Inventory Fleet</div>
                <div class="card-subtitle">Real-time status of all registered battery packs</div>
              </div>
            </div>

            <div class="data-table-container">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Battery ID</th>
                    <th>Chemistry</th>
                    <th>Rated / Current</th>
                    <th>Retention</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  ${this.batteries.map(b => {
                    const retention = this.diagnosticsEngine.calculateRetention(b.ratedCapacityKwh, b.currentCapacityKwh);
                    const assessment = this.assessments[b.batteryId];
                    let badgeHtml = '<span class="badge badge-insufficient">NOT ASSESSED</span>';
                    if (assessment) {
                      if (assessment.category.includes('SECOND-LIFE CANDIDATE')) {
                        badgeHtml = '<span class="badge badge-candidate">2ND-LIFE CANDIDATE</span>';
                      } else if (assessment.category.includes('REVIEW REQUIRED')) {
                        badgeHtml = '<span class="badge badge-review">REVIEW REQUIRED</span>';
                      } else if (assessment.category.includes('RECYCLING')) {
                        badgeHtml = '<span class="badge badge-recycle">RECYCLING</span>';
                      } else {
                        badgeHtml = '<span class="badge badge-insufficient">INSUFFICIENT DATA</span>';
                      }
                    }

                    let barColor = 'retention-mid';
                    if (retention >= 75) barColor = 'retention-high';
                    else if (retention < 70) barColor = 'retention-low';

                    return `
                      <tr>
                        <td>
                          <div style="font-weight: 700; color: var(--text-primary);" class="text-mono">${b.batteryId}</div>
                          <div style="font-size: 11px; color: var(--text-muted);">${b.model || 'Unknown Pack'}</div>
                        </td>
                        <td><span class="badge" style="background: var(--bg-tertiary);">${b.chemistry || 'N/A'}</span></td>
                        <td>
                          <div style="font-weight: 600;">${b.currentCapacityKwh ? b.currentCapacityKwh + ' kWh' : '—'}</div>
                          <div style="font-size: 11px; color: var(--text-muted);">Rated: ${b.ratedCapacityKwh ? b.ratedCapacityKwh + ' kWh' : '—'}</div>
                        </td>
                        <td>
                          ${retention !== null ? `
                            <div class="retention-bar-wrap">
                              <div style="display: flex; justify-content: space-between; font-size: 11px; font-weight: 700;">
                                <span>${retention}%</span>
                              </div>
                              <div class="retention-bar-bg">
                                <div class="retention-bar-fill ${barColor}" style="width: ${Math.min(100, retention)}%;"></div>
                              </div>
                            </div>
                          ` : '<span style="color: var(--text-muted); font-size: 11px;">Missing Data</span>'}
                        </td>
                        <td>${badgeHtml}</td>
                        <td>
                          <button class="quick-action-btn" onclick="window.app.navigate('diagnostics', '${b.batteryId}')" style="font-size: 11.5px; padding: 4px 10px;">
                            Inspect →
                          </button>
                        </td>
                      </tr>
                    `;
                  }).join('')}
                </tbody>
              </table>
            </div>
          </div>

          <!-- Lifecycle Distribution & Chemistry Breakdown -->
          <div style="display: flex; flex-direction: column; gap: 20px;">
            <div class="glass-card">
              <div class="card-title" style="margin-bottom: 14px;">📊 Chemistry Mix</div>
              <div style="display: flex; flex-direction: column; gap: 10px;">
                <div>
                  <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 4px;">
                    <span style="font-weight: 600;">LFP (Lithium Iron Phosphate)</span>
                    <span style="color: var(--accent-lime);">60%</span>
                  </div>
                  <div class="retention-bar-bg"><div class="retention-bar-fill" style="width: 60%; background: var(--accent-lime);"></div></div>
                </div>

                <div>
                  <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 4px;">
                    <span style="font-weight: 600;">NMC 622 / 811 (Ternary)</span>
                    <span style="color: var(--accent-teal);">20%</span>
                  </div>
                  <div class="retention-bar-bg"><div class="retention-bar-fill" style="width: 20%; background: var(--accent-teal);"></div></div>
                </div>

                <div>
                  <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 4px;">
                    <span style="font-weight: 600;">NCA (Nickel Cobalt Aluminum)</span>
                    <span style="color: var(--status-purple);">20%</span>
                  </div>
                  <div class="retention-bar-bg"><div class="retention-bar-fill" style="width: 20%; background: var(--status-purple);"></div></div>
                </div>
              </div>
            </div>

            <!-- Recent Hash-Chain Events Widget -->
            <div class="glass-card">
              <div class="card-header" style="margin-bottom: 12px;">
                <div class="card-title">⛓️ Recent Ledger Events</div>
                <button class="quick-action-btn" onclick="window.app.navigate('ledger')" style="font-size: 10.5px; padding: 2px 8px;">View All</button>
              </div>

              <div class="timeline" style="font-size: 12px;">
                ${this.ledger.chain.slice(-3).reverse().map(block => `
                  <div class="timeline-item verified">
                    <div class="timeline-dot"></div>
                    <div style="display: flex; align-items: center; justify-content: space-between;">
                      <span style="font-weight: 700; color: var(--text-light);">${block.eventType}</span>
                      <span class="text-mono" style="color: var(--text-muted); font-size: 10px;">#${block.index}</span>
                    </div>
                    <div style="font-size: 11px; color: var(--text-secondary);">${block.batteryId} • by ${block.actor}</div>
                    <div class="text-mono" style="font-size: 9.5px; color: var(--accent-teal); overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                      ${block.hash.substring(0, 24)}...
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // ==========================================
  // SCREEN C: REGISTER A BATTERY
  // ==========================================
  renderScreenRegister(container) {
    container.innerHTML = `
      <div style="max-width: 800px; margin: 0 auto; display: flex; flex-direction: column; gap: 20px;">
        <div style="display: flex; align-items: center; justify-content: space-between;">
          <div>
            <h2 style="font-size: 22px; font-weight: 800;">Register Retired EV Battery</h2>
            <div style="font-size: 12.5px; color: var(--text-muted);">Intake form with live validation and capacity retention computation</div>
          </div>
          <span class="proto-pill" style="margin: 0;">Validation Enabled</span>
        </div>

        <div class="glass-card">
          <form id="battery-register-form" onsubmit="window.app.handleBatteryRegistration(event)">
            <div class="form-grid">
              <!-- Battery ID -->
              <div class="form-group">
                <label class="form-label">
                  <span>Battery ID <span style="color: var(--status-red);">*</span></span>
                  <span class="hint">Unique serial / QR token</span>
                </label>
                <input type="text" id="reg-battery-id" class="form-control mono" required value="REV-LFP-${Math.floor(1000 + Math.random() * 9000)}" placeholder="e.g. REV-LFP-9080" />
              </div>

              <!-- Chemistry -->
              <div class="form-group">
                <label class="form-label">
                  <span>Battery Chemistry <span style="color: var(--status-red);">*</span></span>
                  <span class="hint">Cathode / Anode tech</span>
                </label>
                <select id="reg-chemistry" class="form-control form-select" required>
                  <option value="LFP">LFP (Lithium Iron Phosphate)</option>
                  <option value="NMC_622">NMC 622 (Nickel Manganese Cobalt)</option>
                  <option value="NMC_811">NMC 811 (High-Nickel)</option>
                  <option value="NCA">NCA (Nickel Cobalt Aluminum)</option>
                  <option value="LTO">LTO (Lithium Titanate)</option>
                  <option value="Sodium-Ion">Sodium-Ion (Na-Ion)</option>
                </select>
              </div>

              <!-- Rated Capacity -->
              <div class="form-group">
                <label class="form-label">
                  <span>Nameplate Rated Capacity (kWh) <span style="color: var(--status-red);">*</span></span>
                  <span class="hint">OEM original capacity</span>
                </label>
                <input type="number" step="0.1" min="0.1" id="reg-rated-kwh" class="form-control" required placeholder="e.g. 40.5" oninput="window.app.updateLiveRetentionCalc()" />
              </div>

              <!-- Current Reported Capacity -->
              <div class="form-group">
                <label class="form-label">
                  <span>Current Reported Capacity (kWh) <span style="color: var(--status-red);">*</span></span>
                  <span class="hint">Discharge cycler test value</span>
                </label>
                <input type="number" step="0.1" min="0.1" id="reg-current-kwh" class="form-control" required placeholder="e.g. 34.0" oninput="window.app.updateLiveRetentionCalc()" />
              </div>

              <!-- Live Capacity Retention Calculation Box -->
              <div class="form-group full" style="background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 14px 18px;">
                <div style="display: flex; align-items: center; justify-content: space-between;">
                  <div>
                    <div style="font-size: 11px; text-transform: uppercase; color: var(--text-muted); font-weight: 700;">Computed Capacity Retention</div>
                    <div style="font-size: 12px; color: var(--text-secondary); margin-top: 2px;">Formula: (Current Capacity ÷ Rated Capacity) × 100%</div>
                  </div>
                  <div id="live-retention-display" style="font-size: 24px; font-weight: 800; font-family: var(--font-sans); color: var(--text-muted);">
                    — %
                  </div>
                </div>
                <div class="retention-bar-bg" style="margin-top: 10px; height: 8px;">
                  <div id="live-retention-bar" class="retention-bar-fill retention-high" style="width: 0%;"></div>
                </div>
              </div>

              <!-- Pack Voltage -->
              <div class="form-group">
                <label class="form-label">
                  <span>Pack Open-Circuit Voltage (V)</span>
                  <span class="hint">Optional measurement</span>
                </label>
                <input type="number" step="0.1" id="reg-voltage" class="form-control" placeholder="e.g. 324.5" />
              </div>

              <!-- Temperature -->
              <div class="form-group">
                <label class="form-label">
                  <span>Pack Temperature (°C)</span>
                  <span class="hint">Safe: 10°C - 38°C</span>
                </label>
                <input type="number" step="0.1" id="reg-temp" class="form-control" placeholder="e.g. 24.5" />
              </div>

              <!-- Cycle Count -->
              <div class="form-group">
                <label class="form-label">
                  <span>Cycle Count (if known)</span>
                  <span class="hint">Total lifetime cycles</span>
                </label>
                <input type="number" id="reg-cycles" class="form-control" placeholder="e.g. 950" />
              </div>

              <!-- Source & Custody -->
              <div class="form-group">
                <label class="form-label">
                  <span>Source & Custody Information</span>
                  <span class="hint">Origin depot / Fleet</span>
                </label>
                <input type="text" id="reg-custody" class="form-control" placeholder="e.g. Commercial Fleet Decommission - Bangalore" />
              </div>

              <!-- Inspection Notes -->
              <div class="form-group full">
                <label class="form-label">
                  <span>Visual & Mechanical Inspection Notes</span>
                  <span class="hint">Check for casing dents, cell swelling, or corrosion</span>
                </label>
                <textarea id="reg-notes" class="form-control" rows="2" placeholder="e.g. Casing clean, contactors nominal, no physical swelling observed."></textarea>
              </div>
            </div>

            <div style="display: flex; align-items: center; justify-content: flex-end; gap: 12px; margin-top: 24px; padding-top: 18px; border-top: 1px solid var(--border-color);">
              <button type="button" class="quick-action-btn" onclick="window.app.navigate('overview')">Cancel</button>
              <button type="submit" class="quick-action-btn primary" style="padding: 10px 24px; font-size: 13.5px;">
                Register & Commit to Ledger →
              </button>
            </div>
          </form>
        </div>
      </div>
    `;
  }

  updateLiveRetentionCalc() {
    const rated = parseFloat(document.getElementById('reg-rated-kwh')?.value);
    const current = parseFloat(document.getElementById('reg-current-kwh')?.value);
    const display = document.getElementById('live-retention-display');
    const bar = document.getElementById('live-retention-bar');

    if (!display || !bar) return;

    if (rated > 0 && current > 0) {
      const retention = (current / rated) * 100;
      display.textContent = `${retention.toFixed(1)}%`;
      bar.style.width = `${Math.min(100, Math.max(0, retention))}%`;
      if (retention >= 75) {
        display.style.color = 'var(--accent-lime-light)';
        bar.className = 'retention-bar-fill retention-high';
      } else if (retention >= 70) {
        display.style.color = 'var(--status-amber)';
        bar.className = 'retention-bar-fill retention-mid';
      } else {
        display.style.color = 'var(--status-red)';
        bar.className = 'retention-bar-fill retention-low';
      }
    } else {
      display.textContent = '— %';
      display.style.color = 'var(--text-muted)';
      bar.style.width = '0%';
    }
  }

  handleBatteryRegistration(e) {
    e.preventDefault();
    const batteryId = document.getElementById('reg-battery-id').value.trim();
    const chemistry = document.getElementById('reg-chemistry').value;
    const ratedCapacityKwh = parseFloat(document.getElementById('reg-rated-kwh').value);
    const currentCapacityKwh = parseFloat(document.getElementById('reg-current-kwh').value);
    const voltage = document.getElementById('reg-voltage').value ? parseFloat(document.getElementById('reg-voltage').value) : null;
    const temperature = document.getElementById('reg-temp').value ? parseFloat(document.getElementById('reg-temp').value) : null;
    const cycleCount = document.getElementById('reg-cycles').value ? parseInt(document.getElementById('reg-cycles').value) : null;
    const sourceCustody = document.getElementById('reg-custody').value.trim();
    const inspectionNotes = document.getElementById('reg-notes').value.trim();

    if (!batteryId || isNaN(ratedCapacityKwh) || isNaN(currentCapacityKwh) || ratedCapacityKwh <= 0 || currentCapacityKwh <= 0) {
      alert('Please fill all mandatory fields with valid positive capacity numbers.');
      return;
    }

    const newBattery = {
      batteryId,
      manufacturer: 'Fleet Intake',
      model: `${chemistry} Module Batch`,
      chemistry,
      ratedCapacityKwh,
      currentCapacityKwh,
      voltage,
      temperature,
      cycleCount,
      sourceCustody: sourceCustody || 'Regional Ingestion Hub',
      inspectionNotes: inspectionNotes || 'Standard visual inspection conducted.',
      evidenceInstruments: ['Calibrated Bench Cycler'],
      registeredAt: new Date().toISOString(),
      status: 'PENDING_ASSESSMENT',
      suggestedRoute: null,
      approvalStatus: 'PENDING_QUALIFIED_ENGINEER_SIGN_OFF'
    };

    this.batteries.unshift(newBattery);

    // Commit to Cryptographic Hash Chain Ledger
    this.ledger.addEvent("BATTERY_REGISTERED", batteryId, "INGESTION_OFFICER", {
      chemistry,
      ratedCapacityKwh,
      currentCapacityKwh,
      calculatedRetentionPct: parseFloat(((currentCapacityKwh / ratedCapacityKwh) * 100).toFixed(2)),
      sourceCustody: newBattery.sourceCustody
    });

    // Run rapid assessment immediately
    const assessment = this.diagnosticsEngine.runAssessment(newBattery);
    this.assessments[batteryId] = assessment;

    this.saveState();
    this.updateHeaderLedgerStatus();

    // Redirect to Diagnostic Workbench for this battery
    this.navigate('diagnostics', batteryId);
  }

  // ==========================================
  // SCREEN D: DIAGNOSTIC WORKBENCH
  // ==========================================
  renderScreenDiagnostics(container) {
    const battery = this.batteries.find(b => b.batteryId === this.selectedBatteryId) || this.batteries[0];
    const assessment = this.assessments[battery?.batteryId];
    const retention = battery ? this.diagnosticsEngine.calculateRetention(battery.ratedCapacityKwh, battery.currentCapacityKwh) : null;
    const completeness = battery ? this.diagnosticsEngine.evaluateCompleteness(battery) : null;

    container.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 24px;">
        <!-- Header & Battery Selector -->
        <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 14px;">
          <div>
            <h2 style="font-size: 22px; font-weight: 800;">Diagnostic Workbench & Rapid Screening</h2>
            <div style="font-size: 12.5px; color: var(--text-muted);">
              Deterministic triage rules, completeness evaluation, and safety gates
            </div>
          </div>

          <div style="display: flex; align-items: center; gap: 10px;">
            <label style="font-size: 12px; color: var(--text-muted); font-weight: 600;">Select Pack:</label>
            <select class="form-control form-select text-mono" style="padding: 6px 12px; font-size: 13px;" onchange="window.app.navigate('diagnostics', this.value)">
              ${this.batteries.map(b => `
                <option value="${b.batteryId}" ${b.batteryId === battery?.batteryId ? 'selected' : ''}>
                  ${b.batteryId} (${b.chemistry} - ${b.currentCapacityKwh ? b.currentCapacityKwh + 'kWh' : 'Incomplete'})
                </option>
              `).join('')}
            </select>
          </div>
        </div>

        ${!battery ? '<div class="alert-box alert-amber">No battery selected.</div>' : `
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px;">
            <!-- Left Column: Pack Details & Completeness -->
            <div style="display: flex; flex-direction: column; gap: 20px;">
              <div class="glass-card">
                <div class="card-header">
                  <div class="card-title">🔋 ${battery.batteryId} — Telemetry Profile</div>
                  <span class="badge" style="background: var(--bg-tertiary);">${battery.chemistry}</span>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; font-size: 13px;">
                  <div>
                    <span style="color: var(--text-muted); font-size: 11px; text-transform: uppercase;">Rated Nameplate</span>
                    <div style="font-weight: 700; font-size: 16px;">${battery.ratedCapacityKwh ? battery.ratedCapacityKwh + ' kWh' : '—'}</div>
                  </div>
                  <div>
                    <span style="color: var(--text-muted); font-size: 11px; text-transform: uppercase;">Reported Capacity</span>
                    <div style="font-weight: 700; font-size: 16px; color: var(--accent-lime);">${battery.currentCapacityKwh ? battery.currentCapacityKwh + ' kWh' : '—'}</div>
                  </div>
                  <div>
                    <span style="color: var(--text-muted); font-size: 11px; text-transform: uppercase;">Pack Voltage</span>
                    <div style="font-weight: 600;">${battery.voltage ? battery.voltage + ' V' : '<span style="color: var(--status-amber);">Missing</span>'}</div>
                  </div>
                  <div>
                    <span style="color: var(--text-muted); font-size: 11px; text-transform: uppercase;">Operating Temp</span>
                    <div style="font-weight: 600;">${battery.temperature ? battery.temperature + ' °C' : '<span style="color: var(--status-amber);">Missing</span>'}</div>
                  </div>
                  <div>
                    <span style="color: var(--text-muted); font-size: 11px; text-transform: uppercase;">Cycle Life</span>
                    <div style="font-weight: 600;">${battery.cycleCount ? battery.cycleCount + ' cycles' : '<span style="color: var(--text-muted);">Unrecorded</span>'}</div>
                  </div>
                  <div>
                    <span style="color: var(--text-muted); font-size: 11px; text-transform: uppercase;">Source Depot</span>
                    <div style="font-size: 12px; color: var(--text-light);">${battery.sourceCustody || 'Standard Ingestion'}</div>
                  </div>
                </div>

                <!-- Completeness Score Card -->
                <div style="margin-top: 18px; padding-top: 16px; border-top: 1px solid var(--border-color);">
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                    <span style="font-size: 12px; font-weight: 600;">Evidence Completeness</span>
                    <span style="font-size: 13px; font-weight: 800; color: ${completeness.completenessScore >= 80 ? 'var(--accent-lime)' : 'var(--status-amber)'};">
                      ${completeness.completenessScore}%
                    </span>
                  </div>
                  <div class="retention-bar-bg" style="height: 6px;">
                    <div class="retention-bar-fill" style="width: ${completeness.completenessScore}%; background: ${completeness.completenessScore >= 80 ? 'var(--accent-lime)' : 'var(--status-amber)'};"></div>
                  </div>

                  ${completeness.missingFields.length > 0 ? `
                    <div style="margin-top: 10px; font-size: 11.5px; color: var(--status-amber);">
                      ⚠️ Missing: ${completeness.missingFields.join(', ')}
                    </div>
                  ` : `
                    <div style="margin-top: 10px; font-size: 11.5px; color: var(--accent-lime);">
                      ✓ All required baseline telemetry fields verified.
                    </div>
                  `}
                </div>
              </div>

              <!-- Action: Run Screening Workflow -->
              <div class="glass-card" style="display: flex; flex-direction: column; gap: 12px; border-color: var(--border-accent);">
                <div class="card-title">⚡ Execute Screening Workflow</div>
                <p style="font-size: 12.5px; color: var(--text-secondary); line-height: 1.5;">
                  Executes the 8-step deterministic diagnostic screening pipeline: validates data completeness, computes retention, checks thermal thresholds, and assigns safe routing.
                </p>
                <button class="quick-action-btn primary" onclick="window.app.executeDemoAssessment('${battery.batteryId}')" style="padding: 10px 16px; font-size: 13px; justify-content: center;">
                  ▶ Run Screening Assessment
                </button>
              </div>
            </div>

            <!-- Right Column: Diagnostic Result & Decision -->
            <div style="display: flex; flex-direction: column; gap: 20px;">
              <div class="glass-card">
                <div class="card-header">
                  <div class="card-title">📋 Diagnostic Report & Classification</div>
                  <span class="proto-pill" style="margin: 0;">Deterministic Logic</span>
                </div>

                ${!assessment ? `
                  <div style="padding: 30px; text-align: center; color: var(--text-muted);">
                    Click "Run Screening Assessment" to execute diagnostic triage.
                  </div>
                ` : `
                  <div style="display: flex; flex-direction: column; gap: 16px;">
                    <!-- Result Status Banner -->
                    <div style="padding: 16px; border-radius: var(--radius-md); background: ${
                      assessment.category.includes('SECOND-LIFE') ? 'rgba(132, 204, 22, 0.12)' :
                      assessment.category.includes('REVIEW') ? 'rgba(245, 158, 11, 0.12)' :
                      assessment.category.includes('RECYCLING') ? 'rgba(239, 68, 68, 0.12)' : 'rgba(156, 163, 175, 0.12)'
                    }; border: 1px solid ${
                      assessment.category.includes('SECOND-LIFE') ? 'rgba(132, 204, 22, 0.4)' :
                      assessment.category.includes('REVIEW') ? 'rgba(245, 158, 11, 0.4)' :
                      assessment.category.includes('RECYCLING') ? 'rgba(239, 68, 68, 0.4)' : 'rgba(156, 163, 175, 0.4)'
                    };">
                      <div style="font-size: 11px; text-transform: uppercase; font-weight: 700; color: var(--text-muted); margin-bottom: 2px;">
                        Screening Classification
                      </div>
                      <div style="font-size: 16px; font-weight: 800; color: ${
                        assessment.category.includes('SECOND-LIFE') ? 'var(--accent-lime-light)' :
                        assessment.category.includes('REVIEW') ? '#fbbf24' :
                        assessment.category.includes('RECYCLING') ? '#f87171' : '#d1d5db'
                      };">
                        ${assessment.category}
                      </div>
                      <p style="font-size: 12.5px; color: var(--text-light); margin-top: 6px; line-height: 1.45;">
                        ${assessment.recommendation}
                      </p>
                    </div>

                    <!-- Safety & Degradation Flags -->
                    <div>
                      <div style="font-size: 11px; text-transform: uppercase; font-weight: 700; color: var(--text-muted); margin-bottom: 8px;">
                        Safety Screening Flags
                      </div>
                      ${assessment.flags.length > 0 ? `
                        <div style="display: flex; flex-direction: column; gap: 6px;">
                          ${assessment.flags.map(f => `
                            <div style="font-size: 12px; padding: 6px 10px; background: var(--bg-tertiary); border-radius: var(--radius-sm); border-left: 3px solid var(--status-amber); color: var(--text-light);">
                              ⚠️ ${f}
                            </div>
                          `).join('')}
                        </div>
                      ` : `
                        <div style="font-size: 12px; color: var(--accent-lime); padding: 6px 10px; background: rgba(132, 204, 22, 0.08); border-radius: var(--radius-sm);">
                          ✓ Zero critical thermal, swelling, or degradation flags detected.
                        </div>
                      `}
                    </div>

                    <!-- Next Step CTA -->
                    <div style="display: flex; align-items: center; justify-content: space-between; padding-top: 12px; border-top: 1px solid var(--border-color);">
                      <div style="font-size: 12px; color: var(--text-muted);">
                        Suggested Route: <strong style="color: var(--text-primary);">${assessment.suggestedRoute}</strong>
                      </div>
                      <button class="quick-action-btn primary" onclick="window.app.navigate('routing', '${battery.batteryId}')" style="font-size: 12px;">
                        View Routing Decision →
                      </button>
                    </div>
                  </div>
                `}
              </div>

              <!-- Limitations Disclaimer Box -->
              <div class="alert-box alert-amber" style="margin: 0;">
                <div style="font-size: 18px;">ℹ️</div>
                <div style="font-size: 11.5px; line-height: 1.45;">
                  <strong>Algorithm Limitations:</strong> This assessment is based on rapid deterministic screening rules. Software alone cannot certify a pack as safe; physical high-voltage Hi-Pot, EIS impedance scans, and thermal chamber cycling are required before grid or vehicle deployment.
                </div>
              </div>
            </div>
          </div>
        `}
      </div>
    `;
  }

  executeDemoAssessment(batteryId) {
    const battery = this.batteries.find(b => b.batteryId === batteryId);
    if (!battery) return;

    const assessment = this.diagnosticsEngine.runAssessment(battery);
    this.assessments[batteryId] = assessment;

    // Record assessment event on ledger
    this.ledger.addEvent("ASSESSMENT_COMPLETED", batteryId, "RAPID_DIAG_ENGINE_V2", {
      category: assessment.category,
      capacityRetentionPct: assessment.capacityRetentionPct,
      completenessScore: assessment.completenessScore,
      riskLevel: assessment.riskLevel,
      suggestedRoute: assessment.suggestedRoute
    });

    this.saveState();
    this.updateHeaderLedgerStatus();
    this.navigate('diagnostics', batteryId);
  }

  // ==========================================
  // SCREEN E: INTELLIGENT ROUTING
  // ==========================================
  renderScreenRouting(container) {
    const battery = this.batteries.find(b => b.batteryId === this.selectedBatteryId) || this.batteries[0];
    const assessment = this.assessments[battery?.batteryId];
    const suggestedKey = assessment ? assessment.suggestedRoute : (battery?.suggestedRoute || 'FURTHER_ENGINEERING_INSPECTION');
    const route = this.routingEngine.getRouteDetails(suggestedKey, battery, assessment);

    container.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 24px;">
        <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 14px;">
          <div>
            <h2 style="font-size: 22px; font-weight: 800;">Intelligent Second-Life & Recycling Routing</h2>
            <div style="font-size: 12.5px; color: var(--text-muted);">
              Transparent multi-factor routing matrix and human-in-the-loop engineering gate
            </div>
          </div>

          <div style="display: flex; align-items: center; gap: 10px;">
            <label style="font-size: 12px; color: var(--text-muted); font-weight: 600;">Selected Asset:</label>
            <select class="form-control form-select text-mono" style="padding: 6px 12px; font-size: 13px;" onchange="window.app.navigate('routing', this.value)">
              ${this.batteries.map(b => `
                <option value="${b.batteryId}" ${b.batteryId === battery?.batteryId ? 'selected' : ''}>
                  ${b.batteryId} (${b.chemistry})
                </option>
              `).join('')}
            </select>
          </div>
        </div>

        <!-- Recommended Route Showcase Card -->
        <div class="glass-card" style="border-color: var(--border-accent); background: linear-gradient(135deg, rgba(17, 24, 39, 0.95) 0%, rgba(10, 14, 23, 0.9) 100%);">
          <div style="display: flex; align-items: flex-start; justify-content: space-between; gap: 20px; flex-wrap: wrap;">
            <div>
              <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
                <span class="badge ${route.badgeClass}" style="font-size: 12px; padding: 4px 12px; font-weight: 700;">RECOMMENDED ROUTE</span>
                <span style="font-size: 12px; color: var(--accent-lime); font-weight: 600;">Chemistry Match: ${route.isChemistryCompatible ? '✓ Compatible' : '⚠️ Non-Optimal'}</span>
              </div>
              <h3 style="font-size: 24px; font-weight: 800; color: var(--text-primary);">${route.title}</h3>
              <div style="font-size: 14px; color: var(--text-secondary); margin-top: 4px;">Target Application: <strong>${route.application}</strong></div>
            </div>

            <!-- Engineering Approval Sign-Off Gate Toggle -->
            <div style="background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 14px 18px; display: flex; flex-direction: column; gap: 8px;">
              <div style="font-size: 11px; text-transform: uppercase; font-weight: 700; color: var(--text-muted);">Engineering Approval Gate</div>
              <div style="display: flex; align-items: center; gap: 8px;">
                <span class="badge ${battery.approvalStatus === 'APPROVED_BY_QUALIFIED_ENGINEER' ? 'badge-candidate' : 'badge-review'}" style="font-size: 11px;">
                  ${battery.approvalStatus === 'APPROVED_BY_QUALIFIED_ENGINEER' ? '✓ FORMALLY APPROVED' : '⏳ PENDING SIGN-OFF'}
                </span>
                <button class="quick-action-btn" onclick="window.app.toggleEngineeringApproval('${battery.batteryId}')" style="font-size: 11px; padding: 3px 8px;">
                  ${battery.approvalStatus === 'APPROVED_BY_QUALIFIED_ENGINEER' ? 'Revoke to Draft' : 'Sign Off (Demo)'}
                </button>
              </div>
              <div style="font-size: 10.5px; color: var(--text-muted);">Must be approved by Lead Safety Engineer</div>
            </div>
          </div>

          <p style="font-size: 13.5px; color: var(--text-light); margin-top: 18px; line-height: 1.55;">
            ${route.description}
          </p>

          <!-- 3-Column Decision Matrix Breakdown -->
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-top: 20px;">
            <div style="background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 14px;">
              <div style="font-size: 12px; font-weight: 700; color: var(--accent-lime); margin-bottom: 6px;">✓ Available Evidence</div>
              <ul style="font-size: 12px; color: var(--text-secondary); padding-left: 16px; line-height: 1.45;">
                ${route.evidenceAvailable.map(e => `<li>${e}</li>`).join('')}
              </ul>
            </div>

            <div style="background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 14px;">
              <div style="font-size: 12px; font-weight: 700; color: var(--status-amber); margin-bottom: 6px;">⚠️ Missing Evidence & Tests</div>
              <ul style="font-size: 12px; color: var(--text-secondary); padding-left: 16px; line-height: 1.45;">
                ${route.missingEvidence.map(m => `<li>${m}</li>`).join('')}
              </ul>
            </div>

            <div style="background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 14px;">
              <div style="font-size: 12px; font-weight: 700; color: var(--accent-teal); margin-bottom: 6px;">🛠️ Required Actions Before Dispatch</div>
              <ul style="font-size: 12px; color: var(--text-secondary); padding-left: 16px; line-height: 1.45;">
                ${route.requiredEngineeringActions.map(a => `<li>${a}</li>`).join('')}
              </ul>
            </div>
          </div>

          <div style="display: flex; align-items: center; justify-content: flex-end; gap: 12px; margin-top: 20px; padding-top: 16px; border-top: 1px solid var(--border-color);">
            <button class="quick-action-btn" onclick="window.app.navigate('diagnostics', '${battery.batteryId}')">← Back to Diagnostics</button>
            <button class="quick-action-btn primary" onclick="window.app.navigate('baas', '${battery.batteryId}')">Proceed to BaaS Allocation →</button>
          </div>
        </div>

        <!-- All Available Routing Pathways -->
        <div>
          <div style="font-size: 13px; text-transform: uppercase; letter-spacing: 1px; color: var(--text-muted); font-weight: 700; margin-bottom: 12px;">
            Full REVIVE Routing Matrix
          </div>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px;">
            ${Object.keys(this.routingEngine.routeDefinitions).map(k => {
              const def = this.routingEngine.routeDefinitions[k];
              const isSelected = k === suggestedKey;
              return `
                <div class="glass-card" style="padding: 16px; ${isSelected ? 'border-color: var(--accent-lime);' : ''}">
                  <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
                    <span class="badge ${def.badgeClass}">${def.priority}</span>
                    <span style="font-size: 11px; color: var(--text-muted);">Min Retention: ${def.targetRetentionMin}%</span>
                  </div>
                  <div style="font-weight: 700; font-size: 14px; color: var(--text-primary);">${def.title}</div>
                  <div style="font-size: 12px; color: var(--text-secondary); margin-top: 4px; line-height: 1.4;">${def.application}</div>
                  <div style="font-size: 11px; color: var(--text-muted); margin-top: 8px;">Compatible Chemistries: ${def.compatibleChemistries.join(', ')}</div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      </div>
    `;
  }

  toggleEngineeringApproval(batteryId) {
    const b = this.batteries.find(item => item.batteryId === batteryId);
    if (!b) return;

    if (b.approvalStatus === 'APPROVED_BY_QUALIFIED_ENGINEER') {
      b.approvalStatus = 'PENDING_QUALIFIED_ENGINEER_SIGN_OFF';
    } else {
      b.approvalStatus = 'APPROVED_BY_QUALIFIED_ENGINEER';
      this.ledger.addEvent("ENGINEERING_REVIEW_RECORDED", batteryId, "LEAD_BATTERY_SAFETY_ENGINEER", {
        approvalStatus: "APPROVED",
        protocol: "IEC_62619_PRE_QUALIFICATION",
        reviewer: "Er. Arvind Raghavan (REVIVE Pilot Team)"
      });
    }

    this.saveState();
    this.updateHeaderLedgerStatus();
    this.navigate('routing', batteryId);
  }

  // ==========================================
  // SCREEN F: BATTERY-AS-A-SERVICE (BaaS)
  // ==========================================
  renderScreenBaaS(container) {
    const battery = this.batteries.find(b => b.batteryId === this.selectedBatteryId) || this.batteries[0];
    const usableCapacity = battery && battery.currentCapacityKwh ? battery.currentCapacityKwh : 34.8;
    const defaultTariff = Math.round(usableCapacity * 320); // ~₹320 / kWh / month

    container.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 24px;">
        <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 14px;">
          <div>
            <h2 style="font-size: 22px; font-weight: 800;">Battery-as-a-Service (BaaS) Allocation Desk</h2>
            <div style="font-size: 12.5px; color: var(--text-muted);">
              Second-life asset subscription manager & commercial lease proposal builder
            </div>
          </div>
          <span class="proto-pill" style="margin: 0;">Draft Proposal Sandbox</span>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px;">
          <!-- Proposal Generator Form -->
          <div class="glass-card">
            <div class="card-header">
              <div class="card-title">📝 Create Simulated Lease Proposal</div>
              <span class="badge badge-candidate">Draft Mode</span>
            </div>

            <form id="baas-proposal-form" onsubmit="window.app.handleCreateProposal(event)">
              <div class="form-grid">
                <div class="form-group">
                  <label class="form-label">Selected Battery Asset</label>
                  <select id="baas-asset-id" class="form-control form-select text-mono" onchange="window.app.selectedBatteryId = this.value; window.app.navigate('baas', this.value);">
                    ${this.batteries.map(b => `
                      <option value="${b.batteryId}" ${b.batteryId === battery?.batteryId ? 'selected' : ''}>
                        ${b.batteryId} (${b.currentCapacityKwh ? b.currentCapacityKwh + 'kWh' : 'Incomplete'})
                      </option>
                    `).join('')}
                  </select>
                </div>

                <div class="form-group">
                  <label class="form-label">Customer Application</label>
                  <select id="baas-app-category" class="form-control form-select">
                    <option value="Stationary Commercial Solar ESS">Stationary Commercial Solar ESS</option>
                    <option value="Telecom Base Station Backup UPS">Telecom Base Station Backup UPS</option>
                    <option value="Agricultural Solar Pumping BESS">Agricultural Solar Pumping BESS</option>
                    <option value="Commercial 3-Wheeler Swapping Fleet">Commercial 3-Wheeler Swapping Fleet</option>
                  </select>
                </div>

                <div class="form-group">
                  <label class="form-label">Customer / Offtaker Org</label>
                  <input type="text" id="baas-customer" class="form-control" required value="SunGrid Renewable Microgrids Ltd." />
                </div>

                <div class="form-group">
                  <label class="form-label">Lease Duration (Months)</label>
                  <select id="baas-term" class="form-control form-select">
                    <option value="12">12 Months (Pilot Trial)</option>
                    <option value="24">24 Months</option>
                    <option value="36" selected>36 Months (Standard)</option>
                    <option value="48">48 Months</option>
                  </select>
                </div>

                <div class="form-group">
                  <label class="form-label">Indicative Monthly Fee (₹)</label>
                  <input type="number" id="baas-fee" class="form-control" value="${defaultTariff}" required />
                </div>

                <div class="form-group">
                  <label class="form-label">Maintenance Tier</label>
                  <select id="baas-maintenance" class="form-control form-select">
                    <option value="PREMIUM_REMOTE_BMS_TELEMETRY">Premium (24/7 Cloud Telemetry & Cell SLA)</option>
                    <option value="STANDARD_MAINTENANCE">Standard (Quarterly On-Site Inspection)</option>
                  </select>
                </div>
              </div>

              <div class="alert-box alert-blue" style="margin-top: 16px; padding: 10px 14px;">
                <div style="font-size: 14px;">ℹ️</div>
                <div style="font-size: 11px;">
                  <strong>Contract Status Disclaimer:</strong> This creates a structured draft proposal for commercial feasibility modeling. It is not an executed legal contract.
                </div>
              </div>

              <div style="display: flex; justify-content: flex-end; margin-top: 14px;">
                <button type="submit" class="quick-action-btn primary" style="padding: 10px 20px;">
                  + Generate Draft Proposal →
                </button>
              </div>
            </form>
          </div>

          <!-- Existing Proposals & Asset Economics -->
          <div style="display: flex; flex-direction: column; gap: 20px;">
            <div class="glass-card">
              <div class="card-header">
                <div class="card-title">📋 Draft Lease Proposals (${this.proposals.length})</div>
              </div>

              <div style="display: flex; flex-direction: column; gap: 12px; max-height: 420px; overflow-y: auto;">
                ${this.proposals.map(p => `
                  <div style="background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 14px;">
                    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
                      <span class="text-mono" style="font-weight: 700; color: var(--accent-teal); font-size: 12px;">${p.proposalId}</span>
                      <span class="badge badge-candidate" style="font-size: 10px;">${p.status}</span>
                    </div>
                    <div style="font-weight: 700; font-size: 14px; color: var(--text-primary);">${p.customerName}</div>
                    <div style="font-size: 12px; color: var(--text-secondary); margin-top: 2px;">${p.applicationCategory}</div>
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 10px; padding-top: 8px; border-top: 1px solid var(--border-color); font-size: 12px;">
                      <span>Asset: <strong class="text-mono text-lime">${p.assetId}</strong></span>
                      <span>Tariff: <strong style="color: var(--accent-lime);">₹${p.monthlyTariffInr.toLocaleString()}/mo</strong> (${p.leaseTermMonths} mos)</span>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  handleCreateProposal(e) {
    e.preventDefault();
    const assetId = document.getElementById('baas-asset-id').value;
    const appCategory = document.getElementById('baas-app-category').value;
    const customer = document.getElementById('baas-customer').value.trim();
    const term = parseInt(document.getElementById('baas-term').value);
    const fee = parseFloat(document.getElementById('baas-fee').value);
    const maintenance = document.getElementById('baas-maintenance').value;

    const battery = this.batteries.find(b => b.batteryId === assetId);

    const newProposal = {
      proposalId: `REV-BAAS-${Date.now().toString(36).toUpperCase()}`,
      customerName: customer || 'SunGrid Renewable Microgrids Ltd.',
      customerType: 'Commercial Energy Operator',
      assetId,
      batteryModel: battery ? `${battery.model} (${battery.chemistry})` : 'EV Traction Pack',
      applicationCategory: appCategory,
      allocatedCapacityKwh: battery ? battery.currentCapacityKwh : 34.8,
      leaseTermMonths: term,
      monthlyTariffInr: fee,
      maintenanceTier: maintenance,
      status: 'DRAFT_PROPOSAL',
      createdAt: new Date().toISOString(),
      disclaimer: 'Draft lease proposal. Not an executed commercial contract.'
    };

    this.proposals.unshift(newProposal);

    // Record on Ledger
    this.ledger.addEvent("LEASE_PROPOSAL_CREATED", assetId, "BAAS_COMMERCIAL_DESK", {
      proposalId: newProposal.proposalId,
      customer: customer,
      termMonths: term,
      monthlyTariffInr: fee,
      applicationCategory: appCategory
    });

    this.saveState();
    this.updateHeaderLedgerStatus();
    this.navigate('baas', assetId);
    alert(`Draft Lease Proposal #${newProposal.proposalId} created and committed to the Circularity Ledger.`);
  }

  // ==========================================
  // SCREEN G: CIRCULARITY LEDGER & CRYPTO AUDIT
  // ==========================================
  renderScreenLedger(container) {
    const audit = this.ledger.verifyChain();
    const credits = this.ledger.getCredits();

    container.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 24px;">
        <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 14px;">
          <div>
            <h2 style="font-size: 22px; font-weight: 800;">Circularity Ledger & Cryptographic Verification</h2>
            <div style="font-size: 12.5px; color: var(--text-muted);">
              Local SHA-256 hash-chain ledger tracking battery lifecycle events with tamper detection
            </div>
          </div>

          <div style="display: flex; align-items: center; gap: 10px;">
            <button class="quick-action-btn primary" onclick="window.app.runLedgerAudit()" style="padding: 8px 16px;">
              🔍 Run Cryptographic Audit
            </button>
            ${this.ledger.tamperedIndex !== null ? `
              <button class="quick-action-btn" onclick="window.app.restoreLedger()" style="color: var(--status-amber); border-color: var(--status-amber);">
                ↺ Restore Original Chain
              </button>
            ` : `
              <button class="quick-action-btn" onclick="window.app.simulateTamperDemo()" style="color: var(--status-red); border-color: rgba(239,68,68,0.4);">
                ⚡ Simulate Tampering (Demo)
              </button>
            `}
          </div>
        </div>

        <!-- Ledger Audit Status Banner -->
        <div class="glass-card" style="border-color: ${audit.isValid ? 'var(--border-accent)' : 'rgba(239,68,68,0.5)'};">
          <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 14px;">
            <div style="display: flex; align-items: center; gap: 14px;">
              <div style="width: 48px; height: 48px; border-radius: 50%; background: ${audit.isValid ? 'rgba(132, 204, 22, 0.15)' : 'rgba(239, 68, 68, 0.15)'}; display: flex; align-items: center; justify-content: center; font-size: 24px;">
                ${audit.isValid ? '🛡️' : '🚨'}
              </div>
              <div>
                <div style="font-size: 18px; font-weight: 800; color: ${audit.isValid ? 'var(--accent-lime-light)' : 'var(--status-red)'};">
                  ${audit.isValid ? 'Cryptographic Hash-Chain Verified (Valid)' : 'Tampering Detected: Chain Compromised!'}
                </div>
                <div style="font-size: 12.5px; color: var(--text-secondary); margin-top: 2px;">
                  ${audit.isValid ? 
                    `All ${this.ledger.chain.length} blocks sequentially validated. SHA-256 hash recalculation and prev_hash links match perfectly.` :
                    `Integrity failure detected in ledger sequence. Found ${audit.issues.length} hash mismatch violations.`
                  }
                </div>
              </div>
            </div>

            <div style="font-size: 11px; text-align: right; color: var(--text-muted);">
              <div>Algorithm: <strong>SHA-256 (Canonical JSON)</strong></div>
              <div>Audited At: <span class="text-mono">${new Date(audit.verifiedAt).toLocaleTimeString()}</span></div>
            </div>
          </div>

          ${!audit.isValid ? `
            <div style="margin-top: 16px; padding: 12px; background: rgba(239,68,68,0.1); border-radius: var(--radius-sm); border: 1px solid rgba(239,68,68,0.3);">
              <div style="font-size: 12px; font-weight: 700; color: var(--status-red); margin-bottom: 4px;">Audit Violation Log:</div>
              <ul style="font-size: 11.5px; color: #fca5a5; padding-left: 18px;">
                ${audit.issues.map(err => `<li>${err}</li>`).join('')}
              </ul>
            </div>
          ` : ''}
        </div>

        <!-- Hash Chain Block Explorer -->
        <div class="glass-card">
          <div class="card-header">
            <div class="card-title">⛓️ Lifecycle Event Block Explorer (${this.ledger.chain.length} Blocks)</div>
            <span class="proto-pill" style="margin: 0;">Local Hash-Chain</span>
          </div>

          <div style="display: flex; flex-direction: column; gap: 14px;">
            ${this.ledger.chain.map((block, idx) => {
              const isTampered = audit.blockStatuses[idx]?.status === 'TAMPERED';
              return `
                <div style="background: var(--bg-secondary); border: 1px solid ${isTampered ? 'var(--status-red)' : 'var(--border-color)'}; border-radius: var(--radius-md); padding: 16px; position: relative;">
                  <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px; margin-bottom: 10px;">
                    <div style="display: flex; align-items: center; gap: 10px;">
                      <span style="background: ${isTampered ? 'var(--status-red)' : 'var(--accent-lime)'}; color: #061905; font-weight: 800; font-size: 11px; padding: 2px 8px; border-radius: 4px;" class="text-mono">
                        BLOCK #${block.index}
                      </span>
                      <strong style="font-size: 14px; color: var(--text-primary);">${block.eventType}</strong>
                      <span class="badge" style="background: var(--bg-tertiary); font-size: 10px;">${block.batteryId}</span>
                    </div>

                    <div style="font-size: 11px; color: var(--text-muted);">
                      Actor: <strong style="color: var(--text-light);">${block.actor}</strong> • ${new Date(block.timestamp).toLocaleString()}
                    </div>
                  </div>

                  <!-- Hash linkage visual -->
                  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; font-size: 11px; margin-bottom: 10px; background: var(--bg-tertiary); padding: 8px 12px; border-radius: var(--radius-sm);">
                    <div>
                      <span style="color: var(--text-muted);">PREV HASH:</span>
                      <div class="text-mono" style="color: var(--text-secondary); word-break: break-all;">${block.prevHash}</div>
                    </div>
                    <div>
                      <span style="color: var(--text-muted);">BLOCK HASH (SHA-256):</span>
                      <div class="text-mono" style="color: ${isTampered ? 'var(--status-red)' : 'var(--accent-lime-light)'}; word-break: break-all; font-weight: 700;">${block.hash}</div>
                    </div>
                  </div>

                  <!-- Payload details -->
                  <div style="font-size: 11.5px; color: var(--text-secondary); background: rgba(0,0,0,0.2); padding: 8px 12px; border-radius: var(--radius-sm); font-family: var(--font-mono); overflow-x: auto;">
                    ${JSON.stringify(block.details, null, 2)}
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <!-- Circularity Credits Portal (Proposed Accounting System) -->
        <div class="glass-card">
          <div class="card-header">
            <div>
              <div class="card-title">🏅 Circularity Credits Ledger (Proposed Accounting)</div>
              <div class="card-subtitle">Anti-duplicate verified physical recycling credits portal</div>
            </div>
            <span class="badge badge-candidate">${credits.length} Credits Issued</span>
          </div>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px;">
            ${credits.map(cr => `
              <div style="background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 16px;">
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
                  <span class="text-mono" style="color: var(--accent-lime); font-weight: 700; font-size: 12px;">${cr.creditId}</span>
                  <span class="badge badge-candidate" style="font-size: 10px;">${cr.status}</span>
                </div>
                <div style="font-weight: 700; font-size: 14px; color: var(--text-primary);">${cr.batteryId} (${cr.creditAmountKwh} kWh)</div>
                <div style="font-size: 12px; color: var(--text-secondary); margin-top: 4px;">
                  Avoided CO₂e: <strong style="color: var(--accent-teal);">${cr.carbonOffsetEquivalentKg} kg</strong>
                </div>
                <div style="font-size: 11px; color: var(--text-muted); margin-top: 8px; padding-top: 6px; border-top: 1px solid var(--border-color);">
                  Verifier: ${cr.verifier}<br/>
                  Evidence: <span class="text-mono" style="color: var(--accent-lime);">${cr.evidenceUrl}</span>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  }

  runLedgerAudit() {
    this.updateHeaderLedgerStatus();
    this.renderScreenLedger(document.getElementById('content-viewport'));
    const audit = this.ledger.verifyChain();
    if (audit.isValid) {
      alert(`Ledger Audit Successful! All ${this.ledger.chain.length} blocks verified cryptographically with zero tampering detected.`);
    } else {
      alert(`Audit Failure Alert! Detected ${audit.issues.length} tampering violations in block payload hashes.`);
    }
  }

  simulateTamperDemo() {
    if (this.ledger.chain.length < 2) return;
    this.ledger.simulateTamper(1, { fakeCapacityKwh: 999.9, unauthorizedOverwrite: "HACKATHON_TAMPER_DEMO" });
    this.updateHeaderLedgerStatus();
    this.renderScreenLedger(document.getElementById('content-viewport'));
    alert('Tampering simulated on Block #1 payload. Notice how the audit engine immediately detects the broken cryptographic link!');
  }

  restoreLedger() {
    this.ledger.restoreLedger();
    this.updateHeaderLedgerStatus();
    this.renderScreenLedger(document.getElementById('content-viewport'));
    alert('Cryptographic hash-chain ledger restored to authentic validated state.');
  }

  // ==========================================
  // SCREEN H: IMPACT & UNIT ECONOMICS
  // ==========================================
  renderScreenEconomics(container) {
    const fin = this.economicsEngine.calculateFinancials(this.economicsAssumptions);

    container.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 24px;">
        <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 14px;">
          <div>
            <h2 style="font-size: 22px; font-weight: 800;">Impact, Unit Economics & Sensitivity Model</h2>
            <div style="font-size: 12.5px; color: var(--text-muted);">
              Transparent financial calculations, customizable assumptions, and LCA raw mineral recovery
            </div>
          </div>
          <span class="proto-pill" style="margin: 0;">Editable Assumptions</span>
        </div>

        <!-- Assumptions Control Strip -->
        <div class="glass-card" style="padding: 20px;">
          <div class="card-title" style="margin-bottom: 14px;">⚙️ Model Input Assumptions</div>
          
          <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px;">
            <div class="form-group">
              <label class="form-label">Battery Intake Fleet</label>
              <input type="number" id="econ-intake" class="form-control" value="${fin.assumptions.batteryIntakeCount}" oninput="window.app.updateEconomicsParam('batteryIntakeCount', this.value)" />
            </div>

            <div class="form-group">
              <label class="form-label">Avg Pack Capacity (kWh)</label>
              <input type="number" id="econ-kwh" class="form-control" value="${fin.assumptions.avgPackCapacityKwh}" oninput="window.app.updateEconomicsParam('avgPackCapacityKwh', this.value)" />
            </div>

            <div class="form-group">
              <label class="form-label">2nd-Life Yield (%)</label>
              <input type="number" id="econ-yield" class="form-control" min="0" max="100" value="${fin.assumptions.secondLifeYieldPct}" oninput="window.app.updateEconomicsParam('secondLifeYieldPct', this.value)" />
            </div>

            <div class="form-group">
              <label class="form-label">Monthly Tariff (₹/kWh)</label>
              <input type="number" id="econ-tariff" class="form-control" value="${fin.assumptions.monthlyLeaseRatePerKwhInr}" oninput="window.app.updateEconomicsParam('monthlyLeaseRatePerKwhInr', this.value)" />
            </div>
          </div>
        </div>

        <!-- Key Financial Outputs Grid -->
        <div class="metrics-grid">
          <div class="metric-card">
            <div class="metric-label">Gross Revenue</div>
            <div class="metric-value" style="color: var(--accent-lime-light);">₹${fin.revenue.grossInCrores} Cr</div>
            <div class="metric-sub">BaaS Lease + Scrap Recovery</div>
          </div>

          <div class="metric-card teal">
            <div class="metric-label">Total CAPEX & OPEX</div>
            <div class="metric-value" style="color: var(--accent-teal);">₹${fin.costs.totalCostInCrores} Cr</div>
            <div class="metric-sub">Testing, Refurb & Logistics</div>
          </div>

          <div class="metric-card">
            <div class="metric-label">Net Contribution</div>
            <div class="metric-value" style="color: var(--accent-lime);">₹${fin.profitability.netMarginInCrores} Cr</div>
            <div class="metric-sub text-lime">Margin: ${fin.profitability.marginPct}% (ROI: ${fin.profitability.roiPct}%)</div>
          </div>

          <div class="metric-card purple">
            <div class="metric-label">Avoided CO₂e</div>
            <div class="metric-value" style="color: var(--status-purple);">${fin.environmental.avoidedCo2MetricTons} MT</div>
            <div class="metric-sub">Grid Manufacturing Offset</div>
          </div>
        </div>

        <!-- Sensitivity Analysis Matrix -->
        <div class="glass-card">
          <div class="card-header">
            <div>
              <div class="card-title">📈 Financial Sensitivity Matrix (₹ Crores Net Contribution)</div>
              <div class="card-subtitle">Varying Second-Life Usable Yield vs Monthly Tariff</div>
            </div>
          </div>

          <div class="data-table-container">
            <table class="data-table">
              <thead>
                <tr>
                  <th>2nd-Life Usable Yield</th>
                  <th>Tariff: ₹220 / kWh / mo</th>
                  <th>Tariff: ₹320 / kWh / mo (Base)</th>
                  <th>Tariff: ₹420 / kWh / mo</th>
                </tr>
              </thead>
              <tbody>
                ${fin.sensitivityMatrix.map(row => `
                  <tr>
                    <td><strong style="color: var(--text-primary);">${row.yieldPct}% Yield</strong> (${Math.round(fin.assumptions.batteryIntakeCount * row.yieldPct / 100)} Packs Redeployed)</td>
                    <td class="text-mono" style="color: var(--text-secondary);">₹${row.rates[220].netMarginCrores} Cr</td>
                    <td class="text-mono" style="color: var(--accent-lime); font-weight: 700;">₹${row.rates[320].netMarginCrores} Cr</td>
                    <td class="text-mono" style="color: var(--accent-lime-light);">₹${row.rates[420].netMarginCrores} Cr</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <!-- LCA Raw Critical Minerals Recovery Box -->
        <div class="glass-card">
          <div class="card-title" style="margin-bottom: 14px;">♻️ Environmental Raw Material Recovery (Per 1,000 Packs)</div>
          
          <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px;">
            <div style="background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 14px;">
              <span style="font-size: 11px; color: var(--text-muted); text-transform: uppercase;">Lithium (LCE)</span>
              <div style="font-size: 20px; font-weight: 800; color: var(--accent-lime);">${fin.environmental.recoveredLithiumKg.toLocaleString()} kg</div>
            </div>

            <div style="background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 14px;">
              <span style="font-size: 11px; color: var(--text-muted); text-transform: uppercase;">Nickel</span>
              <div style="font-size: 20px; font-weight: 800; color: var(--accent-teal);">${fin.environmental.recoveredNickelKg.toLocaleString()} kg</div>
            </div>

            <div style="background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 14px;">
              <span style="font-size: 11px; color: var(--text-muted); text-transform: uppercase;">Cobalt</span>
              <div style="font-size: 20px; font-weight: 800; color: var(--status-purple);">${fin.environmental.recoveredCobaltKg.toLocaleString()} kg</div>
            </div>

            <div style="background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 14px;">
              <span style="font-size: 11px; color: var(--text-muted); text-transform: uppercase;">Copper & Aluminum</span>
              <div style="font-size: 20px; font-weight: 800; color: var(--text-light);">${fin.environmental.recoveredCopperAluKg.toLocaleString()} kg</div>
            </div>
          </div>

          <div class="alert-box alert-amber" style="margin-top: 18px; margin-bottom: 0;">
            <div style="font-size: 16px;">⚠️</div>
            <div style="font-size: 11.5px; line-height: 1.45;">
              <strong>Model Boundary Clarification:</strong> ${fin.disclaimer}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  updateEconomicsParam(param, val) {
    this.economicsAssumptions[param] = parseFloat(val) || 0;
    this.saveState();
    this.renderScreenEconomics(document.getElementById('content-viewport'));
  }

  // ==========================================
  // SCREEN I: 6-MONTH PILOT READINESS TRACKER
  // ==========================================
  renderScreenPilot(container) {
    container.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 24px;">
        <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 14px;">
          <div>
            <h2 style="font-size: 22px; font-weight: 800;">6-Month Field Pilot Readiness Roadmap</h2>
            <div style="font-size: 12.5px; color: var(--text-muted);">
              Rigorous 6-phase engineering qualification and pilot validation milestones
            </div>
          </div>
          <span class="proto-pill" style="margin: 0;">Roadmap Execution</span>
        </div>

        <div style="display: flex; flex-direction: column; gap: 18px;">
          ${this.pilotPhases.map(phase => `
            <div class="glass-card" style="padding: 20px;">
              <div style="display: flex; align-items: flex-start; justify-content: space-between; gap: 14px; flex-wrap: wrap; margin-bottom: 12px;">
                <div>
                  <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
                    <span class="badge ${phase.status === 'IN_PROGRESS' ? 'badge-candidate' : 'badge-review'}" style="font-size: 11px;">
                      PHASE ${phase.phaseNumber} • ${phase.timeline}
                    </span>
                    <span style="font-size: 11px; color: var(--text-muted);">Status: <strong>${phase.status}</strong></span>
                  </div>
                  <h3 style="font-size: 18px; font-weight: 700; color: var(--text-primary);">${phase.title}</h3>
                </div>

                <div style="text-align: right;">
                  <span style="font-size: 11px; color: var(--text-muted);">Target Progress</span>
                  <div style="font-size: 16px; font-weight: 800; color: var(--accent-lime);">${phase.progressPct}%</div>
                </div>
              </div>

              <div class="retention-bar-bg" style="height: 6px; margin-bottom: 14px;">
                <div class="retention-bar-fill" style="width: ${phase.progressPct}%; background: var(--accent-lime);"></div>
              </div>

              <!-- Phase Tasks Checklist -->
              <div style="display: flex; flex-direction: column; gap: 6px; margin-bottom: 14px;">
                ${phase.tasks.map(t => `
                  <div style="display: flex; align-items: center; gap: 10px; font-size: 12.5px; color: var(--text-light);">
                    <span style="color: ${t.done ? 'var(--accent-lime)' : 'var(--text-muted)'}; font-size: 14px;">${t.done ? '☑' : '☐'}</span>
                    <span style="${t.done ? 'text-decoration: line-through; opacity: 0.8;' : ''}">${t.name}</span>
                  </div>
                `).join('')}
              </div>

              <!-- Evidence & Owner Metadata -->
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; font-size: 11.5px; padding-top: 12px; border-top: 1px solid var(--border-color); background: rgba(0,0,0,0.15); padding: 10px 12px; border-radius: var(--radius-sm);">
                <div>
                  <span style="color: var(--text-muted);">Lead Owner:</span>
                  <div style="color: var(--text-secondary); font-weight: 600;">${phase.ownerPlaceholder}</div>
                </div>
                <div>
                  <span style="color: var(--text-muted);">Evidence Deliverable:</span>
                  <div style="color: var(--accent-teal);">${phase.evidenceRequired}</div>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  // ==========================================
  // SCREEN: AUTOMATED TEST SUITE RUNNER
  // ==========================================
  renderScreenTests(container) {
    container.innerHTML = `
      <div style="max-width: 900px; margin: 0 auto; display: flex; flex-direction: column; gap: 24px;">
        <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 14px;">
          <div>
            <h2 style="font-size: 22px; font-weight: 800;">Automated Engineering Test Suite</h2>
            <div style="font-size: 12.5px; color: var(--text-muted);">
              Automated validation of diagnostic rules, capacity math, cryptographic verification, and anti-duplicate logic
            </div>
          </div>

          <button class="quick-action-btn primary" onclick="window.app.executeTestSuite()" style="padding: 10px 20px;">
            ▶ Execute All Automated Tests
          </button>
        </div>

        <div id="test-results-container" class="glass-card">
          <div style="padding: 40px; text-align: center; color: var(--text-muted);">
            Click "Execute All Automated Tests" to run the complete test suite.
          </div>
        </div>
      </div>
    `;
  }

  async executeTestSuite() {
    const container = document.getElementById('test-results-container');
    if (!container) return;

    container.innerHTML = `<div style="padding: 30px; text-align: center; color: var(--accent-lime);">Running tests...</div>`;

    const summary = await this.testSuite.runAllTests();

    container.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; padding-bottom: 16px; border-bottom: 1px solid var(--border-color);">
        <div>
          <div style="font-size: 18px; font-weight: 800; color: ${summary.failed === 0 ? 'var(--accent-lime-light)' : 'var(--status-red)'};">
            ${summary.failed === 0 ? '✓ ALL TESTS PASSED' : '⚠️ TEST FAILURES DETECTED'}
          </div>
          <div style="font-size: 12.5px; color: var(--text-secondary); margin-top: 2px;">
            ${summary.passed} passed, ${summary.failed} failed out of ${summary.total} assertions
          </div>
        </div>

        <span class="badge ${summary.failed === 0 ? 'badge-candidate' : 'badge-recycle'}" style="font-size: 13px; padding: 6px 14px; font-weight: 800;">
          ${summary.failed === 0 ? '100% PASS' : `${summary.failed} FAILED`}
        </span>
      </div>

      <div style="display: flex; flex-direction: column; gap: 8px;">
        ${summary.results.map((r, i) => `
          <div style="display: flex; align-items: center; justify-content: space-between; padding: 10px 14px; background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: var(--radius-sm); font-size: 12.5px;">
            <div style="display: flex; align-items: center; gap: 10px;">
              <span style="color: ${r.passed ? 'var(--accent-lime)' : 'var(--status-red)'}; font-weight: 800; font-size: 14px;">
                ${r.passed ? '✓' : '✕'}
              </span>
              <span style="color: var(--text-primary); font-weight: 600;">${r.name}</span>
            </div>
            <span class="text-mono" style="font-size: 11px; color: ${r.passed ? 'var(--text-muted)' : 'var(--status-red)'};">
              ${r.passed ? 'PASSED' : r.details}
            </span>
          </div>
        `).join('')}
      </div>
    `;
  }
}

// Global App Initialization
window.addEventListener('DOMContentLoaded', () => {
  window.app = new ReviveApp();
});
