import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { requireApiPermission } from "@/lib/auth/api-guard";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { CMS_SLUGS, type CmsSlug } from "@/lib/cms/types";
import { getCmsSection, saveCmsSection } from "@/lib/cms/get-content";
import { getDefaultSection } from "@/lib/cms/defaults";

function isCmsSlug(slug: string): slug is CmsSlug {
  return (CMS_SLUGS as readonly string[]).includes(slug);
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const guard = await requireApiPermission(PERMISSIONS.cms);
  if (guard.error) return guard.error;

  const { slug } = await params;
  if (!isCmsSlug(slug)) {
    return NextResponse.json({ error: "Section inconnue" }, { status: 404 });
  }

  const content = await getCmsSection(slug);
  return NextResponse.json({ slug, content });
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const guard = await requireApiPermission(PERMISSIONS.cmsEdit);
  if (guard.error) return guard.error;

  const { slug } = await params;
  if (!isCmsSlug(slug)) {
    return NextResponse.json({ error: "Section inconnue" }, { status: 404 });
  }

  const body = await request.json();
  const content = body.content ?? body;

  const defaults = getDefaultSection(slug);
  if (typeof content !== typeof defaults && !Array.isArray(content)) {
    return NextResponse.json({ error: "Contenu invalide" }, { status: 400 });
  }

  await saveCmsSection(slug, content, guard.session?.user?.id);

  revalidatePath("/", "layout");
  revalidatePath("/");

  return NextResponse.json({ ok: true, slug, revalidated: true });
}
