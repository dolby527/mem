import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { join } from "node:path";
import { AuthModule } from "./auth/auth.module";
import { EquipmentModule } from "./equipment/equipment.module";
import { FaqModule } from "./faq/faq.module";
import { HospitalsModule } from "./hospitals/hospitals.module";
import { InviteModule } from "./invite/invite.module";
import { MaintenanceModule } from "./maintenance/maintenance.module";
import { MonitoringModule } from "./monitoring/monitoring.module";
import { PrismaModule } from "./prisma/prisma.module";
import { UsersModule } from "./users/users.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [
        join(process.cwd(), "env/.env.development"),
        join(process.cwd(), "env/.env"),
      ],
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    InviteModule,
    HospitalsModule,
    EquipmentModule,
    FaqModule,
    MaintenanceModule,
    MonitoringModule,
  ],
})
export class AppModule {}
