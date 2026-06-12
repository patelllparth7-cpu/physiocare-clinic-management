"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import {
  Search,
  Plus,
  Filter,
  Users,
  Activity,
  UserCheck,
  Clock,
  X,
  Trash2,
} from "lucide-react";

import { supabase } from "@/lib/supabase";

const initialPatients: any[] = [];

export default function PatientsPage() {
  const [open, setOpen] = useState(false);
  const [editPatient, setEditPatient] = useState<any>(null);
  const [patientsData, setPatientsData] = useState<any[]>(initialPatients);
  const [loaded, setLoaded] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const emptyForm = {
    name: "",
    mobile: "",
    age: "",
    gender: "",
    address: "",
    occupation: "",
    emergencyContact: "",
    referredBy: "",
    chiefComplaint: "",
    disease: "",
    assessment: "",
    diagnosis: "",
    protocol: "",
    painScore: "",
  };

  const [formData, setFormData] = useState(emptyForm);

useEffect(() => {
  fetchPatients();
}, []);

const fetchPatients = async () => {
  const { data, error } = await supabase
    .from("patients")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Fetch patients error:", error.message);
    return;
  }

  setPatientsData(data || []);
  setLoaded(true);
};

  const filteredPatients = patientsData.filter((patient) => {
    const query = searchQuery.toLowerCase();

    return (
      patient.name?.toLowerCase().includes(query) ||
      patient.mobile?.toLowerCase().includes(query) ||
      patient.disease?.toLowerCase().includes(query) ||
      patient.id?.toLowerCase().includes(query)
    );
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const resetForm = () => {
    setFormData(emptyForm);
    setEditPatient(null);
    setOpen(false);
  };

const handleSavePatient = async () => {
  if (!formData.name || !formData.mobile) return;

  const patientPayload = {
    name: formData.name,
    mobile: formData.mobile,
    age: formData.age,
    gender: formData.gender,
    address: formData.address,
    occupation: formData.occupation,
    emergency_contact: formData.emergencyContact,
    referred_by: formData.referredBy,
    complaint: formData.chiefComplaint,
    disease: formData.disease || "Not added",
    assessment: formData.assessment,
    diagnosis: formData.diagnosis,
    protocol: formData.protocol,
    pain: formData.painScore || "0/10",
  };

  if (editPatient) {
    const { error } = await supabase
      .from("patients")
      .update(patientPayload)
      .eq("id", editPatient.id);

    if (error) {
      alert(error.message);
      return;
    }

    await fetchPatients();
    resetForm();
    return;
  }

  const newPatient = {
    id: `P${String(Date.now()).slice(-6)}`,
    ...patientPayload,
    status: "Active",
  };

  const { error } = await supabase.from("patients").insert([newPatient]);

  if (error) {
    alert(error.message);
    return;
  }

  await fetchPatients();
  resetForm();
};

  const handleEditPatient = (patient: any) => {
    setEditPatient(patient);

    setFormData({
      name: patient.name || "",
      mobile: patient.mobile || "",
      age: patient.age || "",
      gender: patient.gender || "",
      address: patient.address || "",
      occupation: patient.occupation || "",
      emergencyContact: patient.emergencyContact || "",
      referredBy: patient.referredBy || "",
      chiefComplaint: patient.chiefComplaint || "",
      disease: patient.disease || "",
      assessment: patient.assessment || "",
      diagnosis: patient.diagnosis || "",
      protocol: patient.protocol || "",
      painScore: patient.pain || "",
    });

    setOpen(true);
  };

const handleToggleStatus = async (
  id: string,
  currentStatus: string
) => {
  const newStatus =
    currentStatus === "Active" ? "Inactive" : "Active";

  const { error } = await supabase
    .from("patients")
    .update({
      status: newStatus,
    })
    .eq("id", id);

  if (error) {
    alert(error.message);
    return;
  }

  await fetchPatients();
};

const handleDeletePatient = async (patient: any) => {
  const confirmDelete = window.confirm(
    `Delete ${patient.name}? This will remove patient, treatments, payments and attendance.`
  );

  if (!confirmDelete) return;

  await supabase.from("attendance").delete().eq("patient_id", patient.id);
  await supabase.from("treatments").delete().eq("patient_id", patient.id);
  await supabase.from("payments").delete().eq("patient_id", patient.id);

  const { error } = await supabase
    .from("patients")
    .delete()
    .eq("id", patient.id);

  if (error) {
    alert(error.message);
    return;
  }

  await fetchPatients();
};

  const exportPatients = () => {
  const exportData = {
    patients: patientsData,
    exportedAt: new Date().toISOString(),
  };

  const blob = new Blob([JSON.stringify(exportData, null, 2)], {
    type: "application/json",
  });

  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "patients-data.json";
  a.click();

  URL.revokeObjectURL(url);
};

const importPatients = (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;

  const reader = new FileReader();

  reader.onload = (event) => {
    try {
      const data = JSON.parse(event.target?.result as string);

      const importedPatients = data.patients || data;

      if (!Array.isArray(importedPatients)) {
        alert("Invalid patients file");
        return;
      }

      setPatientsData(importedPatients);
      localStorage.setItem("patientsData", JSON.stringify(importedPatients));

      alert("Patients imported successfully");
    } catch {
      alert("Invalid file format");
    }
  };

  reader.readAsText(file);
};

  return (
    <div className="space-y-8 text-slate-900">
      <div className="rounded-3xl bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-400 p-8 text-white shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-blue-100">
              Patient Management
            </p>

            <h1 className="mt-2 text-4xl font-bold">Patients</h1>

            <p className="mt-3 max-w-2xl text-blue-50">
              Manage patient records, daily treatment entries, attendance and payment history.
            </p>
          </div>

          <button
            onClick={() => {
              setEditPatient(null);
              setFormData(emptyForm);
              setOpen(true);
            }}
            className="flex items-center gap-2 rounded-2xl bg-white px-6 py-3 text-sm font-bold text-blue-700 shadow-sm hover:bg-blue-50"
          >
            <Plus size={18} />
            Add Patient
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-6">
        {[
          ["Total Patients", patientsData.length, Users],
          [
            "Active Patients",
            patientsData.filter((p) => p.status === "Active").length,
            UserCheck,
          ],
          ["Treatments Today", "0", Activity],
          ["Pending Follow-up", "0", Clock],
        ].map(([title, value, Icon]: any) => (
          <div
            key={title}
            className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">{title}</p>
                <h2 className="mt-2 text-3xl font-bold text-slate-950">
                  {value}
                </h2>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                <Icon size={24} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 p-6">
          <div className="flex items-center justify-between gap-4">
            <div className="relative w-96">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, mobile, disease or ID..."
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-blue-500 focus:bg-white"
              />
            </div>

            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                <Filter size={16} />
                Filter
              </button>

              <button
  onClick={exportPatients}
  className="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700"
>
  Export
</button>

<label className="cursor-pointer rounded-2xl bg-green-600 px-5 py-3 text-sm font-semibold text-white hover:bg-green-700">
  Import
  <input
    type="file"
    accept=".json"
    onChange={importPatients}
    hidden
  />
</label>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="overflow-hidden rounded-2xl border border-slate-200">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="p-4">Patient</th>
                  <th className="p-4">Disease</th>
                  <th className="p-4">Mobile</th>
                  <th className="p-4">Pain Score</th>
                  <th className="p-4">Last Treatment</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredPatients.length === 0 ? (
                  <tr>
                    <td className="p-6 text-slate-500" colSpan={7}>
                      No patients found.
                    </td>
                  </tr>
                ) : (
                  filteredPatients.map((patient) => (
                    <tr
                      key={patient.id}
                      className={`hover:bg-slate-50 ${
                        patient.status === "Inactive" ? "opacity-60" : ""
                      }`}
                    >
                      <td className="p-4">
                        <Link
                          href={`/patients/${patient.id}`}
                          className="flex items-center gap-3 rounded-2xl p-2 transition hover:bg-blue-50"
                        >
                          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-100 font-bold text-blue-700">
                            {patient.initial}
                          </div>

                          <div>
                            <p className="font-bold text-slate-900">
                              {patient.name}
                            </p>

                            <p className="text-xs text-slate-500">
                              ID #{patient.id}
                            </p>
                          </div>
                        </Link>
                      </td>

                      <td className="p-4 font-medium">{patient.disease}</td>
                      <td className="p-4">{patient.mobile}</td>
                      <td className="p-4">
                        <span className="rounded-xl bg-orange-50 px-3 py-1 text-xs font-bold text-orange-700">
                          {patient.pain}
                        </span>
                      </td>
                      <td className="p-4">{patient.last}</td>
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
                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleEditPatient(patient)}
                            className="rounded-xl bg-blue-50 px-3 py-2 text-xs font-bold text-blue-700 hover:bg-blue-100"
                          >
                            Edit
                          </button>

                          <button
                           onClick={() =>
  handleToggleStatus(
    patient.id,
    patient.status
  )
}
                            className={`rounded-xl px-3 py-2 text-xs font-bold ${
                              patient.status === "Active"
                                ? "bg-red-50 text-red-600 hover:bg-red-100"
                                : "bg-green-50 text-green-700 hover:bg-green-100"
                            }`}
                          >
                            {patient.status === "Active"
                              ? "Inactive"
                              : "Activate"}
                          </button>

                          <button
                            onClick={() => handleDeletePatient(patient)}
                            className="rounded-xl bg-red-600 px-3 py-2 text-xs font-bold text-white hover:bg-red-700"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-6">
          <div className="w-full max-w-5xl rounded-3xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 p-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">
                  {editPatient ? "Edit Patient" : "Add New Patient"}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {editPatient
                    ? "Update patient details and save changes."
                    : "Enter patient details and treatment protocol."}
                </p>
              </div>

              <button
                onClick={resetForm}
                className="rounded-xl p-2 text-slate-500 hover:bg-slate-100"
              >
                <X size={22} />
              </button>
            </div>

            <div className="max-h-[70vh] overflow-y-auto p-6">
              <div className="mb-6 rounded-3xl bg-blue-50 p-5">
                <p className="text-sm font-bold uppercase tracking-wide text-blue-600">
                  Patient Intake Form
                </p>

                <h3 className="mt-1 text-xl font-bold text-slate-900">
                  Basic details & treatment setup
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Fill patient information once. Daily treatment and payments will be added later.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-5">
                <Field label="Patient Name" name="name" value={formData.name} onChange={handleChange} />
                <Field label="Mobile Number" name="mobile" value={formData.mobile} onChange={handleChange} />
                <Field label="Age" name="age" value={formData.age} onChange={handleChange} />
                <div>
  <label className="mb-2 block text-sm font-semibold text-slate-700">
    Gender
  </label>

  <select
    name="gender"
    value={formData.gender}
    onChange={(e) =>
      setFormData({
        ...formData,
        gender: e.target.value,
      })
    }
    className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 outline-none focus:border-blue-500 focus:bg-white"
  >
    <option value="">Select Gender</option>
    <option value="Male">Male</option>
    <option value="Female">Female</option>
    <option value="Other">Other</option>
  </select>
</div>
                <Field label="Occupation" name="occupation" value={formData.occupation} onChange={handleChange} />
                <Field label="Emergency Contact" name="emergencyContact" value={formData.emergencyContact} onChange={handleChange} />
                <Field label="Referred By" name="referredBy" value={formData.referredBy} onChange={handleChange} />
                <Field label="Initial Pain Score" name="painScore" value={formData.painScore} onChange={handleChange} placeholder="Example: 6/10" />

                <div className="col-span-2">
                  <Field label="Address" name="address" value={formData.address} onChange={handleChange} />
                </div>

                <div className="col-span-2">
                  <Field label="Disease / Problem" name="disease" value={formData.disease} onChange={handleChange} />
                </div>

                <TextArea label="Chief Complaint" name="chiefComplaint" value={formData.chiefComplaint} onChange={handleChange} placeholder="Example: Lower back pain since 3 months" />
                <TextArea label="Assessment Findings" name="assessment" value={formData.assessment} onChange={handleChange} placeholder="Example: Reduced ROM, hamstring tightness..." />
                <TextArea label="Diagnosis Notes" name="diagnosis" value={formData.diagnosis} onChange={handleChange} placeholder="Write diagnosis, symptoms, history..." />
                <TextArea label="Treatment Protocol" name="protocol" value={formData.protocol} onChange={handleChange} placeholder="IFT, Ultrasound, Stretching, Strengthening..." />
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-slate-100 p-6">
              <button
                onClick={resetForm}
                className="rounded-2xl border border-slate-200 px-5 py-3 font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                onClick={handleSavePatient}
                className="rounded-2xl bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
              >
                {editPatient ? "Update Patient" : "Save Patient"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({
  label,
  name,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  name: string;
  value: string;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
  placeholder?: string;
}) {
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

function TextArea({
  label,
  name,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  name: string;
  value: string;
  onChange: React.ChangeEventHandler<HTMLTextAreaElement>;
  placeholder?: string;
}) {
  return (
    <div className="col-span-2">
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