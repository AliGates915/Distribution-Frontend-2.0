// src/components/DasboardTableSkelton.jsx
const DasboardTableSkelton = ({ rows = 5, cols = 7, className = "" }) => {
  return (
    <div className="flex flex-col divide-y divide-gray-100">
      {Array.from({ length: rows }).map((_, rowIdx) => (
        <div
          key={rowIdx}
          className={`grid items-center px-6 py-4 bg-white animate-pulse ${className}`}
          style={{
            gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`, // same as header
          }}
        >
          {Array.from({ length: cols }).map((_, colIdx) => (
            <div
              key={colIdx}
              className="h-4 bg-gray-200 rounded w-full max-w-[120px]" 
            ></div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default DasboardTableSkelton;
