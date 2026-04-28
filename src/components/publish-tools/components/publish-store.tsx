import { Tag, Typography } from "antd";
import { FC } from "react";

const PublishStore: FC<any> = ({ publish_urls }) => {

    return <>
        {publish_urls && publish_urls.map((item:any, index:number) => (
            <div key={index}>
                <Tag style={{cursor:"pointer"}} onClick={()=>{
                    window.open(item.https, "_blank")
                }}>{item.name}</Tag>
                <Typography>
                    {/* 换行 */}
                    <pre>
                        <code style={{ whiteSpace: 'pre-wrap' }}>
                            {`git add .
git commit -m 'update'
git remote add ${item.name} ${item.ssh}
git push ${item.name} master`}
                        </code>
                    </pre>
                </Typography>
                {/* <a href={url} target="_blank" rel="noopener noreferrer">{url}</a> */}
            </div>
        ))}
    </>
}
export default PublishStore;