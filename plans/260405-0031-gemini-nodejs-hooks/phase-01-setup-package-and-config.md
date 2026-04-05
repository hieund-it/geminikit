# Phase 01 — Setup Package & Config

## Context Links
- Plan: [plan.md](./plan.md)
- Researcher report: [plans/reports/researcher-260405-0025-gemini-cli-hooks-specification.md](../../plans/reports/researcher-260405-0025-gemini-cli-hooks-specification.md)

## Overview
- **Priority:** P1 (blocks all other phases)
- **Status:** Completed
- **Effort:** 30m

Setup Node.js package for hooks and configure Gemini CLI to trigger scripts via `settings.json`.

## Requirements

**Functional:**
- `package.json` in `.gemini/hooks/` with `@google/generative-ai` dep
- `settings.json` updated with 5 hook event registrations
- Scripts resolve correctly from CLI working directory

**Non-functional:**
- Hooks run in < 100ms overhead (exclude API calls)
- Node.js 18+ compatibility (ESM or CJS)

## Architecture

```
.gemini/hooks/
├── package.json           ← deps: @google/generative-ai
├── node_modules/          ← after npm install
├── lib/                   ← shared modules (phase 02)
├── session-start.js       ← hook scripts (phase 03)
├── after-model.js
├── pre-compress.js
├── after-tool.js
└── session-end.js
```

`settings.json` hook config schema (Gemini CLI v0.26.0+):
```json
{
  "hooks": {
    "EventType": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "node .gemini/hooks/script.js",
            "timeout": 30000
          }
        ]
      }
    ]
  }
}
```

## Related Code Files
- **Modify:** `.gemini/settings.json`
- **Create:** `.gemini/hooks/package.json`

## Implementation Steps

1. **Create `.gemini/hooks/package.json`:**
   ```json
   {
     "name": "gemini-hooks",
     "version": "1.0.0",
     "type": "commonjs",
     "dependencies": {
       "@google/generative-ai": "^0.21.0"
     }
   }
   ```
   Use `commonjs` (not ESM) — simpler `require()` in hook scripts, no `.mjs` extension needed.

2. **Run `npm install` in `.gemini/hooks/`:**
   ```bash
   cd .gemini/hooks && npm install
   ```

3. **Update `.gemini/settings.json`** — add `hooks` key:
   ```json
   {
     "hooks": {
       "SessionStart": [
         { "hooks": [{ "type": "command", "command": "node .gemini/hooks/session-start.js", "timeout": 5000 }] }
       ],
       "AfterModel": [
         { "hooks": [{ "type": "command", "command": "node .gemini/hooks/after-model.js", "timeout": 30000 }] }
       ],
       "PreCompress": [
         { "hooks": [{ "type": "command", "command": "node .gemini/hooks/pre-compress.js", "timeout": 10000 }] }
       ],
       "AfterTool": [
         { "hooks": [{ "type": "command", "command": "node .gemini/hooks/after-tool.js", "timeout": 5000 }] }
       ],
       "SessionEnd": [
         { "hooks": [{ "type": "command", "command": "node .gemini/hooks/session-end.js", "timeout": 10000 }] }
       ]
     }
   }
   ```

4. **Add `.gemini/hooks/node_modules` to `.gitignore`:**
   ```
   .gemini/hooks/node_modules/
   .gemini/hooks/errors.log
   ```

## Todo List
- [x] Create `.gemini/hooks/package.json`
- [x] Run `npm install` in `.gemini/hooks/`
- [x] Update `.gemini/settings.json` with hooks config
- [x] Update `.gitignore`
- [x] Verify Gemini CLI version is v0.26.0+ (`gemini --version`)

## Success Criteria
- `node_modules/@google/generative-ai` exists in `.gemini/hooks/`
- `settings.json` validates as valid JSON with hooks block
- `gemini --version` shows v0.26.0 or higher

## Risk Assessment
- **Gemini CLI version mismatch** → hooks silently ignored. Mitigation: check version in session-start.js
- **Command path resolution** → `node .gemini/hooks/...` assumes CWD = project root. Mitigation: use absolute path with `GEMINI_PROJECT_DIR` env var if needed

## Security Considerations
- `node_modules` never committed (gitignore)
- `errors.log` never committed (may contain path info)
- API key via env var only, never hardcoded

## Next Steps
→ Phase 02: Implement lib modules
