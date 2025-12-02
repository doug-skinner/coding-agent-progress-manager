# Coding Agent Progress Manager

This repository was started based on inspiration from Anthropic's [Effective harnesses for long-running agents](https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents) blog post. The goal was to create a simple implementation of being able to track lightweight requirements across runs of a coding agent, while also being able to track progress towards those requirements. This is done through the use of a simple JSON file that is updated during and after each run of the coding agent, combined with a recommended prompt to instruct the agent on how to understand and work with the progress tracking file. I felt like this was a simpler approach than tying into a full-fledged project management tool, while still being effective for tracking progress.

## Installation

Install globally via NPM:

```bash
npm install -g @dougskinner/coding-agent-progress-manager
```

Or use with npx without installation:

```bash
npx @dougskinner/coding-agent-progress-manager <command>
```

After global installation, the CLI is available as `cap-manager`:

```bash
cap-manager --help
```

## Dog Fooding

This repository is currently being dog fooded by myself as I work on various coding projects. The progress tracking file for this repo is located at `progress.json`, and it is updated as I work on different tasks. The prompt used to instruct the coding agent is located at `agent_prompt.txt`. Feel free to take a look at both files to see how they are structured and how they can be used to track progress.

## Usage

### Quick Start

To use this progress tracking system in your own coding agent project:

1. **Initialize the progress tracking file:**
   ```bash
   cap-manager init "Initial project setup" "Set up the project structure and initial files."
   ```

2. **Add new requirements:**
   ```bash
   cap-manager add "Implement feature X" "Add the implementation for feature X."
   ```

3. **Update requirement status:**
   ```bash
   cap-manager update 1 "In Progress" "Started working on feature X."
   ```

4. **List all requirements:**
   ```bash
   cap-manager list
   ```

5. **View detailed requirement info:**
   ```bash
   cap-manager show 1
   ```

### Complete Command Reference

#### `init` - Initialize Progress Tracking

Create a new progress.json file with the first requirement:

```bash
cap-manager init <title> <description>
```

**Example:**

```bash
cap-manager init "Set up TypeScript configuration" "Initialize TypeScript in the project with tsconfig.json, install necessary dependencies, and configure for Node.js CLI development"
```

**What it does:**

- Creates progress.json if it doesn't exist
- Adds the first requirement with ID 1
- Sets status to "Not Started"
- Records creation and update timestamps

#### `add` - Add New Requirement

Add a new requirement to the existing progress.json:

```bash
cap-manager add <title> <description>
```

**Examples:**

```bash
# Add a feature requirement
cap-manager add "Implement user authentication" "Add JWT-based authentication with login and logout endpoints"

# Add a bug fix requirement
cap-manager add "Fix memory leak in data processing" "Investigate and resolve memory leak occurring during large file processing operations"

# Add a documentation requirement
cap-manager add "Update API documentation" "Document all REST endpoints with request/response examples and error codes"
```

**What it does:**

- Reads existing progress.json
- Assigns next sequential ID
- Creates requirement with "Not Started" status
- Saves with current timestamps

#### `update` - Update Requirement Status

Update a requirement's status and optionally add notes:

```bash
cap-manager update <id> <status> [notes]
```

**Valid status values:** `"Not Started"`, `"In Progress"`, `"Completed"`, `"Blocked"`

**Examples:**

```bash
# Start working on a requirement
cap-manager update 5 "In Progress" "Beginning implementation of file I/O utilities"

# Mark as completed with summary
cap-manager update 5 "Completed" "Implemented readFile and writeFile utilities with comprehensive error handling"

# Update progress mid-work
cap-manager update 8 "In Progress" "Completed database schema design, now working on migration scripts"

# Update status without notes
cap-manager update 3 "In Progress"
```

**What it does:**

- Validates the status value
- Updates the requirement's status field
- Updates notes if provided
- Sets new updated timestamp

#### `complete` - Mark as Completed (Shorthand)

Convenient shorthand for marking a requirement as completed:

```bash
cap-manager complete <id> [notes]
```

**Examples:**

```bash
# Complete with summary
cap-manager complete 12 "All endpoints implemented and tested with Postman collection"

# Complete without notes
cap-manager complete 7
```

**What it does:**

