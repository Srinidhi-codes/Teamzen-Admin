import { render } from '@react-email/components';
import { LeaveRequestAlert } from './emails/LeaveRequestAlert';
import * as fs from 'fs';

async function buildEmail() {
    const html = await render(LeaveRequestAlert(), {
        pretty: true,
    });

    fs.writeFileSync('LeaveRequestAlert.html', html);
    console.log('✅ Email compiled successfully to LeaveRequestAlert.html');
}

buildEmail().catch(console.error);
