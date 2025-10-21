
// Import and re-export types
import type { WidgetConfig } from './types';
export type AgentConfig = WidgetConfig;

// Import configurations from constants
import { LANGUAGE_NAMES, DEFAULT_CONFIG } from './constants';
export const LANGUAGE_CONFIG = LANGUAGE_NAMES;
export const defaultConfig: AgentConfig = DEFAULT_CONFIG;
  
  export function loadConfig(): AgentConfig {
    const globalWindow = window as { AgentWidgetConfig?: AgentConfig };
    const cfg = globalWindow.AgentWidgetConfig ?? {};
    const mergedConfig = { ...defaultConfig, ...cfg };
    
    if (cfg.theme) {
      mergedConfig.theme = { ...defaultConfig.theme, ...cfg.theme };
    }
    if (cfg.agent) {
      mergedConfig.agent = { ...defaultConfig.agent, ...cfg.agent };
    }
    
    return mergedConfig;
  }

  export function validateConfig(config: AgentConfig): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    const validPositions = ['bottom-right', 'bottom-left', 'top-right', 'top-left'];
    if (config.position && !validPositions.includes(config.position)) {
      errors.push(`Invalid position: ${config.position}. Must be one of: ${validPositions.join(', ')}`);
    }
    
    if (config.theme?.primaryColor && !/^#[0-9A-F]{6}$/i.test(config.theme.primaryColor)) {
      errors.push('Invalid primaryColor: must be a valid hex color (e.g., #4F46E5)');
    }
    
    if (config.theme?.background && !/^#[0-9A-F]{6}$/i.test(config.theme.background)) {
      errors.push('Invalid background: must be a valid hex color (e.g., #ffffff)');
    }
    
    if (config.theme?.text && !/^#[0-9A-F]{6}$/i.test(config.theme.text)) {
      errors.push('Invalid text: must be a valid hex color (e.g., #111827)');
    }
    
    if (config.languages) {
      const validLanguages = Object.keys(LANGUAGE_CONFIG);
      const invalidLanguages = config.languages.filter(lang => !validLanguages.includes(lang));
      if (invalidLanguages.length > 0) {
        errors.push(`Invalid languages: ${invalidLanguages.join(', ')}. Supported: ${validLanguages.join(', ')}`);
      }
    }
    
    if (config.maxMessages && (config.maxMessages < 1 || config.maxMessages > 1000)) {
      errors.push('maxMessages must be between 1 and 1000');
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }

  
  export function getLanguageInfo(languageCode: string) {
    return LANGUAGE_CONFIG[languageCode as keyof typeof LANGUAGE_CONFIG] || {
      name: languageCode,
      flag: '🌐',
      native: languageCode
    };
  }
  