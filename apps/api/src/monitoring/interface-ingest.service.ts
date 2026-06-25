import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import {
  StatusSourceType,
  VendorInterfaceType,
} from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { InterfaceEventDto } from "./dto/interface-event.dto";
import { StatusEngineService } from "./status-engine.service";
import { mapVendorEventToStatus } from "./vendor-event-mapping";

@Injectable()
export class InterfaceIngestService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly statusEngine: StatusEngineService,
  ) {}

  async ingestEvents(hospitalId: string, events: InterfaceEventDto[]) {
    const results = [];
    for (const event of events) {
      results.push(await this.ingestOne(hospitalId, event));
    }
    return { processed: results.length, results };
  }

  private async ingestOne(hospitalId: string, event: InterfaceEventDto) {
    const equipment = await this.prisma.equipment.findFirst({
      where: {
        hospitalId,
        vendorDeviceId: event.vendorDeviceId,
      },
    });
    if (!equipment) {
      throw new NotFoundException(
        `vendorDeviceId not mapped: ${event.vendorDeviceId}`,
      );
    }

    const vendorType =
      event.vendorInterfaceType ??
      equipment.vendorInterfaceType ??
      VendorInterfaceType.OTHER;
    const nextStatus = mapVendorEventToStatus(event.eventType, vendorType);
    if (!nextStatus) {
      throw new BadRequestException(
        `알 수 없는 eventType: ${event.eventType}`,
      );
    }

    const occurredAt = event.occurredAt
      ? new Date(event.occurredAt)
      : new Date();

    return this.statusEngine.applyStatus({
      equipment,
      nextStatus,
      sourceType: StatusSourceType.INTERFACE_VENDOR,
      checkedAt: occurredAt,
      errorMessage: event.message ?? event.vendorStatusCode ?? null,
      vendorLastEventAt: occurredAt,
    });
  }
}
