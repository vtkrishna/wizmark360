import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { 
  FileText, Image, Video, Mic, Search, Plus, Filter, 
  MoreVertical, Download, Copy, Trash2, Edit, Globe, Check,
  Clock, User, Tag, Sparkles, Languages
} from 'lucide-react';

const INDIAN_LANGUAGES = [
  { code: 'en', name: 'English', native: 'English' },
  { code: 'hi', name: 'Hindi', native: 'हिन्दी' },
  { code: 'bn', name: 'Bengali', native: 'বাংলা' },
  { code: 'ta', name: 'Tamil', native: 'தமிழ்' },
  { code: 'te', name: 'Telugu', native: 'తెలుగు' },
  { code: 'mr', name: 'Marathi', native: 'मराठी' },
  { code: 'gu', name: 'Gujarati', native: 'ગુજરાતી' },
  { code: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ' },
  { code: 'ml', name: 'Malayalam', native: 'മലയാളം' },
  { code: 'pa', name: 'Punjabi', native: 'ਪੰਜਾਬੀ' },
  { code: 'or', name: 'Oriya', native: 'ଓଡ଼ିଆ' },
  { code: 'as', name: 'Assamese', native: 'অসমীয়া' },
];

interface ContentAsset {
  id: string;
  title: string;
  type: 'text' | 'image' | 'video' | 'audio';
  content: string;
  language: string;
  tags: string[];
  vertical: string;
  status: 'draft' | 'approved' | 'published';
  createdAt: string;
  createdBy: string;
  versions: number;
}

const mockAssets: ContentAsset[] = [
  {
    id: '1',
    title: 'Diwali Campaign Hero Copy',
    type: 'text',
    content: 'इस दीवाली, रोशनी का जश्न मनाएं! Special offers on all products...',
    language: 'hi',
    tags: ['diwali', 'festival', 'sale'],
    vertical: 'social',
    status: 'approved',
    createdAt: '2024-12-05T10:00:00Z',
    createdBy: 'AI Content Agent',
    versions: 3
  },
  {
    id: '2',
    title: 'WhatsApp Welcome Message',
    type: 'text',
    content: 'Welcome to our store! How can we help you today?',
    language: 'en',
    tags: ['whatsapp', 'greeting', 'support'],
    vertical: 'whatsapp',
    status: 'published',
    createdAt: '2024-12-04T14:30:00Z',
    createdBy: 'Content Manager',
    versions: 2
  },
  {
    id: '3',
    title: 'LinkedIn Thought Leadership',
    type: 'text',
    content: '5 ways AI is transforming marketing in India...',
    language: 'en',
    tags: ['linkedin', 'thought-leadership', 'ai'],
    vertical: 'linkedin',
    status: 'draft',
    createdAt: '2024-12-06T09:15:00Z',
    createdBy: 'AI Writer Agent',
    versions: 1
  },
  {
    id: '4',
    title: 'Tamil Product Description',
    type: 'text',
    content: 'எங்கள் புதிய தயாரிப்பு உங்களுக்காக...',
    language: 'ta',
    tags: ['product', 'description', 'ecommerce'],
    vertical: 'web',
    status: 'approved',
    createdAt: '2024-12-05T16:45:00Z',
    createdBy: 'Sarvam Translator',
    versions: 2
  },
];

interface ContentLibraryProps {
  vertical?: string;
  onSelect?: (asset: ContentAsset) => void;
}

export function ContentLibrary({ vertical, onSelect }: ContentLibraryProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showTranslateModal, setShowTranslateModal] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<ContentAsset | null>(null);

  const [newContent, setNewContent] = useState({
    title: '',
    content: '',
    language: 'en',
    vertical: vertical || 'social',
    tags: ''
  });

  const [translateTo, setTranslateTo] = useState<string[]>([]);

  const assets = mockAssets.filter(asset => {
    if (vertical && asset.vertical !== vertical) return false;
    if (selectedType !== 'all' && asset.type !== selectedType) return false;
    if (selectedLanguage !== 'all' && asset.language !== selectedLanguage) return false;
    if (selectedStatus !== 'all' && asset.status !== selectedStatus) return false;
    if (searchQuery && !asset.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !asset.content.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'text': return FileText;
      case 'image': return Image;
      case 'video': return Video;
      case 'audio': return Mic;
      default: return FileText;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'approved': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'published': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getLanguageName = (code: string) => {
    const lang = INDIAN_LANGUAGES.find(l => l.code === code);
    return lang ? `${lang.native} (${lang.name})` : code;
  };

  const handleTranslate = () => {
    console.log('Translating to:', translateTo);
    setShowTranslateModal(false);
    setTranslateTo([]);
    setSelectedAsset(null);
  };

  const handleCreateContent = () => {
    console.log('Creating content:', newContent);
    setShowCreateModal(false);
    setNewContent({ title: '', content: '', language: 'en', vertical: vertical || 'social', tags: '' });
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-600" />
            Content Library
          </CardTitle>
          <Button 
            size="sm" 
            onClick={() => setShowCreateModal(true)}
            className="bg-gradient-to-r from-blue-600 to-purple-600"
          >
            <Plus className="h-4 w-4 mr-1" /> Create
          </Button>
        </div>

        <div className="flex gap-2 mt-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search content..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="text">Text</SelectItem>
              <SelectItem value="image">Image</SelectItem>
              <SelectItem value="video">Video</SelectItem>
              <SelectItem value="audio">Audio</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Language" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Languages</SelectItem>
              {INDIAN_LANGUAGES.map(lang => (
                <SelectItem key={lang.code} value={lang.code}>
                  {lang.native}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="published">Published</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="divide-y max-h-96 overflow-y-auto">
          {assets.length > 0 ? (
            assets.map(asset => {
              const TypeIcon = getTypeIcon(asset.type);
              return (
                <div 
                  key={asset.id} 
                  className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => onSelect?.(asset)}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                      <TypeIcon className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-gray-900 truncate">{asset.title}</span>
                        <Badge variant="outline" className={getStatusColor(asset.status)}>
                          {asset.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-500 line-clamp-2 mb-2">{asset.content}</p>
                      <div className="flex items-center gap-3 text-xs text-gray-400">
                        <span className="flex items-center gap-1">
                          <Globe className="h-3 w-3" />
                          {getLanguageName(asset.language)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(asset.createdAt).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {asset.createdBy}
                        </span>
                        <span className="flex items-center gap-1">
                          v{asset.versions}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedAsset(asset);
                          setShowTranslateModal(true);
                        }}
                      >
                        <Languages className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  {asset.tags.length > 0 && (
                    <div className="flex items-center gap-1 mt-2 ml-13">
                      <Tag className="h-3 w-3 text-gray-400" />
                      {asset.tags.map(tag => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="py-12 text-center text-gray-500">
              <FileText className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p className="font-medium">No content found</p>
              <p className="text-sm">Create your first content asset</p>
            </div>
          )}
        </div>
      </CardContent>

      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-blue-600" />
              Create Content
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Title</label>
              <Input
                value={newContent.title}
                onChange={(e) => setNewContent({ ...newContent, title: e.target.value })}
                placeholder="Enter content title..."
              />
            </div>
            <div>
              <label className="text-sm font-medium">Language</label>
              <Select 
                value={newContent.language} 
                onValueChange={(v) => setNewContent({ ...newContent, language: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {INDIAN_LANGUAGES.map(lang => (
                    <SelectItem key={lang.code} value={lang.code}>
                      {lang.native} ({lang.name})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Content</label>
              <textarea
                value={newContent.content}
                onChange={(e) => setNewContent({ ...newContent, content: e.target.value })}
                placeholder="Enter your content or let AI generate..."
                className="w-full h-32 px-3 py-2 border rounded-md resize-none"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Tags (comma separated)</label>
              <Input
                value={newContent.tags}
                onChange={(e) => setNewContent({ ...newContent, tags: e.target.value })}
                placeholder="campaign, diwali, sale"
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setShowCreateModal(false)}>
                Cancel
              </Button>
              <Button 
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600"
                onClick={handleCreateContent}
              >
                <Sparkles className="h-4 w-4 mr-1" /> Create with AI
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showTranslateModal} onOpenChange={setShowTranslateModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Languages className="h-5 w-5 text-blue-600" />
              Translate Content
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-500">
              Select languages to translate "{selectedAsset?.title}" into:
            </p>
            <div className="grid grid-cols-2 gap-2">
              {INDIAN_LANGUAGES.filter(l => l.code !== selectedAsset?.language).map(lang => (
                <label
                  key={lang.code}
                  className={`flex items-center gap-2 p-3 border rounded-lg cursor-pointer transition-colors ${
                    translateTo.includes(lang.code) ? 'bg-blue-50 border-blue-300' : 'hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={translateTo.includes(lang.code)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setTranslateTo([...translateTo, lang.code]);
                      } else {
                        setTranslateTo(translateTo.filter(c => c !== lang.code));
                      }
                    }}
                    className="hidden"
                  />
                  <div className={`w-5 h-5 rounded border flex items-center justify-center ${
                    translateTo.includes(lang.code) ? 'bg-blue-600 border-blue-600' : 'border-gray-300'
                  }`}>
                    {translateTo.includes(lang.code) && <Check className="h-3 w-3 text-white" />}
                  </div>
                  <span className="text-sm">{lang.native}</span>
                </label>
              ))}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setShowTranslateModal(false)}>
                Cancel
              </Button>
              <Button 
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600"
                onClick={handleTranslate}
                disabled={translateTo.length === 0}
              >
                <Globe className="h-4 w-4 mr-1" /> Translate ({translateTo.length})
              </Button>
            </div>
            <p className="text-xs text-center text-gray-400">
              Powered by Sarvam AI for accurate Indian language translation
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
