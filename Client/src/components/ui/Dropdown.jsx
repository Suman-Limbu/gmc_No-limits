import React from "react";

const Dropdown = ({
  options = ["Math", "science", "English"],
  value = "",
  onChange,
  name,
  id,
  label,
  placeholder = "Select an option",
  disabled = false,
  required = false,
  className = "",
}) => {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={id || name} className="text-sm font-medium">
          {label}
          {required && <span className="text-red-500"> *</span>}
        </label>
      )}

      <select
        id={id || name}
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        required={required}
        className={`border rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500/40 ${className}`}
      >
        <option value="" disabled>
          {placeholder}
        </option>

        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
            disabled={option.disabled}
          >
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default Dropdown;
