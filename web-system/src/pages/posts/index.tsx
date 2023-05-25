import { GetStaticProps } from "next";
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import styles from "./styles.module.scss";

import {
  FiChevronLeft,
  FiChevronsLeft,
  FiChevronRight,
  FiChevronsRight,
} from "react-icons/fi";

import { getPrismicClient } from "@/services/prismic";
import Prismic from "@prismicio/client";
import { RichText } from "prismic-dom";
import { useState } from "react";

type Post = {
  slug: string;
  title: string;
  cover: string;
  description: string;
  updatedAt: string;
};

interface PostProps {
  posts: Post[];
  page: string;
  totalPage: string;
}

export default function Posts({
  posts: PostsBlog /**rename ssr variable */,
  page,
  totalPage,
}: PostProps) {
  const [posts, setPosts] = useState(PostsBlog || []);
  const [currentPage, setCurrentPage] = useState(Number(page));

  // get new posts
  async function reqPost(pageNumber: number) {
    const prismic = getPrismicClient();

    const res = await prismic.query(
      [Prismic.Predicates.at("document.type", "post")],
      {
        orderings: "[document.last_publication_date desc]", // order by desc
        fetch: ["post.title", "post.description", "post.cover"], // get only title, descripton etc..
        pageSize: 3, // quantity for page
        page: String(pageNumber), // transform to string because the interface postprops page is a string.
      }
    );

    return res;
  }

  async function navigatePage(pageNumber: number) {
    const res = await reqPost(pageNumber);

    if (res.results.length === 0) {
      return;
    }

    const getPosts = res.results.map((post) => {
      return {
        slug: post.uid ?? " ",
        title: RichText.asText(post.data.title),
        description:
          post.data.description.find(
            (content: { type: string }) => content.type === "paragraph"
          )?.text ?? "",
        cover: post.data.cover.url,
        updatedAt: new Date(
          post.last_publication_date as any
        ).toLocaleDateString("pt-BR", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        }),
      };
    });
    setCurrentPage(pageNumber);
    setPosts(getPosts);
  }

  return (
    <>
      <Head>
        <title>Blog | Sujeito Programador</title>
      </Head>
      <main className={styles.container}>
        <div className={styles.posts}>
          {posts.map((post) => (
            <Link key={post.slug} href={`/posts/${post.slug}`} legacyBehavior>
              <a key={post.slug}>
                <Image
                  src={post.cover}
                  alt={post.title}
                  width={720}
                  height={410}
                  quality={100}
                  placeholder="blur"
                  blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mO0trF5AQADCgGdQak6FwAAAABJRU5ErkJggg=="
                />

                <strong>{post.title}</strong>
                <time>{post.updatedAt}</time>
                <p>{post.description}</p>
              </a>
            </Link>
          ))}

          <div className={styles.buttonNavigate}>
            {Number(currentPage) >= 2 && (
              <div>
                <button onClick={() => navigatePage(1)}>
                  <FiChevronsLeft size={25} color="#FFF" />
                </button>
                <button onClick={() => navigatePage(Number(currentPage - 1))}>
                  <FiChevronLeft size={25} color="#FFF" />
                </button>
              </div>
            )}

            {Number(currentPage) < Number(totalPage) && (
              <div>
                <button onClick={() => navigatePage(Number(currentPage + 1))}>
                  <FiChevronRight size={25} color="#FFF" />
                </button>
                <button onClick={() => navigatePage(Number(totalPage))}>
                  <FiChevronsRight size={25} color="#FFF" />
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();

  const res = await prismic.query(
    [Prismic.Predicates.at("document.type", "post")],
    {
      orderings: "[document.last_publication_date desc]", // order by desc
      fetch: ["post.title", "post.description", "post.cover"], // get only title, descripton etc..
      pageSize: 3, // quantity for page
    }
  );

  const posts = res.results.map((post) => {
    return {
      slug: post.uid,
      title: RichText.asText(post.data.title),
      description:
        post.data.description.find(
          (content: { type: string }) => content.type === "paragraph"
        )?.text ?? "",
      cover: post.data.cover.url,
      updatedAt: new Date(post.last_publication_date as any).toLocaleDateString(
        "pt-BR",
        {
          day: "2-digit",
          month: "long",
          year: "numeric",
        }
      ),
    };
  });
  return {
    props: {
      posts,
      page: res.page,
      totalPage: res.total_pages,
    },
    revalidate: 60 * 30, // att in 30 min
  };
};
