import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "./firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import PostForm from "./PostForm"; // Import the PostForm component
import Navbar from "./Navbar";

const EditPost = () => {
  const { id } = useParams(); // Get post ID from the URL
  const navigate = useNavigate();
  const [initialTitle, setInitialTitle] = useState("");
  const [initialContent, setInitialContent] = useState("");
  const [initialAuthor, setInitialAuthor] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    // Fetch the post data to pre-fill the form
    const fetchPost = async () => {
      const docRef = doc(db, "posts", id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const post = docSnap.data();
        setInitialTitle(post.title);
        setInitialContent(post.content);
        setInitialAuthor(post.author);
      } else {
        console.log("No such document!");
      }
    };

    fetchPost();
  }, [id]);

  // Function to handle updating the post in Firestore
  const handleUpdatePost = async ({ title, content, author }) => {
    try {
      const docRef = doc(db, "posts", id);
      await updateDoc(docRef, {
        title,
        content,
        author,
      });
      setMessage("Post updated successfully!");
      setTimeout(() => {
        navigate("/admin"); // Redirect to the admin page after success
      }, 2000); // Redirect after 2 seconds
    } catch (error) {
      console.error("Error updating post: ", error);
      setMessage("Failed to update post.");
    }
  };

  return (
    <div>
      <Navbar />
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-8">
        <div className="max-w-4xl w-full bg-white p-8 rounded-lg shadow-lg">
          <h1 className="text-3xl font-bold mb-6 text-custom-green text-center">
            Edit Post
          </h1>

          {/* PostForm for editing the post */}
          <PostForm
            initialTitle={initialTitle}
            initialContent={initialContent}
            initialAuthor={initialAuthor}
            onSubmit={handleUpdatePost}
            submitButtonLabel="Update Post"
          />

          {message && (
            <p className="text-center text-green-500 mt-4">{message}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default EditPost;
