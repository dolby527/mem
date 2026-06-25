import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import type { HospitalScope } from "../hospital-scope.types";

export const HospitalCtx = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): HospitalScope => {
    const request = ctx.switchToHttp().getRequest<{ hospitalScope: HospitalScope }>();
    return request.hospitalScope;
  },
);
