import React from 'react'
import { useI18n } from '@/hooks/useI18n'
import { Select } from 'antd'
import { useDispatch, useSelector } from 'react-redux'
import { MoonOutlined, SunOutlined } from '@ant-design/icons'
import { setUserItem } from '@/store/userSlice'


const ThemeSelector = () => {
    // const { locale, changeLanguage } = useI18n()
    const { theme } = useSelector((state: any) => state.user)
    const  dispatch= useDispatch()
    
    return (
        <>
            {theme == "light" ?
                <MoonOutlined  onClick={()=>dispatch(setUserItem({theme:"dark"}))}/> :
                <SunOutlined onClick={()=>dispatch(setUserItem({theme:"light"}))}/>
            }
        </>
    )
}

export default ThemeSelector
