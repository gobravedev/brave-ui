
import { Flex, Tag, theme } from "antd";
import { Tooltip } from "antd/lib";
import { List } from "react-window";
import { type RowComponentProps } from "react-window";


function BigTable2({ rows }: { rows: any[] }) {

    return (
        <>


            <List
                rowComponent={RowComponent}
                rowCount={rows?.length}
                rowHeight={30}
                rowProps={{ rows }}
            />
            <Flex justify="end" gap="small" >
                <Tag color="default">Rows: {rows?.length}</Tag>
            </Flex>
        </>

    );
}
export default BigTable2;

function RowComponent({
    index,
    rows,
    style
}: RowComponentProps<{ rows: any[] }>) {
    const row = rows[index];
    const { token } = theme.useToken();

    return (
        <Flex
            align="center"
            style={{
                ...style,
                backgroundColor: index % 2 ? token.colorBgContainer : token.colorFillQuaternary,
                borderBottom: `1px solid ${token.colorBorderSecondary}`,
                padding: "0 8px",
                fontSize: 13,
                minWidth: "fit-content",
                transition: "background-color 0.2s",
            }}
            className="table-row"
            onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = token.colorFillTertiary;
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = index % 2 ? token.colorBgContainer : token.colorFillQuaternary;
            }}
        >
            {JSON.stringify(row)}
            
            {/* {row.map((value: any, j: number) => (
                <div
                    key={j}
                    style={{
                        flex: "0 0 200px", // ✅ 与表头列宽一致
                        whiteSpace: "nowrap",
                        textOverflow: "ellipsis",
                        overflow: "hidden",
                        padding: "0 8px",
                    }}
                    title={String(value)}
                >
                    {String(value)}
                </div>
            ))} */}
        </Flex>
    );
}

