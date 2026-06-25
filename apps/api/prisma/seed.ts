import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  EquipmentCategory,
  EquipmentStatus,
  MaintenanceScheduleStatus,
  MaintenanceScheduleType,
  MaintenanceStatus,
  PrismaClient,
  RecurrenceInterval,
  StatusSourceType,
  UserRole,
  VendorInterfaceType,
} from "@prisma/client";
import { hash } from "bcrypt";

const PLATFORM_HOSPITAL_SLUG = "__platform__";
const SEED_PASSWORD = "test1234!";
const DEV_INTERFACE_TOKEN = "asan-interface-dev-token";

const prisma = new PrismaClient();
const SEED_ROOT = join(__dirname, "../../../docs/seed");

function hashIngestToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

interface SeedHospital {
  slug: string;
  name: string;
  nameEn?: string;
  region?: string;
  website?: string;
  notes?: string;
}

interface SeedEquipment {
  hospitalSlug: string;
  equipmentSlug: string;
  name: string;
  category: EquipmentCategory;
  location?: string;
  manufacturer?: string;
  model?: string;
  manufacturedAt?: string;
  statusSourceType: StatusSourceType;
  statusSourceTypeReason?: string;
  currentStatus: EquipmentStatus;
  devProbeHost?: string | null;
  notes?: string | null;
  image?: { alt?: string; localPath?: string; remoteUrl?: string };
}

interface SeedFaqItem {
  sortOrder: number;
  question: string;
  answer: string;
  isPublished?: boolean;
}

function inferSpatial(location: string | undefined, hospitalSlug: string) {
  const loc = location ?? "미지정 구역";
  let building = "본관";
  if (loc.includes("신관")) building = "신관";
  else if (loc.includes("동관")) building = "동관";
  else if (hospitalSlug === "gangnam-severance") building = "암센터";

  let floor = "3층";
  if (/B1|b1/i.test(loc)) floor = "B1층";
  else if (loc.includes("1층")) floor = "1층";
  else if (loc.includes("중환자")) floor = "5층";
  else if (loc.toLowerCase().includes("cyclotron")) floor = "B1층";
  else if (loc.includes("영상의학")) floor = "2층";
  else if (loc.includes("방사선종양")) floor = "1층";
  else if (loc.includes("핵의학")) floor = "3층";

  const room = loc.replace(/\s*\([^)]*\)/g, "").trim() || loc;
  return { building, floor, room };
}

function imageUrlFromSeed(localPath?: string, remoteUrl?: string): string | null {
  if (localPath) {
    const filename = localPath.split("/").pop();
    if (filename) return `/api/seed-image/equipment/${encodeURIComponent(filename)}`;
  }
  return remoteUrl ?? null;
}

