// import React, { useState } from "react";
// import { Splitter } from "antd";

// const App = () => {
//   const [panelSize, setPanelSize] = useState(200); // 初始宽度
//   const [expanded, setExpanded] = useState(true);

//   const togglePanel = () => {
//     setExpanded(!expanded);
//     setPanelSize(expanded ? 0 : 200); // 收缩到0或展开到200
//   };

//   return (
//     <div style={{ height: "100vh" }}>
//       <button onClick={togglePanel}>Toggle Panel</button>
//       <Splitter
//         style={{ height: "100%" }}
//       >
//         <Splitter.Panel
//           size={panelSize}
//           style={{
//             transition: "width 10s ease", // 添加动画
//             overflow: "hidden",           // 防止内容溢出
//           }}
//         >
//           左侧内容
//         </Splitter.Panel>
//         <Splitter.Panel>右侧内容</Splitter.Panel>
//       </Splitter>
//     </div>
//   );
// };

// export default App;

import { useEffect, useRef } from "react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";

import {
    getPanelElement,
    getPanelGroupElement,
    getResizeHandleElement,

} from "react-resizable-panels";

export function Example() {
    const refs = useRef(null);

  

    return (
        <PanelGroup direction="vertical">
            <Panel maxSize={75}>
                topaaaaaaaaaaaaaaaaaaaaaaaaaa
            </Panel>
            <PanelResizeHandle />
            <Panel maxSize={75}>
                bottom
            </Panel>
        </PanelGroup>
    );
}
export default Example;
