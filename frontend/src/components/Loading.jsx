const Loading = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900">
      <div className="relative w-24 h-24">
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-indigo-500 border-r-green-500 border-b-orange-500 border-l-purple-500 animate-spin"></div>
        <div className="absolute inset-2 rounded-full border-4 border-transparent border-t-purple-500 border-r-indigo-500 border-b-green-500 border-l-orange-500 animate-spin-reverse"></div>
      </div>
      <p className="mt-6 text-white text-xl font-semibold">Loading</p>
    </div>
  );
};

export default Loading;
