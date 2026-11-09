
"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Search,
  RefreshCw,
  Loader2,
  Clock3,
  UserCheck,
  LogOut,
  Users,
} from "lucide-react";
import { supabase } from "@/lib/supabase/client";

type Member = {
  id: string;
  full_name: string;
  email: string;
};

type AttendanceRecord = {
  id: string;
  member_id: string;
  attendance_date: string;
  check_in: string;
  check_out: string | null;
};

function getLocalDate() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function AttendanceClient() {
  const [members, setMembers] = useState<Member[]>([]);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState("");
  const [search, setSearch] = useState("");
  const [selectedMember, setSelectedMember] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [today, setToday] = useState("");

  const loadData = useCallback(async (date: string) => {
    setLoading(true);
    setError("");

    const [membersResult, attendanceResult] = await Promise.all([
      supabase
        .from("members")
        .select("id, full_name, email")
        .order("full_name"),

      supabase
        .from("attendance")
        .select("*")
        .eq("attendance_date", date)
        .order("check_in", { ascending: false }),
    ]);

    if (membersResult.error) {
      setError(membersResult.error.message);
    } else {
      setMembers(membersResult.data || []);
    }

    if (attendanceResult.error) {
      setError(attendanceResult.error.message);
    } else {
      setRecords(attendanceResult.data || []);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    const date = getLocalDate();
    setToday(date);
    loadData(date);
  }, [loadData]);

  const handleCheckIn = async () => {
    if (!selectedMember || !today) {
      setError("Please select a member first.");
      return;
    }

    setSavingId(selectedMember);
    setError("");
    setSuccess("");

    const { error: insertError } = await supabase
      .from("attendance")
      .insert({
        member_id: selectedMember,
        attendance_date: today,
      });

    if (insertError) {
      setError(insertError.message);
    } else {
      setSuccess("Member checked in successfully.");
      setSelectedMember("");
      await loadData(today);
    }

    setSavingId("");
  };

  const handleCheckOut = async (record: AttendanceRecord) => {
    setSavingId(record.id);
    setError("");
    setSuccess("");

    const { error: updateError } = await supabase
      .from("attendance")
      .update({ check_out: new Date().toISOString() })
      .eq("id", record.id)
      .is("check_out", null);

    if (updateError) {
      setError(updateError.message);
    } else {
      setSuccess("Member checked out. They can check in again.");
      await loadData(today);
    }

    setSavingId("");
  };

  const getMemberName = (memberId: string) =>
    members.find((member) => member.id === memberId)?.full_name ||
    "Unknown Member";

  const formatTime = (value: string | null) => {
    if (!value) return "—";

    return new Date(value).toLocaleTimeString("en-PK", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const filteredRecords = records.filter((record) =>
    getMemberName(record.member_id)
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const checkedIn = records.filter((record) => !record.check_out).length;
  const checkedOut = records.filter((record) => record.check_out).length;

  // Only members who are NOT currently inside the gym can check in.
  // A checked-out member becomes available again.
  const membersAvailableForCheckIn = members.filter(
    (member) =>
      !records.some(
        (record) =>
          record.member_id === member.id && record.check_out === null
      )
  );

  return (
    <div className="min-h-screen bg-[#090B12] p-5 text-white sm:p-8">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Attendance</h1>
          <p className="mt-1 text-sm text-gray-400">
            Track daily member check-ins and check-outs.
          </p>
          {today && (
            <p className="mt-2 text-xs text-gray-500">
              Today: {today}
            </p>
          )}
        </div>

        <button
          onClick={() => today && loadData(today)}
          disabled={loading || !today}
          className="flex items-center gap-2 rounded-lg border border-white/10 px-4 py-2.5 text-sm hover:bg-white/5 disabled:opacity-50"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {success && (
        <div className="mb-5 rounded-lg border border-green-500/20 bg-green-500/10 p-3 text-sm text-green-400">
          {success}
        </div>
      )}

      {error && (
        <div className="mb-5 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
          {error}
        </div>
      )}

      <div className="mb-7 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-white/10 bg-[#111521] p-5">
          <div className="flex items-center gap-2 text-gray-400">
            <Users size={18} />
            <p className="text-sm">Total Visits Today</p>
          </div>
          <h2 className="mt-3 text-2xl font-bold">{records.length}</h2>
        </div>

        <div className="rounded-xl border border-white/10 bg-[#111521] p-5">
          <div className="flex items-center gap-2 text-green-400">
            <UserCheck size={18} />
            <p className="text-sm">Currently In Gym</p>
          </div>
          <h2 className="mt-3 text-2xl font-bold">{checkedIn}</h2>
        </div>

        <div className="rounded-xl border border-white/10 bg-[#111521] p-5">
          <div className="flex items-center gap-2 text-orange-400">
            <LogOut size={18} />
            <p className="text-sm">Completed Visits</p>
          </div>
          <h2 className="mt-3 text-2xl font-bold">{checkedOut}</h2>
        </div>
      </div>

      <div className="mb-7 rounded-xl border border-white/10 bg-[#111521] p-5">
        <h2 className="mb-4 font-semibold">Member Check-in</h2>

        <div className="flex flex-col gap-3 sm:flex-row">
          <select
            value={selectedMember}
            onChange={(e) => setSelectedMember(e.target.value)}
            className="min-w-0 flex-1 rounded-lg border border-white/10 bg-[#090B12] px-4 py-3 text-sm outline-none focus:border-[#287BFF]"
          >
            <option value="">Select a member</option>
            {membersAvailableForCheckIn.map((member) => (
              <option key={member.id} value={member.id}>
                {member.full_name} — {member.email}
              </option>
            ))}
          </select>

          <button
            onClick={handleCheckIn}
            disabled={!selectedMember || !!savingId || loading}
            className="flex items-center justify-center gap-2 rounded-lg bg-[#287BFF] px-5 py-3 text-sm font-semibold hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {savingId === selectedMember ? (
              <Loader2 size={17} className="animate-spin" />
            ) : (
              <UserCheck size={17} />
            )}
            Check In
          </button>
        </div>

        {membersAvailableForCheckIn.length === 0 && !loading && (
          <p className="mt-3 text-xs text-gray-500">
            All members are currently checked in, or no members are registered.
          </p>
        )}
      </div>

      <div className="mb-4">
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
            size={18}
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search member..."
            className="w-full rounded-lg border border-white/10 bg-[#111521] py-3 pl-10 pr-4 text-sm outline-none focus:border-[#287BFF]"
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-white/10 bg-[#111521]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-left text-sm">
            <thead className="border-b border-white/10 bg-white/[0.03] text-gray-400">
              <tr>
                <th className="px-5 py-4">Member</th>
                <th className="px-5 py-4">Check-in</th>
                <th className="px-5 py-4">Check-out</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-400">
                    <Loader2 className="mx-auto mb-2 animate-spin" />
                    Loading attendance...
                  </td>
                </tr>
              ) : filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-400">
                    <Clock3 className="mx-auto mb-2" size={28} />
                    No attendance records found today.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((record) => (
                  <tr key={record.id} className="hover:bg-white/[0.02]">
                    <td className="px-5 py-4 font-medium">
                      {getMemberName(record.member_id)}
                    </td>

                    <td className="px-5 py-4 text-gray-300">
                      {formatTime(record.check_in)}
                    </td>

                    <td className="px-5 py-4 text-gray-300">
                      {formatTime(record.check_out)}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          record.check_out
                            ? "bg-gray-500/10 text-gray-400"
                            : "bg-green-500/10 text-green-400"
                        }`}
                      >
                        {record.check_out ? "Checked Out" : "In Gym"}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      {!record.check_out ? (
                        <button
                          onClick={() => handleCheckOut(record)}
                          disabled={!!savingId}
                          className="flex items-center gap-2 rounded-lg border border-orange-500/20 px-3 py-2 text-xs text-orange-400 hover:bg-orange-500/10 disabled:opacity-50"
                        >
                          {savingId === record.id ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : (
                            <LogOut size={14} />
                          )}
                          Check Out
                        </button>
                      ) : (
                        <span className="text-xs text-gray-500">
                          Completed
                        </span>
                      )}
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
