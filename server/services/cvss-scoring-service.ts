/**
 * CVSS (Common Vulnerability Scoring System) Service
 * 
 * Production-grade vulnerability scoring using CVSS v3.1 standard
 * Calculates scores from 0-100 for vulnerability prioritization
 */

import type { VulnerabilityType, SecuritySeverity } from './security-audit-service';

/**
 * CVSS v3.1 Base Metric Scores
 */
interface CVSSMetrics {
  attackVector: 'NETWORK' | 'ADJACENT' | 'LOCAL' | 'PHYSICAL'; // AV
  attackComplexity: 'LOW' | 'HIGH'; // AC
  privilegesRequired: 'NONE' | 'LOW' | 'HIGH'; // PR
  userInteraction: 'NONE' | 'REQUIRED'; // UI
  scope: 'UNCHANGED' | 'CHANGED'; // S
  confidentialityImpact: 'NONE' | 'LOW' | 'HIGH'; // C
  integrityImpact: 'NONE' | 'LOW' | 'HIGH'; // I
  availabilityImpact: 'NONE' | 'LOW' | 'HIGH'; // A
}

export class CVSSScoringService {
  /**
   * Calculate CVSS v3.1 Base Score (0-100)
   */
  calculateBaseScore(metrics: CVSSMetrics): number {
    // Convert CVSS metrics to numerical values
    const impact = this.calculateImpactScore(metrics);
    const exploitability = this.calculateExploitabilityScore(metrics);
    
    // Calculate base score using CVSS v3.1 formula
    let baseScore: number;
    
    if (impact <= 0) {
      baseScore = 0;
    } else {
      if (metrics.scope === 'UNCHANGED') {
        baseScore = Math.min(impact + exploitability, 10);
      } else {
        baseScore = Math.min(1.08 * (impact + exploitability), 10);
      }
    }
    
    // Round to 1 decimal place and convert to 0-100 scale
    return Math.round(baseScore * 10);
  }

  /**
   * Calculate Impact Score
   */
  private calculateImpactScore(metrics: CVSSMetrics): number {
    const confidentiality = this.getImpactValue(metrics.confidentialityImpact);
    const integrity = this.getImpactValue(metrics.integrityImpact);
    const availability = this.getImpactValue(metrics.availabilityImpact);
    
    const impactSubScore = 1 - ((1 - confidentiality) * (1 - integrity) * (1 - availability));
    
    if (metrics.scope === 'UNCHANGED') {
      return 6.42 * impactSubScore;
    } else {
      return 7.52 * (impactSubScore - 0.029) - 3.25 * Math.pow(impactSubScore - 0.02, 15);
    }
  }

  /**
   * Calculate Exploitability Score
   */
  private calculateExploitabilityScore(metrics: CVSSMetrics): number {
    const attackVector = this.getAttackVectorValue(metrics.attackVector);
    const attackComplexity = this.getAttackComplexityValue(metrics.attackComplexity);
    const privilegesRequired = this.getPrivilegesRequiredValue(metrics.privilegesRequired, metrics.scope);
    const userInteraction = this.getUserInteractionValue(metrics.userInteraction);
    
    return 8.22 * attackVector * attackComplexity * privilegesRequired * userInteraction;
  }

  /**
   * Get Attack Vector numerical value
   */
  private getAttackVectorValue(av: CVSSMetrics['attackVector']): number {
    const values = {
      NETWORK: 0.85,
      ADJACENT: 0.62,
      LOCAL: 0.55,
      PHYSICAL: 0.2
    };
    return values[av];
  }

  /**
   * Get Attack Complexity numerical value
   */
  private getAttackComplexityValue(ac: CVSSMetrics['attackComplexity']): number {
    return ac === 'LOW' ? 0.77 : 0.44;
  }

  /**
   * Get Privileges Required numerical value
   */
  private getPrivilegesRequiredValue(pr: CVSSMetrics['privilegesRequired'], scope: CVSSMetrics['scope']): number {
    if (scope === 'UNCHANGED') {
      const values = { NONE: 0.85, LOW: 0.62, HIGH: 0.27 };
      return values[pr];
    } else {
      const values = { NONE: 0.85, LOW: 0.68, HIGH: 0.50 };
      return values[pr];
    }
  }

  /**
   * Get User Interaction numerical value
   */
  private getUserInteractionValue(ui: CVSSMetrics['userInteraction']): number {
    return ui === 'NONE' ? 0.85 : 0.62;
  }

  /**
   * Get Impact numerical value
   */
  private getImpactValue(impact: 'NONE' | 'LOW' | 'HIGH'): number {
    const values = { NONE: 0, LOW: 0.22, HIGH: 0.56 };
    return values[impact];
  }

  /**
   * Generate CVSS v3.1 vector string
   */
  generateCVSSVector(metrics: CVSSMetrics): string {
    return `CVSS:3.1/AV:${this.getVectorCode(metrics.attackVector)}/` +
           `AC:${this.getVectorCode(metrics.attackComplexity)}/` +
           `PR:${this.getVectorCode(metrics.privilegesRequired)}/` +
           `UI:${this.getVectorCode(metrics.userInteraction)}/` +
           `S:${metrics.scope[0]}/` +
           `C:${this.getVectorCode(metrics.confidentialityImpact)}/` +
           `I:${this.getVectorCode(metrics.integrityImpact)}/` +
           `A:${this.getVectorCode(metrics.availabilityImpact)}`;
  }

