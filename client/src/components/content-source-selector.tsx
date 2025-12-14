import { useState } from "react";
import {
  Sparkles,
  FolderOpen,
  Image,
  Search,
  Globe,
  ChevronRight,
  Check
} from "lucide-react";

export type ContentSourceType = "ai" | "library" | "stock" | "web";

export interface ContentSource {
  type: ContentSourceType;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  available: boolean;
}

interface ContentSourceSelectorProps {
  selectedSource: ContentSourceType | null;
  onSourceSelect: (source: ContentSourceType) => void;
  onNext?: () => void;
  vertical?: string;
  compact?: boolean;
}

const contentSources: ContentSource[] = [
  {
    type: "ai",
    label: "Create with AI",
    description: "Generate unique content using AI models (text, images, videos, audio)",
    icon: Sparkles,
    color: "from-purple-500 to-pink-500",
    available: true
  },
  {
    type: "library",
    label: "Select from Library",
    description: "Choose from your existing content library and previous creations",
    icon: FolderOpen,
    color: "from-blue-500 to-cyan-500",
    available: true
  },
  {
    type: "stock",
    label: "Search Stock Images",
    description: "Find royalty-free images from Pexels, Unsplash, and other sources",
    icon: Image,
    color: "from-green-500 to-emerald-500",
    available: true
  },
  {
    type: "web",
    label: "Web Search",
    description: "Search the web for content inspiration and reference materials",
    icon: Globe,
    color: "from-orange-500 to-amber-500",
    available: true
  }
];

export function ContentSourceSelector({
  selectedSource,
  onSourceSelect,
  onNext,
  vertical,
  compact = false
}: ContentSourceSelectorProps) {
  if (compact) {
    return (
      <div className="flex flex-wrap gap-2">
        {contentSources.map((source) => {
          const Icon = source.icon;
          const isSelected = selectedSource === source.type;
          return (
            <button
              key={source.type}
              onClick={() => onSourceSelect(source.type)}
              disabled={!source.available}
              className={`
                flex items-center gap-2 px-3 py-2 rounded-lg border transition-all
                ${isSelected
                  ? "bg-gradient-to-r " + source.color + " text-white border-transparent shadow-lg"
                  : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                }
                ${!source.available ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
              `}
            >
              <Icon className="w-4 h-4" />
              <span className="text-sm font-medium">{source.label}</span>
              {isSelected && <Check className="w-4 h-4" />}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Choose Content Source
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Select how you want to create or source your content
          {vertical && <span className="text-blue-500"> for {vertical}</span>}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {contentSources.map((source) => {
          const Icon = source.icon;
          const isSelected = selectedSource === source.type;
          return (
            <button
              key={source.type}
              onClick={() => onSourceSelect(source.type)}
              disabled={!source.available}
              className={`
                relative group p-4 rounded-xl border-2 transition-all text-left
                ${isSelected
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-lg"
                  : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-800"
                }
                ${!source.available ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:shadow-md"}
              `}
            >
              {isSelected && (
                <div className="absolute top-3 right-3">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                </div>
              )}

              <div className={`
                w-12 h-12 rounded-xl bg-gradient-to-br ${source.color} 
                flex items-center justify-center mb-3
              `}>
                <Icon className="w-6 h-6 text-white" />
              </div>

              <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                {source.label}
              </h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {source.description}
              </p>

              {!source.available && (
                <span className="absolute top-3 right-3 text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                  Coming Soon
                </span>
              )}
            </button>
          );
        })}
      </div>

      {selectedSource && onNext && (
        <div className="flex justify-end mt-6">
          <button
            onClick={onNext}
            className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            Continue
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}

export function ContentSourceBadge({ source }: { source: ContentSourceType }) {
  const sourceInfo = contentSources.find((s) => s.type === source);
  if (!sourceInfo) return null;

  const Icon = sourceInfo.icon;

  return (
    <span className={`
      inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium
      bg-gradient-to-r ${sourceInfo.color} text-white
    `}>
      <Icon className="w-3 h-3" />
      {sourceInfo.label}
    </span>
  );
}

export { contentSources };
