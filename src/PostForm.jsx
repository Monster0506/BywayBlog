import React, { useState, useEffect } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import QuillToolbar, { modules, formats } from "./QuillToolbar"; // Import custom toolbar and settings

const PostForm = ({
  initialTitle = "",
  initialContent = "",
  initialAuthor = "", // Now expecting an author prop from the parent
  onSubmit,
  submitButtonLabel = "Submit",
}) => {
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [author, setAuthor] = useState(initialAuthor);
  const [message, setMessage] = useState("");

  // Update state when props change
  useEffect(() => {
    setTitle(initialTitle);
  }, [initialTitle]);

  useEffect(() => {
    setContent(initialContent);
  }, [initialContent]);

  useEffect(() => {
    setAuthor(initialAuthor); // Set the author's name when the prop changes
  }, [initialAuthor]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await onSubmit({ title, content, author }); // Use the author's name from the state
      setMessage("Post submitted successfully!");
      setTimeout(() => {
        setMessage(""); // Clear message after a while
      }, 2000);
    } catch (error) {
      console.error("Error submitting post: ", error);
      setMessage("Failed to submit post.");
    }
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
            onChange={(e) => setTitle(e.target.value)}
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
            onChange={setContent}
            modules={modules}
            formats={formats}
            className="bg-white mt-4"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-custom-green text-white py-2 rounded hover:bg-custom-green"
        >
          {submitButtonLabel}
        </button>

        {message && (
          <p className="text-center text-green-500 mt-4">{message}</p>
        )}
      </form>
    </div>
  );
};

export default PostForm;
