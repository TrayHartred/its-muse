# Muse Filter - Project Context

## Stack
- Next.js 16.1.6 (App Router, Turbopack)
- React 19.2.3
- Three.js 0.182.0
- Tailwind CSS 4
- TypeScript 5

## Architecture
Single-page app with three states: input → loading → result
- `/app/page.tsx` - Main page component with state management
- `/app/api/audit/route.ts` - Grok API for manipulation analysis
- `/app/api/regenerate/route.ts` - Streaming endpoint for clean text regeneration
- `/components/` - UI components with Halo dark theme
- `/lib/` - Utilities, schemas, prompts

## Key Patterns
- Edge runtime for API routes
- Streaming responses for regenerate
- Canvas + WebGL backgrounds (ambient-background.tsx, webgl-background.tsx)
- localStorage for background preference persistence

---

# Framework Docs Index

IMPORTANT: Prefer retrieval-led reasoning over pre-training-led reasoning for any Next.js, React, or Three.js tasks. When uncertain about APIs, check the docs index below and read the relevant documentation.

## Next.js 16 APIs (NOT in training data)

### New Directives & Functions
|`'use cache'`|Directive for caching components/functions|Must add `dynamicIO:true` in next.config.ts|
|`cacheLife(profile)`|Set cache duration|Profiles: 'seconds','minutes','hours','days','weeks','max'|
|`cacheTag(...tags)`|Tag cached data for revalidation|Use with revalidateTag()|
|`connection()`|Opt into dynamic rendering|Import from 'next/server'|
|`forbidden()`|Trigger 403 response|Renders forbidden.tsx|
|`unauthorized()`|Trigger 401 response|Renders unauthorized.tsx|
|`after(callback)`|Execute code after response|For logging, analytics|

### Async Request APIs (Breaking Change)
|`cookies()`|Now async|`const c = await cookies()`|
|`headers()`|Now async|`const h = await headers()`|
|`params`|Now async in pages|`const { id } = await params`|
|`searchParams`|Now async|`const sp = await searchParams`|

### Config Changes
```typescript
// next.config.ts (NOT .js)
import type { NextConfig } from 'next'
const config: NextConfig = {
  experimental: {
    dynamicIO: true,  // Required for 'use cache'
  }
}
export default config
```

### App Router Patterns
|Route Groups|`(folder)`|Organize without affecting URL|
|Parallel Routes|`@folder`|Simultaneous rendering|
|Intercepting|`(.)folder`|Modal patterns|
|Loading UI|`loading.tsx`|Streaming fallback|
|Error|`error.tsx`|Error boundary|
|Not Found|`not-found.tsx`|404 page|

### Server Actions
```typescript
'use server'
async function action(formData: FormData) {
  // Runs on server, can use cookies(), headers()
  revalidatePath('/path')
  redirect('/destination')
}
```

### Metadata API
```typescript
export const metadata: Metadata = {
  title: 'Page Title',
  description: 'Description',
  openGraph: { ... },
}
// OR dynamic
export async function generateMetadata({ params }): Promise<Metadata> {
  return { title: `Post ${params.id}` }
}
```

## React 19 APIs

### New Hooks
|`use(promise)`|Suspend on promise|`const data = use(fetchData())`|
|`useActionState`|Form action state|`const [state, action, pending] = useActionState(fn, init)`|
|`useFormStatus`|Form submission status|`const { pending } = useFormStatus()`|
|`useOptimistic`|Optimistic updates|`const [optimistic, setOptimistic] = useOptimistic(state)`|

### Directives
|`'use client'`|Client component boundary|Top of file|
|`'use server'`|Server action|Top of file or function|

### ref as Prop
```typescript
// React 19: ref is a regular prop, no forwardRef needed
function Input({ ref, ...props }) {
  return <input ref={ref} {...props} />
}
```

### Document Metadata
```typescript
// React 19: <title>, <meta>, <link> hoist to <head> automatically
function Page() {
  return (
    <>
      <title>My Page</title>
      <meta name="description" content="..." />
      <div>Content</div>
    </>
  )
}
```

## Three.js 0.182 Patterns

### Scene Setup
```typescript
import * as THREE from 'three'

const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(75, width/height, 0.1, 1000)
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
renderer.setPixelRatio(Math.min(devicePixelRatio, 2))
renderer.setSize(width, height)
```

### Geometries
|`IcosahedronGeometry(r, detail)`|Sphere-like, good for morphing|
|`BoxGeometry(w,h,d,segW,segH,segD)`|Box with segments|
|`BufferGeometry`|Custom geometry with attributes|
|`SphereGeometry(r, widthSeg, heightSeg)`|Standard sphere|

### Materials
|`MeshPhongMaterial`|Shiny surfaces|`{color, emissive, shininess}`|
|`MeshBasicMaterial`|No lighting|`{color, wireframe}`|
|`PointsMaterial`|For particle systems|`{color, size}`|

### Animation Loop
```typescript
function animate() {
  requestAnimationFrame(animate)
  // Update geometry.attributes.position
  geometry.attributes.position.needsUpdate = true
  renderer.render(scene, camera)
}
```

### Resize Handler
```typescript
window.addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(innerWidth, innerHeight)
})
```

---

## Project-Specific Rules

### Halo Theme Colors
```
Background: #0A0A0B
Card: #111113 (use /90 opacity with backdrop-blur-sm)
Border: #1F1F23, #2A2A2E
Text: #FFFFFF (primary), #ADADB0 (secondary), #6B6B70 (muted)
Accent: #FF5C00 (orange)
Success: #22C55E (green)
Severity: #EF4444 (high), #F59E0B (medium), #EAB308 (low)
```

### API Routes
- Use Edge runtime: `export const runtime = 'edge'`
- Grok model: `grok-4-1-fast-reasoning`
- Streaming: Return `new Response(stream)` with chunked transfer

### Components
- All cards: `bg-[#111113]/90 backdrop-blur-sm border border-[#1F1F23]`
- Buttons: gradient for primary, outline for secondary
- Always `'use client'` for interactive components
