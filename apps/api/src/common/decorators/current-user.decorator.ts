import { UserRole } from "@prisma/client";
import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import type { Request } from "express";

export type RequestUser = {
  id: string;
  email: string;
  role: UserRole;
  hospitalId: string;
};

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): RequestUser => {
    const request = ctx.switchToHttp().getRequest<Request>();
    const user = request.user;
    if (!user) {
      throw new Error("CurrentUser requires authenticated request");
    }
    return user;
  },
);
