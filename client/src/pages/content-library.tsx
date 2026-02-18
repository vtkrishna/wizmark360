import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import AppShell from "../components/layout/app-shell";
import { ContentSourceSelector, ContentSourceType } from "../components/content-source-selector";
import StockImageModal from "../components/stock-image-modal";
import WebSearchModal from "../components/web-search-modal";
import { useUpload } from "../hooks/use-upload";
import {
  FileText,
  Image,
  Video,
  Mic,
  Search,
  Filter,
  Plus,
  MoreVertical,
  Download,
  Copy,
  Trash2,
  Edit,
  Eye,
  Calendar,
  Tag,
  Folder,
  Grid3X3,
  List,
  Star,
  Clock,
  Globe,
  Instagram,
  Twitter,
  Linkedin,
  Facebook,
  Play,
  Pause,
  RefreshCw,
  Music,
  Loader2,
  X,
  Sparkles
} from "lucide-react";

interface ContentItem {
  id: string;
  name: string;
  type: "text" | "image" | "video" | "audio" | "music" | "voice";
  status: "draft" | "processing" | "published" | "archived";
  content?: string;
  url?: string;
  language: string;
  createdAt: string;
  updatedAt: string;
  author: string;
  tags: string[];
  metadata?: Record<string, any>;
  vertical?: string;
}

const indianLanguages = [
  { code: "hi", name: "Hindi", native: "हिन्दी" },
  { code: "ta", name: "Tamil", native: "தமிழ்" },
  { code: "te", name: "Telugu", native: "తెలుగు" },
  { code: "bn", name: "Bengali", native: "বাংলা" },
  { code: "mr", name: "Marathi", native: "मराठी" },
  { code: "gu", name: "Gujarati", native: "ગુજરાતી" },
  { code: "kn", name: "Kannada", native: "ಕನ್ನಡ" },
  { code: "ml", name: "Malayalam", native: "മലയാളം" },
  { code: "pa", name: "Punjabi", native: "ਪੰਜਾਬੀ" },
  { code: "or", name: "Odia", native: "ଓଡ଼ିଆ" },
  { code: "as", name: "Assamese", native: "অসমীয়া" },
  { code: "en", name: "English", native: "English" }
];

const platformIcons: Record<string, any> = {
  Instagram: Instagram,
  Twitter: Twitter,
  LinkedIn: Linkedin,
  Facebook: Facebook,
  WhatsApp: Globe,
  Email: FileText,
  Blog: FileText,
  Website: Globe
};

