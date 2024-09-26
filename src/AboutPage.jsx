import React from "react";
import Navbar from "./Navbar"; // Import your Navbar component
import Footer from "./Footer";

const AboutPage = () => {
  return (
    <div className="custom-vertical-gradient">
      <Navbar />
      <div className="min-h-screen flex flex-col items-center p-8 relative z-10">
        <div className="max-w-3xl w-full bg-white p-8 rounded-lg shadow-lg mt-8">
          <h1
            className="text-custom-green text-4xl font-bold text-center mb-6"
            style={{ fontFamily: "EB Garamond, serif" }}
          >
            About Ochen
          </h1>
          <p
            className="text-gray-800 leading-relaxed mb-4"
            style={{ fontFamily: "EB Garamond, serif" }}
          >
            {
              "Ochen's poetry captures the very scent of the woods and has made it both irresistibly and intoxicating to read. This website shares some of Ochen's works (i.e., poetry and art) in hopes that one day his readers shall be inspired to find the same bewildering things he found in the woods."
            }
          </p>
          <p
            className="text-gray-800 leading-relaxed mb-4"
            style={{ fontFamily: "EB Garamond, serif" }}
          >
            From serene poetic verse to intense philosophical wisdom, Ochen does
            not invite the reader to simply read his poems for their enjoyment
            but to live them and find the various moods he was in while writing
            them. In doing so, he believes, you shall find the poem rewarding in
            more ways than one.
          </p>
          <p
            className="text-gray-800 leading-relaxed"
            style={{ fontFamily: "EB Garamond, serif" }}
          >
            That being said, we invite you to share this website and explore its
            gallery so when the time comes to purchase his book(s). Each piece
            is a reflection of dedication and, in many ways, an echo of what
            Ochen believes poetry stands for.
          </p>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 z-0 h-40">
        <Footer />
      </div>
    </div>
  );
};

export default AboutPage;
