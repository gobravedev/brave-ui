// useSideView.ts
import { setLLMArgs } from "@/store/llmSlice";
import { useEffect } from "react";
import { useDispatch } from "react-redux";

export const useSideView = (params: any) => {
    const dispatch = useDispatch();
    
    useEffect(() => {
        dispatch(setLLMArgs(params))
        return () => {
             dispatch(setLLMArgs({
                bizType: "default",
                bizId: ""
             }))
        };  // 页面离开时清空关联
    }, [params]);
};