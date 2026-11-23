const SkeletonProductPreview = () => {
  return (
    <div className="animate-pulse">
      <div className="aspect-[9/16] w-full bg-muted bg-muted" />
      <div className="flex justify-between text-base-regular mt-2">
        <div className="w-2/5 h-6 bg-muted"></div>
        <div className="w-1/5 h-6 bg-muted"></div>
      </div>
    </div>
  )
}

export default SkeletonProductPreview
