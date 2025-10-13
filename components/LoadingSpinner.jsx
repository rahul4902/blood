export const LoadingSpinner = ({ size = "md", className = "" }) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
    xl: "w-12 h-12",
  }

  return (
    <div className={`${sizeClasses[size]} ${className}`}>
      <div className="spinner w-full h-full"></div>
    </div>
  )
}

export const LoadingOverlay = ({ isVisible, message = "Loading..." }) => {
  if (!isVisible) return null

  return (
    <div className="absolute inset-0 loading-overlay flex items-center justify-center z-50 rounded-lg">
      <div className="flex flex-col items-center gap-3">
        <LoadingSpinner size="lg" />
        <p className="text-sm font-medium text-gray-600 dark:text-gray-300">{message}</p>
      </div>
    </div>
  )
}

export const SkeletonLoader = ({ className = "" }) => {
  return (
    <div className={`shimmer bg-gray-200 dark:bg-gray-700 rounded ${className}`}>
      <div className="h-full w-full bg-gray-300 dark:bg-gray-600 rounded animate-pulse"></div>
    </div>
  )
}

export const TableRowSkeleton = () => {
  return (
    <tr className="animate-pulse">
      <td className="p-3 border-r border-gray-200 dark:border-gray-700">
        <SkeletonLoader className="w-5 h-5" />
      </td>
      <td className="p-3 border-r border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <SkeletonLoader className="w-8 h-8 rounded" />
          <SkeletonLoader className="w-24 h-4" />
        </div>
      </td>
      <td className="p-3 border-r border-gray-200 dark:border-gray-700">
        <SkeletonLoader className="w-32 h-4" />
      </td>
      <td className="p-3 border-r border-gray-200 dark:border-gray-700">
        <SkeletonLoader className="w-48 h-4" />
      </td>
      <td className="p-3 border-r border-gray-200 dark:border-gray-700">
        <SkeletonLoader className="w-16 h-4" />
      </td>
      <td className="p-3 border-r border-gray-200 dark:border-gray-700">
        <SkeletonLoader className="w-12 h-6 rounded-full" />
      </td>
      <td className="p-3 border-r border-gray-200 dark:border-gray-700">
        <SkeletonLoader className="w-20 h-4" />
      </td>
      <td className="p-3">
        <div className="flex gap-1">
          <SkeletonLoader className="w-6 h-6 rounded" />
          <SkeletonLoader className="w-6 h-6 rounded" />
        </div>
      </td>
    </tr>
  )
}

export const GridCardSkeleton = () => {
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 animate-pulse">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <SkeletonLoader className="w-5 h-5" />
          <SkeletonLoader className="w-12 h-12 rounded-lg" />
          <SkeletonLoader className="w-16 h-6 rounded-full" />
        </div>
        <div className="flex gap-2">
          <SkeletonLoader className="w-8 h-8 rounded-lg" />
          <SkeletonLoader className="w-8 h-8 rounded-lg" />
        </div>
      </div>
      <div className="space-y-4">
        <div>
          <SkeletonLoader className="w-32 h-6 mb-2" />
        </div>
        <div>
          <SkeletonLoader className="w-16 h-4 mb-1" />
          <SkeletonLoader className="w-full h-8" />
        </div>
        <div>
          <SkeletonLoader className="w-20 h-4 mb-1" />
          <SkeletonLoader className="w-full h-8" />
        </div>
        <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-200 dark:border-gray-700">
          <div>
            <SkeletonLoader className="w-12 h-3 mb-1" />
            <SkeletonLoader className="w-16 h-3" />
          </div>
          <div>
            <SkeletonLoader className="w-12 h-3 mb-1" />
            <SkeletonLoader className="w-16 h-3" />
          </div>
        </div>
      </div>
    </div>
  )
}
