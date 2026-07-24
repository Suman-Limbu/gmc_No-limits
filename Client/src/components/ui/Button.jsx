import React from "react";

const Button = ({
  children,
  type = "button",
  variant = "primary",
  size = "md",
  disabled = false,
  loading = false,
  fullWidth = false,
  className = "",
  onClick,
  icon,
  iconPosition = "right",
}) => {
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-300",

    secondary: "bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-300",

    outline: "border border-blue-600 text-blue-600 hover:bg-blue-50",

    danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-300",

    success: "bg-green-600 text-white hover:bg-green-700 focus:ring-green-300",

    ghost: "text-gray-700 hover:bg-gray-100",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg",
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`
        group
        inline-flex items-center justify-center gap-2
        rounded-lg
        font-medium
        transition-all duration-300
        hover:-translate-y-0.5
        focus:outline-none
        focus:ring-2
        disabled:opacity-50
        disabled:cursor-not-allowed
        ${variants[variant]}
        ${sizes[size]}
        ${fullWidth ? "w-full" : ""}
        ${className}
      `}
    >
      {loading ? (
        "Loading..."
      ) : (
        <>
          {icon && iconPosition === "left" && (
            <span className="transition-transform duration-300 group-hover:-translate-x-1">
              {icon}
            </span>
          )}

          <span>{children}</span>

          {icon && iconPosition === "right" && (
            <span className="transition-transform duration-300 group-hover:translate-x-0.5">
              {icon}
            </span>
          )}
        </>
      )}
    </button>
  );
};

export default Button;
