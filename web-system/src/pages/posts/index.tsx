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

import thumb from "../../../public/images/thumb.png";

import { getPrismicClient } from "@/services/prismic";
import Prismic from "@prismicio/client";
import { RichText } from "prismic-dom";

type Post = {
  slug: string;
  title: string;
  description: string;
  updatedAt: string;
};

interface PostProps {
  posts: Post[];
}

export default function Posts({ posts }: PostProps) {
  
  return (
    <>
      <Head>
        <title>Blog | Sujeito Programador</title>
      </Head>
      <main className={styles.container}>
        <div className={styles.posts}>
          <Link href="/" legacyBehavior>
            <a>
              <Image src={thumb} alt="t1" width={720} quality={100} />

              <strong>Criando meu primeiro aplicativo</strong>
              <time>14 MAIO 2023</time>
              <p>
                Hoje vamos criar o controle de mostrar a senha no input, uma
                opção para os nossos formulários de cadastro e login. Mas chega
                de conversa e bora pro código junto comigo que o vídeo está show
                de bola!
              </p>
            </a>
          </Link>

          <div className={styles.buttonNavigate}>
            <div>
              <button>
                <FiChevronsLeft size={25} color="#FFF" />
              </button>
              <button>
                <FiChevronLeft size={25} color="#FFF" />
              </button>
            </div>

            <div>
              <button>
                <FiChevronRight size={25} color="#FFF" />
              </button>
              <button>
                <FiChevronsRight size={25} color="#FFF" />
              </button>
            </div>
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
    },
    revalidate: 60 * 30, // att in 30 min
  };
};
