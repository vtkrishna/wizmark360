import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  X,
  Search,
  Image as ImageIcon,
  Download,
  ExternalLink,
  Loader2,
  Check,
  Filter,
  Grid3X3,
  LayoutGrid,
  Camera,
  RefreshCw
} from "lucide-react";

interface StockImage {
  id: string;
  url: string;
  thumbnailUrl: string;
  photographer: string;
  photographerUrl?: string;
  source: "pexels" | "unsplash" | "pixabay";
  width: number;
  height: number;
  alt?: string;
}

interface StockImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (image: StockImage, localPath?: string) => void;
  brandId?: number;
  brandName?: string;
  vertical?: string;
  initialQuery?: string;
}

const popularSearches = [
  "business meeting",
  "technology",
  "marketing",
  "social media",
  "office workspace",
  "team collaboration",
  "abstract background",
  "nature landscape"
];

const orientations = [
  { value: "", label: "All" },
  { value: "landscape", label: "Landscape" },
  { value: "portrait", label: "Portrait" },
  { value: "square", label: "Square" }
];

export function StockImageModal({
  isOpen,
  onClose,
  onSelect,
  brandId = 1,
  brandName,
  vertical,
  initialQuery = ""
}: StockImageModalProps) {
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [orientation, setOrientation] = useState("");
  const [selectedImage, setSelectedImage] = useState<StockImage | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "large">("grid");

  useEffect(() => {
    if (initialQuery) {
      setSearchQuery(initialQuery);
    }
  }, [initialQuery]);

  const { data: searchResults, isLoading, refetch, isFetching } = useQuery({
    queryKey: ["/api/stock-images/search", searchQuery, orientation],
    queryFn: async () => {
      if (!searchQuery.trim()) return { images: [], totalResults: 0 };
      const params = new URLSearchParams({
        query: searchQuery,
        perPage: "24",
        ...(orientation && { orientation })
      });
      const res = await fetch(`/api/stock-images/search?${params}`);
      if (!res.ok) throw new Error("Failed to search");
      return res.json();
    },
    enabled: isOpen && searchQuery.length > 0,
    staleTime: 60000
  });

  const { data: categories } = useQuery({
    queryKey: ["/api/stock-images/categories"],
    queryFn: async () => {
      const res = await fetch("/api/stock-images/categories");
      if (!res.ok) return { categories: [] };
      return res.json();
    },
    enabled: isOpen,
    staleTime: 300000
  });

  const downloadMutation = useMutation({
    mutationFn: async (image: StockImage) => {
      const res = await fetch("/api/stock-images/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image, brandId, brandName, vertical })
      });
      if (!res.ok) throw new Error("Failed to download");
      return res.json();
    },
    onSuccess: (data, image) => {
      onSelect(image, data.localPath);
      onClose();
    }
  });

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    refetch();
  };

  const handleSelectImage = (image: StockImage) => {
    setSelectedImage(image);
  };

  const handleConfirmSelection = () => {
    if (selectedImage) {
      downloadMutation.mutate(selectedImage);
    }
  };

  const handleDirectSelect = (image: StockImage) => {
    onSelect(image);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-6xl h-[90vh] flex flex-col shadow-2xl mx-4">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
              <ImageIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Stock Image Library</h2>
              <p className="text-sm text-gray-500">Search millions of royalty-free images</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 border-b border-gray-200 dark:border-gray-700 space-y-4">
          <form onSubmit={handleSubmit} className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for images..."
                className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <select
              value={orientation}
              onChange={(e) => setOrientation(e.target.value)}
              className="px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm"
            >
              {orientations.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <button
              type="submit"
              disabled={!searchQuery.trim() || isFetching}
              className="px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-xl font-medium transition-colors flex items-center gap-2"
            >
              {isFetching ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Search className="w-4 h-4" />
              )}
              Search
            </button>
          </form>

          <div className="flex flex-wrap gap-2">
            <span className="text-xs text-gray-500 py-1">Popular:</span>
            {popularSearches.map((term) => (
              <button
                key={term}
                onClick={() => handleSearch(term)}
                className="px-3 py-1 text-xs bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors"
              >
                {term}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-auto p-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <Loader2 className="w-10 h-10 animate-spin text-green-500 mx-auto mb-3" />
                <p className="text-gray-500">Searching images...</p>
              </div>
            </div>
          ) : !searchQuery ? (
            <div className="text-center py-16">
              <Camera className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
                Search for Stock Images
              </h3>
              <p className="text-gray-500 max-w-md mx-auto">
                Enter a search term above to find royalty-free images from Pexels, Unsplash, and other sources
              </p>
              
              {categories?.categories?.length > 0 && (
                <div className="mt-8">
                  <p className="text-sm text-gray-500 mb-3">Or browse by category:</p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {categories.categories.map((cat: string) => (
                      <button
                        key={cat}
                        onClick={() => handleSearch(cat)}
                        className="px-4 py-2 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 hover:border-green-400 rounded-lg text-sm font-medium text-green-700 dark:text-green-400 transition-colors"
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : searchResults?.images?.length === 0 ? (
            <div className="text-center py-16">
              <ImageIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
                No images found
              </h3>
              <p className="text-gray-500">
                Try a different search term or adjust your filters
              </p>
            </div>
          ) : (
            <div className={`grid gap-4 ${viewMode === "grid" ? "grid-cols-2 md:grid-cols-3 lg:grid-cols-4" : "grid-cols-1 md:grid-cols-2"}`}>
              {searchResults?.images?.map((image: StockImage) => (
                <div
                  key={image.id}
                  onClick={() => handleSelectImage(image)}
                  className={`
                    relative group rounded-xl overflow-hidden cursor-pointer border-2 transition-all
                    ${selectedImage?.id === image.id
                      ? "border-green-500 ring-2 ring-green-500/20"
                      : "border-transparent hover:border-gray-300 dark:hover:border-gray-600"
                    }
                  `}
                >
                  <div className={`relative ${viewMode === "grid" ? "aspect-[4/3]" : "aspect-video"}`}>
                    <img
                      src={image.thumbnailUrl}
                      alt={image.alt || "Stock image"}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    
                    {selectedImage?.id === image.id && (
                      <div className="absolute top-2 right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                        <Check className="w-5 h-5 text-white" />
                      </div>
                    )}

                    <div className="absolute bottom-0 left-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <p className="text-white text-sm font-medium truncate">{image.photographer}</p>
                      <p className="text-white/70 text-xs">{image.source} • {image.width}x{image.height}</p>
                    </div>
                  </div>

                  <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDirectSelect(image);
                      }}
                      className="p-2 bg-white/90 hover:bg-white rounded-lg shadow-lg transition-colors"
                      title="Use directly"
                    >
                      <Download className="w-4 h-4 text-gray-700" />
                    </button>
                    {image.photographerUrl && (
                      <a
                        href={image.photographerUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="p-2 bg-white/90 hover:bg-white rounded-lg shadow-lg transition-colors"
                        title="View photographer"
                      >
                        <ExternalLink className="w-4 h-4 text-gray-700" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {selectedImage && (
          <div className="flex items-center justify-between p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
            <div className="flex items-center gap-4">
              <img
                src={selectedImage.thumbnailUrl}
                alt={selectedImage.alt}
                className="w-16 h-12 object-cover rounded-lg"
              />
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  {selectedImage.alt || "Selected Image"}
                </p>
                <p className="text-sm text-gray-500">
                  By {selectedImage.photographer} • {selectedImage.width}x{selectedImage.height}
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setSelectedImage(null)}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmSelection}
                disabled={downloadMutation.isPending}
                className="px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                {downloadMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    Save to Library
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default StockImageModal;
