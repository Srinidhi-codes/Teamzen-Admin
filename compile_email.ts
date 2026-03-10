import * as ReactDOMServer from 'react-dom/server';
import React from 'react';
import { LeaveRequestAlert } from './emails/LeaveRequestAlert';
import { LeaveRejectedAlert } from './emails/LeaveRejectedAlert';
import { LeaveApprovedAlert } from './emails/LeaveApprovedAlert';
import { AnnouncementAlert } from './emails/AnnouncementAlert';
import { CheckinReminderAlert } from './emails/CheckinReminderAlert';
import { CheckoutReminderAlert } from './emails/CheckoutReminderAlert';
import { AttendanceReportAlert } from './emails/AttendanceReportAlert';
import { WelcomeAlert } from './emails/WelcomeAlert';
import { PasswordResetAlert } from './emails/PasswordResetAlert';
import { PayrollAlert } from './emails/PayrollAlert';
import * as fs from 'fs';

function buildEmail() {
    const renderStr = (Component: React.FC) => {
        return '<!DOCTYPE html>\n' + ReactDOMServer.renderToStaticMarkup(React.createElement(Component));
    };

    fs.writeFileSync('LeaveRequestAlert.html', renderStr(LeaveRequestAlert));
    fs.writeFileSync('LeaveRejectedAlert.html', renderStr(LeaveRejectedAlert));
    fs.writeFileSync('LeaveApprovedAlert.html', renderStr(LeaveApprovedAlert));
    fs.writeFileSync('AnnouncementAlert.html', renderStr(AnnouncementAlert));
    fs.writeFileSync('CheckinReminderAlert.html', renderStr(CheckinReminderAlert));
    fs.writeFileSync('CheckoutReminderAlert.html', renderStr(CheckoutReminderAlert));
    fs.writeFileSync('AttendanceReportAlert.html', renderStr(AttendanceReportAlert));
    fs.writeFileSync('WelcomeAlert.html', renderStr(WelcomeAlert));
    fs.writeFileSync('PasswordResetAlert.html', renderStr(PasswordResetAlert));
    fs.writeFileSync('PayrollAlert.html', renderStr(PayrollAlert));

    console.log('✅ All 10 React Email Templates successfully compiled natively using static React DOM Markup.');
}

buildEmail();
