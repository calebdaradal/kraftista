export function ProductCardSkeleton() {
  return (
    <div className="group bg-card rounded-xl overflow-hidden border border-border flex flex-col h-full animate-pulse">
      {/* Image Skeleton */}
      <div className="relative h-64 bg-muted" />

      {/* Content Skeleton */}
      <div className="p-4 flex flex-col flex-1 space-y-3">
        {/* Category */}
        <div className="h-3 bg-muted rounded w-20" />
        
        {/* Product Name */}
        <div className="space-y-2">
          <div className="h-4 bg-muted rounded w-full" />
          <div className="h-4 bg-muted rounded w-3/4" />
        </div>

        {/* Price */}
        <div className="h-5 bg-muted rounded w-24 mt-auto" />

        {/* Rating */}
        <div className="h-4 bg-muted rounded w-32" />

        {/* Stock Status */}
        <div className="h-4 bg-muted rounded w-16" />
      </div>
    </div>
  );
}

export function CategoryCardSkeleton() {
  return (
    <div className="group bg-card rounded-xl overflow-hidden border border-border flex flex-col animate-pulse">
      {/* Image Skeleton */}
      <div className="relative h-48 bg-muted" />

      {/* Content Skeleton */}
      <div className="p-4 flex flex-col flex-1 text-center space-y-3">
        {/* Category Name */}
        <div className="h-5 bg-muted rounded w-3/4 mx-auto" />
        
        {/* Shop Now */}
        <div className="h-4 bg-muted rounded w-20 mx-auto" />
      </div>
    </div>
  );
}

export function ImageSkeleton({ aspectRatio = "square" }: { aspectRatio?: "square" | "video" | "portrait" }) {
  const heightClass = {
    square: "aspect-square",
    video: "aspect-video", 
    portrait: "aspect-[3/4]",
  }[aspectRatio];

  return (
    <div className={`${heightClass} bg-muted animate-pulse rounded relative overflow-hidden`}>
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-muted-foreground/5 to-transparent shimmer" />
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function CategoryGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <CategoryCardSkeleton key={i} />
      ))}
    </div>
  );
}
