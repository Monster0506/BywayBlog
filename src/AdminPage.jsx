import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "./firebase";
import { signOut } from "firebase/auth";
import { db } from "./firebase";
import { truncateContent } from "./utils";
import {
  collection,
  addDoc,
  serverTimestamp,
  getDocs,
  deleteDoc,
  doc,
} from "firebase/firestore";
import PostForm from "./PostForm"; // Import the PostForm component
import Navbar from "./Navbar";
import Footer from "./Footer";

const AdminPage = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        navigate("/login"); // Redirect if not logged in
      }
    });

    return unsubscribe; // Clean up subscription on component unmount
  }, [navigate]);

  // Fetch posts from Firestore
  useEffect(() => {
    const fetchPosts = async () => {
      const postsCollection = collection(db, "posts");
      const querySnapshot = await getDocs(postsCollection);
      const postsList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPosts(postsList);
    };

    fetchPosts();
  }, []);

  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        navigate("/login");
      })
      .catch((error) => {
        console.error("Failed to log out:", error);
      });
  };

  const handleAddPost = async ({ title, content, author }) => {
    try {
      await addDoc(collection(db, "posts"), {
        title,
        content,
        author,
        date: serverTimestamp(),
      });
      // Re-fetch posts after adding
      const querySnapshot = await getDocs(collection(db, "posts"));
      const postsList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPosts(postsList);
    } catch (error) {
      console.error("Error adding post: ", error);
    }
  };

  const handleDeletePost = async (id) => {
    try {
      await deleteDoc(doc(db, "posts", id));
      setPosts((prevPosts) => prevPosts.filter((post) => post.id !== id));
    } catch (error) {
      console.error("Error deleting post:", error);
    }
  };

  // Truncate content to a certain length

  return (
    <div className="min-h-screen custom-vertical-gradient">
      <Navbar />
      <div className="custom-vertical-gradient">
        <div className="min-h-screen flex items-center justify-center p-8 relative z-10 ">
          <div className="max-w-4xl w-full bg-white p-8 rounded-lg shadow-lg">
            <h1 className="text-3xl font-bold mb-6 text-custom-green text-center">
              Admin Dashboard
            </h1>

            {/* Post Form for Adding a Post */}
            <PostForm onSubmit={handleAddPost} submitButtonLabel="Add Post" />

            {/* Display Existing Posts */}
            <h2 className="text-2xl font-bold mb-4 text-custom-green">Posts</h2>
            <ul className="space-y-4">
              {posts.map((post) => (
                <li key={post.id} className="bg-gray-100 p-4 rounded shadow-lg">
                  <h3 className="text-xl font-semibold">{post.title}</h3>
                  <p className="text-gray-700 mb-2">{post.author}</p>

                  {/* Display truncated HTML content */}
                  <div
                    className="text-gray-500 mb-4"
                    dangerouslySetInnerHTML={{
                      __html: truncateContent(post.content), // Truncate to 200 characters
                    }}
                  />

                  <div className="flex space-x-4">
                    <button
                      onClick={() => handleDeletePost(post.id)}
                      className="bg-red-500 text-white py-1 px-3 rounded hover:bg-red-600"
                    >
                      Delete
                    </button>
                    <a
                      href={`/edit/${post.id}`}
                      className="bg-blue-500 text-white py-1 px-3 rounded hover:bg-blue-600"
                    >
                      Edit
                    </a>
                  </div>
                </li>
              ))}
            </ul>

            <button
              onClick={handleLogout}
              className="w-full bg-red-500 text-white py-2 rounded hover:bg-red-600 mt-8"
            >
              Log Out
            </button>
          </div>
        </div>
      </div>
      <div>
        <Footer />
      </div>
    </div>
  );
};

export default AdminPage;
