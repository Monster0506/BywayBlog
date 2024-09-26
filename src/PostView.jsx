import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { auth } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
import { db } from "./firebase";
import { is_admin } from "./utils";
import {
  doc,
  getDoc,
  query,
  collection,
  orderBy,
  where,
  limit,
  serverTimestamp,
  addDoc,
  getDocs,
  deleteDoc,
} from "firebase/firestore";
import DOMPurify from "dompurify";
import Navbar from "./Navbar";
import Footer from "./Footer";
import {
  FaFacebook,
  FaTwitter,
  FaLinkedin,
  FaCopy,
  FaEnvelope,
} from "react-icons/fa";
import "react-quill/dist/quill.snow.css";

const PostView = () => {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [previousPost, setPreviousPost] = useState(null);
  const [nextPost, setNextPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [commentAuthor, setCommentAuthor] = useState("");
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
      } else {
        setCurrentUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const docRef = doc(db, "posts", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setPost(docSnap.data());
        } else {
          console.log("No such document!");
        }
        setLoading(false);
      } catch (error) {
        console.error("Error fetching post:", error);
        setLoading(false);
      }
    };

    fetchPost();
  }, [id]);

  // Fetch comments function
  const fetchComments = async () => {
    if (!post) return;
    const commentsRef = collection(db, "posts", id, "comments");
    const commentsSnapshot = await getDocs(
      query(commentsRef, orderBy("date", "asc")),
    );
    const commentsList = commentsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setComments(commentsList);
  };

  useEffect(() => {
    const fetchAdjacentPosts = async () => {
      if (!post) return;
      try {
        // Fetch next post
        const nextPostQuery = query(
          collection(db, "posts"),
          where("date", ">", post.date),
          orderBy("date", "asc"),
          limit(1),
        );
        const nextPostSnapshot = await getDocs(nextPostQuery);
        nextPostSnapshot.forEach((doc) =>
          setNextPost({ id: doc.id, ...doc.data() }),
        );

        // Fetch previous post
        const previousPostQuery = query(
          collection(db, "posts"),
          where("date", "<", post.date),
          orderBy("date", "desc"),
          limit(1),
        );
        const previousPostSnapshot = await getDocs(previousPostQuery);
        previousPostSnapshot.forEach((doc) =>
          setPreviousPost({ id: doc.id, ...doc.data() }),
        );
      } catch (error) {
        console.error("Error fetching adjacent posts:", error);
      }
    };

    fetchAdjacentPosts();
  }, [post]);

  useEffect(() => {
    fetchComments();
  }, [id, post]);

  // Handle adding a new comment
  // Handle adding a new comment
  const handleAddComment = async () => {
    if (!newComment || !commentAuthor) return;

    const commentsRef = collection(db, "posts", id, "comments");
    const newCommentData = {
      author: commentAuthor,
      content: newComment,
      date: serverTimestamp(),
    };

    try {
      // Add the new comment to Firestore
      const docRef = await addDoc(commentsRef, newCommentData);

      // Create a new comment object with the current timestamp for local state update
      const newCommentWithId = {
        id: docRef.id,
        ...newCommentData,
        date: { seconds: Date.now() / 1000 }, // Mock the date for immediate rendering
      };

      // Update the comments list with the new comment
      setComments((prevComments) => [...prevComments, newCommentWithId]);

      // Clear the input fields
      setNewComment("");
      setCommentAuthor("");
    } catch (error) {
      console.error("Error adding comment: ", error);
    }
  };
  // Handle deleting a comment
  const handleDeleteComment = async (commentId) => {
    const commentRef = doc(db, "posts", id, "comments", commentId);
    await deleteDoc(commentRef);
    setComments(comments.filter((comment) => comment.id !== commentId)); // Remove comment from UI
  };

  // Sharing logic
  const postUrl = window.location.href;

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(postUrl);
    alert("URL copied to clipboard!");
  };

  const handleEmailShare = () => {
    window.location.href = `mailto:?subject=${post.title}&body=Check out this post: ${postUrl}`;
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!post) {
    return <div>Post not found!</div>;
  }

  const cleanHtml = DOMPurify.sanitize(post.content, {
    ADD_TAGS: ["iframe"],
    ADD_ATTR: ["allow", "allowfullscreen", "frameborder", "scrolling", "src"],
    ALLOWED_URI_REGEXP: /^(?:(?:https?|ftp):|[^a-z]|[a-z+.-]+(?:[^a-z]|$))/i,
  });

  return (
    <div className="min-h-screen custom-vertical-gradient">
      <Navbar />
      <div className="custom-vertical-gradient">
        <div className="max-w-4xl mx-auto p-8 bg-white rounded-lg shadow-lg relative z-10">
          <h1 className="text-4xl font-bold mb-4 text-custom-green">
            {post.title}
          </h1>
          <p className="text-gray-600 mb-4">
            By {post.author} on{" "}
            {new Date(post.date.seconds * 1000).toLocaleDateString()}
          </p>
          {/* Safely render the post content */}
          <div
            className="prose lg:prose-xl max-w-none ql-editor"
            dangerouslySetInnerHTML={{ __html: cleanHtml }}
          />
          {/* Share Buttons */}
          <div className="mt-6 flex space-x-4">
            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=${postUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800"
            >
              <FaFacebook size={24} />
            </a>
            <a
              href={`https://twitter.com/intent/tweet?url=${postUrl}&text=${post.title}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-600"
            >
              <FaTwitter size={24} />
            </a>
            <a
              href={`https://www.linkedin.com/sharing/share-offsite/?url=${postUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-700 hover:text-blue-900"
            >
              <FaLinkedin size={24} />
            </a>
            <button
              onClick={handleCopyUrl}
              className="text-gray-700 hover:text-gray-900"
            >
              <FaCopy size={24} />
            </button>
            <button
              onClick={handleEmailShare}
              className="text-red-600 hover:text-red-800"
            >
              <FaEnvelope size={24} />
            </button>
          </div>
          {/* Post Navigation */}
          <div className="mt-6 flex justify-between">
            {previousPost && (
              <a
                href={`/post/${previousPost.id}`}
                className="text-custom-green hover:text-custom-green"
              >
                ← {previousPost.title}
              </a>
            )}
            {nextPost && (
              <a
                href={`/post/${nextPost.id}`}
                className="text-custom-green hover:text-custom-green"
              >
                {nextPost.title} →
              </a>
            )}
          </div>
          {/* Comments Section */}
          <div className="mt-8">
            <h2 className="text-2xl font-bold mb-4">Comments</h2>
            <div className="mt-6">
              <h3 className="text-xl font-bold mb-2">Add a Comment</h3>
              <input
                type="text"
                value={commentAuthor}
                onChange={(e) => setCommentAuthor(e.target.value)}
                placeholder="Your Name"
                className="block w-full p-2 mb-4 border border-gray-300 rounded"
              />
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Your Comment"
                className="block w-full p-2 mb-4 border border-gray-300 rounded"
                rows="4"
              ></textarea>
              <button
                onClick={handleAddComment}
                className="bg-custom-green text-white px-4 py-2 rounded hover:bg-custom-green"
              >
                Submit Comment
              </button>
            </div>
          </div>
          {/* Display comments */}
          <ul className="space-y-4">
            {comments.map((comment) => (
              <li key={comment.id} className="bg-gray-100 p-4 rounded-lg">
                <p className="text-gray-800 mb-2">
                  <strong>{comment.author}</strong> on{" "}
                  {new Date(comment.date.seconds * 1000).toLocaleDateString()}
                </p>
                <p>{comment.content}</p>

                {/* Show delete button only if the current user is an admin */}
                {currentUser && is_admin(currentUser.uid) && (
                  <button
                    onClick={() => handleDeleteComment(comment.id)}
                    className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                  >
                    Delete
                  </button>
                )}
              </li>
            ))}
          </ul>{" "}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default PostView;
