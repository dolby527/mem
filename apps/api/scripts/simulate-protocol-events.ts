/**
 * HL7/DICOM(MEDICAL_PROTOCOL) 개발용 시뮬레이터.
 * 정규화 전 단계의 "벤더 이벤트"를 interface ingest API로 전송합니다.
 *
 * Usage: pnpm sim:protocol -- --help
 */
import { PrismaClient, VendorInterfaceType } from "@prisma/client";

const DEFAULT_API_URL = "http://localhost:3001";
const DEFAULT_HOSPITAL = "asan";
const DEFAULT_TOKEN = "asan-interface-dev-token";

type ScenarioName = "exam" | "study" | "fault" | "offline" | "reconnect" | "cycle";

interface SimStep {
  eventType: string;
  message?: string;
  vendorStatusCode?: string;
  delayMs: number;
}

interface CliOptions {
  apiUrl: string;
  hospitalSlug: string;
  interfaceToken: string;
  vendorDeviceId: string | null;
  equipmentSlug: string | null;
  vendorInterfaceType: VendorInterfaceType;
  scenario: ScenarioName;
  singleEvent: string | null;
  intervalMs: number;
  once: boolean;
  dryRun: boolean;
  help: boolean;
}

const VENDOR_TYPES = new Set<string>([
  "PATIENT_MONITOR",
  "EKG",
  "OUTPATIENT",
  "LIS",
  "OTHER",
]);

function printHelp() {
  console.log(`
MEM protocol / interface event simulator (dev)

Sends vendor events to POST /monitoring/ingest/interface/events
(same path as INTERFACE_VENDOR · future MEDICAL_PROTOCOL normalizer target).

Options:
  --api-url <url>           API base (default: ${DEFAULT_API_URL})
  --hospital <slug>         x-hospital-slug (default: ${DEFAULT_HOSPITAL})
  --token <token>           x-interface-token (default: seed dev token)
  --vendor-device-id <id>   Hospital-scoped vendor device id (required*)
  --equipment-slug <slug>   Resolve vendorDeviceId from DB (*one required)
  --vendor-type <type>      PATIENT_MONITOR | LIS | EKG | OUTPATIENT | OTHER
  --scenario <name>         exam | study | fault | offline | reconnect | cycle
  --event <eventType>       Send a single event (implies --once)
  --interval-ms <n>         Delay between steps (default: 5000)
  --once                    Run scenario once and exit (default for non-cycle)
  --dry-run                 Print payloads only
  --help                    Show this help

Examples:
  pnpm sim:protocol -- --equipment-slug asan-dr-ger-evita-ventilator-01 --scenario exam
  pnpm sim:protocol -- --vendor-device-id ICU-VENT-01 --event EXAM_STARTED
  pnpm sim:protocol -- --vendor-device-id ICU-VENT-01 --scenario cycle --interval-ms 8000

Seed reference (asan):
  equipment: asan-dr-ger-evita-ventilator-01
  vendorDeviceId: ICU-VENT-01
  token: ${DEFAULT_TOKEN}
`);
}

function parseArgs(argv: string[]): CliOptions {
  const opts: CliOptions = {
    apiUrl: DEFAULT_API_URL,
    hospitalSlug: DEFAULT_HOSPITAL,
    interfaceToken: DEFAULT_TOKEN,
    vendorDeviceId: null,
    equipmentSlug: null,
    vendorInterfaceType: VendorInterfaceType.PATIENT_MONITOR,
    scenario: "exam",
    singleEvent: null,
    intervalMs: 5000,
    once: false,
    dryRun: false,
    help: false,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--") continue;
    const next = argv[i + 1];
    switch (arg) {
      case "--help":
      case "-h":
        opts.help = true;
        break;
      case "--api-url":
        opts.apiUrl = next ?? opts.apiUrl;
        i += 1;
        break;
      case "--hospital":
        opts.hospitalSlug = next ?? opts.hospitalSlug;
        i += 1;
        break;
      case "--token":
        opts.interfaceToken = next ?? opts.interfaceToken;
        i += 1;
        break;
      case "--vendor-device-id":
        opts.vendorDeviceId = next ?? null;
        i += 1;
        break;
      case "--equipment-slug":
        opts.equipmentSlug = next ?? null;
        i += 1;
        break;
      case "--vendor-type":
        if (next && VENDOR_TYPES.has(next)) {
          opts.vendorInterfaceType = next as VendorInterfaceType;
        } else {
          throw new Error(`Invalid --vendor-type: ${next}`);
        }
        i += 1;
        break;
      case "--scenario":
        opts.scenario = (next ?? opts.scenario) as ScenarioName;
        i += 1;
        break;
      case "--event":
        opts.singleEvent = next ?? null;
        i += 1;
        break;
      case "--interval-ms":
        opts.intervalMs = Number.parseInt(next ?? "", 10) || opts.intervalMs;
        i += 1;
        break;
      case "--once":
        opts.once = true;
        break;
      case "--dry-run":
        opts.dryRun = true;
        break;
      default:
        if (arg.startsWith("-")) {
          throw new Error(`Unknown option: ${arg}`);
        }
    }
  }

  if (opts.singleEvent) {
    opts.once = true;
  }
  if (opts.scenario !== "cycle") {
    opts.once = opts.once || true;
  } else {
    opts.once = false;
  }

  return opts;
}

