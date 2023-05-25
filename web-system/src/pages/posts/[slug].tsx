import { GetServerSideProps } from "next";
import styles from "./post.module.scss";

import { getPrismicClient } from "@/services/prismic";
import Prismic from "@prismicio/client";
import { RichText } from "prismic-dom";

import Head from "next/head";
import Image from "next/image";

import { ParsedUrlQuery } from "querystring";



interface PostProps {
  post: {
    slug: string;
    title: string;
    description: string;
    cover: string;
    updatedAt: string;
  };
}

export default function Post({ post }: PostProps) {
  return (
    <>
      <Head>
        <title>{post.title}</title>
      </Head>

      <main className={styles.container}>
        <article className={styles.post}>
          <Image
            src={post.cover}
            width={720}
            height={410}
            alt={post.title}
            placeholder="blur"
            blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mO0trF5AQADCgGdQak6FwAAAABJRU5ErkJggg=="
          />
          <h1>{post.title}</h1>
          <time>{post.updatedAt}</time>
          {/* insert RichText.asHtml from ssr in the div */}
          <div className={styles.postContent} dangerouslySetInnerHTML={{__html: post.description}}></div> 
        </article>
      </main>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async ({
  req,
  params,
}) => {
  const { slug } = params as any;
  const prismic = getPrismicClient(req);

  const res = await prismic.getByUID("post", String(slug), {});

  if (!res) {
    return {
      redirect: {
        destination: "/posts",
        permanent: false,
      },
    };
  }

  const post = {
    slug: slug,
    title: RichText.asText(res.data.title),
    description: RichText.asHtml(res.data.description),
    cover: res.data.cover.url,
    updatedAt: new Date(res.last_publication_date as string).toLocaleDateString(
      "pt-BR",
      {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }
    ),
  };

  return {
    props: {
      post,
    },
  };
};
