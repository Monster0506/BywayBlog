import React, { useEffect, useState } from "react";
import { db } from "./firebase";
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";
import { formatDate, truncateContent, contentLimit } from "./utils";
import Navbar from "./Navbar";

const HomePage = () => {
  const [recentPost, setRecentPost] = useState(null);
  const [archivePosts, setArchivePosts] = useState([]);

  useEffect(() => {
    const fetchPosts = async () => {
      const postsCollection = collection(db, "posts");
      const q = query(postsCollection, orderBy("date", "desc"), limit(5));
      const querySnapshot = await getDocs(q);

      const posts = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const post = {
          ...data,
          date: data.date.toDate(), // Convert Firestore timestamp to JS Date
          id: doc.id,
        };
        posts.push(post);
      });

      if (posts.length > 0) {
        setRecentPost(posts[0]);
        setArchivePosts(posts.slice(1));
      }
    };

    fetchPosts();
  }, []);

  return (
    <div>
      <Navbar />
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-8 font-mono">
        <div className="w-full max-w-4xl mx-auto">
          {recentPost ? (
            <div className="bg-white p-8 rounded-lg shadow-lg mb-8 transition-transform transform hover:scale-105 hover:shadow-xl">
              <h1 className="text-3xl font-bold mb-4 text-indigo-700">
                {recentPost.title}
              </h1>
              <p className="text-gray-600 text-sm mb-4">
                {formatDate(recentPost.date)}
              </p>
              <div
                className="text-gray-800 leading-relaxed"
                dangerouslySetInnerHTML={{
                  __html: truncateContent(recentPost.content),
                }}
              />
              {recentPost.content.length > contentLimit && (
                <a
                  href={`/post/${recentPost.id}`}
                  className="text-indigo-500 hover:text-indigo-600 mt-4 inline-block"
                >
                  Read more
                </a>
              )}
            </div>
          ) : (
            <p className="text-center text-gray-500">Loading recent post...</p>
          )}

          {/* Archive Section */}
          <div className="bg-white p-8 rounded-lg shadow-lg transition-transform transform hover:scale-105 hover:shadow-xl">
            <h2 className="text-2xl font-bold mb-4 text-indigo-700">Archive</h2>
            <ul className="list-disc pl-5 space-y-2">
              {archivePosts.map((post) => (
                <li
                  key={post.id}
                  className="transition-all hover:text-indigo-500"
                >
                  <a
                    href={`/post/${post.id}`}
                    className="font-semibold text-gray-900"
                  >
                    {post.title}
                  </a>{" "}
                  -{" "}
                  <span className="text-gray-600">{formatDate(post.date)}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
