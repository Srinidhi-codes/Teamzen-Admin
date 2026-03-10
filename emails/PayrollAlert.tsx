import React from 'react';
import { Section, Text, Button } from '@react-email/components';
import { BaseEmailLayout } from './components/BaseEmailLayout';

export const PayrollAlert = () => {
    return (
        <BaseEmailLayout
            previewText="Salary Processed - {{ month }}"
            heroGradient="linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 50%, #BBF7D0 100%)"
            heroIcon="💰"
            heroTitle="Salary Processed"
            heroSubtitle="{{ month }}"
        >
            {/* Net Salary Highlight */}
            <Section className="px-[40px] pt-[28px] pb-[8px] text-center">
                <Section className="bg-gradient-to-br from-[#065F46] to-[#047857] rounded-[16px] py-[28px] px-[24px] text-center">
                    <Text className="text-[#A7F3D0] m-0 mb-1 text-[12px] font-semibold uppercase tracking-widest">
                        Net Salary Credited
                    </Text>
                    <Text className="text-white m-0 text-[36px] font-extrabold tracking-tight">
                        {"{{ netSalary }}"}
                    </Text>
                    {"{% if paymentDate %}"}
                    <Text className="text-[#A7F3D0] m-0 mt-2 text-[13px]">
                        {"{{ paymentMode }}"} · {"{{ paymentDate }}"}
                    </Text>
                    {"{% endif %}"}
                </Section>
            </Section>

            {/* Message Area */}
            <Section className="px-[40px] pt-[16px] pb-[16px]">
                <Text className="text-[#475569] text-[15px] leading-[1.7] m-0">
                    Hi <strong>{"{{ employeeName }}"}</strong>, your salary for <strong>{"{{ month }}"}</strong> has been processed successfully. Here's the breakdown:
                </Text>
            </Section>

            {/* Employee Info */}
            {"{% if hasEmployeeInfo %}"}
            <Section className="px-[40px] pb-[16px]">
                <Section className="bg-[#F8FAFC] border border-solid border-[#E2E8F0] rounded-xl p-[16px]">
                    {"{% if employeeId %}"}
                    <Text className="text-[#475569] m-0 mb-2 text-[14px]">
                        <strong className="text-[#047857]">🆔 Employee ID:</strong> {"{{ employeeId }}"}
                    </Text>
                    {"{% endif %}"}
                    {"{% if designation %}"}
                    <Text className="text-[#475569] m-0 mb-2 text-[14px]">
                        <strong className="text-[#047857]">💼 Designation:</strong> {"{{ designation }}"}
                    </Text>
                    {"{% endif %}"}
                    {"{% if department %}"}
                    <Text className="text-[#475569] m-0 text-[14px]">
                        <strong className="text-[#047857]">🏢 Department:</strong> {"{{ department }}"}
                    </Text>
                    {"{% endif %}"}
                </Section>
            </Section>
            {"{% endif %}"}

            {/* Earnings */}
            {"{% if hasEarnings %}"}
            <Section className="px-[40px] pb-[8px]">
                <Section className="bg-[#F0FDF4] border border-solid border-[#BBF7D0] rounded-xl p-[16px]">
                    <Text className="text-[#16A34A] font-bold m-0 mb-3 uppercase tracking-wider text-[13px]">
                        💵 Earnings
                    </Text>
                    {/* Rendered earnings rows dynamically injected via Python string replace or fixed block logic */}
                    <Text className="text-[#475569] m-0 mb-2 text-[14px]">
                        Basic Salary: <strong className="text-[#1E293B] float-right">{"{{ basicSalary }}"}</strong>
                    </Text>
                    {"{% if hra %}"}
                    <Text className="text-[#475569] m-0 mb-2 text-[14px]">
                        HRA: <strong className="text-[#1E293B] float-right">{"{{ hra }}"}</strong>
                    </Text>
                    {"{% endif %}"}
                    {"{% if specialAllowance %}"}
                    <Text className="text-[#475569] m-0 mb-2 text-[14px]">
                        Special Allowance: <strong className="text-[#1E293B] float-right">{"{{ specialAllowance }}"}</strong>
                    </Text>
                    {"{% endif %}"}
                    {"{% if otherEarnings %}"}
                    <Text className="text-[#475569] m-0 mb-2 text-[14px]">
                        Other Earnings: <strong className="text-[#1E293B] float-right">{"{{ otherEarnings }}"}</strong>
                    </Text>
                    {"{% endif %}"}

                    <Text className="text-[#1E293B] m-0 mt-3 pt-3 border-t border-solid border-[#F1F5F9] text-[14px] font-bold">
                        Gross Salary: <strong className="text-[#16A34A] font-extrabold float-right">{"{{ grossSalary }}"}</strong>
                    </Text>
                </Section>
            </Section>
            {"{% endif %}"}

            {/* Deductions */}
            {"{% if hasDeductions %}"}
            <Section className="px-[40px] pb-[24px]">
                <Section className="bg-[#FEF2F2] border border-solid border-[#FECACA] rounded-xl p-[16px]">
                    <Text className="text-[#DC2626] font-bold m-0 mb-3 uppercase tracking-wider text-[13px]">
                        📉 Deductions
                    </Text>
                    {"{% if pfDeduction %}"}
                    <Text className="text-[#475569] m-0 mb-2 text-[14px]">
                        Provident Fund: <strong className="text-[#DC2626] float-right">- {"{{ pfDeduction }}"}</strong>
                    </Text>
                    {"{% endif %}"}
                    {"{% if taxDeduction %}"}
                    <Text className="text-[#475569] m-0 mb-2 text-[14px]">
                        Income Tax (TDS): <strong className="text-[#DC2626] float-right">- {"{{ taxDeduction }}"}</strong>
                    </Text>
                    {"{% endif %}"}
                    {"{% if otherDeductions %}"}
                    <Text className="text-[#475569] m-0 mb-2 text-[14px]">
                        Other Deductions: <strong className="text-[#DC2626] float-right">- {"{{ otherDeductions }}"}</strong>
                    </Text>
                    {"{% endif %}"}

                    <Text className="text-[#1E293B] m-0 mt-3 pt-3 border-t border-solid border-[#F1F5F9] text-[14px] font-bold">
                        Total Deductions: <strong className="text-[#DC2626] font-extrabold float-right">- {"{{ totalDeductions }}"}</strong>
                    </Text>
                </Section>
            </Section>
            {"{% endif %}"}

            {/* CTA */}
            <Section className="px-[40px] pb-[40px] text-center">
                <Button
                    className="bg-[#16A34A] rounded-md text-white px-[24px] py-[12px] font-semibold no-underline text-center inline-block"
                    href={"{{ payslipUrl }}"}
                >
                    📄 Download Payslip
                </Button>
            </Section>
        </BaseEmailLayout>
    );
};
export default PayrollAlert;
