import React from 'react';
import { Section, Text, Button } from '@react-email/components';
import { BaseEmailLayout } from './components/BaseEmailLayout';

export const CheckoutReminderAlert = () => {
    return (
        <BaseEmailLayout
            previewText="Check-out Reminder 🏠"
            heroGradient="linear-gradient(135deg, #FAF5FF 0%, #F3E8FF 50%, #E9D5FF 100%)"
            heroIcon="🏠"
            heroTitle="Check-out Reminder"
            heroSubtitle="Don't forget to log your checkout!"
        >
            {/* Message Area */}
            <Section className="px-[40px] pt-[28px] pb-[16px]">
                <Text className="text-[#475569] text-[15px] leading-[1.7] m-0 mb-4">
                    Hi <strong>{"{{ employeeName }}"}</strong>,
                </Text>
                <Text className="text-[#475569] text-[15px] leading-[1.7] m-0">
                    Your shift is ending soon at <strong className="text-[#9333EA]">{"{{ shiftEnd }}"}</strong>. Please remember to check out before you leave.
                </Text>
            </Section>

            {/* Quick Info */}
            <Section className="px-[40px] pt-[16px] pb-[24px]">
                <Section className="bg-[#F8FAFC] border border-solid border-[#E2E8F0] rounded-xl p-[24px]">
                    <Text className="text-[#475569] m-0 mb-2 text-[14px]">
                        <strong className="text-[#9333EA]">📅 Date:</strong> {"{{ date }}"}
                    </Text>
                    <Text className="text-[#475569] m-0 mb-2 text-[14px]">
                        <strong className="text-[#9333EA]">✅ Checked In:</strong> {"{{ checkinTime }}"}
                    </Text>
                    <Text className="text-[#475569] m-0 mb-2 text-[14px]">
                        <strong className="text-[#9333EA]">🕕 Shift End:</strong> {"{{ shiftEnd }}"}
                    </Text>
                    <Text className="text-[#475569] m-0 text-[14px]">
                        <strong className="text-[#9333EA]">📍 Status:</strong> <span className="text-[#166534] bg-[#DCFCE7] px-2 py-0.5 rounded-full text-xs font-semibold">Checked In</span>
                    </Text>
                </Section>
            </Section>

            {/* CTA */}
            <Section className="px-[40px] pb-[40px] text-center">
                <Button
                    className="bg-[#9333EA] rounded-md text-white px-[24px] py-[12px] font-semibold no-underline text-center inline-block"
                    href={"{{ dashboardUrl }}"}
                >
                    🏠 Check Out Now
                </Button>
            </Section>
        </BaseEmailLayout>
    );
};
export default CheckoutReminderAlert;
