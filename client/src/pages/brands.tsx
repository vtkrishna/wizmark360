import { useState } from "react";
import AppShell from "../components/layout/app-shell";
import {
  Building2,
  Plus,
  Search,
  MoreVertical,
  TrendingUp,
  Users,
  DollarSign,
  Calendar,
  Edit,
  Trash2,
  Eye,
  ChevronRight,
  Star,
  Globe,
  Mail,
  Phone,
  MapPin
} from "lucide-react";

interface Brand {
  id: number;
  name: string;
  industry: string;
  status: "active" | "paused" | "pending";
  campaigns: number;
  leads: number;
  revenue: string;
  createdAt: string;
  logo?: string;
  website?: string;
  email?: string;
  phone?: string;
  location?: string;
}

const sampleBrands: Brand[] = [
  {
    id: 1,
    name: "Acme Corp",
    industry: "Technology",
    status: "active",
    campaigns: 12,
    leads: 847,
    revenue: "₹4.2L",
    createdAt: "2024-01-15",
    website: "acmecorp.com",
    email: "contact@acmecorp.com",
    phone: "+91 98765 43210",
    location: "Mumbai, India"
  },
  {
    id: 2,
    name: "TechStart India",
    industry: "SaaS",
    status: "active",
    campaigns: 8,
    leads: 523,
    revenue: "₹2.8L",
    createdAt: "2024-02-20",
    website: "techstart.in",
    email: "hello@techstart.in",
    phone: "+91 99887 76655",
    location: "Bangalore, India"
  },
  {
    id: 3,
    name: "Global Retail Hub",
    industry: "E-commerce",
    status: "paused",
    campaigns: 5,
    leads: 312,
    revenue: "₹1.5L",
    createdAt: "2024-03-10",
    website: "globalretailhub.com",
    email: "sales@grh.com",
    phone: "+91 88776 55443",
    location: "Delhi, India"
  },
  {
    id: 4,
    name: "HealthCare Plus",
    industry: "Healthcare",
    status: "active",
    campaigns: 15,
    leads: 1234,
    revenue: "₹6.8L",
    createdAt: "2024-01-05",
    website: "healthcareplus.in",
    email: "info@hcplus.in",
    phone: "+91 77665 54432",
    location: "Chennai, India"
  },
  {
    id: 5,
    name: "EduLearn Academy",
    industry: "Education",
    status: "pending",
    campaigns: 0,
    leads: 0,
    revenue: "₹0",
    createdAt: "2024-12-01",
    website: "edulearn.academy",
    email: "admin@edulearn.academy",
    location: "Pune, India"
  }
];

