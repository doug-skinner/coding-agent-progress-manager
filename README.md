# Coding Agent Progress

This repository was started based on inspiration from Anthropic's [Effective harnesses for long-running agents](https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents) blog post. The goal was to create a simple implementation of being able to track lightweight requirements across runs of a coding agent, while also being able to track progress towards those requirements. This is done through the use of a simple JSON file that is updated during and after each run of the coding agent, combined with a recommended prompt to instruct the agent on how to understand and work with the progress tracking file. I felt like this was a simpler approach than tying into a full-fledged project management tool, while still being effective for tracking progress.

## Dog Fooding

This repository is currently being dog fooded by myself as I work on various coding projects. The progress tracking file for this repo is located at `progress.json`, and it is updated as I work on different tasks. The prompt used to instruct the coding agent is located at `agent_prompt.txt`. Feel free to take a look at both files to see how they are structured and how they can be used to track progress.

## Usage

To use this progress tracking system in your own coding agent, simply copy the `progress.json` and `agent_prompt.txt` files into your project. Please modify the prompt as needed to fit your specific use case. As your coding agent runs, it can read from and update the `progress.json` file to reflect the current state of your project.

To populate the initial `progress.json` file, and to make further updates, this repository also contains a simple node cli exposed as an npm script. You can run the following commands:

```bashnpm install
npm run progress -- init "Initial project setup" "Set up the project structure and initial files."
npm run progress -- add "Implement feature X" "Add the implementation for feature X."
npm run progress -- update 1 "In Progress" "Started working on feature X."
npm run progress -- list
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


