import React from 'react';
import { Section, Text, Button, Column, Row } from '@react-email/components';
import { BaseEmailLayout } from './components/BaseEmailLayout';

export const AttendanceReportAlert = () => {
    return (
        <BaseEmailLayout
            previewText="Attendance Report - {{ month }}"
            heroGradient="linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 50%, #C7D2FE 100%)"
            heroIcon="📊"
            heroTitle="Attendance Report"
            heroSubtitle="{{ month }}"
        >
            {/* Message Area */}
            <Section className="px-[40px] pt-[28px] pb-[16px]">
                <Text className="text-[#475569] text-[15px] leading-[1.7] m-0 mb-4">
                    Hi <strong>{"{{ employeeName }}"}</strong>, here's your attendance summary for <strong>{"{{ month }}"}</strong>:
                </Text>
            </Section>

            {/* Stats Grid */}
            <Section className="px-[40px] pb-[16px]">
                <table width="100%" border={0} cellSpacing="0" cellPadding="0">
                    <tr>
                        <td align="center" className="pr-[4px]" style={{ width: '33.33%' }}>
                            <Section className="bg-[#F0FDF4] rounded-xl text-center py-[16px] w-full">
                                <Text className="m-0 text-[#16A34A] font-extrabold text-[28px] pb-1">{"{{ daysPresent }}"}</Text>
                                <Text className="m-0 text-[#64748B] text-[11px] font-semibold uppercase tracking-wide">Present</Text>
                            </Section>
                        </td>
                        <td align="center" className="px-[4px]" style={{ width: '33.33%' }}>
                            <Section className="bg-[#FEF2F2] rounded-xl text-center py-[16px] w-full">
                                <Text className="m-0 text-[#DC2626] font-extrabold text-[28px] pb-1">{"{{ daysAbsent }}"}</Text>
                                <Text className="m-0 text-[#64748B] text-[11px] font-semibold uppercase tracking-wide">Absent</Text>
                            </Section>
                        </td>
                        <td align="center" className="pl-[4px]" style={{ width: '33.33%' }}>
                            <Section className="bg-[#EFF6FF] rounded-xl text-center py-[16px] w-full">
                                <Text className="m-0 text-[#2563EB] font-extrabold text-[28px] pb-1">{"{{ daysLeave }}"}</Text>
                                <Text className="m-0 text-[#64748B] text-[11px] font-semibold uppercase tracking-wide">On Leave</Text>
                            </Section>
                        </td>
                    </tr>
                </table>
            </Section>

            {/* Additional Details */}
            <Section className="px-[40px] pb-[24px]">
                <Section className="bg-[#F8FAFC] border border-solid border-[#E2E8F0] rounded-xl p-[24px]">
                    <Text className="text-[#475569] m-0 mb-2 text-[14px]">
                        <strong className="text-[#4F46E5]">📅 Working Days:</strong> {"{{ totalWorkingDays }}"}
                    </Text>
                    <Text className="text-[#475569] m-0 mb-2 text-[14px]">
                        <strong className="text-[#4F46E5]">⏰ Late Arrivals:</strong> {"{{ lateArrivals }}"}
                    </Text>
                    <Text className="text-[#475569] m-0 text-[14px]">
                        <strong className="text-[#4F46E5]">⏱️ Avg. Daily Hours:</strong> {"{{ avgHours }}"}
                    </Text>
                </Section>
            </Section>

            {/* CTA */}
            <Section className="px-[40px] pb-[40px] text-center">
                <Button
                    className="bg-[#4F46E5] rounded-md text-white px-[24px] py-[12px] font-semibold no-underline text-center inline-block"
                    href={"{{ dashboardUrl }}"}
                >
                    📊 View Full Report
                </Button>
            </Section>
        </BaseEmailLayout>
    );
};
export default AttendanceReportAlert;
