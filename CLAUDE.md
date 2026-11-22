# Project Context and Rules

## Tech Stack
- Framework: Next.js (App Router)
- Language: TypeScript (strict mode)
- Styling: Tailwind CSS

## Token and Output Efficiency (STRICT)
1. No Prose: Never include conversational filler, introductions, summaries, or post-edit explanations unless explicitly asked. Respond with code/diffs or 1-line confirmations only.
2. Targeted File Reads: Do not scan the entire repository or read node_modules, .next, or lockfiles. Read only the exact files referenced in the prompt or directly imported by them.
3. Minimal Diffs: Edit only the specific lines required. Never rewrite or reformat untouched code, comments, or imports.
4. No Unsolicited Changes: Do not add extra dependencies, unit tests, error boundaries, or refactors unless requested.
5. Concise Code: Prefer clean, idiomatic Tailwind utility classes and standard Next.js patterns (next/link, next/image, Server Components by default) without boilerplate abstractions.

# Key Paths
- src/app/
- src/components