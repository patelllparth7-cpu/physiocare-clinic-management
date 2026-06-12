"use client";

import { useEffect, useState } from "react";
import {
  CalendarCheck,
  UserCheck,
  UserX,
  Save,
  Search,
  Activity,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function AttendancePage() {
  const [patients, setPatients] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [search, setSearch] = useState("");

  const [form, setForm] = useState({
    patientId: "",
    date: "",
    status: "Present",
    notes: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const { data: patientsData } = await supabase.from("patients").select("*");

    const { data: attendanceData } = await supabase
      .from("attendance")
      .select("*")
      .order("created_at", { ascending: false });

    setPatients(patientsData || []);

    setAttendance(
      (attendanceData || []).map((a: any) => ({
        patientId: a.patient_id,
        patientName: a.patient_name,
        date: a.date,
        status: a.status,
        notes: a.notes,
      }))
    );
  };

  const selectedPatient = patients.find((p) => p.id === form.patientId);

  const present = attendance.filter((a) => a.status === "Present").length;
  const absent = attendance.filter((a) => a.status === "Absent").length;
  const rate = attendance.length
    ? Math.round((present / attendance.length) * 100)
    : 0;

  const filteredAttendance = attendance.filter((item) => {
    const q = search.toLowerCase();

    return (
      item.patientName?.toLowerCase().includes(q) ||
      item.date?.toLowerCase().includes(q) ||
      item.status?.toLowerCase().includes(q)
    );
  });

  const saveAttendance = async () => {
    if (!selectedPatient || !form.date) return;

    const { error } = await supabase.from("attendance").insert([
      {
        patient_id: selectedPatient.id,
        patient_name: selectedPatient.name,
        date: form.date,
        status: form.status,
        notes: form.notes || "-",
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
      status: "Present",
      notes: "",
    });
  };

  return (
    <div className="space-y-8 text-slate-900">
      <div className="relative overflow-hidden rounded-[2rem] bg-orange-500 p-8 text-white shadow-sm">
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10" />
        <div className="absolute bottom-0 right-28 h-28 w-28 rounded-full bg-white/10" />

        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-wider text-orange-100">
              Attendance Desk
            </p>

            <h1 className="mt-2 text-4xl font-bold">Patient Attendance</h1>

            <p className="mt-3 max-w-2xl text-orange-50">
              Track present, absent and patient attendance performance from one professional dashboard.
            </p>
          </div>

          <div className="rounded-3xl bg-white/15 p-5 text-right backdrop-blur">
            <p className="text-sm text-orange-100">Attendance Rate</p>
            <h2 className="text-4xl font-bold">{rate}%</h2>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-6">
        <Metric title="Present" value={present} icon={UserCheck} color="green" />
        <Metric title="Absent" value={absent} icon={UserX} color="red" />
        <Metric title="Total Records" value={attendance.length} icon={CalendarCheck} color="blue" />
        <Metric title="Active Patients" value={patients.filter((p) => p.status === "Active").length} icon={Activity} color="orange" />
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Mark Attendance</h2>
              <p className="mt-1 text-sm text-slate-500">
                Select patient and mark today&apos;s attendance.
              </p>
            </div>

            <span className="rounded-full bg-orange-50 px-4 py-2 text-xs font-bold text-orange-700">
              Manual Entry
            </span>
          </div>

          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Patient
              </label>

              <select
                value={form.patientId}
                onChange={(e) =>
                  setForm({ ...form, patientId: e.target.value })
                }
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 text-slate-900 placeholder:text-slate-400 outline-none focus:border-orange-500 focus:bg-white"
              >
                <option value="">Select Patient</option>
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} • {p.disease || "No disease"}
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

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Status
              </label>

              <select
                value={form.status}
                onChange={(e) =>
                  setForm({ ...form, status: e.target.value })
                }
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 text-slate-900 placeholder:text-slate-400 outline-none focus:border-orange-500 focus:bg-white"
              >
                <option>Present</option>
                <option>Absent</option>
              </select>
            </div>

            <Field
              label="Notes"
              placeholder="Example: Late, regular, absent reason..."
              value={form.notes}
              onChange={(value) => setForm({ ...form, notes: value })}
            />
          </div>

          <button
            onClick={saveAttendance}
            className="mt-6 flex items-center gap-2 rounded-2xl bg-orange-500 px-6 py-3 font-bold text-white shadow-sm hover:bg-orange-600"
          >
            <Save size={18} />
            Save Attendance
          </button>
        </div>

        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold">Selected Patient</h2>

          {!selectedPatient ? (
            <div className="mt-6 rounded-3xl bg-slate-50 p-6 text-center text-sm text-slate-500">
              Select a patient to preview attendance details.
            </div>
          ) : (
            <div className="mt-6 space-y-5">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-orange-100 text-2xl font-bold text-orange-700">
                  {selectedPatient.initial || selectedPatient.name.charAt(0)}
                </div>

                <div>
                  <h3 className="text-xl font-bold">{selectedPatient.name}</h3>
                  <p className="text-sm text-slate-500">
                    {selectedPatient.disease || "-"}
                  </p>
                </div>
              </div>

              <div className="rounded-3xl bg-green-50 p-5">
                <p className="text-sm font-semibold text-green-600">
                  Patient Status
                </p>
                <h2 className="mt-1 text-2xl font-bold text-green-700">
                  {selectedPatient.status || "Active"}
                </h2>
              </div>

              <div className="rounded-3xl bg-blue-50 p-5">
                <p className="text-sm font-semibold text-blue-600">
                  Current Pain
                </p>
                <h2 className="mt-1 text-2xl font-bold text-blue-700">
                  {selectedPatient.pain || "0/10"}
                </h2>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Attendance History</h2>
            <p className="mt-1 text-sm text-slate-500">
              Latest attendance records synced with Supabase.
            </p>
          </div>

          <div className="relative">
            <Search
              size={17}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search attendance..."
              className="rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm outline-none focus:border-orange-500 focus:bg-white"
            />
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="p-4">Date</th>
                <th className="p-4">Patient</th>
                <th className="p-4">Status</th>
                <th className="p-4">Notes</th>
              </tr>
            </thead>

            <tbody>
              {filteredAttendance.length === 0 ? (
                <tr>
                  <td className="p-5 text-slate-500" colSpan={4}>
                    No attendance records found.
                  </td>
                </tr>
              ) : (
                filteredAttendance.map((a, index) => (
                  <tr key={index} className="border-t hover:bg-slate-50">
                    <td className="p-4">{a.date}</td>

                    <td className="p-4 font-semibold">{a.patientName}</td>

                    <td className="p-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold ${
                          a.status === "Present"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-600"
                        }`}
                      >
                        {a.status}
                      </span>
                    </td>

                    <td className="p-4">{a.notes || "-"}</td>
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
  color: "green" | "red" | "blue" | "orange";
}) {
  const styles = {
    green: "bg-green-50 text-green-700",
    red: "bg-red-50 text-red-700",
    blue: "bg-blue-50 text-blue-700",
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

function Field({
  label,
  placeholder,
  value,
  onChange,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
      </label>

      <input
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 text-slate-900 placeholder:text-slate-400 outline-none focus:border-orange-500 focus:bg-white"
      />
    </div>
  );
}