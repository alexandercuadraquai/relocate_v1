import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  // Custom generateId: Astro's glob loader strips the LAST TWO dot-segments of a
  // filename by default (e.g. "foo.en.md" -> id "foo"), which collides EN/ES
  // variants of the same article slug onto one entry. Keep the language suffix
  // in the id so each language variant is a distinct collection entry.
  loader: glob({
    pattern: '**/*.md',
    base: './src/content/blog',
    generateId: ({ entry }) => entry.replace(/\.md$/, '')
  }),
  schema: z.object({
    lang: z.enum(['en', 'es']),
    slug: z.string(), // shared slug across EN/ES, e.g. "friendly-nations-visa-guide-2026"
    title: z.string(),
    metaTitle: z.string(),
    metaDescription: z.string(),
    excerpt: z.string(),
    publishDate: z.coerce.date(),
    updatedDate: z.coerce.date(),
    keyword: z.string(),
    secondaryKeywords: z.array(z.string()),
    faqs: z.array(z.object({ q: z.string(), a: z.string() })).min(3)
  })
});

export const collections = { blog };
