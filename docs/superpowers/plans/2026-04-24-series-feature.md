# 블로그 시리즈 기능 완성 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 일반 블로그 포스트를 시리즈 단위로 묶어서 조회/탐색할 수 있도록 시리즈 상세 페이지를 신설하고, 포스트 상세 페이지에 시리즈 배지와 형제 포스트 목록을 표시한다.

**Architecture:** 기존 태그 시스템(`[tag].astro`)과 동일한 정적 사이트 패턴을 따른다. `src/utils/collection.ts`에 정렬 헬퍼를 추가하고, 재사용 가능한 `SeriesPostList.astro` 컴포넌트를 시리즈 상세 페이지와 포스트 상세 페이지 양쪽에서 사용한다. 포스트 내 순서는 `createdAt` 오름차순으로 결정한다.

**Tech Stack:** Astro 5, TypeScript, Tailwind CSS, dayjs (기존 프로젝트 스택 그대로).

**Spec 참조:** `docs/superpowers/specs/2026-04-24-series-feature-design.md`

**테스트 전략:** 이 프로젝트에는 자동화된 테스트 프레임워크가 없다. 각 태스크 검증은 다음 조합으로 수행한다:
- `npx astro check` — 타입 검사
- `npm run build` — 정적 빌드 성공 확인
- `npm run dev` — 브라우저 수동 검증 (해당하는 태스크에서)
- `npm run lint` — eslint 통과 확인

---

## File Structure

### 신규 파일
- `src/components/blog/SeriesPostList.astro` — 시리즈 포스트 목록 공통 컴포넌트
- `src/pages/blog/series/[id].astro` — 시리즈 상세 페이지 (동적 라우트)

### 수정 파일
- `src/utils/collection.ts` — `getSeriesPosts` 헬퍼 추가
- `src/components/blog/SeriesCard.astro` — 카드 전체를 시리즈 상세 페이지로 가는 링크로 래핑
- `src/pages/blog/[slug].astro` — 포스트 상단 시리즈 배지 + 본문 아래 `SeriesPostList` 블록 추가

---

## Task 1: `getSeriesPosts` 헬퍼 추가

**Files:**
- Modify: `src/utils/collection.ts`

- [ ] **Step 1: `getSeriesPosts` 함수 추가**

`src/utils/collection.ts` 파일을 다음 내용으로 덮어쓴다 (기존 함수는 유지, 새 함수는 파일 맨 뒤에 추가):

```ts
import dayjs from 'dayjs';

export const sortByDate = <T extends { data: { createdAt: string } }>(items: T[]): T[] => {
  return [...items].sort(
    (a, b) => dayjs(b.data.createdAt).valueOf() - dayjs(a.data.createdAt).valueOf(),
  );
};

export const getAllTags = <T extends { data: { tags: string[] } }>(items: T[]): string[] => {
  const tags = items.flatMap((item) => item.data.tags);
  return [...new Set(tags)].sort();
};

export const getSeriesPosts = <
  T extends { data: { seriesId?: string; createdAt: string } },
>(
  items: T[],
  seriesId: string,
): T[] => {
  return [...items]
    .filter((item) => item.data.seriesId === seriesId)
    .sort((a, b) => dayjs(a.data.createdAt).valueOf() - dayjs(b.data.createdAt).valueOf());
};
```

- [ ] **Step 2: 타입 검사**

Run: `npx astro check`
Expected: 에러 없음 (기존 코드와 새 함수 모두 통과).

- [ ] **Step 3: 빌드 검사**

Run: `npm run build`
Expected: 빌드 성공. 새 함수는 아직 호출되지 않으므로 결과물은 이전과 동일.

- [ ] **Step 4: 커밋**

```bash
git add src/utils/collection.ts
git commit -m "feat: getSeriesPosts 헬퍼 추가"
```

---

## Task 2: `SeriesPostList` 공통 컴포넌트 생성

**Files:**
- Create: `src/components/blog/SeriesPostList.astro`

- [ ] **Step 1: 컴포넌트 파일 작성**

`src/components/blog/SeriesPostList.astro`를 다음 내용으로 생성한다:

