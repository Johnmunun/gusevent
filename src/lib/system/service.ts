import type { AdminRole } from "@prisma/client";
import { brand } from "@/config/brand";
import { contact } from "@/config/contact";
import { isNeonAuthConfigured } from "@/lib/auth/server";
import {
  ROLE_DESCRIPTIONS,
  ROLE_LABELS,
  ROLE_PERMISSIONS,
} from "@/lib/auth/permissions";
import { getLandingCms } from "@/lib/cms/get-content";
import { isCloudinaryConfigured } from "@/lib/cloudinary/utils";
import { REMINDER_THRESHOLDS_DAYS } from "@/lib/reminders/config";
import { getEmailSettings } from "@/lib/settings/email-settings";
import { PERMISSION_LABELS } from "@/lib/system/permission-labels";
import { prisma } from "@/lib/prisma";

const ALL_ROLES: AdminRole[] = [
  "SUPER_ADMIN",
  "ADMIN",
  "EDITOR",
  "VIEWER",
];

export type SystemUserMember = {
  id: string;
  name: string;
  email: string;
  active: boolean;
};

export type SystemRoleOverview = {
  role: AdminRole;
  label: string;
  description: string;
  userCount: number;
  permissions: { key: string; label: string }[];
  members: SystemUserMember[];
};

export type SystemAccessData = {
  totalUsers: number;
  activeUsers: number;
  roles: SystemRoleOverview[];
};

export type SystemSettingsData = {
  identity: {
    name: string;
    legalName: string;
    founded: string;
  };
  contact: {
    email: string;
    phone: string;
    phoneDisplay: string;
    addressLine1: string;
    addressLine2: string;
  };
  publicCta: {
    eyebrow: string;
    title: string;
    description: string;
  };
  email: {
    enabled: boolean;
    configured: boolean;
    fromName: string;
    fromAddress: string;
    adminNotifyTo: string;
  };
  security: {
    neonAuthConfigured: boolean;
    appUrl: string | null;
    cronConfigured: boolean;
    cloudinaryConfigured: boolean;
  };
  reminders: {
    thresholds: readonly number[];
    active: boolean;
  };
};

export async function getSystemAccessData(): Promise<SystemAccessData> {
  const users = await prisma.user.findMany({
    orderBy: [{ role: "asc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      active: true,
    },
  });

  return {
    totalUsers: users.length,
    activeUsers: users.filter((u) => u.active).length,
    roles: ALL_ROLES.map((role) => ({
      role,
      label: ROLE_LABELS[role],
      description: ROLE_DESCRIPTIONS[role],
      userCount: users.filter((u) => u.role === role).length,
      permissions: ROLE_PERMISSIONS[role].map((key) => ({
        key,
        label: PERMISSION_LABELS[key] ?? key,
      })),
      members: users
        .filter((u) => u.role === role)
        .map((u) => ({
          id: u.id,
          name: u.name,
          email: u.email,
          active: u.active,
        })),
    })),
  };
}

export async function getSystemSettingsData(): Promise<SystemSettingsData> {
  const [email, cms] = await Promise.all([
    getEmailSettings(),
    getLandingCms(),
  ]);

  return {
    identity: {
      name: brand.name,
      legalName: brand.legalName,
      founded: brand.founded,
    },
    contact: {
      email: contact.email,
      phone: contact.phone,
      phoneDisplay: contact.phoneDisplay,
      addressLine1: contact.address.line1,
      addressLine2: contact.address.line2,
    },
    publicCta: {
      eyebrow: cms.cta.eyebrow,
      title: cms.cta.title,
      description: cms.cta.description,
    },
    email: {
      enabled: email.enabled,
      configured: Boolean(email.smtpHost && email.smtpUser),
      fromName: email.fromName,
      fromAddress: email.fromAddress,
      adminNotifyTo: email.adminNotifyTo,
    },
    security: {
      neonAuthConfigured: isNeonAuthConfigured,
      appUrl: process.env.NEXT_PUBLIC_APP_URL ?? null,
      cronConfigured: Boolean(process.env.CRON_SECRET),
      cloudinaryConfigured: isCloudinaryConfigured(),
    },
    reminders: {
      thresholds: REMINDER_THRESHOLDS_DAYS,
      active: true,
    },
  };
}
