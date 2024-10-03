import React, { useEffect, useState } from "react";
import { db } from "./firebase";
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";
import { formatDate, truncateContent } from "./utils";
import Navbar from "./Navbar";
import Footer from "./Footer";

const HomePage = () => {
  const [recentPosts, setRecentPosts] = useState([]); // Store the three most recent posts
  const [archivePosts, setArchivePosts] = useState([]);

  useEffect(() => {
    const fetchPosts = async () => {
      const postsCollection = collection(db, "posts");
      const q = query(postsCollection, orderBy("date", "desc"), limit(5));
      const querySnapshot = await getDocs(q);

      const posts = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        // Only include posts that are not drafts
        if (!data.draft) {
          const post = {
            ...data,
            date: data.date.toDate(), // Convert Firestore timestamp to JS Date
            id: doc.id,
          };
          posts.push(post);
        }
      });

      // Set the three most recent posts
      setRecentPosts(posts.slice(0, 3));
      // Set the remaining posts for the archive
      setArchivePosts(posts.slice(3));
    };

    fetchPosts();
  }, []);

  return (
    <div className="custom-vertical-gradient">
      <Navbar />
      <div className="custom-vertical-gradient min-h-screen flex items-center justify-center p-8 font-mono ">
        <div className="w-full max-w-4xl mx-auto relative z-10">
          {/* Render the three most recent posts */}
          {recentPosts.length > 0 ? (
            recentPosts.map((post) => (
              <div
                key={post.id}
                className="bg-white p-8 rounded-lg shadow-lg mb-8 transition-transform transform hover:scale-105 hover:shadow-xl"
              >
                <h1 className="text-3xl font-bold mb-4 text-custom-green">
                  {post.title}
                </h1>
                <p className="text-gray-600 text-sm mb-4">
                  {formatDate(post.date)}
                </p>
                <div
                  className="text-gray-800 leading-relaxed"
                  dangerouslySetInnerHTML={{
                    __html: truncateContent(post.content),
                  }}
                />
                <a
                  href={`/post/${post.id}`}
                  className="text-custom-green hover:text-custom-green mt-4 inline-block"
                >
                  Read more
                </a>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500">Loading recent posts...</p>
          )}

          {/* Archive Section */}
          <div className="bg-white p-8 rounded-lg shadow-lg transition-transform transform hover:scale-105 hover:shadow-xl">
            <h2 className="text-2xl font-bold mb-4 text-custom-green">
              Archive
            </h2>
            <ul className="list-disc pl-5 space-y-2">
              {archivePosts.map((post) => (
                <li
                  key={post.id}
                  className="transition-all hover:text-custom-green"
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
        <div className="absolute bottom-0 left-0 right-0 z-0 h-40">
          <Footer />
        </div>
      </div>
    </div>
  );
};

export default HomePage;
