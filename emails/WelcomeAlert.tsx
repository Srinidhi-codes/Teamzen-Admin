import React from 'react';
import { Section, Text, Button } from '@react-email/components';
import { BaseEmailLayout } from './components/BaseEmailLayout';

export const WelcomeAlert = () => {
    return (
        <BaseEmailLayout
            previewText="Welcome to {{ companyName }}!"
            heroGradient="linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 50%, #C7D2FE 100%)"
            heroIcon="🎉"
            heroTitle="Welcome to {{ companyName }}!"
            heroSubtitle="We're thrilled to have you on board, {{ employeeName }}"
        >
            {/* Message Area */}
            <Section className="px-[40px] pt-[32px] pb-[16px]">
                <Text className="text-[#475569] text-[15px] leading-[1.7] m-0 mb-4">
                    Hello <strong>{"{{ employeeName }}"}</strong>,
                </Text>
                <Text className="text-[#475569] text-[15px] leading-[1.7] m-0">
                    Your account on the <strong>{"{{ companyName }}"} HRMS Portal</strong> has been created successfully.
                    You can now access your dashboard to manage your profile, attendance, leaves, and more.
                </Text>
            </Section>

            {/* Account Details Card */}
            <Section className="px-[40px] pb-[24px]">
                <Section className="bg-[#F8FAFC] border border-solid border-[#E2E8F0] rounded-xl p-[24px]">
                    <Text className="text-[#4F46E5] font-bold m-0 mb-[12px] uppercase tracking-wider text-[13px]">
                        📋 Your Details
                    </Text>
                    {"{% if designation %}"}
                    <Text className="text-[#475569] m-0 mb-2 text-[14px]">
                        <strong className="text-[#4F46E5]">💼 Designation:</strong> {"{{ designation }}"}
                    </Text>
                    {"{% endif %}"}
                    {"{% if department %}"}
                    <Text className="text-[#475569] m-0 mb-2 text-[14px]">
                        <strong className="text-[#4F46E5]">🏢 Department:</strong> {"{{ department }}"}
                    </Text>
                    {"{% endif %}"}
                    {"{% if joiningDate %}"}
                    <Text className="text-[#475569] m-0 mb-2 text-[14px]">
                        <strong className="text-[#4F46E5]">📅 Joining Date:</strong> {"{{ joiningDate }}"}
                    </Text>
                    {"{% endif %}"}
                    {"{% if managerName %}"}
                    <Text className="text-[#475569] m-0 mb-2 text-[14px]">
                        <strong className="text-[#4F46E5]">👤 Reporting To:</strong> {"{{ managerName }}"}
                    </Text>
                    {"{% endif %}"}
                    <Text className="text-[#475569] m-0 text-[14px]">
                        <strong className="text-[#4F46E5]">✉️ Email:</strong> {"{{ employeeEmail }}"}
                    </Text>
                </Section>
            </Section>

            {/* Temporary Password */}
            {"{% if tempPassword %}"}
            <Section className="px-[40px] pb-[24px]">
                <Section className="bg-[#FFFBEB] border border-solid border-[#FDE68A] rounded-xl p-[24px]">
                    <Text className="text-[#92400E] font-bold m-0 mb-[8px] text-[13px]">
                        🔐 Your Temporary Password
                    </Text>
                    <Text className="bg-white border border-dashed border-[#FDE68A] rounded-lg px-[16px] py-[10px] m-0 mb-[8px] font-mono font-bold text-[#1E293B] text-[20px] tracking-widest inline-block">
                        {"{{ tempPassword }}"}
                    </Text>
                    <Text className="text-[#B45309] m-0 text-[12px]">
                        ⚠️ Please change this password after your first login.
                    </Text>
                </Section>
            </Section>
            {"{% endif %}"}

            {/* CTA */}
            <Section className="px-[40px] pb-[40px] text-center">
                <Button
                    className="bg-[#4F46E5] rounded-md text-white px-[24px] py-[12px] font-semibold no-underline text-center inline-block"
                    href={"{{ loginUrl }}"}
                >
                    🚀 Access Your Dashboard
                </Button>
            </Section>
        </BaseEmailLayout>
    );
};
export default WelcomeAlert;
