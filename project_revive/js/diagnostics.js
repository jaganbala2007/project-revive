/**
 * PROJECT REVIVE — Rapid Battery Health Diagnostics & Safety Screening Engine
 * Deterministic illustrative assessment rules, data completeness scoring, and safety gating
 */

class BatteryDiagnosticsEngine {
  constructor() {}

  // Calculate capacity retention with validation
  calculateRetention(ratedKwh, currentKwh) {
    if (!ratedKwh || !currentKwh || ratedKwh <= 0 || currentKwh <= 0) {
      return null;
    }
    const retention = (currentKwh / ratedKwh) * 100;
    return parseFloat(retention.toFixed(2));
  }

  // Evaluate data completeness score (0-100%) and missing evidence list
  evaluateCompleteness(battery) {
    const requiredFields = [
      { key: 'batteryId', label: 'Battery ID', weight: 15 },
      { key: 'chemistry', label: 'Battery Chemistry', weight: 15 },
      { key: 'ratedCapacityKwh', label: 'Rated Capacity (kWh)', weight: 20 },
      { key: 'currentCapacityKwh', label: 'Current Capacity (kWh)', weight: 20 },
      { key: 'voltage', label: 'Pack Voltage (V)', weight: 10 },
      { key: 'temperature', label: 'Pack Temperature (°C)', weight: 10 },
      { key: 'cycleCount', label: 'Cycle Count', weight: 10 }
    ];

    let totalScore = 0;
    const missingFields = [];
    const availableFields = [];

    requiredFields.forEach(field => {
      const val = battery[field.key];
      if (val !== undefined && val !== null && val !== '' && !isNaN(val)) {
        totalScore += field.weight;
        availableFields.push(field.label);
      } else {
        missingFields.push(field.label);
      }
    });

    return {
      completenessScore: totalScore,
      missingFields,
      availableFields,
      hasMinimumData: totalScore >= 70
    };
  }

  // Execute rapid multi-factor diagnostic screening
  runAssessment(battery) {
    const completeness = this.evaluateCompleteness(battery);
    const retention = this.calculateRetention(battery.ratedCapacityKwh, battery.currentCapacityKwh);
    
    const assessmentDate = new Date().toISOString();
    const flags = [];
    const missingEvidence = [...completeness.missingFields];
    let recommendation = '';
    let category = '';
    let riskLevel = 'LOW';
    let suggestedRoute = '';

    // Step 1: Check critical data sufficiency
    if (!retention || !completeness.hasMinimumData) {
      category = 'INSUFFICIENT DATA';
      recommendation = 'Mandatory telemetry missing. Complete diagnostic bench test with calibrated cycler before classification.';
      riskLevel = 'UNKNOWN';
      suggestedRoute = 'DEEP_LAB_INSPECTION';
      flags.push('Missing essential baseline capacity or thermal telemetry');
      
      return {
        assessmentId: `REV-DIAG-${Date.now().toString(36).toUpperCase()}`,
        batteryId: battery.batteryId,
        timestamp: assessmentDate,
        category,
        capacityRetentionPct: retention,
        completenessScore: completeness.completenessScore,
        missingEvidence,
        riskLevel,
        suggestedRoute,
        recommendation,
        flags,
        technicalNotes: 'Screening halted due to insufficient telemetry.',
        limitationsDisclaimer: 'Illustrative screening logic for demonstration. Real certification requires IEC 62619 / UL 1974 test protocols and calibrated laboratory instruments.'
      };
    }

    // Step 2: Thermal & Voltage Safety Gates
    if (battery.temperature && (battery.temperature > 45 || battery.temperature < 0)) {
      flags.push(`Abnormal temperature detected: ${battery.temperature}°C (Safe range: 10°C - 38°C)`);
      riskLevel = 'HIGH';
    }

    if (battery.visualDamage || (battery.inspectionNotes && battery.inspectionNotes.toLowerCase().includes('swell'))) {
      flags.push('Physical cell swelling or casing deformation reported in visual notes');
      riskLevel = 'CRITICAL';
    }

    if (battery.cycleCount && battery.cycleCount > 2500) {
      flags.push(`High historical cycling: ${battery.cycleCount} cycles`);
    }

    // Step 3: Capacity Retention & Degradation Screening Rules
    if (riskLevel === 'CRITICAL' || retention < 70.0) {
      category = 'REFER FOR QUALIFIED RECYCLING ASSESSMENT';
      riskLevel = riskLevel === 'CRITICAL' ? 'CRITICAL' : 'HIGH';
      suggestedRoute = 'QUALIFIED_RECYCLING_HYDROMET';
      recommendation = 'Pack has fallen below the 70% second-life utility threshold or presents thermal/mechanical safety risks. Hand off to verified hydrometallurgical recycling partner for raw metal recovery (Li, Ni, Co).';
    } else if (retention >= 70.0 && retention < 75.0 || riskLevel === 'HIGH' || (battery.cycleCount && battery.cycleCount > 1800)) {
      category = 'REVIEW REQUIRED';
      riskLevel = 'MEDIUM';
      suggestedRoute = 'FURTHER_ENGINEERING_INSPECTION';
      recommendation = 'Borderline capacity retention or high degradation detected. Requires electrochemical impedance spectroscopy (EIS) and module-level balancing test before application qualification.';
    } else {
      // Retention >= 75% and no critical safety flags
      category = 'SECOND-LIFE CANDIDATE — PENDING ENGINEERING QUALIFICATION';
      riskLevel = 'LOW';
      
      // Select best sub-route based on chemistry & capacity
      if (battery.chemistry === 'LFP') {
        suggestedRoute = 'SOLAR_BESS_CANDIDATE';
        recommendation = 'High-stability LFP chemistry with excellent thermal tolerance and >75% retention. Prime candidate for Stationary Solar Energy Storage (BESS) or Microgrid deployment.';
      } else if (battery.chemistry === 'NMC' || battery.chemistry === 'NMC_622' || battery.chemistry === 'NCA') {
        suggestedRoute = 'TELECOM_BACKUP_CANDIDATE';
        recommendation = 'High energy-density chemistry with qualified retention. Suitable candidate for Commercial UPS or Telecom Tower Backup systems with controlled thermal enclosures.';
      } else {
        suggestedRoute = 'E_RICKSHAW_COMMERCIAL_CANDIDATE';
        recommendation = 'Standard commercial light-vehicle application candidate, subject to mechanical vibration and casing retrofit qualification.';
      }
    }

    return {
      assessmentId: `REV-DIAG-${Date.now().toString(36).toUpperCase()}`,
      batteryId: battery.batteryId,
      timestamp: assessmentDate,
      category,
      capacityRetentionPct: retention,
      completenessScore: completeness.completenessScore,
      missingEvidence,
      riskLevel,
      suggestedRoute,
      recommendation,
      flags,
      technicalNotes: `Evaluated ${battery.chemistry || 'Unknown'} pack under deterministic REVIVE Screening Rules v2.1.`,
      limitationsDisclaimer: 'Illustrative screening logic for demonstration. Real deployment requires electrochemical impedance spectroscopy (EIS), full C-rate discharge tests, thermal runaway mitigation, and qualified engineering approval.'
    };
  }
}

// Export singleton
window.BatteryDiagnosticsEngine = BatteryDiagnosticsEngine;
