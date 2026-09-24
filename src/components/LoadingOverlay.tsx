const LoadingOverlay = ({ isLoading }: { isLoading: boolean }) => {
  if (!isLoading) return null;

  return (
    <div
      className="loading-overlay absolute inset-0 z-20 flex items-center justify-center bg-white/75 backdrop-blur-xs rounded-xl"
      aria-label="Loading"
      role="status"
    >
      <div className="spinner w-8 h-8 border-3 border-teal-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );
};

export default LoadingOverlay;
