"use client";

import { useEffect, useState } from "react";
import {
  Download,
  Upload,
  Save,
  Building2,
  ShieldCheck,
  Database,
  CheckCircle2,
} from "lucide-react";

export default function SettingsPage() {
  const [clinic, setClinic] = useState({
    clinicName: "",
    doctorName: "",
    mobile: "",
    address: "",
  });

  useEffect(() => {
    const saved = localStorage.getItem("clinicSettings");

    if (saved) {
      setClinic(JSON.parse(saved));
    }
  }, []);

  const saveClinicSettings = () => {
    localStorage.setItem("clinicSettings", JSON.stringify(clinic));
    alert("Clinic Settings Saved");
  };

  const exportBackup = () => {
    const backup = {
      clinicSettings: JSON.parse(localStorage.getItem("clinicSettings") || "{}"),
      patients: JSON.parse(localStorage.getItem("patientsData") || "[]"),
      treatments: JSON.parse(localStorage.getItem("treatmentsData") || "[]"),
      payments: JSON.parse(localStorage.getItem("paymentsData") || "[]"),
      attendance: JSON.parse(localStorage.getItem("attendanceData") || "[]"),
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(backup, null, 2)], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");

    a.href = url;
    a.download = "physiocare-backup.json";
    a.click();
  };

  const importBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);

        localStorage.setItem(
          "clinicSettings",
          JSON.stringify(data.clinicSettings || {})
        );
        localStorage.setItem("patientsData", JSON.stringify(data.patients || []));
        localStorage.setItem(
          "treatmentsData",
          JSON.stringify(data.treatments || [])
        );
        localStorage.setItem("paymentsData", JSON.stringify(data.payments || []));
        localStorage.setItem(
          "attendanceData",
          JSON.stringify(data.attendance || [])
        );

        if (data.clinicSettings) {
          setClinic(data.clinicSettings);
        }

        alert("Backup restored successfully");
      } catch {
        alert("Invalid backup file");
      }
    };

    reader.readAsText(file);
  };

  return (
    <div className="space-y-8 text-slate-900">
      <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-r from-blue-700 via-indigo-600 to-cyan-500 p-8 text-white shadow-sm">
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10" />
        <div className="absolute bottom-0 right-24 h-28 w-28 rounded-full bg-white/10" />

        <p className="text-sm font-bold uppercase tracking-wider text-blue-100">
          System Settings
        </p>

        <h1 className="mt-2 text-4xl font-bold">Clinic Settings</h1>

        <p className="mt-3 max-w-2xl text-blue-50">
          Manage clinic profile, backup data and basic system preferences from one secure place.
        </p>
      </div>

      <div className="grid grid-cols-4 gap-6">
        <InfoCard title="Backup Status" value="Ready" icon={ShieldCheck} />
        <InfoCard title="Storage Type" value="Local" icon={Database} />
        <InfoCard title="Clinic Profile" value="Saved" icon={Building2} />
        <InfoCard title="Data Safety" value="Manual Backup" icon={CheckCircle2} />
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-blue-50 p-3 text-blue-700">
                <Building2 size={24} />
              </div>

              <div>
                <h2 className="text-2xl font-bold">Clinic Information</h2>
                <p className="text-sm text-slate-500">
                  These details will be used later in reports and receipts.
                </p>
              </div>
            </div>

            <span className="rounded-full bg-blue-50 px-4 py-2 text-xs font-bold text-blue-700">
              Profile
            </span>
          </div>

          <div className="grid grid-cols-2 gap-5">
            <Field
              label="Clinic Name"
              value={clinic.clinicName}
              placeholder="Shreeji Physiotherapy Clinic"
              onChange={(value) => setClinic({ ...clinic, clinicName: value })}
            />

            <Field
              label="Doctor Name"
              value={clinic.doctorName}
              placeholder="Dr. Name"
              onChange={(value) => setClinic({ ...clinic, doctorName: value })}
            />

            <Field
              label="Mobile Number"
              value={clinic.mobile}
              placeholder="+91 98765 43210"
              onChange={(value) => setClinic({ ...clinic, mobile: value })}
            />

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Version
              </label>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm font-semibold text-slate-500">
                PhysioCare v1.0
              </div>
            </div>

            <div className="col-span-2">
              <TextArea
                label="Clinic Address"
                value={clinic.address}
                placeholder="Clinic full address..."
                onChange={(value) => setClinic({ ...clinic, address: value })}
              />
            </div>
          </div>

          <button
            onClick={saveClinicSettings}
            className="mt-6 flex items-center gap-2 rounded-2xl bg-blue-600 px-6 py-3 font-bold text-white shadow-sm hover:bg-blue-700"
          >
            <Save size={18} />
            Save Clinic Settings
          </button>
        </div>

        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="rounded-3xl bg-gradient-to-r from-green-50 to-emerald-50 p-5">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-green-100 p-3 text-green-700">
                <Database size={24} />
              </div>

              <div>
                <h2 className="text-xl font-bold">Data Backup</h2>
                <p className="text-sm text-slate-500">
                  Export or restore clinic records.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <button
              onClick={exportBackup}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-green-600 py-4 font-bold text-white shadow-sm hover:bg-green-700"
            >
              <Download size={18} />
              Export Backup
            </button>

            <label className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-orange-500 py-4 font-bold text-white shadow-sm hover:bg-orange-600">
              <Upload size={18} />
              Import Backup

              <input type="file" accept=".json" onChange={importBackup} hidden />
            </label>
          </div>

          <div className="mt-6 rounded-3xl bg-slate-50 p-5">
            <p className="text-sm font-bold text-slate-700">Backup includes</p>

            <div className="mt-4 space-y-3 text-sm font-medium text-slate-600">
              <CheckRow label="Clinic Settings" />
              <CheckRow label="Patient Records" />
              <CheckRow label="Treatment Entries" />
              <CheckRow label="Payment Records" />
              <CheckRow label="Attendance History" />
            </div>
          </div>

          <div className="mt-5 rounded-3xl border border-dashed border-slate-300 p-5">
            <p className="text-sm font-semibold text-slate-700">
              Recommendation
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Take backup daily before closing clinic.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoCard({
  title,
  value,
  icon: Icon,
}: {
  title: string;
  value: string;
  icon: any;
}) {
  return (
    <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500">{title}</p>
          <h2 className="mt-2 text-xl font-bold">{value}</h2>
        </div>

        <div className="rounded-2xl bg-blue-50 p-3 text-blue-700">
          <Icon size={22} />
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  placeholder,
  onChange,
}: {
  label: string;
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
      </label>

      <input
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 outline-none focus:border-blue-500 focus:bg-white"
      />
    </div>
  );
}

function TextArea({
  label,
  value,
  placeholder,
  onChange,
}: {
  label: string;
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
      </label>

      <textarea
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="min-h-28 w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 outline-none focus:border-blue-500 focus:bg-white"
      />
    </div>
  );
}

function CheckRow({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2">
      <CheckCircle2 size={16} className="text-green-600" />
      <span>{label}</span>
    </div>
  );
}