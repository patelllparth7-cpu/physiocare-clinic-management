"use client";

import { useEffect, useState } from "react";
import { IndianRupee, Wallet, Calendar } from "lucide-react";

import { supabase } from "@/lib/supabase";

export default function PaymentsPage() {
  const [patients, setPatients] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [form, setForm] = useState({
    patientId: "",
    date: "",
    amount: "",
    mode: "Cash",
    notes: "",
  });

  useEffect(() => {
  fetchData();
}, []);

const fetchData = async () => {
  const { data: patientsData } = await supabase
    .from("patients")
    .select("*");

  const { data: paymentsData } = await supabase
    .from("payments")
    .select("*");

  setPatients(patientsData || []);

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

  const total = payments.reduce((s, p) => s + Number(p.amount || 0), 0);
  const selectedPatient = patients.find((p) => p.id === form.patientId);

  const savePayment = async () => {
    if (!selectedPatient || !form.date || !form.amount) return;

    const payment = {
      patientId: selectedPatient.id,
      patientName: selectedPatient.name,
      date: form.date,
      amount: form.amount,
      mode: form.mode,
      notes: form.notes,
    };

    const { error } = await supabase
  .from("payments")
  .insert([
    {
      patient_id: selectedPatient.id,
      patient_name: selectedPatient.name,
      date: form.date,
      amount: form.amount,
      mode: form.mode,
      notes: form.notes,
    },
  ]);

if (error) {
  alert(error.message);
  return;
}

await fetchData();

setForm({
  patientId: "",
  date: "",
  amount: "",
  mode: "Cash",
  notes: "",
});
  };

  return (
    <div className="space-y-8 text-slate-900">
<div
  className="rounded-[2rem] border border-emerald-500 p-8 shadow-lg"
  style={{
    background:
"linear-gradient(135deg, #064e3b, #065f46, #134e4a)"
  }}
>
  <p className="text-sm font-bold uppercase tracking-wider text-emerald-100">
    Payment Management
  </p>

  <h1 className="mt-2 text-4xl font-bold text-white">
    Payment Records
  </h1>

  <p className="mt-3 text-emerald-50">
    Track clinic collection and patient-wise payments.
  </p>

  <div className="mt-5 inline-flex rounded-full bg-white/20 px-4 py-2 text-sm font-bold text-white backdrop-blur">
    Total Collection ₹{total}
  </div>
</div>
      <div className="grid grid-cols-3 gap-6">
        <Card title="Total Collection" value={`₹${total}`} icon={IndianRupee} />
        <Card title="Payment Entries" value={payments.length} icon={Wallet} />
        <Card title="Patients" value={patients.length} icon={Calendar} />
      </div>

      <div className="rounded-3xl border bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-bold">Add Payment</h2>

        <div className="mt-6 grid grid-cols-2 gap-5">
          <select
            value={form.patientId}
            onChange={(e) => setForm({ ...form, patientId: e.target.value })}
            className="rounded-2xl border bg-slate-50 p-3 outline-none focus:border-green-500"
          >
            <option value="">Select Patient</option>
            {patients.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>

          <Input placeholder="Date e.g. 06 Jul" value={form.date} onChange={(v: string) => setForm({ ...form, date: v })} />
          <Input placeholder="Amount e.g. 500" value={form.amount} onChange={(v: string) => setForm({ ...form, amount: v })} />

          <select
            value={form.mode}
            onChange={(e) => setForm({ ...form, mode: e.target.value })}
            className="rounded-2xl border bg-slate-50 p-3 outline-none focus:border-green-500"
          >
            <option>Cash</option>
            <option>UPI</option>
            <option>Card</option>
          </select>

          <textarea
            placeholder="Notes"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            className="col-span-2 min-h-24 rounded-2xl border bg-slate-50 p-3 outline-none focus:border-green-500"
          />
        </div>

        <button onClick={savePayment} className="mt-6 rounded-2xl bg-green-600 px-6 py-3 font-bold text-white">
          Save Payment
        </button>
      </div>

      <div className="rounded-3xl border bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-bold">Payment History</h2>
        <div className="mt-5 overflow-hidden rounded-2xl border">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="p-4">Date</th>
                <th className="p-4">Patient</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Mode</th>
                <th className="p-4">Notes</th>
              </tr>
            </thead>
            <tbody>
              {payments.length === 0 ? (
                <tr><td className="p-4 text-slate-500" colSpan={5}>No payments yet.</td></tr>
              ) : payments.slice().reverse().map((p, i) => (
                <tr key={i} className="border-t">
                  <td className="p-4">{p.date}</td>
                  <td className="p-4 font-semibold">{p.patientName}</td>
                  <td className="p-4 font-bold text-green-700">₹{p.amount}</td>
                  <td className="p-4">{p.mode}</td>
                  <td className="p-4">{p.notes || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function Input({ placeholder, value, onChange }: any) {
  return <input placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} className="rounded-2xl border bg-slate-50 p-3 outline-none focus:border-green-500" />;
}

function Card({ title, value, icon: Icon }: any) {
  return (
    <div className="rounded-3xl border bg-white p-6 shadow-sm">
      <Icon className="text-green-600" />
      <p className="mt-3 text-sm text-slate-500">{title}</p>
      <h2 className="text-3xl font-bold">{value}</h2>
    </div>
  );
}