```astro
---
import type { CollectionEntry } from 'astro:content';

interface Props {
  series: CollectionEntry<'series'>;
  posts: CollectionEntry<'posts'>[];
  currentPostId?: string;
}

const { series, posts, currentPostId } = Astro.props;
const showHeader = currentPostId !== undefined;
---

<aside class="rounded-lg border border-gray-200 p-6">
  {
    showHeader && (
      <div class="mb-4 border-b border-gray-100 pb-3">
        <p class="mb-1 text-xs uppercase tracking-wide text-gray-400">시리즈</p>
        <a
          href={`/blog/series/${series.data.id}`}
          class="text-lg font-semibold hover:text-blue-600"
        >
          {series.data.name}
        </a>
        {series.data.description && (
          <p class="mt-1 text-sm text-gray-500">{series.data.description}</p>
        )}
      </div>
    )
  }
  {
    posts.length === 0 ? (
      <p class="text-sm text-gray-400">아직 포스트가 없습니다.</p>
    ) : (
      <ol class="flex flex-col gap-1">
        {posts.map((post, index) => {
          const isCurrent = post.id === currentPostId;
          const label = `${index + 1}. ${post.data.title}`;
          return (
            <li>
              {isCurrent ? (
                <span class="block rounded bg-gray-100 px-3 py-2 text-sm font-medium text-gray-900">
                  {label}
                </span>
              ) : (
                <a
                  href={`/blog/${post.id}`}
                  class="block rounded px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-blue-600"
                >
                  {label}
                </a>
              )}
            </li>
          );
        })}
      </ol>
    )
  }
</aside>
```

- [ ] **Step 2: 타입 검사**

Run: `npx astro check`
Expected: 에러 없음.

- [ ] **Step 3: 빌드 검사**

Run: `npm run build`
Expected: 빌드 성공. 컴포넌트는 아직 사용되지 않으므로 결과물에 영향 없음.

- [ ] **Step 4: 커밋**

```bash
git add src/components/blog/SeriesPostList.astro
git commit -m "feat: SeriesPostList 컴포넌트 추가"
```

---

## Task 3: 시리즈 상세 페이지 `[id].astro` 생성

**Files:**
- Create: `src/pages/blog/series/[id].astro`

이 태스크를 완료하면 `/blog/series/sample-series`에 접근 가능해진다.

- [ ] **Step 1: 동적 라우트 파일 작성**

`src/pages/blog/series/[id].astro`를 다음 내용으로 생성한다:

```astro
---
import { getCollection } from 'astro:content';
import BaseLayout from '../../../layouts/BaseLayout.astro';
import SeriesPostList from '../../../components/blog/SeriesPostList.astro';
import { getSeriesPosts } from '../../../utils/collection';

export async function getStaticPaths() {
  const series = await getCollection('series');
  const posts = await getCollection('posts', ({ data }) => !data.draft);

  return series.map((entry) => ({
    params: { id: entry.data.id },
    props: {
      series: entry,
      posts: getSeriesPosts(posts, entry.data.id),
    },
  }));
}

const { series, posts } = Astro.props;
---

<BaseLayout
  title={`시리즈 · ${series.data.name}`}
  description={series.data.description ?? `'${series.data.name}' 시리즈 포스트 ${posts.length}개입니다.`}
>
  <div class="mb-2 flex items-center gap-2">
    <a href="/blog/series" class="text-sm text-gray-400 hover:text-gray-600">← 시리즈</a>
  </div>
  <h1 class="mb-2 text-3xl font-bold">{series.data.name}</h1>
  {
    series.data.description && (
      <p class="mb-2 text-sm text-gray-500">{series.data.description}</p>
    )
  }
  <p class="mb-8 text-sm text-gray-400">{posts.length}개의 포스트</p>
  <SeriesPostList series={series} posts={posts} />
</BaseLayout>
```

- [ ] **Step 2: 타입 검사**

Run: `npx astro check`
Expected: 에러 없음.

- [ ] **Step 3: 빌드 검사**

Run: `npm run build`
Expected: 빌드 성공. 빌드 로그에 `/blog/series/sample-series/index.html` 같은 경로가 생성되는 것을 확인할 수 있다.

