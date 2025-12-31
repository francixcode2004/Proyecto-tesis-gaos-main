import React from 'react';

const QuestionLabel = ({ question, label }) => (
  <div className="text-center mb-6">
    <h2 className="text-2xl font-bold text-white mb-2">{question}</h2>
    <p className="text-lg text-gray-300">{label}</p>
  </div>
);

export default QuestionLabel;
