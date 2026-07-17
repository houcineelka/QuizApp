import React from 'react';

const ExcelQuestions = ({handleFileUploadExcel}) => {
  return (
    <div className="flex items-center justify-center w-full bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-2 rounded-lg shadow-md hover:from-green-600 hover:to-green-700 transform transition duration-300 ease-in-out mt-4 cursor-pointer">
        <label
          htmlFor="file-upload"
          className="flex items-center justify-center cursor-pointer w-full"
        >
          <span className="text-lg font-bold">
            <svg xmlns="http://www.w3.org/2000/svg" width={20} height={20} viewBox="0,0,256,256">
              <g
                fill="#ffffff"
                fillRule="nonzero"
                stroke="none"
                strokeWidth={1}
                strokeLinecap="butt"
                strokeLinejoin="miter"
                strokeMiterlimit={10}
                fontFamily="none"
                fontWeight="none"
                fontSize="none"
                textAnchor="none"
                style={{ mixBlendMode: 'normal' }}
              >
                <g transform="scale(5.12,5.12)">
                  <path d="M28.8125,0.03125l-28,5.3125c-0.47266,0.08984 -0.8125,0.51953 -0.8125,1v37.3125c0,0.48047 0.33984,0.91016 0.8125,1l28,5.3125c0.0625,0.01172 0.125,0.03125 0.1875,0.03125c0.23047,0 0.44531,-0.07031 0.625,-0.21875c0.23047,-0.19141 0.375,-0.48437 0.375,-0.78125v-48c0,-0.29687 -0.14453,-0.58984 -0.375,-0.78125c-0.23047,-0.19141 -0.51953,-0.24219 -0.8125,-0.1875zM32,6v7h2v2h-2v5h2v2h-2v5h2v2h-2v6h2v2h-2v7h15c1.10156,0 2,-0.89844 2,-2v-34c0,-1.10156 -0.89844,-2 -2,-2zM36,13h8v2h-8zM6.6875,15.6875h5.125l2.6875,5.59375c0.21094,0.44141 0.39844,0.98438 0.5625,1.59375h0.03125c0.10547,-0.36328 0.30859,-0.93359 0.59375,-1.65625l2.96875,-5.53125h4.6875l-5.59375,9.25l5.75,9.4375h-4.96875l-3.25,-6.09375c-0.12109,-0.22656 -0.24609,-0.64453 -0.375,-1.25h-0.03125c-0.0625,0.28516 -0.21094,0.73047 -0.4375,1.3125l-3.25,6.03125h-5l5.96875,-9.34375zM36,20h8v2h-8zM36,27h8v2h-8zM36,35h8v2h-8z" />
                </g>
              </g>
            </svg>
          </span>
          <span className="ml-2 text-xs font-bold">Export from Excel File</span>
        </label>
        <input
          id="file-upload"
          type="file"
          className="hidden"
          accept=".xlsx, .xls" 
          onChange={handleFileUploadExcel}
        />
        
    </div>
    
  );
}

export default ExcelQuestions;
