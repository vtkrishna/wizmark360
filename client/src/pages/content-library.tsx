import { useState } from "react";
import AppShell from "../components/layout/app-shell";
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
  Facebook
} from "lucide-react";

interface ContentItem {
  id: number;
  title: string;
  type: "text" | "image" | "video" | "audio";
  status: "draft" | "approved" | "published" | "archived";
  platform?: string;
  language: string;
  createdAt: string;
  updatedAt: string;
  author: string;
  tags: string[];
  preview?: string;
  vertical: string;
}

const sampleContent: ContentItem[] = [
  {
    id: 1,
    title: "Diwali Campaign - Instagram Post",
    type: "image",
    status: "published",
    platform: "Instagram",
    language: "Hindi",
    createdAt: "2024-10-15",
    updatedAt: "2024-10-18",
    author: "Content Creator AI",
    tags: ["diwali", "festival", "campaign"],
    preview: "दीपावली की हार्दिक शुभकामनाएं! इस त्योहार...",
    vertical: "social"
  },
  {
    id: 2,
    title: "Product Launch Email Sequence",
    type: "text",
    status: "approved",
    platform: "Email",
    language: "English",
    createdAt: "2024-11-01",
    updatedAt: "2024-11-05",
    author: "Sales SDR Agent",
    tags: ["email", "product-launch", "sequence"],
    preview: "Introducing our revolutionary new product that will transform...",
    vertical: "sales"
  },
  {
    id: 3,
    title: "LinkedIn Thought Leadership Article",
    type: "text",
    status: "draft",
    platform: "LinkedIn",
    language: "English",
    createdAt: "2024-11-20",
    updatedAt: "2024-11-20",
    author: "Authority Builder AI",
    tags: ["linkedin", "thought-leadership", "B2B"],
    preview: "5 Trends That Will Shape B2B Marketing in 2025...",
    vertical: "linkedin"
  },
  {
    id: 4,
    title: "WhatsApp Broadcast - Holiday Sale",
    type: "text",
    status: "published",
    platform: "WhatsApp",
    language: "Hindi",
    createdAt: "2024-12-01",
    updatedAt: "2024-12-01",
    author: "Campaign Automator AI",
    tags: ["whatsapp", "sale", "broadcast"],
    preview: "🎉 विशेष छूट! सभी उत्पादों पर 50% की छूट...",
    vertical: "whatsapp"
  },
  {
    id: 5,
    title: "SEO Blog Post - AI Marketing Guide",
    type: "text",
    status: "published",
    platform: "Blog",
    language: "English",
    createdAt: "2024-11-10",
    updatedAt: "2024-11-12",
    author: "Content Optimizer AI",
    tags: ["seo", "ai", "marketing", "guide"],
    preview: "The Complete Guide to AI-Powered Marketing in 2024...",
    vertical: "seo"
  },
  {
    id: 6,
    title: "Facebook Ad Creative - Summer Collection",
    type: "image",
    status: "approved",
    platform: "Facebook",
    language: "English",
    createdAt: "2024-11-25",
    updatedAt: "2024-11-28",
    author: "Creative Factory AI",
    tags: ["facebook", "ad", "creative"],
    preview: "Summer styles that turn heads. Shop now!",
    vertical: "performance"
  },
  {
    id: 7,
    title: "Website Hero Section Copy",
    type: "text",
    status: "published",
    platform: "Website",
    language: "English",
    createdAt: "2024-10-05",
    updatedAt: "2024-10-10",
    author: "AI Page Builder",
    tags: ["website", "hero", "copy"],
    preview: "Transform your business with AI-powered solutions...",
    vertical: "web"
  },
  {
    id: 8,
    title: "Voice Message Template - Customer Support",
    type: "audio",
    status: "approved",
    platform: "WhatsApp",
    language: "Hindi",
    createdAt: "2024-12-05",
    updatedAt: "2024-12-05",
    author: "Voice Agent AI",
    tags: ["voice", "support", "template"],
    preview: "नमस्ते, मैं आपकी कैसे सहायता कर सकता हूं?",
    vertical: "whatsapp"
  }
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
  const [content] = useState<ContentItem[]>(sampleContent);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterVertical, setFilterVertical] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedContent, setSelectedContent] = useState<ContentItem | null>(null);

  const filteredContent = content.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesType = filterType === "all" || item.type === filterType;
    const matchesStatus = filterStatus === "all" || item.status === filterStatus;
    const matchesVertical = filterVertical === "all" || item.vertical === filterVertical;
    return matchesSearch && matchesType && matchesStatus && matchesVertical;
  });

  const getTypeIcon = (type: ContentItem["type"]) => {
    switch (type) {
      case "text": return FileText;
      case "image": return Image;
      case "video": return Video;
      case "audio": return Mic;
    }
  };

  const getStatusColor = (status: ContentItem["status"]) => {
    switch (status) {
      case "draft": return "bg-gray-100 text-gray-700";
      case "approved": return "bg-blue-100 text-blue-700";
      case "published": return "bg-green-100 text-green-700";
      case "archived": return "bg-yellow-100 text-yellow-700";
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
    <AppShell currentBrand={{ id: 1, name: "Acme Corp" }}>
      <div className="h-full flex">
        <div className="flex-1 overflow-auto p-6 bg-gray-50 dark:bg-gray-900">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Content Library</h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">Manage all your AI-generated content across verticals</p>
              </div>
              <button className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
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
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">4</p>
                    <p className="text-sm text-gray-500">Languages</p>
                  </div>
                  <Globe className="w-8 h-8 text-orange-500" />
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
                    const PlatformIcon = item.platform ? platformIcons[item.platform] || Globe : Globe;
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
                        <h3 className="font-medium text-gray-900 dark:text-white mb-1 line-clamp-2">{item.title}</h3>
                        <p className="text-sm text-gray-500 mb-3 line-clamp-2">{item.preview}</p>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`px-2 py-0.5 rounded text-xs ${verticalColors[item.vertical]}`}>
                            {item.vertical}
                          </span>
                          <span className="text-xs text-gray-400">{item.language}</span>
                          {item.platform && (
                            <div className="flex items-center gap-1 text-xs text-gray-400">
                              <PlatformIcon className="w-3 h-3" />
                              {item.platform}
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
                          <h3 className="font-medium text-gray-900 dark:text-white">{item.title}</h3>
                          <p className="text-sm text-gray-500 truncate">{item.preview}</p>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-xs ${verticalColors[item.vertical]}`}>
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
                <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">{selectedContent.title}</h3>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedContent.status)}`}>
                    {selectedContent.status}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-xs ${verticalColors[selectedContent.vertical]}`}>
                    {selectedContent.vertical}
                  </span>
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <p className="text-sm text-gray-600 dark:text-gray-300">{selectedContent.preview}</p>
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
    </AppShell>
  );
}
