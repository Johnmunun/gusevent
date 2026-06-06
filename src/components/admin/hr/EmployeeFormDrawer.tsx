"use client";

import { useEffect, useState } from "react";
import type { EmployeeContractType, EmployeeStatus } from "@prisma/client";
import { Drawer } from "@/components/ui/Drawer";
import {
  EMPLOYEE_CONTRACT_LABELS,
  EMPLOYEE_DEPARTMENTS,
  EMPLOYEE_STATUS_LABELS,
  type HrEmployee,
} from "@/lib/hr/types";
import type { CurrencyCode } from "@/lib/quote";

export type EmployeeRow = HrEmployee;

type EmployeeFormDrawerProps = {
  open: boolean;
  onClose: () => void;
  employee?: EmployeeRow | null;
  defaultCurrency: CurrencyCode;
  canEdit: boolean;
  onSaved: () => void;
};

const inputClass =
  "mt-1 w-full border border-border bg-surface px-3 py-2.5 text-sm outline-none focus:border-gold/50";
const labelClass = "text-xs font-semibold tracking-wide text-muted uppercase";

export function EmployeeFormDrawer({
  open,
  onClose,
  employee,
  defaultCurrency,
  canEdit,
  onSaved,
}: EmployeeFormDrawerProps) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [department, setDepartment] = useState("");
  const [contractType, setContractType] = useState<EmployeeContractType>("CDI");
  const [status, setStatus] = useState<EmployeeStatus>("ACTIVE");
  const [hireDate, setHireDate] = useState("");
  const [notes, setNotes] = useState("");
  const [baseSalary, setBaseSalary] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (employee) {
      setFullName(employee.fullName);
      setEmail(employee.email ?? "");
      setPhone(employee.phone ?? "");
      setJobTitle(employee.jobTitle);
      setDepartment(employee.department ?? "");
      setContractType(employee.contractType);
      setStatus(employee.status);
      setHireDate(
        employee.hireDate
          ? new Date(employee.hireDate).toISOString().slice(0, 10)
          : ""
      );
      setNotes(employee.notes ?? "");
      setBaseSalary(
        employee.baseSalary != null ? String(employee.baseSalary) : ""
      );
    } else {
      setFullName("");
      setEmail("");
      setPhone("");
      setJobTitle("");
      setDepartment("Production");
      setContractType("CDI");
      setStatus("ACTIVE");
      setHireDate("");
      setNotes("");
      setBaseSalary("");
    }
    setError("");
  }, [employee, open]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canEdit) return;

    setSaving(true);
    setError("");

    const body = {
      fullName,
      email,
      phone,
      jobTitle,
      department,
      contractType,
      status,
      hireDate,
      notes,
      baseSalary:
        baseSalary.trim() === ""
          ? null
          : Number.parseFloat(baseSalary) || 0,
    };

    const url = employee
      ? `/api/admin/hr/employees/${employee.id}`
      : "/api/admin/hr/employees";
    const method = employee ? "PATCH" : "POST";

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

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={employee ? "Modifier l'employé" : "Nouvel employé"}
    >
      <form onSubmit={handleSubmit} className="space-y-5 p-6">
        {error && (
          <p className="border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
            {error}
          </p>
        )}

        <div>
          <label className={labelClass}>Nom complet</label>
          <input
            required
            disabled={!canEdit}
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className={inputClass}
            placeholder="Prénom et nom"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Poste</label>
            <input
              required
              disabled={!canEdit}
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              className={inputClass}
              placeholder="Coordinateur événementiel"
            />
          </div>
          <div>
            <label className={labelClass}>Département</label>
            <select
              disabled={!canEdit}
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className={inputClass}
            >
              <option value="">—</option>
              {EMPLOYEE_DEPARTMENTS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Email</label>
            <input
              type="email"
              disabled={!canEdit}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
              placeholder="email@gusevent.com"
            />
          </div>
          <div>
            <label className={labelClass}>Téléphone</label>
            <input
              type="tel"
              disabled={!canEdit}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className={inputClass}
              placeholder="+216 …"
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className={labelClass}>Contrat</label>
            <select
              disabled={!canEdit}
              value={contractType}
              onChange={(e) =>
                setContractType(e.target.value as EmployeeContractType)
              }
              className={inputClass}
            >
              {Object.entries(EMPLOYEE_CONTRACT_LABELS).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Statut</label>
            <select
              disabled={!canEdit}
              value={status}
              onChange={(e) => setStatus(e.target.value as EmployeeStatus)}
              className={inputClass}
            >
              {Object.entries(EMPLOYEE_STATUS_LABELS).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Date d&apos;embauche</label>
            <input
              type="date"
              disabled={!canEdit}
              value={hireDate}
              onChange={(e) => setHireDate(e.target.value)}
              className={inputClass}
            />
          </div>
        </div>

        <div>
          <label className={labelClass}>
            Salaire de base mensuel ({defaultCurrency})
          </label>
          <input
            type="number"
            min="0"
            step="0.001"
            disabled={!canEdit}
            value={baseSalary}
            onChange={(e) => setBaseSalary(e.target.value)}
            className={inputClass}
            placeholder="Utilisé pour la génération des bulletins"
          />
        </div>

        <div>
          <label className={labelClass}>Notes internes</label>
          <textarea
            rows={4}
            disabled={!canEdit}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className={`${inputClass} resize-y`}
            placeholder="Compétences, disponibilités, remarques…"
          />
        </div>

        {canEdit ? (
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-ink py-2.5 text-sm font-medium text-cream hover:bg-stone-800 disabled:opacity-60"
            >
              {saving ? "Enregistrement…" : employee ? "Enregistrer" : "Ajouter"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="border border-border px-4 py-2.5 text-sm text-muted hover:text-foreground"
            >
              Annuler
            </button>
          </div>
        ) : (
          <p className="text-xs text-muted">
            Vous avez un accès lecture seule au module RH.
          </p>
        )}
      </form>
    </Drawer>
  );
}
