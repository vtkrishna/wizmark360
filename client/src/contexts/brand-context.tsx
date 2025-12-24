import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export interface Brand {
  id: number;
  name: string;
  legalName?: string;
  industry?: string;
  website?: string;
  gstin?: string;
  pan?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  pincode?: string;
  status: "onboarding" | "active" | "paused" | "churned";
  onboardingProgress?: number;
  monthlyBudget?: string;
  currency?: string;
  timezone?: string;
  primaryLanguage?: string;
  targetLanguages?: string[];
  targetRegions?: string[];
  createdAt?: string;
  updatedAt?: string;
  guidelines?: BrandGuidelines;
}

export interface BrandGuidelines {
  logoUrl?: string;
  logoVariants?: Record<string, string>;
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  colorPalette?: string[];
  primaryFont?: string;
  secondaryFont?: string;
  toneOfVoice?: string;
  targetAudience?: string;
  socialHandles?: Record<string, string>;
}

interface BrandContextType {
  currentBrand: Brand | null;
  brands: Brand[];
  isLoading: boolean;
  error: string | null;
  setCurrentBrand: (brand: Brand | null) => void;
  selectBrandById: (id: number) => void;
  refreshBrands: () => void;
  createBrand: (data: any) => Promise<Brand>;
  updateBrand: (id: number, data: Partial<Brand>) => Promise<Brand>;
  deleteBrand: (id: number) => Promise<void>;
}

const BrandContext = createContext<BrandContextType | undefined>(undefined);

export function BrandProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [currentBrand, setCurrentBrand] = useState<Brand | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { data: brandsData, isLoading, refetch } = useQuery({
    queryKey: ["brands"],
    queryFn: async () => {
      const res = await fetch("/api/brands");
      if (!res.ok) throw new Error("Failed to fetch brands");
      return res.json();
    },
    staleTime: 30000
  });

  const brands = Array.isArray(brandsData) ? brandsData : (brandsData?.brands || []);

  useEffect(() => {
    if (brands.length > 0 && !currentBrand) {
      const savedBrandId = localStorage.getItem("currentBrandId");
      if (savedBrandId) {
        const saved = brands.find((b: Brand) => b.id === parseInt(savedBrandId));
        if (saved) {
          setCurrentBrand(saved);
          return;
        }
      }
      setCurrentBrand(brands[0]);
    }
  }, [brands, currentBrand]);

  useEffect(() => {
    if (currentBrand) {
      localStorage.setItem("currentBrandId", String(currentBrand.id));
    }
  }, [currentBrand]);

  const selectBrandById = (id: number) => {
    const brand = brands.find((b: Brand) => b.id === id);
    if (brand) {
      setCurrentBrand(brand);
    }
  };

  const refreshBrands = () => {
    refetch();
  };

  const createBrand = async (data: Partial<Brand>): Promise<Brand> => {
    const res = await fetch("/api/brands", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Failed to create brand");
    }
    const newBrand = await res.json();
    queryClient.invalidateQueries({ queryKey: ["brands"] });
    return newBrand;
  };

  const updateBrand = async (id: number, data: Partial<Brand>): Promise<Brand> => {
    const res = await fetch(`/api/brands/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Failed to update brand");
    }
    const updated = await res.json();
    queryClient.invalidateQueries({ queryKey: ["brands"] });
    if (currentBrand?.id === id) {
      setCurrentBrand(updated);
    }
    return updated;
  };

  const deleteBrand = async (id: number): Promise<void> => {
    const res = await fetch(`/api/brands/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Failed to delete brand");
    }
    queryClient.invalidateQueries({ queryKey: ["brands"] });
    if (currentBrand?.id === id) {
      const remaining = brands.filter((b: Brand) => b.id !== id);
      setCurrentBrand(remaining[0] || null);
    }
  };

  return (
    <BrandContext.Provider
      value={{
        currentBrand,
        brands,
        isLoading,
        error,
        setCurrentBrand,
        selectBrandById,
        refreshBrands,
        createBrand,
        updateBrand,
        deleteBrand
      }}
    >
      {children}
    </BrandContext.Provider>
  );
}

export function useBrand() {
  const context = useContext(BrandContext);
  if (!context) {
    throw new Error("useBrand must be used within a BrandProvider");
  }
  return context;
}

export function useBrandStats(brandId: number | undefined) {
  return useQuery({
    queryKey: ["brand-stats", brandId],
    queryFn: async () => {
      if (!brandId) return null;
      const res = await fetch(`/api/brands/${brandId}/stats`);
      if (!res.ok) throw new Error("Failed to fetch brand stats");
      return res.json();
    },
    enabled: !!brandId,
    staleTime: 60000
  });
}

export function useVerticalData(brandId: number | undefined, vertical: string) {
  return useQuery({
    queryKey: ["vertical-data", brandId, vertical],
    queryFn: async () => {
      if (!brandId) return null;
      const res = await fetch(`/api/brands/${brandId}/vertical/${vertical}/data`);
      if (!res.ok) throw new Error("Failed to fetch vertical data");
      return res.json();
    },
    enabled: !!brandId && !!vertical,
    staleTime: 30000
  });
}
