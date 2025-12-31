import React from 'react';

const OptionButton = ({ option, onClick }) => (
  <button
    onClick={onClick}
    className="w-full flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 mb-4"
  >
    {option}
  </button>
);

export default OptionButton;
