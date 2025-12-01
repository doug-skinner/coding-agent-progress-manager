# NPM Publishing Guide

This document provides comprehensive instructions for publishing the `@dougskinner/coding-agent-progress-manager` package to NPM via GitHub Actions.

## Table of Contents

- [Overview](#overview)
- [Package Configuration](#package-configuration)
- [GitHub Actions Workflow](#github-actions-workflow)
- [NPM Token Setup](#npm-token-setup)
- [Release Process](#release-process)
- [Testing Before Publishing](#testing-before-publishing)
- [Troubleshooting](#troubleshooting)
- [Rollback Procedures](#rollback-procedures)
- [Version Management](#version-management)

## Overview

This project uses automated NPM publishing through GitHub Actions. When you push a Git tag (e.g., `v1.0.0`), the workflow automatically:

1. Checks out the tagged code
2. Installs dependencies
3. Runs linter
4. Builds the TypeScript project
5. Verifies build artifacts
6. Publishes to NPM registry

### Key Details

- **Package Name**: `@dougskinner/coding-agent-progress-manager`
- **CLI Command**: `cap-manager`
- **Publishing Trigger**: Git tags matching `v*` pattern
- **Node Version**: 20 LTS (in CI)
- **Minimum Node**: >=18.0.0 (for users)

## Package Configuration

### package.json Key Fields

```json
{
  "name": "@dougskinner/coding-agent-progress-manager",
  "version": "1.0.0",
  "description": "CLI tool for tracking lightweight requirements and progress across coding agent runs",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "bin": {
    "cap-manager": "./dist/cli.js"
  },
  "files": [
    "dist/**/*",
    "README.md",
    "LICENSE",
    "agent_prompt.txt"
  ],
  "engines": {
    "node": ">=18.0.0"
  }
}
```

### Field Explanations

- **name**: Scoped package name. Requires ownership of `@dougskinner` scope on NPM
- **main**: Entry point for require() statements
- **types**: TypeScript declaration files for IDE support
- **bin**: Maps `cap-manager` command to the compiled CLI entry point
- **files**: Whitelist of files to include in published package (excludes src/, tests/, etc.)
- **engines**: Specifies minimum Node.js version for users

### CLI Entry Point (src/cli.ts)

The bin field points to `dist/cli.js`, which is compiled from `src/cli.ts`:

```typescript
#!/usr/bin/env node

/**
 * CLI entry point for cap-manager command
 * This file is executed when users run the cap-manager command after global install
 */

import './index.js';
```

The shebang (`#!/usr/bin/env node`) is preserved by TypeScript during compilation, allowing NPM to make the file executable.

## GitHub Actions Workflow

### Workflow File Location

`.github/workflows/publish.yml`

### Workflow Configuration

```yaml
name: Publish to NPM

on:
  push:
    tags:
      - 'v*'

jobs:
  publish:
    runs-on: ubuntu-latest

    permissions:
      contents: read
      id-token: write

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          registry-url: 'https://registry.npmjs.org'

      - name: Install dependencies
        run: npm ci

      - name: Run linter
        run: npm run lint

      - name: Build project
        run: npm run build

      - name: Verify build output
        run: |
          test -f dist/cli.js || (echo "Error: dist/cli.js not found" && exit 1)
          test -f dist/index.js || (echo "Error: dist/index.js not found" && exit 1)
          echo "Build verification passed"

      - name: Publish to NPM
        run: npm publish --access public
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

### Workflow Steps Explained

1. **Checkout**: Gets the tagged version of the code
2. **Setup Node**: Installs Node 20 and configures NPM registry
3. **Install**: Uses `npm ci` for reproducible, clean installs
4. **Lint**: Runs Biome linter to catch issues before publishing
5. **Build**: Compiles TypeScript to JavaScript in dist/
6. **Verify**: Checks that required build artifacts exist
7. **Publish**: Uploads to NPM with public access (required for scoped packages)

### Why `--access public`?

Scoped packages (`@username/package`) are private by default. The `--access public` flag makes the package publicly accessible.

## NPM Token Setup

### Creating an NPM Access Token

1. **Log in to NPM**:
   - Go to https://www.npmjs.com
   - Log in with your credentials

2. **Navigate to Access Tokens**:
   - Click your profile picture (top-right)
   - Select "Access Tokens" from dropdown
   - Or go to: https://www.npmjs.com/settings/[YOUR_USERNAME]/tokens

3. **Generate New Token**:
   - Click "Generate New Token" button
   - Choose "Automation" token type (recommended for CI/CD)
   - Give it a descriptive name: "GitHub Actions - coding-agent-progress-manager"
   - Click "Generate Token"

4. **Copy Token**:
   - **IMPORTANT**: Copy the token immediately (it won't be shown again)
   - Save it temporarily in a secure location

### Adding Token to GitHub

1. Go to your repository: https://github.com/doug-skinner/coding-agent-progress-manager

2. Click "Settings" tab (requires admin access)

3. In left sidebar: "Secrets and variables" > "Actions"

4. Click "New repository secret"

5. Configure the secret:
   - Name: `NPM_TOKEN` (exactly as shown, case-sensitive)
   - Value: Paste the NPM token
   - Click "Add secret"

6. Verify:
   - The secret should now appear in the list (value hidden)
   - GitHub Actions can now use `${{ secrets.NPM_TOKEN }}`

### Token Security Best Practices

- Never commit the token to the repository
- Never share the token publicly
- Use "Automation" token type (not your password or 2FA-protected tokens)
- Rotate the token if compromised
- Delete the token from your clipboard/notes after adding to GitHub
- Consider setting an expiration date on the token

### Scope Ownership

Ensure your NPM account has permission to publish to `@dougskinner` scope:

1. Go to https://www.npmjs.com/settings/[YOUR_USERNAME]/packages
2. Verify you own or have access to the `@dougskinner` scope
3. If not, either:
   - Request access from the scope owner
   - Use an unscoped name (e.g., `coding-agent-progress-manager`)
   - Use a different scope you own

## Release Process

### Prerequisites

Before releasing, ensure:

- All CLI commands are implemented (requirements 6-11, 14-20, 31-32)
- Build succeeds: `npm run build`
- Linter passes: `npm run lint`
- Local testing confirms functionality
- All changes are committed to main branch

### Creating a Release

#### Method 1: Using npm version (Recommended)

The `npm version` command automatically:
- Updates version in package.json
- Creates a Git commit
- Creates a Git tag

```bash
# For patch version (bug fixes: 1.0.0 -> 1.0.1)
npm version patch

# For minor version (new features, backward compatible: 1.0.0 -> 1.1.0)
npm version minor

# For major version (breaking changes: 1.0.0 -> 2.0.0)
npm version major
```

Then push:

```bash
git push origin main --follow-tags
```

#### Method 2: Manual Tagging

1. Update version in package.json manually:

   ```json
   {
     "version": "1.0.1"
   }
   ```

2. Commit the change:

   ```bash
   git add package.json
   git commit -m "Bump version to 1.0.1"
   ```

3. Create and push tag:

   ```bash
   git tag v1.0.1
   git push origin main --follow-tags
   ```

### Monitoring the Release

1. Go to GitHub Actions: https://github.com/doug-skinner/coding-agent-progress-manager/actions

2. Watch the "Publish to NPM" workflow run

3. Check for errors in the logs

4. If successful, verify on NPM:
   - Package page: https://www.npmjs.com/package/@dougskinner/coding-agent-progress-manager
   - It may take a few minutes for the package to appear

5. Test installation:

   ```bash
   npm install -g @dougskinner/coding-agent-progress-manager
   cap-manager --help
   ```

## Testing Before Publishing

### Local Build Testing

```bash
# Clean and build
npm run clean
npm run build

# Verify build artifacts
ls -la dist/
# Should see: cli.js, index.js, and declaration files
```

### Package Content Testing

Use `npm pack` to create a tarball without publishing:

```bash
npm pack
```

This creates a `.tgz` file (e.g., `dougskinner-coding-agent-progress-manager-1.0.0.tgz`).

Inspect contents:

```bash
tar -tzf dougskinner-coding-agent-progress-manager-1.0.0.tgz
```

Verify it includes:
- dist/ directory with compiled files
- README.md
- LICENSE
- agent_prompt.txt
- package.json

### Local Installation Testing

Install the package globally from the tarball:

```bash
npm install -g ./dougskinner-coding-agent-progress-manager-1.0.0.tgz
```

Test the CLI:

```bash
cap-manager --help
cap-manager list
# Test other commands
```

Uninstall when done:

```bash
npm uninstall -g @dougskinner/coding-agent-progress-manager
```

### Dry Run Publishing

Test the publishing process without actually publishing:

```bash
npm publish --dry-run
```

This shows what would be published without uploading to NPM.

## Troubleshooting

### Issue: 401 Unauthorized

**Symptom**: GitHub Actions fails with "401 Unauthorized" error during publish step

**Causes**:
- NPM_TOKEN secret is missing
- NPM_TOKEN is invalid or expired
- Token doesn't have publish permissions

**Solution**:
1. Verify secret exists in GitHub repository settings
2. Regenerate token from npmjs.com
3. Update GitHub secret with new token
4. Ensure token has "Automation" or "Publish" permissions

### Issue: Scope @dougskinner not found

**Symptom**: Publishing fails with "scope not found" error

**Causes**:
- NPM account doesn't own the `@dougskinner` scope
- Scope name is misspelled

**Solution**:
1. Verify scope ownership at npmjs.com
2. If you don't own it, either:
   - Create the scope (if available)
   - Change to unscoped name: `coding-agent-progress-manager`
   - Use a different scope you own
3. Update package.json name field
4. Commit and re-tag

### Issue: Package already exists

**Symptom**: "Cannot publish over existing version"

**Causes**:
- Version number in package.json already published

**Solution**:
1. Bump version:
   ```bash
   npm version patch
   ```
2. Push the new tag:
   ```bash
   git push origin main --follow-tags
   ```

Note: NPM doesn't allow re-publishing the same version. Always increment for any changes.

### Issue: Build fails in GitHub Actions

**Symptom**: "Build project" step fails in workflow

**Causes**:
- TypeScript compilation errors
- Missing dependencies

**Solution**:
1. Test build locally:
   ```bash
   npm run build
   ```
2. Fix any TypeScript errors
3. Ensure all dependencies are in package.json
4. Commit fixes and re-tag

### Issue: cap-manager command not found

**Symptom**: After installing, `cap-manager` command doesn't work

**Causes**:
- bin field in package.json is incorrect
- dist/cli.js doesn't exist or missing shebang
- PATH issues

**Solution**:
1. Verify bin field points to `./dist/cli.js`
2. Check dist/cli.js exists after build
3. Verify shebang is present in dist/cli.js first line
4. Reinstall:
   ```bash
   npm uninstall -g @dougskinner/coding-agent-progress-manager
   npm install -g @dougskinner/coding-agent-progress-manager
   ```

### Issue: Linter fails in CI

**Symptom**: "Run linter" step fails in GitHub Actions

**Causes**:
- Code doesn't pass Biome linter checks

**Solution**:
1. Run linter locally:
   ```bash
   npm run lint
   ```
2. Fix issues or run:
   ```bash
   npm run check
   ```
3. Commit fixes and re-tag

## Rollback Procedures

### Unpublishing a Version (Within 72 Hours)

If you need to remove a published version within 72 hours:

```bash
npm unpublish @dougskinner/coding-agent-progress-manager@1.0.0
```

**Warning**: This completely removes the version from NPM. Use with caution.

### Deprecating a Version (After 72 Hours)

After 72 hours, you can only deprecate (not unpublish):

```bash
npm deprecate @dougskinner/coding-agent-progress-manager@1.0.0 "This version has critical bugs. Please upgrade to 1.0.1"
```

This warns users but doesn't remove the package.

### Publishing a Fixed Version

1. Fix the issue in code
2. Bump version:
   ```bash
   npm version patch  # Creates 1.0.1
   ```
3. Push:
   ```bash
   git push origin main --follow-tags
   ```

**Remember**: You cannot re-publish the same version. Always increment.

## Version Management

### Semantic Versioning

This project follows [Semantic Versioning](https://semver.org/) (SemVer):

- **MAJOR** version (X.0.0): Incompatible API changes
- **MINOR** version (0.X.0): Add functionality (backward compatible)
- **PATCH** version (0.0.X): Bug fixes (backward compatible)

### When to Bump Each Version

**Patch (1.0.0 → 1.0.1)**:
- Bug fixes
- Documentation updates
- Performance improvements (no API changes)

**Minor (1.0.0 → 1.1.0)**:
- New features
- New CLI commands
- New optional parameters
- Deprecating functionality (still works)

**Major (1.0.0 → 2.0.0)**:
- Breaking API changes
- Removing commands
- Changing command syntax
- Removing or changing parameters

### Version History

Releases are tracked via Git tags. View all releases:

- GitHub: https://github.com/doug-skinner/coding-agent-progress-manager/releases
- NPM: https://www.npmjs.com/package/@dougskinner/coding-agent-progress-manager?activeTab=versions

### Pre-release Versions

For beta/alpha releases:

```bash
npm version prerelease --preid=beta
# Creates: 1.0.1-beta.0

npm version prerelease --preid=alpha
# Creates: 1.0.1-alpha.0
```

Users can install pre-releases:

```bash
npm install -g @dougskinner/coding-agent-progress-manager@beta
```

## Additional Resources

- [NPM Documentation](https://docs.npmjs.com/)
- [Semantic Versioning](https://semver.org/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

## Support

For issues or questions:

- GitHub Issues: https://github.com/doug-skinner/coding-agent-progress-manager/issues
- NPM Package: https://www.npmjs.com/package/@dougskinner/coding-agent-progress-manager
