import { env } from "@/env";

import type { Skill } from "./type";

export async function loadSkills() {
  const skills = await fetch(`${env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/skills`);
  const json = await skills.json();
  return json.skills as Skill[];
}

export async function enableSkill(skillName: string, enabled: boolean) {
  const response = await fetch(
    `${env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/skills/${skillName}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        enabled,
      }),
    },
  );
  return response.json();
}
