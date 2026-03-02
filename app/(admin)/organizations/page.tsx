import OrganizationsPage from '@/components/organizations/Organizations';
import { Suspense } from 'react';

export default function Page() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <OrganizationsPage />
        </Suspense>
    );
}
