import React from 'react';
import { Section, Text, Button } from '@react-email/components';
import { BaseEmailLayout } from './components/BaseEmailLayout';

export const AnnouncementAlert = () => {
    return (
        <BaseEmailLayout
            previewText="{{ label }}: {{ announcementTitle }}"
            heroGradient="linear-gradient(135deg, {{ bg }} 0%, {{ bgGrad }} 100%)"
            heroIcon="{{ icon }}"
            heroTitle="{{ announcementTitle }}"
            heroBadgeText="{{ label }}"
            heroBadgeBg="{{ labelBg }}"
            heroBadgeColor="{{ labelColor }}"
        >
            {/* Message Area */}
            <Section className="px-[40px] pt-[28px] pb-[24px]">
                <Text className="text-[#475569] text-[15px] leading-[1.7] m-0 mb-4">
                    Hi <strong>{"{{ employeeName }}"}</strong>,
                </Text>
                <Section
                    className="text-[#475569] text-[15px] leading-[1.8] m-0"
                    dangerouslySetInnerHTML={{ __html: "{{ announcementBody }}" }}
                />

                {"{% if hasMeta %}"}
                <Section className="mt-[16px] pt-[12px] border-t border-solid border-[#E2E8F0]">
                    <Text className="text-[#94A3B8] text-[12px] m-0">
                        {"{% if postedBy %}"}Posted by <strong>{"{{ postedBy }}"}</strong>{"{% endif %}"}
                        {"{% if postedBy and postedDate %}"} · {"{% endif %}"}
                        {"{% if postedDate %}"}{"{{ postedDate }}"}{"{% endif %}"}
                    </Text>
                </Section>
                {"{% endif %}"}
            </Section>

            {/* CTA */}
            {"{% if actionUrl %}"}
            <Section className="px-[40px] pb-[40px] text-center">
                <Button
                    className="rounded-md text-white px-[24px] py-[12px] font-semibold no-underline text-center inline-block"
                    style={{ backgroundColor: '{{ accentColor }}' }}
                    href="{{ actionUrl }}"
                >
                    → {"{{ actionText }}"}
                </Button>
            </Section>
            {"{% endif %}"}
        </BaseEmailLayout>
    );
};
export default AnnouncementAlert;