- Shorthand for `update <id> "Completed" [notes]`
- Sets status to "Completed"
- Optionally adds completion notes
- Updates timestamp

#### `block` - Mark as Blocked (Shorthand)

Mark a requirement as blocked with a required reason:

```bash
cap-manager block <id> <reason>
```

**Examples:**

```bash
# Block due to missing information
cap-manager block 15 "Waiting for API credentials from DevOps team"

# Block due to dependency
cap-manager block 8 "Blocked until requirement #3 (database setup) is completed"

# Block due to external issue
cap-manager block 22 "Cannot proceed - third-party library has critical bug in v2.1.0, waiting for patch release"
```

**What it does:**

- Shorthand for `update <id> "Blocked" <reason>`
- Sets status to "Blocked"
- Stores reason in notes field (required)
- Updates timestamp

#### `list` - List All Requirements

Display all requirements with their current status:

```bash
cap-manager list
```

**Example output:**

```text
================================================================================
Requirements List
================================================================================

ID: 1
Title: Set up TypeScript configuration
Status: Completed
Updated: Dec 1, 2025
Notes: Completed implementation: Installed TypeScript and @types/node as dev dependencies...
--------------------------------------------------------------------------------
ID: 2
Title: Implement user authentication
Status: In Progress
Updated: Dec 2, 2025
Notes: Completed login endpoint, working on logout functionality...
--------------------------------------------------------------------------------
ID: 3
Title: Add unit tests
Status: Not Started
Updated: Dec 1, 2025
--------------------------------------------------------------------------------

Summary:
Total: 3 requirements
Not Started: 1
In Progress: 1
Completed: 1
```

**What it displays:**

- ID, title, status (color-coded), updated date
- Truncated notes preview
- Summary with counts by status

#### `show` - Show Requirement Details

Display detailed information for a single requirement:

```bash
cap-manager show <id>
```

**Examples:**
```bash
# View requirement details
cap-manager show 5

# View a blocked requirement to see blocker reason
cap-manager show 15
```

**Example output:**
```
================================================================================
Requirement #5
================================================================================

Title: Implement file I/O utilities for progress.json
Status: Completed

Created: Dec 1, 2025 at 19:45:29
Updated: Dec 1, 2025 at 21:04:00

Description:
Create utility functions to read and write the progress.json file safely,
including error handling for missing files, parsing errors, and write failures.
Handle JSON serialization with proper formatting

Notes:
Completed implementation: Created src/fileUtils.ts with readProgress(),
writeProgress(), and progressFileExists() functions. Includes comprehensive
error handling for missing files (ENOENT), JSON parsing errors, and write
failures. JSON serialization uses proper formatting (2-space indent, trailing
newline).
```

**What it displays:**
- Full requirement details
- All fields including complete description and notes
- Formatted timestamps with date and time
- External link if present

#### `delete` - Delete Requirement

Delete a requirement by ID:

```bash
cap-manager delete <id>
cap-manager delete <id> --force
cap-manager delete <id> -f
```

**Examples:**
```bash
# Delete with confirmation prompt
cap-manager delete 10

# Delete without confirmation (use with caution)
cap-manager delete 10 --force
cap-manager delete 10 -f
```

**Example interactive prompt:**
```
You are about to delete requirement #10:

Title: Add logging functionality
Status: Not Started

Are you sure you want to delete this requirement? (y/N): y

Requirement #10 deleted successfully
```

**What it does:**
- Shows requirement details
- Prompts for confirmation (unless --force flag used)
- Removes requirement from progress.json
- Note: Does not renumber remaining IDs

#### `prompt` - Output Agent Instructions

Output the complete contents of agent_prompt.txt:

```bash
cap-manager prompt
```

**Example usage:**
```bash
# View the prompt instructions
cap-manager prompt

# Copy to clipboard (macOS)
cap-manager prompt | pbcopy

# Copy to clipboard (Linux with xclip)
cap-manager prompt | xclip -selection clipboard

# Save to a file
cap-manager prompt > my_agent_instructions.txt
```

**What it does:**
- Outputs the full agent_prompt.txt file contents
- Useful for piping to other tools or copying instructions
- No additional formatting or modifications

### Realistic Workflow Examples

#### Example 1: Starting a New Project

