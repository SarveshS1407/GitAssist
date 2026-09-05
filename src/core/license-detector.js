import path from 'node:path';

/**
 * LicenseDetector
 * Audits repository root licenses and inline source SPDX license expressions
 */
export class LicenseDetector {
  constructor() {
    this.knownLicenses = [
      {
        id: 'MIT',
        name: 'MIT License',
        type: 'Permissive',
        commercialOk: true,
        risk: 'LOW',
        patterns: [/MIT License/i, /Permission is hereby granted, free of charge/i]
      },
      {
        id: 'Apache-2.0',
        name: 'Apache License 2.0',
        type: 'Permissive',
        commercialOk: true,
        risk: 'LOW',
        patterns: [/Apache License/i, /Version 2\.0, January 2004/i, /http:\/\/www\.apache\.org\/licenses\//i]
      },
      {
        id: 'BSD-3-Clause',
        name: 'BSD 3-Clause "New" or "Revised" License',
        type: 'Permissive',
        commercialOk: true,
        risk: 'LOW',
        patterns: [/Redistribution and use in source and binary forms/i, /Neither the name of the copyright holder/i]
      },
      {
        id: 'ISC',
        name: 'ISC License',
        type: 'Permissive',
        commercialOk: true,
        risk: 'LOW',
        patterns: [/Permission to use, copy, modify, and\/or distribute this software for any purpose/i]
      },
      {
        id: 'GPL-3.0',
        name: 'GNU General Public License v3.0',
        type: 'Copyleft',
        commercialOk: false,
        risk: 'HIGH',
        patterns: [/GNU GENERAL PUBLIC LICENSE/i, /Version 3, 29 June 2007/i]
      },
      {
        id: 'AGPL-3.0',
        name: 'GNU Affero General Public License v3.0',
        type: 'Strong Copyleft',
        commercialOk: false,
        risk: 'CRITICAL',
        patterns: [/GNU AFFERO GENERAL PUBLIC LICENSE/i]
      }
    ];
  }

  /**
   * Detect license metadata across files
   * @param {Array<{ relativePath: string, content: string }>} files
   * @returns {{ primaryLicense: Object, detectedLicenses: Array, copyleftRisk: string, spdxDeclarations: Array }}
   */
  detect(files = []) {
    let primaryLicense = null;
    const detectedLicenses = new Set();
    const spdxDeclarations = [];

    for (const file of files) {
      if (!file || !file.content || typeof file.content !== 'string') continue;
      const baseName = path.basename(file.relativePath).toUpperCase();

      // Check LICENSE file
      if (baseName.startsWith('LICENSE') || baseName.startsWith('COPYING')) {
        for (const lic of this.knownLicenses) {
          if (lic.patterns.some(p => p.test(file.content))) {
            if (!primaryLicense) {
              primaryLicense = {
                id: lic.id,
                name: lic.name,
                type: lic.type,
                commercialOk: lic.commercialOk,
                risk: lic.risk,
                sourceFile: file.relativePath
              };
            }
            detectedLicenses.add(lic.id);
          }
        }
      }

      // Check package.json license field
      if (baseName === 'PACKAGE.JSON') {
        try {
          const pkg = JSON.parse(file.content);
          if (pkg.license) {
            const licId = typeof pkg.license === 'string' ? pkg.license : pkg.license.type;
            if (licId) {
              detectedLicenses.add(licId);
              if (!primaryLicense) {
                const matched = this.knownLicenses.find(l => l.id.toLowerCase() === licId.toLowerCase());
                primaryLicense = {
                  id: licId,
                  name: matched ? matched.name : licId,
                  type: matched ? matched.type : 'Unknown',
                  commercialOk: matched ? matched.commercialOk : true,
                  risk: matched ? matched.risk : 'LOW',
                  sourceFile: file.relativePath
                };
              }
            }
          }
        } catch (e) {}
      }

      // Check SPDX-License-Identifier in code
      const spdxMatch = file.content.match(/SPDX-License-Identifier:\s*([A-Za-z0-9.\-]+)/i);
      if (spdxMatch) {
        const id = spdxMatch[1];
        spdxDeclarations.push({
          file: file.relativePath,
          license: id
        });
        detectedLicenses.add(id);
      }
    }

    if (!primaryLicense) {
      primaryLicense = {
        id: 'UNLICENSED',
        name: 'Proprietary / No License Declared',
        type: 'Proprietary',
        commercialOk: false,
        risk: 'MEDIUM',
        sourceFile: null
      };
    }

    const hasCopyleft = Array.from(detectedLicenses).some(id => id.includes('GPL'));
    const copyleftRisk = hasCopyleft ? 'HIGH' : 'LOW';

    return {
      primaryLicense,
      detectedLicenses: Array.from(detectedLicenses),
      copyleftRisk,
      spdxDeclarationsCount: spdxDeclarations.length,
      spdxDeclarations: spdxDeclarations.slice(0, 20)
    };
  }
}
