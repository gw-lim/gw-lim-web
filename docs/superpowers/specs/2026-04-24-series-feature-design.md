# 블로그 시리즈 기능 완성 — 설계 문서

날짜: 2026-04-24
범위: 블로그 시리즈 기능 (일반 포스트를 묶음으로 조회)

## 배경

현재 저장소에는 시리즈 기능의 뼈대만 있고 실제로 "묶음으로 보기"를 할 수 없다.

- `src/content/config.ts`에 `series` 컬렉션과 `posts.seriesId` 필드가 정의돼 있음
- `src/content/series/series.json`에 샘플 시리즈 1개 존재
- `src/pages/blog/series/index.astro`에 시리즈 목록 페이지 있음
- `src/components/blog/SeriesCard.astro`로 카드 렌더링

누락된 것:
- 시리즈 상세 페이지 (`/blog/series/{id}`) 없음 — `SeriesCard`를 눌러도 갈 곳 없음
- 포스트 상세 페이지에 시리즈 표시/네비게이션 없음
- 실제로 `seriesId`를 쓰는 포스트 0개 (필드만 존재)

이 스펙은 시리즈 기능을 "묶음으로 조회 가능한" 상태까지 완성하는 것을 목표로 한다.

## 설계 결정

### D1. 시리즈 내 포스트 정렬

**`createdAt` 오름차순** (옛날 → 최근).

대안 후보:
- 포스트 frontmatter에 `seriesOrder: number` 필드 추가 — 명시적 순서
- 시리즈 JSON에 `postIds: string[]`로 순서 명시 — 중앙 집중 관리

`createdAt` 채택 이유: 추가 필드/스키마 변경 없이 기존 데이터만으로 충족. 블로그 운영 맥락에서 작성 순서가 곧 읽는 순서라는 가정이 합리적.

### D2. 포스트 상세 페이지의 시리즈 정보 형태

**전체 목록 블록** (본문 아래, 댓글 위).

- 시리즈 이름 + 설명 + 속한 모든 포스트 리스트
- 현재 포스트는 하이라이트 (링크 아님, 배경색 강조)
- 다른 포스트는 해당 글로 이동하는 링크

"이전/다음만" 패턴도 검토했으나, 시리즈 전체 맥락을 독자가 포스트를 벗어나지 않고 파악/점프할 수 있는 것이 기능의 실용적 가치라고 판단.

### D3. 포스트 상단 시리즈 배지

**추가한다**.

제목 위에 "시리즈 · {시리즈명}" 형태의 작은 링크 표시. 검색/태그로 시리즈 중간 편부터 들어온 독자가 "이 앞뒤에 맥락이 있다"는 것을 상단에서 바로 인지하게 한다. 태그는 주제 분류, 시리즈는 순서 있는 묶음이라 역할이 달라 공존 가능.

## 아키텍처

### 신규 파일

**`src/pages/blog/series/[id].astro`**
시리즈 상세 페이지. 동적 라우트. `getStaticPaths`로 전 시리즈를 정적 생성.

**`src/components/blog/SeriesPostList.astro`**
시리즈 포스트 목록을 렌더하는 공통 컴포넌트. 시리즈 상세 페이지와 포스트 상세 페이지 하단 블록 양쪽에서 사용.

### 수정 파일

**`src/pages/blog/[slug].astro`**
- 태그 줄 위에 시리즈 배지 조건부 렌더
- `</article>` 뒤, 댓글 `<section>` 앞에 `<SeriesPostList>` 조건부 렌더
- 조건: `post.data.seriesId`가 존재하고 해당 시리즈 엔트리가 series 컬렉션에 존재할 때

**`src/components/blog/SeriesCard.astro`**
- 카드 전체를 `<a href={`/blog/series/${series.data.id}`}>`로 래핑
- hover 상태 스타일 추가 (목록의 다른 카드들과 통일감 있게)

**`src/utils/collection.ts`**
- `getSeriesPosts(posts, seriesId)` 헬퍼 함수 추가
- 입력: 전체 posts 컬렉션, seriesId 문자열
- 출력: 해당 시리즈 소속 포스트 배열, `createdAt` 오름차순 정렬된 상태
- draft는 호출측에서 이미 필터링된 posts를 넘기는 것을 전제 (현재 모든 페이지가 그렇게 함)

## 컴포넌트 계약

### `SeriesPostList`

Props:
- `series: CollectionEntry<'series'>` — 시리즈 엔트리
- `posts: CollectionEntry<'posts'>[]` — 정렬된 포스트 배열 (호출측이 정렬 책임)
- `currentPostId?: string` — 현재 포스트의 id. 지정 시 해당 항목 하이라이트 + 링크 아님

