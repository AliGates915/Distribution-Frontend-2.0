// src/components/SummaryCardSkeleton.jsx
const SummaryCardSkeleton = ({ count = 6 }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="bg-white rounded-xl shadow-sm p-4 border border-gray-100 overflow-hidden relative"
        >
          {/* Shimmer effect */}
          <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-gray-100/80 to-transparent" />

          {/* Icon + Change Badge */}
          <div className="flex justify-between items-start">
            <div className="h-10 w-10 bg-gray-200 rounded-lg"></div>
            <div className="h-5 w-14 bg-gray-200 rounded-full"></div>
          </div>

          {/* Value + Title */}
          <div className="mt-6 space-y-3">
            <div className="h-7 w-20 bg-gray-200 rounded-md"></div>
            <div className="h-4 w-28 bg-gray-200 rounded"></div>
          </div>
        </div>
      ))}

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

export default SummaryCardSkeleton;