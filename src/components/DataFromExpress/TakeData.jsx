import { useState, useEffect } from 'react';

const TakeData = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${process.env.REACT_APP_EXPRESS_API_URL || 'http://localhost:9800'}/scrape`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: 'https://waytolearnx.com/2018/12/qcm-framework-spring-partie-1.html'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to fetch questions');
      }

      const data = await response.json();
      setQuestions(data.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  if (loading) {
    return <div className="flex justify-center items-center p-4">Loading questions...</div>;
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-600 rounded-lg">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Quiz Questions</h1>
      
      {questions.map((question, index) => (
        <div key={index} className="mb-8 p-6 bg-white rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">
            {question.question}
          </h2>
          
          <div className="space-y-3">
            {question.choices.map((choice, choiceIndex) => (
              <div 
                key={choiceIndex}
                className="flex items-start p-3 bg-gray-50 rounded hover:bg-gray-100 transition-colors"
              >
                <span>{choice.text}</span>{choice.correct && <span className="ml-2 text-green-500">✓</span>}
              </div>
            ))}
          </div>
        </div>
      ))}
      
      <button
        onClick={fetchQuestions}
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
      >
        Refresh Questions
      </button>
    </div>
  );
};

export default TakeData;