import React from "react";

const InputField = ({ id, label, value, onChange, placeholder }) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-white">
      {label}
    </label>
    <input
      type="text"
      id={id}
      value={value}
      onChange={onChange}
      className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
      placeholder={placeholder}
      required
    />
  </div>
);

export default InputField;
