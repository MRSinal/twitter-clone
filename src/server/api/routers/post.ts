import { clerkClient } from "@clerk/nextjs";
import { TRPCError } from "@trpc/server";
import type { User } from "node_modules/@clerk/nextjs/dist/types/server/clerkClient";
import { z } from "zod";
import { Ratelimit } from "@upstash/ratelimit"; // for deno: see above
import { Redis } from "@upstash/redis";
import { createTRPCRouter, privateProcedure, publicProcedure } from "~/server/api/trpc";
import type { Post } from "@prisma/client";
const addUserDataToPost = async (posts: Post[]) => {
  const users = (await clerkClient.users.getUserList({
    userId: posts.map((post) => post.authorId),
    limit: 100,
  })).map(filterUserForClient)

  return posts.map(post =>{ 
    const author = users.find(user => user.id === post.authorId)

    if(!author?.name) throw new TRPCError({code : "INTERNAL_SERVER_ERROR",
    message: "Author not found"})
    return{
      post,
      author: {
        ...author,
        name: author?.name
      },
    }
  })
}
const filterUserForClient = (user: User) => {
  return {id: user.id, name: user.username, profilePicture: user.profileImageUrl}
}
const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(3, "1 m"),
  analytics: true,
  prefix: "@upstash/ratelimit",
});
export const postRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    const posts= await ctx.db.post.findMany({
      take: 100,
      orderBy: [{createdAt: "desc"}]

    });
    return addUserDataToPost(posts)
  }),

  getPostsByUserId: publicProcedure
  .input(
    z.object({
      userId: z.string()
    })
    ).query( async({ ctx, input }) => {const posts = await ctx.db.post.findMany({
      where: {
        authorId: input.userId,
      },
      take: 100,
      orderBy: [{createdAt: "desc"}]
    });
    return addUserDataToPost(posts);
  }),
  create: privateProcedure.input(z.object({
    content: z.string().emoji("Only Emojis💀").min(1).max(280),
  })
  ).mutation(async ({ ctx, input }) => {
    const authorId = ctx.userId
    const {success} = await ratelimit.limit(authorId!)

    if(!success) throw new TRPCError({code: "TOO_MANY_REQUESTS", message: "You are posting too much. Please try again later."})

    const post = await ctx.db.post.create({
      data: {
        authorId: authorId!,
        content: input.content,
      },
    });
    return post
  }),
});
