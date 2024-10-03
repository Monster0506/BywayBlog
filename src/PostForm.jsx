import React, { useState, useEffect } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import QuillToolbar, { modules, formats } from "./QuillToolbar";

const PostForm = ({
  initialTitle = "",
  initialContent = "",
  initialAuthor = "",
  initialDraft = false,
  onSubmit,
  submitButtonLabel = "Submit",
}) => {
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [author, setAuthor] = useState(initialAuthor);
  const [draft, setDraft] = useState(initialDraft);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // Update state when props change
  useEffect(() => {
    setTitle(initialTitle);
    setContent(initialContent);
    setAuthor(initialAuthor);
    setDraft(initialDraft);
  }, [initialTitle, initialContent, initialAuthor, initialDraft]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    try {
      await onSubmit({ title, content, author, draft });
      setMessage("Post submitted successfully!");
      setTitle("");
      setContent("");
      setAuthor("");
      setDraft(false);
    } catch (error) {
      console.error("Error submitting post: ", error);
      setMessage("Failed to submit post.");
    } finally {
      setLoading(false);
      setTimeout(() => {
        setMessage("");
      }, 2000);
    }
  };

  // Clear message on input change
  const clearMessage = () => {
    if (message) setMessage("");
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="title" className="block text-gray-700 mb-2">
            Title
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              clearMessage();
            }}
            className="w-full p-2 border border-gray-300 rounded"
            required
          />
        </div>

        <div className="mb-6">
          <label htmlFor="content" className="block text-gray-700 mb-2">
            Content
          </label>
          <QuillToolbar />
          <ReactQuill
            theme="snow"
            value={content}
            onChange={(value) => {
              setContent(value);
              clearMessage();
            }}
            modules={modules}
            formats={formats}
            className="bg-white mt-4"
            required
          />
        </div>

        <div className="mb-4">
          <label htmlFor="draft" className="block text-gray-700 mb-2">
            Save as Draft
          </label>
          <input
            type="checkbox"
            id="draft"
            checked={draft}
            onChange={(e) => setDraft(e.target.checked)}
            className="mr-2"
          />
          <span>Draft</span>
        </div>

        <button
          type="submit"
          className={`w-full bg-custom-green text-white py-2 rounded hover:bg-custom-green ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
          disabled={loading}
        >
          {loading
            ? "Submitting..."
            : draft
              ? "Save as Draft"
              : submitButtonLabel}
        </button>

        {message && (
          <p
            className={`text-center mt-4 ${message.includes("successfully") ? "text-green-500" : "text-red-500"}`}
          >
            {message}
          </p>
        )}
      </form>
    </div>
  );
};

export default PostForm;
