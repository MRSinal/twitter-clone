import { SignInButton, SignOutButton, useUser } from "@clerk/nextjs";
import Image from "next/image";
import { api } from "~/utils/api";
import dayjs from "dayjs"
import { LoadingPage } from "../components/Loading";
import relativeTime from "dayjs/plugin/relativeTime";
import React, { useState } from "react";
import toast from "react-hot-toast";
import zod from "zod";
import Layout from "~/components/layout";
import { PostView } from "~/components/postview";
dayjs.extend(relativeTime);

const CreatePostWizard = () => {
  const { user } = useUser();
  const [input, setInput] = useState<string>("")

  const ctx = api.useContext();
  const { mutate, isLoading: isPosting } = api.post.create.useMutation({
    onSuccess: () => {
      setInput("")
      void ctx.post.getAll.invalidate()
  },
  onError: (e) => {
    const errorMessage = e.data?.zodError?.fieldErrors.content
    if (errorMessage && errorMessage[0]) {
      toast.error(errorMessage[0])
    }
    else {
      toast.error("An error occured")
    }
  },
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
      
      onKeyDown={(e) => {
        
        if (e.key === "Enter") {
          e.preventDefault()
          if (input !== ""){
            mutate({ content: input })
          }
        }
      }}
      disabled={isPosting}
      />
      {input !== "" && !isPosting && (<button className="bg-blue-500 hover:bg-blue-700 text-white font-bold px-8 rounded"
       onClick={() => mutate({ content: input })}>
        Post</button>)}

        {isPosting && (<div className="flex flex-col">
          <LoadingPage/>
        </div>)
        }
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
    <Layout>
          <div className="border-b border-slate-400 p-4 flex">
            {!isSignedIn && <div className="flex justify-center"><SignInButton /></div>}
            {isSignedIn && <CreatePostWizard />}
          </div>
          <Feed />
    </Layout>
  )
}
