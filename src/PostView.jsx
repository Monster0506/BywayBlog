import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { auth, db } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
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
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          setCommentAuthor(userDoc.data().username || user.email);
        } else {
          setCommentAuthor(user.email);
        }
      } else {
        setCurrentUser(null);
        setCommentAuthor("Anonymous");
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
          const postData = docSnap.data();
          if (!postData.draft) {
            setPost(postData);
          } else {
            console.log("This post is marked as a draft.");
          }
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
    fetchComments();
  }, [id, post]);

  useEffect(() => {
    const fetchAdjacentPosts = async () => {
      if (!post) return;
      try {
        const nextPostQuery = query(
          collection(db, "posts"),
          where("date", ">", post.date),
          where("draft", "==", false),
          orderBy("date", "asc"),
          limit(1),
        );
        const nextPostSnapshot = await getDocs(nextPostQuery);
        nextPostSnapshot.forEach((doc) =>
          setNextPost({ id: doc.id, ...doc.data() }),
        );

        const previousPostQuery = query(
          collection(db, "posts"),
          where("date", "<", post.date),
          where("draft", "==", false),
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

  const handleAddComment = async () => {
    if (!newComment) return;

    const commentsRef = collection(db, "posts", id, "comments");
    const newCommentData = {
      author: commentAuthor,
      content: newComment,
      date: serverTimestamp(),
    };

    try {
      const docRef = await addDoc(commentsRef, newCommentData);

      const newCommentWithId = {
        id: docRef.id,
        ...newCommentData,
        date: { seconds: Date.now() / 1000 },
      };

      setComments((prevComments) => [...prevComments, newCommentWithId]);
      setNewComment("");
    } catch (error) {
      console.error("Error adding comment: ", error);
    }
  };

  const handleDeleteComment = async (commentId) => {
    const commentRef = doc(db, "posts", id, "comments", commentId);
    await deleteDoc(commentRef);
    setComments(comments.filter((comment) => comment.id !== commentId));
  };

  const postUrl = window.location.href;

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(postUrl);
    alert("URL copied to clipboard!");
  };

  const handleEmailShare = () => {
    window.location.href = `mailto:?subject=${post.title}&body=Check out this post: ${postUrl}`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );
  }

  if (!post) {
    return (
      <div className="flex justify-center items-center h-screen">
        Post not found!
      </div>
    );
  }

  const cleanHtml = DOMPurify.sanitize(post.content, {
    ADD_TAGS: ["iframe"],
    ADD_ATTR: ["allow", "allowfullscreen", "frameborder", "scrolling", "src"],
    ALLOWED_URI_REGEXP: /^(?:(?:https?|ftp):|[^a-z]|[a-z+.-]+(?:[^a-z]|$))/i,
  });

  return (
    <div className="min-h-screen custom-vertical-gradient">
      <Navbar />

      {/* Main content container */}
      <div className="custom-vertical-gradient">
        <div className="max-w-4xl mx-auto p-8 bg-white rounded-lg shadow-lg relative z-10">
          {/* Post Header */}
          <header className="mb-8">
            <h1 className="text-4xl font-bold mb-4 text-custom-green">
              {post.title}
            </h1>
            <p className="text-gray-600">
              By {post.author} on{" "}
              {new Date(post.date.seconds * 1000).toLocaleDateString()}
            </p>
          </header>

          {/* Post Content */}
          <section
            className="prose lg:prose-xl max-w-none ql-editor mb-8"
            dangerouslySetInnerHTML={{ __html: cleanHtml }}
          />

          {/* Social Sharing Section */}
          <section className="mt-6 mb-8 flex space-x-4">
            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=${postUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 transition"
            >
              <FaFacebook size={24} />
            </a>
            <a
              href={`https://twitter.com/intent/tweet?url=${postUrl}&text=${post.title}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-600 transition"
            >
              <FaTwitter size={24} />
            </a>
            <a
              href={`https://www.linkedin.com/sharing/share-offsite/?url=${postUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-700 hover:text-blue-900 transition"
            >
              <FaLinkedin size={24} />
            </a>
            <button
              onClick={handleCopyUrl}
              className="text-gray-700 hover:text-gray-900 transition"
            >
              <FaCopy size={24} />
            </button>
            <button
              onClick={handleEmailShare}
              className="text-red-600 hover:text-red-800 transition"
            >
              <FaEnvelope size={24} />
            </button>
          </section>

          {/* Navigation Section */}
          <nav className="mt-8 flex justify-between">
            {previousPost && (
              <a
                href={`/post/${previousPost.id}`}
                className="text-custom-green hover:text-custom-green-dark transition"
              >
                ← {previousPost.title}
              </a>
            )}
            {nextPost && (
              <a
                href={`/post/${nextPost.id}`}
                className="text-custom-green hover:text-custom-green-dark transition"
              >
                {nextPost.title} →
              </a>
            )}
          </nav>

          {/* Comments Section */}
          <section className="mt-12">
            <h2 className="text-2xl font-bold mb-4">Comments</h2>

            {/* Add Comment Form */}
            <div className="mt-6">
              <h3 className="text-xl font-bold mb-2">Add a Comment</h3>
              {!currentUser && (
                <input
                  type="text"
                  value={commentAuthor}
                  onChange={(e) => setCommentAuthor(e.target.value)}
                  placeholder="Your Name"
                  className="block w-full p-2 mb-4 border border-gray-300 rounded"
                />
              )}
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Your Comment"
                className="block w-full p-2 mb-4 border border-gray-300 rounded"
                rows="4"
              ></textarea>
              <button
                onClick={handleAddComment}
                className="bg-custom-green text-white px-4 py-2 rounded hover:bg-custom-green-dark transition"
              >
                Submit Comment
              </button>
            </div>

            {/* Display Comments */}
            <ul className="space-y-4 mt-6">
              {comments.map((comment) => (
                <li
                  key={comment.id}
                  className="bg-gray-100 p-4 rounded-lg shadow"
                >
                  <p className="text-gray-800 mb-2">
                    <strong>{comment.author}</strong> on{" "}
                    {new Date(comment.date.seconds * 1000).toLocaleDateString()}
                  </p>
                  <p>{comment.content}</p>
                  {currentUser && is_admin(currentUser.uid) && (
                    <button
                      onClick={() => handleDeleteComment(comment.id)}
                      className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition mt-2"
                    >
                      Delete
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default PostView;