- [ ] **Step 4: 브라우저 수동 확인**

Run: `npm run dev` (이미 실행 중이면 생략)
브라우저에서 `http://localhost:4321/blog/series/sample-series` 진입.
Expected:
- "← 시리즈" 뒤로가기 링크 표시
- "샘플 시리즈" 제목(h1)
- "시리즈 설명입니다." 설명
- "0개의 포스트" 카운트
- `SeriesPostList` 블록에 "아직 포스트가 없습니다." 빈 상태 표시

확인 후 dev 서버는 계속 실행해둬도 되고, 멈춰도 된다.

- [ ] **Step 5: 커밋**

```bash
git add src/pages/blog/series/[id].astro
git commit -m "feat: 시리즈 상세 페이지 /blog/series/[id] 추가"
```

---

## Task 4: `SeriesCard`를 클릭 가능한 링크로 전환

**Files:**
- Modify: `src/components/blog/SeriesCard.astro`

- [ ] **Step 1: 카드를 링크로 래핑**

`src/components/blog/SeriesCard.astro` 파일 전체를 다음으로 교체한다:

```astro
---
import type { CollectionEntry } from 'astro:content';

interface Props {
  series: CollectionEntry<'series'>;
  postCount: number;
}

const { series, postCount } = Astro.props;
---

<a
  href={`/blog/series/${series.data.id}`}
  class="block rounded-lg border border-gray-200 p-6 transition hover:border-gray-300 hover:bg-gray-50"
>
  <h2 class="mb-1 text-xl font-semibold">{series.data.name}</h2>
  {series.data.description && <p class="mb-3 text-sm text-gray-500">{series.data.description}</p>}
  <span class="text-xs text-gray-400">{postCount}개의 포스트</span>
</a>
```

변경점 요약:
- 루트 요소를 `<article>`에서 `<a>`로 변경
- `href`에 시리즈 상세 페이지 경로 지정
- hover 상태 스타일 추가 (`hover:border-gray-300 hover:bg-gray-50`)
- `transition` 유틸리티로 부드러운 hover 전환

- [ ] **Step 2: 타입 검사**

Run: `npx astro check`
Expected: 에러 없음.

- [ ] **Step 3: 빌드 검사**

Run: `npm run build`
Expected: 빌드 성공.

- [ ] **Step 4: 브라우저 수동 확인**

`http://localhost:4321/blog/series`로 이동.
Expected:
- 카드에 hover 시 배경/테두리가 변함
- 카드 클릭 시 `/blog/series/sample-series`로 이동

- [ ] **Step 5: 커밋**

```bash
git add src/components/blog/SeriesCard.astro
git commit -m "feat: SeriesCard를 시리즈 상세 페이지 링크로 전환"
```

---

## Task 5: 포스트 상세 페이지에 시리즈 배지 + 하단 블록 통합

**Files:**
- Modify: `src/pages/blog/[slug].astro`

이 태스크는 두 가지 UI 요소를 한 번에 추가한다. 스펙상 한 맥락(포스트 페이지의 시리즈 표시)에 속하므로 하나의 태스크로 묶는다.

- [ ] **Step 1: 페이지 파일 교체**

`src/pages/blog/[slug].astro` 파일 전체를 다음으로 교체한다:

