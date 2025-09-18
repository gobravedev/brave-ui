import { useTranslation } from 'react-i18next'
import { useSelector, useDispatch } from 'react-redux'
import { setUserItem } from '@/store/userSlice'
import i18n from '../i18n'

export const useI18n = () => {
  const dispatch = useDispatch()
  const locale = useSelector((state:any) => state.user.locale)

  const changeLanguage = (lng: string) => {
    dispatch(setUserItem({ locale: lng }))
    i18n.changeLanguage(lng === 'zh_CN' ? 'zh' : 'en') // 对应 i18next 语言包
  }

  return {
    t: i18n.t.bind(i18n),
    locale,
    changeLanguage,
  }
}
