import { z } from "zod";
import { issueAdministratorPasswordSession, hasAdministratorPasswordSession, verifyAdministratorPassword } from "../adminPassword";
import { ownerProcedure, router } from "../_core/trpc";
import { TRPCError } from "@trpc/server";

export const adminAccessRouter = router({
  status: ownerProcedure.query(({ ctx }) => ({ unlocked: hasAdministratorPasswordSession(ctx.req, ctx.user!.openId) })),
  verifyPassword: ownerProcedure.input(z.object({ password: z.string().min(1).max(256) })).mutation(({ ctx, input }) => {
    if (!verifyAdministratorPassword(input.password)) throw new TRPCError({ code: "FORBIDDEN", message: "관리자 비밀번호가 올바르지 않습니다." });
    issueAdministratorPasswordSession(ctx.req, ctx.res, ctx.user!.openId);
    return { unlocked: true } as const;
  }),
});
