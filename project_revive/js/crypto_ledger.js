/**
 * PROJECT REVIVE — Cryptographic Hash-Chain Ledger & Circularity Credits
 * Real SHA-256 Verification & Anti-Tamper Audit Engine
 */

// Pure JS SHA-256 implementation fallback ensuring 100% offline & file:// compatibility
function sha256_pure(ascii) {
  function rightRotate(value, amount) {
    return (value >>> amount) | (value << (32 - amount));
  }
  var mathPow = Math.pow;
  var maxWord = mathPow(2, 32);
  var lengthProperty = 'length';
  var i, j;
  var result = '';
  var words = [];
  var asciiBitLength = ascii[lengthProperty] * 8;
  var hash = [
    0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a,
    0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19
  ];
  var k = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
  ];

  var composite = ascii + '\x80';
  while (composite[lengthProperty] % 64 - 56) composite += '\x00';
  for (i = 0; i < composite[lengthProperty]; i++) {
    j = composite.charCodeAt(i);
    words[i >> 2] |= j << ((3 - i % 4) * 8);
  }
  words[words[lengthProperty]] = ((asciiBitLength / maxWord) | 0);
  words[words[lengthProperty]] = (asciiBitLength);

  for (j = 0; j < words[lengthProperty];) {
    var w = words.slice(j, j += 16);
    var oldHash = hash;
    hash = hash.slice(0, 8);
    for (i = 0; i < 64; i++) {
      var i2 = i + j;
      var w15 = w[i - 15], w2 = w[i - 2];
      var a = hash[0], e = hash[4];
      var temp1 = hash[7]
        + (rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25))
        + ((e & hash[5]) ^ ((~e) & hash[6]))
        + k[i]
        + (w[i] = (i < 16) ? w[i] : (
            w[i - 16]
            + (rightRotate(w15, 7) ^ rightRotate(w15, 18) ^ (w15 >>> 3))
            + w[i - 7]
            + (rightRotate(w2, 17) ^ rightRotate(w2, 19) ^ (w2 >>> 10))
          ) | 0
        );
      var temp2 = (rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22))
        + ((a & hash[1]) ^ (a & hash[2]) ^ (hash[1] & hash[2]));

      hash = [(temp1 + temp2) | 0].concat(hash);
      hash[4] = (hash[4] + temp1) | 0;
    }
    for (i = 0; i < 8; i++) {
      hash[i] = (hash[i] + oldHash[i]) | 0;
    }
  }
  for (i = 0; i < 8; i++) {
    for (var b = 3; b >= 0; b--) {
      var byteVal = (hash[i] >> (b * 8)) & 255;
      result += ((byteVal < 16) ? '0' : '') + byteVal.toString(16);
    }
  }
  return result;
}

// Canonical JSON stringifier (sorts keys deterministically)
function canonicalStringify(obj) {
  if (obj === null || typeof obj !== 'object') {
    return JSON.stringify(obj);
  }
  if (Array.isArray(obj)) {
    return '[' + obj.map(canonicalStringify).join(',') + ']';
  }
  const keys = Object.keys(obj).sort();
  return '{' + keys.map(k => JSON.stringify(k) + ':' + canonicalStringify(obj[k])).join(',') + '}';
}

class LifecycleBlock {
  constructor(index, timestamp, eventType, batteryId, actor, details, prevHash = '') {
    this.index = index;
    this.timestamp = timestamp;
    this.eventType = eventType;
    this.batteryId = batteryId;
    this.actor = actor;
    this.details = details;
    this.prevHash = prevHash;
    this.hash = this.calculateHash();
  }

  calculateHash() {
    const canonicalPayload = canonicalStringify({
      index: this.index,
      timestamp: this.timestamp,
      eventType: this.eventType,
      batteryId: this.batteryId,
      actor: this.actor,
      details: this.details,
      prevHash: this.prevHash
    });
    return sha256_pure(canonicalPayload);
  }
}

class CircularityLedger {
  constructor() {
    this.chain = [];
    this.credits = [];
    this.tamperedIndex = null;
    this.backupChain = null;
  }

  // Initialize Genesis Block
  initializeGenesis() {
    this.chain = [];
    const genesisBlock = new LifecycleBlock(
      0,
      "2026-10-01T00:00:00.000Z",
      "GENESIS_BLOCK",
      "SYSTEM_ROOT",
      "REVIVE_CORE_PROTOCOL",
      {
        protocol: "REVIVE_CIRCULARITY_LEDGER_V1",
        description: "Local prototype SHA-256 hash-chain ledger for battery traceability.",
        notice: "Prototype ledger. Not a public decentralized blockchain."
      },
      "0000000000000000000000000000000000000000000000000000000000000000"
    );
    this.chain.push(genesisBlock);
  }

  // Append new lifecycle event block
  addEvent(eventType, batteryId, actor, details) {
    const prevBlock = this.chain[this.chain.length - 1];
    const prevHash = prevBlock ? prevBlock.hash : "0000000000000000000000000000000000000000000000000000000000000000";
    const timestamp = new Date().toISOString();
    const newBlock = new LifecycleBlock(
      this.chain.length,
      timestamp,
      eventType,
      batteryId,
      actor,
      details,
      prevHash
    );
    this.chain.push(newBlock);
    return newBlock;
  }

