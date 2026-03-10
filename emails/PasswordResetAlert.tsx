import React from 'react';
import { Section, Text, Button } from '@react-email/components';
import { BaseEmailLayout } from './components/BaseEmailLayout';

export const PasswordResetAlert = () => {
    return (
        <BaseEmailLayout
            previewText="Reset Your Password 🔐"
            heroGradient="linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 50%, #C7D2FE 100%)"
            heroIcon="🔐"
            heroTitle="Password Reset Request"
            heroSubtitle="Expires in 30 minutes"
        >
            {/* Message Area */}
            <Section className="px-[40px] pt-[28px] pb-[16px]">
                <Text className="text-[#475569] text-[15px] leading-[1.7] m-0 mb-4">
                    Hi <strong>{"{{ employeeName }}"}</strong>,
                </Text>
                <Text className="text-[#475569] text-[15px] leading-[1.7] m-0 mb-4">
                    We received a request to reset your password for your <strong>{"{{ companyName }}"}</strong> account. Click the button below to set a new password.
                </Text>
            </Section>

            {/* CTA */}
            <Section className="px-[40px] pb-[24px] text-center">
                <Button
                    className="bg-[#4F46E5] rounded-md text-white px-[24px] py-[12px] font-semibold no-underline text-center inline-block w-full max-w-[250px]"
                    href={"{{ resetUrl }}"}
                >
                    🔑 Reset My Password
                </Button>
            </Section>

            {/* Request Info */}
            {"{% if hasRequestInfo %}"}
            <Section className="px-[40px] pb-[24px]">
                <Section className="bg-[#F8FAFC] border border-solid border-[#E2E8F0] rounded-xl p-[16px]">
                    <Text className="text-[#64748B] font-bold m-0 mb-2 uppercase tracking-wider text-[12px]">
                        🖥️ Request Details
                    </Text>
                    {"{% if ipAddress %}"}
                    <Text className="text-[#64748B] m-0 mb-1 text-[12px]">
                        IP Address: <strong>{"{{ ipAddress }}"}</strong>
                    </Text>
                    {"{% endif %}"}
                    {"{% if browserInfo %}"}
                    <Text className="text-[#64748B] m-0 text-[12px]">
                        Browser: <strong>{"{{ browserInfo }}"}</strong>
                    </Text>
                    {"{% endif %}"}
                </Section>
            </Section>
            {"{% endif %}"}

            {/* Warnings */}
            <Section className="px-[40px] pb-[24px]">
                <Section className="bg-[#FEF2F2] border border-solid border-[#FECACA] rounded-xl p-[16px] mb-4">
                    <Text className="text-[#991B1B] m-0 text-[13px] leading-[1.6]">
                        🛡️ <strong>Didn't request this?</strong> If you didn't request a password reset, please ignore this email or contact your administrator immediately. Your password will remain unchanged.
                    </Text>
                </Section>
                <Section className="bg-[#FFFBEB] border border-solid border-[#FDE68A] rounded-xl p-[16px]">
                    <Text className="text-[#92400E] m-0 text-[13px] leading-[1.6]">
                        ⏳ This link will expire in <strong>30 minutes</strong>. After that, you'll need to request a new password reset.
                    </Text>
                </Section>
            </Section>
        </BaseEmailLayout>
    );
};
export default PasswordResetAlert;
