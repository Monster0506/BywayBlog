import React from "react";
import treeline from "./assets/treeline.png"; // Import the image

const Footer = () => {
  return (
    <div className="fixed bottom-0 left-0 w-full">
      <img
        src={treeline}
        alt="Tree line"
        className="w-full object-cover"
        style={{ height: "100%" }}
      />
    </div>
  );
};

export default Footer;
