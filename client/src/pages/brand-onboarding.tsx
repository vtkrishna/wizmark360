import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const steps = ["Brand Info", "Verticals", "Goals", "Review"];

const verticals = [
  { id: "social", name: "Social Media", icon: "📱", description: "Viral content creation and social engagement" },
  { id: "seo", name: "SEO & GEO", icon: "🔍", description: "Search and generative engine optimization" },
  { id: "web", name: "Web Dev", icon: "🌐", description: "AI-powered web development and design" },
  { id: "sales", name: "Sales SDR", icon: "💼", description: "Autonomous sales development and outreach" },
  { id: "whatsapp", name: "WhatsApp", icon: "💬", description: "Community management and commerce" },
  { id: "linkedin", name: "LinkedIn", icon: "🔗", description: "B2B authority building and networking" },
  { id: "performance", name: "Performance", icon: "📊", description: "Cross-channel advertising optimization" },
];

const goals = [
  { id: "awareness", label: "Brand Awareness", description: "Increase visibility and reach" },
  { id: "leads", label: "Lead Generation", description: "Capture qualified prospects" },
  { id: "sales", label: "Sales Growth", description: "Drive revenue and conversions" },
  { id: "engagement", label: "Community Engagement", description: "Build loyal audience" },
  { id: "authority", label: "Thought Leadership", description: "Establish industry authority" },
];

interface BrandFormData {
  name: string;
  industry: string;
  website: string;
  description: string;
  selectedVerticals: string[];
  selectedGoals: string[];
  monthlyBudget: string;
  romaLevel: number;
}

