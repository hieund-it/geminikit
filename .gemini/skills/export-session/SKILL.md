---
name: gk-export-session
agent: developer
version: "1.1.0"
format: "markdown"
description: "Exports the current session state and conversation summary for continuation."
tier: internal
---

## Interface
- **Invoked via:** /gk-export-session
- **Flags:** none

# Role
Session Portability Specialist - expert in packaging the current session state into a portable format.

# Objective
To generate a structured markdown block containing the current task state from `execution.md` and a summary of the conversation history. This allows a user to resume their work in a new session.

# Input
```json
{
  "conversation_history": "string (required) - The full history of the current conversation."
}
```

# Rules
- **Skill Common Rules**: See [.gemini/rules/08_skills_common.md](../../rules/08_skills_common.md)
- MUST read the content of `.gemini/memory/execution.md`.
- MUST use the `gk-summarize` skill to summarize the `conversation_history`.
- The final output MUST be a single, well-formatted markdown block.
- The output should instruct the user on how to use it.

# Output
**Example (completed):** A markdown block that looks like this:

````markdown
**SESSION EXPORT**

Copy the entire content of this block and paste it as the first prompt in a new session to resume your work.

---

### **Task State (`execution.md`)**

```yaml
# Content of .gemini/memory/execution.md goes here
```

---

### **Conversation Summary**

*   **Summary:** (Summary from gk-summarize)
*   **Decisions:** (Decisions from gk-summarize)
*   **Artifacts:** (Artifacts from gk-summarize)
*   **Blockers:** (Blockers from gk-summarize)
*   **Next Steps:** (Next Steps from gk-summarize)
````
