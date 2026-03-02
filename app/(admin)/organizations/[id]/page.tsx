"use client";

import OrganizationProfile from "@/components/organizations/OrganizationProfile";
import { useParams } from "next/navigation";

export default function Page() {
    const params = useParams();
    const id = params.id as string;

    return <OrganizationProfile id={id} />;
}
