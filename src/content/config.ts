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
  roleEn: z.string().optional(),
  organizationName: z.string(),
  organizationNameEn: z.string().optional(),
  startedAt: z.string(),
  endedAt: z.string().nullable(),
  stack: z.array(z.string()).default([]),
  body: z.array(
    z.object({
      heading: z.string(),
      headingEn: z.string().optional(),
      description: z.string().nullable(),
      descriptionEn: z.string().nullable().optional(),
      lists: z.array(z.string()),
      listsEn: z.array(z.string()).optional(),
      links: z
        .array(
          z.object({
            label: z.string(),
            labelEn: z.string().optional(),
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
    schoolEn: z.string().optional(),
    major: z.string(),
    majorEn: z.string().optional(),
    degree: z.string(),
    degreeEn: z.string().optional(),
    startedAt: z.string(),
    endedAt: z.string().nullable(),
    gpa: z.string().optional(),
    narrative: z.string().optional(),
    narrativeEn: z.string().optional(),
    achievements: z.array(z.string()).default([]),
    achievementsEn: z.array(z.string()).optional(),
  }),
});

const certifications = defineCollection({
  loader: file('./src/content/certifications/certifications.json'),
  schema: z.object({
    id: z.number(),
    name: z.string(),
    nameEn: z.string().optional(),
    issuer: z.string(),
    issuerEn: z.string().optional(),
    issuedAt: z.string(),
    expiresAt: z.string().nullable(),
  }),
});

const languages = defineCollection({
  loader: file('./src/content/languages/languages.json'),
  schema: z.object({
    id: z.number(),
    name: z.string(),
    nameEn: z.string().optional(),
    proficiency: z.string(),
    proficiencyEn: z.string().optional(),
    note: z.string().nullable().optional(),
    noteEn: z.string().nullable().optional(),
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
