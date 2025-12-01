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

To use this progress tracking system in your own coding agent project:

1. Initialize the progress tracking file:
   ```bash
   cap-manager init "Initial project setup" "Set up the project structure and initial files."
   ```

2. Add new requirements:
   ```bash
   cap-manager add "Implement feature X" "Add the implementation for feature X."
   ```

3. Update requirement status:
   ```bash
   cap-manager update 1 "In Progress" "Started working on feature X."
   ```

4. List all requirements:
   ```bash
   cap-manager list
   ```

5. View detailed requirement info:
   ```bash
   cap-manager show 1
   ```

### Available Commands

- `cap-manager init <title> <description>` - Initialize progress.json with first requirement
- `cap-manager add <title> <description>` - Add a new requirement
- `cap-manager update <id> <status> [notes]` - Update requirement status and notes
- `cap-manager list` - List all requirements
- `cap-manager show <id>` - Show detailed information for a requirement
- `cap-manager complete <id> [notes]` - Mark a requirement as completed
- `cap-manager block <id> <reason>` - Mark a requirement as blocked
- `cap-manager delete <id>` - Delete a requirement (with confirmation)
- `cap-manager prompt` - Output the agent prompt instructions

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
