import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Building2, Globe, Users, Palette, Target, FileText,
  ArrowRight, ArrowLeft, Check, Sparkles, Upload,
  Phone, Mail, User, Briefcase, CreditCard, Languages, Loader2
} from "lucide-react";
import { useUpload } from "../hooks/use-upload";

const steps = [
  { id: "company", title: "Company Info", icon: Building2 },
  { id: "guidelines", title: "Brand Guidelines", icon: Palette },
  { id: "contacts", title: "Team Contacts", icon: Users },
  { id: "services", title: "Service Package", icon: Briefcase },
  { id: "billing", title: "Billing Details", icon: CreditCard },
  { id: "review", title: "Review & Launch", icon: Check },
];

const verticals = [
  { id: "social", name: "Social Media", icon: "📱", agents: 45, description: "Content creation, scheduling, engagement" },
  { id: "seo", name: "SEO & GEO", icon: "🔍", agents: 38, description: "Search optimization, AI search, rankings" },
  { id: "web", name: "Web Development", icon: "🌐", agents: 32, description: "Landing pages, A/B testing, CRO" },
  { id: "sales", name: "Sales SDR", icon: "💼", agents: 52, description: "Lead generation, outreach, pipeline" },
  { id: "whatsapp", name: "WhatsApp", icon: "💬", agents: 28, description: "Commerce, support, automation" },
  { id: "linkedin", name: "LinkedIn B2B", icon: "🔗", agents: 35, description: "Thought leadership, networking" },
  { id: "performance", name: "Performance Ads", icon: "📊", agents: 37, description: "Paid media, ROAS optimization" },
  { id: "pr", name: "PR & Comms", icon: "📰", agents: 18, description: "Press releases, media relations, crisis management" },
];

const industries = [
  "Technology", "E-commerce", "SaaS", "Healthcare", "Finance", "Education",
  "Retail", "Manufacturing", "Real Estate", "Hospitality", "Media", "FMCG", "Other"
];

const languages = [
  { code: "en", name: "English" },
  { code: "hi", name: "Hindi" },
  { code: "bn", name: "Bengali" },
  { code: "ta", name: "Tamil" },
  { code: "te", name: "Telugu" },
  { code: "mr", name: "Marathi" },
  { code: "gu", name: "Gujarati" },
  { code: "kn", name: "Kannada" },
  { code: "ml", name: "Malayalam" },
  { code: "pa", name: "Punjabi" },
  { code: "or", name: "Odia" },
  { code: "as", name: "Assamese" },
];

interface BrandFormData {
  name: string;
  legalName: string;
  industry: string;
  website: string;
  description: string;
  gstin: string;
  pan: string;
  address: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
  primaryColor: string;
  secondaryColor: string;
  primaryFont: string;
  toneOfVoice: string;
  targetAudience: string;
  primaryContact: {
    name: string;
    email: string;
    phone: string;
    role: string;
  };
  billingContact: {
    name: string;
    email: string;
    phone: string;
  };
  selectedVerticals: string[];
  packageType: string;
  monthlyRetainer: string;
  targetLanguages: string[];
  goals: string[];
  logo: string;
}

