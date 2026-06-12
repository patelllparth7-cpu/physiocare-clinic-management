"use client";

import { useEffect, useState } from "react";
import {
  ClipboardList,
  Search,
  UserCheck,
  IndianRupee,
  Activity,
  Save,
} from "lucide-react";

import { supabase } from "@/lib/supabase";

type Patient = {
  id: string;
  name: string;
  disease: string;
  status: string;
  pain?: string;
  initial?: string;
  last?: string;
};

type TreatmentEntry = {
  patientId: string;
  patientName: string;
  date: string;
  pain: string;
  treatment: string;
  payment: string;
  remarks: string;
};

type PaymentEntry = {
  patientId: string;
  patientName: string;
  date: string;
  amount: string;
  mode: string;
  notes: string;
};

type CombinedEntry = {
  date: string;
  patientName: string;
  pain: string;
  treatment: string;
  payment: string;
  remarks: string;
  type: "Treatment" | "Payment";
};

type FieldProps = {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
};

export default function TreatmentPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [entries, setEntries] = useState<TreatmentEntry[]>([]);
  const [payments, setPayments] = useState<PaymentEntry[]>([]);
  const [search, setSearch] = useState("");

  const [form, setForm] = useState({
    patientId: "",
    date: "",
    pain: "",
    treatment: "",
    payment: "",
    remarks: "",
  });

 useEffect(() => {
  fetchData();
}, []);

const fetchData = async () => {
  const { data: patientsData } = await supabase
    .from("patients")
    .select("*");

  const { data: treatmentsData } = await supabase
    .from("treatments")
    .select("*");

  const { data: paymentsData } = await supabase
    .from("payments")
    .select("*");

  setPatients(patientsData || []);

  setEntries(
    (treatmentsData || []).map((t: any) => ({
      patientId: t.patient_id,
      patientName: t.patient_name,
      date: t.date,
      pain: t.pain,
      treatment: t.treatment,
      payment: t.payment,
      remarks: t.remarks,
    }))
  );

  setPayments(
    (paymentsData || []).map((p: any) => ({
      patientId: p.patient_id,
      patientName: p.patient_name,
      date: p.date,
      amount: p.amount,
      mode: p.mode,
      notes: p.notes,
    }))
  );
};

  const selectedPatient = patients.find((p) => p.id === form.patientId);
  const activePatients = patients.filter((p) => p.status === "Active");

 const treatmentPaymentKeys = new Set(
  entries
    .filter((entry) => Number(entry.payment || 0) > 0)
    .map(
      (entry) =>
        `${entry.patientId}-${entry.date}-${entry.payment}`
    )
);
 
  const combinedEntries: CombinedEntry[] = [
    ...entries.map((entry) => ({
      date: entry.date,
      patientName: entry.patientName,
      pain: entry.pain || "-",
      treatment: entry.treatment || "-",
      payment: entry.payment || "0",
      remarks: entry.remarks || "-",
      type: "Treatment" as const,
    })),

    

   ...payments
  .filter(
    (payment) =>
      !treatmentPaymentKeys.has(
        `${payment.patientId}-${payment.date}-${payment.amount}`
      )
  )
  .map((payment) => ({
    date: payment.date,
    patientName: payment.patientName,
    pain: "-",
    treatment: "-",
    payment: payment.amount || "0",
    remarks: payment.notes || "Payment entry",
    type: "Payment" as const,
  })),
  ];

  const filteredEntries = combinedEntries.filter((entry) => {
    const q = search.toLowerCase();

    return (
      entry.patientName?.toLowerCase().includes(q) ||
      entry.date?.toLowerCase().includes(q) ||
      entry.treatment?.toLowerCase().includes(q) ||
      entry.type?.toLowerCase().includes(q)
    );
  });

 const saveEntry = async () => {
  if (!selectedPatient || !form.date || !form.treatment) return;

  const entry: TreatmentEntry = {
    patientId: selectedPatient.id,
    patientName: selectedPatient.name,
    date: form.date,
    pain: form.pain || selectedPatient.pain || "0/10",
    treatment: form.treatment,
    payment: form.payment || "0",
    remarks: form.remarks || "-",
  };

  const { error: treatmentError } = await supabase
    .from("treatments")
    .insert([
      {
        patient_id: entry.patientId,
        patient_name: entry.patientName,
        date: entry.date,
        pain: entry.pain,
        treatment: entry.treatment,
        payment: entry.payment,
        remarks: entry.remarks,
      },
    ]);

  if (treatmentError) {
    alert(treatmentError.message);
    return;
  }

  if (form.payment) {
    const { error: paymentError } = await supabase
      .from("payments")
      .insert([
        {
          patient_id: selectedPatient.id,
          patient_name: selectedPatient.name,
          date: form.date,
          amount: form.payment,
          mode: "Cash",
          notes: "Treatment payment",
        },
      ]);

    if (paymentError) {
      alert(paymentError.message);
      return;
    }
  }

  const { error: attendanceError } = await supabase
    .from("attendance")
    .insert([
      {
        patient_id: selectedPatient.id,
        patient_name: selectedPatient.name,
        date: form.date,
        status: "Present",
        notes: "Auto marked from treatment",
      },
    ]);

  if (attendanceError) {
    alert(attendanceError.message);
    return;
  }

  await supabase
    .from("patients")
    .update({
      pain: entry.pain,
    })
    .eq("id", selectedPatient.id);

  await fetchData();

  setForm({
    patientId: "",
    date: "",
    pain: "",
    treatment: "",
    payment: "",
    remarks: "",
  });
};

