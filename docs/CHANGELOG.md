# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.2.1] - 2026-04-05
### Added
- **Native Hooks System**: Five lifecycle hooks (SessionStart, AfterModel, PreCompress, AfterTool, SessionEnd) implemented as Node.js scripts in `.gemini/hooks/`
- **Hook Infrastructure**: Three library modules (memory-manager, gemini-summarizer, logger) for hook operations
- **Auto-Summarization**: Background conversation summarization via Gemini API when token threshold (25K) or turn interval (10) reached
- **Execution Audit Trail**: Tool invocation logging in execution.md with timestamp, name, status, and duration
- **Memory Management**: Automatic short-term to long-term memory promotion, entry trimming, and long-term compression (>15 entries)
- **Sensitive Field Redaction**: AfterTool hook automatically masks sensitive keys (token, secret, password, auth, credential)

## [1.2.0] - 2026-03-24
### Added
- **Memory System**: Implementation of auto-persistence, silent summarization, implicit export, and self-healing.
- **Security Framework**: Agent Permission Matrix, forbidden path blacklisting, tool access control, and pre-emptive secret masking.
- **Context Economy**: Token optimization as a core system principle across all tools and skills.

### Changed
- Refactored Layer 5 (Memory) in system architecture to support advanced persistence.
- Updated `SKILLS_GUIDE.md` with security and economy requirements for skill development.

## [0.1.0] - 2026-03-21
### Added
- Initial release of Gemini Kit framework.
