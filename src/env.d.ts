/// <reference types="astro/client" />

interface Window {
  pirsch?: (event: string, meta?: Record<string, any>) => void;
}
