// src/components/ChartSkeleton.jsx
const ChartSkeleton = ({ type = "line" }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 relative overflow-hidden">
      {/* Shimmer effect */}
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-gray-100/80 to-transparent" />

      {/* Title + Tabs */}
      <div className="flex justify-between items-center mb-6">
        <div className="h-5 w-32 bg-gray-200 rounded"></div>
        <div className="flex space-x-2">
          <div className="h-6 w-12 bg-gray-200 rounded-full"></div>
          <div className="h-6 w-12 bg-gray-200 rounded-full"></div>
          <div className="h-6 w-12 bg-gray-200 rounded-full"></div>
        </div>
      </div>

      {/* Chart area */}
      <div className="h-64 flex items-end gap-3">
        {type === "bar"
          ? Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="flex-1 bg-gray-200 rounded-t-md"
                style={{ height: `${40 + i * 20}px` }}
              ></div>
            ))
          : (
            <div className="w-full h-full flex flex-col justify-center">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="h-4 bg-gray-200 rounded my-3 w-[90%]"
                ></div>
              ))}
            </div>
          )}
      </div>

      {/* Shimmer keyframes */}
      <style jsx>{`
        @keyframes shimmer {
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </div>
  );
};

export default ChartSkeleton;
