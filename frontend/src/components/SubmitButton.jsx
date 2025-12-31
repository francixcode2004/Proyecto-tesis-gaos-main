import React from "react";

const SubmitButton = () => (
  <button
    type="submit"
    className="w-full flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
  >
    <img
      src="/GaosMini_blackbg.webp"
      alt="GAOS Mini Logo"
      width={24}
      height={24}
      className="mr-2"
    />
    Ingresar
  </button>
);

export default SubmitButton;
