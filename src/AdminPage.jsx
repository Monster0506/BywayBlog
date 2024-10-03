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
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import PostForm from "./PostForm";
import Navbar from "./Navbar";
import Footer from "./Footer";

const AdminPage = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [currentUser, setCurrentUser] = useState(null);
  const [username, setUsername] = useState("");
  const [userEmails, setUserEmails] = useState([]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        navigate("/login");
      } else {
        setCurrentUser(user);
        const userDoc = await getDoc(doc(db, "users", user.uid));
        setUsername(
          userDoc.exists() ? userDoc.data().username || user.email : user.email,
        );
      }
    });
    return unsubscribe;
  }, [navigate]);

  useEffect(() => {
    const fetchPosts = async () => {
      const postsCollection = collection(db, "posts");
      const querySnapshot = await getDocs(postsCollection);
      const postsList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPosts(postsList);
      setFilteredPosts(postsList);
    };
    fetchPosts();
  }, []);

  useEffect(() => {
    let filtered = posts;
    if (filterStatus !== "all") {
      filtered = filtered.filter((post) =>
        filterStatus === "draft" ? post.draft : !post.draft,
      );
    }
    if (searchTerm) {
      filtered = filtered.filter(
        (post) =>
          post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          post.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
          post.content.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }
    setFilteredPosts(filtered);
  }, [filterStatus, searchTerm, posts]);

  useEffect(() => {
    const fetchUserEmails = async () => {
      try {
        const usersCollection = collection(db, "users");
        const querySnapshot = await getDocs(usersCollection);
        const usersList = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          return { email: data.email, username: data.username || data.email };
        });
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
        author: username,
        draft,
        date: serverTimestamp(),
      });
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

  const handlePublishToggle = async (id, currentStatus) => {
    try {
      const docRef = doc(db, "posts", id);
      await updateDoc(docRef, { draft: !currentStatus });
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === id ? { ...post, draft: !currentStatus } : post,
        ),
      );
    } catch (error) {
      console.error("Error updating post status:", error);
    }
  };

  return (
    <div className="min-h-screen custom-vertical-gradient flex flex-col">
      <Navbar />
      <div className="flex-1 p-8 relative z-10">
        <div className="max-w-5xl mx-auto bg-white p-8 rounded-lg shadow-lg">
          <h1 className="text-4xl font-bold mb-6 text-custom-green text-center">
            Admin Dashboard
          </h1>

          {/* Post Form */}
          <PostForm onSubmit={handleAddPost} submitButtonLabel="Add Post" />

          {/* Display Posts */}
          <h2 className="text-3xl font-bold mb-4 text-custom-green">Posts</h2>
          {/* Search and Filter */}
          <div className="mb-6 flex justify-between items-center gap-4">
            <input
              type="text"
              placeholder="Search posts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 p-3 border border-gray-300 rounded"
            />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="p-3 border border-gray-300 rounded"
            >
              <option value="all">All</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
          </div>
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPosts.map((post) => (
              <li
                key={post.id}
                className="bg-gray-50 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
              >
                <h3 className="text-xl font-semibold mb-2">{post.title}</h3>
                <p className="text-gray-600 mb-2">Author: {post.author}</p>
                <span
                  className={`inline-block px-3 py-1 rounded-full text-white ${post.draft ? "bg-red-500" : "bg-green-500"}`}
                >
                  {post.draft ? "Draft" : "Published"}
                </span>
                <div
                  className="text-gray-700 mt-4"
                  dangerouslySetInnerHTML={{
                    __html: truncateContent(post.content),
                  }}
                />
                <div className="flex justify-between items-center mt-4">
                  <button
                    onClick={() => handlePublishToggle(post.id, post.draft)}
                    className={`px-4 py-2 rounded ${post.draft ? "bg-green-500" : "bg-yellow-500"} text-white`}
                  >
                    {post.draft ? "Publish" : "Unpublish"}
                  </button>
                  <button
                    onClick={() => handleDeletePost(post.id)}
                    className="px-4 py-2 rounded bg-red-500 text-white"
                  >
                    Delete
                  </button>
                  <a
                    href={`/edit/${post.id}`}
                    className="px-4 py-2 rounded bg-blue-500 text-white"
                  >
                    Edit
                  </a>
                </div>
              </li>
            ))}
          </ul>

          <h2 className="text-3xl font-bold mt-8 mb-4 text-custom-green">
            Registered Users
          </h2>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {userEmails.map((user, index) => (
              <li key={index} className="bg-gray-50 p-4 rounded-lg shadow-md">
                <p className="font-semibold">{user.username}</p>
                <p className="text-gray-600">{user.email}</p>
              </li>
            ))}
          </ul>

          <button
            onClick={handleLogout}
            className="w-full bg-red-500 text-white py-3 rounded mt-8"
          >
            Log Out
          </button>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default AdminPage;