export default function BrandsPage() {
  const [brands] = useState<Brand[]>(sampleBrands);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const filteredBrands = brands.filter(brand =>
    brand.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    brand.industry.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status: Brand["status"]) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-700";
      case "paused": return "bg-yellow-100 text-yellow-700";
      case "pending": return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <AppShell currentBrand={{ id: 1, name: "All Brands" }}>
      <div className="h-full flex">
        <div className="flex-1 overflow-auto p-6 bg-gray-50 dark:bg-gray-900">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Brands & CRM</h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your client brands and relationships</p>
              </div>
              <button className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
                <Plus className="w-4 h-4" />
                Add Brand
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{brands.length}</p>
                    <p className="text-sm text-gray-500">Total Brands</p>
                  </div>
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{brands.filter(b => b.status === "active").length}</p>
                    <p className="text-sm text-gray-500">Active</p>
                  </div>
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{brands.reduce((acc, b) => acc + b.leads, 0).toLocaleString()}</p>
                    <p className="text-sm text-gray-500">Total Leads</p>
                  </div>
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">₹15.3L</p>
                    <p className="text-sm text-gray-500">Total Revenue</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center gap-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search brands..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`px-3 py-1.5 rounded text-sm ${viewMode === "grid" ? "bg-white dark:bg-gray-600 shadow-sm" : ""}`}
                  >
                    Grid
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`px-3 py-1.5 rounded text-sm ${viewMode === "list" ? "bg-white dark:bg-gray-600 shadow-sm" : ""}`}
                  >
                    List
                  </button>
                </div>
              </div>

              {viewMode === "grid" ? (
                <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredBrands.map((brand) => (
                    <div
                      key={brand.id}
                      onClick={() => setSelectedBrand(brand)}
                      className="p-4 border border-gray-200 dark:border-gray-700 rounded-xl hover:border-blue-300 hover:shadow-md transition-all cursor-pointer"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                            {brand.name.charAt(0)}
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white">{brand.name}</h3>
                            <p className="text-sm text-gray-500">{brand.industry}</p>
                          </div>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(brand.status)}`}>
                          {brand.status}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 pt-3 border-t border-gray-100 dark:border-gray-700">
                        <div className="text-center">
                          <p className="text-lg font-bold text-gray-900 dark:text-white">{brand.campaigns}</p>
                          <p className="text-xs text-gray-500">Campaigns</p>
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-bold text-gray-900 dark:text-white">{brand.leads}</p>
                          <p className="text-xs text-gray-500">Leads</p>
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-bold text-gray-900 dark:text-white">{brand.revenue}</p>
                          <p className="text-xs text-gray-500">Revenue</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredBrands.map((brand) => (
                    <div
                      key={brand.id}
                      onClick={() => setSelectedBrand(brand)}
                      className="p-4 flex items-center gap-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer"
                    >
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-white font-bold">
                        {brand.name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 dark:text-white">{brand.name}</h3>
                        <p className="text-sm text-gray-500">{brand.industry}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(brand.status)}`}>
                        {brand.status}
                      </span>
                      <div className="text-right">
                        <p className="font-medium text-gray-900 dark:text-white">{brand.leads} leads</p>
                        <p className="text-sm text-gray-500">{brand.revenue}</p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {selectedBrand && (
          <div className="w-96 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 p-6 overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Brand Details</h2>
              <button
                onClick={() => setSelectedBrand(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>

            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center text-white font-bold text-2xl">
                {selectedBrand.name.charAt(0)}
              </div>
              <div>
                <h3 className="font-bold text-xl text-gray-900 dark:text-white">{selectedBrand.name}</h3>
                <p className="text-gray-500">{selectedBrand.industry}</p>
                <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedBrand.status)}`}>
                  {selectedBrand.status}
                </span>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              {selectedBrand.website && (
                <div className="flex items-center gap-3 text-sm">
                  <Globe className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600 dark:text-gray-300">{selectedBrand.website}</span>
                </div>
              )}
              {selectedBrand.email && (
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600 dark:text-gray-300">{selectedBrand.email}</span>
                </div>
              )}
              {selectedBrand.phone && (
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600 dark:text-gray-300">{selectedBrand.phone}</span>
                </div>
              )}
              {selectedBrand.location && (
                <div className="flex items-center gap-3 text-sm">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600 dark:text-gray-300">{selectedBrand.location}</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{selectedBrand.campaigns}</p>
                <p className="text-sm text-gray-500">Campaigns</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{selectedBrand.leads}</p>
                <p className="text-sm text-gray-500">Leads</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{selectedBrand.revenue}</p>
                <p className="text-sm text-gray-500">Revenue</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center">
                <div className="flex items-center justify-center gap-1">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">4.8</p>
                </div>
                <p className="text-sm text-gray-500">Rating</p>
              </div>
            </div>

            <div className="flex gap-2">
              <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
                <Eye className="w-4 h-4" />
                View Dashboard
              </button>
              <button className="p-2.5 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
                <Edit className="w-4 h-4 text-gray-500" />
              </button>
              <button className="p-2.5 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
                <Trash2 className="w-4 h-4 text-red-500" />
              </button>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
