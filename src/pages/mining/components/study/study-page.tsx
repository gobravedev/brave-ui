import { forwardRef, useEffect, useImperativeHandle, useMemo, useState } from "react";
import { useI18n } from "@/hooks/useI18n";
import { useNavigate, useOutletContext } from "react-router";
import { Button, Flex, Input, Pagination, Popconfirm, Select, Space, Switch, Table, Tooltip } from "antd";
import axios from "axios";
import { usePagination } from "@/hooks/usePagination";
import { CloseOutlined, PlusCircleOutlined, RedoOutlined } from "@ant-design/icons"
import DataPage from "@/pages/entity/components/data-page";
import {getColumns,getAction} from './columns'

const StudyPage = forwardRef<any, any>(({
    rowSelection, openModal, params, close, hiddenSwitch = false }, ref) => {
        const navigate = useNavigate()

    return <div style={{ maxWidth: "1500px", margin: "1rem auto" }}>
        {/* {locale} */}
        {/* {entityType} */}
        <DataPage
            rowSelection={rowSelection}
            columns={({ openModal, reload, messageApi }: any) => {
                const columns = getColumns()
                const action = getAction( openModal, reload, messageApi,navigate)
                return [...columns, ...action]
            }}

            hiddenSwitch={true} ref={ref} api={`/entity/page/study`} openModal={() => { }} close={close}>

        </DataPage>
    </div>
})


export default StudyPage