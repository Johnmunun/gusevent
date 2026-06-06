"use client";

import { useCallback, useEffect, useState } from "react";
import type { EmployeeStatus } from "@prisma/client";
import {
  FileSpreadsheet,
  IdCard,
  Loader2,
  Mail,
  Pencil,
  Phone,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { AdminCard } from "@/components/admin/AdminCard";
import { AdminStatCard } from "@/components/admin/AdminStatCard";
import {
  EmployeeFormDrawer,
  type EmployeeRow,
} from "@/components/admin/hr/EmployeeFormDrawer";
import { ADMIN_CARD_ICONS } from "@/lib/admin/card-icons";
import { hasPermission, PERMISSIONS } from "@/lib/auth/permissions";
import {
  EMPLOYEE_CONTRACT_LABELS,
  EMPLOYEE_STATUS_LABELS,
  EMPLOYEE_STATUS_STYLES,
  type HrStats,
} from "@/lib/hr/types";
import { HrPayrollTab } from "@/components/admin/hr/HrPayrollTab";
import { downloadAdminFile } from "@/lib/hr/download-client";
import { formatPayrollAmount } from "@/lib/hr/payroll-types";
import { DEFAULT_CURRENCY, type CurrencyCode } from "@/lib/quote";
import type { HrPayrollSettings } from "@/lib/settings/hr-settings-types";

import { useAdminApp } from "@/components/admin/admin-app-context";

type HrTab = "employees" | "payroll";
type StatusFilter = "all" | EmployeeStatus;

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function HrPageView() {
  const appSession = useAdminApp();
  const canEdit =
    appSession?.user.role === "SUPER_ADMIN" ||
    hasPermission(
      appSession?.user.role ?? "VIEWER",
      appSession?.user.permissions ?? [],
      PERMISSIONS.hrEdit
    );

  const [tab, setTab] = useState<HrTab>("employees");
  const [exportingEmployees, setExportingEmployees] = useState(false);
  const [employees, setEmployees] = useState<EmployeeRow[]>([]);
  const [stats, setStats] = useState<HrStats>({
    total: 0,
    active: 0,
    onLeave: 0,
    inactive: 0,
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<StatusFilter>("all");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<EmployeeRow | null>(null);
  const [payrollSettings, setPayrollSettings] = useState<HrPayrollSettings | null>(
    null
  );
  const defaultCurrency = payrollSettings?.defaultCurrency ?? DEFAULT_CURRENCY;

  const fetchEmployees = useCallback(async () => {
    const params = new URLSearchParams();
    if (search.trim()) params.set("q", search.trim());
    if (filter !== "all") params.set("status", filter);

    const res = await fetch(`/api/admin/hr/employees?${params.toString()}`, {
      cache: "no-store",
      credentials: "same-origin",
    });
    if (!res.ok) return;
    const data = (await res.json()) as {
      employees: EmployeeRow[];
      stats: HrStats;
    };
    setEmployees(data.employees);
    setStats(data.stats);
  }, [search, filter]);

  useEffect(() => {
    fetch("/api/admin/hr/settings", { credentials: "same-origin" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data: HrPayrollSettings | null) => {
        if (data) setPayrollSettings(data);
      })
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    setLoading(true);
    const timer = window.setTimeout(() => {
      fetchEmployees().finally(() => setLoading(false));
    }, search ? 300 : 0);
    return () => window.clearTimeout(timer);
  }, [fetchEmployees, search]);

  async function handleDelete(employee: EmployeeRow) {
    if (
      !confirm(
        `Supprimer ${employee.fullName} de la liste des employés ?`
      )
    ) {
      return;
    }
    const res = await fetch(`/api/admin/hr/employees/${employee.id}`, {
      method: "DELETE",
      credentials: "same-origin",
    });
    if (res.ok) await fetchEmployees();
  }

  async function handleExportEmployees() {
    setExportingEmployees(true);
    try {
      await downloadAdminFile(
        "/api/admin/hr/export/employees",
        "employes-gusevent.xlsx"
      );
    } catch {
      alert("Export Excel impossible.");
    } finally {
      setExportingEmployees(false);
    }
  }

  const filters: { id: StatusFilter; label: string }[] = [
    { id: "all", label: "Tous" },
    { id: "ACTIVE", label: "Actifs" },
    { id: "ON_LEAVE", label: "En congé" },
    { id: "INACTIVE", label: "Inactifs" },
  ];

  return (
    <>
      <div className="admin-welcome mb-8 flex flex-wrap items-center justify-between gap-4 px-5 py-5 text-cream sm:px-6">
        <div className="flex items-start gap-3">
          <IdCard className="mt-0.5 h-7 w-7 shrink-0 text-gold" />
          <div>
            <p className="font-display text-xl">Ressources humaines</p>
            <p className="mt-2 text-sm text-stone-400">
              Annuaire, paie et bulletins des collaborateurs gusEvent.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => void handleExportEmployees()}
            disabled={exportingEmployees}
            className="inline-flex items-center gap-2 border border-border bg-surface/10 px-4 py-2.5 text-sm font-medium text-cream hover:border-gold/40 disabled:opacity-60"
          >
            {exportingEmployees ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <FileSpreadsheet className="h-4 w-4 text-gold" />
            )}
            Export Excel
          </button>
          {canEdit && tab === "employees" ? (
            <button
              type="button"
              onClick={() => {
                setEditing(null);
                setDrawerOpen(true);
              }}
              className="inline-flex items-center gap-2 border border-gold/35 bg-gold/10 px-4 py-2.5 text-sm font-medium text-gold transition-colors hover:bg-gold hover:text-ink"
            >
              <Plus className="h-4 w-4" />
              Ajouter un employé
            </button>
          ) : null}
        </div>
      </div>

      <div className="mb-8 flex gap-2 border-b border-border">
        <button
          type="button"
          onClick={() => setTab("employees")}
          className={`px-4 py-2.5 text-sm font-medium transition-colors ${
            tab === "employees"
              ? "border-b-2 border-gold text-foreground"
              : "text-muted hover:text-foreground"
          }`}
        >
          Annuaire
        </button>
        <button
          type="button"
          onClick={() => setTab("payroll")}
          className={`px-4 py-2.5 text-sm font-medium transition-colors ${
            tab === "payroll"
              ? "border-b-2 border-gold text-foreground"
              : "text-muted hover:text-foreground"
          }`}
        >
          Paie & bulletins
        </button>
      </div>

      {tab === "payroll" ? (
        <HrPayrollTab
          canEdit={canEdit}
          employees={employees}
          defaultCurrency={defaultCurrency}
        />
      ) : (
        <>
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <AdminStatCard label="Effectif total" value={String(stats.total)} trend="neutral" />
        <AdminStatCard
          label="Actifs"
          value={String(stats.active)}
          hint="En poste"
          trend={stats.active > 0 ? "up" : "neutral"}
        />
        <AdminStatCard
          label="En congé"
          value={String(stats.onLeave)}
          trend="neutral"
        />
        <AdminStatCard
          label="Inactifs"
          value={String(stats.inactive)}
          trend={stats.inactive > 0 ? "down" : "neutral"}
        />
      </div>

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-md flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par nom, poste, email…"
            className="w-full border border-border bg-surface py-2.5 pr-3 pl-10 text-sm outline-none focus:border-gold/50"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {filters.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                filter === f.id
                  ? "bg-ink text-cream"
                  : "border border-border bg-surface text-muted hover:text-foreground"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <AdminCard title="Annuaire employés" icon={ADMIN_CARD_ICONS.accounts} noPadding>
        {loading ? (
          <p className="flex items-center gap-2 px-6 py-10 text-sm text-muted">
            <Loader2 className="h-4 w-4 animate-spin" />
            Chargement…
          </p>
        ) : employees.length === 0 ? (
          <p className="px-6 py-12 text-center text-sm text-muted">
            {search || filter !== "all"
              ? "Aucun employé ne correspond à votre recherche."
              : "Aucun employé enregistré. Ajoutez votre première fiche collaborateur."}
          </p>
        ) : (
          <>
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead className="border-b border-border bg-cream/40 text-xs tracking-wide text-muted uppercase">
                  <tr>
                    <th className="px-6 py-3 font-semibold">Collaborateur</th>
                    <th className="px-4 py-3 font-semibold">Poste</th>
                    <th className="px-4 py-3 font-semibold">Salaire base</th>
                    <th className="px-4 py-3 font-semibold">Contrat</th>
                    <th className="px-4 py-3 font-semibold">Embauche</th>
                    <th className="px-4 py-3 font-semibold">Statut</th>
                    <th className="px-6 py-3 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/80">
                  {employees.map((employee) => (
                    <tr
                      key={employee.id}
                      className="transition-colors hover:bg-accent-light/20"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center bg-ink font-display text-sm text-gold">
                            {employee.fullName.charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium text-foreground">
                              {employee.fullName}
                            </p>
                            <div className="mt-1 flex flex-wrap gap-3 text-xs text-muted">
                              {employee.email ? (
                                <span className="inline-flex items-center gap-1">
                                  <Mail className="h-3 w-3" />
                                  {employee.email}
                                </span>
                              ) : null}
                              {employee.phone ? (
                                <span className="inline-flex items-center gap-1">
                                  <Phone className="h-3 w-3" />
                                  {employee.phone}
                                </span>
                              ) : null}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <p className="text-foreground">{employee.jobTitle}</p>
                        {employee.department ? (
                          <p className="text-xs text-muted">{employee.department}</p>
                        ) : null}
                      </td>
                      <td className="px-4 py-4 text-muted">
                        {employee.baseSalary != null
                          ? formatPayrollAmount(employee.baseSalary, defaultCurrency)
                          : "—"}
                      </td>
                      <td className="px-4 py-4 text-muted">
                        {EMPLOYEE_CONTRACT_LABELS[employee.contractType]}
                      </td>
                      <td className="px-4 py-4 text-muted">
                        {formatDate(employee.hireDate)}
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`inline-block px-2 py-0.5 text-[10px] font-semibold uppercase ${EMPLOYEE_STATUS_STYLES[employee.status]}`}
                        >
                          {EMPLOYEE_STATUS_LABELS[employee.status]}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setEditing(employee);
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
                              onClick={() => void handleDelete(employee)}
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

            <ul className="divide-y divide-border md:hidden">
              {employees.map((employee) => (
                <li key={employee.id} className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-foreground">
                        {employee.fullName}
                      </p>
                      <p className="text-sm text-muted">{employee.jobTitle}</p>
                      <span
                        className={`mt-2 inline-block px-2 py-0.5 text-[10px] font-semibold uppercase ${EMPLOYEE_STATUS_STYLES[employee.status]}`}
                      >
                        {EMPLOYEE_STATUS_LABELS[employee.status]}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setEditing(employee);
                        setDrawerOpen(true);
                      }}
                      className="text-xs text-gold hover:underline"
                    >
                      {canEdit ? "Modifier" : "Voir"}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
      </AdminCard>

      <EmployeeFormDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        employee={editing}
        defaultCurrency={defaultCurrency}
        canEdit={canEdit}
        onSaved={fetchEmployees}
      />
        </>
      )}
    </>
  );
}
