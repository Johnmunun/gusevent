"use client";

import { useEffect, useMemo, useState } from "react";
import type { PayslipStatus } from "@prisma/client";
import { Drawer } from "@/components/ui/Drawer";
import {
  computeNetSalary,
  formatPayrollAmount,
  MONTH_LABELS,
  PAYSLIP_STATUS_LABELS,
  type HrPayslip,
} from "@/lib/hr/payroll-types";
import { currencies } from "@/lib/quote";
import type { CurrencyCode } from "@/lib/quote";
import type { EmployeeRow } from "@/components/admin/hr/EmployeeFormDrawer";

type PayslipFormDrawerProps = {
  open: boolean;
  onClose: () => void;
  payslip?: HrPayslip | null;
  employees: EmployeeRow[];
  defaultYear: number;
  defaultMonth: number;
  defaultCurrency: CurrencyCode;
  canEdit: boolean;
  onSaved: () => void;
};

const inputClass =
  "mt-1 w-full border border-border bg-surface px-3 py-2.5 text-sm outline-none focus:border-gold/50";
const labelClass = "text-xs font-semibold tracking-wide text-muted uppercase";

export function PayslipFormDrawer({
  open,
  onClose,
  payslip,
  employees,
  defaultYear,
  defaultMonth,
  defaultCurrency,
  canEdit,
  onSaved,
}: PayslipFormDrawerProps) {
  const [employeeId, setEmployeeId] = useState("");
  const [periodYear, setPeriodYear] = useState(defaultYear);
  const [periodMonth, setPeriodMonth] = useState(defaultMonth);
  const [grossSalary, setGrossSalary] = useState("");
  const [allowances, setAllowances] = useState("");
  const [deductions, setDeductions] = useState("");
  const [currency, setCurrency] = useState<CurrencyCode>(defaultCurrency);
  const [status, setStatus] = useState<PayslipStatus>("DRAFT");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const netPreview = useMemo(() => {
    const gross = Number.parseFloat(grossSalary) || 0;
    const allow = Number.parseFloat(allowances) || 0;
    const deduct = Number.parseFloat(deductions) || 0;
    return computeNetSalary(gross, allow, deduct);
  }, [grossSalary, allowances, deductions]);

  useEffect(() => {
    if (payslip) {
      setEmployeeId(payslip.employeeId);
      setPeriodYear(payslip.periodYear);
      setPeriodMonth(payslip.periodMonth);
      setGrossSalary(String(payslip.grossSalary));
      setAllowances(String(payslip.allowances));
      setDeductions(String(payslip.deductions));
      setCurrency((payslip.currency as CurrencyCode) || defaultCurrency);
      setStatus(payslip.status);
      setNotes(payslip.notes ?? "");
    } else {
      setEmployeeId(employees[0]?.id ?? "");
      setPeriodYear(defaultYear);
      setPeriodMonth(defaultMonth);
      const base = employees[0]?.baseSalary;
      setGrossSalary(base != null ? String(base) : "0");
      setAllowances("0");
      setDeductions("0");
      setCurrency(defaultCurrency);
      setStatus("DRAFT");
      setNotes("");
    }
    setError("");
  }, [payslip, open, employees, defaultYear, defaultMonth, defaultCurrency]);

  useEffect(() => {
    if (payslip || !employeeId) return;
    const employee = employees.find((e) => e.id === employeeId);
    if (employee?.baseSalary != null) {
      setGrossSalary(String(employee.baseSalary));
    }
  }, [employeeId, employees, payslip]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canEdit) return;

    setSaving(true);
    setError("");

    const body = {
      employeeId,
      periodYear,
      periodMonth,
      grossSalary: Number.parseFloat(grossSalary) || 0,
      allowances: Number.parseFloat(allowances) || 0,
      deductions: Number.parseFloat(deductions) || 0,
      currency,
      status,
      notes,
    };

    const url = payslip
      ? `/api/admin/hr/payslips/${payslip.id}`
      : "/api/admin/hr/payslips";
    const method = payslip ? "PATCH" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify(body),
    });

    setSaving(false);
    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Erreur");
      return;
    }

    onSaved();
    onClose();
  }

  const years = Array.from({ length: 5 }, (_, i) => defaultYear - 2 + i);

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={payslip ? "Modifier le bulletin" : "Nouveau bulletin de paie"}
    >
      <form onSubmit={handleSubmit} className="space-y-5 p-6">
        {error && (
          <p className="border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
            {error}
          </p>
        )}

        <div>
          <label className={labelClass}>Employé</label>
          <select
            required
            disabled={!canEdit || Boolean(payslip)}
            value={employeeId}
            onChange={(e) => setEmployeeId(e.target.value)}
            className={inputClass}
          >
            <option value="">Sélectionner…</option>
            {employees.map((e) => (
              <option key={e.id} value={e.id}>
                {e.fullName} — {e.jobTitle}
              </option>
            ))}
          </select>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Année</label>
            <select
              disabled={!canEdit}
              value={periodYear}
              onChange={(e) => setPeriodYear(Number(e.target.value))}
              className={inputClass}
            >
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Mois</label>
            <select
              disabled={!canEdit}
              value={periodMonth}
              onChange={(e) => setPeriodMonth(Number(e.target.value))}
              className={inputClass}
            >
              {MONTH_LABELS.map((label, index) => (
                <option key={label} value={index + 1}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Devise</label>
            <select
              disabled={!canEdit}
              value={currency}
              onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
              className={inputClass}
            >
              {currencies.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.label} ({c.code})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className={labelClass}>Salaire brut ({currency})</label>
            <input
              type="number"
              min="0"
              step="0.001"
              required
              disabled={!canEdit}
              value={grossSalary}
              onChange={(e) => setGrossSalary(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Primes</label>
            <input
              type="number"
              min="0"
              step="0.001"
              disabled={!canEdit}
              value={allowances}
              onChange={(e) => setAllowances(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Retenues</label>
            <input
              type="number"
              min="0"
              step="0.001"
              disabled={!canEdit}
              value={deductions}
              onChange={(e) => setDeductions(e.target.value)}
              className={inputClass}
            />
          </div>
        </div>

        <p className="border border-gold/30 bg-gold/10 px-4 py-3 text-sm">
          Net à payer :{" "}
          <strong className="text-foreground">
            {formatPayrollAmount(netPreview, currency)}
          </strong>
        </p>

        <div>
          <label className={labelClass}>Statut</label>
          <select
            disabled={!canEdit}
            value={status}
            onChange={(e) => setStatus(e.target.value as PayslipStatus)}
            className={inputClass}
          >
            {Object.entries(PAYSLIP_STATUS_LABELS).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass}>Notes</label>
          <textarea
            rows={3}
            disabled={!canEdit}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className={`${inputClass} resize-y`}
          />
        </div>

        {canEdit ? (
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-ink py-2.5 text-sm font-medium text-cream hover:bg-stone-800 disabled:opacity-60"
            >
              {saving ? "Enregistrement…" : payslip ? "Enregistrer" : "Créer"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="border border-border px-4 py-2.5 text-sm text-muted hover:text-foreground"
            >
              Annuler
            </button>
          </div>
        ) : null}
      </form>
    </Drawer>
  );
}
