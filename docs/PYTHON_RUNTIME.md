# Local Python Runtime & Dependency Management

This guide explains how Gemini Kit manages Python environments locally within each project, ensuring zero global dependencies and clean uninstalls.

## 1. Zero-Install Architecture

When a user initializes a new project with `gk init`, the framework automatically sets up an isolated Python environment inside the project directory (`.gemini/runtime`).

- **System Python (Preferred):** If `python` or `python3` is available in the system PATH, Gemini Kit creates a standard `venv` at `.gemini/runtime/venv`.
- **Embeddable Python (Windows Fallback):** If no system Python is found on Windows, Gemini Kit downloads a lightweight (~15MB) Embeddable Python distribution to `.gemini/runtime/python`.
- **Dependencies:** All required libraries (from `requirements.txt`) are installed into this local environment.

**Result:**
- No global Python installation required.
- No pollution of the user's global package registry.
- Deleting the project folder removes all traces of the runtime.

## 2. Using Python in Skills/Agents

To ensure your skills work across all platforms (Windows, macOS, Linux) and use the correct local environment, **NEVER** run `python script.py` directly.

Instead, always read the `python_path` from `.gemini/settings.json`.

### Recommended Pattern (Node.js)

```javascript
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 1. Load project settings
const settingsPath = path.join(process.cwd(), '.gemini', 'settings.json');
const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));

// 2. Get the configured local Python path
const pythonPath = settings.python_path;

if (!pythonPath) {
  console.error('Error: Python runtime not configured. Run "gk init" first.');
  process.exit(1);
}

// 3. Execute your script using the local runtime
try {
  const scriptPath = path.join(__dirname, 'my_script.py');
  
  // Example: Run script and inherit stdio
  execSync(`"${pythonPath}" "${scriptPath}"`, { stdio: 'inherit' });
  
} catch (error) {
  console.error('Script execution failed:', error.message);
}
```

### Path Resolution

- **Windows:** `.gemini/runtime/venv/Scripts/python.exe` OR `.gemini/runtime/python/python.exe`
- **macOS/Linux:** `.gemini/runtime/venv/bin/python`

The `python_path` in `settings.json` is always an absolute path to the correct executable, handled automatically by `gk init`.

## 3. Managing Dependencies

To add new Python libraries for your skill:

1.  Add the library to `.gemini/requirements.txt` in the framework source.
2.  When users run `gk init` (or `gk update` in the future), the framework will automatically install/update packages in their local runtime.

## 4. Troubleshooting

- **"Python not found":** Ensure `gk init` completed successfully. Check `.gemini/settings.json` for the `python_path` entry.
- **Library missing:** Run the pip install command manually using the local python:
    ```bash
    # Windows
    .gemini\runtime\venv\Scripts\python.exe -m pip install -r .gemini\requirements.txt
    
    # macOS/Linux
    .gemini/runtime/venv/bin/python -m pip install -r .gemini/requirements.txt
    ```