```astro
---
import { getCollection, render } from 'astro:content';
import BaseLayout from '../../layouts/BaseLayout.astro';
import GiscusComments from '../../components/Giscus';
import SeriesPostList from '../../components/blog/SeriesPostList.astro';
import { formatDate } from '../../utils/date';
import { getSeriesPosts } from '../../utils/collection';

export async function getStaticPaths() {
  const posts = await getCollection('posts', ({ data }) => !data.draft);
  const series = await getCollection('series');

  return posts.map((post) => {
    const seriesEntry = post.data.seriesId
      ? series.find((s) => s.data.id === post.data.seriesId)
      : undefined;
    const seriesPosts = seriesEntry ? getSeriesPosts(posts, seriesEntry.data.id) : [];

    return {
      params: { slug: post.id },
      props: { post, series: seriesEntry, seriesPosts },
    };
  });
}

const { post, series, seriesPosts } = Astro.props;
const { Content } = await render(post);
---

<BaseLayout
  title={post.data.title}
  description={post.data.description}
  thumbnail={post.data.thumbnail}
>
  <article>
    <img
      src={post.data.thumbnail}
      alt={post.data.title}
      width="1200"
      height="300"
      class="mb-8 block w-full rounded-[10px] border border-[var(--border)]"
      style="height: 300px; object-fit: cover;"
    />
    <header class="mb-10">
      {
        series && (
          <div class="mb-3">
            <a
              href={`/blog/series/${series.data.id}`}
              class="inline-flex items-center gap-1 rounded bg-blue-50 px-2 py-0.5 text-sm text-blue-600 hover:bg-blue-100"
            >
              <span class="text-xs uppercase tracking-wide">시리즈</span>
              <span class="text-gray-300">·</span>
              <span>{series.data.name}</span>
            </a>
          </div>
        )
      }
      <div class="mb-3 flex flex-wrap gap-2">
        {
          post.data.tags.map((tag) => (
            <a
              href={`/blog/tags/${encodeURIComponent(tag)}`}
              class="rounded bg-gray-100 px-2 py-0.5 text-sm text-gray-500 hover:bg-gray-200"
            >
              #{tag}
            </a>
          ))
        }
      </div>
      <h1 class="mb-2 text-4xl font-bold leading-tight">{post.data.title}</h1>
      <p class="mb-3 text-sm text-gray-500">{post.data.description}</p>
      <div class="flex items-center gap-4 text-sm text-gray-400">
        <time datetime={post.data.createdAt}>{formatDate(post.data.createdAt)}</time>
      </div>
    </header>
    <div class="prose prose-gray max-w-none">
      <Content />
    </div>
  </article>
  {
    series && (
      <section class="mt-12">
        <SeriesPostList series={series} posts={seriesPosts} currentPostId={post.id} />
      </section>
    )
  }
  <section class="mt-16 border-t border-gray-100 pt-10">
    <GiscusComments client:only="react" />
  </section>
</BaseLayout>
```

변경점 요약:
- `getStaticPaths`에서 시리즈 엔트리와 정렬된 형제 포스트를 계산해 props로 전달
- `seriesId`는 있는데 해당 series 엔트리를 못 찾으면 `series === undefined` → 배지/블록 둘 다 생략 (스펙 엣지 케이스 D의 첫 행)
- 태그 줄 위에 시리즈 배지 (blue-50 배경으로 태그와 시각적으로 구분)
- `</article>` 뒤, 댓글 `<section>` 앞에 `SeriesPostList` 블록 (`currentPostId={post.id}`로 전달 → 헤더 렌더 + 현재 글 하이라이트)

- [ ] **Step 2: 타입 검사**

Run: `npx astro check`
Expected: 에러 없음.

- [ ] **Step 3: 빌드 검사**

Run: `npm run build`
Expected: 빌드 성공. 현재는 `seriesId`를 쓰는 포스트가 없으므로 실제 배지/블록이 렌더되는 페이지는 아직 없다.

- [ ] **Step 4: 커밋**

```bash
git add src/pages/blog/[slug].astro
git commit -m "feat: 포스트 상세 페이지에 시리즈 배지 및 목록 블록 추가"
```

---

## Task 6: 통합 수동 검증

**Files:** (변경 없음)

실제 포스트에 `seriesId`를 임시로 붙여 End-to-end 흐름을 확인한다. 스펙의 검증 체크리스트와 동일하다.

- [ ] **Step 1: 시리즈 상세 페이지 — 포스트 없는 상태 확인**

`npm run dev` 실행 후 `http://localhost:4321/blog/series` 진입.
Expected:
- "샘플 시리즈" 카드 표시, hover 동작
- 카드 클릭 시 `/blog/series/sample-series`로 이동
- 상세 페이지에서 "0개의 포스트" + "아직 포스트가 없습니다" 빈 상태

- [ ] **Step 2: 포스트 하나에 `seriesId` 임시 부여**

임의의 기존 포스트 파일 하나를 고른다 (예: `src/content/posts/point-domain-design.mdx`). 해당 파일의 frontmatter 맨 위 영역에 `seriesId: 'sample-series'` 줄을 추가한다.

