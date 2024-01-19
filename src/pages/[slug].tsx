; import Head from "next/head";
import { LoadingPage } from "../components/Loading";
import React, { useState } from "react";
import zod from "zod";
import { api } from "~/utils/api";
import { createSSGHelpers } from '@trpc/react/ssg';
import { appRouter } from "~/server/api/root";
import { db } from "~/server/db";
import superjson from "superjson";
import { GetServerSidePropsContext, GetStaticProps, InferGetServerSidePropsType } from "next";
import { createServerSideHelpers } from '@trpc/react-query/server';
import Layout from "~/components/layout";
import Image from 'next/image'
type PageProps = InferGetServerSidePropsType<typeof getStaticProps>
export default function ProfilePage({ username }: PageProps) {
  const { data } = api.profile.getUserByName.useQuery({ username })

  if (!data) return <div>404</div>
  return (
    <>
      <Head>
        <title>{data.name}</title>
        <meta name="description" content="Twitter clone" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Layout>
        <div className=" border-slate-400 bg-slate-600 h-48 relative">
          <Image src={data.profilePicture} alt={`${data.name! ?? ""}`} width={128} height={128} 
          className="-mb-[64px] absolute bottom-0 left-0 ml-4 rounded-full border-black border-4"/>
          

        </div>
        <div className="h-[64px]"></div>
        <div className="p-5 text-2xl font-bold">{`@${data.name ?? ""} `}</div>
        <div className="border-b border-slate-400 w-full"></div>
      </Layout>
    </>
  )
}

export async function getStaticProps(context: GetServerSidePropsContext<{ slug: string }>,) {
  const ssg = createServerSideHelpers({
    router: appRouter,
    ctx: { db, userId: null },
    transformer: superjson,
  })

  const slug = context.params?.slug as string
  if (typeof slug !== "string") new Error("Slug is not a string")

  const username = slug.replace("@", "")
  await ssg.profile.getUserByName.prefetch({
    username,
  });


  return {
    props: {
      trpcState: ssg.dehydrate(),
      username,
    },
  }
}

export const getStaticPaths = () => {
  return {
    paths: [],
    fallback: "blocking",
  }
}