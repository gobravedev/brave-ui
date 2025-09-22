import { createSlice, PayloadAction } from '@reduxjs/toolkit'

const locale = localStorage.getItem('locale')
const theme = localStorage.getItem('theme')
interface UserState {
    locale: string;
    theme:string
}
const contextSlice = createSlice({
    name: 'user',
    initialState: {
        locale: locale
            ? locale  // 如果存在，从 localStorage 解析
            : 'en_US',
        theme:theme?theme:"light"
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
            // debugger
        },
    },
})


export const { setUserItem } = contextSlice.actions
export default contextSlice.reducer
