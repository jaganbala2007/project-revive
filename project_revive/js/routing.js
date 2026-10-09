/**
 * PROJECT REVIVE — Intelligent Routing & Engineering Approval Gate
 * Multi-factor second-life deployment and qualified recycling routing logic
 */

class BatteryRoutingEngine {
  constructor() {
    this.routeDefinitions = {
      'SOLAR_BESS_CANDIDATE': {
        title: 'Solar Energy Storage Candidate (BESS)',
        application: 'Stationary Commercial & Residential Solar ESS',
        targetRetentionMin: 75.0,
        compatibleChemistries: ['LFP', 'Sodium-Ion', 'LTO'],
        priority: 'HIGH_VALUE_REUSE',
        badgeClass: 'badge-candidate',
        description: 'Repurposing packs for stationary microgrid and solar diurnal cycling where weight density is less critical than thermal stability and cycle life.',
        safetyConstraints: [
          'Must operate within NFPA 855 / IEC 62619 stationary energy storage guidelines',
          'Enclosure must provide HVAC active cooling and aerosol fire suppression',
          'BMS cell over-voltage delta must not exceed 25mV across any parallel string'
        ],
        requiredEngineeringActions: [
          'Conduct 0.5C charge/discharge C-rate cycle test to measure round-trip efficiency',
          'Verify BMS CAN-bus integration and telemetry fail-safe shutoff',
          'Perform physical insulation resistance (Hi-Pot) test at 1,000V DC'
        ]
      },
      'TELECOM_BACKUP_CANDIDATE': {
        title: 'Telecom Tower Backup Power (UPS)',
        application: 'Uninterruptible Power Supply (UPS) & Telecom Power',
        targetRetentionMin: 75.0,
        compatibleChemistries: ['NMC', 'NMC_622', 'NMC_811', 'NCA', 'LFP'],
        priority: 'HIGH_VALUE_REUSE',
        badgeClass: 'badge-candidate',
        description: 'Deploying qualified modules in telecom base stations replacing diesel generators for standby resilience.',
        safetyConstraints: [
          'Enclosure must support continuous float charging without accelerated electrolyte dry-out',
          'Ambient temperature control required between 15°C and 30°C',
          'Mandatory redundant contactors and isolated thermal sensors per module'
        ],
        requiredEngineeringActions: [
          'Verify high-rate pulse discharge capability (1.5C for 10 minutes)',
          'Check self-discharge rate over 7-day open-circuit rest period',
          'Certify rack-mount structural anchoring and seismic rating'
        ]
      },
      'E_RICKSHAW_COMMERCIAL_CANDIDATE': {
        title: 'E-Rickshaw & Light Fleet Retrofit',
        application: 'Light Electric 3-Wheeler Commercial Swapping Fleet',
        targetRetentionMin: 78.0,
        compatibleChemistries: ['LFP', 'NMC_622'],
        priority: 'MODERATE_VALUE_REUSE',
        badgeClass: 'badge-review',
        description: 'Repackaging certified second-life modules into standard swappable 48V/60V battery enclosures for urban transport.',
        safetyConstraints: [
          'Must pass AIS-156 / AIS-038 Rev 2 vibration and mechanical shock tests',
          'IP67 ingress protection against monsoon water flooding and road dust',
          'Over-current fuse protection rated for rapid stop-and-go regenerative braking'
        ],
        requiredEngineeringActions: [
          'Mechanical vibration test on 3-axis shaker table',
          'Thermal runaway containment test with simulated nail penetration',
          'Fleet telematics GPS/GSM tracking validation for remote state-of-health monitoring'
        ]
      },
      'FURTHER_ENGINEERING_INSPECTION': {
        title: 'Further Engineering & Laboratory Inspection',
        application: 'In-Depth Module-Level Diagnostics & Cell Re-sorting',
        targetRetentionMin: 65.0,
        compatibleChemistries: ['ALL'],
        priority: 'REVIEW_REQUIRED',
        badgeClass: 'badge-review',
        description: 'Borderline or degraded pack requiring module-level teardown to harvest healthy 80%+ cells while discarding weakened sub-strings.',
        safetyConstraints: [
          'Disassembly must occur in an isolated, fire-rated class II cleanroom with inert gas blanket',
          'Personnel must use 1,000V rated insulated Class 00 gloves and arc-flash face shields'
        ],
        requiredEngineeringActions: [
          'Electrochemical Impedance Spectroscopy (EIS) Nyquist plot scan across 0.1Hz - 10kHz',
          'X-ray Computed Tomography (CT) scan for internal anode overhang alignment & lithium plating check',
          'Disassemble pack to harvest healthy individual modules for cell re-binning'
        ]
      },
      'QUALIFIED_RECYCLING_HYDROMET': {
        title: 'Qualified Hydrometallurgical Recycling Referral',
        application: 'Critical Raw Material Recovery (Li, Ni, Co, Mn Black Mass)',
        targetRetentionMin: 0.0,
        compatibleChemistries: ['ALL'],
        priority: 'MATERIAL_RECOVERY',
        badgeClass: 'badge-recycle',
        description: 'Battery has reached end-of-life or carries safety flags. Dispatched to certified hydrometallurgical recycling partner for >95% critical mineral extraction.',
        safetyConstraints: [
          'Pack must be discharged to 0.0V in brine bath or safe resistor load bank prior to shredding',
          'Transport in ADR-certified flame-retardant vermiculite-filled shipping containers'
        ],
        requiredEngineeringActions: [
          'Complete hazardous materials manifest transfer document',
          'Record chain-of-custody transfer block on REVIVE Ledger',
          'Obtain certified recycler mass-balance assay report for Circularity Credit minting'
        ]
      }
    };
  }

  // Get full routing decision package
  getRouteDetails(suggestedRouteKey, battery, assessment) {
    const route = this.routeDefinitions[suggestedRouteKey] || this.routeDefinitions['FURTHER_ENGINEERING_INSPECTION'];
    
    // Check chemistry compatibility
    const isChemistryCompatible = route.compatibleChemistries.includes('ALL') || 
                                  route.compatibleChemistries.includes(battery.chemistry);

    // Calculate confidence level based on data completeness
    const confidence = assessment ? (assessment.completenessScore >= 80 ? 'HIGH' : (assessment.completenessScore >= 60 ? 'MEDIUM' : 'LOW')) : 'LOW';

    return {
      routeKey: suggestedRouteKey,
      title: route.title,
      application: route.application,
      badgeClass: route.badgeClass,
      description: route.description,
      isChemistryCompatible,
      targetRetentionMin: route.targetRetentionMin,
      actualRetention: assessment ? assessment.capacityRetentionPct : null,
      confidence,
      safetyConstraints: route.safetyConstraints,
      requiredEngineeringActions: route.requiredEngineeringActions,
      evidenceAvailable: assessment ? (assessment.availableEvidence || ['Basic nameplate rating', 'Reported capacity']) : [],
      missingEvidence: assessment ? assessment.missingEvidence : ['Thermal telemetry', 'EIS impedance', 'Internal resistance'],
      isSimulated: true,
      approvalStatus: 'PENDING_QUALIFIED_ENGINEER_SIGN_OFF'
    };
  }
}

// Export singleton
window.BatteryRoutingEngine = BatteryRoutingEngine;
