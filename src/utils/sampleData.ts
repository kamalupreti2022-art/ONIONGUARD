import { AssessmentRecord, BoundingBox, DefectCounts, DefectPercentages } from '../types';

// Generate SVG Data URL representing an onion inspection tray with simulated onions
export function generateSampleTraySvg(mode: 'standard' | 'mixed' | 'harvest'): string {
  // Return an SVG representing an inspection tray of onions
  const width = 800;
  const height = 600;
  
  let onionElements = '';
  
  // 10x10 simulated grid of onions
  const total = 100;
  for (let i = 0; i < total; i++) {
    const row = Math.floor(i / 10);
    const col = i % 10;
    const cx = 75 + col * 70 + (Math.sin(i * 1.5) * 8);
    const cy = 70 + row * 50 + (Math.cos(i * 2.1) * 6);
    
    let radius = 24 + (Math.sin(i * 3.7) * 4);
    let fill = '#991b1b'; // Deep onion red
    let stroke = '#7f1d1d';
    let extra = '';

    // Assign categories deterministically
    // 0..71 healthy (72)
    // 72..79 damaged (8)
    // 80..84 rotten (5)
    // 85..89 sprouted (5)
    // 90..99 undersized (10)
    if (i >= 90) {
      // Undersized
      radius = 14 + (Math.sin(i) * 2);
      fill = '#b91c1c';
    } else if (i >= 85) {
      // Sprouted
      fill = '#881337';
      // Green sprout coming out of neck
      extra = `<path d="M ${cx} ${cy - radius} Q ${cx - 6} ${cy - radius - 16} ${cx - 12} ${cy - radius - 22} Q ${cx - 2} ${cy - radius - 14} ${cx} ${cy - radius}" fill="#22c55e" stroke="#15803d" stroke-width="1.5"/>`;
    } else if (i >= 80) {
      // Rotten
      fill = '#450a0a';
      stroke = '#1f2937';
      extra = `<circle cx="${cx + 3}" cy="${cy - 2}" r="5" fill="#1c1917" opacity="0.8"/>`;
    } else if (i >= 72) {
      // Damaged
      fill = '#9f1239';
      stroke = '#e11d48';
      extra = `<path d="M ${cx - 8} ${cy - 4} L ${cx + 7} ${cy + 6} M ${cx - 5} ${cy + 5} L ${cx + 6} ${cy - 5}" stroke="#fbbf24" stroke-width="2"/>`;
    }

    onionElements += `
      <g>
        <ellipse cx="${cx}" cy="${cy}" rx="${radius}" ry="${radius * 0.92}" fill="${fill}" stroke="${stroke}" stroke-width="2"/>
        <path d="M ${cx - radius * 0.6} ${cy - radius * 0.2} Q ${cx} ${cy - radius * 0.7} ${cx + radius * 0.6} ${cy - radius * 0.2}" stroke="#fca5a5" stroke-width="1.2" fill="none" opacity="0.45"/>
        <circle cx="${cx - radius * 0.3}" cy="${cy - radius * 0.3}" r="${radius * 0.25}" fill="#ffffff" opacity="0.2"/>
        ${extra}
      </g>
    `;
  }

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="100%" height="100%">
      <defs>
        <radialGradient id="trayBg" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#334155" />
          <stop offset="100%" stop-color="#1e293b" />
        </radialGradient>
        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#475569" stroke-width="0.7" opacity="0.3"/>
        </pattern>
      </defs>
      <!-- Tray surface -->
      <rect width="${width}" height="${height}" rx="16" fill="url(#trayBg)"/>
      <rect width="${width}" height="${height}" fill="url(#grid)"/>
      
      <!-- Tray border & ruler markings -->
      <rect x="12" y="12" width="${width - 24}" height="${height - 24}" rx="12" fill="none" stroke="#64748b" stroke-width="2" stroke-dasharray="8 4"/>
      
      <!-- Simulated Camera Viewfinder Guides -->
      <path d="M 30 70 L 30 30 L 70 30" fill="none" stroke="#38bdf8" stroke-width="3"/>
      <path d="M ${width - 30} 70 L ${width - 30} 30 L ${width - 70} 30" fill="none" stroke="#38bdf8" stroke-width="3"/>
      <path d="M 30 ${height - 70} L 30 ${height - 30} L 70 ${height - 30}" fill="none" stroke="#38bdf8" stroke-width="3"/>
      <path d="M ${width - 30} ${height - 70} L ${width - 30} ${height - 30} L ${width - 70} ${height - 30}" fill="none" stroke="#38bdf8" stroke-width="3"/>
      
      <!-- Watermark / Tray Label -->
      <text x="36" y="${height - 24}" fill="#94a3b8" font-family="monospace" font-size="12" font-weight="bold">ONIONGUARD-INSPECTION-TRAY-A1 • CALIBRATION 50mm SCALE</text>
      
      <!-- Onions -->
      ${onionElements}
    </svg>
  `;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

// Generate realistic simulated bounding boxes for the 100 onions
export function generateDemoBoundingBoxes(counts: DefectCounts): BoundingBox[] {
  const boxes: BoundingBox[] = [];
  const total = counts.healthy + counts.damaged + counts.rotten + counts.sprouted + counts.undersized;
  
  let hLeft = counts.healthy;
  let dLeft = counts.damaged;
  let rLeft = counts.rotten;
  let sLeft = counts.sprouted;
  let uLeft = counts.undersized;

  for (let i = 0; i < total; i++) {
    const row = Math.floor(i / 10);
    const col = i % 10;
    
    // Percentage coordinates (5% to 95%)
    const x = 8 + col * 9.2 + (Math.sin(i * 1.5) * 0.8);
    const y = 9 + row * 8.6 + (Math.cos(i * 2.1) * 0.8);
    
    let type: 'healthy' | 'damaged' | 'rotten' | 'sprouted' | 'undersized' = 'healthy';
    let size = 7.5;
    let label = 'Healthy Bulb';
    let conf = 0.92 + (Math.sin(i) * 0.06);

    if (uLeft > 0 && i >= 90) {
      type = 'undersized';
      size = 5.2;
      label = 'Undersized (<40mm)';
      conf = 0.89 + (Math.sin(i) * 0.05);
      uLeft--;
    } else if (sLeft > 0 && i >= 85) {
      type = 'sprouted';
      label = 'Sprouted Neck';
      conf = 0.94 + (Math.sin(i) * 0.04);
      sLeft--;
    } else if (rLeft > 0 && i >= 80) {
      type = 'rotten';
      label = 'Rotten / Fungal Decay';
      conf = 0.96 + (Math.sin(i) * 0.03);
      rLeft--;
    } else if (dLeft > 0 && i >= 72) {
      type = 'damaged';
      label = 'Surface Bruise / Cut';
      conf = 0.91 + (Math.sin(i) * 0.05);
      dLeft--;
    } else {
      hLeft--;
    }

    boxes.push({
      id: i + 1,
      x: Math.max(2, Math.min(94, x)),
      y: Math.max(2, Math.min(94, y)),
      size,
      defectType: type,
      confidence: parseFloat(conf.toFixed(2)),
      label
    });
  }

  return boxes;
}

// Generate single onion SVGs for testing individual image classification
export function generateSingleOnionSvg(type: 'healthy' | 'sprouted' | 'rotten' | 'damaged' | 'unclear' | 'undersized_with_scale'): string {
  const width = 320;
  const height = 320;

  if (type === 'unclear') {
    // Non-onion object / low lighting blurry image
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="100%" height="100%">
        <rect width="${width}" height="${height}" fill="#1e293b"/>
        <circle cx="160" cy="160" r="80" fill="#334155" filter="blur(20px)"/>
        <rect x="40" y="40" width="240" height="240" fill="none" stroke="#475569" stroke-dasharray="4 4"/>
        <text x="160" y="165" fill="#64748b" font-family="sans-serif" font-size="12" text-anchor="middle">BLURRY / NON-ONION PROFILE</text>
      </svg>
    `;
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  }

  const cx = 160;
  const cy = 165;
  const r = type === 'undersized_with_scale' ? 48 : 88;
  const fill = '#991b1b'; // Onion red
  const stroke = '#7f1d1d';
  let defectSvg = '';

  if (type === 'sprouted') {
    // Prominent green vegetative neck shoot
    defectSvg = `
      <g>
        <path d="M ${cx - 6} ${cy - r + 4} Q ${cx - 28} ${cy - r - 45} ${cx - 20} ${cy - r - 85} Q ${cx} ${cy - r - 50} ${cx} ${cy - r + 2}" fill="#22c55e" stroke="#15803d" stroke-width="2.5"/>
        <path d="M ${cx + 2} ${cy - r + 4} Q ${cx + 18} ${cy - r - 40} ${cx + 24} ${cy - r - 75} Q ${cx + 4} ${cy - r - 45} ${cx} ${cy - r + 2}" fill="#16a34a" stroke="#15803d" stroke-width="2"/>
        <path d="M ${cx - 2} ${cy - r} L ${cx - 18} ${cy - r - 70}" stroke="#86efac" stroke-width="1.5" fill="none"/>
      </g>
    `;
  } else if (type === 'rotten') {
    // Dark sunken necrotic fungal patch
    defectSvg = `
      <g>
        <ellipse cx="${cx + 24}" cy="${cy - 8}" rx="28" ry="24" fill="#180404" stroke="#450a0a" stroke-width="2"/>
        <circle cx="${cx + 18}" cy="${cy - 4}" r="12" fill="#090101" opacity="0.9"/>
        <circle cx="${cx + 32}" cy="${cy - 12}" r="8" fill="#2d0c0c" opacity="0.8"/>
        <path d="M ${cx + 10} ${cy - 18} Q ${cx + 24} ${cy - 2} ${cx + 36} ${cy - 20}" stroke="#571717" stroke-width="1.5" fill="none"/>
      </g>
    `;
  } else if (type === 'damaged') {
    // Torn skin / cut mark revealing inner yellow-white flesh
    defectSvg = `
      <g>
        <path d="M ${cx - 35} ${cy - 15} L ${cx + 25} ${cy + 25} L ${cx + 15} ${cy + 35} L ${cx - 42} ${cy - 5} Z" fill="#fbbf24" stroke="#d97706" stroke-width="2"/>
        <path d="M ${cx - 30} ${cy - 10} L ${cx + 20} ${cy + 20}" stroke="#78350f" stroke-width="2"/>
        <path d="M ${cx - 10} ${cy - 25} L ${cx + 5} ${cy - 5}" stroke="#fbbf24" stroke-width="3"/>
      </g>
    `;
  }

  let scaleMarkerSvg = '';
  if (type === 'undersized_with_scale') {
    scaleMarkerSvg = `
      <!-- Blue calibration ruler / scale -->
      <g>
        <rect x="20" y="270" width="280" height="24" fill="#0284c7" rx="4"/>
        <text x="160" y="286" fill="#ffffff" font-family="monospace" font-size="11" font-weight="bold" text-anchor="middle">50mm REFERENCE SCALE CALIBRATION</text>
        <line x1="40" y1="270" x2="40" y2="280" stroke="#ffffff" stroke-width="2"/>
        <line x1="90" y1="270" x2="90" y2="280" stroke="#ffffff" stroke-width="2"/>
        <line x1="140" y1="270" x2="140" y2="280" stroke="#ffffff" stroke-width="2"/>
        <line x1="190" y1="270" x2="190" y2="280" stroke="#ffffff" stroke-width="2"/>
        <line x1="240" y1="270" x2="240" y2="280" stroke="#ffffff" stroke-width="2"/>
        <line x1="280" y1="270" x2="280" y2="280" stroke="#ffffff" stroke-width="2"/>
      </g>
    `;
  }

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="100%" height="100%">
      <rect width="${width}" height="${height}" fill="#f1f5f9"/>
      <!-- Shadow -->
      <ellipse cx="${cx}" cy="${cy + r * 0.82}" rx="${r * 0.85}" ry="16" fill="#cbd5e1"/>
      <!-- Onion Body -->
      <ellipse cx="${cx}" cy="${cy}" rx="${r}" ry="${r * 0.94}" fill="${fill}" stroke="${stroke}" stroke-width="3"/>
      <!-- Onion Skin Tunic Textures -->
      <path d="M ${cx - r * 0.7} ${cy - r * 0.3} Q ${cx} ${cy - r * 0.8} ${cx + r * 0.7} ${cy - r * 0.3}" stroke="#fca5a5" stroke-width="1.8" fill="none" opacity="0.35"/>
      <path d="M ${cx - r * 0.8} ${cy} Q ${cx} ${cy - r * 0.4} ${cx + r * 0.8} ${cy}" stroke="#fca5a5" stroke-width="1.5" fill="none" opacity="0.3"/>
      <path d="M ${cx - r * 0.6} ${cy + r * 0.3} Q ${cx} ${cy} ${cx + r * 0.6} ${cy + r * 0.3}" stroke="#fca5a5" stroke-width="1.5" fill="none" opacity="0.25"/>
      <!-- Sheen -->
      <circle cx="${cx - r * 0.35}" cy="${cy - r * 0.35}" r="${r * 0.24}" fill="#ffffff" opacity="0.18"/>
      <!-- Basal Plate / Root Ring -->
      <ellipse cx="${cx}" cy="${cy + r * 0.86}" rx="14" ry="5" fill="#78350f" opacity="0.7"/>
      <!-- Apical Neck -->
      <polygon points="${cx - 8},${cy - r + 3} ${cx + 8},${cy - r + 3} ${cx + 4},${cy - r - 8} ${cx - 4},${cy - r - 8}" fill="#7f1d1d"/>
      ${defectSvg}
      ${scaleMarkerSvg}
    </svg>
  `;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

// Calculate percentages dynamically from counts
export function calculatePercentages(counts: DefectCounts): DefectPercentages {
  const total = counts.healthy + counts.damaged + counts.rotten + counts.sprouted + counts.undersized;
  if (total === 0) {
    return { healthy: 0, damaged: 0, rotten: 0, sprouted: 0, undersized: 0, unableToDetermine: counts.unableToDetermine || 0 };
  }
  return {
    healthy: Math.round((counts.healthy / total) * 100),
    damaged: Math.round((counts.damaged / total) * 100),
    rotten: Math.round((counts.rotten / total) * 100),
    sprouted: Math.round((counts.sprouted / total) * 100),
    undersized: Math.round((counts.undersized / total) * 100),
    unableToDetermine: counts.unableToDetermine ? Math.round((counts.unableToDetermine / (total + counts.unableToDetermine)) * 100) : 0,
  };
}

// Grade calculation according to standard demo guidelines:
// Grade A is strictly high-quality (Healthy plus minor allowable damage within demo tolerance, e.g. 70%)
// URS (Under-size, Rotten, Sprouted) represents rejected / lower commercial grade (e.g. 30%)
export function calculateGrades(counts: DefectCounts): { gradeA: number; gradeURS: number } {
  const total = counts.healthy + counts.damaged + counts.rotten + counts.sprouted + counts.undersized;
  if (total === 0) return { gradeA: 0, gradeURS: 0 };

  const ursCount = counts.undersized + counts.rotten + counts.sprouted + Math.round(counts.damaged * 1.25);
  const cappedURS = Math.min(total, Math.max(0, ursCount));
  const gradeURS = Math.round((cappedURS / total) * 100);
  const gradeA = Math.max(0, 100 - gradeURS);

  return { gradeA, gradeURS };
}

// Seed initial demo assessment
export const INITIAL_DEMO_ASSESSMENTS: AssessmentRecord[] = [
  {
    reportId: "REP-2026-0925-01",
    batch: {
      batchId: "ONION-DEMO-001",
      procurementCentre: "Demo Procurement Centre 01 (Nashik APMC)",
      inspectorName: "R. K. Sharma (Demo Inspector)",
      date: "2026-09-25",
      onionVariety: "Demo Onion Batch (Nashik Red)",
      approxQuantity: "50 Quintals (500 Bags)",
      notes: "Standard incoming truck consignment from Niphad taluka."
    },
    timestamp: "2026-09-25T08:30:00.000Z",
    images: [generateSampleTraySvg('standard')],
    totalAnalyzed: 100,
    counts: {
      healthy: 72,
      damaged: 8,
      rotten: 5,
      sprouted: 5,
      undersized: 10,
      unableToDetermine: 0
    },
    percentages: {
      healthy: 72,
      damaged: 8,
      rotten: 5,
      sprouted: 5,
      undersized: 10,
      unableToDetermine: 0
    },
    gradeA: 70,
    gradeURS: 30,
    qualitySummary: "Most analyzed onions show no detected visible defect in this demonstration.",
    status: "Completed",
    isDemoData: true
  },
  {
    reportId: "REP-2026-0924-02",
    batch: {
      batchId: "ONION-DEMO-002",
      procurementCentre: "Demo Procurement Centre 02 (Lasalgaon Mandi)",
      inspectorName: "P. Deshmukh (Demo Inspector)",
      date: "2026-09-24",
      onionVariety: "Lasalgaon Garwa Late Kharif",
      approxQuantity: "75 Quintals (750 Bags)",
      notes: "Post-monsoon storage lot with minor sprouting."
    },
    timestamp: "2026-09-24T14:15:00.000Z",
    images: [generateSampleTraySvg('mixed')],
    totalAnalyzed: 100,
    counts: {
      healthy: 78,
      damaged: 6,
      rotten: 3,
      sprouted: 4,
      undersized: 9,
      unableToDetermine: 0
    },
    percentages: {
      healthy: 78,
      damaged: 6,
      rotten: 3,
      sprouted: 4,
      undersized: 9,
      unableToDetermine: 0
    },
    gradeA: 78,
    gradeURS: 22,
    qualitySummary: "Consignment exhibits good overall uniformity with very low fungal incidence.",
    status: "Completed",
    isDemoData: true
  }
];