async function main() {
  const hospitals = JSON.parse(
    readFileSync(join(SEED_ROOT, "hospitals.json"), "utf8"),
  ) as { hospitals: SeedHospital[] };
  const equipment = JSON.parse(
    readFileSync(join(SEED_ROOT, "equipment.json"), "utf8"),
  ) as { equipment: SeedEquipment[] };
  const faqSeed = JSON.parse(
    readFileSync(join(SEED_ROOT, "faq.json"), "utf8"),
  ) as { faqItems: SeedFaqItem[] };

  const hospitalIdBySlug = new Map<string, string>();
  const interfaceTokenHash = hashIngestToken(DEV_INTERFACE_TOKEN);

  for (const h of hospitals.hospitals) {
    const row = await prisma.hospital.upsert({
      where: { slug: h.slug },
      create: {
        slug: h.slug,
        name: h.name,
        nameEn: h.nameEn,
        region: h.region,
        website: h.website,
        notes: h.notes,
        interfaceIngestTokenHash:
          h.slug === "asan" ? interfaceTokenHash : undefined,
      },
      update: {
        name: h.name,
        nameEn: h.nameEn,
        region: h.region,
        website: h.website,
        notes: h.notes,
        ...(h.slug === "asan"
          ? { interfaceIngestTokenHash: interfaceTokenHash }
          : {}),
      },
    });
    hospitalIdBySlug.set(h.slug, row.id);
  }

  for (const item of equipment.equipment) {
    const hospitalId = hospitalIdBySlug.get(item.hospitalSlug);
    if (!hospitalId) continue;

    const spatial = inferSpatial(item.location, item.hospitalSlug);

    await prisma.equipment.upsert({
      where: { equipmentSlug: item.equipmentSlug },
      create: {
        hospitalId,
        equipmentSlug: item.equipmentSlug,
        name: item.name,
        category: item.category,
        location: item.location,
        spatialBuilding: spatial.building,
        spatialFloor: spatial.floor,
        spatialRoom: spatial.room,
        manufacturer: item.manufacturer,
        model: item.model,
        manufacturedAt: item.manufacturedAt
          ? new Date(item.manufacturedAt)
          : undefined,
        statusSourceType: item.statusSourceType,
        statusSourceTypeReason: item.statusSourceTypeReason,
        statusResolvedFrom: item.statusSourceType,
        currentStatus: item.currentStatus,
        devProbeHost: item.devProbeHost ?? undefined,
        notes: item.notes ?? undefined,
        imageUrl: imageUrlFromSeed(item.image?.localPath, item.image?.remoteUrl),
        imageAlt: item.image?.alt ?? item.name,
      },
      update: {
        name: item.name,
        category: item.category,
        location: item.location,
        spatialBuilding: spatial.building,
        spatialFloor: spatial.floor,
        spatialRoom: spatial.room,
        manufacturer: item.manufacturer,
        model: item.model,
        manufacturedAt: item.manufacturedAt
          ? new Date(item.manufacturedAt)
          : undefined,
        statusSourceType: item.statusSourceType,
        statusSourceTypeReason: item.statusSourceTypeReason,
        currentStatus: item.currentStatus,
        devProbeHost: item.devProbeHost ?? undefined,
        notes: item.notes ?? undefined,
        imageUrl: imageUrlFromSeed(item.image?.localPath, item.image?.remoteUrl),
        imageAlt: item.image?.alt ?? item.name,
      },
    });
  }

  const asanHospitalId = hospitalIdBySlug.get("asan");
  if (asanHospitalId) {
    await prisma.equipment.upsert({
      where: { equipmentSlug: "asan-dr-ger-evita-ventilator-01" },
      create: {
        hospitalId: asanHospitalId,
        equipmentSlug: "asan-dr-ger-evita-ventilator-01",
        name: "Dräger Evita Ventilator",
        category: "VENTILATOR",
        statusSourceType: StatusSourceType.INTERFACE_VENDOR,
        fallbackSourceType: StatusSourceType.PING,
        vendorDeviceId: "ICU-VENT-01",
        vendorInterfaceType: VendorInterfaceType.PATIENT_MONITOR,
        statusSourceTypeReason:
          "Patient Monitor Interface 연동 · fallback PING",
        statusResolvedFrom: StatusSourceType.INTERFACE_VENDOR,
        currentStatus: EquipmentStatus.RUNNING,
        devProbeHost: "192.168.50.101",
        vendorLastEventAt: new Date(),
      },
      update: {
        statusSourceType: StatusSourceType.INTERFACE_VENDOR,
        fallbackSourceType: StatusSourceType.PING,
        vendorDeviceId: "ICU-VENT-01",
        vendorInterfaceType: VendorInterfaceType.PATIENT_MONITOR,
        statusSourceTypeReason:
          "Patient Monitor Interface 연동 · fallback PING",
        devProbeHost: "192.168.50.101",
        vendorLastEventAt: new Date(),
      },
    });
  }

  const demoManufacturedDates: Record<string, string> = {
    "asan-siemens-biograph-vision-600-pet-ct": "2022-03-15",
    "asan-ge-discovery-690-710-pet-ct": "2018-11-20",
    "asan-siemens-magnetom-skyra-3t-mri": "2019-06-01",
    "asan-siemens-magnetom-avanto-1-5t-mri": "2016-04-12",
    "asan-dr-ger-evita-ventilator-01": "2020-08-03",
    "asan-dr-ger-evita-ventilator-02": "2019-02-14",
    "asan-dr-ger-evita-ventilator-03": "2021-05-22",
    "asan-dr-ger-evita-ventilator-04": "2017-10-09",
    "asan-dr-ger-evita-ventilator-05": "2022-01-30",
    "asan-dr-ger-evita-ventilator-06": "2018-07-18",
    "asan-dr-ger-evita-ventilator-07": "2020-11-05",
    "asan-dr-ger-evita-ventilator-08": "2019-09-12",
    "asan-dr-ger-evita-ventilator-09": "2016-03-25",
    "asan-dr-ger-evita-ventilator-10": "2021-08-30",
  };
  for (const [slug, date] of Object.entries(demoManufacturedDates)) {
    await prisma.equipment.updateMany({
      where: { equipmentSlug: slug },
      data: { manufacturedAt: new Date(date) },
    });
  }

  const passwordHash = await hash(SEED_PASSWORD, 10);

  const platformHospital = await prisma.hospital.upsert({
    where: { slug: PLATFORM_HOSPITAL_SLUG },
    create: {
      slug: PLATFORM_HOSPITAL_SLUG,
      name: "MEM 플랫폼",
      notes: "시스템 운영자 전용",
    },
    update: { name: "MEM 플랫폼" },
  });

  await prisma.user.upsert({
    where: { email: "platform@mem.dev" },
    create: {
      email: "platform@mem.dev",
      name: "운영자",
      password: passwordHash,
      role: UserRole.PLATFORM_ADMIN,
      hospitalId: platformHospital.id,
    },
    update: {
      name: "운영자",
      password: passwordHash,
      role: UserRole.PLATFORM_ADMIN,
    },
  });

  let userCount = 1;
  for (const h of hospitals.hospitals) {
    const hospitalId = hospitalIdBySlug.get(h.slug);
    if (!hospitalId) continue;

    const adminEmail = `admin@${h.slug}.dev`;
    const userEmail = `user@${h.slug}.dev`;

    await prisma.user.upsert({
      where: { email: adminEmail },
      create: {
        email: adminEmail,
        name: "관리자",
        password: passwordHash,
        role: UserRole.HOSPITAL_ADMIN,
        hospitalId,
      },
      update: {
        name: "관리자",
        password: passwordHash,
        role: UserRole.HOSPITAL_ADMIN,
        hospitalId,
      },
    });
    userCount += 1;

    await prisma.user.upsert({
      where: { email: userEmail },
      create: {
        email: userEmail,
        name: "사용자",
        password: passwordHash,
        role: UserRole.HOSPITAL_USER,
        hospitalId,
      },
      update: {
        name: "사용자",
        password: passwordHash,
        role: UserRole.HOSPITAL_USER,
        hospitalId,
      },
    });
    userCount += 1;
  }

  const asanAdmin = await prisma.user.findUnique({
    where: { email: "admin@asan.dev" },
    select: { id: true },
  });
  if (asanHospitalId && asanAdmin) {
    await seedMaintenanceDemo(asanHospitalId, asanAdmin.id);
  }

  await seedFaqItems(hospitalIdBySlug, faqSeed.faqItems);

  console.log(
    `Seeded ${hospitals.hospitals.length} hospitals, ${equipment.equipment.length} equipment, ${userCount} users (password: ${SEED_PASSWORD})`,
  );
  console.log(
    `Seeded ${faqSeed.faqItems.length} FAQ items per hospital (${hospitals.hospitals.length} hospitals)`,
  );
  console.log(
    `Dev interface ingest: x-hospital-slug=asan x-interface-token=${DEV_INTERFACE_TOKEN}`,
  );

  await backfillCurrentStatusSinceAt();
  await backfillLastCheckedAt();
}

