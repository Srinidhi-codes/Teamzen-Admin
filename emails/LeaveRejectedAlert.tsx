import React from 'react';
import { Section, Text, Button } from '@react-email/components';
import { BaseEmailLayout } from './components/BaseEmailLayout';

export const LeaveRejectedAlert = () => {
    return (
        <BaseEmailLayout
            previewText="Leave Request Declined"
            heroGradient="linear-gradient(135deg, #FEF2F2 0%, #FECACA 50%, #FCA5A5 100%)"
            heroIcon="❌"
            heroTitle="Leave Request Declined"
            heroBadgeText="REJECTED"
            heroBadgeBg="#FECACA"
            heroBadgeColor="#991B1B"
        >
            {/* Message Area */}
            <Section className="px-[40px] pt-[28px] pb-[16px]">
                <Text className="text-[#475569] text-[15px] leading-[1.7] m-0 mb-4">
                    Hi <strong>{"{{ employeeName }}"}</strong>,
                </Text>
                <Text className="text-[#475569] text-[15px] leading-[1.7] m-0">
                    Unfortunately, your leave request has been <strong className="text-[#DC2626]">declined</strong>. Please review the details below.
                </Text>
            </Section>

            {/* Leave Details */}
            <Section className="px-[40px] pt-[16px] pb-[24px]">
                <Section className="bg-[#FEF2F2] border border-solid border-[#FECACA] rounded-xl p-[24px]">
                    <Text className="text-[#DC2626] font-bold m-0 mb-[12px] uppercase tracking-wider text-[13px]">
                        📋 Leave Details
                    </Text>
                    <Text className="text-[#475569] m-0 mb-2 text-[14px]">
                        <strong style={{ color: "#DC2626" }}>🏷️ Leave Type:</strong> {"{{ leaveType }}"}
                    </Text>
                    <Text className="text-[#475569] m-0 mb-2 text-[14px]">
                        <strong style={{ color: "#DC2626" }}>📅 Dates:</strong> {"{{ dates }}"}
                    </Text>
                    <Text className="text-[#475569] m-0 mb-2 text-[14px]">
                        <strong style={{ color: "#DC2626" }}>⏱️ Duration:</strong> {"{{ duration }}"} days
                    </Text>
                    {"{% if rejectedBy %}"}
                    <Text className="text-[#475569] m-0 text-[14px]">
                        <strong style={{ color: "#DC2626" }}>👤 Rejected By:</strong> {"{{ rejectedBy }}"}
                    </Text>
                    {"{% endif %}"}
                </Section>
            </Section>

            {/* Rejection Reason */}
            {"{% if reason %}"}
            <Section className="px-[40px] pb-[24px]">
                <Section className="bg-[#FFFBEB] rounded-xl border-l-[4px] border-l-[#DC2626] border-solid p-[16px]">
                    <Text className="text-[#92400E] font-bold m-0 mb-1 uppercase tracking-wider text-[12px]">
                        ⚠️ Reason for Rejection
                    </Text>
                    <Text className="text-[#475569] m-0 text-[14px] italic leading-[1.6]">
                        "{"{{ reason }}"}"
                    </Text>
                </Section>
            </Section>
            {"{% endif %}"}

            {/* Suggestion */}
            <Section className="px-[40px] pb-[24px]">
                <Section className="bg-[#EFF6FF] border border-solid border-[#BFDBFE] rounded-xl p-[16px]">
                    <Text className="text-[#1E40AF] m-0 text-[13px] leading-[1.6]">
                        💡 <strong>Tip:</strong> You can discuss alternative dates with your manager or submit a new request with different dates.
                    </Text>
                </Section>
            </Section>

            {/* CTA */}
            <Section className="px-[40px] pb-[40px] text-center">
                <Button
                    className="bg-[#4F46E5] rounded-md text-white px-[24px] py-[12px] font-semibold no-underline text-center inline-block"
                    href={"{{ dashboardUrl }}"}
                >
                    📝 Submit New Request
                </Button>
            </Section>
        </BaseEmailLayout>
    );
};

export default LeaveRejectedAlert;
