import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create a default user
  const user = await prisma.user.upsert({
    where: { email: 'admin@sklms.com' },
    update: {},
    create: {
      email: 'admin@sklms.com',
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
      addressLine1: 'Forschungsstraße 123',
      city: 'Munich',
      postalCode: '80331',
      countryCode: 'DE',
      countryName: 'Germany',
      isEU: true,
    },
  });

  const site2 = await prisma.site.upsert({
    where: { code: 'PAR-001' },
    update: {},
    create: {
      name: 'Paris Laboratory Site',
      code: 'PAR-001',
      addressLine1: '45 Rue de la Science',
      city: 'Paris',
      postalCode: '75005',
      countryCode: 'FR',
      countryName: 'France',
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
      addressLine1: 'Science Park 456',
      city: 'Brussels',
      postalCode: '1000',
      countryCode: 'BE',
      countryName: 'Belgium',
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
      contractorName: 'Sample Kit Logistics Services',
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
      addressLine1: 'Weesperstraat 100',
      city: 'Amsterdam',
      postalCode: '1018 DN',
      countryCode: 'NL',
      countryName: 'Netherlands',
      isEU: true,
    },
  });

  const site4 = await prisma.site.create({
    data: {
      name: 'Madrid Research Institute',
      code: 'MAD-001',
      addressLine1: 'Calle de Alcalá 45',
      city: 'Madrid',
      postalCode: '28014',
      countryCode: 'ES',
      countryName: 'Spain',
      isEU: true,
    },
  });

  const site5 = await prisma.site.create({
    data: {
      name: 'London Sample Center',
      code: 'LON-001',
      addressLine1: '123 Oxford Street',
      city: 'London',
      postalCode: 'W1D 1BS',
      countryCode: 'GB',
      countryName: 'United Kingdom',
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
      addressLine1: 'Ringvägen 52',
      city: 'Stockholm',
      postalCode: '11860',
      countryCode: 'SE',
      countryName: 'Sweden',
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
