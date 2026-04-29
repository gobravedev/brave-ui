import { tr } from "@faker-js/faker";
import { Flex, Switch, Tag, Typography } from "antd";
import { FC, useState } from "react";

const PublishStore: FC<any> = ({ publish_urls, path }) => {

    const [type, setType] = useState<any>("SSH");
    return <>
        <Flex justify="end">

            <Switch size="small" unCheckedChildren={"SSH"} checkedChildren={"HTTPS"}
                onChange={(checked) => {
                    setType(checked ? "HTTPS" : "SSH")
                }}
                value={type === "SSH" ? false : true}
            ></Switch>
        </Flex>

        {publish_urls && publish_urls.map((item: any, index: number) => (
            <div key={index}>
                <Tag style={{ cursor: "pointer" }} onClick={() => {
                    window.open(item.https, "_blank")
                }}>{item.name}</Tag>
                <Typography>
                    {/* 换行 */}
                    <pre>
                        <code style={{ whiteSpace: 'pre-wrap' }}>
                            {`cd ${path}
git add .
git commit -m 'update'
git remote add ${item.name} ${type === "SSH" ? item.ssh : item.https}
git push ${item.name} master`}
                        </code>
                    </pre>
                </Typography>
                <Typography>
                    {/* 换行 */}
                    <pre>
                        <code style={{ whiteSpace: 'pre-wrap' }}>
                            {`cd ${path} && git add . && git commit -m 'update' && git push ${item.name} master`}
                        </code>
                    </pre>
                </Typography>
                {/* <a href={url} target="_blank" rel="noopener noreferrer">{url}</a> */}
            </div>
        ))}
    </>
}
export default PublishStore;