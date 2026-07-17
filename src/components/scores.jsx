import { collection, deleteDoc, doc, onSnapshot } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { useAuth } from '../auth/contexts/AuthContext';
import { dbS } from '../auth/firebase';
import { Trash2 } from 'lucide-react';
import * as XLSX from 'xlsx';

const Scores = () => {
  const { currentUser } = useAuth();
  const [scoreData, setscoreData] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(dbS, 'scores'),
      (querySnapshot) => {
        try {
          const quizzesData = querySnapshot.docs
            .map((doc) => {
              const quiz = { id: doc.id, ...doc.data() };
              return quiz;
            })
            .filter((quiz) => quiz.userId === currentUser?.uid);

          setscoreData(quizzesData);
        } catch (error) {
          console.error('Error processing quizzes data:', error);
        }
      },
      (error) => {
        console.error('Error fetching quizzes:', error);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [currentUser?.uid]);

  const filteredScores = scoreData.filter(
    (sc) =>
      sc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sc.quizname.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const paginatedScores = filteredScores.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredScores.length / itemsPerPage);

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(dbS, 'scores', id));
      setscoreData((prev) => prev.filter((score) => score.id !== id));
    } catch (error) {
      console.error('Error deleting score:', error);
    }
  };

  const handleDownloadExcel = () => {
    const dataToExport = paginatedScores.map((score) => ({
      Username: score.name,
      Score: score.score,
      Percentage: score.percentage,
      QuizName: score.quizname,
      Time: new Date(score.timestamp.seconds * 1000).toLocaleString(),
    }));
  
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Displayed Scores');
    XLSX.writeFile(workbook, 'Scores.xlsx');
  };

  return (
    <div className="mx-auto max-w-screen-xl px-4 lg:px-12 mt-5 animate-enter-left">
      <div className="bg-white dark:bg-gray-800 relative shadow-md sm:rounded-lg overflow-hidden">
        <div className="flex flex-col md:flex-row items-center justify-between space-y-3 md:space-y-0 md:space-x-4 p-4 ">
          <div className="w-full md:w-1/2">
            <div className="flex items-center">
              <label htmlFor="simple-search" className="sr-only">
                Search
              </label>
              <div className="relative w-full">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <svg
                    aria-hidden="true"
                    className="w-5 h-5 text-gray-500 dark:text-gray-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <input
                  type="text"
                  id="simple-search"
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full pl-10 p-2 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                  placeholder="Search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>


          <div className="w-full md:w-auto flex flex-col md:flex-row space-y-2 md:space-y-0 items-stretch md:items-center justify-end md:space-x-3 flex-shrink-0">
              
              <div className="flex items-center space-x-3 w-full md:w-auto">
            
                  <button onClick={handleDownloadExcel} className="w-full md:w-auto flex items-center justify-center py-2 px-4 text-sm font-medium text-white focus:outline-none bg-green-500 rounded-lg " type="button">
                    
                      Export to excel
                      
                  </button>
                  
              </div>
          </div>
      </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <th scope="col" className="px-4 py-3">
                  Username
                </th>
                <th scope="col" className="px-4 py-3">
                  Score
                </th>
                <th scope="col" className="px-4 py-3">
                  Score with percentage
                </th>
                <th scope="col" className="px-4 py-3">
                  Quiz name
                </th>
                <th scope="col" className="px-4 py-3">
                  Time
                </th>
                <th scope="col" className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {paginatedScores.length > 0 ? (
                paginatedScores.map((sc, index) => (
                  <tr
                    key={index}
                    className="border-b dark:border-gray-700"
                  >
                    <th
                      scope="row"
                      className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                    >
                      {sc.name}
                    </th>
                    <td className="px-4 py-3">{sc.score}</td>
                    <td className="px-4 py-3">{sc.percentage}</td>
                    <td className="px-4 py-3">{sc.quizname}</td>
                    <td className="px-4 py-3">
                      {new Date(sc.timestamp.seconds * 1000).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 flex items-center justify-end">
                      <button
                        onClick={() => handleDelete(sc.id)}
                        className="inline-flex items-center p-0.5 text-sm font-medium text-center text-gray-500 hover:text-gray-800 rounded-lg focus:outline-none dark:text-gray-400 dark:hover:text-gray-100"
                        type="button"
                      >
                        <Trash2 className="w-5 h-5 text-red-600" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr className="border-b dark:border-gray-700">
                  <th
                    colSpan={6}
                    className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap dark:text-white text-center"
                  >
                    No scores found
                  </th>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <nav
          className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-3 md:space-y-0 p-4"
          aria-label="Table navigation"
        >
          <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
            Showing{' '}
            <span className="font-semibold text-gray-900 dark:text-white">
              {currentPage * itemsPerPage - itemsPerPage + 1}
            </span>{' '}
            to{' '}
            <span className="font-semibold text-gray-900 dark:text-white">
              {Math.min(
                currentPage * itemsPerPage,
                filteredScores.length
              )}
            </span>{' '}
            of{' '}
            <span className="font-semibold text-gray-900 dark:text-white">
              {filteredScores.length}
            </span>
          </span>
          <ul className="inline-flex items-stretch -space-x-px">
            {[...Array(totalPages).keys()].map((page) => (
              <li key={page}>
                <button
                  onClick={() => setCurrentPage(page + 1)}
                  className={`flex items-center justify-center text-sm py-2 px-3 leading-tight border ${
                    currentPage === page + 1
                      ? 'text-primary-600 bg-primary-50 border-primary-300'
                      : 'text-gray-500 bg-white border-gray-300'
                  } hover:bg-gray-100 hover:text-gray-700`}
                >
                  {page + 1}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  );
};

export default Scores;
