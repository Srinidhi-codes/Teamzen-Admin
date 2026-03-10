import React from 'react';
import { Section, Text, Button } from '@react-email/components';
import { BaseEmailLayout } from './components/BaseEmailLayout';

export const LeaveApprovedAlert = () => {
    return (
        <BaseEmailLayout
            previewText="Leave Request Approved"
            heroGradient="linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 50%, #BBF7D0 100%)"
            heroIcon="✅"
            heroTitle="Leave Approved!"
            heroBadgeText="APPROVED"
            heroBadgeBg="#DCFCE7"
            heroBadgeColor="#166534"
        >
            {/* Message Area */}
            <Section className="px-[40px] pt-[28px] pb-[16px]">
                <Text className="text-[#475569] text-[15px] leading-[1.7] m-0 mb-4">
                    Hi <strong>{"{{ employeeName }}"}</strong>,
                </Text>
                <Text className="text-[#475569] text-[15px] leading-[1.7] m-0">
                    Great news! Your leave request has been <strong className="text-[#16A34A]">approved</strong>. Here are the details:
                </Text>
            </Section>

            {/* Leave Details */}
            <Section className="px-[40px] pt-[16px] pb-[24px]">
                <Section className="bg-[#F0FDF4] border border-solid border-[#BBF7D0] rounded-xl p-[24px]">
                    <Text className="text-[#16A34A] font-bold m-0 mb-[12px] uppercase tracking-wider text-[13px]">
                        📋 Leave Details
                    </Text>
                    <Text className="text-[#475569] m-0 mb-2 text-[14px]">
                        <strong style={{ color: "#16A34A" }}>🏷️ Leave Type:</strong> {"{{ leaveType }}"}
                    </Text>
                    <Text className="text-[#475569] m-0 mb-2 text-[14px]">
                        <strong style={{ color: "#16A34A" }}>📅 Dates:</strong> {"{{ dates }}"}
                    </Text>
                    <Text className="text-[#475569] m-0 mb-2 text-[14px]">
                        <strong style={{ color: "#16A34A" }}>⏱️ Duration:</strong> {"{{ duration }}"} days
                    </Text>
                    {"{% if approvedBy %}"}
                    <Text className="text-[#475569] m-0 text-[14px]">
                        <strong style={{ color: "#16A34A" }}>👤 Approved By:</strong> {"{{ approvedBy }}"}
                    </Text>
                    {"{% endif %}"}
                </Section>
            </Section>

            {/* Remarks */}
            {"{% if remarks %}"}
            <Section className="px-[40px] pb-[24px]">
                <Section className="bg-[#F8FAFC] rounded-xl border-l-4 border-l-[#16A34A] border-solid p-[16px]">
                    <Text className="text-[#64748B] font-bold m-0 mb-1 uppercase tracking-wider text-[12px]">
                        💬 Manager Remarks
                    </Text>
                    <Text className="text-[#475569] m-0 text-[14px] italic leading-[1.6]">
                        "{"{{ remarks }}"}"
                    </Text>
                </Section>
            </Section>
            {"{% endif %}"}

            {/* Reminder */}
            <Section className="px-[40px] pb-[24px]">
                <Section className="bg-[#EFF6FF] border border-solid border-[#BFDBFE] rounded-xl p-[16px]">
                    <Text className="text-[#1E40AF] m-0 text-[13px] leading-[1.6]">
                        💡 <strong>Reminder:</strong> Please ensure all pending tasks are handed over before your leave begins. Enjoy your time off!
                    </Text>
                </Section>
            </Section>

            {/* CTA */}
            <Section className="px-[40px] pb-[40px] text-center">
                <Button
                    className="bg-[#16A34A] rounded-md text-white px-[24px] py-[12px] font-semibold no-underline text-center inline-block"
                    href={"{{ dashboardUrl }}"}
                >
                    📊 View on Dashboard
                </Button>
            </Section>
        </BaseEmailLayout>
    );
};
export default LeaveApprovedAlert;
