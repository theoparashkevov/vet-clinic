// ── Lab Panels & Tests ─────────────────────────────────────────────────────
  
  // Complete Blood Count (CBC)
  const cbcPanel = await prisma.labPanel.create({
    data: {
      name: 'Complete Blood Count (CBC)',
      category: 'Hematology',
      description: 'Measures red blood cells, white blood cells, and platelets',
      isCommon: true,
    },
  });

  await prisma.labTest.createMany({
    data: [
      { panelId: cbcPanel.id, name: 'White Blood Cell Count', abbreviation: 'WBC', unit: 'K/µL', refRangeDogMin: 6.0, refRangeDogMax: 17.0, refRangeCatMin: 5.5, refRangeCatMax: 19.5, criticalLow: 2.0, criticalHigh: 30.0, sortOrder: 1 },
      { panelId: cbcPanel.id, name: 'Red Blood Cell Count', abbreviation: 'RBC', unit: 'M/µL', refRangeDogMin: 5.5, refRangeDogMax: 8.5, refRangeCatMin: 5.0, refRangeCatMax: 10.0, criticalLow: 3.0, criticalHigh: 12.0, sortOrder: 2 },
      { panelId: cbcPanel.id, name: 'Hemoglobin', abbreviation: 'HGB', unit: 'g/dL', refRangeDogMin: 12.0, refRangeDogMax: 18.0, refRangeCatMin: 8.0, refRangeCatMax: 15.0, criticalLow: 6.0, criticalHigh: 20.0, sortOrder: 3 },
      { panelId: cbcPanel.id, name: 'Hematocrit', abbreviation: 'HCT', unit: '%', refRangeDogMin: 37.0, refRangeDogMax: 55.0, refRangeCatMin: 24.0, refRangeCatMax: 45.0, criticalLow: 18.0, criticalHigh: 60.0, sortOrder: 4 },
      { panelId: cbcPanel.id, name: 'Platelet Count', abbreviation: 'PLT', unit: 'K/µL', refRangeDogMin: 150, refRangeDogMax: 400, refRangeCatMin: 150, refRangeCatMax: 500, criticalLow: 50, criticalHigh: 800, sortOrder: 5 },
      { panelId: cbcPanel.id, name: 'Mean Corpuscular Volume', abbreviation: 'MCV', unit: 'fL', refRangeDogMin: 60.0, refRangeDogMax: 77.0, refRangeCatMin: 39.0, refRangeCatMax: 55.0, sortOrder: 6 },
      { panelId: cbcPanel.id, name: 'Mean Corpuscular Hemoglobin', abbreviation: 'MCH', unit: 'pg', refRangeDogMin: 19.5, refRangeDogMax: 24.5, refRangeCatMin: 12.5, refRangeCatMax: 17.5, sortOrder: 7 },
      { panelId: cbcPanel.id, name: 'Neutrophils', abbreviation: 'NEU', unit: 'K/µL', refRangeDogMin: 3.0, refRangeDogMax: 11.5, refRangeCatMin: 2.5, refRangeCatMax: 12.5, criticalLow: 1.0, sortOrder: 8 },
      { panelId: cbcPanel.id, name: 'Lymphocytes', abbreviation: 'LYM', unit: 'K/µL', refRangeDogMin: 1.0, refRangeDogMax: 4.8, refRangeCatMin: 1.5, refRangeCatMax: 7.0, sortOrder: 9 },
      { panelId: cbcPanel.id, name: 'Monocytes', abbreviation: 'MONO', unit: 'K/µL', refRangeDogMin: 0.15, refRangeDogMax: 1.35, refRangeCatMin: 0.05, refRangeCatMax: 0.8, sortOrder: 10 },
    ],
  });

  // Chemistry Panel
  const chemPanel = await prisma.labPanel.create({
    data: {
      name: 'Chemistry Panel (Chem 10)',
      category: 'Chemistry',
      description: 'Measures kidney, liver, and electrolyte values',
      isCommon: true,
    },
  });

  await prisma.labTest.createMany({
    data: [
      { panelId: chemPanel.id, name: 'Blood Urea Nitrogen', abbreviation: 'BUN', unit: 'mg/dL', refRangeDogMin: 7, refRangeDogMax: 27, refRangeCatMin: 16, refRangeCatMax: 36, criticalLow: 5, criticalHigh: 80, warningHigh: 40, sortOrder: 1 },
      { panelId: chemPanel.id, name: 'Creatinine', abbreviation: 'CREA', unit: 'mg/dL', refRangeDogMin: 0.5, refRangeDogMax: 1.6, refRangeCatMin: 0.8, refRangeCatMax: 2.4, criticalLow: 0.3, criticalHigh: 5.0, warningHigh: 2.5, sortOrder: 2 },
      { panelId: chemPanel.id, name: 'Alanine Aminotransferase', abbreviation: 'ALT', unit: 'U/L', refRangeDogMin: 10, refRangeDogMax: 125, refRangeCatMin: 20, refRangeCatMax: 100, criticalHigh: 500, warningHigh: 200, sortOrder: 3 },
      { panelId: chemPanel.id, name: 'Alkaline Phosphatase', abbreviation: 'ALP', unit: 'U/L', refRangeDogMin: 20, refRangeDogMax: 150, refRangeCatMin: 10, refRangeCatMax: 90, criticalHigh: 500, warningHigh: 250, sortOrder: 4 },
      { panelId: chemPanel.id, name: 'Total Bilirubin', abbreviation: 'TBIL', unit: 'mg/dL', refRangeDogMin: 0.1, refRangeDogMax: 0.6, refRangeCatMin: 0.1, refRangeCatMax: 0.6, criticalHigh: 3.0, warningHigh: 1.5, sortOrder: 5 },
      { panelId: chemPanel.id, name: 'Total Protein', abbreviation: 'TP', unit: 'g/dL', refRangeDogMin: 5.4, refRangeDogMax: 7.6, refRangeCatMin: 5.7, refRangeCatMax: 8.0, criticalLow: 4.0, criticalHigh: 10.0, sortOrder: 6 },
      { panelId: chemPanel.id, name: 'Albumin', abbreviation: 'ALB', unit: 'g/dL', refRangeDogMin: 2.6, refRangeDogMax: 4.0, refRangeCatMin: 2.2, refRangeCatMax: 3.8, criticalLow: 1.5, sortOrder: 7 },
      { panelId: chemPanel.id, name: 'Globulin', abbreviation: 'GLOB', unit: 'g/dL', refRangeDogMin: 2.0, refRangeDogMax: 4.0, refRangeCatMin: 2.0, refRangeCatMax: 5.0, sortOrder: 8 },
      { panelId: chemPanel.id, name: 'Glucose', abbreviation: 'GLU', unit: 'mg/dL', refRangeDogMin: 70, refRangeDogMax: 110, refRangeCatMin: 70, refRangeCatMax: 140, criticalLow: 40, criticalHigh: 300, warningLow: 60, warningHigh: 180, sortOrder: 9 },
      { panelId: chemPanel.id, name: 'Calcium', abbreviation: 'CA', unit: 'mg/dL', refRangeDogMin: 8.8, refRangeDogMax: 11.6, refRangeCatMin: 8.4, refRangeCatMax: 10.6, criticalLow: 6.0, criticalHigh: 14.0, sortOrder: 10 },
    ],
  });

  // Electrolyte Panel
  const electrolytePanel = await prisma.labPanel.create({
    data: {
      name: 'Electrolyte Panel',
      category: 'Chemistry',
      description: 'Measures critical electrolytes',
      isCommon: true,
    },
  });

  await prisma.labTest.createMany({
    data: [
      { panelId: electrolytePanel.id, name: 'Sodium', abbreviation: 'Na', unit: 'mmol/L', refRangeDogMin: 139, refRangeDogMax: 154, refRangeCatMin: 145, refRangeCatMax: 158, criticalLow: 120, criticalHigh: 170, sortOrder: 1 },
      { panelId: electrolytePanel.id, name: 'Potassium', abbreviation: 'K', unit: 'mmol/L', refRangeDogMin: 3.6, refRangeDogMax: 5.5, refRangeCatMin: 3.8, refRangeCatMax: 5.6, criticalLow: 2.5, criticalHigh: 8.0, warningLow: 3.0, warningHigh: 6.5, sortOrder: 2 },
      { panelId: electrolytePanel.id, name: 'Chloride', abbreviation: 'Cl', unit: 'mmol/L', refRangeDogMin: 102, refRangeDogMax: 120, refRangeCatMin: 107, refRangeCatMax: 126, criticalLow: 80, criticalHigh: 140, sortOrder: 3 },
      { panelId: electrolytePanel.id, name: 'Phosphorus', abbreviation: 'PHOS', unit: 'mg/dL', refRangeDogMin: 2.5, refRangeDogMax: 6.0, refRangeCatMin: 2.4, refRangeCatMax: 7.0, criticalLow: 1.0, criticalHigh: 12.0, sortOrder: 4 },
    ],
  });

  // Thyroid Panel (especially for cats)
  const thyroidPanel = await prisma.labPanel.create({
    data: {
      name: 'Thyroid Panel',
      category: 'Endocrine',
      description: 'Thyroid hormone levels',
      isCommon: true,
    },
  });

  await prisma.labTest.createMany({
    data: [
      { panelId: thyroidPanel.id, name: 'Total T4 (Dogs)', abbreviation: 'T4', unit: 'µg/dL', refRangeDogMin: 1.0, refRangeDogMax: 4.0, refRangeCatMin: 0.8, refRangeCatMax: 4.0, criticalLow: 0.5, criticalHigh: 6.0, sortOrder: 1 },
      { panelId: thyroidPanel.id, name: 'Free T4', abbreviation: 'fT4', unit: 'ng/dL', refRangeDogMin: 0.8, refRangeDogMax: 2.5, refRangeCatMin: 0.8, refRangeCatMax: 2.5, sortOrder: 2 },
      { panelId: thyroidPanel.id, name: 'TSH', abbreviation: 'TSH', unit: 'ng/mL', refRangeDogMin: 0.0, refRangeDogMax: 0.6, refRangeCatMin: 0.0, refRangeCatMax: 0.6, sortOrder: 3 },
    ],
  });

  // Urinalysis
  const urinalysisPanel = await prisma.labPanel.create({
    data: {
      name: 'Urinalysis',
      category: 'Urinalysis',
      description: 'Urine chemistry and sediment analysis',
      isCommon: true,
    },
  });

  await prisma.labTest.createMany({
    data: [
      { panelId: urinalysisPanel.id, name: 'Specific Gravity', abbreviation: 'USG', unit: '', refRangeDogMin: 1.015, refRangeDogMax: 1.045, refRangeCatMin: 1.035, refRangeCatMax: 1.060, criticalLow: 1.005, warningLow: 1.010, sortOrder: 1 },
      { panelId: urinalysisPanel.id, name: 'pH', abbreviation: 'pH', unit: '', refRangeDogMin: 5.5, refRangeDogMax: 7.5, refRangeCatMin: 5.5, refRangeCatMax: 7.5, warningLow: 5.0, warningHigh: 8.0, sortOrder: 2 },
      { panelId: urinalysisPanel.id, name: 'Protein', abbreviation: 'PROT', unit: 'mg/dL', refRangeDogMin: 0, refRangeDogMax: 30, refRangeCatMin: 0, refRangeCatMax: 30, warningHigh: 100, sortOrder: 3 },
      { panelId: urinalysisPanel.id, name: 'Glucose', abbreviation: 'GLU', unit: 'mg/dL', refRangeDogMin: 0, refRangeDogMax: 0, refRangeCatMin: 0, refRangeCatMax: 0, warningHigh: 50, sortOrder: 4 },
    ],
  });

  console.log('  Lab panels: CBC, Chemistry, Electrolytes, Thyroid, Urinalysis created');
  console.log('  Lab tests: 40+ reference ranges configured');

  // ── Demo Lab Results ───────────────────────────────────────────────────────
  
  // Rex - Recent CBC (some abnormalities)
  const rexCbc = await prisma.labResult.create({
    data: {
      patientId: rex.id,
      panelId: cbcPanel.id,
      testDate: daysAgo(7),
      externalLab: 'IDEXX',
      status: 'abnormal',
      abnormalCount: 2,
      criticalCount: 0,
      notes: 'Mild leukocytosis - monitoring for infection',
      values: {
        create: [
          { testId: (await prisma.labTest.findFirst({ where: { panelId: cbcPanel.id, abbreviation: 'WBC' } }))!.id, value: 18.5, displayValue: '18.50', status: 'high', refRangeMin: 6.0, refRangeMax: 17.0 },
          { testId: (await prisma.labTest.findFirst({ where: { panelId: cbcPanel.id, abbreviation: 'RBC' } }))!.id, value: 7.2, displayValue: '7.20', status: 'normal', refRangeMin: 5.5, refRangeMax: 8.5 },
          { testId: (await prisma.labTest.findFirst({ where: { panelId: cbcPanel.id, abbreviation: 'HGB' } }))!.id, value: 15.5, displayValue: '15.50', status: 'normal', refRangeMin: 12.0, refRangeMax: 18.0 },
          { testId: (await prisma.labTest.findFirst({ where: { panelId: cbcPanel.id, abbreviation: 'HCT' } }))!.id, value: 45.0, displayValue: '45.00', status: 'normal', refRangeMin: 37.0, refRangeMax: 55.0 },
          { testId: (await prisma.labTest.findFirst({ where: { panelId: cbcPanel.id, abbreviation: 'PLT' } }))!.id, value: 280, displayValue: '280', status: 'normal', refRangeMin: 150, refRangeMax: 400 },
          { testId: (await prisma.labTest.findFirst({ where: { panelId: cbcPanel.id, abbreviation: 'NEU' } }))!.id, value: 14.2, displayValue: '14.20', status: 'high', refRangeMin: 3.0, refRangeMax: 11.5 },
          { testId: (await prisma.labTest.findFirst({ where: { panelId: cbcPanel.id, abbreviation: 'LYM' } }))!.id, value: 2.8, displayValue: '2.80', status: 'normal', refRangeMin: 1.0, refRangeMax: 4.8 },
        ],
      },
    },
  });

  // Rex - Chemistry (elevated BUN/CREA - kidney concerns)
  const rexChem = await prisma.labResult.create({
    data: {
      patientId: rex.id,
      panelId: chemPanel.id,
      testDate: daysAgo(7),
      externalLab: 'IDEXX',
      status: 'abnormal',
      abnormalCount: 2,
      criticalCount: 0,
      notes: 'Mild azotemia - recheck in 2 weeks with urine specific gravity',
      interpretation: 'Mild elevation in BUN and creatinine suggest early kidney disease or dehydration. Recommend recheck with urine specific gravity and blood pressure measurement.',
      values: {
        create: [
          { testId: (await prisma.labTest.findFirst({ where: { panelId: chemPanel.id, abbreviation: 'BUN' } }))!.id, value: 35, displayValue: '35', status: 'high', refRangeMin: 7, refRangeMax: 27 },
          { testId: (await prisma.labTest.findFirst({ where: { panelId: chemPanel.id, abbreviation: 'CREA' } }))!.id, value: 2.1, displayValue: '2.1', status: 'high', refRangeMin: 0.5, refRangeMax: 1.6 },
          { testId: (await prisma.labTest.findFirst({ where: { panelId: chemPanel.id, abbreviation: 'ALT' } }))!.id, value: 85, displayValue: '85', status: 'normal', refRangeMin: 10, refRangeMax: 125 },
          { testId: (await prisma.labTest.findFirst({ where: { panelId: chemPanel.id, abbreviation: 'ALP' } }))!.id, value: 120, displayValue: '120', status: 'normal', refRangeMin: 20, refRangeMax: 150 },
          { testId: (await prisma.labTest.findFirst({ where: { panelId: chemPanel.id, abbreviation: 'GLU' } }))!.id, value: 95, displayValue: '95', status: 'normal', refRangeMin: 70, refRangeMax: 110 },
          { testId: (await prisma.labTest.findFirst({ where: { panelId: chemPanel.id, abbreviation: 'TP' } }))!.id, value: 6.8, displayValue: '6.8', status: 'normal', refRangeMin: 5.4, refRangeMax: 7.6 },
        ],
      },
    },
  });

  // Whiskers - Thyroid (elevated T4 - hyperthyroid)
  const whiskersThyroid = await prisma.labResult.create({
    data: {
      patientId: whiskers.id,
      panelId: thyroidPanel.id,
      testDate: daysAgo(14),
      externalLab: 'Antech',
      status: 'abnormal',
      abnormalCount: 1,
      criticalCount: 0,
      notes: 'Elevated T4 consistent with hyperthyroidism',
      interpretation: 'Total T4 of 6.8 µg/dL is elevated. Consistent with hyperthyroidism. Recommend starting methimazole and recheck T4 in 4 weeks.',
      values: {
        create: [
          { testId: (await prisma.labTest.findFirst({ where: { panelId: thyroidPanel.id, abbreviation: 'T4' } }))!.id, value: 6.8, displayValue: '6.80', status: 'high', refRangeMin: 0.8, refRangeMax: 4.0 },
        ],
      },
    },
  });

  // Buddy - Chemistry (normal, for comparison)
  const buddyChem = await prisma.labResult.create({
    data: {
      patientId: buddy.id,
      panelId: chemPanel.id,
      testDate: daysAgo(30),
      externalLab: 'IDEXX',
      status: 'normal',
      abnormalCount: 0,
      criticalCount: 0,
      notes: 'Normal chemistry panel',
      values: {
        create: [
          { testId: (await prisma.labTest.findFirst({ where: { panelId: chemPanel.id, abbreviation: 'BUN' } }))!.id, value: 18, displayValue: '18', status: 'normal', refRangeMin: 7, refRangeMax: 27 },
          { testId: (await prisma.labTest.findFirst({ where: { panelId: chemPanel.id, abbreviation: 'CREA' } }))!.id, value: 1.1, displayValue: '1.1', status: 'normal', refRangeMin: 0.5, refRangeMax: 1.6 },
          { testId: (await prisma.labTest.findFirst({ where: { panelId: chemPanel.id, abbreviation: 'ALT' } }))!.id, value: 45, displayValue: '45', status: 'normal', refRangeMin: 10, refRangeMax: 125 },
          { testId: (await prisma.labTest.findFirst({ where: { panelId: chemPanel.id, abbreviation: 'GLU' } }))!.id, value: 88, displayValue: '88', status: 'normal', refRangeMin: 70, refRangeMax: 110 },
        ],
      },
    },
  });

  // Luna - Urinalysis
  const lunaUrinalysis = await prisma.labResult.create({
    data: {
      patientId: luna.id,
      panelId: urinalysisPanel.id,
      testDate: daysAgo(10),
      externalLab: 'In-house',
      status: 'normal',
      abnormalCount: 0,
      criticalCount: 0,
      notes: 'Normal urine - good concentration',
      values: {
        create: [
          { testId: (await prisma.labTest.findFirst({ where: { panelId: urinalysisPanel.id, abbreviation: 'USG' } }))!.id, value: 1.045, displayValue: '1.045', status: 'normal', refRangeMin: 1.035, refRangeMax: 1.060 },
          { testId: (await prisma.labTest.findFirst({ where: { panelId: urinalysisPanel.id, abbreviation: 'pH' } }))!.id, value: 6.5, displayValue: '6.5', status: 'normal', refRangeMin: 5.5, refRangeMax: 7.5 },
        ],
      },
    },
  });

  console.log('  Lab results: 5 demo results created (2 abnormal, 3 normal)');