async function seedFaqItems(
  hospitalIdBySlug: Map<string, string>,
  items: SeedFaqItem[],
) {
  for (const [, hospitalId] of hospitalIdBySlug) {
    await prisma.faqItem.deleteMany({ where: { hospitalId } });
    for (const item of items) {
      await prisma.faqItem.create({
        data: {
          hospitalId,
          sortOrder: item.sortOrder,
          question: item.question,
          answer: item.answer,
          isPublished: item.isPublished ?? true,
        },
      });
    }
  }
}

async function seedMaintenanceDemo(hospitalId: string, adminUserId: string) {
  const pmMriItems = [
    { id: "pm-1", label: "냉각수 레벨 확인", required: true },
    { id: "pm-2", label: "그라디언트 코일 점검", required: true },
    { id: "pm-3", label: "안전 인터록 테스트", required: true },
  ];
  const pmCtItems = [
    { id: "pm-1", label: "X-ray 튜브 상태", required: true },
    { id: "pm-2", label: "테이블· gantry 윤활", required: true },
  ];

  const mriTemplate = await prisma.maintenanceChecklistTemplate.upsert({
    where: { id: "seed-asan-pm-mri" },
    create: {
      id: "seed-asan-pm-mri",
      hospitalId,
      name: "3T MRI 정기 PM",
      manufacturer: "Siemens",
      category: EquipmentCategory.MRI,
      maintenanceType: MaintenanceScheduleType.PM,
      items: pmMriItems,
    },
    update: {
      items: pmMriItems,
    },
  });

  await prisma.maintenanceChecklistTemplate.upsert({
    where: { id: "seed-asan-pm-pet-ct" },
    create: {
      id: "seed-asan-pm-pet-ct",
      hospitalId,
      name: "PET-CT 정기 PM",
      manufacturer: "GE",
      category: EquipmentCategory.CT,
      maintenanceType: MaintenanceScheduleType.PM,
      items: pmCtItems,
    },
    update: {
      items: pmCtItems,
    },
  });

  const equipmentRows = await prisma.equipment.findMany({
    where: {
      hospitalId,
      equipmentSlug: {
        in: [
          "asan-siemens-magnetom-skyra-3t-mri",
          "asan-ge-discovery-690-710-pet-ct",
        ],
      },
    },
    select: { id: true, equipmentSlug: true },
  });

  const in7Days = new Date();
  in7Days.setUTCDate(in7Days.getUTCDate() + 7);
  in7Days.setUTCHours(0, 0, 0, 0);

  const in30Days = new Date(in7Days);
  in30Days.setUTCDate(in30Days.getUTCDate() + 23);

  for (const eq of equipmentRows) {
    const templateId =
      eq.equipmentSlug.includes("mri") ? mriTemplate.id : "seed-asan-pm-pet-ct";
    const template = await prisma.maintenanceChecklistTemplate.findUnique({
      where: { id: templateId },
    });

    await prisma.maintenanceSchedule.deleteMany({
      where: { hospitalId, equipmentId: eq.id },
    });

    await prisma.maintenanceSchedule.create({
      data: {
        hospitalId,
        equipmentId: eq.id,
        maintenanceType: MaintenanceScheduleType.PM,
        status: MaintenanceScheduleStatus.SCHEDULED,
        scheduledDate: in7Days,
        assignedToUserId: adminUserId,
        checklistSnapshot: template?.items ?? undefined,
        recurrenceInterval: RecurrenceInterval.QUARTERLY,
        createdByUserId: adminUserId,
        notes: "데모 시드 일정",
      },
    });

    if (eq.equipmentSlug.includes("mri")) {
      await prisma.maintenanceSchedule.create({
        data: {
          hospitalId,
          equipmentId: eq.id,
          maintenanceType: MaintenanceScheduleType.CALIBRATION,
          status: MaintenanceScheduleStatus.SCHEDULED,
          scheduledDate: in30Days,
          createdByUserId: adminUserId,
          notes: "캘리브레이션 예정",
        },
      });
    }
  }

  for (const eq of equipmentRows) {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const next = await prisma.maintenanceSchedule.findFirst({
      where: {
        equipmentId: eq.id,
        status: {
          in: [
            MaintenanceScheduleStatus.SCHEDULED,
            MaintenanceScheduleStatus.IN_PROGRESS,
            MaintenanceScheduleStatus.OVERDUE,
          ],
        },
        scheduledDate: { gte: today },
      },
      orderBy: { scheduledDate: "asc" },
    });
    await prisma.equipment.update({
      where: { id: eq.id },
      data: {
        maintenanceStatus: next
          ? MaintenanceStatus.PM_SCHEDULED
          : MaintenanceStatus.NONE,
        pmScheduledAt: next?.scheduledDate ?? null,
      },
    });
  }
}

