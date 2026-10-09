/**
 * PROJECT REVIVE — Jury Demo & 2-Minute Cinema Presentation Mode Controller
 */

class DemoController {
  constructor(app) {
    this.app = app;
    this.currentDemoStep = 0;
    this.isDemoActive = false;
    this.isPresentationActive = false;
    this.currentSlideIndex = 0;
    this.presentationTimer = null;
    this.secondsElapsed = 0;
    this.isTimerPlaying = false;

    this.demoSteps = [
      {
        step: 1,
        title: "Product Entry & Platform Architecture",
        view: "entry",
        targetBatteryId: null,
        description: "Welcome to PROJECT REVIVE. Notice the honest prototype labels and clear 3-pillar circularity architecture: Diagnostics, BaaS Redeployment, and Traceable Hash-Chain Ledger.",
        actionLabel: "View Operations Overview"
      },
      {
        step: 2,
        title: "Operations Overview & Inventory Fleet",
        view: "overview",
        targetBatteryId: null,
        description: "Explore the live fleet overview with 5 deterministic seed batteries showing different chemistries (LFP, NMC, NCA) and health conditions.",
        actionLabel: "Register New Battery"
      },
      {
        step: 3,
        title: "Battery Intake & Dynamic Retention Math",
        view: "register",
        targetBatteryId: null,
        description: "Inspect the registration form with live capacity retention calculation: Retention (%) = Current / Rated × 100. Missing evidence warnings are explicitly handled.",
        actionLabel: "Open Diagnostic Workbench"
      },
      {
        step: 4,
        title: "Diagnostic Workbench — Telemetry & Completeness",
        view: "diagnostics",
        targetBatteryId: "REV-LFP-9024",
        description: "Inspect benchmark battery REV-LFP-9024 (Tata Nexon LFP 40.5 kWh, 34.8 kWh current, 85.93% retention, 940 cycles). Notice completeness score (100%).",
        actionLabel: "Run Screening Assessment"
      },
      {
        step: 5,
        title: "Screening Classification & Safety Limitations",
        view: "diagnostics",
        targetBatteryId: "REV-LFP-9024",
        description: "Assessment classifies pack as 'SECOND-LIFE CANDIDATE — PENDING ENGINEERING QUALIFICATION'. Clear disclaimer confirms software alone is not a physical safety certification.",
        actionLabel: "Inspect Intelligent Routing"
      },
      {
        step: 6,
        title: "Intelligent Routing & Engineering Approval Gate",
        view: "routing",
        targetBatteryId: "REV-LFP-9024",
        description: "REVIVE recommends 'Solar Energy Storage (BESS)' due to high thermal stability of LFP chemistry. An explicit Engineering Approval Gate distinguishes simulated vs approved status.",
        actionLabel: "Review BaaS Allocation"
      },
      {
        step: 7,
        title: "Battery-as-a-Service (BaaS) Lease Allocation",
        view: "baas",
        targetBatteryId: "REV-LFP-9024",
        description: "View draft BaaS proposal for SunGrid Microgrids (34.8 kWh, 36 months, ₹11,136/mo). Clearly distinguishes draft proposals from executed commercial contracts.",
        actionLabel: "Explore Circularity Ledger"
      },
      {
        step: 8,
        title: "SHA-256 Tamper-Evident Hash Chain Ledger",
        view: "ledger",
        targetBatteryId: null,
        description: "Every registration, assessment, route, and handoff is cryptographically chained via SHA-256 hashes (prev_hash -> current_hash).",
        actionLabel: "Run Cryptographic Ledger Audit"
      },
      {
        step: 9,
        title: "Anti-Duplicate Circularity Credits Portal",
        view: "ledger",
        targetBatteryId: null,
        description: "Credits are minted strictly upon verified physical recycling or certified commissioning. Registration and draft proposals CANNOT mint credits.",
        actionLabel: "Inspect Unit Economics & LCA"
      },
      {
        step: 10,
        title: "Impact, Unit Economics & 6-Month Pilot Plan",
        view: "economics",
        targetBatteryId: null,
        description: "Interactive financial model with customizable assumptions (intake volume, yield %, tariff) plus 6-Month Pilot Tracker with clear milestones and ownership.",
        actionLabel: "Complete Guided Demo"
      }
    ];

    this.presentationSlides = [
      {
        id: "slide-1",
        timeRange: "0:00 – 0:12",
        targetSeconds: 12,
        title: "THE PROBLEM",
        headline: "EV Battery Retirement is Accelerating — But Latent Value is Trapped.",
        narration: "An EV battery reaching the end of its vehicle life may still hold 70% to 80% useful capacity. Today, that value is lost due to slow testing, safety uncertainty, and a complete lack of verifiable lifecycle records.",
        keyPoints: [
          "Millions of EV batteries retiring globally without standardized triage",
          "5-hour standard cycler bench testing is too slow for commercial scale",
          "Premature shredding wastes critical minerals and residual energy storage value"
        ],
        visualBadge: "PROBLEM DEFINITION"
      },
      {
        id: "slide-2",
        timeRange: "0:12 – 0:27",
        targetSeconds: 27,
        title: "INTRODUCING PROJECT REVIVE",
        headline: "Turning EV Battery Waste into Circular Energy Value.",
        narration: "REVIVE connects three core capabilities: AI-assisted rapid health diagnostics, Battery-as-a-Service redeployment for clean energy storage, and a cryptographic, tamper-evident Circularity Ledger.",
        keyPoints: [
          "Rapid Electrochemical Screening (<15 min target benchmark)",
          "Battery-as-a-Service (BaaS) for Solar Microgrids & Telecom UPS",
          "SHA-256 Lifecycle Traceability & Verifiable Circularity Credits"
        ],
        visualBadge: "CORE ARCHITECTURE"
      },
      {
        id: "slide-3",
        timeRange: "0:27 – 0:50",
        targetSeconds: 50,
        title: "RAPID DIAGNOSTICS & SCREENING",
        headline: "Deterministic Triage with Transparent Retention Math & Safety Gates.",
        narration: "We intake a retired pack, compute capacity retention from reported metrics, evaluate telemetry completeness, and apply transparent screening rules. We honestly report missing data and never claim software alone certifies battery safety.",
        keyPoints: [
          "Capacity Retention = (Current Capacity / Rated Capacity) × 100",
          "Multi-factor screening: Chemistry, Operating Temp, Delta V, Cycle Life",
          "4 Clean Classifications: Insufficient Data, Review Required, 2nd-Life Candidate, Qualified Recycling"
        ],
        visualBadge: "DIAGNOSTIC BENCH"
      },
      {
        id: "slide-4",
        timeRange: "0:50 – 1:10",
        targetSeconds: 70,
        title: "INTELLIGENT SECOND-LIFE ROUTING",
        headline: "Matching Chemistry to Application with Human-in-the-Loop Approval.",
        narration: "REVIVE recommends the safest, highest-value second life. High-stability LFP packs route to Stationary Solar BESS, while high-density NMC packs route to Telecom UPS. Every route requires an explicit engineering sign-off gate.",
        keyPoints: [
          "LFP Chemistry -> Stationary Solar Energy Storage (BESS)",
          "NMC/NCA Chemistry -> Telecom Tower Backup Power (UPS)",
          "Explicit Engineering Gate: Distinguishes simulated proposals from certified sign-off"
        ],
        visualBadge: "ROUTING MATRIX"
      },
      {
        id: "slide-5",
        timeRange: "1:10 – 1:27",
        targetSeconds: 87,
        title: "BATTERY-AS-A-SERVICE (BaaS)",
        headline: "Unlocking Predictable Recurring Revenue for Circular Assets.",
        narration: "Instead of high upfront capital costs, clean energy operators lease qualified second-life batteries on flexible monthly tariffs. We generate structured draft proposals with full telemetry integration.",
        keyPoints: [
          "Predictable recurring subscription model (₹250 – ₹380 / kWh / month)",
          "Lowers commercial solar storage CAPEX by over 45%",
          "Draft proposals clearly separated from executed commercial contracts"
        ],
        visualBadge: "COMMERCIAL MODEL"
      },
      {
        id: "slide-6",
        timeRange: "1:27 – 1:45",
        targetSeconds: 105,
        title: "CIRCULARITY LEDGER & CRYPTO AUDIT",
        headline: "Tamper-Evident SHA-256 Hash Chaining & Verifiable Credits.",
        narration: "Every lifecycle transition is recorded in a canonical SHA-256 cryptographic hash chain. Our real-time audit engine recalculates hashes and immediately flags tampered payloads. Anti-duplicate rules ensure credits only mint for verified events.",
        keyPoints: [
          "Local SHA-256 hash-chain block verification (Genesis -> Current)",
          "Live anti-tamper demonstration catches corrupted payloads instantly",
          "Circularity Credits require verified physical recycling or certified commissioning manifests"
        ],
        visualBadge: "CRYPTOGRAPHIC AUDIT"
      },
      {
        id: "slide-7",
        timeRange: "1:45 – 1:55",
        targetSeconds: 115,
        title: "IMPACT & UNIT ECONOMICS",
        headline: "Dynamic, Transparent Financial Modeling & Raw Metal Recovery.",
        narration: "Our interactive model lets users test volume, yield, and pricing assumptions. For 1,000 processed packs, circular redeployment generates high contribution margin while avoiding tons of CO₂ and recovering critical battery minerals.",
        keyPoints: [
          "Fully editable parameters with sensitivity matrix (Yield % vs Monthly Tariff)",
          "Avoids ~75 kg CO₂e per kWh of second-life capacity deployed",
          "Recovers high-purity Black Mass (Lithium Carbonate, Nickel, Cobalt, Copper)"
        ],
        visualBadge: "FINANCIAL SENSITIVITY"
      },
      {
        id: "slide-8",
        timeRange: "1:55 – 2:00",
        targetSeconds: 120,
        title: "THE ASK & 6-MONTH PILOT",
        headline: "Join Us in Validating Battery Circularity in a Controlled Pilot.",
        narration: "Help us validate the rapid diagnostic algorithms, qualify second-life module safety, and prove the circular economics in a controlled 6-month field pilot. Give every battery its safest next chapter.",
        keyPoints: [
          "Phase 1–2: High-Voltage Test Bench & Ground-Truth Lab Correlation",
          "Phase 3–4: IEC 62619 Module Certification & EPR Ledger Audit",
          "Phase 5–6: 50 kWh Field Solar BESS Pilot & Techno-Economic Evaluation"
        ],
        visualBadge: "PILOT ROADMAP"
      }
    ];
  }

