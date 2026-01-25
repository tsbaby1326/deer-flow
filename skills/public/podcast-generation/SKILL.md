---
name: podcast-generation
description: Use this skill when the user requests to generate, create, or produce podcasts from text content. Converts written content into a two-host conversational podcast audio format with natural dialogue.
---

# Podcast Generation Skill

## Overview

This skill generates high-quality podcast audio from text content using a multi-stage pipeline. The workflow includes script generation (converting input to conversational dialogue), text-to-speech synthesis, and audio mixing to produce the final podcast.

## Core Capabilities

- Convert any text content (articles, reports, documentation) into podcast scripts
- Generate natural two-host conversational dialogue (male and female hosts)
- Synthesize speech audio using text-to-speech
- Mix audio chunks into a final podcast MP3 file
- Support both English and Chinese content

## Workflow

### Step 1: Understand Requirements

When a user requests podcast generation, identify:

- Source content: The text/article/report to convert into a podcast
- Language: English or Chinese (auto-detected from content)
- Output location: Where to save the generated podcast
- You don't need to check the folder under `/mnt/user-data`

### Step 2: Prepare Input Content

The input content should be plain text or markdown. Save it to a text file in `/mnt/user-data/workspace/` with naming pattern: `{descriptive-name}-content.md`

### Step 3: Execute Generation

Call the Python script directly without any concerns about timeout or the need for pre-testing:

```bash
python /mnt/skills/public/podcast-generation/scripts/generate.py \
  --input-file /mnt/user-data/workspace/content-file.md \
  --output-file /mnt/user-data/outputs/generated-podcast.mp3 \
  --locale en
```

Parameters:

- `--input-file`: Absolute path to input text/markdown file (required)
- `--output-file`: Absolute path to output MP3 file (required)
- `--locale`: Language locale - "en" for English or "zh" for Chinese (optional, auto-detected if not specified)

> [!IMPORTANT]
> - Execute the script in one complete call. Do NOT split the workflow into separate steps (e.g., testing script generation first, then TTS).
> - The script handles all external API calls and audio generation internally with proper timeout management.
> - Do NOT read the Python file, just call it with the parameters.

## Podcast Generation Example

User request: "Generate a podcast about the history of artificial intelligence"

Step 1: Create content file `/mnt/user-data/workspace/ai-history-content.md` with the source text:
```markdown
# The History of Artificial Intelligence

Artificial intelligence has a rich history spanning over seven decades...

## Early Beginnings (1950s)
The term "artificial intelligence" was coined by John McCarthy in 1956...

## The First AI Winter (1970s)
After initial enthusiasm, AI research faced significant setbacks...

## Modern Era (2010s-Present)
Deep learning revolutionized the field with breakthrough results...
```

Step 2: Execute generation:
```bash
python /mnt/skills/public/podcast-generation/scripts/generate.py \
  --input-file /mnt/user-data/workspace/ai-history-content.md \
  --output-file /mnt/user-data/outputs/ai-history-podcast.mp3 \
  --locale en
```

## Specific Templates

Read the following template file only when matching the user request.

- [Tech Explainer](templates/tech-explainer.md) - For converting technical documentation and tutorials

## Output Format

The generated podcast follows the "Hello Deer" format:
- Two hosts: one male, one female
- Natural conversational dialogue
- Starts with "Hello Deer" greeting
- Target duration: approximately 10 minutes
- Alternating speakers for engaging flow

## Output Handling

After generation:

- Podcasts are saved in `/mnt/user-data/outputs/`
- Share generated podcast with user using `present_files` tool
- Provide brief description of the generation result (topic, duration, hosts)
- Offer to regenerate if adjustments needed

## Requirements

The following environment variables must be set:
- `OPENAI_API_KEY` or equivalent LLM API key for script generation
- `VOLCENGINE_TTS_APPID`: Volcengine TTS application ID
- `VOLCENGINE_TTS_ACCESS_TOKEN`: Volcengine TTS access token
- `VOLCENGINE_TTS_CLUSTER`: Volcengine TTS cluster (optional, defaults to "volcano_tts")

## Notes

- **Always execute the full pipeline in one call** - no need to test individual steps or worry about timeouts
- Input content language is auto-detected and matched in output
- The script generation uses LLM to create natural conversational dialogue
- Technical content is automatically simplified for audio accessibility
- Complex notations (formulas, code) are translated to plain language
- Long content may result in longer podcasts