  // Full cryptographic audit and verification of the hash chain
  verifyChain() {
    const auditReport = {
      isValid: true,
      totalBlocks: this.chain.length,
      verifiedAt: new Date().toISOString(),
      issues: [],
      blockStatuses: []
    };

    if (this.chain.length === 0) {
      auditReport.isValid = false;
      auditReport.issues.push("Ledger is empty.");
      return auditReport;
    }

    // Verify Genesis Block
    const genesis = this.chain[0];
    const expectedGenesisHash = genesis.calculateHash();
    if (genesis.hash !== expectedGenesisHash) {
      auditReport.isValid = false;
      auditReport.issues.push(`Genesis Block hash altered (expected ${expectedGenesisHash.substring(0, 10)}..., got ${genesis.hash.substring(0, 10)}...)`);
      auditReport.blockStatuses.push({ index: 0, status: 'TAMPERED', reason: 'Invalid hash' });
    } else {
      auditReport.blockStatuses.push({ index: 0, status: 'VALID' });
    }

    // Verify chained blocks
    for (let i = 1; i < this.chain.length; i++) {
      const currentBlock = this.chain[i];
      const prevBlock = this.chain[i - 1];
      const computedHash = currentBlock.calculateHash();
      let blockValid = true;
      let errorReason = '';

      // Check Index Sequence
      if (currentBlock.index !== i) {
        blockValid = false;
        errorReason = `Index sequence broken at #${i} (found #${currentBlock.index})`;
      }

      // Check Cryptographic Hash computation
      if (currentBlock.hash !== computedHash) {
        blockValid = false;
        errorReason = `Payload corrupted: Hash mismatch at Block #${i}`;
      }

      // Check Linkage with previous block hash
      if (currentBlock.prevHash !== prevBlock.hash) {
        blockValid = false;
        errorReason = `Broken Chain Link: Block #${i} prevHash does not match Block #${i-1} hash`;
      }

      if (!blockValid) {
        auditReport.isValid = false;
        auditReport.issues.push(errorReason);
        auditReport.blockStatuses.push({ index: i, status: 'TAMPERED', reason: errorReason });
      } else {
        auditReport.blockStatuses.push({ index: i, status: 'VALID' });
      }
    }

    return auditReport;
  }

  // Tamper simulation for live jury demo
  simulateTamper(blockIndex, fakeData) {
    if (blockIndex < 0 || blockIndex >= this.chain.length) return false;
    
    // Backup chain if not already backed up
    if (!this.backupChain) {
      this.backupChain = JSON.parse(JSON.stringify(this.chain));
    }
    
    this.chain[blockIndex].details = {
      ...this.chain[blockIndex].details,
      tamperedNotice: "SIMULATED TAMPERING BY USER",
      ...fakeData
    };
    this.tamperedIndex = blockIndex;
    return true;
  }

  // Restore chain after tamper demo
  restoreLedger() {
    if (this.backupChain) {
      this.chain = this.backupChain.map(b => new LifecycleBlock(
        b.index, b.timestamp, b.eventType, b.batteryId, b.actor, b.details, b.prevHash
      ));
      this.backupChain = null;
      this.tamperedIndex = null;
      return true;
    }
    return false;
  }

  // Circularity Credits Accounting Engine
  // Rule: Only certified, verifiable physical events can issue credits.
  // Registration and draft proposals CANNOT issue credits.
  issueCircularityCredit(eventType, qualifyingEventId, batteryId, creditAmountKwh, verifierOrg, evidenceUrl) {
    // Check if event type is eligible
    const eligibleEventTypes = ["QUALIFIED_RECYCLING_COMPLETED", "SECOND_LIFE_COMMISSIONED"];
    if (!eligibleEventTypes.includes(eventType)) {
      return {
        success: false,
        error: `Event type '${eventType}' is not an authorized credit generation event. Only verified recycling or qualified second-life commissioning are eligible.`
      };
    }

    // Anti-duplicate issuance check
    const existing = this.credits.find(c => c.qualifyingEventId === qualifyingEventId);
    if (existing) {
      return {
        success: false,
        error: `Duplicate credit prevention: Credit already issued for Event #${qualifyingEventId} on ${existing.issuedAt}.`
      };
    }

    const creditRecord = {
      creditId: `REV-CR-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random()*1000)}`,
      qualifyingEventId: qualifyingEventId,
      batteryId: batteryId,
      eventType: eventType,
      creditAmountKwh: creditAmountKwh,
      carbonOffsetEquivalentKg: (creditAmountKwh * 0.72).toFixed(1), // Estimated 0.72 kg CO2e / kWh grid factor
      status: "VERIFIED",
      verifier: verifierOrg,
      evidenceUrl: evidenceUrl || "doc://revive/manifest/audit-evidence-01.pdf",
      issuedAt: new Date().toISOString()
    };

    this.credits.push(creditRecord);

    // Record credit mint event on the hash ledger
    this.addEvent("CIRCULARITY_CREDIT_MINTED", batteryId, "REVIVE_CREDIT_AUTHORITY", {
      creditId: creditRecord.creditId,
      amountKwh: creditAmountKwh,
      co2eOffsetKg: creditRecord.carbonOffsetEquivalentKg,
      qualifyingEventId: qualifyingEventId
    });

    return {
      success: true,
      credit: creditRecord
    };
  }

  getCredits() {
    return this.credits;
  }
}

// Export singleton instance
window.CircularityLedger = CircularityLedger;
window.LifecycleBlock = LifecycleBlock;
window.sha256_pure = sha256_pure;
