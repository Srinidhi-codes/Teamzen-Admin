"use client";

import { Organizations } from "@/types/admin";
import { Stat } from "../common/Stats";
import { Building2, Users, PieChart } from "lucide-react";

interface OrganizationStatsProps {
    organizations: Organizations[];
}

export default function OrganizationStats({ organizations }: OrganizationStatsProps) {
    const totalOrgs = organizations.length;
    const totalEmployees = organizations.reduce((sum, org) => sum + org.employeeCount, 0);
    const avgEmployees = totalOrgs > 0 ? Math.round(totalEmployees / totalOrgs) : 0;

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Stat
                icon={<Building2 className="w-8 h-8 text-white" />}
                label="Total Departments"
                value={totalOrgs}
                gradient="from-blue-500 to-blue-600"
            />
            <Stat
                icon={<Users className="w-8 h-8 text-white" />}
                label="Total Employees"
                value={totalEmployees}
                gradient="from-indigo-500 to-purple-600"
            />
            <Stat
                icon={<PieChart className="w-8 h-8 text-white" />}
                label="Avg per Department"
                value={avgEmployees}
                gradient="from-pink-500 to-rose-600"
            />
        </div>
    );
}
