import { PrismaClient, Role, ComplaintStatus, Priority, SubmissionSource } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting SmartGovAI database seed...');

  // 1. Seed Cities
  const mumbai = await prisma.city.upsert({
    where: { name: 'Mumbai' },
    update: {},
    create: { name: 'Mumbai', state: 'Maharashtra' },
  });

  const delhi = await prisma.city.upsert({
    where: { name: 'Delhi' },
    update: {},
    create: { name: 'Delhi', state: 'Delhi NCR' },
  });

  // 2. Seed Divisions
  const northDiv = await prisma.division.upsert({
    where: { name_cityId: { name: 'North Division', cityId: mumbai.id } },
    update: {},
    create: { name: 'North Division', cityId: mumbai.id },
  });

  const southDiv = await prisma.division.upsert({
    where: { name_cityId: { name: 'South Division', cityId: mumbai.id } },
    update: {},
    create: { name: 'South Division', cityId: mumbai.id },
  });

  // 3. Seed Departments
  const roadsDept = await prisma.department.upsert({
    where: { code: 'ROADS' },
    update: {},
    create: { name: 'Roads & Traffic Infrastructure', code: 'ROADS', description: 'Potholes, damaged asphalt, traffic signals' },
  });

  const sanitationDept = await prisma.department.upsert({
    where: { code: 'SANITATION' },
    update: {},
    create: { name: 'Sanitation & Solid Waste', code: 'SANITATION', description: 'Garbage dumps, overflow bins, street cleaning' },
  });

  const waterDept = await prisma.department.upsert({
    where: { code: 'WATER' },
    update: {},
    create: { name: 'Water Supply Board', code: 'WATER', description: 'Pipe leaks, water contamination, low pressure' },
  });

  // 4. Seed Admin Users
  const passwordHash = await bcrypt.hash('admin123', 10);

  const divisionAdmin = await prisma.user.upsert({
    where: { email: 'admin@cityfix.gov.in' },
    update: {},
    create: {
      email: 'admin@cityfix.gov.in',
      fullName: 'Division Administrator',
      role: Role.DIVISION_ADMIN,
      passwordHash,
      cityId: mumbai.id,
      divisionId: northDiv.id,
    },
  });

  const deptHead = await prisma.user.upsert({
    where: { email: 'dept@cityfix.gov.in' },
    update: {},
    create: {
      email: 'dept@cityfix.gov.in',
      fullName: 'Roads Dept Head',
      role: Role.DEPARTMENT_HEAD,
      passwordHash,
      cityId: mumbai.id,
      divisionId: northDiv.id,
      departmentId: roadsDept.id,
    },
  });

  const citizen = await prisma.user.upsert({
    where: { phoneNumber: '9876543210' },
    update: {},
    create: {
      phoneNumber: '9876543210',
      fullName: 'Citizen User',
      role: Role.CITIZEN,
    },
  });

  // 5. Seed Contractor
  const contractor = await prisma.contractor.create({
    data: {
      name: 'Apex Infrastructure Pvt Ltd',
      agencyName: 'Apex Infra',
      contactNumber: '9820011223',
      email: 'apex@infra.com',
      divisionId: northDiv.id,
      rating: 4.8,
      activeTasks: 3,
      completedTasks: 42,
    },
  });

  // 6. Seed Complaints
  await prisma.complaint.create({
    data: {
      trackingId: 'NIV-2026-89412',
      citizenId: citizen.id,
      departmentId: roadsDept.id,
      divisionId: northDiv.id,
      contractorId: contractor.id,
      title: 'Deep Road Pothole near SV Road Junction',
      description: 'Dangerous pothole damaging vehicles and slowing traffic.',
      category: 'POTHOLE',
      status: ComplaintStatus.IN_PROGRESS,
      priority: Priority.HIGH,
      source: SubmissionSource.MOBILE_APP,
      latitude: 19.076,
      longitude: 72.8777,
      address: 'SV Road, Andheri West, Mumbai, Maharashtra',
      aiConfidence: 0.94,
      aiDetectedCategory: 'POTHOLE',
      upvoteCount: 18,
      media: {
        create: {
          s3Key: 'complaints/pothole/123.jpg',
          publicUrl: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600',
          fileSizeBytes: 102400,
          mimeType: 'image/jpeg',
        },
      },
    },
  });

  console.log('✅ Database seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
