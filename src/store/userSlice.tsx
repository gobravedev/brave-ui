import { createSlice, PayloadAction } from '@reduxjs/toolkit'

const locale = localStorage.getItem('locale')
const theme = localStorage.getItem('theme')
const baseURL = localStorage.getItem('baseURL')

interface UserState {
    locale: string;
    theme:string;
    baseURL:string;
}
const contextSlice = createSlice({
    name: 'user',
    initialState: {
        locale: locale
            ? locale  // 如果存在，从 localStorage 解析
            : 'en_US',
        theme:theme?theme:"light",
        baseURL:baseURL?`${baseURL}`:""
    },
    reducers: {
        setUserItem(state, action: PayloadAction<Partial<UserState>>) {
            Object.assign(state, action.payload);
            if (action.payload.locale) {
                localStorage.setItem('locale', action.payload.locale)
            }
            if(action.payload.theme){
                localStorage.setItem('theme', action.payload.theme)
            }
            if(action.payload.baseURL){
                localStorage.setItem('baseURL', action.payload.baseURL)
            }
            // debugger
        },
    },
})


export const { setUserItem } = contextSlice.actions
export default contextSlice.reducer


