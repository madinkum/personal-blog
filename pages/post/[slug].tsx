import React, { useState } from "react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { sanityClient, urlFor } from "../../sanity";
import { Post } from "../../typings";
import { GetStaticProps } from "next";
import PortableText from "react-portable-text";
import { useForm, SubmitHandler } from "react-hook-form";

interface Props {
  post: Post;
}
type Inputs = {
  _id: string;
  name: string;
  email: string;
  comment: string;
};

const Post = ({ post }: Props) => {
    const [submitted, setsubmitted] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Inputs>();

  const onSubmit: SubmitHandler<Inputs> = (data) => {
    fetch("/api/createComment", {
      method: "POST",
      body: JSON.stringify(data),
    }).then(()=>{
     setsubmitted(true);
    }).catch((err)=>
    setsubmitted(false)
    )

  };

  return (
    <div>
      <Header />
      <div className="max-w-3xl mx-auto mb-10">
        <article className="w-full max-auto p-5">
          <h1 className="font-titleFont font-medium text-[32px] text-primary border-b-[1px] mt-10 mb-3">
            {post.title}
          </h1>
          <h2>{post.description}</h2>
          <div>
            <img
              className="rounded-full"
              w-2
              h-2
              object-cover
              src={urlFor(post.author.image).url()!}
              alt="author-img"
            />
            <p className="font-bodyFont text-base ">
              Blog post by <span>{post.author.name}</span>- Published at{" "}
              {new Date(post.publishedAt).toLocaleDateString()}
            </p>
          </div>
          <div className="mt-10">
            <PortableText
              dataset={process.env.NEXT_PUBLIC_SANITY_DATASEt || "production"}
              projectId={
                process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "dbfhkj94"
              }
              content={post.body}
            />
          </div>
        </article>
        <hr className="max-w-lg my-5 mx-auto border[1px]" />
        <div>
          <p className="text-xs uppercase font-titleFont font-bold">
            Enjoyed this article?
          </p>
          <h3 className="font-titleFont text-3xl font-bold">
            Leave a comment below
          </h3>
          <hr className="py-3 mt-2" />
          {/* Form Starts here */}

          {/* Generating Id for hooks form */}
          <input
            {...register("_id")}
            type="hidden"
            name="_id"
            value={post._id}
          />

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="mt-7 flex flex-col gap-6"
          >
            <label className="flex flex-col">
              <span className="font-titleFont font-semibold text-base">
                Name
              </span>
              <input
                {...register("name", { required: true })}
                className="text-base placeholder:text-sm border-b-[1px]
                  py-1 px-4 outline-none focus-within:shadow-xl"
                type="text"
                placeholder="Enter Your Name"
              />
            </label>
            <label className="flex flex-col">
              <span className="font-titleFont font-semibold text-base">
                Email
              </span>
              <input
                {...register("email", { required: true })}
                className="text-base placeholder:text-sm border-b-[1px]
                  py-1 px-4 outline-none focus-within:shadow-xl"
                type="text"
                placeholder="Enter your Email"
              />
            </label>
            <label className="flex flex-col">
              <span className="font-titleFont font-semibold text-base">
                Comment
              </span>
              <textarea
                {...register("comment", { required: true })}
                className="text-base placeholder:text-sm border-b-[1px]
                  py-1 px-4 outline-none focus-within:shadow-xl"
                placeholder="Enter your Comment"
                rows={6}
              />
              <button
                className="w-full bg-pink-500 text-white text-base font-titleFont font-semibold tracking-wider uppercase py-2 rounded-sm 
                hover:bg-pink-600 duration-300"
                type="submit"
              >
                Submit
              </button>
            </label>
          </form>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Post;
export const getStaticPaths = async () => {
  const query = `*[_type=="post"]{
        _id,
        slug{
            current
        }
    }`;
  const posts = await sanityClient.fetch(query);
  const paths = posts.map((post: Post) => ({
    params: {
      slug: post.slug.current,
    },
  }));
  return {
    paths,
    fallback: "blocking",
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const query = `*[_type == "post" && slug.current == $slug][0]{
        _id,
        publishedAt,
        title,
        author->{
            name,
            image,
        },
        description,
        mainImage,
        slug,
        body,
    }`;

  const post = await sanityClient.fetch(query, {
    slug: params?.slug,
  });
  if (!post) {
    return {
      notFound: true,
    };
  }
  return {
    props: {
      post,
    },
    revalidate: 60,
  };
};
