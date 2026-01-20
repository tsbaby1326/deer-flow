"use client";

import { SparklesIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  Item,
  ItemActions,
  ItemTitle,
  ItemContent,
  ItemDescription,
} from "@/components/ui/item";
import { Switch } from "@/components/ui/switch";
import { useI18n } from "@/core/i18n/hooks";
import { useEnableSkill, useSkills } from "@/core/skills/hooks";
import type { Skill } from "@/core/skills/type";

import { SettingsSection } from "./settings-section";

export function SkillSettingsPage() {
  const { t } = useI18n();
  const { skills, isLoading, error } = useSkills();
  return (
    <SettingsSection
      title={t.settings.skills.title}
      description={t.settings.skills.description}
    >
      {isLoading ? (
        <div>Loading...</div>
      ) : error ? (
        <div>Error: {error.message}</div>
      ) : (
        <SkillSettingsList skills={skills} />
      )}
    </SettingsSection>
  );
}

function SkillSettingsList({ skills }: { skills: Skill[] }) {
  const { mutate: enableSkill } = useEnableSkill();
  if (skills.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <SparklesIcon />
          </EmptyMedia>
          <EmptyTitle>No skill yet</EmptyTitle>
          <EmptyDescription>
            Put your skill folders under the `/skills/custom` folder under the
            root folder of DeerFlow.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }
  return (
    <div className="flex w-full flex-col gap-4">
      {skills.map((skill) => (
        <Item className="w-full" variant="outline" key={skill.name}>
          <ItemContent>
            <ItemTitle>
              <div className="flex items-center gap-2">
                <div>{skill.name}</div>
                <Badge variant="outline">{skill.category}</Badge>
              </div>
            </ItemTitle>
            <ItemDescription className="line-clamp-4">
              {skill.description}
            </ItemDescription>
          </ItemContent>
          <ItemActions>
            <Switch
              checked={skill.enabled}
              onCheckedChange={(checked) =>
                enableSkill({ skillName: skill.name, enabled: checked })
              }
            />
          </ItemActions>
        </Item>
      ))}
    </div>
  );
}
