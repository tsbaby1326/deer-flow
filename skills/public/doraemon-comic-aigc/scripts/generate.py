import base64
import os

import requests


def generate_image(prompt: str) -> str:
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        return "GEMINI_API_KEY is not set"
    response = requests.post(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-3-pro-image-preview:generateContent",
        headers={
            "x-goog-api-key": api_key,
            "Content-Type": "application/json",
        },
        json={
            "generationConfig": {"imageConfig": {"aspectRatio": "9:16"}},
            "contents": [{"parts": [{"text": prompt}]}],
        },
    )
    parts: list[dict] = response.json()["candidates"][0]["content"]["parts"]
    image_parts = [part for part in parts if part.get("inlineData", False)]
    if len(image_parts) == 1:
        base64_image = image_parts[0]["inlineData"]["data"]
        # Save the image to a file
        with open("/mnt/user-data/outputs/doraemon.png", "wb") as f:
            f.write(base64.b64decode(base64_image))
        return "Successfully generated image to /mnt/user-data/outputs/doraemon.png"
    else:
        return "Failed to generate image"


def main():
    with open(
        "/mnt/user-data/outputs/prompt.json",
        "r",
    ) as f:
        raw = f.read()
        print(generate_image(raw))


if __name__ == "__main__":
    main()
    main()
