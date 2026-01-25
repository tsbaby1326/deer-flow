import argparse
import base64
import json
import logging
import os
import re
import uuid
from typing import Literal, Optional

import requests

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


# Types
class ScriptLine:
    def __init__(self, speaker: Literal["male", "female"] = "male", paragraph: str = ""):
        self.speaker = speaker
        self.paragraph = paragraph


class Script:
    def __init__(self, locale: Literal["en", "zh"] = "en", lines: list[ScriptLine] = None):
        self.locale = locale
        self.lines = lines or []

    @classmethod
    def from_dict(cls, data: dict) -> "Script":
        script = cls(locale=data.get("locale", "en"))
        for line in data.get("lines", []):
            script.lines.append(
                ScriptLine(
                    speaker=line.get("speaker", "male"),
                    paragraph=line.get("paragraph", ""),
                )
            )
        return script


# Prompt template for script generation
SCRIPT_WRITER_PROMPT = """You are a skilled podcast script writer for "Hello Deer", a conversational podcast show with two hosts.

Transform the provided content into an engaging podcast script following these guidelines:

## Format Requirements
- Output as JSON with this structure: {{"locale": "en" or "zh", "lines": [{{"speaker": "male" or "female", "paragraph": "dialogue text"}}]}}
- Only two hosts: male and female, alternating naturally
- Target runtime: approximately 10 minutes of dialogue
- Start with the male host saying a greeting that includes "Hello Deer"

## Tone & Style
- Natural, conversational dialogue - like two friends chatting
- Use casual expressions and conversational transitions
- Avoid overly formal language or academic tone
- Include reactions, follow-up questions, and natural interjections

## Content Guidelines
- Frequent back-and-forth between hosts
- Keep sentences short and easy to follow when spoken
- Plain text only - no markdown formatting in the output
- Translate technical concepts into accessible language
- No mathematical formulas, code, or complex notation
- Make content engaging and accessible for audio-only listeners
- Exclude meta information like dates, author names, or document structure

## Language
- Match the locale of the input content
- Use "{locale}" for the output locale

Now transform this content into a podcast script:

{content}
"""


def extract_json_from_text(text: str) -> dict:
    """Extract JSON from text that might contain markdown code blocks or extra content."""
    # Try to find JSON in markdown code blocks first
    json_block_pattern = r"```(?:json)?\s*(\{[\s\S]*?\})\s*```"
    match = re.search(json_block_pattern, text)
    if match:
        return json.loads(match.group(1))

    # Try to find raw JSON object
    json_pattern = r"\{[\s\S]*\}"
    match = re.search(json_pattern, text)
    if match:
        return json.loads(match.group(0))

    # Last resort: try parsing the whole text
    return json.loads(text)


def generate_script(content: str, locale: str) -> Script:
    """Generate podcast script from content using LLM."""
    logger.info("Generating podcast script...")

    api_key = os.getenv("OPENAI_API_KEY")
    base_url = os.getenv("OPENAI_BASE_URL", "https://api.openai.com/v1")
    model = os.getenv("OPENAI_MODEL", "gpt-4o")

    if not api_key:
        raise ValueError("OPENAI_API_KEY environment variable is not set")

    prompt = SCRIPT_WRITER_PROMPT.format(content=content, locale=locale)

    # First try with JSON mode
    try:
        response = requests.post(
            f"{base_url}/chat/completions",
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
            },
            json={
                "model": model,
                "messages": [
                    {"role": "system", "content": "You are a podcast script writer. Always respond with valid JSON only, no markdown formatting."},
                    {"role": "user", "content": prompt},
                ],
                "response_format": {"type": "json_object"},
            },
        )

        if response.status_code != 200:
            raise Exception(f"LLM API error: {response.status_code} - {response.text}")

        result = response.json()
        logger.info(f"API response keys: {result.keys()}")
        if "error" in result:
            raise Exception(f"API error: {result['error']}")
        response_content = result["choices"][0]["message"]["content"]
        logger.info(f"LLM response preview: {response_content[:200]}...")
        script_json = json.loads(response_content)

    except (json.JSONDecodeError, KeyError) as e:
        # Fallback: try without JSON mode for models that don't support it
        logger.warning(f"JSON mode failed ({e}), trying without response_format...")

        response = requests.post(
            f"{base_url}/chat/completions",
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
            },
            json={
                "model": model,
                "messages": [
                    {"role": "system", "content": "You are a podcast script writer. Respond with valid JSON only, no markdown or extra text."},
                    {"role": "user", "content": prompt},
                ],
            },
        )

        if response.status_code != 200:
            raise Exception(f"LLM API error: {response.status_code} - {response.text}")

        result = response.json()
        response_content = result["choices"][0]["message"]["content"]
        logger.debug(f"LLM response (fallback): {response_content[:500]}...")
        script_json = extract_json_from_text(response_content)

    # Validate structure
    if "lines" not in script_json:
        raise ValueError(f"Invalid script format: missing 'lines' key. Got keys: {list(script_json.keys())}")

    script = Script.from_dict(script_json)

    logger.info(f"Generated script with {len(script.lines)} lines")
    return script


