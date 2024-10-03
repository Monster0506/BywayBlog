import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "./firebase";
import { signOut } from "firebase/auth";
import { truncateContent } from "./utils";
import {
  collection,
  addDoc,
  serverTimestamp,
  getDocs,
  getDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import PostForm from "./PostForm"; // Import the PostForm component
import Navbar from "./Navbar";
import Footer from "./Footer";

const AdminPage = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [userEmails, setUserEmails] = useState([]); // State to store user emails
  const [currentUser, setCurrentUser] = useState(null); // State to store current user
  const [username, setUsername] = useState(""); // State to store the username

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        navigate("/login"); // Redirect if not logged in
      } else {
        setCurrentUser(user);

        // Fetch username from Firestore
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          setUsername(userDoc.data().username || user.email);
        } else {
          setUsername(user.email); // Fallback to email if username is not found
        }
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

  // Fetch user emails from Firestore
  useEffect(() => {
    const fetchUserEmails = async () => {
      try {
        const usersCollection = collection(db, "users");
        const querySnapshot = await getDocs(usersCollection);
        const usersList = querySnapshot.docs.map((doc) => doc.data().email);
        setUserEmails(usersList);
      } catch (error) {
        console.error("Error fetching user emails: ", error);
      }
    };

    fetchUserEmails();
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

  const handleAddPost = async ({ title, content, draft }) => {
    try {
      await addDoc(collection(db, "posts"), {
        title,
        content,
        author: username, // Use the username state here
        draft, // Save draft status in Firestore
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

  // delete posts
  const handleDeletePost = async (id) => {
    try {
      await deleteDoc(doc(db, "posts", id));
      setPosts((prevPosts) => prevPosts.filter((post) => post.id !== id));
    } catch (error) {
      console.error("Error deleting post:", error);
    }
  };

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
                  <p className="text-gray-500 mb-2">
                    {post.draft ? "Draft" : "Published"}
                  </p>

                  {/* Display truncated HTML content */}
                  <div
                    className="text-gray-500 mb-4"
                    dangerouslySetInnerHTML={{
                      __html: truncateContent(post.content),
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

            {/* Display User Emails */}
            <h2 className="text-2xl font-bold mb-4 text-custom-green">
              Registered Users
            </h2>
            <ul className="mb-6">
              {userEmails.map((email, index) => (
                <li key={index} className="bg-gray-100 p-2 rounded mb-2">
                  {email}
                </li>
              ))}
            </ul>
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