```bash
# Initialize with first requirement
cap-manager init "Set up project structure" "Create directory structure, initialize npm, and set up basic configuration files"

# Add several requirements
cap-manager add "Configure TypeScript" "Install TypeScript, create tsconfig.json with appropriate settings for Node.js development"
cap-manager add "Set up testing framework" "Install Jest and configure for TypeScript, create sample test"
cap-manager add "Implement core functionality" "Build the main application logic with proper error handling"

# View all requirements
cap-manager list
```

#### Example 2: Working Through Requirements

```bash
# Start working on first requirement
cap-manager update 1 "In Progress" "Creating directory structure"

# Complete it
cap-manager complete 1 "Created src/, dist/, and tests/ directories. Initialized npm with package.json"

# Move to next requirement
cap-manager update 2 "In Progress" "Installing TypeScript dependencies"

# Add progress notes during work
cap-manager update 2 "In Progress" "TypeScript installed, now configuring tsconfig.json"

# Complete it
cap-manager complete 2 "TypeScript configured with ES2020 target, strict mode enabled"
```

#### Example 3: Handling Blockers

```bash
# Start working on requirement
cap-manager update 5 "In Progress" "Beginning API integration"

# Discover you're blocked
cap-manager block 5 "Need API credentials and endpoint documentation from backend team"

# Later, when unblocked, resume work
cap-manager update 5 "In Progress" "Received credentials, resuming API integration work"

# Complete it
cap-manager complete 5 "API integration complete with error handling and retry logic"
```

#### Example 4: Reviewing Progress

```bash
# See high-level overview
cap-manager list

# Check specific requirement details
cap-manager show 8

# Get detailed info on a blocked requirement
cap-manager show 5
```

#### Example 5: Cleaning Up

```bash
# Made a mistake? Delete a requirement
cap-manager delete 10

# Or force delete without confirmation
cap-manager delete 10 --force
```

### For Development or Local Usage

If you're contributing to this project or want to use it locally without global install:

```bash
npm install
npm run progress -- <command>
```

## Progress File Format

The `progress.json` file contains an array of requirement objects, each with the following structure:

```json
{
  "id": 1,
  "title": "Requirement title",
  "description": "Detailed description of the requirement",
  "status": "Not Started",
  "notes": "Any additional notes or updates",
  "created": "2024-01-01T00:00:00.000Z",
  "updated": "2024-01-01T00:00:00.000Z"
}
```

The `status` field can be one of: "Not Started", "In Progress", "Completed", or "Blocked".

## Development

### Local Development Setup

1. Clone the repository:

   ```bash
   git clone https://github.com/doug-skinner/coding-agent-progress-manager.git
   cd coding-agent-progress-manager
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Build the project:

   ```bash
   npm run build
   ```

4. Run locally (without global install):

   ```bash
   npm run progress -- <command>
   ```

### Building and Testing

- **Build**: `npm run build` - Compiles TypeScript to dist/
- **Watch mode**: `npm run build:watch` - Rebuilds on file changes
- **Clean**: `npm run clean` - Removes dist/ directory
- **Lint**: `npm run lint` - Runs Biome linter
- **Format**: `npm run format` - Auto-formats code with Biome
- **Check**: `npm run check` - Runs linter and formatter together

## Releasing and Versioning

This project uses semantic versioning and automated NPM publishing via GitHub Actions.

### Creating a New Release

1. **Update version in package.json**:

   ```bash
   # For patch version (bug fixes)
   npm version patch

   # For minor version (new features, backward compatible)
   npm version minor

   # For major version (breaking changes)
   npm version major
   ```

2. **Push the version commit and tag**:

   ```bash
   git push origin main --follow-tags
   ```

3. **GitHub Actions automatically publishes to NPM**:
   - The workflow triggers on tag push (e.g., `v1.0.0`)
   - Builds the project
   - Runs linter
   - Publishes to NPM registry

### Version History

Releases are managed via Git tags. View releases at:
https://github.com/doug-skinner/coding-agent-progress-manager/releases

### Prerequisites for Publishing

- NPM account with access to `@dougskinner` scope
- `NPM_TOKEN` secret configured in GitHub repository
- All CLI commands implemented and tested
- No failing linter checks
