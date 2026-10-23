"use client";

import React, { useState, useMemo, useEffect } from "react";
import moment from "moment";
import {
  User as UserIcon,
  Calendar,
  Clock,
  Download,
  Printer,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  TrendingUp,
  BarChart3,
  Activity,
  PieChart as PieChartIcon,
  Layers,
  ArrowRight,
  ScanFace,
  Info,
  ExternalLink,
  ChevronDown,
  Search,
  Check,
  Briefcase,
  Building,
  Mail,
  Phone,
  X,
  MapPin,
  Compass,
  BatteryCharging,
} from "lucide-react";
import { useGraphQLUsers } from "@/lib/graphql/users/userHook";
import { useGraphQLOrgAttendanceRecords } from "@/lib/graphql/attendance/attendanceHooks";
import { AttendanceRecord, AttendanceHeartbeat } from "@/lib/graphql/attendance/types";
import { User } from "@/lib/graphql/users/types";
import { AttendanceTimelineBar } from "./AttendanceTimelineBar";
import { Pagination } from "@/components/common/Pagination";
import { Button } from "@/components/ui/button";
import { DatePickerSimple } from "@/components/ui/datePicker";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";

export type TimeframeMode = "week" | "month" | "year" | "custom";

interface EmployeeAttendanceReportViewProps {
  initialEmployeeId?: string;
  onEmployeeChange?: (employeeId: string) => void;
  showNavigationBack?: boolean;
  backHref?: string;
  initialTimeframe?: TimeframeMode;
  isModal?: boolean;
  onCloseModal?: () => void;
}

// Slice item interface for SVG Donut Chart
interface DonutSlice {
  label: string;
  count: number;
  percentage: number;
  color: string;
  dotColor: string;
}

