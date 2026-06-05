import {
  Building2,
  Cake,
  DoorOpen,
  Heart,
  Mic2,
  Music,
  PartyPopper,
  type LucideIcon,
} from "lucide-react";

const ICON_MAP: Record<string, LucideIcon> = {
  Heart,
  Mic2,
  Building2,
  Music,
  Cake,
  PartyPopper,
  DoorOpen,
};

export const SERVICE_ICON_OPTIONS = Object.keys(ICON_MAP);

export function getServiceIcon(key: string): LucideIcon {
  return ICON_MAP[key] ?? Heart;
}
