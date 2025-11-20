// src/components/TableSkeleton.jsx


const TableSkeleton = ({ rows = 5, cols = 4, className = "" }) => {
  return (
    <div className="flex flex-col divide-y divide-gray-100">
      {Array.from({ length: rows }).map((_, rowIdx) => (
        <div
          key={rowIdx}
          className={`grid grid-cols-1 md:grid-cols-[repeat(var(--cols),1fr)] gap-6 px-6 py-4 bg-white animate-pulse ${className}`}
          style={{ "--cols": cols }}
        >
          {Array.from({ length: cols }).map((_, colIdx) => (
            <div
              key={colIdx}
              className={`h-5 w-24 bg-gray-200 rounded ${
                colIdx === cols - 1 ? "" : ""
              }`}
            ></div>
          ))}
        </div>
      ))}
    </div>
  );
};


export default TableSkeleton;