const totalCollection = payments.reduce(
  (sum, payment) => sum + Number(payment.amount || 0),
  0
);

  return (
    <div className="space-y-8 text-slate-900">
      <div className="rounded-[2rem] bg-gradient-to-r from-blue-700 via-blue-600 to-cyan-500 p-8 text-white shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-wider text-blue-100">
              Treatment Desk
            </p>

            <h1 className="mt-2 text-4xl font-bold">
              Daily Treatment Entry
            </h1>

            <p className="mt-3 max-w-2xl text-blue-50">
              Record treatment, pain score, payment and attendance from one premium workflow.
            </p>
          </div>

          <div className="rounded-3xl bg-white/15 p-5 text-right backdrop-blur">
            <p className="text-sm text-blue-100">Total Records</p>
            <h2 className="text-4xl font-bold">{combinedEntries.length}</h2>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-6">
        <Metric
          title="Treatments"
          value={entries.length}
          icon={ClipboardList}
          color="blue"
        />

        <Metric
          title="Active Patients"
          value={activePatients.length}
          icon={UserCheck}
          color="green"
        />

        <Metric
          title="Total Collection"
          value={`₹${totalCollection}`}
          icon={IndianRupee}
          color="emerald"
        />

        <Metric
          title="Last Pain"
          value={entries.length ? entries[entries.length - 1].pain : "0/10"}
          icon={Activity}
          color="orange"
        />
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">New Treatment Session</h2>
              <p className="mt-1 text-sm text-slate-500">
                Select patient and add today&apos;s clinical session.
              </p>
            </div>

            <span className="rounded-full bg-blue-50 px-4 py-2 text-xs font-bold text-blue-700">
              Auto Attendance
            </span>
          </div>

          <div className="grid grid-cols-2 gap-5">
            <div className="col-span-2">
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Patient
              </label>

              <select
                value={form.patientId}
                onChange={(e) =>
                  setForm({ ...form, patientId: e.target.value })
                }
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 outline-none focus:border-blue-500 focus:bg-white"
              >
                <option value="">Select Active Patient</option>

                {activePatients.map((patient) => (
                  <option key={patient.id} value={patient.id}>
                    {patient.name} • {patient.disease}
                  </option>
                ))}
              </select>
            </div>

            <Field
              label="Date"
              placeholder="06 Jul"
              value={form.date}
              onChange={(value) => setForm({ ...form, date: value })}
            />

            <Field
              label="Pain Score"
              placeholder="5/10"
              value={form.pain}
              onChange={(value) => setForm({ ...form, pain: value })}
            />

            <Field
              label="Payment Received"
              placeholder="500"
              value={form.payment}
              onChange={(value) => setForm({ ...form, payment: value })}
            />

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Payment Mode
              </label>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm font-semibold text-slate-500">
                Cash
              </div>
            </div>

            <TextArea
              label="Treatment Done Today"
              value={form.treatment}
              onChange={(value) => setForm({ ...form, treatment: value })}
              placeholder="IFT + Ultrasound + Stretching + Exercise"
            />

            <TextArea
              label="Remarks / Progress Notes"
              value={form.remarks}
              onChange={(value) => setForm({ ...form, remarks: value })}
              placeholder="Pain reduced, ROM improved, home exercise advised..."
            />
          </div>

          <button
            onClick={saveEntry}
            className="mt-6 flex items-center gap-2 rounded-2xl bg-blue-600 px-6 py-3 font-bold text-white shadow-sm hover:bg-blue-700"
          >
            <Save size={18} />
            Save Treatment Session
          </button>
        </div>

        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold">Selected Patient</h2>

          {!selectedPatient ? (
            <div className="mt-6 rounded-3xl bg-slate-50 p-6 text-center text-sm text-slate-500">
              Select a patient to preview details.
            </div>
          ) : (
            <div className="mt-6 space-y-5">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-blue-100 text-2xl font-bold text-blue-700">
                  {selectedPatient.initial || selectedPatient.name.charAt(0)}
                </div>

                <div>
                  <h3 className="text-xl font-bold">{selectedPatient.name}</h3>
                  <p className="text-sm text-slate-500">
                    {selectedPatient.disease}
                  </p>
                </div>
              </div>

              <div className="rounded-3xl bg-orange-50 p-5">
                <p className="text-sm font-semibold text-orange-600">
                  Current Pain
                </p>

                <h2 className="mt-1 text-3xl font-bold text-orange-700">
                  {selectedPatient.pain || "0/10"}
                </h2>
              </div>

              <div className="rounded-3xl bg-blue-50 p-5">
                <p className="text-sm font-semibold text-blue-600">Status</p>

                <h2 className="mt-1 text-xl font-bold text-blue-700">
                  {selectedPatient.status}
                </h2>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Treatment & Payment Records</h2>
            <p className="mt-1 text-sm text-slate-500">
              Treatment entries and standalone payment records in one timeline.
            </p>
          </div>

          <div className="relative">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              size={17}
            />

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search records..."
              className="rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm outline-none"
            />
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="p-4">Type</th>
                <th className="p-4">Date</th>
                <th className="p-4">Patient</th>
                <th className="p-4">Pain</th>
                <th className="p-4">Treatment</th>
                <th className="p-4">Payment</th>
                <th className="p-4">Remarks</th>
              </tr>
            </thead>

            <tbody>
              {filteredEntries.length === 0 ? (
                <tr>
                  <td className="p-5 text-slate-500" colSpan={7}>
                    No treatment or payment records yet.
                  </td>
                </tr>
              ) : (
                filteredEntries
                  .slice()
                  .reverse()
                  .map((entry, index) => (
                    <tr key={index} className="border-t hover:bg-slate-50">
                      <td className="p-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-bold ${
                            entry.type === "Treatment"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-green-100 text-green-700"
                          }`}
                        >
                          {entry.type}
                        </span>
                      </td>

                      <td className="p-4">{entry.date}</td>

                      <td className="p-4 font-semibold">
                        {entry.patientName}
                      </td>

                      <td className="p-4">
                        <span className="rounded-xl bg-orange-50 px-3 py-1 text-xs font-bold text-orange-700">
                          {entry.pain}
                        </span>
                      </td>

                      <td className="p-4">{entry.treatment}</td>

                      <td className="p-4 font-bold text-green-700">
                        ₹{entry.payment || 0}
                      </td>

                      <td className="p-4">{entry.remarks}</td>
                    </tr>
                  ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function Metric({
  title,
  value,
  icon: Icon,
  color,
}: {
  title: string;
  value: string | number;
  icon: any;
  color: "blue" | "green" | "emerald" | "orange";
}) {
  const styles = {
    blue: "bg-blue-50 text-blue-700",
    green: "bg-green-50 text-green-700",
    emerald: "bg-emerald-50 text-emerald-700",
    orange: "bg-orange-50 text-orange-700",
  };

  return (
    <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <h2 className="mt-2 text-3xl font-bold">{value}</h2>
        </div>

        <div
          className={`flex h-12 w-12 items-center justify-center rounded-2xl ${styles[color]}`}
        >
          <Icon size={24} />
        </div>
      </div>
    </div>
  );
}

function Field({ label, placeholder, value, onChange }: FieldProps) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
      </label>

      <input
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 outline-none focus:border-blue-500 focus:bg-white"
      />
    </div>
  );
}

function TextArea({ label, placeholder, value, onChange }: FieldProps) {
  return (
    <div className="col-span-2">
      <label className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
      </label>

      <textarea
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="min-h-24 w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 outline-none focus:border-blue-500 focus:bg-white"
      />
    </div>
  );
}