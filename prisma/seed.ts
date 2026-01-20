import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // ═══════════════════════════════════════════════════════════════════
  // SEED COUNTRIES (Reference data - must be first)
  // ═══════════════════════════════════════════════════════════════════
  console.log('📍 Seeding countries...');

  const countriesData = [
    // EU Countries (27)
    { code: 'AT', name: 'Austria', region: 'EU' as const },
    { code: 'BE', name: 'Belgium', region: 'EU' as const },
    { code: 'BG', name: 'Bulgaria', region: 'EU' as const },
    { code: 'HR', name: 'Croatia', region: 'EU' as const },
    { code: 'CY', name: 'Cyprus', region: 'EU' as const },
    { code: 'CZ', name: 'Czech Republic', region: 'EU' as const },
    { code: 'DK', name: 'Denmark', region: 'EU' as const },
    { code: 'EE', name: 'Estonia', region: 'EU' as const },
    { code: 'FI', name: 'Finland', region: 'EU' as const },
    { code: 'FR', name: 'France', region: 'EU' as const },
    { code: 'DE', name: 'Germany', region: 'EU' as const },
    { code: 'GR', name: 'Greece', region: 'EU' as const },
    { code: 'HU', name: 'Hungary', region: 'EU' as const },
    { code: 'IE', name: 'Ireland', region: 'EU' as const },
    { code: 'IT', name: 'Italy', region: 'EU' as const },
    { code: 'LV', name: 'Latvia', region: 'EU' as const },
    { code: 'LT', name: 'Lithuania', region: 'EU' as const },
    { code: 'LU', name: 'Luxembourg', region: 'EU' as const },
    { code: 'MT', name: 'Malta', region: 'EU' as const },
    { code: 'NL', name: 'Netherlands', region: 'EU' as const },
    { code: 'PL', name: 'Poland', region: 'EU' as const },
    { code: 'PT', name: 'Portugal', region: 'EU' as const },
    { code: 'RO', name: 'Romania', region: 'EU' as const },
    { code: 'SK', name: 'Slovakia', region: 'EU' as const },
    { code: 'SI', name: 'Slovenia', region: 'EU' as const },
    { code: 'ES', name: 'Spain', region: 'EU' as const },
    { code: 'SE', name: 'Sweden', region: 'EU' as const },
    // Non-EU Europe (12)
    { code: 'GB', name: 'United Kingdom', region: 'NON_EU_EUROPE' as const },
    { code: 'CH', name: 'Switzerland', region: 'NON_EU_EUROPE' as const },
    { code: 'NO', name: 'Norway', region: 'NON_EU_EUROPE' as const },
    { code: 'IS', name: 'Iceland', region: 'NON_EU_EUROPE' as const },
    { code: 'RS', name: 'Serbia', region: 'NON_EU_EUROPE' as const },
    { code: 'UA', name: 'Ukraine', region: 'NON_EU_EUROPE' as const },
    { code: 'BA', name: 'Bosnia and Herzegovina', region: 'NON_EU_EUROPE' as const },
    { code: 'ME', name: 'Montenegro', region: 'NON_EU_EUROPE' as const },
    { code: 'MK', name: 'North Macedonia', region: 'NON_EU_EUROPE' as const },
    { code: 'AL', name: 'Albania', region: 'NON_EU_EUROPE' as const },
    { code: 'MD', name: 'Moldova', region: 'NON_EU_EUROPE' as const },
    { code: 'TR', name: 'Turkey', region: 'NON_EU_EUROPE' as const },
    // Non-Europe (12)
    { code: 'US', name: 'United States', region: 'NON_EUROPE' as const },
    { code: 'CA', name: 'Canada', region: 'NON_EUROPE' as const },
    { code: 'AU', name: 'Australia', region: 'NON_EUROPE' as const },
    { code: 'JP', name: 'Japan', region: 'NON_EUROPE' as const },
    { code: 'CN', name: 'China', region: 'NON_EUROPE' as const },
    { code: 'BR', name: 'Brazil', region: 'NON_EUROPE' as const },
    { code: 'IN', name: 'India', region: 'NON_EUROPE' as const },
    { code: 'ZA', name: 'South Africa', region: 'NON_EUROPE' as const },
    { code: 'IL', name: 'Israel', region: 'NON_EUROPE' as const },
    { code: 'SG', name: 'Singapore', region: 'NON_EUROPE' as const },
    { code: 'KR', name: 'South Korea', region: 'NON_EUROPE' as const },
    { code: 'MX', name: 'Mexico', region: 'NON_EUROPE' as const },
  ];

  for (const country of countriesData) {
    await prisma.country.upsert({
      where: { code: country.code },
      update: {},
      create: country,
    });
  }
  console.log(`✅ Seeded ${countriesData.length} countries`);

  // ═══════════════════════════════════════════════════════════════════
  // SEED SHIPPING SCENARIOS (AREA logic - 9 fixed scenarios)
  // ═══════════════════════════════════════════════════════════════════
  console.log('🚚 Seeding shipping scenarios...');

  const scenariosData = [
    {
      scenarioNumber: 1,
      regionFrom: 'EU' as const,
      regionTo: 'EU' as const,
      combi: 'EUEU',
      itemNo: 89,
      description: 'Pick-up service of hypothetic package as defined in the Tech. Specs. and delivery to lots 2 and 3 contractors according to Scenario 1',
      requiresCustoms: false,
    },
    {
      scenarioNumber: 2,
      regionFrom: 'EU' as const,
      regionTo: 'NON_EU_EUROPE' as const,
      combi: 'EUNon-EU Europe',
      itemNo: 90,
      description: 'Pick-up service of hypothetic package as defined in the Tech. Specs. and delivery to lots 2 and 3 contractors according to Scenario 2',
      requiresCustoms: true,
    },
    {
      scenarioNumber: 3,
      regionFrom: 'NON_EU_EUROPE' as const,
      regionTo: 'EU' as const,
      combi: 'Non-EU EuropeEU',
      itemNo: 91,
      description: 'Pick-up service of hypothetic package as defined in the Tech. Specs. and delivery to lots 2 and 3 contractors according to Scenario 3',
      requiresCustoms: true,
    },
    {
      scenarioNumber: 4,
      regionFrom: 'NON_EUROPE' as const,
      regionTo: 'EU' as const,
      combi: 'Non-EuropeEU',
      itemNo: 92,
      description: 'Pick-up service of hypothetic package as defined in the Tech. Specs. and delivery to lots 2 and 3 contractors according to Scenario 4',
      requiresCustoms: true,
    },
    {
      scenarioNumber: 5,
      regionFrom: 'NON_EUROPE' as const,
      regionTo: 'NON_EUROPE' as const,
      combi: 'Non-EuropeNon-Europe',
      itemNo: 93,
      description: 'Pick-up service of hypothetic package as defined in the Tech. Specs. and delivery to lots 2 and 3 contractors according to Scenario 5',
      requiresCustoms: true,
    },
    {
      scenarioNumber: 6,
      regionFrom: 'NON_EUROPE' as const,
      regionTo: 'NON_EU_EUROPE' as const,
      combi: 'Non-EuropeNon-EU Europe',
      itemNo: 94,
      description: 'Pick-up service of hypothetic package as defined in the Tech. Specs. and delivery to lots 2 and 3 contractors according to Scenario 6',
      requiresCustoms: true,
    },
    {
      scenarioNumber: 7,
      regionFrom: 'NON_EU_EUROPE' as const,
      regionTo: 'NON_EUROPE' as const,
      combi: 'Non-EU EuropeNon-Europe',
      itemNo: 95,
      description: 'Pick-up service of hypothetic package as defined in the Tech. Specs. and delivery to lots 2 and 3 contractors according to Scenario 7',
      requiresCustoms: true,
    },
    {
      scenarioNumber: 8,
      regionFrom: 'EU' as const,
      regionTo: 'NON_EUROPE' as const,
      combi: 'EUNon-Europe',
      itemNo: 96,
      description: 'Pick-up service of hypothetic package as defined in the Tech. Specs. and delivery to lots 2 and 3 contractors according to Scenario 8',
      requiresCustoms: true,
    },
    {
      scenarioNumber: 9,
      regionFrom: 'NON_EU_EUROPE' as const,
      regionTo: 'NON_EU_EUROPE' as const,
      combi: 'Non-EU EuropeNon-EU Europe',
      itemNo: 97,
      description: 'Pick-up service of hypothetic package as defined in the Tech. Specs. and delivery to lots 2 and 3 contractors according to Scenario 9',
      requiresCustoms: true,
    },
  ];

  for (const scenario of scenariosData) {
    await prisma.shippingScenario.upsert({
      where: { scenarioNumber: scenario.scenarioNumber },
      update: {},
      create: scenario,
    });
  }
  console.log(`✅ Seeded ${scenariosData.length} shipping scenarios`);

  // ═══════════════════════════════════════════════════════════════════
  // SEED USERS
  // ═══════════════════════════════════════════════════════════════════

  // Create a default user
  const user = await prisma.user.upsert({
    where: { email: 'admin@hadea.com' },
    update: {},
    create: {
      email: 'admin@hadea.com',
      name: 'System Administrator',
      passwordHash: 'changeme', // In production, use bcrypt
      role: 'ADMIN',
    },
  });
  console.log('✅ Created user:', user.email);

  // Create sample sites
  const site1 = await prisma.site.upsert({
    where: { code: 'MUC-001' },
    update: {},
    create: {
      name: 'Munich Research Center',
      code: 'MUC-001',
      companyOrName: 'Munich Research Center GmbH',
      addressLine1: 'Forschungsstraße 123',
      city: 'Munich',
      postalCode: '80331',
      countryCode: 'DE',
      countryName: 'Germany',
      region: 'EU',
      isEU: true,
    },
  });

  const site2 = await prisma.site.upsert({
    where: { code: 'PAR-001' },
    update: {},
    create: {
      name: 'Paris Laboratory Site',
      code: 'PAR-001',
      companyOrName: 'Paris Laboratory Site SARL',
      addressLine1: '45 Rue de la Science',
      city: 'Paris',
      postalCode: '75005',
      countryCode: 'FR',
      countryName: 'France',
      region: 'EU',
      isEU: true,
    },
  });
  console.log('✅ Created sites:', site1.code, site2.code);

  // Create site contacts
  await prisma.siteContact.createMany({
    data: [
      {
        siteId: site1.id,
        name: 'Dr. Hans Mueller',
        email: 'h.mueller@munich-research.de',
        phone: '+49 89 12345678',
        isPrimary: true,
      },
      {
        siteId: site2.id,
        name: 'Dr. Marie Dubois',
        email: 'm.dubois@paris-lab.fr',
        phone: '+33 1 23456789',
        isPrimary: true,
      },
    ],
  });
  console.log('✅ Created site contacts');

  // Create laboratories
  const lab1 = await prisma.lab.upsert({
    where: { code: 'LAB-CENTRAL' },
    update: {},
    create: {
      name: 'Central Analysis Laboratory',
      code: 'LAB-CENTRAL',
      companyOrName: 'Central Analysis Laboratory NV',
      addressLine1: 'Science Park 456',
      city: 'Brussels',
      postalCode: '1000',
      countryCode: 'BE',
      countryName: 'Belgium',
      region: 'EU',
      isEU: true,
    },
  });
  console.log('✅ Created lab:', lab1.code);

  // Create lab contact
  await prisma.labContact.create({
    data: {
      labId: lab1.id,
      name: 'Dr. Jan Vermeer',
      email: 'j.vermeer@central-lab.be',
      phone: '+32 2 1234567',
      isPrimary: true,
    },
  });
  console.log('✅ Created lab contact');

  // Create stock items
  const tube10ml = await prisma.stockItem.create({
    data: {
      name: 'Sample Tube 10ml',
      sku: 'TUBE-10ML-001',
      description: 'Standard 10ml sampling tube',
      quantity: 500,
      minStockLevel: 100,
      unitPrice: 2.50,
      unitWeight: 0.015,
      currency: 'EUR',
    },
  });

  const tube50ml = await prisma.stockItem.create({
    data: {
      name: 'Sample Tube 50ml',
      sku: 'TUBE-50ML-001',
      description: 'Standard 50ml sampling tube',
      quantity: 300,
      minStockLevel: 50,
      unitPrice: 4.00,
      unitWeight: 0.030,
      currency: 'EUR',
    },
  });

  const gloves = await prisma.stockItem.create({
    data: {
      name: 'Nitrile Gloves (Pair)',
      sku: 'GLOVE-NITR-001',
      description: 'Disposable nitrile gloves',
      quantity: 1000,
      minStockLevel: 200,
      unitPrice: 0.50,
      unitWeight: 0.010,
      currency: 'EUR',
    },
  });
  console.log('✅ Created stock items');

  // Create kit
  const kit = await prisma.kit.create({
    data: {
      name: 'Standard Sampling Kit',
      code: 'KIT-STD-001',
      description: 'Standard kit for routine sampling',
      totalWeight: 0.5,
      length: 30,
      width: 20,
      height: 10,
      items: {
        create: [
          {
            stockItemId: tube10ml.id,
            quantity: 5,
          },
          {
            stockItemId: tube50ml.id,
            quantity: 2,
          },
          {
            stockItemId: gloves.id,
            quantity: 2,
          },
        ],
      },
    },
    include: {
      items: true,
    },
  });
  console.log('✅ Created kit:', kit.code);

  // Create HaDEA config
  await prisma.hadeaConfig.create({
    data: {
      contractingAuthorityName: 'European Health and Digital Executive Agency',
      contractorName: 'HaDEA Order Entry Services',
      specificContractNumber: 'HADEA-2026-SC-001',
      specificContractDate: new Date('2026-01-01'),
      isActive: true,
    },
  });
  console.log('✅ Created HaDEA configuration');

  // Create more sample sites
  const site3 = await prisma.site.create({
    data: {
      name: 'Amsterdam Testing Facility',
      code: 'AMS-001',
      companyOrName: 'Amsterdam Testing Facility BV',
      addressLine1: 'Weesperstraat 100',
      city: 'Amsterdam',
      postalCode: '1018 DN',
      countryCode: 'NL',
      countryName: 'Netherlands',
      region: 'EU',
      isEU: true,
    },
  });

  const site4 = await prisma.site.create({
    data: {
      name: 'Madrid Research Institute',
      code: 'MAD-001',
      companyOrName: 'Madrid Research Institute SL',
      addressLine1: 'Calle de Alcalá 45',
      city: 'Madrid',
      postalCode: '28014',
      countryCode: 'ES',
      countryName: 'Spain',
      region: 'EU',
      isEU: true,
    },
  });

  const site5 = await prisma.site.create({
    data: {
      name: 'London Sample Center',
      code: 'LON-001',
      companyOrName: 'London Sample Center Ltd',
      addressLine1: '123 Oxford Street',
      city: 'London',
      postalCode: 'W1D 1BS',
      countryCode: 'GB',
      countryName: 'United Kingdom',
      region: 'NON_EU_EUROPE',
      isEU: false,
    },
  });
  console.log('✅ Created additional sites');

  // Create additional contacts
  await prisma.siteContact.createMany({
    data: [
      {
        siteId: site3.id,
        name: 'Dr. Jan van der Berg',
        email: 'j.vandeberg@amsterdam-test.nl',
        phone: '+31 20 1234567',
        isPrimary: true,
      },
      {
        siteId: site4.id,
        name: 'Dr. Carmen Rodriguez',
        email: 'c.rodriguez@madrid-research.es',
        phone: '+34 91 1234567',
        isPrimary: true,
      },
      {
        siteId: site5.id,
        name: 'Dr. James Smith',
        email: 'j.smith@london-sample.uk',
        phone: '+44 20 1234567',
        isPrimary: true,
      },
    ],
  });

  // Create additional lab
  const lab2 = await prisma.lab.create({
    data: {
      name: 'Northern Europe Lab',
      code: 'LAB-NORTH',
      companyOrName: 'Northern Europe Lab AB',
      addressLine1: 'Ringvägen 52',
      city: 'Stockholm',
      postalCode: '11860',
      countryCode: 'SE',
      countryName: 'Sweden',
      region: 'EU',
      isEU: true,
    },
  });

  await prisma.labContact.create({
    data: {
      labId: lab2.id,
      name: 'Dr. Anna Svensson',
      email: 'a.svensson@north-lab.se',
      phone: '+46 8 1234567',
      isPrimary: true,
    },
  });
  console.log('✅ Created additional lab');

  // Create more stock items
  const container = await prisma.stockItem.create({
    data: {
      name: 'Insulated Container',
      sku: 'CONT-INS-001',
      description: 'Insulated shipping container',
      quantity: 150,
      minStockLevel: 30,
      unitPrice: 15.00,
      unitWeight: 0.500,
      currency: 'EUR',
    },
  });

  const label = await prisma.stockItem.create({
    data: {
      name: 'Sample Label Sheets',
      sku: 'LABEL-SHEET-001',
      description: 'Pre-printed label sheets',
      quantity: 800,
      minStockLevel: 100,
      unitPrice: 1.20,
      unitWeight: 0.005,
      currency: 'EUR',
    },
  });

  const swab = await prisma.stockItem.create({
    data: {
      name: 'Sterile Swab',
      sku: 'SWAB-STER-001',
      description: 'Sterile cotton swab',
      quantity: 2000,
      minStockLevel: 500,
      unitPrice: 0.80,
      unitWeight: 0.003,
      currency: 'EUR',
    },
  });
  console.log('✅ Created additional stock items');

  // Create additional kit
  const kit2 = await prisma.kit.create({
    data: {
      name: 'Advanced Sampling Kit',
      code: 'KIT-ADV-001',
      description: 'Advanced kit with additional items',
      totalWeight: 0.8,
      length: 35,
      width: 25,
      height: 12,
      items: {
        create: [
          { stockItemId: tube10ml.id, quantity: 10 },
          { stockItemId: tube50ml.id, quantity: 5 },
          { stockItemId: gloves.id, quantity: 4 },
          { stockItemId: container.id, quantity: 1 },
          { stockItemId: label.id, quantity: 2 },
          { stockItemId: swab.id, quantity: 20 },
        ],
      },
    },
  });
  console.log('✅ Created additional kit');

  // Create sample orders with different statuses
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const nextWeek = new Date(today);
  nextWeek.setDate(nextWeek.getDate() + 7);
  
  const twoWeeks = new Date(today);
  twoWeeks.setDate(twoWeeks.getDate() + 14);
  
  const threeWeeks = new Date(today);
  threeWeeks.setDate(threeWeeks.getDate() + 21);

  // Calculate outbound dates (14 days before, skip weekends)
  const calculateOutbound = (samplingDate: Date) => {
    const outbound = new Date(samplingDate);
    outbound.setDate(outbound.getDate() - 14);
    const day = outbound.getDay();
    if (day === 0) outbound.setDate(outbound.getDate() + 1); // Sunday -> Monday
    if (day === 6) outbound.setDate(outbound.getDate() + 2); // Saturday -> Monday
    return outbound;
  };

  // Get contacts
  const siteContact1 = await prisma.siteContact.findFirst({ where: { siteId: site1.id } });
  const siteContact2 = await prisma.siteContact.findFirst({ where: { siteId: site2.id } });
  const siteContact3 = await prisma.siteContact.findFirst({ where: { siteId: site3.id } });
  const labContact1 = await prisma.labContact.findFirst({ where: { labId: lab1.id } });
  const labContact2 = await prisma.labContact.findFirst({ where: { labId: lab2.id } });

  // Order 1 - Approved, outbound shipped
  const order1 = await prisma.order.create({
    data: {
      orderNumber: `ORD-2026-0108-001`,
      siteId: site1.id,
      labId: lab1.id,
      kitId: kit.id,
      siteContactId: siteContact1!.id,
      labContactId: labContact1!.id,
      quantity: 1,
      samplingDate: nextWeek,
      outboundShipDate: calculateOutbound(nextWeek),
      outboundCarrier: 'UPS',
      sampleCarrier: 'DHL',
      status: 'OUTBOUND_SHIPPED',
      approvedAt: new Date(),
      approvedById: user.id,
    },
  });

  await prisma.shipment.create({
    data: {
      orderId: order1.id,
      type: 'OUTBOUND',
      carrier: 'UPS',
      scheduledShipDate: calculateOutbound(nextWeek),
      status: 'IN_TRANSIT',
      trackingNumber: '1Z999AA10123456789',
      waybillNumber: 'UPS12345678',
    },
  });

  // Order 2 - Approved, ready to ship
  await prisma.order.create({
    data: {
      orderNumber: `ORD-2026-0108-002`,
      siteId: site2.id,
      labId: lab1.id,
      kitId: kit.id,
      siteContactId: siteContact2!.id,
      labContactId: labContact1!.id,
      quantity: 2,
      samplingDate: twoWeeks,
      outboundShipDate: today,
      outboundCarrier: 'DHL',
      sampleCarrier: 'UPS',
      status: 'APPROVED',
      approvedAt: new Date(),
      approvedById: user.id,
    },
  });

  // Order 3 - Draft
  await prisma.order.create({
    data: {
      orderNumber: `ORD-2026-0108-003`,
      siteId: site3.id,
      labId: lab2.id,
      kitId: kit2.id,
      siteContactId: siteContact3!.id,
      labContactId: labContact2!.id,
      quantity: 1,
      samplingDate: threeWeeks,
      outboundShipDate: calculateOutbound(threeWeeks),
      outboundCarrier: 'UPS',
      sampleCarrier: 'UPS',
      status: 'DRAFT',
    },
  });

  // Order 4 - Pending approval
  await prisma.order.create({
    data: {
      orderNumber: `ORD-2026-0108-004`,
      siteId: site1.id,
      labId: lab2.id,
      kitId: kit.id,
      siteContactId: siteContact1!.id,
      labContactId: labContact2!.id,
      quantity: 1,
      samplingDate: threeWeeks,
      outboundShipDate: calculateOutbound(threeWeeks),
      outboundCarrier: 'DHL',
      sampleCarrier: 'DHL',
      status: 'PENDING_APPROVAL',
    },
  });

  console.log('✅ Created sample orders');

  console.log('🎉 Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
