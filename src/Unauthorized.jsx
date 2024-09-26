import React from "react";

const Unauthorized = () => {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="p-8 bg-white rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
        <p className="text-gray-700">
          You are not authorized to view this page. This page is restricted to
          the owner of the blog.
        </p>
      </div>
    </div>
  );
};

export default Unauthorized;
