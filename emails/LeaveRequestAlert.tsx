import React from 'react';
import { Section, Text, Button } from '@react-email/components';
import { BaseEmailLayout } from './components/BaseEmailLayout';

export const LeaveRequestAlert = () => {
    return (
        <BaseEmailLayout
            previewText="Leave Request Submitted"
            heroGradient="linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 50%, #C7D2FE 100%)"
            heroIcon="🏖️"
            heroTitle="Leave Request Submitted"
            heroBadgeText="PENDING"
            heroBadgeBg="#DBEAFE"
            heroBadgeColor="#1E40AF"
        >
            {/* Message Area */}
            <Section className="px-[40px] pt-[28px] pb-[16px]">
                <Text className="text-[#475569] text-[15px] leading-[1.7] m-0 mb-4">
                    Hi <strong>{"{{ managerName }}"}</strong>,
                </Text>
                <Text className="text-[#475569] text-[15px] leading-[1.7] m-0">
                    You have a new leave request from <strong>{"{{ employeeName }}"}</strong>
                    that requires your approval. Here are the details:
                </Text>
            </Section>

            {/* Leave Details */}
            <Section className="px-[40px] pt-[16px] pb-[24px]">
                <Section className="bg-[#F8FAFC] border border-solid border-[#E2E8F0] rounded-xl p-[24px]">
                    <Text className="text-[#3B82F6] font-bold m-0 mb-[12px] uppercase tracking-wider text-[13px]">
                        📋 Request Details
                    </Text>
                    <Text className="text-[#475569] m-0 mb-2 text-[14px]">
                        <strong style={{ color: "#3B82F6" }}>🏷️ Leave Type:</strong> {"{{ leaveType }}"}
                    </Text>
                    <Text className="text-[#475569] m-0 mb-2 text-[14px]">
                        <strong style={{ color: "#3B82F6" }}>📅 Dates:</strong> {"{{ dates }}"}
                    </Text>
                    <Text className="text-[#475569] m-0 mb-2 text-[14px]">
                        <strong style={{ color: "#3B82F6" }}>⏱️ Duration:</strong> {"{{ duration }}"} days
                    </Text>
                </Section>
            </Section>

            {/* CTA */}
            <Section className="px-[40px] pb-[40px] text-center">
                <Button
                    className="bg-[#4F46E5] rounded-md text-white px-[24px] py-[12px] font-semibold no-underline text-center inline-block"
                    href={"{{ dashboardUrl }}"}
                >
                    ✅ Review Request
                </Button>
            </Section>
        </BaseEmailLayout>
    );
};
export default LeaveRequestAlert;