export default function BrandOnboarding() {
  const [, setLocation] = useLocation();
  const [currentStep, setCurrentStep] = useState(0);
  const { uploadFile, isUploading: isLogoUploading } = useUpload({
    onSuccess: (response) => {
      setFormData(prev => ({ ...prev, logo: response.objectPath }));
    },
  });
  const [formData, setFormData] = useState<BrandFormData>({
    name: "",
    legalName: "",
    industry: "",
    website: "",
    description: "",
    gstin: "",
    pan: "",
    address: "",
    city: "",
    state: "",
    country: "India",
    pincode: "",
    primaryColor: "#3B82F6",
    secondaryColor: "#8B5CF6",
    primaryFont: "Inter",
    toneOfVoice: "",
    targetAudience: "",
    primaryContact: { name: "", email: "", phone: "", role: "" },
    billingContact: { name: "", email: "", phone: "" },
    selectedVerticals: [],
    packageType: "full_service",
    monthlyRetainer: "",
    targetLanguages: ["en"],
    goals: [],
    logo: "",
  });

  const queryClient = useQueryClient();

  const createBrand = useMutation({
    mutationFn: async (data: BrandFormData) => {
      const res = await fetch("/api/brands", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          legalName: data.legalName,
          industry: data.industry,
          website: data.website,
          gstin: data.gstin,
          pan: data.pan,
          address: data.address,
          city: data.city,
          state: data.state,
          country: data.country,
          pincode: data.pincode,
          targetLanguages: data.targetLanguages,
          guidelines: {
            primaryColor: data.primaryColor,
            secondaryColor: data.secondaryColor,
            primaryFont: data.primaryFont,
            toneOfVoice: data.toneOfVoice,
            targetAudience: data.targetAudience,
          },
          primaryContact: data.primaryContact,
          billingContact: data.billingContact,
          package: {
            type: data.packageType,
            verticals: data.selectedVerticals,
            monthlyRetainer: data.monthlyRetainer,
          },
          logo: data.logo || undefined,
        }),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["brands"] });
      setLocation("/market360");
    },
  });

  const nextStep = () => setCurrentStep((s) => Math.min(s + 1, steps.length - 1));
  const prevStep = () => setCurrentStep((s) => Math.max(s - 1, 0));

  const toggleVertical = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      selectedVerticals: prev.selectedVerticals.includes(id)
        ? prev.selectedVerticals.filter((v) => v !== id)
        : [...prev.selectedVerticals, id],
    }));
  };

  const toggleLanguage = (code: string) => {
    setFormData((prev) => ({
      ...prev,
      targetLanguages: prev.targetLanguages.includes(code)
        ? prev.targetLanguages.filter((l) => l !== code)
        : [...prev.targetLanguages, code],
    }));
  };

  const handleSubmit = () => {
    createBrand.mutate(formData);
  };

  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <nav className="px-6 py-4 flex justify-between items-center border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <span className="text-2xl font-bold text-white">
            <span className="text-blue-400">Wizards</span>
            <span className="text-purple-400">Tech</span>
          </span>
        </div>
        <Button variant="ghost" className="text-white/70 hover:text-white" onClick={() => setLocation("/market360")}>
          Skip to Dashboard
        </Button>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Brand Onboarding</h1>
          <p className="text-white/60">Set up your brand for AI-powered marketing across 8 verticals</p>
        </div>

        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-white/60">Step {currentStep + 1} of {steps.length}</span>
            <span className="text-sm text-white/60">{Math.round(progress)}% complete</span>
          </div>
          <Progress value={progress} className="h-2" />
          
          <div className="flex justify-between mt-4">
            {steps.map((step, i) => (
              <button
                key={step.id}
                onClick={() => setCurrentStep(i)}
                className={`flex flex-col items-center gap-1 ${
                  i <= currentStep ? "text-white" : "text-white/40"
                }`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  i < currentStep ? "bg-green-500" : i === currentStep ? "bg-blue-500" : "bg-white/10"
                }`}>
                  {i < currentStep ? <Check className="h-5 w-5" /> : <step.icon className="h-5 w-5" />}
                </div>
                <span className="text-xs hidden md:block">{step.title}</span>
              </button>
            ))}
          </div>
        </div>

        <Card className="bg-white/95 backdrop-blur shadow-2xl">
          <CardContent className="p-8">
            {currentStep === 0 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-1">Company Information</h2>
                  <p className="text-gray-600">Basic details about your organization</p>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Brand Name *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., Acme Corporation"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Legal Entity Name</label>
                    <input
                      type="text"
                      value={formData.legalName}
                      onChange={(e) => setFormData({ ...formData, legalName: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Acme Corporation Pvt Ltd"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Industry *</label>
                    <select
                      value={formData.industry}
                      onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select industry</option>
                      {industries.map((ind) => (
                        <option key={ind} value={ind.toLowerCase()}>{ind}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                    <input
                      type="url"
                      value={formData.website}
                      onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="https://example.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Business Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="Briefly describe what your business does, your unique value proposition..."
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">GSTIN</label>
                    <input
                      type="text"
                      value={formData.gstin}
                      onChange={(e) => setFormData({ ...formData, gstin: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="22AAAAA0000A1Z5"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">PAN</label>
                    <input
                      type="text"
                      value={formData.pan}
                      onChange={(e) => setFormData({ ...formData, pan: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="AAAAA0000A"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <textarea
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    rows={2}
                    placeholder="Street address..."
                  />
                </div>

                <div className="grid md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                    <input
                      type="text"
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                    <input
                      type="text"
                      value={formData.country}
                      onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Pincode</label>
                    <input
                      type="text"
                      value={formData.pincode}
                      onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {currentStep === 1 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-1">Brand Guidelines</h2>
                  <p className="text-gray-600">Visual identity and communication style</p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Primary Brand Color</label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={formData.primaryColor}
                          onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                          className="w-12 h-12 rounded cursor-pointer"
                        />
                        <input
                          type="text"
                          value={formData.primaryColor}
                          onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Secondary Color</label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={formData.secondaryColor}
                          onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
                          className="w-12 h-12 rounded cursor-pointer"
                        />
                        <input
                          type="text"
                          value={formData.secondaryColor}
                          onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Primary Font</label>
                      <select
                        value={formData.primaryFont}
                        onChange={(e) => setFormData({ ...formData, primaryFont: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="Inter">Inter</option>
                        <option value="Roboto">Roboto</option>
                        <option value="Open Sans">Open Sans</option>
                        <option value="Poppins">Poppins</option>
                        <option value="Montserrat">Montserrat</option>
                        <option value="Lato">Lato</option>
                      </select>
                    </div>
                  </div>

                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center justify-center text-center">
                    {formData.logo ? (
                      <>
                        <img src={formData.logo} alt="Brand logo" className="w-20 h-20 rounded-xl object-cover mb-3" />
                        <p className="font-medium text-green-700">Logo uploaded</p>
                      </>
                    ) : (
                      <Upload className="h-12 w-12 text-gray-400 mb-3" />
                    )}
                    <p className="font-medium text-gray-700">{formData.logo ? "Replace Logo" : "Upload Brand Logo"}</p>
                    <p className="text-sm text-gray-500 mb-3">PNG, SVG, or JPG (max 10MB)</p>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={isLogoUploading}
                      onClick={() => {
                        const input = document.createElement("input");
                        input.type = "file";
                        input.accept = "image/*";
                        input.onchange = (e) => {
                          const file = (e.target as HTMLInputElement).files?.[0];
                          if (file) uploadFile(file);
                        };
                        input.click();
                      }}
                    >
                      {isLogoUploading ? (
                        <><Loader2 className="w-4 h-4 animate-spin mr-2" />Uploading...</>
                      ) : (
                        "Choose File"
                      )}
                    </Button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tone of Voice</label>
                  <textarea
                    value={formData.toneOfVoice}
                    onChange={(e) => setFormData({ ...formData, toneOfVoice: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="Describe your brand's communication style (e.g., professional yet friendly, bold and innovative, warm and approachable...)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Target Audience</label>
                  <textarea
                    value={formData.targetAudience}
                    onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="Describe your ideal customers (demographics, interests, pain points...)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Languages className="inline h-4 w-4 mr-1" />
                    Target Languages
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => toggleLanguage(lang.code)}
                        className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                          formData.targetLanguages.includes(lang.code)
                            ? "bg-blue-500 text-white"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        {lang.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-1">Team Contacts</h2>
                  <p className="text-gray-600">Key people we'll work with on your marketing</p>
                </div>

                <div className="bg-blue-50 rounded-xl p-6">
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <User className="h-5 w-5 text-blue-600" />
                    Primary Marketing Contact
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                      <input
                        type="text"
                        value={formData.primaryContact.name}
                        onChange={(e) => setFormData({
                          ...formData,
                          primaryContact: { ...formData.primaryContact, name: e.target.value }
                        })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Role / Title</label>
                      <input
                        type="text"
                        value={formData.primaryContact.role}
                        onChange={(e) => setFormData({
                          ...formData,
                          primaryContact: { ...formData.primaryContact, role: e.target.value }
                        })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., Marketing Manager"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                          type="email"
                          value={formData.primaryContact.email}
                          onChange={(e) => setFormData({
                            ...formData,
                            primaryContact: { ...formData.primaryContact, email: e.target.value }
                          })}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                          type="tel"
                          value={formData.primaryContact.phone}
                          onChange={(e) => setFormData({
                            ...formData,
                            primaryContact: { ...formData.primaryContact, phone: e.target.value }
                          })}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          placeholder="+91 98765 43210"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-gray-600" />
                    Billing Contact (if different)
                  </h3>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                      <input
                        type="text"
                        value={formData.billingContact.name}
                        onChange={(e) => setFormData({
                          ...formData,
                          billingContact: { ...formData.billingContact, name: e.target.value }
                        })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <input
                        type="email"
                        value={formData.billingContact.email}
                        onChange={(e) => setFormData({
                          ...formData,
                          billingContact: { ...formData.billingContact, email: e.target.value }
                        })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                      <input
                        type="tel"
                        value={formData.billingContact.phone}
                        onChange={(e) => setFormData({
                          ...formData,
                          billingContact: { ...formData.billingContact, phone: e.target.value }
                        })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-1">Service Package</h2>
                  <p className="text-gray-600">Select marketing services and verticals for this brand</p>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  {[
                    { id: "full_service", name: "Full Service", desc: "All 8 verticals, dedicated team", badge: "Recommended" },
                    { id: "partial", name: "Partial Service", desc: "Choose specific verticals", badge: null },
                    { id: "project_based", name: "Project Based", desc: "One-time campaigns", badge: null },
                  ].map((pkg) => (
                    <button
                      key={pkg.id}
                      onClick={() => setFormData({ ...formData, packageType: pkg.id })}
                      className={`relative p-4 rounded-xl border-2 text-left transition-all ${
                        formData.packageType === pkg.id
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      {pkg.badge && (
                        <Badge className="absolute -top-2 -right-2 bg-green-500">{pkg.badge}</Badge>
                      )}
                      <div className="font-semibold text-gray-900">{pkg.name}</div>
                      <div className="text-sm text-gray-500">{pkg.desc}</div>
                    </button>
                  ))}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Select Marketing Verticals</label>
                  <div className="grid md:grid-cols-2 gap-3">
                    {verticals.map((v) => (
                      <button
                        key={v.id}
                        onClick={() => toggleVertical(v.id)}
                        disabled={formData.packageType === "full_service"}
                        className={`p-4 rounded-xl border-2 text-left transition-all ${
                          formData.selectedVerticals.includes(v.id) || formData.packageType === "full_service"
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 hover:border-gray-300"
                        } ${formData.packageType === "full_service" ? "opacity-70" : ""}`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{v.icon}</span>
                          <div className="flex-1">
                            <div className="font-semibold text-gray-900">{v.name}</div>
                            <div className="text-xs text-gray-500">{v.description}</div>
                          </div>
                          <Badge variant="outline" className="text-xs">{v.agents} agents</Badge>
                        </div>
                      </button>
                    ))}
                  </div>
                  {formData.packageType === "full_service" && (
                    <p className="text-sm text-blue-600 mt-2">Full Service includes all 8 verticals (285 AI agents)</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Retainer (INR)</label>
                  <input
                    type="text"
                    value={formData.monthlyRetainer}
                    onChange={(e) => setFormData({ ...formData, monthlyRetainer: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 50000"
                  />
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-1">Billing Details</h2>
                  <p className="text-gray-600">Payment and invoicing preferences</p>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                  <p className="text-sm text-yellow-800">
                    <strong>Note:</strong> Billing and invoicing will be set up after brand activation. 
                    You'll receive a welcome email with payment instructions.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <h3 className="font-semibold mb-2">Billing Address</h3>
                    <p className="text-gray-600 text-sm">
                      {formData.address || "Not provided"}<br />
                      {formData.city}, {formData.state} {formData.pincode}<br />
                      {formData.country}
                    </p>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-xl">
                    <h3 className="font-semibold mb-2">Tax Information</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">GSTIN:</span>
                        <span className="ml-2 font-medium">{formData.gstin || "Not provided"}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">PAN:</span>
                        <span className="ml-2 font-medium">{formData.pan || "Not provided"}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-blue-50 rounded-xl">
                    <h3 className="font-semibold mb-2 text-blue-900">Estimated Monthly Investment</h3>
                    <div className="text-3xl font-bold text-blue-600">
                      ₹{formData.monthlyRetainer ? parseInt(formData.monthlyRetainer).toLocaleString('en-IN') : "TBD"}
                      <span className="text-sm font-normal text-gray-500">/month + GST</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 5 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-1">Review & Launch</h2>
                  <p className="text-gray-600">Confirm brand details before activation</p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Building2 className="h-5 w-5 text-blue-600" />
                          Brand Details
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="text-sm space-y-1">
                        <p><strong>Name:</strong> {formData.name}</p>
                        <p><strong>Industry:</strong> {formData.industry}</p>
                        <p><strong>Website:</strong> {formData.website}</p>
                        <p><strong>Location:</strong> {formData.city}, {formData.country}</p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Palette className="h-5 w-5 text-purple-600" />
                          Brand Identity
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="text-sm space-y-2">
                        <div className="flex items-center gap-2">
                          <span>Colors:</span>
                          <div className="w-6 h-6 rounded" style={{ backgroundColor: formData.primaryColor }} />
                          <div className="w-6 h-6 rounded" style={{ backgroundColor: formData.secondaryColor }} />
                        </div>
                        <p><strong>Font:</strong> {formData.primaryFont}</p>
                        <p><strong>Languages:</strong> {formData.targetLanguages.length}</p>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="space-y-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Briefcase className="h-5 w-5 text-green-600" />
                          Service Package
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="text-sm space-y-2">
                        <p><strong>Type:</strong> {formData.packageType.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase())}</p>
                        <p><strong>Verticals:</strong> {formData.packageType === "full_service" ? "All 7" : formData.selectedVerticals.length}</p>
                        <p><strong>AI Agents:</strong> {formData.packageType === "full_service" ? "267" : 
                          verticals.filter(v => formData.selectedVerticals.includes(v.id)).reduce((sum, v) => sum + v.agents, 0)}</p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Users className="h-5 w-5 text-orange-600" />
                          Primary Contact
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="text-sm space-y-1">
                        <p><strong>Name:</strong> {formData.primaryContact.name}</p>
                        <p><strong>Email:</strong> {formData.primaryContact.email}</p>
                        <p><strong>Phone:</strong> {formData.primaryContact.phone}</p>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 text-center">
                  <Sparkles className="h-12 w-12 text-blue-600 mx-auto mb-3" />
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Ready to Launch!</h3>
                  <p className="text-gray-600 mb-4">
                    Click "Activate Brand" to complete onboarding and start your AI-powered marketing journey.
                  </p>
                  <Button 
                    size="lg"
                    onClick={handleSubmit}
                    disabled={createBrand.isPending}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    {createBrand.isPending ? "Activating..." : "Activate Brand"}
                    <Sparkles className="ml-2 h-5 w-5" />
                  </Button>
                </div>
              </div>
            )}

            <div className="flex justify-between pt-6 mt-6 border-t">
              <Button
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 0}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Previous
              </Button>
              
              {currentStep < steps.length - 1 ? (
                <Button onClick={nextStep}>
                  Next Step
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : null}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
