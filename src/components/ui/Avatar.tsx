"use client";

import { useState } from "react";

type AvatarSize = "sm" | "md" | "lg";

interface AvatarProps {
  src?: string | null;
  name?: string;
  size?: AvatarSize;
  className?: string;
}

const sizeMap: Record<AvatarSize, { box: string; text: string }> = {
  sm: { box: "w-8 h-8", text: "text-xs" },
  md: { box: "w-10 h-10", text: "text-sm" },
  lg: { box: "w-14 h-14", text: "text-base" },
};

function getInitials(name?: string): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0][0]?.toUpperCase() || "?";
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function hashColor(name?: string): string {
  if (!name) return "bg-primary/20 text-primary";
  let hash = 0;
  for (const ch of name) hash = ch.charCodeAt(0) + ((hash << 5) - hash);
  const hue = Math.abs(hash) % 360;
  return `bg-[hsl(${hue},50%,45%)] text-white`;
}

export function Avatar({ src, name, size = "md", className = "" }: AvatarProps) {
  const [imgError, setImgError] = useState(false);
  const { box, text } = sizeMap[size];
  const showImage = src && !imgError;

  return (
    <div
      className={`
        ${box} rounded-full overflow-hidden shrink-0
        flex items-center justify-center font-semibold
        ${showImage ? "" : hashColor(name)}
        ${text} ${className}
      `}
    >
      {showImage ? (
        <img
          src={src}
          alt={name || "Avatar"}
          className="w-full h-full object-cover"
          onError={() => setImgError(true)}
        />
      ) : (
        getInitials(name)
      )}
    </div>
  );
}
