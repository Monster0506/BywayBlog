import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { auth } from "./firebase";

import { onAuthStateChanged } from "firebase/auth";
import { db } from "./firebase";
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
import DOMPurify from "dompurify"; // For safely rendering HTML
import Navbar from "./Navbar"; // Import the Navbar component
import Footer from "./Footer";
import "react-quill/dist/quill.snow.css"; // Import Quill's snow theme CSS

const PostView = () => {
  const { id } = useParams(); // Get the post ID from the URL
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
        setCurrentUser(user); // User is logged in
      } else {
        setCurrentUser(null); // User is logged out
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

  // Fetch previous and next posts
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

  // Fetch comments
  useEffect(() => {
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

    fetchComments();
  }, [id, post]);

  const handleAddComment = async () => {
    if (!newComment || !commentAuthor) return;
    const commentsRef = collection(db, "posts", id, "comments");
    await addDoc(commentsRef, {
      author: commentAuthor,
      content: newComment,
      date: serverTimestamp(),
    });

    setNewComment("");
    setCommentAuthor("");
    fetchComments();
  };
  const handleDeleteComment = async (commentId) => {
    const commentRef = doc(db, "posts", id, "comments", commentId);
    await deleteDoc(commentRef);
    setComments(comments.filter((comment) => comment.id !== commentId)); // Remove comment from UI
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

          {/* Safely render the post content using DOMPurify */}
          <div
            className="prose lg:prose-xl max-w-none ql-editor"
            dangerouslySetInnerHTML={{ __html: cleanHtml }}
          />

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
                className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
              >
                Submit Comment
              </button>
            </div>
          </div>
          {/* Display comments */}
          {/* Display comments */}
          <ul className="space-y-4">
            {comments.map((comment) => (
              <li key={comment.id} className="bg-gray-100 p-4 rounded-lg">
                <p className="text-gray-800 mb-2">
                  <strong>{comment.author}</strong> on{" "}
                  {new Date(comment.date.seconds * 1000).toLocaleDateString()}
                </p>
                <p>{comment.content}</p>

                {/* Show delete button if user is logged in */}
                {currentUser && (
                  <button
                    onClick={() => handleDeleteComment(comment.id)}
                    className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                  >
                    Delete
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div>
        <Footer />
      </div>
    </div>
  );
};

export default PostView;
