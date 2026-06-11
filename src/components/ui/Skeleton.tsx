import React from "react";

interface SkeletonProps {
  className?: string;
  width?: string;
  height?: string;
  circle?: boolean;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = "",
  width,
  height,
  circle = false,
}) => {
  return (
    <div
      className={`skeleton-shimmer ${circle ? "rounded-full" : "rounded-lg"} ${className}`}
      style={{
        width: width,
        height: height,
      }}
    />
  );
};
