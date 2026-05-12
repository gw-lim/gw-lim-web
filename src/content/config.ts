import { defineCollection, z } from 'astro:content';
import { glob, file } from 'astro/loaders';

const posts = defineCollection({
  loader: glob({ base: './src/content/posts', pattern: '**/*.{md,mdx}' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    createdAt: z.string(),
    updatedAt: z.string(),
    tags: z.array(z.string()).default([]),
    seriesId: z.string().nullable().optional(),
    thumbnail: z.string(),
    pinned: z.boolean().default(false),
    draft: z.boolean().default(false),
  }),
});

const series = defineCollection({
  loader: file('./src/content/series/series.json'),
  schema: z.object({
    id: z.string(),
    name: z.string(),
    description: z.string().optional(),
  }),
});

const careerSchema = z.object({
  id: z.number(),
  role: z.string(),
  organizationName: z.string(),
  startedAt: z.string(),
  endedAt: z.string().nullable(),
  stack: z.array(z.string()).default([]),
  body: z.array(
    z.object({
      heading: z.string(),
      description: z.string().nullable(),
      lists: z.array(z.string()),
      links: z
        .array(
          z.object({
            label: z.string(),
            href: z.string(),
          }),
        )
        .default([]),
    }),
  ),
});

const careers = defineCollection({
  loader: file('./src/content/careers/careers.json'),
  schema: careerSchema,
});

const activities = defineCollection({
  loader: file('./src/content/activities/activities.json'),
  schema: careerSchema,
});

const education = defineCollection({
  loader: file('./src/content/education/education.json'),
  schema: z.object({
    id: z.number(),
    school: z.string(),
    major: z.string(),
    degree: z.string(),
    startedAt: z.string(),
    endedAt: z.string().nullable(),
    gpa: z.string().optional(),
    narrative: z.string().optional(),
    achievements: z.array(z.string()).default([]),
  }),
});

const certifications = defineCollection({
  loader: file('./src/content/certifications/certifications.json'),
  schema: z.object({
    id: z.number(),
    name: z.string(),
    issuer: z.string(),
    issuedAt: z.string(),
    expiresAt: z.string().nullable(),
  }),
});

const languages = defineCollection({
  loader: file('./src/content/languages/languages.json'),
  schema: z.object({
    id: z.number(),
    name: z.string(),
    proficiency: z.string(),
    note: z.string().nullable().optional(),
  }),
});

export const collections = {
  posts,
  series,
  careers,
  activities,
  education,
  certifications,
  languages,
};
