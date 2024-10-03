import React, { useState, useEffect } from "react";
import ReactQuill, { Quill } from "react-quill";
import "react-quill/dist/quill.snow.css";
import { auth, db } from "./firebase";
import { doc, getDoc } from "firebase/firestore";

// Custom Undo button icon component for Quill editor
const CustomUndo = () => (
  <svg viewBox="0 0 18 18">
    <polygon className="ql-fill ql-stroke" points="6 10 4 12 2 10 6 10" />
    <path
      className="ql-stroke"
      d="M8.09,13.91A4.6,4.6,0,0,0,9,14,5,5,0,1,0,4,9"
    />
  </svg>
);

// Redo button icon component for Quill editor
const CustomRedo = () => (
  <svg viewBox="0 0 18 18">
    <polygon className="ql-fill ql-stroke" points="12 10 14 12 16 10 12 10" />
    <path
      className="ql-stroke"
      d="M9.91,13.91A4.6,4.6,0,0,1,9,14a5,5,0,1,1,5-5"
    />
  </svg>
);

// Undo and redo functions for Custom Toolbar
function undoChange() {
  this.quill.history.undo();
}
function redoChange() {
  this.quill.history.redo();
}

// Add sizes to whitelist and register them
const Size = Quill.import("formats/size");
Size.whitelist = ["extra-small", "small", "medium", "large"];
Quill.register(Size, true);

// Add fonts to whitelist and register them
const Font = Quill.import("formats/font");
Font.whitelist = [
  "arial",
  "comic-sans",
  "courier-new",
  "georgia",
  "helvetica",
  "lucida",
];
Quill.register(Font, true);

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
  const [settingsLoaded, setSettingsLoaded] = useState(false);

  // Add state for default font and size
  const [defaultFont, setDefaultFont] = useState("");

  const [defaultSize, setDefaultSize] = useState("");

  useEffect(() => {
    // Fetch user settings
    const fetchUserSettings = async () => {
      const user = auth.currentUser;
      if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          console.log(userDoc.data());
          console.log(userDoc.data().defaultFont);
          console.log(userDoc.data().defaultSize);
          setDefaultFont(userDoc.data().defaultFont);
          setDefaultSize(userDoc.data().defaultSize);
          console.log(defaultFont, defaultSize);
          if (defaultFont === "BAD" || defaultSize === "BAD") {
            console.log("Failed to load user settings");
            console.log(defaultFont, defaultSize);
          } else {
            console.log(defaultFont, defaultSize);
            setSettingsLoaded(true);
          }
        }
      }
    };
    fetchUserSettings();
  }, []);

  // Define modules and formats inside the component
  const modules = {
    toolbar: {
      container: "#toolbar",
      handlers: {
        undo: undoChange,
        redo: redoChange,
      },
    },
    history: {
      delay: 500,
      maxStack: 100,
      userOnly: true,
    },
  };

  const formats = [
    "header",
    "font",
    "size",
    "bold",
    "italic",
    "underline",
    "align",
    "strike",
    "script",
    "background",
    "list",
    "bullet",
    "indent",
    "link",
    "image",
    "color",
    "code-block",
  ];

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

        {settingsLoaded && (
          <div className="mb-6">
            <label htmlFor="content" className="block text-gray-700 mb-2">
              Content
            </label>
            <div id="toolbar">
              <span className="ql-formats">
                <select
                  className="ql-font"
                  defaultValue={defaultFont || "georgia"}
                >
                  <option value="georgia">Georgia</option>
                  <option value="arial">Arial</option>
                  <option value="comic-sans">Comic Sans</option>
                  <option value="courier-new">Courier New</option>
                  <option value="helvetica">Helvetica</option>
                  <option value="lucida">Lucida</option>
                </select>
                <select className="ql-size" defaultValue={defaultSize}>
                  <option value="extra-small">Size 1</option>
                  <option value="small">Size 2</option>
                  <option value="medium">Size 3</option>
                  <option value="large">Size 4</option>
                </select>
                <select className="ql-header" defaultValue="3">
                  <option value="1">Heading</option>
                  <option value="2">Subheading</option>
                  <option value="3">Normal</option>
                </select>
              </span>
              <span className="ql-formats">
                <button className="ql-bold" />
                <button className="ql-italic" />
                <button className="ql-underline" />
                <button className="ql-strike" />
              </span>
              <span className="ql-formats">
                <button className="ql-list" value="ordered" />
                <button className="ql-list" value="bullet" />
                <button className="ql-indent" value="-1" />
                <button className="ql-indent" value="+1" />
              </span>
              <span className="ql-formats">
                <button className="ql-script" value="super" />
                <button className="ql-script" value="sub" />
                <button className="ql-blockquote" />
                <button className="ql-direction" />
              </span>
              <span className="ql-formats">
                <select className="ql-align" />
                <select className="ql-color" />
                <select className="ql-background" />
              </span>
              <span className="ql-formats">
                <button className="ql-link" />
                <button className="ql-image" />
              </span>
              <span className="ql-formats">
                <button className="ql-formula" />
                <button className="ql-code-block" />
                <button className="ql-clean" />
              </span>
              <span className="ql-formats">
                <button className="ql-undo">
                  <CustomUndo />
                </button>
                <button className="ql-redo">
                  <CustomRedo />
                </button>
              </span>
            </div>
            <ReactQuill
              theme="snow"
              value={content}
              style={{ height: "300px", fontFamily: defaultFont || "georgia" }}
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
        )}

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
          className={`w-full bg-custom-green text-white py-2 rounded hover:bg-custom-green ${
            loading ? "opacity-50 cursor-not-allowed" : ""
          }`}
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
            className={`text-center mt-4 ${
              message.includes("successfully")
                ? "text-green-500"
                : "text-red-500"
            }`}
          >
            {message}
          </p>
        )}
      </form>
    </div>
  );
};

export default PostForm;