렌더:
- 헤더: "시리즈" 레이블 + 시리즈 이름(상세 페이지로 링크) + 설명(있을 때만) — `currentPostId`가 지정된 경우(포스트 상세 페이지 하단 블록)에만 표시. 지정되지 않은 경우(시리즈 상세 페이지)에는 이미 페이지 h1이 시리즈 이름이므로 헤더 생략.
- 포스트 목록: `{n}. {title}` 형식의 순서 있는 리스트
  - 현재 포스트 (`currentPostId`와 일치): 배경 하이라이트, 링크 없음
  - 그 외: 해당 포스트 상세 페이지로 링크
- `posts.length === 0`일 때 "아직 포스트가 없습니다" 빈 상태

즉, `currentPostId` prop은 두 역할을 겸한다: (1) 목록에서 하이라이트할 항목 식별, (2) 헤더 렌더 여부. 포스트 상세 페이지에서만 현재 글이 있으므로 두 조건이 자연스럽게 일치한다.

### `getSeriesPosts(posts, seriesId)`

```ts
export function getSeriesPosts(
  posts: CollectionEntry<'posts'>[],
  seriesId: string
): CollectionEntry<'posts'>[]
```

- `posts.filter((p) => p.data.seriesId === seriesId)`
- `createdAt` 오름차순 정렬 후 반환

## 데이터 흐름

### `/blog/series/[id]` 렌더 흐름
1. `getStaticPaths`: `getCollection('series')`로 모든 시리즈 정적 경로 생성
2. 각 경로 props로 `series` 엔트리 전달
3. 페이지 내부: `getCollection('posts', !draft)` → `getSeriesPosts(posts, series.data.id)`
4. 헤더(뒤로가기, 이름, 설명, 수) + `<SeriesPostList>` 렌더

### 포스트 상세 페이지 렌더 흐름 (`seriesId`가 있을 때)
1. `getCollection('series')`로 시리즈 엔트리 조회 (frontmatter에 지정된 id로 find)
2. 시리즈 엔트리가 없으면 배지/블록 생략 (포스트 본문은 정상 렌더)
3. 있으면:
   - 상단 배지 렌더 (이름 + 상세 페이지 링크)
   - 하단 `<SeriesPostList>` 렌더 (`getSeriesPosts`로 정렬된 형제 포스트 + `currentPostId={post.id}`)

## 엣지 케이스

| 케이스 | 처리 |
|---|---|
| `seriesId`가 존재하지 않는 시리즈 가리킴 | 포스트 정상 렌더, 배지/블록 생략. 빌드 성공 |
| 시리즈에 포스트 0개 | 목록 페이지 "0개의 포스트" 표시, 상세 페이지 빈 상태 메시지 |
| 시리즈에 포스트 1개 | 1개 항목만 있는 리스트 그대로 렌더 (숨기지 않음) |
| draft 포스트 | 기존 필터(`!data.draft`) 그대로 적용 — 시리즈 관련 로직도 동일 필터링된 posts 사용 |
| `sample-series` | 유지. 실제 포스트가 연결되기 전까지 "0개의 포스트"로 노출 |

## 검증 계획

자동화된 테스트가 없는 프로젝트이므로 수동 검증 체크리스트:

- [ ] `npm run build` 통과 — 새 동적 라우트 빌드 성공
- [ ] `/blog/series` 카드 클릭 시 `/blog/series/{id}` 상세 페이지로 이동
- [ ] 샘플 포스트 하나에 `seriesId: "sample-series"` 추가 → 포스트 상단에 배지, 하단에 목록 렌더
- [ ] 시리즈에 2편 이상 포함 → 목록 순서가 `createdAt` 오름차순
- [ ] 현재 포스트가 목록에서 하이라이트 + 링크 아님
- [ ] 배지 클릭 시 시리즈 상세 페이지로 이동
- [ ] 포스트 `seriesId`를 존재하지 않는 값("no-such-series")으로 바꾸면 배지/블록 생략되고 포스트는 정상 렌더
- [ ] 샘플 시리즈 상세 페이지 (`/blog/series/sample-series`)에서 포스트 0개일 때 빈 상태 표시

## 범위 밖 (이번에 하지 않음)

- `seriesOrder` 명시적 순서 필드 추가 — D1 결정에 따라 향후 필요 시 별도 작업
- 홈 또는 블로그 인덱스에서 시리즈 프로모션/필터링
- RSS/OG 메타에 시리즈 정보 포함
- 시리즈별 RSS 피드
- 시리즈 카드에 썸네일/대표 이미지
