/**
 * PROJECT REVIVE — Interactive Financial Economics & Lifecycle Environmental Impact Model
 * Transparent calculations, sensitivity matrices, and LCA material recovery estimates
 */

class EconomicsEngine {
  constructor() {
    this.defaultAssumptions = {
      batteryIntakeCount: 1000,
      avgPackCapacityKwh: 40,
      secondLifeYieldPct: 65, // 65% qualified for second-life, 35% routed to direct recycling
      monthlyLeaseRatePerKwhInr: 320, // ₹320 / kWh / month
      leaseDurationMonths: 36, // 3-year BaaS contract
      assessmentCostPerPackInr: 4500, // Rapid automated diagnostic bench cost
      refurbishmentCostPerPackInr: 18000, // Module re-balancing, casing, BMS upgrade
      recyclingRecoveryValuePerPackInr: 24000, // Black mass value recovered per recycled pack
      platformOverheadPct: 10, // 10% platform SG&A and cloud infrastructure
      logisticsCostPerPackInr: 5000 // Inbound/outbound specialized HazMat transport
    };
  }

  // Calculate full financial model from user-entered assumptions
  calculateFinancials(assumptions = {}) {
    const p = { ...this.defaultAssumptions, ...assumptions };

    const totalIntake = Math.max(1, parseInt(p.batteryIntakeCount) || 1000);
    const avgCapacity = Math.max(1, parseFloat(p.avgPackCapacityKwh) || 40);
    const yieldFraction = Math.min(100, Math.max(0, parseFloat(p.secondLifeYieldPct) || 65)) / 100;
    const monthlyRate = Math.max(0, parseFloat(p.monthlyLeaseRatePerKwhInr) || 320);
    const leaseMonths = Math.max(1, parseInt(p.leaseDurationMonths) || 36);
    
    const assessmentCost = Math.max(0, parseFloat(p.assessmentCostPerPackInr) || 4500);
    const refurbCost = Math.max(0, parseFloat(p.refurbishmentCostPerPackInr) || 18000);
    const recyclingValue = Math.max(0, parseFloat(p.recyclingRecoveryValuePerPackInr) || 24000);
    const platformPct = Math.max(0, parseFloat(p.platformOverheadPct) || 10) / 100;
    const logisticsCost = Math.max(0, parseFloat(p.logisticsCostPerPackInr) || 5000);

    // Fleet Quantities
    const secondLifePacks = Math.round(totalIntake * yieldFraction);
    const recycledPacks = totalIntake - secondLifePacks;
    const secondLifeCapacityMwh = (secondLifePacks * avgCapacity * 0.80) / 1000; // Assuming 80% usable residual capacity

    // Revenue Streams
    // 1. Second-Life BaaS Subscription Revenue: Packs * Usable kWh * Monthly Rate * Lease Months
    const usableKwhPerPack = avgCapacity * 0.80;
    const totalBaaSRevenue = secondLifePacks * usableKwhPerPack * monthlyRate * leaseMonths;

    // 2. Direct Recycling Black Mass & Metal Recovery Revenue
    const totalRecyclingRevenue = recycledPacks * recyclingValue;

    // 3. End-of-Second-Life Residual Recovery (after 3-year lease, packs are finally recycled)
    const residualRecyclingRevenue = secondLifePacks * (recyclingValue * 0.75); // 75% residual scrap value after 2nd life

    const grossProjectedRevenue = totalBaaSRevenue + totalRecyclingRevenue + residualRecyclingRevenue;

    // Direct Costs (CAPEX & OPEX)
    const totalAssessmentCost = totalIntake * assessmentCost;
    const totalLogisticsCost = totalIntake * logisticsCost;
    const totalRefurbishmentCost = secondLifePacks * refurbCost;
    const totalDirectCosts = totalAssessmentCost + totalLogisticsCost + totalRefurbishmentCost;

    // Operating & Platform Overhead
    const totalPlatformOverhead = grossProjectedRevenue * platformPct;
    const totalProjectCosts = totalDirectCosts + totalPlatformOverhead;

    // Net Contribution & Margins
    const netContributionMargin = grossProjectedRevenue - totalProjectCosts;
    const marginPct = grossProjectedRevenue > 0 ? (netContributionMargin / grossProjectedRevenue) * 100 : 0;
    const roiPct = totalProjectCosts > 0 ? (netContributionMargin / totalProjectCosts) * 100 : 0;

    // Unit Economics per Pack Processed
    const revenuePerPack = grossProjectedRevenue / totalIntake;
    const costPerPack = totalProjectCosts / totalIntake;
    const profitPerPack = netContributionMargin / totalIntake;

    // Sensitivity Matrix: Yield (45%, 60%, 75%, 90%) vs Monthly Rate (₹220, ₹320, ₹420)
    const sensitivityYields = [45, 60, 75, 90];
    const sensitivityRates = [220, 320, 420];
    const sensitivityMatrix = [];

    sensitivityYields.forEach(y => {
      const row = { yieldPct: y, rates: {} };
      sensitivityRates.forEach(r => {
        const subPacks = Math.round(totalIntake * (y / 100));
        const recPacks = totalIntake - subPacks;
        const rev = (subPacks * usableKwhPerPack * r * leaseMonths) + (recPacks * recyclingValue) + (subPacks * recyclingValue * 0.75);
        const cost = (totalIntake * (assessmentCost + logisticsCost)) + (subPacks * refurbCost) + (rev * platformPct);
        const margin = rev - cost;
        row.rates[r] = {
          netMarginInr: margin,
          netMarginCrores: (margin / 10000000).toFixed(2)
        };
      });
      sensitivityMatrix.push(row);
    });

    // Environmental Lifecycle Assessment (LCA) Model
    // 1. Avoided emissions: 1 kWh of 2nd-life battery displaces new manufacturing (approx 70 kg CO2e/kWh) + grid clean shift (approx 20 kg)
    const avoidedCo2Kg = Math.round(secondLifeCapacityMwh * 1000 * 75);
    const avoidedCo2MetricTons = (avoidedCo2Kg / 1000).toFixed(1);

    // 2. Critical mineral recovery (per 1,000 packs average mix):
    // LCE (Lithium Carbonate Equivalent) ~ 0.8 kg/kWh, Nickel ~ 1.1 kg/kWh (in NMC), Cobalt ~ 0.35 kg/kWh, Aluminum/Copper ~ 3.5 kg/kWh
    const totalKwhProcessed = totalIntake * avgCapacity;
    const recoveredLithiumKg = Math.round(totalKwhProcessed * 0.75 * 0.95);
    const recoveredNickelKg = Math.round(totalKwhProcessed * 0.65 * 0.95);
    const recoveredCobaltKg = Math.round(totalKwhProcessed * 0.18 * 0.95);
    const recoveredCopperAluKg = Math.round(totalKwhProcessed * 3.2 * 0.98);

    return {
      assumptions: p,
      fleet: {
        totalIntake,
        secondLifePacks,
        recycledPacks,
        secondLifeCapacityMwh: secondLifeCapacityMwh.toFixed(2),
        totalCapacityProcessedMwh: ((totalIntake * avgCapacity) / 1000).toFixed(2)
      },
      revenue: {
        totalBaaSRevenue,
        totalRecyclingRevenue,
        residualRecyclingRevenue,
        grossProjectedRevenue,
        grossInCrores: (grossProjectedRevenue / 10000000).toFixed(2)
      },
      costs: {
        totalAssessmentCost,
        totalLogisticsCost,
        totalRefurbishmentCost,
        totalDirectCosts,
        totalPlatformOverhead,
        totalProjectCosts,
        totalCostInCrores: (totalProjectCosts / 10000000).toFixed(2)
      },
      profitability: {
        netContributionMargin,
        netMarginInCrores: (netContributionMargin / 10000000).toFixed(2),
        marginPct: marginPct.toFixed(1),
        roiPct: roiPct.toFixed(1),
        revenuePerPack: Math.round(revenuePerPack),
        costPerPack: Math.round(costPerPack),
        profitPerPack: Math.round(profitPerPack)
      },
      sensitivityMatrix,
      environmental: {
        avoidedCo2MetricTons,
        recoveredLithiumKg,
        recoveredNickelKg,
        recoveredCobaltKg,
        recoveredCopperAluKg
      },
      disclaimer: "Illustrative projection based on entered input parameters. Real commercial returns depend on market offtake pricing, actual residual health distribution, supply chain logistics, and certified engineering qualification costs."
    };
  }
}

// Export singleton
window.EconomicsEngine = EconomicsEngine;