def text_to_speech(text: str, voice_type: str) -> Optional[bytes]:
    """Convert text to speech using Volcengine TTS."""
    app_id = os.getenv("VOLCENGINE_TTS_APPID")
    access_token = os.getenv("VOLCENGINE_TTS_ACCESS_TOKEN")
    cluster = os.getenv("VOLCENGINE_TTS_CLUSTER", "volcano_tts")

    if not app_id or not access_token:
        raise ValueError(
            "VOLCENGINE_TTS_APPID and VOLCENGINE_TTS_ACCESS_TOKEN environment variables must be set"
        )

    url = "https://openspeech.bytedance.com/api/v1/tts"

    # Authentication: Bearer token with semicolon separator
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer;{access_token}",
    }

    payload = {
        "app": {
            "appid": app_id,
            "token": "access_token",  # literal string, not the actual token
            "cluster": cluster,
        },
        "user": {"uid": "podcast-generator"},
        "audio": {
            "voice_type": voice_type,
            "encoding": "mp3",
            "speed_ratio": 1.2,
        },
        "request": {
            "reqid": str(uuid.uuid4()),  # must be unique UUID
            "text": text,
            "text_type": "plain",
            "operation": "query",
        },
    }

    try:
        response = requests.post(url, json=payload, headers=headers)

        if response.status_code != 200:
            logger.error(f"TTS API error: {response.status_code} - {response.text}")
            return None

        result = response.json()
        if result.get("code") != 3000:
            logger.error(f"TTS error: {result.get('message')} (code: {result.get('code')})")
            return None

        audio_data = result.get("data")
        if audio_data:
            return base64.b64decode(audio_data)

    except Exception as e:
        logger.error(f"TTS error: {str(e)}")

    return None


def tts_node(script: Script) -> list[bytes]:
    """Convert script lines to audio chunks using TTS."""
    logger.info("Converting script to audio...")
    audio_chunks = []

    for i, line in enumerate(script.lines):
        # Select voice based on speaker gender
        if line.speaker == "male":
            voice_type = "zh_male_yangguangqingnian_moon_bigtts"  # Male voice
        else:
            voice_type = "zh_female_sajiaonvyou_moon_bigtts"  # Female voice

        logger.info(f"Processing line {i + 1}/{len(script.lines)} ({line.speaker})")
        audio = text_to_speech(line.paragraph, voice_type)

        if audio:
            audio_chunks.append(audio)
        else:
            logger.warning(f"Failed to generate audio for line {i + 1}")

    logger.info(f"Generated {len(audio_chunks)} audio chunks")
    return audio_chunks


def mix_audio(audio_chunks: list[bytes]) -> bytes:
    """Combine audio chunks into a single audio file."""
    logger.info("Mixing audio chunks...")
    output = b"".join(audio_chunks)
    logger.info("Audio mixing complete")
    return output


def detect_locale(content: str) -> str:
    """Auto-detect content locale based on character analysis."""
    chinese_chars = sum(1 for char in content if "\u4e00" <= char <= "\u9fff")
    total_chars = len(content)

    if total_chars > 0 and chinese_chars / total_chars > 0.1:
        return "zh"
    return "en"


def generate_podcast(
    input_file: str,
    output_file: str,
    locale: Optional[str] = None,
) -> str:
    """Generate a podcast from input content."""

    # Read input content
    with open(input_file, "r", encoding="utf-8") as f:
        content = f.read()

    if not content.strip():
        raise ValueError("Input file is empty")

    # Auto-detect locale if not specified
    if not locale:
        locale = detect_locale(content)
        logger.info(f"Auto-detected locale: {locale}")

    # Step 1: Generate script
    script = generate_script(content, locale)

    # Step 2: Convert to audio
    audio_chunks = tts_node(script)

    if not audio_chunks:
        raise Exception("Failed to generate any audio")

    # Step 3: Mix audio
    output_audio = mix_audio(audio_chunks)

    # Save output
    output_dir = os.path.dirname(output_file)
    if output_dir:
        os.makedirs(output_dir, exist_ok=True)
    with open(output_file, "wb") as f:
        f.write(output_audio)

    return f"Successfully generated podcast to {output_file}"


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Generate podcast from text content")
    parser.add_argument(
        "--input-file",
        required=True,
        help="Absolute path to input text/markdown file",
    )
    parser.add_argument(
        "--output-file",
        required=True,
        help="Output path for generated podcast MP3",
    )
    parser.add_argument(
        "--locale",
        choices=["en", "zh"],
        default=None,
        help="Language locale (auto-detected if not specified)",
    )

    args = parser.parse_args()

    try:
        result = generate_podcast(
            args.input_file,
            args.output_file,
            args.locale,
        )
        print(result)
    except Exception as e:
        import traceback
        print(f"Error generating podcast: {e}")
        traceback.print_exc()
