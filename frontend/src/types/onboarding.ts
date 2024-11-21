// frontend/src/types/onboarding.ts
export interface OnboardingData {
  basicInfo: {
    name: string;
    email: string;
    phone: string;
  };
  salonInfo: {
    name: string;
    address: string;
    phone: string;
    openingHours: string;
  };
  professionals: Array<{
    name: string;
    specialties: string[];
    phone: string;
  }>;
  services: Array<{
    systemServiceId: number;
    price?: number;
    duration?: number;
  }>;
  payment: {
    planId: string;
    method: string;
  };
}