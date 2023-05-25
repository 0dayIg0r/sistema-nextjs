import { GetStaticProps } from "next";
import { getPrismicClient } from "@/services/prismic";
import { RichText } from "prismic-dom";
import Prismic from "@prismicio/client";
import Head from "next/head";

import styles from "./styles.module.scss";

import {FaInstagram, FaFacebook, FaLinkedin} from 'react-icons/fa'

type Content = {
  title: string;
  description: string;
  banner: string;
  facebook: string;
  instagram: string;
  linkedin: string;
};

interface ContentProps {
  content: Content;
}

export default function About({ content }: ContentProps) {
  return (
    <>
    <Head>
      <title>Quem somos? | Sujeito Programador</title>
    </Head>
    <main className={styles.container}>
      <div className={styles.containerHeader}>
        <section className={styles.ctaText}>
          <h1>{content.title}</h1>
          <p>{content.description}</p>


          <a href={content.instagram}>
            <FaInstagram size={40} />
          </a>

          <a href={content.facebook}>
            <FaFacebook size={40} />
          </a>

          <a href={content.linkedin}>
            <FaLinkedin size={40} />
          </a>
        </section>

        <img
          src={content.banner}
          alt="Sobre Sujeito Programador"
        />

      </div>
    </main>
  </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();

  const res = await prismic.query([
    Prismic.Predicates.at("document.type", "about"),
  ]);

  const { title, description, banner, facebook, instagram, youtube, linkedin } =
    res.results[0].data;

  const content = {
    title: RichText.asText(title),
    description: RichText.asText(description),
    banner: banner.url,
    facebook: facebook.url,
    instagram: instagram.url,
    linkedin: linkedin.url,
  };

  return {
    props: {
      content,
    },
    revalidate: 60 * 30 // 30 min 
  };
};
