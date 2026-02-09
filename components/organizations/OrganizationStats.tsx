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
                icon={Building2}
                label="Total Departments"
                value={totalOrgs}
                color="text-white"
                gradient="bg-linear-to-br from-blue-600 to-blue-400"
                index="01"
            />
            <Stat
                icon={Users}
                label="Total Employees"
                value={totalEmployees}
                color="text-white"
                gradient="bg-linear-to-br from-primary to-primary/60"
                index="02"
            />
            <Stat
                icon={PieChart}
                label="Avg per Department"
                value={avgEmployees}
                color="text-white"
                gradient="bg-linear-to-br from-pink-600 to-rose-400"
                index="03"
            />

        </div>
    );

}
