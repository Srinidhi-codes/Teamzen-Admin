import React from 'react';
import { Section, Text, Button } from '@react-email/components';
import { BaseEmailLayout } from './components/BaseEmailLayout';

export const CheckinReminderAlert = () => {
    return (
        <BaseEmailLayout
            previewText="Check-in Reminder ⏰"
            heroGradient="linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 50%, #BFDBFE 100%)"
            heroIcon="⏰"
            heroTitle="Check-in Reminder"
            heroSubtitle="{{ date }}"
        >
            {/* Message Area */}
            <Section className="px-[40px] pt-[28px] pb-[16px]">
                <Text className="text-[#475569] text-[15px] leading-[1.7] m-0 mb-4">
                    Good morning, <strong>{"{{ employeeName }}"}</strong>! 👋
                </Text>
                <Text className="text-[#475569] text-[15px] leading-[1.7] m-0">
                    This is a friendly reminder to mark your attendance for today. Your shift starts at <strong className="text-[#2563EB]">{"{{ shiftTime }}"}</strong>.
                </Text>
            </Section>

            {/* Quick Info */}
            <Section className="px-[40px] pt-[16px] pb-[24px]">
                <Section className="bg-[#F8FAFC] border border-solid border-[#E2E8F0] rounded-xl p-[24px]">
                    <Text className="text-[#475569] m-0 mb-2 text-[14px]">
                        <strong className="text-[#2563EB]">📅 Date:</strong> {"{{ date }}"}
                    </Text>
                    <Text className="text-[#475569] m-0 mb-2 text-[14px]">
                        <strong className="text-[#2563EB]">🕘 Shift Start:</strong> {"{{ shiftTime }}"}
                    </Text>
                    <Text className="text-[#475569] m-0 text-[14px]">
                        <strong className="text-[#2563EB]">📍 Status:</strong> <span className="text-[#9A3412] bg-[#FFEDD5] px-2 py-0.5 rounded-full text-xs font-semibold">Not Checked In</span>
                    </Text>
                </Section>
            </Section>

            {/* CTA */}
            <Section className="px-[40px] pb-[40px] text-center">
                <Button
                    className="bg-[#2563EB] rounded-md text-white px-[24px] py-[12px] font-semibold no-underline text-center inline-block"
                    href={"{{ dashboardUrl }}"}
                >
                    ✅ Check In Now
                </Button>
            </Section>
        </BaseEmailLayout>
    );
};
export default CheckinReminderAlert;
