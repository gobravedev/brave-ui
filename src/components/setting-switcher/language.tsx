import React from 'react'
import { useI18n } from '@/hooks/useI18n'
import { Select } from 'antd'

const LanguageSelector = () => {
    const { locale, changeLanguage } = useI18n()

    return (
        <Select
            size='small'
            value={locale}
            style={{ width: 85 }}
            onChange={changeLanguage}
            options={[
                { value: 'zh_CN', label: '中文' },
                { value: 'en_US', label: 'English' },
            ]}
        />
    )
}

export default LanguageSelector