export default function ContentLibraryPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterVertical, setFilterVertical] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedContent, setSelectedContent] = useState<ContentItem | null>(null);
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedSource, setSelectedSource] = useState<ContentSourceType | null>(null);
  const [showStockImageModal, setShowStockImageModal] = useState(false);
  const [showWebSearchModal, setShowWebSearchModal] = useState(false);
  const [inspirationContent, setInspirationContent] = useState<string>("");

  const { uploadFile, isUploading, progress: uploadProgress } = useUpload({
    onSuccess: async (response) => {
      try {
        await fetch("/api/content-library", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            name: response.metadata.name,
            type: response.metadata.contentType?.startsWith("image/") ? "image"
              : response.metadata.contentType?.startsWith("video/") ? "video"
              : response.metadata.contentType?.startsWith("audio/") ? "audio"
              : "text",
            content: `Uploaded file: ${response.metadata.name}`,
            url: response.objectPath,
            status: "published",
            metadata: { source: "upload", objectPath: response.objectPath, contentType: response.metadata.contentType }
          }),
        });
        refetch();
      } catch (err) {
        console.error("Failed to save uploaded content:", err);
      }
    },
  });

  const handleSourceSelect = (source: ContentSourceType) => {
    setSelectedSource(source);
    setShowCreateModal(false);
    
    switch (source) {
      case "stock":
        setShowStockImageModal(true);
        break;
      case "web":
        setShowWebSearchModal(true);
        break;
      case "ai":
        window.location.href = "/god-mode";
        break;
      case "upload": {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = "image/*,video/*,audio/*,.pdf,.doc,.docx,.txt";
        input.onchange = (e) => {
          const file = (e.target as HTMLInputElement).files?.[0];
          if (file) uploadFile(file);
        };
        input.click();
        break;
      }
      case "library":
        break;
    }
  };

  const handleStockImageSelect = (image: any, localPath?: string) => {
    refetch();
  };

  const handleInspirationSelect = (content: string, source: string) => {
    setInspirationContent(content);
    window.location.href = `/god-mode?inspiration=${encodeURIComponent(content)}`;
  };

  const { data: brandsData } = useQuery({
    queryKey: ["/api/brands"],
    queryFn: async () => {
      const res = await fetch("/api/brands");
      if (!res.ok) return [];
      return res.json();
    },
  });

  const dynamicBrandName = brandsData && Array.isArray(brandsData) && brandsData.length > 0
    ? brandsData[0].name
    : "WizMark 360";

  const { data: apiContent, isLoading, refetch } = useQuery({
    queryKey: ["/api/content-library"],
    queryFn: async () => {
      const res = await fetch("/api/content-library?limit=100");
      if (!res.ok) return [];
      const data = await res.json();
      return data.items || [];
    },
    staleTime: 30000
  });

  const content: ContentItem[] = (apiContent || []).map((item: any) => ({
    id: item.id,
    name: item.name,
    type: item.type || "text",
    status: item.status || "published",
    content: item.content,
    url: item.url,
    language: item.language || "English",
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
    author: item.author || "AI Generated",
    tags: Array.isArray(item.tags) ? item.tags : [],
    metadata: item.metadata,
    vertical: item.metadata?.vertical || item.metadata?.brandId ? "social" : "general"
  }));

  const filteredContent = content.filter(item => {
    const matchesSearch = (item.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.tags || []).some((tag: string) => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesType = filterType === "all" || item.type === filterType;
    const matchesStatus = filterStatus === "all" || item.status === filterStatus;
    const matchesVertical = filterVertical === "all" || item.vertical === filterVertical;
    return matchesSearch && matchesType && matchesStatus && matchesVertical;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "text": return FileText;
      case "image": return Image;
      case "video": return Video;
      case "audio": return Mic;
      case "music": return Music;
      case "voice": return Mic;
      default: return FileText;
    }
  };

  const getStatusColor = (status: ContentItem["status"]) => {
    switch (status) {
      case "draft": return "bg-gray-100 text-gray-700";
      case "processing": return "bg-blue-100 text-blue-700";
      case "published": return "bg-green-100 text-green-700";
      case "archived": return "bg-yellow-100 text-yellow-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const verticalColors: Record<string, string> = {
    social: "bg-pink-100 text-pink-700",
    seo: "bg-green-100 text-green-700",
    web: "bg-blue-100 text-blue-700",
    sales: "bg-orange-100 text-orange-700",
    whatsapp: "bg-emerald-100 text-emerald-700",
    linkedin: "bg-sky-100 text-sky-700",
    performance: "bg-purple-100 text-purple-700"
  };

  return (
    <AppShell currentBrand={{ id: 1, name: "Content Library" }}>
      <div className="h-full flex">
        <div className="flex-1 overflow-auto p-6 bg-gray-50 dark:bg-gray-900">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Content Library</h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">Manage all your AI-generated content across verticals</p>
              </div>
              <button 
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                <Plus className="w-4 h-4" />
                Create Content
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{content.length}</p>
                    <p className="text-sm text-gray-500">Total Items</p>
                  </div>
                  <Folder className="w-8 h-8 text-blue-500" />
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{content.filter(c => c.status === "published").length}</p>
                    <p className="text-sm text-gray-500">Published</p>
                  </div>
                  <Globe className="w-8 h-8 text-green-500" />
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{content.filter(c => c.status === "draft").length}</p>
                    <p className="text-sm text-gray-500">Drafts</p>
                  </div>
                  <Edit className="w-8 h-8 text-gray-500" />
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{content.filter(c => c.type === "image").length}</p>
                    <p className="text-sm text-gray-500">Images</p>
                  </div>
                  <Image className="w-8 h-8 text-purple-500" />
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">12</p>
                    <p className="text-sm text-gray-500">Languages</p>
                  </div>
                  <Globe className="w-8 h-8 text-orange-500" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-orange-500 to-amber-600 rounded-xl p-5 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-lg mb-1">Multilingual Content Support</h3>
                  <p className="text-white/80 text-sm">Create and manage content in 22 Indian languages with AI-powered translation</p>
                </div>
                <div className="flex flex-wrap gap-2 max-w-xl">
                  {indianLanguages.slice(0, 6).map((lang) => (
                    <span key={lang.code} className="px-2 py-1 bg-white/20 rounded text-xs font-medium">
                      {lang.native}
                    </span>
                  ))}
                  <span className="px-2 py-1 bg-white/20 rounded text-xs font-medium">+6 more</span>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex flex-wrap items-center gap-4">
                  <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search content..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm"
                  >
                    <option value="all">All Types</option>
                    <option value="text">Text</option>
                    <option value="image">Image</option>
                    <option value="video">Video</option>
                    <option value="audio">Audio</option>
                  </select>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm"
                  >
                    <option value="all">All Status</option>
                    <option value="draft">Draft</option>
                    <option value="approved">Approved</option>
                    <option value="published">Published</option>
                    <option value="archived">Archived</option>
                  </select>
                  <select
                    value={filterVertical}
                    onChange={(e) => setFilterVertical(e.target.value)}
                    className="px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm"
                  >
                    <option value="all">All Verticals</option>
                    <option value="social">Social Media</option>
                    <option value="seo">SEO & GEO</option>
                    <option value="web">Web Dev</option>
                    <option value="sales">Sales SDR</option>
                    <option value="whatsapp">WhatsApp</option>
                    <option value="linkedin">LinkedIn</option>
                    <option value="performance">Performance</option>
                  </select>
                  <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                    <button
                      onClick={() => setViewMode("grid")}
                      className={`p-2 rounded ${viewMode === "grid" ? "bg-white dark:bg-gray-600 shadow-sm" : ""}`}
                    >
                      <Grid3X3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setViewMode("list")}
                      className={`p-2 rounded ${viewMode === "list" ? "bg-white dark:bg-gray-600 shadow-sm" : ""}`}
                    >
                      <List className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {viewMode === "grid" ? (
                <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {filteredContent.map((item) => {
                    const TypeIcon = getTypeIcon(item.type);
                    const platform = item.metadata?.platform as string | undefined;
                    const PlatformIcon = platform ? platformIcons[platform] || Globe : Globe;
                    return (
                      <div
                        key={item.id}
                        onClick={() => setSelectedContent(item)}
                        className="p-4 border border-gray-200 dark:border-gray-700 rounded-xl hover:border-blue-300 hover:shadow-md transition-all cursor-pointer"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                            <TypeIcon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                            {item.status}
                          </span>
                        </div>
                        <h3 className="font-medium text-gray-900 dark:text-white mb-1 line-clamp-2">{item.name}</h3>
                        <p className="text-sm text-gray-500 mb-3 line-clamp-2">{item.content}</p>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`px-2 py-0.5 rounded text-xs ${verticalColors[item.vertical || "social"]}`}>
                            {item.vertical}
                          </span>
                          <span className="text-xs text-gray-400">{item.language}</span>
                          {platform && (
                            <div className="flex items-center gap-1 text-xs text-gray-400">
                              <PlatformIcon className="w-3 h-3" />
                              {platform}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredContent.map((item) => {
                    const TypeIcon = getTypeIcon(item.type);
                    return (
                      <div
                        key={item.id}
                        onClick={() => setSelectedContent(item)}
                        className="p-4 flex items-center gap-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer"
                      >
                        <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                          <TypeIcon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-gray-900 dark:text-white">{item.name}</h3>
                          <p className="text-sm text-gray-500 truncate">{item.content}</p>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-xs ${verticalColors[item.vertical || "social"]}`}>
                          {item.vertical}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                          {item.status}
                        </span>
                        <span className="text-sm text-gray-400">{item.updatedAt}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {selectedContent && (
          <div className="w-96 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 p-6 overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Content Details</h2>
              <button
                onClick={() => setSelectedContent(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">{selectedContent.name}</h3>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedContent.status)}`}>
                    {selectedContent.status}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-xs ${verticalColors[selectedContent.vertical || "social"]}`}>
                    {selectedContent.vertical}
                  </span>
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <p className="text-sm text-gray-600 dark:text-gray-300">{selectedContent.content}</p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-500">Created:</span>
                  <span className="text-gray-900 dark:text-white">{selectedContent.createdAt}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-500">Updated:</span>
                  <span className="text-gray-900 dark:text-white">{selectedContent.updatedAt}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Globe className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-500">Language:</span>
                  <span className="text-gray-900 dark:text-white">{selectedContent.language}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Star className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-500">Author:</span>
                  <span className="text-gray-900 dark:text-white">{selectedContent.author}</span>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-500 mb-2">Tags</p>
                <div className="flex flex-wrap gap-2">
                  {selectedContent.tags.map((tag) => (
                    <span key={tag} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs text-gray-600 dark:text-gray-300">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
                  <Edit className="w-4 h-4" />
                  Edit
                </button>
                <button className="p-2.5 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
                  <Copy className="w-4 h-4 text-gray-500" />
                </button>
                <button className="p-2.5 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
                  <Download className="w-4 h-4 text-gray-500" />
                </button>
                <button className="p-2.5 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
                  <Trash2 className="w-4 h-4 text-red-500" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-2xl shadow-2xl mx-4 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Create New Content</h2>
                  <p className="text-sm text-gray-500">Choose how you want to create content</p>
                </div>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <ContentSourceSelector
              selectedSource={selectedSource}
              onSourceSelect={handleSourceSelect}
              vertical={filterVertical !== "all" ? filterVertical : undefined}
            />
          </div>
        </div>
      )}

      <StockImageModal
        isOpen={showStockImageModal}
        onClose={() => setShowStockImageModal(false)}
        onSelect={handleStockImageSelect}
        brandId={1}
        brandName={dynamicBrandName}
        vertical={filterVertical !== "all" ? filterVertical : undefined}
      />

      <WebSearchModal
        isOpen={showWebSearchModal}
        onClose={() => setShowWebSearchModal(false)}
        onInspirationSelect={handleInspirationSelect}
        vertical={filterVertical !== "all" ? filterVertical : "general"}
      />
    </AppShell>
  );
}
