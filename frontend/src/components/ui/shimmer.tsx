import React from "react";

const Shimmer = ({ width, height = "4rem", className = "" }) => {
  return (
    <div
      className={`relative overflow-hidden rounded ${className}`}
      style={{ width, height }}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent animate-shimmer"></div>
    </div>
  );
};

export default Shimmer;