예 (frontmatter 일부):
```mdx
---
title: '...'
description: '...'
createdAt: '...'
updatedAt: '...'
tags: [...]
seriesId: 'sample-series'
thumbnail: '...'
---
```

dev 서버는 자동으로 리로드된다.

- [ ] **Step 3: 시리즈 상세 페이지 재확인**

`http://localhost:4321/blog/series/sample-series` 새로고침.
Expected:
- "1개의 포스트"로 카운트 증가
- 리스트에 해당 포스트 제목이 `1. {제목}` 형식으로 표시
- 항목 클릭 시 해당 포스트 상세 페이지로 이동

- [ ] **Step 4: 포스트 상세 페이지에서 시리즈 표시 확인**

위 단계에서 링크로 이동한 포스트 상세 페이지에서:
Expected:
- 제목 위, 태그 줄 위에 "시리즈 · 샘플 시리즈" 배지 표시 (파란 톤)
- 배지 클릭 시 `/blog/series/sample-series`로 이동
- 본문 아래, 댓글 위에 `SeriesPostList` 블록 표시
  - 헤더에 "시리즈" 레이블 + 시리즈명 + 설명
  - 리스트에 현재 포스트가 하이라이트(회색 배경)되며 링크가 아님
- 시리즈 목록 페이지(`/blog/series`)에서도 해당 시리즈 카드에 "1개의 포스트"로 표시

- [ ] **Step 5: 존재하지 않는 seriesId 처리 확인**

Step 2에서 추가한 `seriesId`를 존재하지 않는 값으로 일시 변경: `seriesId: 'no-such-series'`
dev 서버 자동 리로드 후 해당 포스트 상세 페이지에 접근.
Expected:
- 배지/블록 모두 렌더되지 않음
- 포스트 본문 자체는 정상 렌더
- 에러/경고 없이 페이지 로드

확인 후 해당 값을 원래대로 되돌리거나 아예 `seriesId` 줄을 제거한다.

- [ ] **Step 6: 포스트 여러 개로 정렬 순서 확인 (선택)**

두 개 이상의 포스트에 `seriesId: 'sample-series'`를 부여하고 `createdAt` 날짜가 다른 두 포스트에 대해 확인.
Expected:
- 시리즈 상세 페이지 및 포스트 하단 블록에서 오래된 글이 먼저 (`createdAt` 오름차순)

- [ ] **Step 7: 임시 변경 되돌리기**

검증용으로 추가한 `seriesId` 필드를 관련 포스트들에서 모두 제거 (실제 시리즈가 결정되기 전까지는 production에 반영하지 않음).

Run: `git status`
Expected: 변경된 파일이 `src/content/posts/...` 밖에 없다면 `git checkout -- src/content/posts/` 또는 개별 편집으로 되돌림.

- [ ] **Step 8: 최종 빌드 + 린트**

Run: `npm run build && npm run lint`
Expected: 둘 다 성공.

- [ ] **Step 9: (커밋 없음)**

Task 6은 검증만 수행하는 태스크로, 새 커밋은 만들지 않는다. Step 2에서 임시로 추가한 `seriesId` 필드는 Step 7에서 되돌렸으므로 워킹트리는 Task 5 이후 상태와 동일해야 한다.

---

## Spec Coverage Check

| Spec 요구사항 | 구현 태스크 |
|---|---|
| D1. `createdAt` 오름차순 | Task 1 (`getSeriesPosts`) |
| D2. 포스트 하단 전체 목록 블록 | Task 2 (컴포넌트) + Task 5 (통합) |
| D3. 상단 배지 | Task 5 |
| `/blog/series/[id]` 상세 페이지 | Task 3 |
| `SeriesCard` 링크화 | Task 4 |
| `getSeriesPosts` 헬퍼 | Task 1 |
| 엣지: 유효하지 않은 seriesId → 조용히 생략 | Task 5 (`series.find` → undefined) |
| 엣지: 0개 포스트 | Task 2 (빈 상태) + Task 3 (count 0) |
| 엣지: draft 필터 | Task 3, Task 5 (getCollection filter) |
| 검증 계획 | Task 6 |
