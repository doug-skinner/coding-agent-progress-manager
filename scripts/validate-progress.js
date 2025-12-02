#!/usr/bin/env node

/**
 * Validate progress.json before allowing commits
 * This script is run as a pre-commit hook
 */

const fs = require('node:fs');
const path = require('node:path');

const VALID_STATUSES = ['Not Started', 'In Progress', 'Completed', 'Blocked'];
const REQUIRED_FIELDS = ['id', 'title', 'description', 'status', 'notes', 'created', 'updated'];

function validateProgress() {
  const progressPath = path.join(process.cwd(), 'progress.json');

  // Check if file exists
  if (!fs.existsSync(progressPath)) {
    console.log('ℹ️  No progress.json file found - skipping validation');
    return true;
  }

  let requirements;

  // Parse JSON
  try {
    const content = fs.readFileSync(progressPath, 'utf-8');
    requirements = JSON.parse(content);
  } catch (error) {
    console.error('❌ progress.json validation failed: Invalid JSON');
    console.error(error.message);
    return false;
  }

  // Check if it's an array
  if (!Array.isArray(requirements)) {
    console.error('❌ progress.json validation failed: Must contain an array of requirements');
    return false;
  }

  // Validate each requirement
  for (const req of requirements) {
    // Check required fields
    for (const field of REQUIRED_FIELDS) {
      if (!(field in req)) {
        console.error(
          `❌ progress.json validation failed: Requirement #${req.id || '?'} missing required field: ${field}`
        );
        return false;
      }
    }

    // Validate status
    if (!VALID_STATUSES.includes(req.status)) {
      console.error(
        `❌ progress.json validation failed: Requirement #${req.id} has invalid status: "${req.status}"`
      );
      console.error(`   Valid statuses: ${VALID_STATUSES.join(', ')}`);
      return false;
    }

    // Validate field types
    if (typeof req.id !== 'number') {
      console.error(`❌ progress.json validation failed: Requirement #${req.id} id must be a number`);
      return false;
    }

    if (typeof req.title !== 'string') {
      console.error(
        `❌ progress.json validation failed: Requirement #${req.id} title must be a string`
      );
      return false;
    }

    if (typeof req.description !== 'string') {
      console.error(
        `❌ progress.json validation failed: Requirement #${req.id} description must be a string`
      );
      return false;
    }

    if (typeof req.notes !== 'string') {
      console.error(
        `❌ progress.json validation failed: Requirement #${req.id} notes must be a string`
      );
      return false;
    }

    // Validate timestamps
    if (!isValidISODate(req.created)) {
      console.error(
        `❌ progress.json validation failed: Requirement #${req.id} created must be a valid ISO 8601 timestamp`
      );
      return false;
    }

    if (!isValidISODate(req.updated)) {
      console.error(
        `❌ progress.json validation failed: Requirement #${req.id} updated must be a valid ISO 8601 timestamp`
      );
      return false;
    }

    // Validate external link if present
    if (req.externalLink !== undefined) {
      if (typeof req.externalLink !== 'string') {
        console.error(
          `❌ progress.json validation failed: Requirement #${req.id} externalLink must be a string`
        );
        return false;
      }
      if (!isValidUrl(req.externalLink)) {
        console.error(
          `❌ progress.json validation failed: Requirement #${req.id} externalLink must be a valid HTTP/HTTPS URL`
        );
        return false;
      }
    }
  }

  console.log('✅ progress.json validation passed');
  return true;
}

function isValidISODate(dateString) {
  if (typeof dateString !== 'string') return false;
  const date = new Date(dateString);
  return date.toISOString() === dateString;
}

function isValidUrl(urlString) {
  try {
    const url = new URL(urlString);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

// Run validation
const isValid = validateProgress();
process.exit(isValid ? 0 : 1);
