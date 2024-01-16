import { Input } from "@/components/ui/input";
import { SignInButton, SignOutButton, useUser } from "@clerk/nextjs";
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import { api } from "~/utils/api";
import type { RouterOutputs } from "~/utils/api";
import dayjs from "dayjs"
import { LoadingPage } from "../components/Loading";
import relativeTime from "dayjs/plugin/relativeTime";
import React, { useState } from "react";


dayjs.extend(relativeTime);

const CreatePostWizard = () => {
  const { user } = useUser();
  const [input, setInput] = useState<string>("")

  const ctx = api.useContext();
  const { mutate, isLoading: isPosting } = api.post.create.useMutation({
    onSuccess: () => {
      setInput("")
      void ctx.post.getAll.invalidate()
  }
});
  if (!user) return null;

  return (
    <div className="flex gap-4 w-full">
      <Image src={user.profileImageUrl} alt="Profile Image" className="w-16 h-16 rounded-full" width={64} height={64} />
      <input placeholder="Type some emojies....." 
      className="bg-transparent grow outline-none" 
      type = "text"
      value = {input}
      onChange={(e) => setInput(e.target.value)}
      disabled={isPosting}
      />
      <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold px-8 rounded " onClick={() => {
        mutate({ content: input })
        
      }}>Post</button>
    </div>
  )


}
type PostWithUser = RouterOutputs["post"]["getAll"][number]

const PostView = (props: PostWithUser) => {
  const { post, author } = props

  return (

    <div key={post.id} className="flex p-4 border-b border-slate-400 gap-3">
      <Image
        src={author.profilePicture} alt={`@${author.name}'s profile picture`} className="w-16 h-16 rounded-full" width={64}
        height={64}

      />
      <div className="flex flex-col text-slate-300 font-bold whitespace-pre">
        <div className="flex">
          <span >{`@${author.name}`}</span> · <span className="font-thin">{dayjs(post.createdAt).fromNow()}</span>
        </div>
        <span className="text-2xl">{post.content}</span>
      </div>

    </div>

  )
}

const Feed = () => {
  const { data, isLoading: postsLoading } = api.post.getAll.useQuery();

  if (postsLoading) return <LoadingPage />;
  if (!data) return <div>No posts</div>
  return (
    <div className="flex flex-col">
      {data.map((fullPost) => (
        <PostView {...fullPost} key={fullPost.post.id} />
      ))}
    </div>
    
)}
export default function Home() {
  const {isLoaded: userLoaded, isSignedIn } = useUser();
  // Uses cache 
  api.post.getAll.useQuery();
  // return empty div if user is not loaded
  if (!userLoaded) return <div/>




  return (
    <>
      <Head>
        <title>Twitter Clone</title>
        <meta name="description" content="Twitter clone" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex justify-center h-screen">
        <div className="w-full md:max-w-2xl border-x border-slate-400 ">
          <div className="border-b border-slate-400 p-4 flex">
            {!isSignedIn && <div className="flex justify-center"><SignInButton /></div>}
            {isSignedIn && <CreatePostWizard />}
          </div>

          <Feed />
        </div>

      </main>
    </>
  )
}
