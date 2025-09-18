import { useI18n } from '@/hooks/useI18n';
import { useTranslation } from 'react-i18next';

export const useMenuItems = () => {
    const { t } = useI18n();

    return [
        {
            key: "/",
            label: t('home')
        }, {
            key: `/entity-page`,
            label: "研究实体"

        }, {
            key: `/entity-relation`,
            label: "实体关系"

        },

    ]
};
