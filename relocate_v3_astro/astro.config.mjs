// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://relocatepa.com',
  integrations: [
    sitemap({
      // Exclude transactional thank-you pages — no SEO/citation value, shouldn't be indexed.
      filter: (page) => !page.includes('/thanks') && !page.includes('/gracias')
    })
  ]
});