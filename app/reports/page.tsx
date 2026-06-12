"use client";

import { useEffect, useState } from "react";
import {
  IndianRupee,
  Users,
  UserCheck,
  Activity,
  CalendarCheck,
  UserX,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function ReportsPage() {
  const [patients, setPatients] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [treatments, setTreatments] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    const { data: patientsData } = await supabase.from("patients").select("*");

    const { data: paymentsData } = await supabase.from("payments").select("*");

    const { data: treatmentsData } = await supabase
      .from("treatments")
      .select("*");

    const { data: attendanceData } = await supabase
      .from("attendance")
      .select("*");

    setPatients(patientsData || []);

    setPayments(
      (paymentsData || []).map((p: any) => ({
        amount: p.amount,
        mode: p.mode,
        date: p.date,
        patientName: p.patient_name,
      }))
    );

    setTreatments(treatmentsData || []);

    setAttendance(attendanceData || []);
  };

  const totalRevenue = payments.reduce(
    (sum, payment) => sum + Number(payment.amount || 0),
    0
  );

  const activePatients = patients.filter(
    (patient) => patient.status === "Active"
  ).length;

  const inactivePatients = patients.filter(
    (patient) => patient.status === "Inactive"
  ).length;

  const present = attendance.filter((item) => item.status === "Present").length;
  const absent = attendance.filter((item) => item.status === "Absent").length;

  const attendanceRate = attendance.length
    ? Math.round((present / attendance.length) * 100)
    : 0;

  const diseaseCount: Record<string, number> = {};

  patients.forEach((patient) => {
    const disease = patient.disease || "Unknown";
    diseaseCount[disease] = (diseaseCount[disease] || 0) + 1;
  });

  const topDisease = Object.entries(diseaseCount).sort(
    (a, b) => b[1] - a[1]
  )[0];

  return (
    <div className="space-y-8 text-slate-900">
      <div
        className="rounded-[2rem] border border-indigo-500 p-8 shadow-lg"
        style={{
          background:
            "linear-gradient(135deg, #312e81, #4338ca, #0369a1)",
        }}
      >
        <p className="text-sm font-bold uppercase tracking-wider text-indigo-100">
          Reports & Analytics
        </p>

        <h1 className="mt-2 text-4xl font-bold text-white">
          Clinic Reports
        </h1>

        <p className="mt-3 max-w-2xl text-indigo-50">
          Business insights, revenue, attendance and patient analytics synced with Supabase.
        </p>
      </div>

      <div className="grid grid-cols-5 gap-6">
        <Card title="Revenue" value={`₹${totalRevenue}`} icon={IndianRupee} color="green" />
        <Card title="Patients" value={patients.length} icon={Users} color="blue" />
        <Card title="Active" value={activePatients} icon={UserCheck} color="emerald" />
        <Card title="Treatments" value={treatments.length} icon={Activity} color="purple" />
        <Card title="Attendance" value={`${attendanceRate}%`} icon={CalendarCheck} color="orange" />
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-bold">Top Disease</h2>

          <div className="mt-5 rounded-3xl bg-purple-50 p-6">
            <p className="text-sm font-semibold text-purple-600">
              Most common problem
            </p>

            <h3 className="mt-2 text-3xl font-bold text-purple-800">
              {topDisease ? topDisease[0] : "No data"}
            </h3>
          </div>
        </div>

        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-bold">Attendance Summary</h2>

          <div className="mt-5 grid grid-cols-2 gap-4">
            <MiniBox title="Present" value={present} color="green" />
            <MiniBox title="Absent" value={absent} color="red" />
          </div>

          <div className="mt-4 rounded-3xl bg-blue-50 p-5">
            <p className="text-sm font-semibold text-blue-600">Rate</p>
            <h3 className="mt-1 text-3xl font-bold text-blue-800">
              {attendanceRate}%
            </h3>
          </div>
        </div>

        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-bold">Patient Status</h2>

          <div className="mt-5 grid grid-cols-2 gap-4">
            <MiniBox title="Active" value={activePatients} color="green" />
            <MiniBox title="Inactive" value={inactivePatients} color="red" />
          </div>

          <div className="mt-4 rounded-3xl bg-slate-50 p-5">
            <p className="text-sm font-semibold text-slate-600">
              Total Patients
            </p>
            <h3 className="mt-1 text-3xl font-bold text-slate-900">
              {patients.length}
            </h3>
          </div>
        </div>
      </div>

      <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-bold">Detailed Summary</h2>

        <div className="mt-5 grid grid-cols-2 gap-4">
          <Row label="Total Payments" value={payments.length} />
          <Row label="Treatment Entries" value={treatments.length} />
          <Row label="Attendance Records" value={attendance.length} />
          <Row label="Inactive Patients" value={inactivePatients} />
          <Row label="Active Patients" value={activePatients} />
          <Row label="Total Revenue" value={`₹${totalRevenue}`} />
        </div>
      </div>
    </div>
  );
}

function Card({
  title,
  value,
  icon: Icon,
  color,
}: {
  title: string;
  value: string | number;
  icon: any;
  color: "green" | "blue" | "emerald" | "purple" | "orange";
}) {
  const styles = {
    green: "bg-green-50 text-green-700",
    blue: "bg-blue-50 text-blue-700",
    emerald: "bg-emerald-50 text-emerald-700",
    purple: "bg-purple-50 text-purple-700",
    orange: "bg-orange-50 text-orange-700",
  };

  return (
    <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500">{title}</p>
          <h2 className="mt-2 text-2xl font-bold">{value}</h2>
        </div>

        <div className={`rounded-2xl p-3 ${styles[color]}`}>
          <Icon size={22} />
        </div>
      </div>
    </div>
  );
}

function MiniBox({
  title,
  value,
  color,
}: {
  title: string;
  value: string | number;
  color: "green" | "red";
}) {
  const styles = {
    green: "bg-green-50 text-green-700",
    red: "bg-red-50 text-red-600",
  };

  return (
    <div className={`rounded-3xl p-5 text-center ${styles[color]}`}>
      <p className="text-3xl font-bold">{value}</p>
      <p className="mt-1 text-sm font-semibold">{title}</p>
    </div>
  );
}

function Row({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="flex justify-between rounded-2xl bg-slate-50 p-4">
      <span className="font-medium text-slate-600">{label}</span>
      <span className="font-bold text-slate-900">{value}</span>
    </div>
  );
}