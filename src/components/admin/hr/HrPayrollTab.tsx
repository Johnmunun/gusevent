"use client";

import { useCallback, useEffect, useState } from "react";
import {
  FileSpreadsheet,
  FileText,
  Loader2,
  Pencil,
  Plus,
  Trash2,
  Wand2,
} from "lucide-react";
import { AdminCard } from "@/components/admin/AdminCard";
import { AdminStatCard } from "@/components/admin/AdminStatCard";
import type { EmployeeRow } from "@/components/admin/hr/EmployeeFormDrawer";
import { PayslipFormDrawer } from "@/components/admin/hr/PayslipFormDrawer";
import { ADMIN_CARD_ICONS } from "@/lib/admin/card-icons";
import { downloadAdminFile } from "@/lib/hr/download-client";
import {
  formatPayrollAmount,
  MONTH_LABELS,
  PAYSLIP_STATUS_LABELS,
  PAYSLIP_STATUS_STYLES,
  type HrPayslip,
  type PayrollStats,
} from "@/lib/hr/payroll-types";
import type { CurrencyCode } from "@/lib/quote";

type HrPayrollTabProps = {
  canEdit: boolean;
  employees: EmployeeRow[];
  defaultCurrency: CurrencyCode;
};

export function HrPayrollTab({
  canEdit,
  employees,
  defaultCurrency,
}: HrPayrollTabProps) {
  const now = new Date();
  const [periodYear, setPeriodYear] = useState(now.getFullYear());
  const [periodMonth, setPeriodMonth] = useState(now.getMonth() + 1);
  const [payslips, setPayslips] = useState<HrPayslip[]>([]);
  const [stats, setStats] = useState<PayrollStats>({
    count: 0,
    totalGross: 0,
    totalNet: 0,
    paidCount: 0,
    draftCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<HrPayslip | null>(null);

  const fetchPayslips = useCallback(async () => {
    const params = new URLSearchParams({
      year: String(periodYear),
      month: String(periodMonth),
    });
    const res = await fetch(`/api/admin/hr/payslips?${params.toString()}`, {
      cache: "no-store",
      credentials: "same-origin",
    });
    if (!res.ok) return;
    const data = (await res.json()) as {
      payslips: HrPayslip[];
      stats: PayrollStats;
    };
    setPayslips(data.payslips);
    setStats(data.stats);
  }, [periodYear, periodMonth]);

  useEffect(() => {
    setLoading(true);
    fetchPayslips().finally(() => setLoading(false));
  }, [fetchPayslips]);

  async function handleGenerate() {
    if (
      !confirm(
        `Générer les bulletins brouillon pour ${MONTH_LABELS[periodMonth - 1]} ${periodYear} ?\n\nLes employés actifs sans bulletin recevront un salaire brut = salaire de base.`
      )
    ) {
      return;
    }
    setGenerating(true);
    try {
      const res = await fetch("/api/admin/hr/payslips/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ periodYear, periodMonth, onlyActive: true }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error ?? "Génération impossible");
        return;
      }
      await fetchPayslips();
      alert(`${data.createdCount} bulletin(s) créé(s).`);
    } finally {
      setGenerating(false);
    }
  }

  async function handleExportExcel() {
    setExporting(true);
    try {
      await downloadAdminFile(
        `/api/admin/hr/export/payslips?year=${periodYear}&month=${periodMonth}`,
        `paie-gusevent-${periodYear}-${String(periodMonth).padStart(2, "0")}.xlsx`
      );
    } catch {
      alert("Export Excel impossible.");
    } finally {
      setExporting(false);
    }
  }

  async function handleDownloadPdf(id: string) {
    try {
      await downloadAdminFile(
        `/api/admin/hr/payslips/${id}/pdf`,
        "bulletin.pdf"
      );
    } catch {
      alert("Téléchargement PDF impossible.");
    }
  }

  async function handleDelete(payslip: HrPayslip) {
    if (!confirm(`Supprimer le bulletin ${payslip.reference} ?`)) return;
    const res = await fetch(`/api/admin/hr/payslips/${payslip.id}`, {
      method: "DELETE",
      credentials: "same-origin",
    });
    if (res.ok) await fetchPayslips();
  }

  const years = Array.from({ length: 5 }, (_, i) => now.getFullYear() - 2 + i);

  return (
    <>
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex flex-wrap gap-3">
          <div>
            <label className="text-xs font-semibold tracking-wide text-muted uppercase">
              Année
            </label>
            <select
              value={periodYear}
              onChange={(e) => setPeriodYear(Number(e.target.value))}
              className="mt-1 block border border-border bg-surface px-3 py-2 text-sm"
            >
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold tracking-wide text-muted uppercase">
              Mois
            </label>
            <select
              value={periodMonth}
              onChange={(e) => setPeriodMonth(Number(e.target.value))}
              className="mt-1 block border border-border bg-surface px-3 py-2 text-sm"
            >
              {MONTH_LABELS.map((label, index) => (
                <option key={label} value={index + 1}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {canEdit ? (
            <>
              <button
                type="button"
                onClick={() => void handleGenerate()}
                disabled={generating}
                className="inline-flex items-center gap-2 border border-border bg-surface px-3 py-2 text-xs font-medium hover:border-gold/40 disabled:opacity-60"
              >
                {generating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Wand2 className="h-4 w-4 text-gold" />
                )}
                Générer le mois
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditing(null);
                  setDrawerOpen(true);
                }}
                className="inline-flex items-center gap-2 border border-gold/35 bg-gold/10 px-3 py-2 text-xs font-medium text-gold hover:bg-gold hover:text-ink"
              >
                <Plus className="h-4 w-4" />
                Bulletin manuel
              </button>
            </>
          ) : null}
          <button
            type="button"
            onClick={() => void handleExportExcel()}
            disabled={exporting}
            className="inline-flex items-center gap-2 border border-border bg-surface px-3 py-2 text-xs font-medium hover:border-gold/40 disabled:opacity-60"
          >
            {exporting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <FileSpreadsheet className="h-4 w-4 text-gold" />
            )}
            Export Excel
          </button>
        </div>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <AdminStatCard
          label="Bulletins"
          value={String(stats.count)}
          hint={`${MONTH_LABELS[periodMonth - 1]} ${periodYear}`}
          trend="neutral"
        />
        <AdminStatCard
          label="Masse brute"
          value={stats.totalGross.toLocaleString("fr-FR", {
            maximumFractionDigits: 0,
          })}
          suffix={` ${defaultCurrency}`}
          trend="neutral"
        />
        <AdminStatCard
          label="Masse nette"
          value={stats.totalNet.toLocaleString("fr-FR", {
            maximumFractionDigits: 0,
          })}
          suffix={` ${defaultCurrency}`}
          trend={stats.totalNet > 0 ? "up" : "neutral"}
        />
        <AdminStatCard
          label="Payés"
          value={String(stats.paidCount)}
          hint={`${stats.draftCount} brouillon(s)`}
          trend={stats.paidCount > 0 ? "up" : "neutral"}
        />
      </div>

      <AdminCard title="Bulletins de paie" icon={ADMIN_CARD_ICONS.revenue} noPadding>
        {loading ? (
          <p className="flex items-center gap-2 px-6 py-10 text-sm text-muted">
            <Loader2 className="h-4 w-4 animate-spin" />
            Chargement…
          </p>
        ) : payslips.length === 0 ? (
          <p className="px-6 py-12 text-center text-sm text-muted">
            Aucun bulletin pour cette période. Générez les fiches du mois ou
            créez un bulletin manuellement.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="border-b border-border bg-cream/40 text-xs tracking-wide text-muted uppercase">
                <tr>
                  <th className="px-6 py-3 font-semibold">Réf.</th>
                  <th className="px-4 py-3 font-semibold">Employé</th>
                  <th className="px-4 py-3 font-semibold">Brut</th>
                  <th className="px-4 py-3 font-semibold">Net</th>
                  <th className="px-4 py-3 font-semibold">Statut</th>
                  <th className="px-6 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/80">
                {payslips.map((p) => (
                  <tr key={p.id} className="hover:bg-accent-light/20">
                    <td className="px-6 py-4 font-mono text-xs">{p.reference}</td>
                    <td className="px-4 py-4">
                      <p className="font-medium text-foreground">{p.employeeName}</p>
                      <p className="text-xs text-muted">{p.employeeJobTitle}</p>
                    </td>
                    <td className="px-4 py-4 text-muted">
                      {formatPayrollAmount(p.grossSalary, p.currency)}
                    </td>
                    <td className="px-4 py-4 font-medium text-foreground">
                      {formatPayrollAmount(p.netSalary, p.currency)}
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`inline-block px-2 py-0.5 text-[10px] font-semibold uppercase ${PAYSLIP_STATUS_STYLES[p.status]}`}
                      >
                        {PAYSLIP_STATUS_LABELS[p.status]}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => void handleDownloadPdf(p.id)}
                          className="inline-flex items-center gap-1 border border-border px-2.5 py-1.5 text-xs hover:border-gold/40"
                          title="Télécharger PDF"
                        >
                          <FileText className="h-3.5 w-3.5" />
                          PDF
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setEditing(p);
                            setDrawerOpen(true);
                          }}
                          className="inline-flex items-center gap-1 border border-border px-2.5 py-1.5 text-xs hover:border-gold/40"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          {canEdit ? "Modifier" : "Voir"}
                        </button>
                        {canEdit ? (
                          <button
                            type="button"
                            onClick={() => void handleDelete(p)}
                            className="inline-flex items-center gap-1 border border-border px-2.5 py-1.5 text-xs text-red-700 hover:border-red-200 hover:bg-red-50"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </AdminCard>

      <PayslipFormDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        payslip={editing}
        employees={employees}
        defaultYear={periodYear}
        defaultMonth={periodMonth}
        defaultCurrency={defaultCurrency}
        canEdit={canEdit}
        onSaved={fetchPayslips}
      />
    </>
  );
}