  // Start Guided Step-by-Step Demo
  startGuidedDemo() {
    this.isDemoActive = true;
    this.currentDemoStep = 0;
    this.showGuidedStep(0);
  }

  nextDemoStep() {
    if (this.currentDemoStep < this.demoSteps.length - 1) {
      this.currentDemoStep++;
      this.showGuidedStep(this.currentDemoStep);
    } else {
      this.endGuidedDemo();
    }
  }

  prevDemoStep() {
    if (this.currentDemoStep > 0) {
      this.currentDemoStep--;
      this.showGuidedStep(this.currentDemoStep);
    }
  }

  endGuidedDemo() {
    this.isDemoActive = false;
    const banner = document.getElementById('guided-demo-banner');
    if (banner) banner.style.display = 'none';
  }

  showGuidedStep(index) {
    const step = this.demoSteps[index];
    this.app.navigate(step.view, step.targetBatteryId);

    const banner = document.getElementById('guided-demo-banner');
    if (banner) {
      banner.style.display = 'flex';
      banner.innerHTML = `
        <div style="display: flex; align-items: center; gap: 14px; flex: 1;">
          <div style="background: var(--accent-lime); color: #061905; font-weight: 800; border-radius: 50%; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; font-size: 14px;">
            ${step.step}
          </div>
          <div style="flex: 1;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="font-weight: 700; color: var(--text-primary); font-size: 14px;">DEMO STEP ${step.step}/10: ${step.title}</span>
              <span class="proto-pill" style="margin: 0; padding: 1px 6px;">Simulated Scenario</span>
            </div>
            <p style="font-size: 12.5px; color: var(--text-secondary); margin-top: 2px;">${step.description}</p>
          </div>
        </div>
        <div style="display: flex; align-items: center; gap: 8px;">
          ${index > 0 ? `<button class="quick-action-btn" onclick="window.app.demoController.prevDemoStep()">Back</button>` : ''}
          <button class="quick-action-btn primary" onclick="window.app.demoController.nextDemoStep()">${index === this.demoSteps.length - 1 ? 'Finish Demo' : step.actionLabel + ' →'}</button>
          <button class="quick-action-btn" onclick="window.app.demoController.endGuidedDemo()" style="color: var(--text-muted); font-size: 11px;">Exit</button>
        </div>
      `;
    }
  }