async function backfillLastCheckedAt() {
  const all = await prisma.equipment.findMany({
    select: { id: true, lastCheckedAt: true },
  });

  for (const eq of all) {
    if (eq.lastCheckedAt) continue;
    const latest = await prisma.healthCheckLog.findFirst({
      where: { equipmentId: eq.id },
      orderBy: { checkedAt: "desc" },
      select: { checkedAt: true },
    });
    if (!latest) continue;
    await prisma.equipment.update({
      where: { id: eq.id },
      data: { lastCheckedAt: latest.checkedAt },
    });
  }
}

async function backfillCurrentStatusSinceAt() {
  const all = await prisma.equipment.findMany({
    select: { id: true, currentStatus: true, createdAt: true },
  });

  for (const eq of all) {
    const logs = await prisma.healthCheckLog.findMany({
      where: { equipmentId: eq.id },
      orderBy: { checkedAt: "desc" },
      take: 200,
      select: { status: true, checkedAt: true },
    });

    let sinceAt = eq.createdAt;
    if (logs.length > 0) {
      sinceAt = logs[0].checkedAt;
      for (let i = 1; i < logs.length; i += 1) {
        if (logs[i].status !== eq.currentStatus) break;
        sinceAt = logs[i].checkedAt;
      }
    }

    await prisma.equipment.update({
      where: { id: eq.id },
      data: { currentStatusSinceAt: sinceAt },
    });
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
