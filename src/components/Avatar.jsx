import React from "react";

/**
 * Avatar component that generates a colored circular avatar with the first letter of the name
 * @param {string} name - User's name
 * @param {string} size - Size class (e.g., "w-12 h-12", "w-24 h-24")
 * @param {string} className - Additional CSS classes
 */
const Avatar = ({ name, size = "w-12 h-12", className = "" }) => {
  // Get first letter of name (capitalized)
  const getInitial = (name) => {
    if (!name || name.trim().length === 0) return "?";
    return name.trim().charAt(0).toUpperCase();
  };

  // Generate consistent color based on name
  const getColorFromName = (name) => {
    if (!name) return "#9CA3AF"; // Default gray

    // List of attractive colors
    const colors = [
      "#EF4444", // red
      "#F59E0B", // amber
      "#10B981", // green
      "#3B82F6", // blue
      "#8B5CF6", // purple
      "#EC4899", // pink
      "#06B6D4", // cyan
      "#F97316", // orange
      "#84CC16", // lime
      "#6366F1", // indigo
      "#14B8A6", // teal
      "#F43F5E", // rose
    ];

    // Generate a consistent index from the name
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    // Use absolute value to get a positive index
    const index = Math.abs(hash) % colors.length;
    return colors[index];
  };

  // Determine text size based on avatar size
  const getTextSize = (sizeClass) => {
    if (sizeClass.includes("w-8") || sizeClass.includes("h-8")) return "text-xs";
    if (sizeClass.includes("w-12") || sizeClass.includes("h-12")) return "text-base";
    if (sizeClass.includes("w-16") || sizeClass.includes("h-16")) return "text-lg";
    if (sizeClass.includes("w-24") || sizeClass.includes("h-24")) return "text-2xl";
    if (sizeClass.includes("w-32") || sizeClass.includes("h-32")) return "text-3xl";
    return "text-base"; // default
  };

  const initial = getInitial(name);
  const backgroundColor = getColorFromName(name);
  const textSize = getTextSize(size);

  return (
    <div
      className={`${size} rounded-full flex items-center justify-center text-white font-semibold ${className}`}
      style={{ backgroundColor }}
    >
      <span className={textSize}>{initial}</span>
    </div>
  );
};

export default Avatar;