export default function BrandOnboarding() {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<BrandFormData>({
    name: "",
    industry: "",
    website: "",
    description: "",
    selectedVerticals: [],
    selectedGoals: [],
    monthlyBudget: "",
    romaLevel: 2,
  });
  
  const queryClient = useQueryClient();

  const createBrand = useMutation({
    mutationFn: async (data: BrandFormData) => {
      for (const vertical of data.selectedVerticals) {
        await fetch("/api/market360/campaigns", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: `${data.name} - ${vertical.charAt(0).toUpperCase() + vertical.slice(1)} Campaign`,
            vertical,
          }),
        });
      }
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      queryClient.invalidateQueries({ queryKey: ["market360-stats"] });
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

  const toggleGoal = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      selectedGoals: prev.selectedGoals.includes(id)
        ? prev.selectedGoals.filter((g) => g !== id)
        : [...prev.selectedGoals, id],
    }));
  };

  const handleSubmit = () => {
    createBrand.mutate(formData);
  };

  const canProceed = () => {
    if (currentStep === 0) return formData.name.trim() !== "";
    if (currentStep === 1) return formData.selectedVerticals.length > 0;
    if (currentStep === 2) return formData.selectedGoals.length > 0;
    return true;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-800">
      <nav className="px-6 py-4 flex justify-between items-center">
        <a href="/" className="text-2xl font-bold text-white">Market360</a>
        <a href="/market360" className="px-4 py-2 text-white/70 hover:text-white">
          Skip to Dashboard
        </a>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-12">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            {steps.map((step, i) => (
              <div key={step} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    i <= currentStep ? "bg-blue-500 text-white" : "bg-white/20 text-white/50"
                  }`}
                >
                  {i + 1}
                </div>
                <span className={`ml-2 text-sm ${i <= currentStep ? "text-white" : "text-white/50"}`}>
                  {step}
                </span>
                {i < steps.length - 1 && (
                  <div className={`w-12 h-0.5 mx-2 ${i < currentStep ? "bg-blue-500" : "bg-white/20"}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl p-8 shadow-xl">
          {currentStep === 0 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">Tell us about your brand</h2>
              <p className="text-gray-600">Let's get to know your business so we can configure the right agents.</p>
              
              <div className="space-y-4">
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
                  <select
                    value={formData.industry}
                    onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select industry</option>
                    <option value="technology">Technology</option>
                    <option value="ecommerce">E-commerce</option>
                    <option value="saas">SaaS</option>
                    <option value="healthcare">Healthcare</option>
                    <option value="finance">Finance</option>
                    <option value="education">Education</option>
                    <option value="retail">Retail</option>
                    <option value="other">Other</option>
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
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="Briefly describe what your business does..."
                  />
                </div>
              </div>
            </div>
          )}

          {currentStep === 1 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">Select your marketing verticals</h2>
              <p className="text-gray-600">Choose which marketing channels you want our agents to manage.</p>
              
              <div className="grid grid-cols-2 gap-4">
                {verticals.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => toggleVertical(v.id)}
                    className={`p-4 rounded-lg border-2 text-left transition-all ${
                      formData.selectedVerticals.includes(v.id)
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{v.icon}</span>
                      <div>
                        <div className="font-semibold text-gray-900">{v.name}</div>
                        <div className="text-sm text-gray-500">{v.description}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
              
              <p className="text-sm text-gray-500">
                Selected: {formData.selectedVerticals.length} of {verticals.length} verticals
              </p>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">Set your marketing goals</h2>
              <p className="text-gray-600">What do you want to achieve? This helps us prioritize agent tasks.</p>
              
              <div className="space-y-3">
                {goals.map((g) => (
                  <button
                    key={g.id}
                    onClick={() => toggleGoal(g.id)}
                    className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                      formData.selectedGoals.includes(g.id)
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="font-semibold text-gray-900">{g.label}</div>
                    <div className="text-sm text-gray-500">{g.description}</div>
                  </button>
                ))}
              </div>

              <div className="pt-4 border-t">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ROMA Autonomy Level: {formData.romaLevel}
                </label>
                <input
                  type="range"
                  min="1"
                  max="4"
                  value={formData.romaLevel}
                  onChange={(e) => setFormData({ ...formData, romaLevel: parseInt(e.target.value) })}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>L1: Human Approval</span>
                  <span>L2: Guided</span>
                  <span>L3: Supervised</span>
                  <span>L4: Autonomous</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Budget (Optional)</label>
                <input
                  type="text"
                  value={formData.monthlyBudget}
                  onChange={(e) => setFormData({ ...formData, monthlyBudget: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="$10,000"
                />
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">Review your configuration</h2>
              <p className="text-gray-600">Confirm your brand setup before we deploy the agents.</p>
              
              <div className="space-y-4 bg-gray-50 rounded-lg p-6">
                <div>
                  <span className="text-sm text-gray-500">Brand Name</span>
                  <p className="font-semibold text-gray-900">{formData.name || "Not specified"}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Industry</span>
                  <p className="font-semibold text-gray-900">{formData.industry || "Not specified"}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Selected Verticals</span>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {formData.selectedVerticals.map((v) => (
                      <span key={v} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                        {verticals.find((x) => x.id === v)?.name}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Goals</span>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {formData.selectedGoals.map((g) => (
                      <span key={g} className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm">
                        {goals.find((x) => x.id === g)?.label}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <span className="text-sm text-gray-500">ROMA Level</span>
                  <p className="font-semibold text-gray-900">Level {formData.romaLevel}</p>
                </div>
              </div>

              {createBrand.isSuccess && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-green-800 font-medium">Brand configured successfully!</p>
                  <p className="text-green-600 text-sm">
                    {formData.selectedVerticals.length} campaigns have been created.
                  </p>
                  <a href="/market360" className="inline-block mt-2 text-blue-600 hover:underline">
                    Go to Dashboard
                  </a>
                </div>
              )}
            </div>
          )}

          <div className="flex justify-between mt-8 pt-6 border-t">
            <button
              onClick={prevStep}
              disabled={currentStep === 0}
              className="px-6 py-2 text-gray-600 hover:text-gray-900 disabled:opacity-50"
            >
              Back
            </button>
            {currentStep < steps.length - 1 ? (
              <button
                onClick={nextStep}
                disabled={!canProceed()}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                Continue
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={createBrand.isPending || createBrand.isSuccess}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {createBrand.isPending ? "Creating..." : createBrand.isSuccess ? "Done!" : "Launch Campaigns"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