function scenarioSteps(name: ScenarioName, intervalMs: number): SimStep[] {
  switch (name) {
    case "study":
      return [
        { eventType: "STUDY_STARTED", message: "sim: study started", delayMs: 0 },
        {
          eventType: "STUDY_COMPLETED",
          message: "sim: study completed",
          delayMs: intervalMs,
        },
      ];
    case "fault":
      return [
        { eventType: "EXAM_STARTED", message: "sim: exam started", delayMs: 0 },
        {
          eventType: "ERROR",
          message: "sim: device alarm",
          vendorStatusCode: "HW_ALARM",
          delayMs: intervalMs,
        },
      ];
    case "offline":
      return [
        {
          eventType: "DISCONNECTED",
          message: "sim: link down",
          delayMs: 0,
        },
      ];
    case "reconnect":
      return [
        {
          eventType: "DISCONNECTED",
          message: "sim: link down",
          delayMs: 0,
        },
        {
          eventType: "CONNECTED",
          message: "sim: link restored",
          delayMs: intervalMs,
        },
      ];
    case "cycle":
    case "exam":
    default:
      return [
        { eventType: "EXAM_STARTED", message: "sim: exam started", delayMs: 0 },
        {
          eventType: "EXAM_COMPLETED",
          message: "sim: exam completed",
          delayMs: intervalMs,
        },
      ];
  }
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function resolveVendorDeviceId(
  prisma: PrismaClient,
  opts: CliOptions,
): Promise<string> {
  if (opts.vendorDeviceId?.trim()) {
    return opts.vendorDeviceId.trim();
  }
  if (!opts.equipmentSlug?.trim()) {
    throw new Error("--vendor-device-id 또는 --equipment-slug 가 필요합니다.");
  }

  const equipment = await prisma.equipment.findFirst({
    where: {
      equipmentSlug: opts.equipmentSlug.trim(),
      hospital: { slug: opts.hospitalSlug },
    },
    select: {
      vendorDeviceId: true,
      vendorInterfaceType: true,
      name: true,
    },
  });

  if (!equipment?.vendorDeviceId) {
    throw new Error(
      `장비를 찾을 수 없거나 vendorDeviceId가 없습니다: ${opts.equipmentSlug}`,
    );
  }

  if (equipment.vendorInterfaceType) {
    opts.vendorInterfaceType = equipment.vendorInterfaceType;
  }

  console.log(
    `Resolved ${opts.equipmentSlug} → vendorDeviceId=${equipment.vendorDeviceId} (${equipment.name})`,
  );
  return equipment.vendorDeviceId;
}

async function postEvent(
  opts: CliOptions,
  vendorDeviceId: string,
  step: SimStep,
): Promise<void> {
  const body = {
    vendorDeviceId,
    eventType: step.eventType,
    vendorInterfaceType: opts.vendorInterfaceType,
    occurredAt: new Date().toISOString(),
    message: step.message,
    vendorStatusCode: step.vendorStatusCode,
  };

  const url = `${opts.apiUrl.replace(/\/$/, "")}/monitoring/ingest/interface/events`;
  console.log(`→ ${step.eventType} (${vendorDeviceId})`);

  if (opts.dryRun) {
    console.log(JSON.stringify(body, null, 2));
    return;
  }

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-hospital-slug": opts.hospitalSlug,
      "x-interface-token": opts.interfaceToken,
    },
    body: JSON.stringify(body),
  });

  const text = await response.text();
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${text}`);
  }

  console.log(`  OK ${text}`);
}

async function runScenarioOnce(
  opts: CliOptions,
  vendorDeviceId: string,
  steps: SimStep[],
) {
  for (const step of steps) {
    if (step.delayMs > 0) {
      await sleep(step.delayMs);
    }
    await postEvent(opts, vendorDeviceId, step);
  }
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  if (opts.help) {
    printHelp();
    return;
  }

  const prisma = new PrismaClient();
  try {
    const vendorDeviceId = await resolveVendorDeviceId(prisma, opts);
    const steps = opts.singleEvent
      ? [{ eventType: opts.singleEvent, message: "sim: single event", delayMs: 0 }]
      : scenarioSteps(opts.scenario, opts.intervalMs);

    console.log(
      `Simulator → ${opts.apiUrl} · hospital=${opts.hospitalSlug} · scenario=${opts.singleEvent ?? opts.scenario}`,
    );

    if (opts.scenario === "cycle" && !opts.singleEvent) {
      console.log("Cycle mode (Ctrl+C to stop)…");
      while (true) {
        await runScenarioOnce(opts, vendorDeviceId, steps);
        await sleep(opts.intervalMs);
      }
    }

    await runScenarioOnce(opts, vendorDeviceId, steps);
    console.log("Done.");
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
