import { GetStaticPaths, GetStaticProps } from 'next';

import Head from 'next/head';

import { getPrismicClient } from 'services/prismic';

import Prismic from '@prismicio/client';

import { FiCalendar, FiUser, FiClock } from 'react-icons/fi';

import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

import commonStyles from 'styles/common.module.scss';
import styles from './post.module.scss';

interface Post {
  first_publication_date: string | null;
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
}

export default function Post({ post }: PostProps) {
  return (
    <>
      <Head>
        <title>{post.data.title} | Ignews</title>
      </Head>

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
                <FiCalendar /> {post.first_publication_date}
              </time>
              <span>
                <FiUser /> {post.data.author}
              </span>
              <span>
                <FiClock /> 4 min
              </span>
            </div>

            <div className={styles.content}>
              {post.data.content.map(content => (
                <section key={content.heading}>
                  <h1>{content.heading}</h1>
                  {content.body.map(body => (
                    <p>{body.text}</p>
                  ))}
                </section>
              ))}
            </div>
          </article>
        </main>
      </div>
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

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { slug } = params;

  const prismic = getPrismicClient();
  const response = await prismic.getByUID('posts', String(slug), {});

  const post: Post = {
    first_publication_date: format(
      new Date(response.first_publication_date),
      'd MMM yyyy',
      {
        locale: ptBR,
      }
    ),
    data: {
      title: response.data.title,
      banner: {
        url: response.data.banner.url,
      },
      author: response.data.author,
      content: response.data.content.map(content => ({
        heading: content.heading,
        body: content.body.map(body => ({
          text: body.text,
        })),
      })),
    },
  };

  return {
    props: {
      post,
    },
  };
};
