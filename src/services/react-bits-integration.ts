/**
 * React Bits Integration Service - COMPATIBILITY WRAPPER
 * 
 * This service delegates to the production React Bits integration for enhanced features
 * while maintaining backward compatibility with existing component generation code.
 */

import { ReactBitsIntegrationService } from './react-bits-integration-prod';

export interface ReactBitsComponent {
  name: string;
  category: 'text' | 'animations' | 'components' | 'backgrounds';
  variants: string[];
  dependencies: string[];
  customizable: boolean;
  animationType: 'css' | 'framer' | 'gsap' | 'spring';
  complexity: 'simple' | 'moderate' | 'complex';
}

export interface ComponentGenerationRequest {
  componentName: string;
  variant?: string;
  customizations?: {
    colors?: string[];
    timing?: number;
    easing?: string;
    scale?: number;
    direction?: 'left' | 'right' | 'up' | 'down';
    stagger?: number;
  };
  framework?: 'react' | 'nextjs' | 'vite';
  styling?: 'css' | 'tailwind' | 'styled-components';
}

export interface GeneratedComponent {
  componentCode: string;
  stylingCode: string;
  dependencies: string[];
  usage: string;
  preview: string;
  customizations: any;
}

// Compatibility wrapper class
export class ReactBitsIntegration {
  private prodService: ReactBitsIntegrationService;

  constructor() {
    this.prodService = new ReactBitsIntegrationService();
  }

  async generateComponent(request: ComponentGenerationRequest): Promise<GeneratedComponent> {
    const prodRequest = {
      componentName: request.componentName,
      componentType: 'custom' as const,
      styling: (request.styling === 'css' ? 'css-modules' : request.styling || 'tailwind') as const,
      variants: request.variant ? [request.variant] : [],
      props: request.customizations,
      responsive: true,
      accessibility: true
    };

    const result = await this.prodService.generateComponent(prodRequest);
    
    return {
      componentCode: result.componentCode,
      stylingCode: result.stylingCode,
      dependencies: ['framer-motion', 'tailwindcss'],
      usage: result.documentation,
      preview: result.previewUrl || '',
      customizations: request.customizations || {}
    };
  }
}

// Export singleton instance for backward compatibility
export const reactBitsIntegration = new ReactBitsIntegration();