function SvgDonut({
  slices,
  centerTitle,
  centerSubtitle,
  size = 140,
}: {
  slices: DonutSlice[];
  centerTitle: string;
  centerSubtitle: string;
  size?: number;
}) {
  const radius = 46;
  const strokeWidth = 18;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;

  let cumulativeAngle = -90; // Start at 12 o'clock

  const segments = slices.map((slice) => {
    const strokeDasharray = `${(Math.max(0, slice.percentage) / 100) * circumference} ${circumference}`;
    const transform = `rotate(${cumulativeAngle} ${center} ${center})`;
    cumulativeAngle += (Math.max(0, slice.percentage) / 100) * 360;

    return {
      ...slice,
      strokeDasharray,
      transform,
    };
  });

  return (
    <div className="relative flex items-center justify-center shrink-0">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="drop-shadow-xs">
        {/* Background track */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-muted/30"
        />
        {/* Active segments */}
        {segments.map((seg, i) => (
          <circle
            key={i}
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={seg.color}
            strokeWidth={strokeWidth}
            strokeDasharray={seg.strokeDasharray}
            transform={seg.transform}
            strokeLinecap="butt"
            className="transition-all duration-500 hover:opacity-80"
          />
        ))}
      </svg>
      {/* Center content */}
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-xl font-black text-foreground tracking-tight leading-none">
          {centerTitle}
        </span>
        <span className="text-[10px] font-medium text-muted-foreground mt-0.5">
          {centerSubtitle}
        </span>
      </div>
    </div>
  );
}

export function EmployeeAttendanceReportView({
  initialEmployeeId,
  onEmployeeChange,
  showNavigationBack = false,
  backHref = "/attendance",
  initialTimeframe = "month",
  isModal = false,
  onCloseModal,
}: EmployeeAttendanceReportViewProps) {
  // 1. Employee Directory Selection (Includes all roles: staff, managers, admins)
  const { users = [], isUsersLoading } = useGraphQLUsers({
    pageSize: 200,
    filters: { includeAdmins: true },
  });

  const sortedUsers = useMemo(() => {
    return [...users].sort((a, b) =>
      `${a.firstName || ""} ${a.lastName || ""}`.localeCompare(
        `${b.firstName || ""} ${b.lastName || ""}`
      )
    );
  }, [users]);

  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>(
    initialEmployeeId ? String(initialEmployeeId) : ""
  );
  const prevInitialIdRef = React.useRef(initialEmployeeId ? String(initialEmployeeId) : undefined);

  // Sync if initialEmployeeId changes from the outside
  useEffect(() => {
    if (initialEmployeeId && String(initialEmployeeId) !== prevInitialIdRef.current) {
      const nextId = String(initialEmployeeId);
      prevInitialIdRef.current = nextId;
      setSelectedEmployeeId(nextId);
    }
  }, [initialEmployeeId]);

  // If no employee is selected yet, default to the first employee once users load
  useEffect(() => {
    if (!selectedEmployeeId && sortedUsers.length > 0) {
      const firstId = String(sortedUsers[0].id);
      setSelectedEmployeeId(firstId);
      prevInitialIdRef.current = firstId;
    }
  }, [selectedEmployeeId, sortedUsers]);

  const handleSelectEmployee = (id: string) => {
    const stringId = String(id);
    prevInitialIdRef.current = stringId;
    setSelectedEmployeeId(stringId);
    onEmployeeChange?.(stringId);
  };

  const selectedIndex = useMemo(() => {
    if (!sortedUsers.length || !selectedEmployeeId) return 0;
    const idx = sortedUsers.findIndex((u) => String(u.id) === String(selectedEmployeeId));
    return idx >= 0 ? idx : 0;
  }, [sortedUsers, selectedEmployeeId]);

  const selectedEmployee: User | undefined = useMemo(() => {
    if (!sortedUsers.length) return undefined;
    return (
      sortedUsers.find((u) => String(u.id) === String(selectedEmployeeId)) ||
      sortedUsers[selectedIndex] ||
      sortedUsers[0]
    );
  }, [sortedUsers, selectedEmployeeId, selectedIndex]);

  const handlePrevEmployee = () => {
    if (!sortedUsers.length) return;
    const nextIdx = (selectedIndex - 1 + sortedUsers.length) % sortedUsers.length;
    handleSelectEmployee(sortedUsers[nextIdx].id);
  };

  const handleNextEmployee = () => {
    if (!sortedUsers.length) return;
    const nextIdx = (selectedIndex + 1) % sortedUsers.length;
    handleSelectEmployee(sortedUsers[nextIdx].id);
  };

  // Dropdown search for employee switcher
  const [employeeDropdownOpen, setEmployeeDropdownOpen] = useState(false);
  const [employeeSearchTerm, setEmployeeSearchTerm] = useState("");

  const filteredDropdownUsers = useMemo(() => {
    if (!employeeSearchTerm.trim()) return sortedUsers;
    const q = employeeSearchTerm.toLowerCase();
    return sortedUsers.filter(
      (u) =>
        `${u.firstName} ${u.lastName}`.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        u.employeeId?.toLowerCase().includes(q) ||
        u.designation?.name?.toLowerCase().includes(q) ||
        u.department?.name?.toLowerCase().includes(q)
    );
  }, [sortedUsers, employeeSearchTerm]);

  // 2. Timeframe Controls
  const [timeframe, setTimeframe] = useState<TimeframeMode>(initialTimeframe);
  const [anchorDate, setAnchorDate] = useState<moment.Moment>(moment());
  const [customStartDate, setCustomStartDate] = useState<string>(
    moment().subtract(29, "days").format("YYYY-MM-DD")
  );
  const [customEndDate, setCustomEndDate] = useState<string>(
    moment().format("YYYY-MM-DD")
  );

  // Compute actual start & end date strings based on selected timeframe
  const { startDate, endDate, periodLabel } = useMemo(() => {
    if (timeframe === "week") {
      const start = moment(anchorDate).startOf("isoWeek");
      const end = moment(anchorDate).endOf("isoWeek");
      return {
        startDate: start.format("YYYY-MM-DD"),
        endDate: end.format("YYYY-MM-DD"),
        periodLabel: `${start.format("DD MMM")} – ${end.format("DD MMM, YYYY")} (Week ${start.isoWeek()})`,
      };
    }
    if (timeframe === "month") {
      const start = moment(anchorDate).startOf("month");
      const end = moment(anchorDate).endOf("month");
      return {
        startDate: start.format("YYYY-MM-DD"),
        endDate: end.format("YYYY-MM-DD"),
        periodLabel: start.format("MMMM YYYY"),
      };
    }
    if (timeframe === "year") {
      const start = moment(anchorDate).startOf("year");
      const end = moment(anchorDate).endOf("year");
      return {
        startDate: start.format("YYYY-MM-DD"),
        endDate: end.format("YYYY-MM-DD"),
        periodLabel: `Calendar Year ${start.format("YYYY")}`,
      };
    }
    // Custom
    return {
      startDate: customStartDate,
      endDate: customEndDate,
      periodLabel: `${moment(customStartDate).format("DD MMM YYYY")} – ${moment(customEndDate).format("DD MMM YYYY")}`,
    };
  }, [timeframe, anchorDate, customStartDate, customEndDate]);

  // Period navigator step handlers
  const handlePrevPeriod = () => {
    if (timeframe === "week") setAnchorDate((d) => moment(d).subtract(1, "week"));
    if (timeframe === "month") setAnchorDate((d) => moment(d).subtract(1, "month"));
    if (timeframe === "year") setAnchorDate((d) => moment(d).subtract(1, "year"));
  };

  const handleNextPeriod = () => {
    if (timeframe === "week") setAnchorDate((d) => moment(d).add(1, "week"));
    if (timeframe === "month") setAnchorDate((d) => moment(d).add(1, "month"));
    if (timeframe === "year") setAnchorDate((d) => moment(d).add(1, "year"));
  };

  const handleResetCurrent = () => {
    setAnchorDate(moment());
  };

  // 3. Query Attendance Records for Selected Employee & Timeframe
  const {
    records: rawRecords,
    isLoading: recordsLoading,
    refetch,
  } = useGraphQLOrgAttendanceRecords({
    page: 1,
    pageSize: 366,
    filters: {
      userId: selectedEmployee?.id,
      startDate,
      endDate,
    },
  });

  // Filter records strictly by user ID (safeguard)
  const employeeRecords: AttendanceRecord[] = useMemo(() => {
    if (!selectedEmployee) return [];
    return rawRecords.filter(
      (r) => !r.user?.id || String(r.user.id) === String(selectedEmployee.id)
    );
  }, [rawRecords, selectedEmployee]);

  // Map of records keyed by attendanceDate (YYYY-MM-DD)
  const recordsByDate = useMemo(() => {
    const map = new Map<string, AttendanceRecord>();
    employeeRecords.forEach((r) => {
      map.set(r.attendanceDate, r);
    });
    return map;
  }, [employeeRecords]);

  // 4. Detailed Metrics & Scorecard Calculation
  const metrics = useMemo(() => {
    let presentCount = 0;
    let lateLoginCount = 0;
    let earlyLogoutCount = 0;
    let halfDayCount = 0;
    let absentCount = 0;
    let weekendWorkCount = 0;
    let totalGrossHours = 0;
    let totalEffectiveHours = 0;
    let roamingAnomalies = 0;

    // Classification counters for Work Started donut
    let startedEarly = 0;
    let startedOnTime = 0;
    let startedLate = 0;
    let startedOffWork = 0;

    // Classification counters for Work Finished donut
    let finishedEarly = 0;
    let finishedOnTime = 0;
    let finishedLate = 0;
    let finishedOffWork = 0;

    employeeRecords.forEach((r) => {
      const isPresent = r.status === "present" || (!!r.loginTime && r.status !== "absent");
      if (isPresent) {
        presentCount++;
      } else if (r.status === "absent") {
        absentCount++;
      } else if (r.status === "half_day") {
        halfDayCount++;
      }

      if (r.status === "late_login") lateLoginCount++;
      if (r.status === "early_logout") earlyLogoutCount++;
      if (r.isWeekendWork) weekendWorkCount++;
      if (r.roamingAnomalyDetected) roamingAnomalies++;

      const gross = Number(r.workedHours) || 0;
      const effective = r.effectiveWorkedHours != null ? Number(r.effectiveWorkedHours) : gross;
      totalGrossHours += gross;
      totalEffectiveHours += effective;

      // Work Started Classification (Shift Start 09:00:00)
      if (!r.loginTime || r.status === "absent") {
        startedOffWork++;
      } else {
        const [h, m] = r.loginTime.split(":").map(Number);
        const loginMin = h * 60 + (m || 0);
        if (loginMin < 535) {
          startedEarly++; // Before 08:55 AM
        } else if (loginMin <= 555) {
          startedOnTime++; // 08:55 to 09:15 AM
        } else {
          startedLate++; // After 09:15 AM
        }
      }

      // Work Finished Classification (Shift End 18:00:00)
      const isToday = r.attendanceDate === moment().format("YYYY-MM-DD");
      if (!r.logoutTime) {
        if (!r.loginTime || r.status === "absent") {
          finishedOffWork++;
        } else if (isToday) {
          finishedOnTime++; // Active in-progress for today's shift
        } else {
          finishedOffWork++; // Incomplete / Missed checkout on past date
        }
      } else {
        const [h, m] = r.logoutTime.split(":").map(Number);
        const logoutMin = h * 60 + (m || 0);
        if (logoutMin < 1065) {
          finishedEarly++; // Before 05:45 PM
        } else if (logoutMin <= 1095) {
          finishedOnTime++; // 05:45 to 06:15 PM
        } else {
          finishedLate++; // Overtime / Late logout
        }
      }
    });

    const totalDaysLogged = employeeRecords.length;
    const baseCount = Math.max(totalDaysLogged, 1);
    const calcPct = (cnt: number) => (totalDaysLogged > 0 ? Math.round((cnt / baseCount) * 100) : 0);

    const onTimeArrivalRate =
      presentCount > 0
        ? Math.round(((presentCount - startedLate) / presentCount) * 100)
        : 0;

    const startedSlices: DonutSlice[] = [
      {
        label: "Early (< 08:55 AM)",
        count: startedEarly,
        percentage: calcPct(startedEarly),
        color: "#86efac",
        dotColor: "bg-emerald-300",
      },
      {
        label: "On time (08:55 - 09:15)",
        count: startedOnTime,
        percentage: calcPct(startedOnTime),
        color: "#10b981",
        dotColor: "bg-emerald-500",
      },
      {
        label: "Late (> 09:15 AM)",
        count: startedLate,
        percentage: calcPct(startedLate),
        color: "#fbbf24",
        dotColor: "bg-amber-400",
      },
      {
        label: "Off work / Absent",
        count: startedOffWork,
        percentage: calcPct(startedOffWork),
        color: "#f87171",
        dotColor: "bg-rose-400",
      },
    ];

    const finishedSlices: DonutSlice[] = [
      {
        label: "Early exit (< 05:45 PM)",
        count: finishedEarly,
        percentage: calcPct(finishedEarly),
        color: "#fbbf24",
        dotColor: "bg-amber-400",
      },
      {
        label: "On time (05:45 - 06:15)",
        count: finishedOnTime,
        percentage: calcPct(finishedOnTime),
        color: "#10b981",
        dotColor: "bg-emerald-500",
      },
      {
        label: "Overtime (> 06:15 PM)",
        count: finishedLate,
        percentage: calcPct(finishedLate),
        color: "#86efac",
        dotColor: "bg-emerald-300",
      },
      {
        label: "Incomplete / Off work",
        count: finishedOffWork,
        percentage: calcPct(finishedOffWork),
        color: "#f87171",
        dotColor: "bg-rose-400",
      },
    ];

    const roamingDeductions = Math.max(0, totalGrossHours - totalEffectiveHours);
    const avgDailyHours = presentCount > 0 ? (totalEffectiveHours / presentCount).toFixed(1) : "0.0";

    return {
      totalDaysLogged,
      presentCount,
      lateLoginCount,
      earlyLogoutCount,
      halfDayCount,
      absentCount,
      weekendWorkCount,
      roamingAnomalies,
      totalGrossHours: totalGrossHours.toFixed(1),
      totalEffectiveHours: totalEffectiveHours.toFixed(1),
      roamingDeductions: roamingDeductions.toFixed(1),
      avgDailyHours,
      onTimeArrivalRate,
      startedSlices,
      finishedSlices,
    };
  }, [employeeRecords]);

  // 5. Generate continuous day list for timeline display
  const timelineDays = useMemo(() => {
    const days: {
      dateStr: string;
      dateMoment: moment.Moment;
      record?: AttendanceRecord;
      isWeekend: boolean;
      dayOfWeek: string;
    }[] = [];

    const cur = moment(startDate, "YYYY-MM-DD");
    const end = moment(endDate, "YYYY-MM-DD");

    // Safety cap at 92 days for continuous day-by-day timeline view
    let count = 0;
    while (cur.isSameOrBefore(end) && count < 95) {
      const dateStr = cur.format("YYYY-MM-DD");
      const dayNum = cur.day(); // 0 is Sun, 6 is Sat
      const isWeekend = dayNum === 0 || dayNum === 6;
      days.push({
        dateStr,
        dateMoment: cur.clone(),
        record: recordsByDate.get(dateStr),
        isWeekend,
        dayOfWeek: cur.format("ddd"),
      });
      cur.add(1, "day");
      count++;
    }

    return days;
  }, [startDate, endDate, recordsByDate]);

  // 6. Monthly aggregation cards for Year view
  const yearMonthlyStats = useMemo(() => {
    if (timeframe !== "year") return [];
    const months: {
      monthKey: string;
      monthLabel: string;
      present: number;
      late: number;
      hours: number;
    }[] = [];

    const yr = moment(anchorDate).year();
    for (let m = 0; m < 12; m++) {
      const startM = moment([yr, m, 1]).format("YYYY-MM-DD");
      const endM = moment([yr, m, 1]).endOf("month").format("YYYY-MM-DD");
      const monthLabel = moment([yr, m, 1]).format("MMM");

      let present = 0;
      let late = 0;
      let hours = 0;

      employeeRecords.forEach((r) => {
        if (r.attendanceDate >= startM && r.attendanceDate <= endM) {
          if (r.status === "present" || (r.loginTime && r.status !== "absent")) present++;
          if (r.status === "late_login") late++;
          hours += Number(r.effectiveWorkedHours || r.workedHours) || 0;
        }
      });

      months.push({
        monthKey: `${yr}-${String(m + 1).padStart(2, "0")}`,
        monthLabel,
        present,
        late,
        hours: hours > 0 && hours < 1 ? Number(hours.toFixed(1)) : Math.round(hours),
      });
    }

    return months;
  }, [timeframe, anchorDate, employeeRecords]);

  // 7. Pagination & Selected Day Inspection State
  const [timelinePage, setTimelinePage] = useState(1);
  const [tablePage, setTablePage] = useState(1);
  const PAGE_SIZE = 10;

  const [selectedDayRecord, setSelectedDayRecord] = useState<AttendanceRecord | null>(null);
  const [selectedDayDate, setSelectedDayDate] = useState<string | null>(null);
  const [selectedDayIsWeekend, setSelectedDayIsWeekend] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<"timeline" | "table" | "both">("both");

  // Reset pagination and selection on timeframe / employee change
  useEffect(() => {
    setTimelinePage(1);
    setTablePage(1);
    setSelectedDayRecord(null);
    setSelectedDayDate(null);
    setSelectedDayIsWeekend(false);
  }, [selectedEmployeeId, timeframe, startDate, endDate]);

  const totalTimelinePages = Math.max(1, Math.ceil(timelineDays.length / PAGE_SIZE));
  const paginatedTimelineDays = useMemo(() => {
    const start = (timelinePage - 1) * PAGE_SIZE;
    return timelineDays.slice(start, start + PAGE_SIZE);
  }, [timelineDays, timelinePage]);

  const totalTablePages = Math.max(1, Math.ceil(employeeRecords.length / PAGE_SIZE));
  const paginatedTableRecords = useMemo(() => {
    const start = (tablePage - 1) * PAGE_SIZE;
    return employeeRecords.slice(start, start + PAGE_SIZE);
  }, [employeeRecords, tablePage]);

  // Selected Day Telemetry & GPS Heartbeats calculations
  const selectedDayCalculations = useMemo(() => {
    if (!selectedDayDate) return null;

    const record = selectedDayRecord;
    const isWeekend = selectedDayIsWeekend;

    if (!record) {
      return {
        record: null,
        dateStr: selectedDayDate,
        isWeekend,
        hasRecord: false,
      };
    }

    const officeRadius = record.officeLocation?.geoRadiusMeters || 200;
    const rawHeartbeats = record.heartbeats || [];
    const heartbeats: AttendanceHeartbeat[] =
      rawHeartbeats.length > 0
        ? rawHeartbeats
        : record.loginLatitude && record.loginLongitude
        ? [
            {
              id: -1,
              timestamp:
                record.attendanceDate && record.loginTime
                  ? `${record.attendanceDate}T${record.loginTime}`
                  : new Date().toISOString(),
              latitude: Number(record.loginLatitude),
              longitude: Number(record.loginLongitude),
              distanceMeters: record.loginDistance ?? 0,
              isWithinGeofence: Boolean(
                record.isWithinGeofence ??
                  ((record.loginDistance ?? 9999) <= officeRadius)
              ),
              accuracyMeters: null,
              isMocked: false,
              batteryLevel: null,
            } as unknown as AttendanceHeartbeat,
          ]
        : [];

    const totalPings =
      record.totalHeartbeats && record.totalHeartbeats > 0
        ? record.totalHeartbeats
        : heartbeats.length;
    const validPings =
      record.validHeartbeats != null && record.totalHeartbeats
        ? record.validHeartbeats
        : heartbeats.filter((h) => h.isWithinGeofence).length;
    const outOfFence =
      record.outOfFenceHeartbeats != null && record.totalHeartbeats
        ? record.outOfFenceHeartbeats
        : Math.max(0, totalPings - validPings);

    const isShiftActive = !record.logoutTime && record.loginTime;
    let grossHours = Number(record.workedHours) || 0;
    let effectiveHours =
      record.effectiveWorkedHours != null
        ? Number(record.effectiveWorkedHours)
        : grossHours;

    if (isShiftActive && record.loginTime && record.attendanceDate) {
      const loginDateTime = moment(
        `${record.attendanceDate} ${record.loginTime}`,
        "YYYY-MM-DD HH:mm:ss"
      );
      const now = moment();
      grossHours = Math.max(0, now.diff(loginDateTime, "hours", true));
      effectiveHours =
        outOfFence > 0
          ? Math.max(0, grossHours - Math.max(0, outOfFence * 0.33 - 1.0))
          : grossHours;
    }

    const roamingDiscrepancy = Math.max(
      0,
      Number((grossHours - effectiveHours).toFixed(2))
    );
    const presencePct =
      totalPings > 0
        ? Math.round((validPings / totalPings) * 100)
        : record.loginDistance && record.loginDistance > officeRadius
        ? 0
        : 100;

    const hasAnomaly =
      Boolean(record.roamingAnomalyDetected) ||
      outOfFence > 0 ||
      (record.loginDistance != null && record.loginDistance > officeRadius);

    // Arrival status
    let arrivalStatus = "On Time";
    let arrivalColor = "text-emerald-600 dark:text-emerald-400";
    if (record.loginTime) {
      const [h, m] = record.loginTime.split(":").map(Number);
      const loginMin = h * 60 + (m || 0);
      if (loginMin < 535) {
        arrivalStatus = `${540 - loginMin}m Early`;
        arrivalColor = "text-emerald-600 dark:text-emerald-400";
      } else if (loginMin > 555) {
        arrivalStatus = `${loginMin - 540}m Late`;
        arrivalColor = "text-rose-600 dark:text-rose-400";
      }
    }

    // Departure status
    let departureStatus = record.logoutTime
      ? "On Time"
      : isShiftActive
      ? "Currently Active"
      : "No Logout";
    let departureColor = "text-muted-foreground";
    if (record.logoutTime) {
      const [h, m] = record.logoutTime.split(":").map(Number);
      const logoutMin = h * 60 + (m || 0);
      if (logoutMin < 1065) {
        departureStatus = `${1080 - logoutMin}m Early Exit`;
        departureColor = "text-rose-600 dark:text-rose-400";
      } else if (logoutMin > 1095) {
        departureStatus = `${logoutMin - 1080}m Overtime`;
        departureColor = "text-emerald-600 dark:text-emerald-400";
      }
    }

    return {
      record,
      dateStr: selectedDayDate,
      isWeekend,
      hasRecord: true,
      officeRadius,
      heartbeats,
      totalPings,
      validPings,
      outOfFence,
      grossHours,
      effectiveHours,
      roamingDiscrepancy,
      presencePct,
      hasAnomaly,
      isShiftActive,
      arrivalStatus,
      arrivalColor,
      departureStatus,
      departureColor,
    };
  }, [selectedDayRecord, selectedDayDate, selectedDayIsWeekend]);

  // Major hour ticks for synchronized ruler
  const majorHours = [
    { hour: 0, label: "12 AM" },
    { hour: 3, label: "3 AM" },
    { hour: 6, label: "6 AM" },
    { hour: 9, label: "9 AM", isShift: true },
    { hour: 12, label: "12 PM" },
    { hour: 15, label: "3 PM" },
    { hour: 18, label: "6 PM", isShift: true },
    { hour: 21, label: "9 PM" },
  ];

  // 8. Export CSV Action
  const handleExportCSV = () => {
    if (!employeeRecords.length) return;
    const empName = selectedEmployee ? `${selectedEmployee.firstName}_${selectedEmployee.lastName}` : "Employee";
    const filename = `Attendance_Report_${empName}_${startDate}_to_${endDate}.csv`;

    const headers = [
      "Date",
      "Day",
      "Status",
      "Login Time",
      "Logout Time",
      "Gross Hours",
      "Effective Hours",
      "Roaming Deductions",
      "Geofence Compliance",
      "Approval Status",
    ];

    const rows = employeeRecords.map((r) => {
      const d = moment(r.attendanceDate);
      const gross = Number(r.workedHours) || 0;
      const effective = r.effectiveWorkedHours != null ? Number(r.effectiveWorkedHours) : gross;
      const diff = Math.max(0, gross - effective).toFixed(2);
      const totalP = r.totalHeartbeats || 0;
      const validP = r.validHeartbeats || 0;
      const geoPct = totalP > 0 ? `${Math.round((validP / totalP) * 100)}%` : "N/A";

      return [
        r.attendanceDate,
        d.format("dddd"),
        r.status,
        r.loginTime || "—",
        r.logoutTime || "—",
        gross.toFixed(2),
        effective.toFixed(2),
        diff,
        geoPct,
        r.approvalStatus || "auto_approved",
      ].map((val) => `"${String(val).replace(/"/g, '""')}"`);
    });

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 9. Print Report Action
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className={cn("space-y-4 sm:space-y-6 pb-12 w-full max-w-full overflow-hidden", isModal ? "p-0" : "")}>
      {/* --------------------------------------------------------------------- */}
      {/* 1. Header Toolbar: Back navigation, Employee Switcher, Actions        */}
      {/* --------------------------------------------------------------------- */}
      <div className="flex flex-col gap-3 sm:gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-4 sm:pb-5 w-full">
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          {showNavigationBack && (
            <Button
              variant="outline"
              size="icon"
              asChild
              className="h-8 w-8 sm:h-9 sm:w-9 shrink-0 rounded-xl cursor-pointer"
              title="Back to Attendance Overview"
            >
              <Link href={backHref}>
                <ChevronLeft className="h-4 w-4" />
              </Link>
            </Button>
          )}

          <div className="min-w-0 flex-1">
            {!isModal ? (
              <Breadcrumbs
                items={[
                  { label: "Attendance", href: "/attendance" },
                  { label: "Report" },
                  ...(selectedEmployee
                    ? [{ label: `${selectedEmployee.firstName} ${selectedEmployee.lastName}` }]
                    : []),
                ]}
                className="mb-1"
              />
            ) : (
              <div className="flex items-center gap-1.5 sm:gap-2 mb-1">
                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-primary truncate">
                  Employee Audit
                </span>
                <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary shrink-0">
                  Live Sync
                </span>
              </div>
            )}
            <h1 className="text-base sm:text-2xl font-black text-foreground tracking-tight truncate">
              Attendance & Compliance Report
            </h1>
          </div>
        </div>

        {/* Action Buttons: Export CSV & Print */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            disabled={employeeRecords.length === 0}
            className="flex-1 sm:flex-initial h-8 sm:h-9 gap-1.5 rounded-xl text-xs font-semibold"
          >
            <Download className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="truncate">Export CSV</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handlePrint}
            className="flex-1 sm:flex-initial h-8 sm:h-9 gap-1.5 rounded-xl text-xs font-semibold print:hidden"
          >
            <Printer className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="truncate">Print Report</span>
          </Button>

          {isModal && onCloseModal && (
            <Button
              variant="default"
              size="sm"
              onClick={onCloseModal}
              className="h-8 sm:h-9 rounded-xl text-xs font-semibold shrink-0"
            >
              Close
            </Button>
          )}
        </div>
      </div>

      {/* --------------------------------------------------------------------- */}
      {/* 2. Employee Profile Card with Quick Switcher Dropdown                  */}
      {/* --------------------------------------------------------------------- */}
      <div className="rounded-2xl border border-border bg-card p-3 sm:p-5 shadow-xs w-full overflow-hidden">
        <div className="flex flex-col gap-3.5 md:flex-row md:items-center md:justify-between">
          {/* Employee Avatar & Info */}
          <div className="flex items-start sm:items-center gap-3 sm:gap-4 min-w-0">
            <div className="relative flex h-11 w-11 sm:h-14 sm:w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-base sm:text-xl font-black text-primary border border-primary/20 shadow-inner">
              {selectedEmployee?.firstName?.charAt(0) || <UserIcon className="h-5 w-5 sm:h-7 sm:w-7" />}
              {selectedEmployee?.todayAttendanceStatus === "present" && (
                <span
                  className="absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full bg-emerald-500 ring-2 ring-card"
                  title="Present Today"
                />
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-black text-foreground tracking-tight">
                  {selectedEmployee
                    ? `${selectedEmployee.firstName} ${selectedEmployee.lastName}`
                    : "Select Employee"}
                </h2>
                {selectedEmployee?.employeeId && (
                  <span className="rounded-md bg-muted px-1.5 py-0.5 text-[10px] sm:text-[11px] font-semibold text-muted-foreground">
                    ID: {selectedEmployee.employeeId}
                  </span>
                )}
                {selectedEmployee?.role && (
                  <span className="rounded-md bg-primary/10 border border-primary/20 px-1.5 py-0.5 text-[10px] sm:text-[11px] font-semibold text-primary capitalize">
                    {selectedEmployee.role}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-x-3 gap-y-1 text-xs text-muted-foreground mt-1 flex-wrap">
                {selectedEmployee?.designation?.name && (
                  <span className="inline-flex items-center gap-1">
                    <Briefcase className="h-3 w-3 shrink-0" />
                    <span className="truncate">{selectedEmployee.designation.name}</span>
                  </span>
                )}
                {selectedEmployee?.department?.name && (
                  <span className="inline-flex items-center gap-1">
                    <Building className="h-3 w-3 shrink-0" />
                    <span className="truncate">{selectedEmployee.department.name}</span>
                  </span>
                )}
                {selectedEmployee?.email && (
                  <span className="inline-flex items-center gap-1 truncate max-w-full">
                    <Mail className="h-3 w-3 shrink-0" />
                    <span className="truncate">{selectedEmployee.email}</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Quick Employee Switcher Popover / Dropdown with Prev/Next buttons */}
          <div className="flex items-center gap-1.5 w-full md:w-auto justify-between md:justify-end shrink-0 pt-1 md:pt-0 border-t md:border-t-0 border-border/40">
            {/* Quick Previous Employee Button */}
            <Button
              variant="outline"
              size="icon"
              type="button"
              onClick={handlePrevEmployee}
              disabled={sortedUsers.length <= 1}
              className="h-8 sm:h-9 w-8 sm:w-9 shrink-0 rounded-xl text-muted-foreground hover:text-foreground cursor-pointer"
              title="Previous Employee"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            {/* Radix Popover Dropdown */}
            <Popover open={employeeDropdownOpen} onOpenChange={setEmployeeDropdownOpen}>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className="flex-1 md:flex-initial flex items-center justify-between gap-2 rounded-xl border border-border bg-muted/40 hover:bg-muted px-2.5 sm:px-3.5 py-1.5 sm:py-2 text-xs font-semibold text-foreground transition-colors cursor-pointer shadow-xs min-w-0"
                >
                  <div className="flex items-center gap-1.5 truncate">
                    <UserIcon className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span className="truncate">Switch Employee</span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {sortedUsers.length > 0 && (
                      <span className="text-[10px] text-muted-foreground font-normal">
                        ({selectedIndex + 1}/{sortedUsers.length})
                      </span>
                    )}
                    <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                </button>
              </PopoverTrigger>

              <PopoverContent
                align="end"
                className="w-72 sm:w-80 p-2 rounded-2xl border border-border bg-popover shadow-2xl z-[999]"
              >
                <div className="p-2 border-b border-border/60">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Search employee…"
                      value={employeeSearchTerm}
                      onChange={(e) => setEmployeeSearchTerm(e.target.value)}
                      className="w-full h-8 rounded-lg bg-muted/60 pl-8 pr-3 text-xs outline-none focus:ring-2 focus:ring-primary/20"
                      autoFocus
                    />
                  </div>
                </div>

                <div className="max-h-64 overflow-y-auto py-1 space-y-0.5">
                  {filteredDropdownUsers.length === 0 ? (
                    <p className="p-3 text-center text-xs text-muted-foreground">
                      No employees found
                    </p>
                  ) : (
                    filteredDropdownUsers.map((u) => {
                      const isSelected = String(u.id) === String(selectedEmployee?.id);
                      return (
                        <button
                          key={u.id}
                          type="button"
                          onClick={() => {
                            handleSelectEmployee(u.id);
                            setEmployeeDropdownOpen(false);
                          }}
                          className={cn(
                            "flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-xs transition-colors cursor-pointer",
                            isSelected
                              ? "bg-primary text-primary-foreground font-semibold"
                              : "hover:bg-muted text-foreground"
                          )}
                        >
                          <div className="min-w-0 pr-2">
                            <p className="truncate font-medium">
                              {u.firstName} {u.lastName}
                            </p>
                            <p
                              className={cn(
                                "truncate text-[10px]",
                                isSelected ? "text-primary-foreground/80" : "text-muted-foreground"
                              )}
                            >
                              {u.designation?.name || u.department?.name || u.email}
                            </p>
                          </div>
                          {isSelected && <Check className="h-4 w-4 shrink-0" />}
                        </button>
                      );
                    })
                  )}
                </div>
              </PopoverContent>
            </Popover>

            {/* Quick Next Employee Button */}
            <Button
              variant="outline"
              size="icon"
              type="button"
              onClick={handleNextEmployee}
              disabled={sortedUsers.length <= 1}
              className="h-8 sm:h-9 w-8 sm:w-9 shrink-0 rounded-xl text-muted-foreground hover:text-foreground cursor-pointer"
              title="Next Employee"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* --------------------------------------------------------------------- */}
      {/* 3. Timeframe Filter Controls: Month | Week | Year | Custom            */}
      {/* --------------------------------------------------------------------- */}
      <div className="rounded-2xl border border-border bg-card p-3 sm:p-5 shadow-xs space-y-3 sm:space-y-4 w-full overflow-hidden">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          {/* Segmented Timeframe Switcher */}
          <div className="grid grid-cols-4 sm:flex sm:items-center gap-1 rounded-xl bg-muted/50 p-1 border border-border/80 w-full sm:w-fit">
            {[
              { id: "week", label: "Week" },
              { id: "month", label: "Month" },
              { id: "year", label: "Year" },
              { id: "custom", label: "Custom" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setTimeframe(tab.id as TimeframeMode)}
                className={cn(
                  "rounded-lg px-2 sm:px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer text-center truncate",
                  timeframe === tab.id
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Period Navigator Bar */}
          {timeframe !== "custom" ? (
            <div className="flex items-center gap-1.5 sm:gap-2 w-full sm:w-auto justify-between sm:justify-start">
              <Button
                variant="outline"
                size="icon"
                onClick={handlePrevPeriod}
                className="h-8 w-8 shrink-0 rounded-lg"
                title="Previous Period"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              <div className="flex-1 sm:flex-initial rounded-lg border border-border bg-muted/30 px-2 sm:px-3.5 py-1.5 text-center min-w-0 sm:min-w-[180px]">
                <span className="text-xs font-bold text-foreground truncate block">
                  {periodLabel}
                </span>
              </div>

              <Button
                variant="outline"
                size="icon"
                onClick={handleNextPeriod}
                className="h-8 w-8 shrink-0 rounded-lg"
                title="Next Period"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleResetCurrent}
                className="h-8 px-2 sm:px-3 text-xs font-semibold text-primary hover:text-primary hover:bg-primary/10 shrink-0"
              >
                Current
              </Button>
            </div>
          ) : (
            /* Custom Date Range Picker */
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="flex-1 sm:w-36 h-8 rounded-lg border border-border bg-background px-2 text-xs font-medium text-foreground outline-none focus:ring-2 focus:ring-primary/20"
                />
                <span className="text-xs text-muted-foreground shrink-0">to</span>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="flex-1 sm:w-36 h-8 rounded-lg border border-border bg-background px-2 text-xs font-medium text-foreground outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              {/* Quick Presets */}
              <div className="flex items-center gap-1 overflow-x-auto py-1">
                {[
                  { label: "7D", days: 7 },
                  { label: "14D", days: 14 },
                  { label: "30D", days: 30 },
                  { label: "90D", days: 90 },
                ].map((p) => (
                  <button
                    key={p.label}
                    onClick={() => {
                      setCustomStartDate(moment().subtract(p.days - 1, "days").format("YYYY-MM-DD"));
                      setCustomEndDate(moment().format("YYYY-MM-DD"));
                    }}
                    className="rounded-md border border-border bg-muted/40 hover:bg-muted px-2 py-1 text-[11px] font-semibold text-muted-foreground transition-colors cursor-pointer shrink-0"
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* --------------------------------------------------------------------- */}
      {/* 4. Executive KPI Scorecard Cards                                      */}
      {/* --------------------------------------------------------------------- */}
      <div className="grid grid-cols-2 gap-2.5 sm:gap-3 sm:grid-cols-3 lg:grid-cols-6 w-full">
        {/* Present Days */}
        <div className="rounded-xl sm:rounded-2xl border border-border bg-card p-3 sm:p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">Days Present</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="mt-1.5 sm:mt-2 flex items-baseline gap-1.5">
            <span className="text-xl sm:text-2xl font-black text-foreground tabular-nums">
              {metrics.presentCount}
            </span>
            <span className="text-[11px] sm:text-xs text-muted-foreground">/ {metrics.totalDaysLogged} logs</span>
          </div>
          <p className="mt-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold truncate">
            {metrics.totalDaysLogged > 0
              ? `${Math.round((metrics.presentCount / Math.max(1, metrics.totalDaysLogged)) * 100)}% Presence`
              : "No logs"}
          </p>
        </div>

        {/* On-Time Punctuality */}
        <div className="rounded-xl sm:rounded-2xl border border-border bg-card p-3 sm:p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">On-Time Arrival</span>
            <TrendingUp className="h-4 w-4 text-primary" />
          </div>
          <div className="mt-1.5 sm:mt-2 flex items-baseline gap-1.5">
            <span className="text-xl sm:text-2xl font-black text-foreground tabular-nums">
              {metrics.onTimeArrivalRate}%
            </span>
          </div>
          <p className="mt-1 text-[11px] text-muted-foreground truncate">
            {metrics.lateLoginCount} late arrivals
          </p>
        </div>

        {/* Total Effective Hours */}
        <div className="rounded-xl sm:rounded-2xl border border-border bg-card p-3 sm:p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">Effective Hours</span>
            <Clock className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="mt-1.5 sm:mt-2 flex items-baseline gap-1.5">
            <span className="text-xl sm:text-2xl font-black text-foreground tabular-nums">
              {metrics.totalEffectiveHours}h
            </span>
          </div>
          <p className="mt-1 text-[11px] text-muted-foreground truncate">
            Gross: {metrics.totalGrossHours}h
          </p>
        </div>

        {/* Average Daily Hours */}
        <div className="rounded-xl sm:rounded-2xl border border-border bg-card p-3 sm:p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">Avg Shift Length</span>
            <Activity className="h-4 w-4 text-sky-500" />
          </div>
          <div className="mt-1.5 sm:mt-2 flex items-baseline gap-1.5">
            <span className="text-xl sm:text-2xl font-black text-foreground tabular-nums">
              {metrics.avgDailyHours}h
            </span>
            <span className="text-[11px] sm:text-xs text-muted-foreground">/ day</span>
          </div>
          <p className="mt-1 text-[11px] text-muted-foreground truncate">
            Target: 8.0h - 9.0h
          </p>
        </div>

        {/* Roaming Deductions */}
        <div className="rounded-xl sm:rounded-2xl border border-border bg-card p-3 sm:p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">Roaming Deducted</span>
            <ShieldCheck className="h-4 w-4 text-amber-500" />
          </div>
          <div className="mt-1.5 sm:mt-2 flex items-baseline gap-1.5">
            <span
              className={cn(
                "text-xl sm:text-2xl font-black tabular-nums",
                Number(metrics.roamingDeductions) > 0 ? "text-amber-600 dark:text-amber-400" : "text-foreground"
              )}
            >
              {metrics.roamingDeductions}h
            </span>
          </div>
          <p className="mt-1 text-[11px] text-muted-foreground truncate">
            {metrics.roamingAnomalies} geofence flags
          </p>
        </div>

        {/* Early Logouts & Anomalies */}
        <div className="rounded-xl sm:rounded-2xl border border-border bg-card p-3 sm:p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">Early Exits</span>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </div>
          <div className="mt-1.5 sm:mt-2 flex items-baseline gap-1.5">
            <span className="text-xl sm:text-2xl font-black text-foreground tabular-nums">
              {metrics.earlyLogoutCount}
            </span>
            <span className="text-[11px] sm:text-xs text-muted-foreground">days</span>
          </div>
          <p className="mt-1 text-[11px] text-muted-foreground truncate">
            {metrics.halfDayCount} half-days logged
          </p>
        </div>
      </div>

      {/* --------------------------------------------------------------------- */}
      {/* 5. Donut / Pie Charts: Work Started & Work Finished (Matching Matrix) */}
      {/* --------------------------------------------------------------------- */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 w-full">
        {/* Donut Card 1: Work Started Breakdown */}
        <div className="rounded-2xl border border-border bg-card p-3.5 sm:p-5 shadow-xs space-y-3 sm:space-y-4 overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/70 pb-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
                <h3 className="text-xs sm:text-sm font-bold text-foreground capitalize truncate">
                  Shift Arrival — Work Started
                </h3>
              </div>
              <p className="text-[11px] sm:text-xs text-muted-foreground mt-0.5 truncate">
                Arrival punctuality vs 09:00 AM standard shift start
              </p>
            </div>
            <span className="rounded-lg bg-emerald-500/10 px-2 sm:px-2.5 py-0.5 sm:py-1 text-[11px] sm:text-xs font-bold text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 self-start sm:self-auto shrink-0">
              {metrics.onTimeArrivalRate}% Punctual
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 pt-1 sm:pt-2">
            <SvgDonut
              slices={metrics.startedSlices}
              centerTitle={`${metrics.presentCount}`}
              centerSubtitle="Days Logged"
              size={124}
            />

            <div className="grid grid-cols-2 gap-2 flex-1 w-full min-w-0">
              {metrics.startedSlices.map((slice) => (
                <div
                  key={slice.label}
                  className="rounded-xl border border-border/80 bg-muted/20 p-2 sm:p-2.5 hover:bg-muted/40 transition-colors min-w-0"
                >
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className={cn("h-2 w-2 rounded-full shrink-0", slice.dotColor)} />
                    <span className="text-[10px] sm:text-xs font-medium text-muted-foreground truncate">
                      {slice.label}
                    </span>
                  </div>
                  <div className="mt-1 flex items-baseline justify-between">
                    <span className="text-sm sm:text-base font-black text-foreground tabular-nums">
                      {slice.count}
                    </span>
                    <span className="text-[10px] sm:text-xs font-semibold text-muted-foreground">
                      {slice.percentage}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Donut Card 2: Work Finished Breakdown */}
        <div className="rounded-2xl border border-border bg-card p-3.5 sm:p-5 shadow-xs space-y-3 sm:space-y-4 overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/70 pb-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="inline-block h-2 w-2 rounded-full bg-sky-500 shrink-0" />
                <h3 className="text-xs sm:text-sm font-bold text-foreground capitalize truncate">
                  Shift Exit — Work Finished
                </h3>
              </div>
              <p className="text-[11px] sm:text-xs text-muted-foreground mt-0.5 truncate">
                Departure adherence vs 06:00 PM standard shift end
              </p>
            </div>
            <span className="rounded-lg bg-primary/10 px-2 sm:px-2.5 py-0.5 sm:py-1 text-[11px] sm:text-xs font-bold text-primary border border-primary/20 self-start sm:self-auto shrink-0">
              {metrics.totalEffectiveHours}h Effective
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 pt-1 sm:pt-2">
            <SvgDonut
              slices={metrics.finishedSlices}
              centerTitle={`${metrics.totalDaysLogged}`}
              centerSubtitle="Shifts Evaluated"
              size={124}
            />

            <div className="grid grid-cols-2 gap-2 flex-1 w-full min-w-0">
              {metrics.finishedSlices.map((slice) => (
                <div
                  key={slice.label}
                  className="rounded-xl border border-border/80 bg-muted/20 p-2 sm:p-2.5 hover:bg-muted/40 transition-colors min-w-0"
                >
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className={cn("h-2 w-2 rounded-full shrink-0", slice.dotColor)} />
                    <span className="text-[10px] sm:text-xs font-medium text-muted-foreground truncate">
                      {slice.label}
                    </span>
                  </div>
                  <div className="mt-1 flex items-baseline justify-between">
                    <span className="text-sm sm:text-base font-black text-foreground tabular-nums">
                      {slice.count}
                    </span>
                    <span className="text-[10px] sm:text-xs font-semibold text-muted-foreground">
                      {slice.percentage}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* --------------------------------------------------------------------- */}
      {/* 6. Yearly View Monthly Distribution Heatmap (Shown when Year chosen)  */}
      {/* --------------------------------------------------------------------- */}
      {timeframe === "year" && (
        <div className="rounded-2xl border border-border bg-card p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-border/70 pb-3">
            <div>
              <h3 className="text-sm font-bold text-foreground">
                12-Month Performance & Attendance Distribution ({anchorDate.year()})
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Monthly breakdown of days present, late logins, and total cumulative hours
              </p>
            </div>
            <span className="text-xs font-semibold text-muted-foreground">
              Total Annual: {metrics.totalEffectiveHours} Hours
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 pt-1">
            {yearMonthlyStats.map((m) => (
              <div
                key={m.monthKey}
                onClick={() => {
                  setTimeframe("month");
                  setAnchorDate(moment(m.monthKey, "YYYY-MM"));
                }}
                className="group rounded-xl border border-border/80 bg-muted/20 p-3 hover:border-primary/50 hover:bg-muted/50 transition-all cursor-pointer"
                title={`Click to inspect ${m.monthLabel} daily timeline`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">
                    {m.monthLabel}
                  </span>
                  <span className="text-[10px] text-muted-foreground font-semibold">
                    {m.present} Days
                  </span>
                </div>
                <div className="mt-2 flex items-baseline justify-between">
                  <span className="text-lg font-black text-foreground tabular-nums">
                    {m.hours}h
                  </span>
                  {m.late > 0 && (
                    <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400">
                      {m.late} late
                    </span>
                  )}
                </div>
                <div className="mt-2 h-1.5 w-full rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, Math.round((m.present / 22) * 100))}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --------------------------------------------------------------------- */}
      {/* Inline Day Presence Telemetry & GPS Breadcrumbs Inspector             */}
      {/* --------------------------------------------------------------------- */}
      {selectedDayDate && selectedDayCalculations && (
        <div
          id="inline-day-telemetry"
          className="rounded-2xl border-2 border-primary/30 bg-card shadow-xl p-3.5 sm:p-6 space-y-4 sm:space-y-6 transition-all duration-300 animate-in fade-in slide-in-from-top-4 w-full overflow-hidden"
        >
          {/* Day Header Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 sm:pb-4 border-b border-border/80">
            <div className="flex items-start sm:items-center gap-2.5 sm:gap-3 min-w-0">
              <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-base shrink-0 shadow-inner">
                {selectedEmployee?.firstName?.charAt(0) || <UserIcon className="h-5 w-5" />}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                  <h3 className="text-sm sm:text-lg font-black text-foreground truncate">
                    {moment(selectedDayCalculations.dateStr).format("dddd, DD MMMM YYYY")}
                  </h3>
                  {selectedDayCalculations.hasRecord && selectedDayCalculations.record ? (
                    <span className="rounded-md border border-border bg-muted/60 px-2 py-0.5 text-[10px] sm:text-xs font-bold capitalize text-foreground shrink-0">
                      {selectedDayCalculations.record.status.replace(/_/g, " ")}
                    </span>
                  ) : (
                    <span className="rounded-md border border-border bg-muted px-2 py-0.5 text-[10px] sm:text-xs font-semibold text-muted-foreground shrink-0">
                      {selectedDayCalculations.isWeekend ? "Weekend Off" : "Absent / Unlogged"}
                    </span>
                  )}
                  {selectedDayCalculations.hasRecord && (
                    selectedDayCalculations.hasAnomaly ? (
                      <span className="inline-flex items-center gap-1 rounded-full border border-destructive/30 bg-destructive/10 px-2 py-0.5 text-[10px] sm:text-xs font-bold text-destructive shrink-0">
                        <AlertTriangle className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                        Roaming Flagged
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] sm:text-xs font-semibold text-emerald-700 dark:text-emerald-400 shrink-0">
                        <ShieldCheck className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                        Verified
                      </span>
                    )
                  )}
                </div>
                <p className="text-[11px] sm:text-xs text-muted-foreground mt-0.5 truncate">
                  {selectedEmployee ? `${selectedEmployee.firstName} ${selectedEmployee.lastName}` : "Employee"}
                  {selectedEmployee?.designation?.name ? ` · ${selectedEmployee.designation.name}` : ""}
                  {" · Day Presence & GPS Audit"}
                </p>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedDayDate(null);
                setSelectedDayRecord(null);
                setSelectedDayIsWeekend(false);
              }}
              className="gap-1.5 text-xs font-semibold self-end sm:self-center hover:bg-muted shrink-0"
            >
              <X className="h-4 w-4" />
              Close
            </Button>
          </div>

          {selectedDayCalculations.hasRecord && selectedDayCalculations.record ? (
            <>
              {/* Detailed 24h Day Timeline Bar */}
              <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
                  <span className="flex items-center gap-1.5 text-foreground font-bold">
                    <Clock className="h-3.5 w-3.5 text-primary" />
                    24-Hour Day Timeline
                  </span>
                  <span>Office Shift: 09:00 AM – 06:00 PM</span>
                </div>

                <div className="h-10 pt-0.5 relative">
                  <AttendanceTimelineBar
                    loginTime={selectedDayCalculations.record.loginTime}
                    logoutTime={selectedDayCalculations.record.logoutTime}
                    attendanceDate={selectedDayCalculations.record.attendanceDate}
                    status={selectedDayCalculations.record.status}
                    workedHours={selectedDayCalculations.record.workedHours}
                    effectiveWorkedHours={selectedDayCalculations.record.effectiveWorkedHours}
                    roamingAnomalyDetected={selectedDayCalculations.record.roamingAnomalyDetected}
                    outOfFenceHeartbeats={selectedDayCalculations.record.outOfFenceHeartbeats}
                    compact={false}
                    showTimeMarkers={true}
                    interactive={true}
                  />
                </div>

                <div className="flex flex-wrap items-center gap-4 pt-2 text-[11px] text-muted-foreground border-t border-border/40">
                  <span className="flex items-center gap-1.5 font-medium">
                    <span className="h-2.5 w-2.5 rounded-xs bg-emerald-500" />
                    Present / Active
                  </span>
                  <span className="flex items-center gap-1.5 font-medium">
                    <span className="h-2.5 w-2.5 rounded-xs bg-rose-500" />
                    Office Hours Deficit
                  </span>
                  <span className="flex items-center gap-1.5 font-medium">
                    <span className="h-2.5 w-2.5 rounded-xs bg-muted/60 border border-border" />
                    Off Shift
                  </span>
                </div>
              </div>

              {/* Shift Compliance & Timing Grid (4 Metric Cards) */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="rounded-xl border border-border bg-card p-3.5 shadow-xs">
                  <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                    Check In
                  </span>
                  <p className="mt-1 text-base font-bold text-foreground tabular-nums">
                    {selectedDayCalculations.record.loginTime
                      ? moment(selectedDayCalculations.record.loginTime, "HH:mm:ss").format("hh:mm A")
                      : "—"}
                  </p>
                  <span className={cn("text-[11px] font-semibold", selectedDayCalculations.arrivalColor)}>
                    {selectedDayCalculations.arrivalStatus}
                  </span>
                </div>

                <div className="rounded-xl border border-border bg-card p-3.5 shadow-xs">
                  <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                    Check Out
                  </span>
                  <p className="mt-1 text-base font-bold text-foreground tabular-nums">
                    {selectedDayCalculations.record.logoutTime
                      ? moment(selectedDayCalculations.record.logoutTime, "HH:mm:ss").format("hh:mm A")
                      : selectedDayCalculations.isShiftActive
                      ? "Active"
                      : "—"}
                  </p>
                  <span className={cn("text-[11px] font-semibold", selectedDayCalculations.departureColor)}>
                    {selectedDayCalculations.departureStatus}
                  </span>
                </div>

                <div className="rounded-xl border border-border bg-card p-3.5 shadow-xs">
                  <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                    Gross Hours
                  </span>
                  <p className="mt-1 text-base font-bold text-foreground tabular-nums">
                    {selectedDayCalculations.grossHours.toFixed(2)}h
                  </p>
                  <span className="text-[11px] text-muted-foreground">Total logged</span>
                </div>

                <div className="rounded-xl border border-border bg-card p-3.5 shadow-xs">
                  <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                    Effective Hours
                  </span>
                  <p
                    className={cn(
                      "mt-1 text-base font-bold tabular-nums",
                      selectedDayCalculations.roamingDiscrepancy > 0
                        ? "text-amber-600 dark:text-amber-400"
                        : "text-emerald-600 dark:text-emerald-400"
                    )}
                  >
                    {selectedDayCalculations.effectiveHours.toFixed(2)}h
                  </p>
                  <span className="text-[11px] text-muted-foreground">
                    {selectedDayCalculations.roamingDiscrepancy > 0
                      ? `-${selectedDayCalculations.roamingDiscrepancy.toFixed(2)}h roaming`
                      : "Verified"}
                  </span>
                </div>
              </div>

              {/* Anomaly callout if roaming flagged */}
              {selectedDayCalculations.hasAnomaly && (
                <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-destructive">
                      Discrepancy / Roaming Flagged
                    </h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      {selectedDayCalculations.record.roamingNotes ||
                        `User was detected outside the office geofence for ${selectedDayCalculations.outOfFence} periodic checks. Effective worked hours have been adjusted.`}
                    </p>
                  </div>
                </div>
              )}

              {/* Presence Telemetry & Geofence Details */}
              <div className="rounded-xl border border-border bg-card p-4 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-primary" />
                  Presence Telemetry & Geofence
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-muted/30">
                    <span className="text-muted-foreground">Assigned Office</span>
                    <span className="font-semibold text-foreground">
                      {selectedDayCalculations.record.officeLocation?.name || "Corporate HQ"} ({selectedDayCalculations.officeRadius}m)
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-muted/30">
                    <span className="text-muted-foreground">Check-in Distance</span>
                    <span className="font-semibold text-foreground">
                      {selectedDayCalculations.record.loginDistance != null
                        ? `${selectedDayCalculations.record.loginDistance}m`
                        : "—"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-muted/30">
                    <span className="text-muted-foreground">Face Verification</span>
                    <span
                      className={cn(
                        "font-semibold flex items-center gap-1",
                        selectedDayCalculations.record.faceVerified
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-muted-foreground"
                      )}
                    >
                      <ScanFace className="h-3.5 w-3.5" />
                      {selectedDayCalculations.record.faceVerified ? "Verified Match" : "Not Enrolled / Skipped"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-muted/30">
                    <span className="text-muted-foreground">Periodic Geo-Heartbeats</span>
                    <span className="font-semibold text-foreground">
                      {selectedDayCalculations.validPings} valid / {selectedDayCalculations.totalPings} total (
                      {selectedDayCalculations.presencePct}%)
                    </span>
                  </div>
                </div>
              </div>

              {/* GPS Breadcrumbs & Heartbeats Track (Embedded Inline) */}
              <div className="rounded-xl border border-border bg-card p-4 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                    <Activity className="h-4 w-4 text-primary" />
                    GPS Breadcrumbs & Heartbeats Track ({selectedDayCalculations.heartbeats.length} recorded)
                  </h4>
                  {selectedDayCalculations.record.officeLocation && (
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      Office: {selectedDayCalculations.record.officeLocation.name} (Radius:{" "}
                      {selectedDayCalculations.record.officeLocation.geoRadiusMeters || 200}m)
                    </span>
                  )}
                </div>

                {/* Presence Distribution Progress Bar */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Presence Distribution</span>
                    <span className="font-medium text-foreground">
                      {selectedDayCalculations.validPings} In-Office / {selectedDayCalculations.outOfFence} Away
                    </span>
                  </div>
                  <div className="h-2.5 w-full rounded-full bg-muted overflow-hidden flex">
                    <div
                      style={{ width: `${selectedDayCalculations.presencePct}%` }}
                      className="bg-emerald-500 transition-all duration-500"
                      title={`${selectedDayCalculations.validPings} In-fence pings`}
                    />
                    <div
                      style={{ width: `${100 - selectedDayCalculations.presencePct}%` }}
                      className="bg-destructive transition-all duration-500"
                      title={`${selectedDayCalculations.outOfFence} Out-of-fence pings`}
                    />
                  </div>
                </div>

                {/* Heartbeat Breadcrumbs Timeline */}
                {selectedDayCalculations.heartbeats.length === 0 ? (
                  <div className="rounded-xl border border-border bg-muted/20 p-6 text-center">
                    <p className="text-xs text-muted-foreground">
                      No periodic background GPS heartbeats logged for this session.
                    </p>
                  </div>
                ) : (
                  <div className="relative pl-6 space-y-3 pt-2 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-border max-h-80 overflow-y-auto pr-2">
                    {selectedDayCalculations.heartbeats.map((hb, index) => {
                      const mapUrl = `https://www.google.com/maps?q=${hb.latitude},${hb.longitude}`;
                      return (
                        <div
                          key={hb.id || index}
                          className="relative flex items-start justify-between gap-4 text-xs group"
                        >
                          {/* Node Dot */}
                          <span
                            className={cn(
                              "absolute -left-6 top-1 h-3 w-3 rounded-full border-2 border-card ring-2 transition-all",
                              hb.isMocked
                                ? "bg-destructive ring-destructive/30"
                                : hb.isWithinGeofence
                                ? "bg-emerald-500 ring-emerald-500/30"
                                : "bg-destructive ring-destructive/30"
                            )}
                          />

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-foreground tabular-nums">
                                {moment(hb.timestamp).format("hh:mm A")}
                              </span>
                              <span
                                className={cn(
                                  "inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider",
                                  hb.isMocked
                                    ? "bg-destructive/10 text-destructive border border-destructive/20"
                                    : hb.isWithinGeofence
                                    ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20"
                                    : "bg-destructive/10 text-destructive border border-destructive/20"
                                )}
                              >
                                {hb.isMocked
                                  ? "Mock GPS"
                                  : hb.isWithinGeofence
                                  ? "Inside Office"
                                  : "Outside Office"}
                              </span>
                            </div>
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground mt-0.5">
                              <span className="flex items-center gap-1">
                                <Compass className="h-3 w-3" />
                                {hb.distanceMeters}m from office
                              </span>
                              {hb.accuracyMeters != null && (
                                <span>±{Math.round(hb.accuracyMeters)}m precision</span>
                              )}
                              {hb.batteryLevel != null && (
                                <span className="flex items-center gap-1">
                                  <BatteryCharging className="h-3 w-3" />
                                  {Math.round(hb.batteryLevel * 100)}%
                                </span>
                              )}
                            </div>
                          </div>

                          {/* External Map Link */}
                          <a
                            href={mapUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-primary transition-colors shrink-0 mt-0.5"
                          >
                            View map
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="rounded-xl border border-dashed border-border bg-muted/20 p-8 text-center space-y-2">
              <Calendar className="h-8 w-8 text-muted-foreground/60 mx-auto" />
              <h4 className="text-sm font-semibold text-foreground">
                No Attendance Record for this Date
              </h4>
              <p className="text-xs text-muted-foreground max-w-md mx-auto">
                {selectedDayCalculations.isWeekend
                  ? "This date falls on a weekend scheduled as non-working."
                  : "No clock-in, clock-out, or telemetry records were submitted for this employee on this working day."}
              </p>
            </div>
          )}
        </div>
      )}

      {/* --------------------------------------------------------------------- */}
      {/* 7. View Mode Selector: Timeline vs Table vs Both                      */}
      {/* --------------------------------------------------------------------- */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 w-full">
        <div className="min-w-0">
          <h3 className="text-sm sm:text-base font-black text-foreground tracking-tight">
            Detailed Daily Attendance Logs ({timelineDays.length} Days Evaluated)
          </h3>
          <p className="text-[11px] sm:text-xs text-muted-foreground mt-0.5">
            Click any day row to inspect full GPS telemetry and biometric verification
          </p>
        </div>

        <div className="grid grid-cols-3 sm:flex items-center gap-1 rounded-xl bg-muted/50 p-1 border border-border/80 w-full sm:w-auto shrink-0">
          <button
            onClick={() => setViewMode("timeline")}
            className={cn(
              "flex items-center justify-center gap-1 sm:gap-1.5 rounded-lg px-2 sm:px-3 py-1.5 text-xs font-bold transition-all cursor-pointer truncate",
              viewMode === "timeline"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <BarChart3 className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">Timeline</span>
          </button>
          <button
            onClick={() => setViewMode("table")}
            className={cn(
              "flex items-center justify-center gap-1 sm:gap-1.5 rounded-lg px-2 sm:px-3 py-1.5 text-xs font-bold transition-all cursor-pointer truncate",
              viewMode === "table"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Layers className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">Table</span>
          </button>
          <button
            onClick={() => setViewMode("both")}
            className={cn(
              "flex items-center justify-center gap-1 sm:gap-1.5 rounded-lg px-2 sm:px-3 py-1.5 text-xs font-bold transition-all cursor-pointer truncate",
              viewMode === "both"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <span className="truncate">Both</span>
          </button>
        </div>
      </div>

      {/* --------------------------------------------------------------------- */}
      {/* 8. Synchronized Day-by-Day 24-Hour Timeline Matrix                    */}
      {/* --------------------------------------------------------------------- */}
      {(viewMode === "timeline" || viewMode === "both") && (
        <div className="rounded-2xl border border-border bg-card shadow-xs overflow-hidden w-full">
          {/* Synchronized 24-Hour Ruler Header (hidden on mobile, visible on md+) */}
          <div className="border-b border-border bg-muted/40 px-4 py-3 sm:px-6 hidden md:block">
            <div className="flex items-center gap-4">
              {/* Left Column: Date & Meta Label Header */}
              <div className="w-48 shrink-0">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Date / Shift
                </span>
              </div>

              {/* Right Column: 24h Ruler Axis */}
              <div className="relative flex-1 h-7">
                <div className="absolute inset-0 flex items-center justify-between">
                  {majorHours.map((tick) => (
                    <div
                      key={tick.hour}
                      className="flex flex-col items-center"
                      style={{
                        position: "absolute",
                        left: `${(tick.hour / 24) * 100}%`,
                        transform:
                          tick.hour === 0
                            ? "none"
                            : tick.hour === 24
                            ? "translateX(-100%)"
                            : "translateX(-50%)",
                      }}
                    >
                      <span
                        className={cn(
                          "text-[10px] font-semibold tabular-nums",
                          tick.isShift
                            ? "text-primary font-bold"
                            : "text-muted-foreground"
                        )}
                      >
                        {tick.label}
                      </span>
                      <div
                        className={cn(
                          "h-2 w-px mt-0.5",
                          tick.isShift ? "bg-primary/70 h-2.5" : "bg-border"
                        )}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Day Rows List */}
          <div className="divide-y divide-border/60">
            {paginatedTimelineDays.map(({ dateStr, dateMoment, record, isWeekend, dayOfWeek }) => {
              const isPresent = record && (record.status === "present" || (!!record.loginTime && record.status !== "absent"));
              const gross = Number(record?.workedHours) || 0;
              const effective = record?.effectiveWorkedHours != null ? Number(record.effectiveWorkedHours) : gross;
              const isSelected = selectedDayDate === dateStr;

              return (
                <div
                  key={dateStr}
                  onClick={() => {
                    setSelectedDayDate(dateStr);
                    setSelectedDayRecord(record || null);
                    setSelectedDayIsWeekend(isWeekend);
                    const el = document.getElementById("inline-day-telemetry");
                    if (el) {
                      el.scrollIntoView({ behavior: "smooth", block: "nearest" });
                    }
                  }}
                  className={cn(
                    "group flex flex-col md:flex-row md:items-center gap-2.5 md:gap-4 px-3 sm:px-6 py-3 sm:py-3.5 transition-all",
                    record ? "hover:bg-muted/40 cursor-pointer" : "opacity-80 bg-muted/10 cursor-pointer",
                    isWeekend && "bg-muted/20",
                    isSelected && "bg-primary/10 ring-2 ring-primary/60 border-primary rounded-xl shadow-xs"
                  )}
                >
                  {/* Left Column: Date and Day metadata */}
                  <div className="w-full md:w-48 shrink-0 flex items-center justify-between md:flex-col md:items-start md:justify-center">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-foreground">
                          {dateMoment.format("DD MMM")}
                        </span>
                        <span
                          className={cn(
                            "rounded px-1.5 py-0.5 text-[10px] font-semibold",
                            isWeekend
                              ? "bg-muted text-muted-foreground"
                              : "bg-primary/10 text-primary"
                          )}
                        >
                          {dayOfWeek}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 mt-0.5">
                        {record?.loginTime ? (
                          <span className="text-[11px] font-medium text-foreground tabular-nums">
                            {moment(record.loginTime, "HH:mm:ss").format("hh:mm A")}
                            {" – "}
                            {record.logoutTime
                              ? moment(record.logoutTime, "HH:mm:ss").format("hh:mm A")
                              : "Active"}
                          </span>
                        ) : (
                          <span className="text-[11px] text-muted-foreground italic">
                            {isWeekend ? "Weekend Off" : "No Shift Logged"}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className="mt-0 md:mt-1.5 flex items-center gap-1.5 shrink-0">
                      {record ? (
                        <span
                          className={cn(
                            "rounded-md border px-2 py-0.5 text-[10px] font-bold capitalize",
                            record.status === "present"
                              ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20"
                              : record.status === "late_login"
                              ? "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20"
                              : record.status === "early_logout"
                              ? "bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20"
                              : record.status === "absent"
                              ? "bg-destructive/10 text-destructive border-destructive/20"
                              : "bg-muted text-muted-foreground border-border"
                          )}
                        >
                          {record.status.replace(/_/g, " ")}
                        </span>
                      ) : (
                        <span className="text-[10px] text-muted-foreground">
                          {isWeekend ? "Non-Working" : "Unlogged"}
                        </span>
                      )}

                      {record && effective > 0 && (
                        <span className="text-[11px] font-bold text-foreground tabular-nums">
                          {effective.toFixed(1)}h
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Right Column: Continuous 24h Timeline Bar */}
                  <div className="flex-1 w-full flex items-center h-8">
                    {record && (record.loginTime || isPresent) ? (
                      <AttendanceTimelineBar
                        loginTime={record.loginTime}
                        logoutTime={record.logoutTime}
                        attendanceDate={record.attendanceDate}
                        status={record.status}
                        workedHours={record.workedHours}
                        effectiveWorkedHours={record.effectiveWorkedHours}
                        roamingAnomalyDetected={record.roamingAnomalyDetected}
                        outOfFenceHeartbeats={record.outOfFenceHeartbeats}
                        compact={false}
                        showTimeMarkers={false}
                        interactive={true}
                      />
                    ) : (
                      /* Off-hours empty track */
                      <div className="relative h-6 w-full rounded-md border border-dashed border-border/80 bg-muted/20 flex items-center justify-center">
                        <span className="text-[10px] font-medium text-muted-foreground">
                          {isWeekend ? "Weekend" : "Absent / No Record"}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Timeline Pagination Footer */}
          {timelineDays.length > PAGE_SIZE && (
            <Pagination
              currentPage={timelinePage}
              totalPages={totalTimelinePages}
              total={timelineDays.length}
              pageSize={PAGE_SIZE}
              onPageChange={setTimelinePage}
              label="days"
              className="border-t border-border/60 rounded-t-none"
            />
          )}
        </div>
      )}

      {/* --------------------------------------------------------------------- */}
      {/* 9. Comprehensive Daily Audit Log Table                                */}
      {/* --------------------------------------------------------------------- */}
      {(viewMode === "table" || viewMode === "both") && (
        <div className="rounded-2xl border border-border bg-card shadow-xs overflow-hidden w-full max-w-full">
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left text-xs min-w-[640px]">
              <thead className="border-b border-border bg-muted/40 font-bold uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Shift Timing</th>
                  <th className="px-4 py-3">Gross / Effective</th>
                  <th className="px-4 py-3">Telemetry / GPS</th>
                  <th className="px-4 py-3">Verification</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {employeeRecords.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                      No attendance records found for this employee in the selected timeframe.
                    </td>
                  </tr>
                ) : (
                  paginatedTableRecords.map((r) => {
                    const gross = Number(r.workedHours) || 0;
                    const effective = r.effectiveWorkedHours != null ? Number(r.effectiveWorkedHours) : gross;
                    const diff = Math.max(0, gross - effective);
                    const totalPings = r.totalHeartbeats || 0;
                    const validPings = r.validHeartbeats || 0;
                    const pct = totalPings > 0 ? Math.round((validPings / totalPings) * 100) : 100;
                    const isSelected = selectedDayDate === r.attendanceDate;

                    return (
                      <tr
                        key={r.id}
                        className={cn(
                          "transition-colors group cursor-pointer",
                          isSelected
                            ? "bg-primary/10 font-medium"
                            : "hover:bg-muted/40"
                        )}
                        onClick={() => {
                          setSelectedDayDate(r.attendanceDate);
                          setSelectedDayRecord(r);
                          setSelectedDayIsWeekend(false);
                          const el = document.getElementById("inline-day-telemetry");
                          if (el) {
                            el.scrollIntoView({ behavior: "smooth", block: "nearest" });
                          }
                        }}
                      >
                        {/* Date */}
                        <td className="px-4 py-3 font-medium">
                          <div className="font-bold text-foreground">
                            {moment(r.attendanceDate).format("DD MMM YYYY")}
                          </div>
                          <div className="text-[11px] text-muted-foreground">
                            {moment(r.attendanceDate).format("dddd")}
                          </div>
                        </td>

                        {/* Shift Timing */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5 font-semibold tabular-nums text-foreground">
                            <span>
                              {r.loginTime ? moment(r.loginTime, "HH:mm:ss").format("hh:mm A") : "—"}
                            </span>
                            <ArrowRight className="h-3 w-3 text-muted-foreground" />
                            <span>
                              {r.logoutTime ? moment(r.logoutTime, "HH:mm:ss").format("hh:mm A") : "Active"}
                            </span>
                          </div>
                        </td>

                        {/* Gross vs Effective Hours */}
                        <td className="px-4 py-3">
                          <div className="font-bold tabular-nums text-foreground">
                            {effective.toFixed(2)}h
                          </div>
                          {diff > 0 ? (
                            <div className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold">
                              -{diff.toFixed(2)}h roaming deducted
                            </div>
                          ) : (
                            <div className="text-[10px] text-muted-foreground">
                              Gross: {gross.toFixed(2)}h
                            </div>
                          )}
                        </td>

                        {/* GPS Telemetry */}
                        <td className="px-4 py-3">
                          <span
                            className={cn(
                              "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-semibold",
                              r.roamingAnomalyDetected
                                ? "bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20"
                                : "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20"
                            )}
                          >
                            {r.roamingAnomalyDetected ? (
                              <AlertTriangle className="h-3 w-3" />
                            ) : (
                              <ShieldCheck className="h-3 w-3" />
                            )}
                            {totalPings > 0 ? `${pct}% (${validPings}/${totalPings})` : "Geofence Verified"}
                          </span>
                        </td>

                        {/* Biometrics */}
                        <td className="px-4 py-3">
                          {r.faceVerified ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                              <ScanFace className="h-3.5 w-3.5" />
                              Face Verified
                            </span>
                          ) : (
                            <span className="text-[11px] text-muted-foreground">PIN / Manual</span>
                          )}
                        </td>

                        {/* Status */}
                        <td className="px-4 py-3">
                          <span
                            className={cn(
                              "rounded-md border px-2 py-0.5 text-[10px] font-bold capitalize",
                              r.status === "present"
                                ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20"
                                : r.status === "late_login"
                                ? "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20"
                                : r.status === "early_logout"
                                ? "bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20"
                                : "bg-muted text-muted-foreground border-border"
                            )}
                          >
                            {r.status.replace(/_/g, " ")}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3 text-right">
                          <Button
                            variant={isSelected ? "default" : "outline"}
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedDayDate(r.attendanceDate);
                              setSelectedDayRecord(r);
                              setSelectedDayIsWeekend(false);
                              const el = document.getElementById("inline-day-telemetry");
                              if (el) {
                                el.scrollIntoView({ behavior: "smooth", block: "nearest" });
                              }
                            }}
                            className="h-7 text-[11px] gap-1 rounded-lg"
                          >
                            <Activity className="h-3 w-3" />
                            {isSelected ? "Inspecting" : "Inspect"}
                          </Button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Table Pagination Footer */}
          {employeeRecords.length > PAGE_SIZE && (
            <Pagination
              currentPage={tablePage}
              totalPages={totalTablePages}
              total={employeeRecords.length}
              pageSize={PAGE_SIZE}
              onPageChange={setTablePage}
              label="attendance records"
              className="border-t border-border/60 rounded-t-none"
            />
          )}
        </div>
      )}
    </div>
  );
}