  // Open 2-Minute Cinema Presentation Mode
  openPresentationMode() {
    this.isPresentationActive = true;
    this.currentSlideIndex = 0;
    this.secondsElapsed = 0;
    this.isTimerPlaying = false;
    
    let modal = document.getElementById('presentation-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'presentation-modal';
      modal.className = 'presentation-modal';
      document.body.appendChild(modal);
    }
    
    modal.style.display = 'flex';
    this.renderPresentationSlide();
    this.bindKeyboardShortcuts();
  }

  closePresentationMode() {
    this.isPresentationActive = false;
    this.stopTimer();
    const modal = document.getElementById('presentation-modal');
    if (modal) modal.style.display = 'none';
  }

  renderPresentationSlide() {
    const slide = this.presentationSlides[this.currentSlideIndex];
    const modal = document.getElementById('presentation-modal');
    if (!modal) return;

    const progressPct = ((this.currentSlideIndex + 1) / this.presentationSlides.length) * 100;
    const timeFormatted = this.formatTime(this.secondsElapsed);

    modal.innerHTML = `
      <div class="presentation-header">
        <div style="display: flex; align-items: center; gap: 14px;">
          <div class="brand-logo-icon">R</div>
          <div>
            <div style="font-size: 15px; font-weight: 800; color: var(--text-primary); letter-spacing: 0.5px;">PROJECT REVIVE — JURY PRESENTATION</div>
            <div style="font-size: 11px; color: var(--accent-lime); font-weight: 600;">RMK REVOLT HACKATHON | 2-MINUTE PITCH</div>
          </div>
        </div>

        <div style="display: flex; align-items: center; gap: 16px;">
          <div style="display: flex; align-items: center; gap: 8px; background: var(--bg-secondary); padding: 6px 14px; border-radius: var(--radius-md); border: 1px solid var(--border-color);">
            <span style="font-size: 11px; color: var(--text-muted);">TIMER:</span>
            <span style="font-family: var(--font-mono); font-size: 15px; font-weight: 700; color: ${this.secondsElapsed > 120 ? 'var(--status-red)' : 'var(--accent-lime-light)'};">${timeFormatted} / 2:00</span>
            <button onclick="window.app.demoController.toggleTimer()" style="background: none; border: none; color: var(--text-primary); cursor: pointer; font-size: 14px; margin-left: 4px;">
              ${this.isTimerPlaying ? '⏸' : '▶'}
            </button>
            <button onclick="window.app.demoController.resetTimer()" style="background: none; border: none; color: var(--text-muted); cursor: pointer; font-size: 12px;" title="Reset Timer">↺</button>
          </div>

          <span class="proto-pill" style="margin: 0;">Demo Data Only</span>
          
          <button onclick="window.app.demoController.closePresentationMode()" class="quick-action-btn" style="border-radius: 50%; width: 32px; height: 32px; padding: 0; display: flex; align-items: center; justify-content: center;">✕</button>
        </div>
      </div>

      <!-- Slide Progress Bar -->
      <div style="width: 100%; height: 4px; background: rgba(255,255,255,0.06);">
        <div style="width: ${progressPct}%; height: 100%; background: linear-gradient(90deg, var(--accent-lime) 0%, var(--accent-teal) 100%); transition: width 0.3s ease;"></div>
      </div>

      <div class="presentation-body">
        <div style="width: 100%; max-width: 1050px; display: flex; flex-direction: column; gap: 28px;">
          <!-- Slide Meta Header -->
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <div style="display: flex; align-items: center; gap: 10px;">
              <span class="badge badge-candidate" style="font-size: 12px; padding: 4px 12px; font-weight: 700;">${slide.visualBadge}</span>
              <span style="font-family: var(--font-mono); font-size: 13px; color: var(--accent-teal); font-weight: 600;">[ ${slide.timeRange} ]</span>
            </div>
            <span style="font-size: 13px; color: var(--text-muted); font-weight: 600;">SLIDE ${this.currentSlideIndex + 1} OF ${this.presentationSlides.length}</span>
          </div>

          <!-- Main Slide Content -->
          <div>
            <div style="font-size: 13px; text-transform: uppercase; letter-spacing: 1.5px; color: var(--accent-lime); font-weight: 700;">${slide.title}</div>
            <h1 style="font-size: 32px; font-weight: 800; line-height: 1.25; margin-top: 6px; color: var(--text-primary);">${slide.headline}</h1>
          </div>

          <!-- Key Points Cards -->
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px;">
            ${slide.keyPoints.map((point, idx) => `
              <div style="background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 18px; display: flex; flex-direction: column; gap: 8px;">
                <div style="width: 24px; height: 24px; border-radius: 6px; background: rgba(132, 204, 22, 0.15); color: var(--accent-lime-light); font-weight: 800; font-size: 12px; display: flex; align-items: center; justify-content: center;">
                  0${idx + 1}
                </div>
                <div style="font-size: 13.5px; color: var(--text-light); line-height: 1.45;">${point}</div>
              </div>
            `).join('')}
          </div>

          <!-- Presenter Script & Teleprompter Box -->
          <div style="background: rgba(17, 24, 39, 0.9); border: 1px solid rgba(6, 182, 212, 0.3); border-radius: var(--radius-md); padding: 18px 22px; position: relative;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
              <span style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: var(--accent-teal); font-weight: 700; display: flex; align-items: center; gap: 6px;">
                🎙️ Presenter Script (Read Aloud)
              </span>
              <span style="font-size: 11px; color: var(--text-muted);">Target time: ${slide.targetSeconds}s</span>
            </div>
            <p style="font-size: 15px; font-style: italic; color: #e2e8f0; line-height: 1.55;">
              "${slide.narration}"
            </p>
          </div>
        </div>
      </div>

      <div class="presentation-footer">
        <div style="display: flex; align-items: center; gap: 8px;">
          <button class="quick-action-btn" onclick="window.app.demoController.prevSlide()" ${this.currentSlideIndex === 0 ? 'disabled style="opacity:0.4; cursor:not-allowed;"' : ''}>
            ← Previous Slide
          </button>
          <button class="quick-action-btn primary" onclick="window.app.demoController.nextSlide()">
            ${this.currentSlideIndex === this.presentationSlides.length - 1 ? 'Finish Presentation' : 'Next Slide →'}
          </button>
        </div>

        <div style="display: flex; align-items: center; gap: 16px; font-size: 12px; color: var(--text-muted);">
          <span>Keyboard: <kbd style="background: var(--bg-tertiary); padding: 2px 6px; border-radius: 4px; border: 1px solid var(--border-color);">←</kbd> <kbd style="background: var(--bg-tertiary); padding: 2px 6px; border-radius: 4px; border: 1px solid var(--border-color);">→</kbd> to Navigate</span>
          <span><kbd style="background: var(--bg-tertiary); padding: 2px 6px; border-radius: 4px; border: 1px solid var(--border-color);">Space</kbd> Play/Pause</span>
          <span><kbd style="background: var(--bg-tertiary); padding: 2px 6px; border-radius: 4px; border: 1px solid var(--border-color);">Esc</kbd> Exit</span>
        </div>
      </div>
    `;
  }

