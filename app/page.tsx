"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import StatCard from "@/components/StatCard";
import RevenueChart from "@/components/RevenueChart";

import {
  IndianRupee,
  Calendar,
  TrendingUp,
  Users,
  UserCheck,
  UserX,
} from "lucide-react";

type Patient = {
  id: string;
  name: string;
  disease: string;
  mobile: string;
  pain: string;
  status: string;
  last: string;
  initial: string;
};

type Payment = {
  patientId: string;
  patientName: string;
  date: string;
  amount: string;
  mode: string;
  notes: string;
};

type Treatment = {
  patientId: string;
  patientName: string;
  date: string;
  pain: string;
  treatment: string;
  payment: string;
  remarks: string;
};

type Attendance = {
  patientId: string;
  patientName: string;
  date: string;
  status: string;
  notes: string;
};

export default function Home() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);

  useEffect(() => {
    setPatients(JSON.parse(localStorage.getItem("patientsData") || "[]"));
    setPayments(JSON.parse(localStorage.getItem("paymentsData") || "[]"));
    setTreatments(JSON.parse(localStorage.getItem("treatmentsData") || "[]"));
    setAttendance(JSON.parse(localStorage.getItem("attendanceData") || "[]"));
  }, []);

  const totalRevenue = payments.reduce(
    (sum, p) => sum + Number(p.amount || 0),
    0
  );

  const activePatients = patients.filter((p) => p.status === "Active").length;
  const absentToday = attendance.filter((a) => a.status === "Absent").length;

  const presentCount = attendance.filter((a) => a.status === "Present").length;
  const attendanceRate =
    attendance.length > 0
      ? Math.round((presentCount / attendance.length) * 100)
      : 0;

  const recentPatients = patients.slice(-5).reverse();
  const recentPayments = payments.slice(-4).reverse();
  const recentTreatments = treatments.slice(-3).reverse();

  const revenueChartData = useMemo(() => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];

    return months.map((month) => ({
      month,
      revenue:
        month === "Jun"
          ? totalRevenue
          : 0,
    }));
  }, [totalRevenue]);

  return (
    <div className="space-y-8">
      <div className="rounded-3xl bg-gradient-to-r from-blue-600 to-cyan-500 p-8 text-white shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-blue-100">
              Clinic Dashboard
            </p>

            <h1 className="text-4xl font-bold">Welcome back, Admin 👋</h1>

            <p className="mt-3 max-w-2xl text-blue-50">
              Track treatments, attendance, payments and patient recovery from one clean dashboard.
            </p>
          </div>

          <Link
            href="/patients"
            className="rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-blue-700 shadow-sm hover:bg-blue-50"
          >
            + Add Patient
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <StatCard
          title="Total Income"
          value={`₹${totalRevenue}`}
          icon={IndianRupee}
        />
        <StatCard
          title="Monthly Income"
          value={`₹${totalRevenue}`}
          icon={Calendar}
        />
        <StatCard
          title="Yearly Income"
          value={`₹${totalRevenue}`}
          icon={TrendingUp}
        />
        <StatCard
          title="Total Patients"
          value={`${patients.length}`}
          icon={Users}
        />
        <StatCard
          title="Active Patients"
          value={`${activePatients}`}
          icon={UserCheck}
        />
        <StatCard
          title="Absent Entries"
          value={`${absentToday}`}
          icon={UserX}
        />
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2">
          <RevenueChart />
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900">Recent Payments</h2>
          <p className="mt-1 text-sm text-slate-500">
            Latest treatment payment entries
          </p>

          <div className="mt-6 space-y-4">
            {recentPayments.length === 0 ? (
              <p className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">
                No payment records yet.
              </p>
            ) : (
              recentPayments.map((payment, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between rounded-2xl bg-slate-50 p-4"
                >
                  <div>
                    <p className="font-semibold text-slate-900">
                      {payment.patientName}
                    </p>
                    <p className="text-xs text-slate-500">{payment.date}</p>
                  </div>

                  <span className="rounded-xl bg-green-100 px-3 py-1 text-sm font-bold text-green-700">
                    ₹{payment.amount}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900">
            Recent Treatments
          </h2>

          <div className="mt-5 space-y-4">
            {recentTreatments.length === 0 ? (
              <p className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">
                No treatment entries yet.
              </p>
            ) : (
              recentTreatments.map((entry, index) => (
                <div key={index} className="rounded-2xl bg-slate-50 p-4">
                  <p className="font-semibold text-slate-900">
                    {entry.patientName}
                  </p>
                  <p className="text-sm text-slate-500">{entry.treatment}</p>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900">
            Attendance Summary
          </h2>

          <div className="mt-6">
            <div className="mb-4 flex justify-between">
              <span className="text-slate-500">Present</span>
              <span className="font-bold text-green-600">{presentCount}</span>
            </div>

            <div className="mb-4 flex justify-between">
              <span className="text-slate-500">Absent</span>
              <span className="font-bold text-red-500">{absentToday}</span>
            </div>

            <div className="mt-6 rounded-2xl bg-green-50 p-4 text-center">
              <p className="text-3xl font-bold text-green-700">
                {attendanceRate}%
              </p>
              <p className="text-sm text-green-600">Attendance Rate</p>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900">Quick Actions</h2>

          <div className="mt-5 space-y-3">
            <Link
              href="/patients"
              className="block w-full rounded-2xl bg-blue-600 py-3 text-center font-semibold text-white"
            >
              + Add Patient
            </Link>

            <Link
              href="/patients"
              className="block w-full rounded-2xl bg-slate-100 py-3 text-center font-semibold text-slate-700"
            >
              Daily Entry
            </Link>

            <Link
              href="/patients"
              className="block w-full rounded-2xl bg-slate-100 py-3 text-center font-semibold text-slate-700"
            >
              Payment Entry
            </Link>

            <Link
              href="/patients"
              className="block w-full rounded-2xl bg-slate-100 py-3 text-center font-semibold text-slate-700"
            >
              Attendance
            </Link>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              Recent Patients
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Recently added patient records
            </p>
          </div>

          <Link
            href="/patients"
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
          >
            View All
          </Link>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="p-4">Patient</th>
                <th className="p-4">Disease</th>
                <th className="p-4">Pain Score</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>

            <tbody className="text-slate-700">
              {recentPatients.length === 0 ? (
                <tr>
                  <td className="p-4 text-slate-500" colSpan={4}>
                    No patients added yet.
                  </td>
                </tr>
              ) : (
                recentPatients.map((patient) => (
                  <tr key={patient.id} className="border-t border-slate-100">
                    <td className="p-4 font-semibold text-slate-900">
                      {patient.name}
                    </td>
                    <td className="p-4">{patient.disease}</td>
                    <td className="p-4">{patient.pain}</td>
                    <td className="p-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold ${
                          patient.status === "Active"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-600"
                        }`}
                      >
                        {patient.status}
                      </span>
                    </td>
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