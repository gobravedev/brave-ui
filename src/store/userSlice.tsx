import { el } from '@faker-js/faker'
import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { getPathname } from "@/utils/utils";

const locale = localStorage.getItem('locale')
const theme = localStorage.getItem('theme')
const baseURL = localStorage.getItem('baseURL')
const authorization = localStorage.getItem('authorization')
const containerURL = localStorage.getItem('containerURL')
const namespace = localStorage.getItem('namespace')
const project = localStorage.getItem('project')
const githubToken = localStorage.getItem('githubToken')
const storeRepos = localStorage.getItem('storeRepos')

interface UserState {
    locale: string;
    theme:string;
    baseURL:string;
    authorization:string|null;
    containerURL:string;
    namespace:string;
    projectObj:any;
    project:any;
    githubToken:any;
    storeRepos:any;
    componentLayout:"simple"|"complex",
    network:"UNKNOW" | "CONNECT" | "NOT_CONNECT"

    
}
const contextSlice = createSlice({
    name: 'user',
    initialState: {
        locale: locale
            ? locale  // 如果存在，从 localStorage 解析
            : 'en_US',
        theme:theme?theme:"light",
        baseURL:baseURL?`${baseURL}`:getPathname(),
        containerURL:containerURL?`${containerURL}`:"",
        authorization:authorization,
        namespace:namespace?`${namespace}`:`default`,
        project:project?`${project}`:`default`,
        projectObj:{},
        githubToken:githubToken,
        storeRepos:storeRepos?storeRepos:"[]",
        componentLayout:"simple",
        network:"UNKNOW"
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
            if(action.payload.authorization){
                localStorage.setItem('authorization', action.payload.authorization)
            }
            if(action.payload.containerURL){
                localStorage.setItem('containerURL', action.payload.containerURL)
            }
            if(action.payload.namespace){
                localStorage.setItem('namespace', action.payload.namespace)
            }
            if(action.payload.project){
                localStorage.setItem('project', action.payload.project)
            }
            if(action.payload.githubToken){
                localStorage.setItem('githubToken', action.payload.githubToken)
            }
            if(action.payload.storeRepos){
                localStorage.setItem('storeRepos', action.payload.storeRepos)
            }
            if(action.payload.componentLayout){
                localStorage.setItem('componentLayout', action.payload.componentLayout)
            }
            // debugger
        },
    },
})


export const { setUserItem } = contextSlice.actions
export default contextSlice.reducer


