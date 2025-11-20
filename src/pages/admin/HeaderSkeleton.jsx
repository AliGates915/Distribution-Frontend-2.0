const HeaderSkeleton = () => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 animate-pulse">
      {/* Left side (Greeting + Date) */}
      <div className="mb-4 md:mb-0 space-y-2">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 bg-gray-200 rounded-full"></div>
          <div className="h-6 w-40 bg-gray-200 rounded"></div>
        </div>
        <div className="h-4 w-56 bg-gray-200 rounded"></div>
      </div>

      {/* Right side (Stats + Notification) */}
      <div className="flex flex-col sm:flex-row gap-4 items-center p-4 rounded-xl">
        <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
      </div>
    </div>
  );
};

export default HeaderSkeleton;
