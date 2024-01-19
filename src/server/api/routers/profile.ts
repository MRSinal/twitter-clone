import { clerkClient } from "@clerk/nextjs";
import { TRPCError } from "@trpc/server";
import type { User } from "node_modules/@clerk/nextjs/dist/types/server/clerkClient";
import { z } from "zod";
import { Ratelimit } from "@upstash/ratelimit"; // for deno: see above
import { Redis } from "@upstash/redis";
import { createTRPCRouter, privateProcedure, publicProcedure } from "~/server/api/trpc";
import { filterUserForClient } from "~/server/helpers/filterUserForClient";



export const profileRouter = createTRPCRouter({
  getUserByName: publicProcedure.input(z.object({username: z.string()})).query(async ({ input}) => {
    
    const [user] = await clerkClient.users.getUserList({username: [input.username]})
    if(!user) throw new TRPCError({code: "NOT_FOUND", message: "User not found"})
    return filterUserForClient(user);
  })
});
