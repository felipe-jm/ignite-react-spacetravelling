import { GetStaticPaths, GetStaticProps } from 'next';
import { useRouter } from 'next/router';

import Link from 'next/link';

import Head from 'next/head';

import Prismic from '@prismicio/client';
import { RichText } from 'prismic-dom';

import { FiCalendar, FiUser, FiClock } from 'react-icons/fi';

import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

import { getPrismicClient } from '../../services/prismic';

import Header from '../../components/Header';
import UtteranceComments from '../../components/UtteranceComments';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

interface Post {
  first_publication_date: string | null;
  last_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
  preview?: boolean;
}

export default function Post({ post, preview }: PostProps) {
  const router = useRouter();

  if (router.isFallback) {
    return <p>Carregando...</p>;
  }

  function calculateReadingTime() {
    const bodiesText = post.data.content.reduce(
      (acc, curr) => `${acc} ${RichText.asText(curr.body)}`,
      ''
    );

    const headingsText = post.data.content.reduce(
      (acc, curr) => `${acc} ${curr.heading}`,
      ''
    );

    const fullText = `${bodiesText} ${headingsText}`;

    const totalWords = fullText.split(' ').length;

    const readingTime = Math.ceil(totalWords / 200);

    return readingTime;
  }

  return (
    <>
      <Head>
        <title>{post.data.title} | Ignews</title>
      </Head>

      <Header />

      <div>
        <img
          className={styles.banner}
          src={post.data.banner.url}
          alt="Banner"
        />

        <main className={commonStyles.container}>
          <article className={styles.post}>
            <h1>{post.data.title}</h1>
            <div>
              <time>
                <FiCalendar />{' '}
                {format(new Date(post.first_publication_date), 'd MMM yyyy', {
                  locale: ptBR,
                })}
              </time>
              <span>
                <FiUser /> {post.data.author}
              </span>
              <span>
                <FiClock /> {calculateReadingTime()} min
              </span>
            </div>
            <small>
              {format(
                new Date(post.last_publication_date),
                "'* editado em' d MMM yyyy', às 'H:m",
                {
                  locale: ptBR,
                }
              )}
            </small>

            <div className={styles.content}>
              {post.data.content.map(content => (
                <section key={content.heading}>
                  <h2>{content.heading}</h2>
                  {content.body.map(body => (
                    <p key={body.text}>{body.text}</p>
                  ))}
                </section>
              ))}
            </div>
          </article>

          {preview && (
            <aside className={commonStyles.previewButton}>
              <Link href="/api/exit-preview">
                <a>Sair do modo Preview</a>
              </Link>
            </aside>
          )}
        </main>
      </div>

      <UtteranceComments />
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const posts = await prismic.query(
    [Prismic.predicates.at('document.type', 'posts')],
    {
      fetch: ['posts.uid'],
      pageSize: 5,
    }
  );

  const paths = posts.results.map(({ uid }) => ({
    params: { slug: uid },
  }));

  return { paths, fallback: true };
};

export const getStaticProps: GetStaticProps = async ({
  params,
  preview = false,
  previewData,
}) => {
  const { slug } = params;

  const prismic = getPrismicClient();
  const response = await prismic.getByUID('posts', String(slug), {
    ref: previewData?.ref ?? null,
  });

  const post: Post = {
    ...response,
    data: response.data,
    first_publication_date: response.first_publication_date,
    last_publication_date: response.last_publication_date,
  };

  return {
    props: {
      post,
      preview,
    },
  };
};
