import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import { api } from "~/utils/api";
import type { RouterOutputs } from "~/utils/api";
import dayjs from "dayjs"
import React, { useState } from "react";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);
type PostWithUser = RouterOutputs["post"]["getAll"][number]

export const PostView = (props: PostWithUser) => {
  const { post, author } = props

  return (

    <div key={post.id} className="flex p-4 border-b border-slate-400 gap-3">
      <Image
        src={author.profilePicture} alt={`@${author.name}'s profile picture`} className="w-16 h-16 rounded-full" width={64}
        height={64}

      />
      <div className="flex flex-col text-slate-300 font-bold whitespace-pre">
        <div className="flex">
          <Link href={`/@${author.name}`}>
            <span >{`@${author.name}`}</span>
          </Link>
          <Link href={`/post/${post.id}`}>
            <span className="font-thin">{` · ${dayjs(post.createdAt).fromNow()}`}</span>
          </Link>
        </div>
        <span className="text-2xl">{post.content}</span>
      </div>

    </div>

  )
}