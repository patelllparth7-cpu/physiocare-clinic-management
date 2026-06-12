"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { X } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { supabase } from "@/lib/supabase";

export default function PatientProfilePage() {
  const params = useParams();
  const patientId = String(params.id);

  const [patient, setPatient] = useState<any>(null);
  const [dailyOpen, setDailyOpen] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [attendanceOpen, setAttendanceOpen] = useState(false);

  const [editTreatment, setEditTreatment] = useState<any>(null);
const [editTreatmentOpen, setEditTreatmentOpen] = useState(false);

const [editTreatmentForm, setEditTreatmentForm] = useState({
  date: "",
  pain: "",
  treatment: "",
  payment: "",
  remarks: "",
});

  const [entries, setEntries] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);

  const [dailyForm, setDailyForm] = useState({
    date: "",
    pain: "",
    treatment: "",
    payment: "",
    remarks: "",
  });

  const [paymentForm, setPaymentForm] = useState({
    date: "",
    amount: "",
    mode: "Cash",
    notes: "",
  });

  const [attendanceForm, setAttendanceForm] = useState({
    date: "",
    status: "Present",
    notes: "",
  });

  useEffect(() => {
  loadPatientData();
}, [patientId]);

const loadPatientData = async () => {
  const { data: patientData } = await supabase
    .from("patients")
    .select("*")
    .eq("id", patientId)
    .single();

  const { data: treatmentData } = await supabase
    .from("treatments")
    .select("*")
    .eq("patient_id", patientId);

  const { data: paymentData } = await supabase
    .from("payments")
    .select("*")
    .eq("patient_id", patientId);

  const { data: attendanceData } = await supabase
    .from("attendance")
    .select("*")
    .eq("patient_id", patientId);

  setPatient(patientData || null);

  setEntries(
    (treatmentData || []).map((t: any) => ({
      id: t.id,
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
    (paymentData || []).map((p: any) => ({
      id: p.id,
      patientId: p.patient_id,
      patientName: p.patient_name,
      date: p.date,
      amount: p.amount,
      mode: p.mode,
      notes: p.notes,
    }))
  );

  setAttendance(
    (attendanceData || []).map((a: any) => ({
      id: a.id,
      patientId: a.patient_id,
      patientName: a.patient_name,
      date: a.date,
      status: a.status,
      notes: a.notes,
    }))
  );
};

  const totalPaid = payments.reduce(
    (sum, payment) => sum + Number(payment.amount || 0),
    0
  );

  const currentPain =
    entries[entries.length - 1]?.pain || patient?.pain || "0/10";

  const presentCount = attendance.filter((a) => a.status === "Present").length;
  const absentCount = attendance.filter((a) => a.status === "Absent").length;

  const attendanceRate =
    attendance.length > 0
      ? Math.round((presentCount / attendance.length) * 100)
      : 0;

      const downloadPatientReport = () => {
  if (!patient) return;

  const clinicSettings = JSON.parse(
    localStorage.getItem("clinicSettings") || "{}"
  );

  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.text(
    clinicSettings.clinicName || "PhysioCare Clinic",
    14,
    18
  );

  doc.setFontSize(10);
  doc.text(
    `Doctor: ${clinicSettings.doctorName || "-"}`,
    14,
    26
  );

  doc.text(
    `Mobile: ${clinicSettings.mobile || "-"}`,
    14,
    32
  );

  doc.text(
    `Address: ${clinicSettings.address || "-"}`,
    14,
    38
  );

  doc.setFontSize(16);
  doc.text("Patient Report", 14, 52);

  autoTable(doc, {
    startY: 60,
    head: [["Field", "Details"]],
    body: [
      ["Patient Name", patient.name || "-"],
      ["Patient ID", patient.id || "-"],
      ["Mobile", patient.mobile || "-"],
      ["Age", patient.age || "-"],
      ["Gender", patient.gender || "-"],
      ["Disease", patient.disease || "-"],
      ["Current Pain", currentPain],
      ["Total Paid", `Rs. ${totalPaid}`],
      ["Attendance Rate", `${attendanceRate}%`],
    ],
  });

  autoTable(doc, {
    startY: (doc as any).lastAutoTable.finalY + 10,
    head: [["Date", "Pain", "Treatment", "Payment", "Remarks"]],
    body: entries.map((entry) => [
      entry.date,
      entry.pain,
      entry.treatment,
      `Rs. ${entry.payment}`,
      entry.remarks,
    ]),
  });

  autoTable(doc, {
    startY: (doc as any).lastAutoTable.finalY + 10,
    head: [["Date", "Amount", "Mode", "Notes"]],
    body: payments.map((payment) => [
      payment.date,
      `Rs. ${payment.amount}`,
      payment.mode,
      payment.notes || "-",
    ]),
  });

  autoTable(doc, {
    startY: (doc as any).lastAutoTable.finalY + 10,
    head: [["Date", "Status", "Notes"]],
    body: attendance.map((item) => [
      item.date,
      item.status,
      item.notes || "-",
    ]),
  });

  doc.save(`${patient.name}-report.pdf`);
};

  const handleDailyChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setDailyForm({ ...dailyForm, [e.target.name]: e.target.value });
  };

  const handlePaymentChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setPaymentForm({ ...paymentForm, [e.target.name]: e.target.value });
  };

  const handleAttendanceChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setAttendanceForm({ ...attendanceForm, [e.target.name]: e.target.value });
  };

  const updatePatientPainAndLast = (pain: string, date: string) => {
    const patients = JSON.parse(localStorage.getItem("patientsData") || "[]");

    const updatedPatients = patients.map((p: any) =>
      p.id === patientId
        ? {
            ...p,
            pain,
            last: date,
          }
        : p
    );

    localStorage.setItem("patientsData", JSON.stringify(updatedPatients));
  };

  const saveDailyEntry = async () => {
  if (!dailyForm.date || !dailyForm.treatment || !patient) return;

  const newEntry = {
    patient_id: patientId,
    patient_name: patient.name,
    date: dailyForm.date,
    pain: dailyForm.pain || currentPain,
    payment: dailyForm.payment || "0",
    treatment: dailyForm.treatment,
    remarks: dailyForm.remarks || "-",
  };

  const { error: treatmentError } = await supabase
    .from("treatments")
    .insert([newEntry]);

  if (treatmentError) {
    alert(treatmentError.message);
    return;
  }

  if (dailyForm.payment) {
    const { error: paymentError } = await supabase
      .from("payments")
      .insert([
        {
          patient_id: patientId,
          patient_name: patient.name,
          date: dailyForm.date,
          amount: dailyForm.payment,
          mode: "Cash",
          notes: "Daily treatment payment",
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
        patient_id: patientId,
        patient_name: patient.name,
        date: dailyForm.date,
        status: "Present",
        notes: "Auto marked from daily entry",
      },
    ]);

  if (attendanceError) {
    alert(attendanceError.message);
    return;
  }

  await supabase
    .from("patients")
    .update({
      pain: dailyForm.pain || currentPain,
    })
    .eq("id", patientId);

  await loadPatientData();

  setDailyForm({
    date: "",
    pain: "",
    treatment: "",
    payment: "",
    remarks: "",
  });

  setDailyOpen(false);
};

  const savePayment = async () => {
  if (!paymentForm.date || !paymentForm.amount || !patient) return;

  const { error } = await supabase.from("payments").insert([
    {
      patient_id: patientId,
      patient_name: patient.name,
      date: paymentForm.date,
      amount: paymentForm.amount,
      mode: paymentForm.mode,
      notes: paymentForm.notes || "-",
    },
  ]);

  if (error) {
    alert(error.message);
    return;
  }

  await loadPatientData();

  setPaymentForm({
    date: "",
    amount: "",
    mode: "Cash",
    notes: "",
  });

  setPaymentOpen(false);
};

  const saveAttendance = async () => {
  if (!attendanceForm.date || !patient) return;

  const { error } = await supabase.from("attendance").insert([
    {
      patient_id: patientId,
      patient_name: patient.name,
      date: attendanceForm.date,
      status: attendanceForm.status,
      notes: attendanceForm.notes || "-",
    },
  ]);

  if (error) {
    alert(error.message);
    return;
  }

  await loadPatientData();

  setAttendanceForm({
    date: "",
    status: "Present",
    notes: "",
  });

  setAttendanceOpen(false);
};

const deleteTreatment = async (id: number) => {
  if (!confirm("Delete treatment entry?")) return;

  await supabase
    .from("treatments")
    .delete()
    .eq("id", id);

  await loadPatientData();
};

const deletePayment = async (id: number) => {
  if (!confirm("Delete payment entry?")) return;

  await supabase
    .from("payments")
    .delete()
    .eq("id", id);

  await loadPatientData();
};

const deleteAttendance = async (id: number) => {
  if (!confirm("Delete attendance entry?")) return;

  await supabase
    .from("attendance")
    .delete()
    .eq("id", id);

  await loadPatientData();
};
const openEditTreatment = (entry: any) => {
  setEditTreatment(entry);

  setEditTreatmentForm({
    date: entry.date || "",
    pain: entry.pain || "",
    treatment: entry.treatment || "",
    payment: entry.payment || "",
    remarks: entry.remarks || "",
  });

  setEditTreatmentOpen(true);
};

const updateTreatment = async () => {
  if (!editTreatment) return;

  const { error } = await supabase
    .from("treatments")
    .update({
      date: editTreatmentForm.date,
      pain: editTreatmentForm.pain,
      treatment: editTreatmentForm.treatment,
      payment: editTreatmentForm.payment,
      remarks: editTreatmentForm.remarks,
    })
    .eq("id", editTreatment.id);

  if (error) {
    alert(error.message);
    return;
  }

  await loadPatientData();

  setEditTreatment(null);
  setEditTreatmentOpen(false);
};

  if (!patient) {
    return (
      <div className="rounded-3xl border bg-white p-8 text-slate-900 shadow-sm">
        <h1 className="text-2xl font-bold">Patient not found</h1>
        <p className="mt-2 text-slate-500">
          This patient record does not exist or was removed.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 text-slate-900">
      <div className="rounded-3xl bg-gradient-to-r from-blue-700 via-blue-600 to-cyan-500 p-8 text-white shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-5">
            <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-white text-4xl font-bold text-blue-700 shadow-lg">
              {patient.initial}
            </div>

            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-blue-100">
                Patient Profile
              </p>

              <h1 className="mt-2 text-4xl font-bold">{patient.name}</h1>

              <div className="mt-3 flex items-center gap-3">
                <span className="rounded-full bg-white/20 px-4 py-1 text-sm font-semibold text-white">
                  ID: {patient.id}
                </span>

                <span
                  className={`rounded-full px-4 py-1 text-sm font-bold ${
                    patient.status === "Active"
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-600"
                  }`}
                >
                  {patient.status} Patient
                </span>
              </div>
            </div>
          </div>

          <div className="text-right">
            <p className="text-sm text-blue-100">Current Pain</p>
            <h2 className="text-4xl font-bold">{currentPain}</h2>

            <div className="mt-5 flex justify-end gap-3">
              <button
                onClick={() => setDailyOpen(true)}
                className="rounded-2xl bg-white px-5 py-3 text-sm font-bold text-blue-700 shadow-lg hover:bg-blue-50"
              >
                + Daily Entry
              </button>

              <button
                onClick={() => setPaymentOpen(true)}
                className="rounded-2xl bg-green-500 px-5 py-3 text-sm font-bold text-white shadow-lg hover:bg-green-600"
              >
                + Payment
              </button>

              <button
                onClick={() => setAttendanceOpen(true)}
                className="rounded-2xl bg-orange-500 px-5 py-3 text-sm font-bold text-white shadow-lg hover:bg-orange-600"
              >
                Attendance
              </button>
           <button
  onClick={downloadPatientReport}
  className="rounded-2xl bg-purple-600 px-5 py-3 text-sm font-bold text-white shadow-lg hover:bg-purple-700"
>
  Download Report
</button>

            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-6">
        {[
          ["Current Pain", currentPain, "bg-orange-50 text-orange-700"],
          ["Total Collected", `₹${totalPaid}`, "bg-green-50 text-green-700"],
          ["Attendance Rate", `${attendanceRate}%`, "bg-blue-50 text-blue-700"],
          ["Treatment Sessions", entries.length, "bg-purple-50 text-purple-700"],
        ].map(([title, value, color]) => (
          <div
            key={title}
            className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <p className="text-sm font-medium text-slate-500">{title}</p>
            <div className={`mt-4 inline-flex rounded-2xl px-4 py-3 ${color}`}>
              <h2 className="text-3xl font-bold">{value}</h2>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="rounded-3xl border bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold">Patient Information</h2>
          <div className="mt-5 space-y-3">
            <p><b>Mobile:</b> {patient.mobile || "-"}</p>
            <p><b>Age:</b> {patient.age || "-"}</p>
            <p><b>Gender:</b> {patient.gender || "-"}</p>
            <p><b>Occupation:</b> {patient.occupation || "-"}</p>
            <p><b>Address:</b> {patient.address || "-"}</p>
          </div>
        </div>

        <div className="rounded-3xl border bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold">Clinical Information</h2>
          <div className="mt-5 space-y-3">
            <p><b>Disease:</b> {patient.disease || "-"}</p>
            <p><b>Chief Complaint:</b> {patient.chiefComplaint || "-"}</p>
            <p><b>Assessment:</b> {patient.assessment || "-"}</p>
            <p><b>Diagnosis:</b> {patient.diagnosis || "-"}</p>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold">Treatment Protocol</h2>
        <div className="mt-5 whitespace-pre-line rounded-2xl bg-slate-50 p-5">
          {patient.protocol || "No treatment protocol added."}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="rounded-3xl border bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold">Payment History</h2>

          <div className="mt-5 space-y-3">
            {payments.length === 0 ? (
              <p className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">
                No payment records yet.
              </p>
            ) : (
              payments.map((payment, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between rounded-2xl bg-green-50 p-4"
                >
                  <div>
                    <p className="font-bold text-slate-900">{payment.date}</p>
                    <p className="text-sm text-slate-500">
                      {payment.mode} • {payment.notes || "-"}
                    </p>
                  </div>

                 <button
  onClick={() => deletePayment(payment.id)}
  className="ml-3 rounded-xl bg-red-100 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-200"
>
  Delete
</button>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-3xl border bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold">Attendance Summary</h2>

          <div className="mt-5 grid grid-cols-3 gap-4">
            <div className="rounded-2xl bg-green-50 p-4 text-center">
              <p className="text-3xl font-bold text-green-700">{presentCount}</p>
              <p className="text-sm text-green-600">Present</p>
            </div>

            <div className="rounded-2xl bg-red-50 p-4 text-center">
              <p className="text-3xl font-bold text-red-600">{absentCount}</p>
              <p className="text-sm text-red-500">Absent</p>
            </div>

            <div className="rounded-2xl bg-blue-50 p-4 text-center">
              <p className="text-3xl font-bold text-blue-700">{attendanceRate}%</p>
              <p className="text-sm text-blue-600">Rate</p>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            {attendance.length === 0 ? (
              <p className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">
                No attendance records yet.
              </p>
            ) : (
              attendance.slice(-3).map((item, index) => (
                <div
                  key={index}
                  className="flex justify-between rounded-2xl bg-slate-50 p-4"
                >
                  <span className="font-semibold">{item.date}</span>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold ${
                      item.status === "Present"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-600"
                    }`}
                  >
                    {item.status}
                  </span>
                  <button
  onClick={() => deleteAttendance(item.id)}
  className="ml-3 rounded-xl bg-red-100 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-200"
>
  Delete
</button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="rounded-3xl border bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold">Treatment History</h2>

        <div className="mt-5 overflow-hidden rounded-2xl border">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="p-4">Date</th>
                <th className="p-4">Pain</th>
                <th className="p-4">Treatment</th>
                <th className="p-4">Payment</th>
                <th className="p-4">Remarks</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>

            <tbody>
              {entries.length === 0 ? (
                <tr>
                  <td className="p-4 text-slate-500" colSpan={6}>
                    No treatment entries yet.
                  </td>
                </tr>
              ) : (
                entries.map((entry, index) => (
                  <tr key={index} className="border-t">
                    <td className="p-4">{entry.date}</td>
                    <td className="p-4">{entry.pain}</td>
                    <td className="p-4">{entry.treatment}</td>
                    <td className="p-4">₹{entry.payment}</td>
                    <td className="p-4">{entry.remarks}</td>

<td className="p-4 text-right">
  <button
    onClick={() => openEditTreatment(entry)}
    className="mr-2 rounded-xl bg-blue-100 px-3 py-2 text-xs font-bold text-blue-700 hover:bg-blue-200"
  >
    Edit
  </button>

  <button
    onClick={() => deleteTreatment(entry.id)}
    className="rounded-xl bg-red-100 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-200"
  >
    Delete
  </button>
</td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {editTreatmentOpen && (
  <Modal
    title="Edit Treatment Entry"
    onClose={() => setEditTreatmentOpen(false)}
  >
    <div className="p-6">
      <div className="grid grid-cols-2 gap-5">
        <Field
          label="Treatment Date"
          name="date"
          value={editTreatmentForm.date}
          onChange={(e: any) =>
            setEditTreatmentForm({
              ...editTreatmentForm,
              date: e.target.value,
            })
          }
          placeholder="Example: 06 Jul"
        />

        <Field
          label="Pain Score"
          name="pain"
          value={editTreatmentForm.pain}
          onChange={(e: any) =>
            setEditTreatmentForm({
              ...editTreatmentForm,
              pain: e.target.value,
            })
          }
          placeholder="Example: 5/10"
        />

        <Field
          label="Payment"
          name="payment"
          value={editTreatmentForm.payment}
          onChange={(e: any) =>
            setEditTreatmentForm({
              ...editTreatmentForm,
              payment: e.target.value,
            })
          }
          placeholder="Example: 500"
        />

        <div className="col-span-2">
          <TextArea
            label="Treatment Done"
            name="treatment"
            value={editTreatmentForm.treatment}
            onChange={(e: any) =>
              setEditTreatmentForm({
                ...editTreatmentForm,
                treatment: e.target.value,
              })
            }
            placeholder="IFT + Ultrasound + Stretching"
          />
        </div>

        <div className="col-span-2">
          <TextArea
            label="Remarks"
            name="remarks"
            value={editTreatmentForm.remarks}
            onChange={(e: any) =>
              setEditTreatmentForm({
                ...editTreatmentForm,
                remarks: e.target.value,
              })
            }
            placeholder="Progress notes..."
          />
        </div>
      </div>
    </div>

    <ModalFooter
      onCancel={() => setEditTreatmentOpen(false)}
      onSave={updateTreatment}
      saveText="Update Treatment"
    />
  </Modal>
)}

      {dailyOpen && (
        <Modal title="New Treatment Session" onClose={() => setDailyOpen(false)}>
          <div className="p-6">
            <div className="grid grid-cols-2 gap-5">
              <Field label="Treatment Date" name="date" value={dailyForm.date} onChange={handleDailyChange} placeholder="Example: 06 Jul" />
              <Field label="Pain Score Today" name="pain" value={dailyForm.pain} onChange={handleDailyChange} placeholder="Example: 5/10" />
              <Field label="Payment Received" name="payment" value={dailyForm.payment} onChange={handleDailyChange} placeholder="Example: 500" />

              <div className="col-span-2">
                <TextArea label="Treatment Done Today" name="treatment" value={dailyForm.treatment} onChange={handleDailyChange} placeholder="IFT + Ultrasound + Stretching + Exercise" />
              </div>

              <div className="col-span-2">
                <TextArea label="Remarks / Progress Notes" name="remarks" value={dailyForm.remarks} onChange={handleDailyChange} placeholder="Pain reduced, movement improved..." />
              </div>
            </div>
          </div>

          <ModalFooter onCancel={() => setDailyOpen(false)} onSave={saveDailyEntry} saveText="Save Entry" />
        </Modal>
      )}

      {paymentOpen && (
        <Modal title="Add Payment Entry" onClose={() => setPaymentOpen(false)}>
          <div className="grid grid-cols-2 gap-5 p-6">
            <Field label="Payment Date" name="date" value={paymentForm.date} onChange={handlePaymentChange} placeholder="Example: 06 Jul" />
            <Field label="Amount" name="amount" value={paymentForm.amount} onChange={handlePaymentChange} placeholder="Example: 500" />

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Payment Mode
              </label>
              <select
                name="mode"
                value={paymentForm.mode}
                onChange={handlePaymentChange}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 outline-none focus:border-blue-500 focus:bg-white"
              >
                <option>Cash</option>
                <option>UPI</option>
                <option>Card</option>
              </select>
            </div>

            <div className="col-span-2">
              <TextArea label="Notes" name="notes" value={paymentForm.notes} onChange={handlePaymentChange} placeholder="Payment remarks..." />
            </div>
          </div>

          <ModalFooter onCancel={() => setPaymentOpen(false)} onSave={savePayment} saveText="Save Payment" />
        </Modal>
      )}

      {attendanceOpen && (
        <Modal title="Mark Attendance" onClose={() => setAttendanceOpen(false)}>
          <div className="grid grid-cols-2 gap-5 p-6">
            <Field label="Date" name="date" value={attendanceForm.date} onChange={handleAttendanceChange} placeholder="Example: 06 Jul" />

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Status
              </label>
              <select
                name="status"
                value={attendanceForm.status}
                onChange={handleAttendanceChange}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 outline-none focus:border-blue-500 focus:bg-white"
              >
                <option>Present</option>
                <option>Absent</option>
              </select>
            </div>

            <div className="col-span-2">
              <TextArea label="Notes" name="notes" value={attendanceForm.notes} onChange={handleAttendanceChange} placeholder="Attendance notes..." />
            </div>
          </div>

          <ModalFooter onCancel={() => setAttendanceOpen(false)} onSave={saveAttendance} saveText="Save Attendance" />
        </Modal>
      )}
    </div>
  );
}

function Modal({ title, children, onClose }: any) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-6">
      <div className="w-full max-w-3xl overflow-hidden rounded-3xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 p-6">
          <h2 className="text-2xl font-bold text-slate-900">{title}</h2>

          <button
            onClick={onClose}
            className="rounded-xl p-2 text-slate-500 hover:bg-slate-100"
          >
            <X size={22} />
          </button>
        </div>

        {children}
      </div>
    </div>
  );
}

function ModalFooter({ onCancel, onSave, saveText }: any) {
  return (
    <div className="flex justify-end gap-3 border-t border-slate-100 p-6">
      <button
        onClick={onCancel}
        className="rounded-2xl border border-slate-200 px-5 py-3 font-semibold text-slate-700 hover:bg-slate-50"
      >
        Cancel
      </button>

      <button
        onClick={onSave}
        className="rounded-2xl bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
      >
        {saveText}
      </button>
    </div>
  );
}

function Field({ label, name, value, onChange, placeholder }: any) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
      </label>

      <input
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 outline-none focus:border-blue-500 focus:bg-white"
      />
    </div>
  );
}

function TextArea({ label, name, value, onChange, placeholder }: any) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
      </label>

      <textarea
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="min-h-24 w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 outline-none focus:border-blue-500 focus:bg-white"
      />
    </div>
  );
}