  /**
   * Get vector code for metric
   */
  private getVectorCode(value: string): string {
    const codes: { [key: string]: string } = {
      'NETWORK': 'N',
      'ADJACENT': 'A',
      'LOCAL': 'L',
      'PHYSICAL': 'P',
      'LOW': 'L',
      'HIGH': 'H',
      'NONE': 'N',
      'REQUIRED': 'R',
      'UNCHANGED': 'U',
      'CHANGED': 'C'
    };
    return codes[value] || value[0];
  }

  /**
   * PRODUCTION: Calculate CVSS score for OWASP LLM vulnerabilities
   */
  calculateVulnerabilityScore(vulnerabilityType: VulnerabilityType, severity: SecuritySeverity): { score: number; vector: string } {
    const metrics = this.getMetricsForVulnerability(vulnerabilityType, severity);
    const score = this.calculateBaseScore(metrics);
    const vector = this.generateCVSSVector(metrics);
    
    return { score, vector };
  }

  /**
   * Get CVSS metrics based on vulnerability type
   */
  private getMetricsForVulnerability(type: VulnerabilityType, severity: SecuritySeverity): CVSSMetrics {
    // OWASP LLM01-LLM10 CVSS metrics mapping
    const metricsMap: { [key: string]: CVSSMetrics } = {
      'LLM01_PROMPT_INJECTION': {
        attackVector: 'NETWORK',
        attackComplexity: 'LOW',
        privilegesRequired: 'NONE',
        userInteraction: 'REQUIRED',
        scope: 'CHANGED',
        confidentialityImpact: 'HIGH',
        integrityImpact: 'HIGH',
        availabilityImpact: 'NONE'
      },
      'LLM02_INSECURE_OUTPUT': {
        attackVector: 'NETWORK',
        attackComplexity: 'LOW',
        privilegesRequired: 'NONE',
        userInteraction: 'NONE',
        scope: 'CHANGED',
        confidentialityImpact: 'HIGH',
        integrityImpact: 'HIGH',
        availabilityImpact: 'LOW'
      },
      'LLM03_DATA_POISONING': {
        attackVector: 'NETWORK',
        attackComplexity: 'HIGH',
        privilegesRequired: 'LOW',
        userInteraction: 'NONE',
        scope: 'CHANGED',
        confidentialityImpact: 'HIGH',
        integrityImpact: 'HIGH',
        availabilityImpact: 'LOW'
      },
      'LLM04_DOS': {
        attackVector: 'NETWORK',
        attackComplexity: 'LOW',
        privilegesRequired: 'NONE',
        userInteraction: 'NONE',
        scope: 'UNCHANGED',
        confidentialityImpact: 'NONE',
        integrityImpact: 'NONE',
        availabilityImpact: 'HIGH'
      },
      'LLM05_SUPPLY_CHAIN': {
        attackVector: 'NETWORK',
        attackComplexity: 'HIGH',
        privilegesRequired: 'NONE',
        userInteraction: 'NONE',
        scope: 'CHANGED',
        confidentialityImpact: 'HIGH',
        integrityImpact: 'HIGH',
        availabilityImpact: 'HIGH'
      },
      'LLM06_PII_DISCLOSURE': {
        attackVector: 'NETWORK',
        attackComplexity: 'LOW',
        privilegesRequired: 'NONE',
        userInteraction: 'NONE',
        scope: 'UNCHANGED',
        confidentialityImpact: 'HIGH',
        integrityImpact: 'NONE',
        availabilityImpact: 'NONE'
      },
      'LLM07_INSECURE_PLUGIN': {
        attackVector: 'NETWORK',
        attackComplexity: 'LOW',
        privilegesRequired: 'NONE',
        userInteraction: 'REQUIRED',
        scope: 'CHANGED',
        confidentialityImpact: 'HIGH',
        integrityImpact: 'HIGH',
        availabilityImpact: 'LOW'
      },
      'LLM08_EXCESSIVE_AGENCY': {
        attackVector: 'NETWORK',
        attackComplexity: 'LOW',
        privilegesRequired: 'LOW',
        userInteraction: 'NONE',
        scope: 'CHANGED',
        confidentialityImpact: 'HIGH',
        integrityImpact: 'HIGH',
        availabilityImpact: 'HIGH'
      },
      'LLM09_OVERRELIANCE': {
        attackVector: 'ADJACENT',
        attackComplexity: 'LOW',
        privilegesRequired: 'NONE',
        userInteraction: 'REQUIRED',
        scope: 'UNCHANGED',
        confidentialityImpact: 'LOW',
        integrityImpact: 'HIGH',
        availabilityImpact: 'NONE'
      },
      'LLM10_MODEL_THEFT': {
        attackVector: 'NETWORK',
        attackComplexity: 'LOW',
        privilegesRequired: 'NONE',
        userInteraction: 'NONE',
        scope: 'UNCHANGED',
        confidentialityImpact: 'HIGH',
        integrityImpact: 'NONE',
        availabilityImpact: 'NONE'
      }
    };

    return metricsMap[type] || {
      attackVector: 'NETWORK',
      attackComplexity: 'LOW',
      privilegesRequired: 'NONE',
      userInteraction: 'NONE',
      scope: 'UNCHANGED',
      confidentialityImpact: 'LOW',
      integrityImpact: 'LOW',
      availabilityImpact: 'LOW'
    };
  }

  /**
   * Get severity rating from CVSS score
   */
  getSeverityFromScore(score: number): SecuritySeverity {
    if (score >= 90) return 'CRITICAL';
    if (score >= 70) return 'HIGH';
    if (score >= 40) return 'MEDIUM';
    if (score >= 10) return 'LOW';
    return 'INFO';
  }
}

/**
 * Singleton instance
 */
export const cvssScoring = new CVSSScoringService();