  nextSlide() {
    if (this.currentSlideIndex < this.presentationSlides.length - 1) {
      this.currentSlideIndex++;
      this.renderPresentationSlide();
    } else {
      this.closePresentationMode();
    }
  }

  prevSlide() {
    if (this.currentSlideIndex > 0) {
      this.currentSlideIndex--;
      this.renderPresentationSlide();
    }
  }

  toggleTimer() {
    if (this.isTimerPlaying) {
      this.stopTimer();
    } else {
      this.startTimer();
    }
  }

  startTimer() {
    this.isTimerPlaying = true;
    if (this.presentationTimer) clearInterval(this.presentationTimer);
    this.presentationTimer = setInterval(() => {
      this.secondsElapsed++;
      this.renderPresentationSlide();
    }, 1000);
    this.renderPresentationSlide();
  }

  stopTimer() {
    this.isTimerPlaying = false;
    if (this.presentationTimer) {
      clearInterval(this.presentationTimer);
      this.presentationTimer = null;
    }
    this.renderPresentationSlide();
  }

  resetTimer() {
    this.secondsElapsed = 0;
    this.renderPresentationSlide();
  }

  formatTime(totalSeconds) {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }

  bindKeyboardShortcuts() {
    if (this._keyboardBound) return;
    this._keyboardBound = true;
    window.addEventListener('keydown', (e) => {
      if (!this.isPresentationActive) return;
      if (e.key === 'ArrowRight') {
        this.nextSlide();
      } else if (e.key === 'ArrowLeft') {
        this.prevSlide();
      } else if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        this.toggleTimer();
      } else if (e.key === 'Escape') {
        this.closePresentationMode();
      }
    });
  }
}

// Export
window.DemoController = DemoController;
