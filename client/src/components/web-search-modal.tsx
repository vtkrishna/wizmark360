import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  X,
  Search,
  Globe,
  ExternalLink,
  Loader2,
  Lightbulb,
  Copy,
  Check,
  Sparkles,
  BookOpen,
  TrendingUp
} from "lucide-react";

interface WebSearchResult {
  title: string;
  url: string;
  snippet: string;
  source?: string;
}

interface WebSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInspirationSelect: (content: string, source: string) => void;
  vertical?: string;
  initialQuery?: string;
}

const searchSuggestions: Record<string, string[]> = {
  social: [
    "trending social media post ideas 2024",
    "viral content strategies Instagram",
    "engaging captions examples",
    "social media content calendar ideas"
  ],
  seo: [
    "SEO best practices 2024",
    "keyword research strategies",
    "content optimization tips",
    "blog post structure templates"
  ],
  web: [
    "landing page design trends",
    "website copy best practices",
    "conversion optimization tips",
    "UX writing examples"
  ],
  sales: [
    "B2B sales email templates",
    "cold outreach best practices",
    "sales pitch examples",
    "lead nurturing strategies"
  ],
  whatsapp: [
    "WhatsApp marketing templates",
    "business messaging best practices",
    "conversational marketing examples",
    "chatbot response templates"
  ],
  linkedin: [
    "LinkedIn post ideas B2B",
    "thought leadership content examples",
    "professional networking tips",
    "LinkedIn engagement strategies"
  ],
  performance: [
    "high converting ad copy examples",
    "Facebook ad creative ideas",
    "Google ads best practices",
    "PPC optimization strategies"
  ],
  general: [
    "marketing content ideas",
    "brand storytelling examples",
    "content marketing trends 2024",
    "creative campaign ideas"
  ]
};

export function WebSearchModal({
  isOpen,
  onClose,
  onInspirationSelect,
  vertical = "general",
  initialQuery = ""
}: WebSearchModalProps) {
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [searchResults, setSearchResults] = useState<WebSearchResult[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const searchMutation = useMutation({
    mutationFn: async (query: string) => {
      const res = await fetch("/api/web-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, vertical })
      });
      if (!res.ok) throw new Error("Search failed");
      return res.json();
    },
    onSuccess: (data) => {
      setSearchResults(data.results || []);
    }
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      searchMutation.mutate(searchQuery);
    }
  };

  const handleQuickSearch = (query: string) => {
    setSearchQuery(query);
    searchMutation.mutate(query);
  };

  const handleCopySnippet = (snippet: string, id: string) => {
    navigator.clipboard.writeText(snippet);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleUseAsInspiration = (result: WebSearchResult) => {
    onInspirationSelect(result.snippet, result.url);
    onClose();
  };

  const suggestions = searchSuggestions[vertical] || searchSuggestions.general;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-4xl h-[80vh] flex flex-col shadow-2xl mx-4">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl flex items-center justify-center">
              <Globe className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Web Search for Inspiration</h2>
              <p className="text-sm text-gray-500">Find content ideas and inspiration from the web</p>
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
          <form onSubmit={handleSearch} className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for content inspiration..."
                className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <button
              type="submit"
              disabled={!searchQuery.trim() || searchMutation.isPending}
              className="px-6 py-3 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 text-white rounded-xl font-medium transition-colors flex items-center gap-2"
            >
              {searchMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Search className="w-4 h-4" />
              )}
              Search
            </button>
          </form>

          <div className="flex flex-wrap gap-2">
            <span className="text-xs text-gray-500 py-1 flex items-center gap-1">
              <Lightbulb className="w-3 h-3" /> Suggestions:
            </span>
            {suggestions.map((term) => (
              <button
                key={term}
                onClick={() => handleQuickSearch(term)}
                className="px-3 py-1 text-xs bg-orange-50 dark:bg-orange-900/20 hover:bg-orange-100 dark:hover:bg-orange-900/30 text-orange-700 dark:text-orange-400 rounded-full transition-colors"
              >
                {term}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-auto p-4">
          {searchMutation.isPending ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <Loader2 className="w-10 h-10 animate-spin text-orange-500 mx-auto mb-3" />
                <p className="text-gray-500">Searching the web...</p>
              </div>
            </div>
          ) : searchResults.length === 0 && !searchQuery ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-gradient-to-br from-orange-100 to-amber-100 dark:from-orange-900/30 dark:to-amber-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-10 h-10 text-orange-500" />
              </div>
              <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
                Find Content Inspiration
              </h3>
              <p className="text-gray-500 max-w-md mx-auto mb-6">
                Search the web for trending topics, content ideas, and inspiration for your {vertical} marketing content
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl text-left">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-5 h-5 text-purple-500" />
                    <span className="font-medium text-gray-900 dark:text-white">Trending Topics</span>
                  </div>
                  <p className="text-sm text-gray-500">Discover what's popular in your industry right now</p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl text-left">
                  <div className="flex items-center gap-2 mb-2">
                    <BookOpen className="w-5 h-5 text-blue-500" />
                    <span className="font-medium text-gray-900 dark:text-white">Best Practices</span>
                  </div>
                  <p className="text-sm text-gray-500">Learn from successful content strategies</p>
                </div>
              </div>
            </div>
          ) : searchResults.length === 0 ? (
            <div className="text-center py-16">
              <Globe className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
                No results found
              </h3>
              <p className="text-gray-500">
                Try different search terms or check the suggestions above
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-gray-500">{searchResults.length} results found</p>
              {searchResults.map((result, index) => (
                <div
                  key={`${result.url}-${index}`}
                  className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:border-orange-300 dark:hover:border-orange-700 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 dark:text-white mb-1 line-clamp-1">
                        {result.title}
                      </h4>
                      <a
                        href={result.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-500 hover:underline mb-2 block truncate"
                      >
                        {result.url}
                      </a>
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
                        {result.snippet}
                      </p>
                    </div>
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => handleCopySnippet(result.snippet, `${index}`)}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        title="Copy snippet"
                      >
                        {copiedId === `${index}` ? (
                          <Check className="w-4 h-4 text-green-500" />
                        ) : (
                          <Copy className="w-4 h-4 text-gray-500" />
                        )}
                      </button>
                      <a
                        href={result.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        title="Open link"
                      >
                        <ExternalLink className="w-4 h-4 text-gray-500" />
                      </a>
                    </div>
                  </div>
                  <div className="flex justify-end mt-3">
                    <button
                      onClick={() => handleUseAsInspiration(result)}
                      className="px-4 py-1.5 bg-orange-100 dark:bg-orange-900/30 hover:bg-orange-200 dark:hover:bg-orange-900/50 text-orange-700 dark:text-orange-400 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                    >
                      <Sparkles className="w-3 h-3" />
                      Use as Inspiration
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default WebSearchModal;
