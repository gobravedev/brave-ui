import { Button } from "antd";
import React, { useRef, useState } from "react";
import ReactDOM from "react-dom";
// import Network from "react-vis-network-graph";
import Graph from "react-graph-vis-ts";

// import "./network.css";
// import nodeData from "./data.json";

function App() {
    const graphRef = useRef<any>(null);
    const [datas, setDatas] = useState("--");
    const _data = {
        nodes: [
            {
                id: "AWS",
                name: "AWS",
                label: "1",
                title: "AWS",
                shape: "image",
                image:
                    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR4qneFgROiufDyIrsXWpq_GhoQWnnxHuoclPljXeXgtlcGEParu75dPQ4TLafJeLJssXc&usqp=CAU",
                size: 20,
                cost: "$1000"
            },
            {
                id: "IBM",
                color: "blue",
                shape: "image",
                label: "2",
                title: "IBM",
                image:
                    "https://upload.wikimedia.org/wikipedia/commons/2/24/IBM_Cloud_logo.png",
                size: 20,
                cost: "$1000"
            },
            {
                id: "SQL",
                color: "blue",
                shape: "image",
                title: "SQL",
                label: "3",
                image:
                    "https://thumbs.dreamstime.com/b/sql-database-icon-logo-design-ui-ux-app-orange-inscription-shadow-96841969.jpg",
                size: 20,
                cost: "$1000"
            },
            {
                id: "S3",
                color: "blue",
                shape: "image",
                // label:"Node 2",
                title: "S3",
                label: "4",
                image: "https://sonraisecurity.com/wp-content/uploads/aws-s3-icon.png",
                size: 20,
                cost: "$1000"
            },
            {
                id: "Azure",
                color: "blue",
                shape: "image",
                // label:"Node 3",
                label: "5",
                title: "Azure",
                image:
                    "https://www.openbravo.com/blog/wp-content/uploads/2020/03/azure-cloud.jpg",
                size: 20,
                cost: "$1000"
            },
            {
                id: "MongoDB",
                color: "blue",
                shape: "image",

                label: "6",
                title: "MongoDB",
                image: "https://cyclr.com/wp-content/uploads/2022/03/ext-553.png",
                size: 20,
                cost: "$1000"
            },
            {
                id: "ELB",
                color: "purple",
                shape: "image",

                label: "7",
                title: "ELB",
                image:
                    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSZPd9rU5qaOuUmt2qwyBi6u_Xrn4PMV21SXNdHj2Me65OgDCStw4chydnmGa0-s1a7e_w&usqp=CAU",
                size: 20,
                cost: "$1000"
            },
            {
                id: "Saas",
                color: "purple",
                shape: "image",

                label: "8",
                title: "Saas",
                image: "https://ongoingwarehouse.com/Pictures/MicrosoftTeams-image.png",
                size: 20,
                cost: "$1000"
            },
            {
                id: "Notion",
                color: "purple",
                shape: "image",

                label: "9",
                title: "Notion",
                image:
                    "https://cdn.icon-icons.com/icons2/2429/PNG/512/notion_logo_icon_147257.png",
                size: 20,
                cost: "$1000"
            },
            {
                id: "Appengine",
                label: "10",
                color: "purple",
                title: "Appengine",
                shape: "image",
                image:
                    "https://www.howtogeek.com/wp-content/uploads/csit/2020/06/29add7ff.png?height=200p&trim=2,2,2,2",
                size: 20,
                cost: "$1000"
            },
            {
                id: "Sematext",
                label: "11",
                color: "purple",
                title: "Sematext",
                shape: "image",
                image:
                    "https://images.g2crowd.com/uploads/product/image/social_landscape/social_landscape_d6fa77d54b71a3a68842371d85aba442/sematext-cloud.jpg",
                size: 20,
                cost: "$1000"
            },
            {
                id: "Jenkins",
                label: "12",
                color: "purple",
                title: "Jenkins",
                shape: "image",
                image:
                    "https://www.learntek.org/blog/wp-content/uploads/2018/05/jenkins_image.png",
                size: 20,
                cost: "$1000"
            },
            {
                id: "Githup",
                label: "13",
                color: "purple",
                title: "Githup",
                shape: "image",
                image: "https://foundations.projectpythia.org/_images/GitHub-logo.png",
                size: 20,
                cost: "$1000"
            }
        ],
        edges: [
            { from: "AWS", to: "IBM", color: "red" },
            { from: "AWS", to: "SQL", color: "red" },
            { from: "IBM", to: "S3", color: "red" },
            { from: "IBM", to: "Azure", color: "red" },
            { from: "IBM", to: "MongoDB", color: "red" },
            { from: "MongoDB", to: "AWS", color: "red" },
            { from: "Azure", to: "MongoDB", color: "red" },
            { from: "MongoDB", to: "ELB", color: "red" },
            { from: "AWS", to: "ELB", color: "purple" },
            { from: "ELB", to: "Saas", color: "purple" },
            { from: "Saas", to: "Notion", color: "purple" },
            { from: "Notion", to: "Appengine", color: "purple" },
            { from: "Githup", to: "Jenkins", color: "purple" },
            { from: "Sematext", to: "Appengine", color: "purple" },
            { from: "Githup", to: "Sematext", color: "purple" },
            { from: "Sematext", to: "AWS", color: "purple" },
            { from: "Jenkins", to: "ELB", color: "purple" }
        ]
    };

    const [data, setData] = useState(_data);

    const options = {
        interaction: {
            selectable: true,
            hover: true
        },
        manipulation: {
            enabled: true,
            initiallyActive: true,
            addNode: false,
            addEdge: false,
            /*  Adding new node to the graph */
            // addNode: (data) => {
            //   // console.log(callback,"callback")
            //   console.log("Addnode is called for dragginggg.........");
            //   console.log(data, "before main console");
            //   data.id = newId;
            //   data.image = newImage;
            //   data.label = newLabel;
            //   data.size = imgsize;
            //   data.title = newTitle;
            //   data.shape = "image";
            //   // if (typeof callback === "function") {
            //   // callback(data); // }
            //   // callback(data);
            //   setId("");
            //   setLabel("");
            //   setTitle("");
            //   setImage("");
            //   setImgsize("");
            //   console.log(data, "myData");
            //   console.log(graphRef, "mygraphical");
            // },
            // addEdge: true,
            editNode: undefined,
            editEdge: true,
            deleteNode: true,
            deleteEdge: true,
            shapeProperties: {
                borderDashes: false,
                useImageSize: false,
                useBorderWithImage: false
            },
            controlNodeStyle: {
                shape: "dot",
                size: 6,
                color: {
                    background: "#ff0000",
                    border: "#3c3c3c",
                    highlight: {
                        background: "#07f968",
                        border: "#3c3c3c"
                    },
                    borderWidth: 2,
                    borderWidthSelected: 2
                }
            },
            height: "100%",
            color: "green",
            hover: "true",
            nodes: {
                size: 20
            }
        }
    };
    function myFunction() {
        // Code for your onclick function goes here
        console.log("Icon image clicked!");
    }
    const handleZoomIn = () => {
        if (graphRef.current) {
            // graphRef.current.zoomIn();
        }
    };
    const handleNodeClick = (event) => {
        console.log("click event is happened");
        console.log("click event is happened in handlenode click");
        console.log(event);
        setDatas(event.nodes[0]);
    };

    // Function to zoom out
    const handleZoomOut = () => {
        if (graphRef.current) {
            // graphRef.current.zoomOut();
        }
    };

    return (
        <>
            <div>
                <div >
                    <div style={{ display: "flex" }}>
                        {/* {nodeData.nodes.map((el:any) => {
              return (
                <div
                  draggable={true}
                  key={el.id}
                  data-label={el.label}
                  data-name={el.name}
                  data-image={el.image}
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    borderRadius: "20%",
                    width: "50px",
                    height: "50px",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center"
                  }}
                  onDragEnd={() => {
                    setData({
                      nodes: [
                        ...data.nodes,
                        {
                          id: el.id,
                          name: el.name,
                          shape: "image",
                          image: el.image,
                          size: 15,
                          label: el.label
                        }
                      ],
                      edges: [...data.edges, { from: el.id, to: "AWS" }]
                    });
                  }}
                >
                  <img src={el.image} width="60%" height="60%" />
                </div>
              );
            })} */}
                    </div>
                </div>

                <div >
                    <Graph
                        graph={data}
                        ref={graphRef}
                        options={options}
                        events={{
                            click: handleNodeClick
                        }}
                        getNetwork={(network) => {
                            network.on("afterDrawing", (ctx) => {
                                data.nodes.forEach((node) => {
                                    const iconImg = new Image();
                                    iconImg.src =
                                        "https://www.iconarchive.com/download/i22783/kyo-tux/phuzion/Sign-Info.ico";
                                    const nodeId = node.id;
                                    const nodePosition = network.getPositions([nodeId])[nodeId];
                                    const nodeSize = 20;
                                    var setVal = sessionStorage.getItem("set");
                                    if (setVal === "yes") {
                                        console.log(setVal);
                                        ctx.font = "14px Arial";
                                        ctx.fillStyle = "#000000";
                                        ctx.textAlign = "center";
                                        ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
                                        ctx.shadowBlur = 5;
                                        ctx.fillStyle = "#ffcc00";
                                        ctx.fillRect(
                                            nodePosition.x + nodeSize + 2,
                                            nodePosition.y + nodeSize - 20,
                                            50,
                                            20
                                        );
                                        ctx.fillText(
                                            node.label,
                                            nodePosition.x,
                                            nodePosition.y + nodeSize + 20
                                        );
                                        ctx.font = "12px Arial";
                                        ctx.color = "black";
                                        ctx.fillStyle = "black";
                                        ctx.textAlign = "left";
                                        ctx.fillText(
                                            node.cost,
                                            nodePosition.x + nodeSize + 5,
                                            nodePosition.y + nodeSize - 5
                                        );
                                    } else if (setVal === "no") {
                                        console.log(setVal);
                                        const iconWidth = 20; // width of the icon image
                                        const iconHeight = 16;
                                        iconImg.src =
                                            "https://www.iconarchive.com/download/i22783/kyo-tux/phuzion/Sign-Info.ico";
                                        ctx.font = "14px Arial";
                                        ctx.fillStyle = "#000000";
                                        ctx.textAlign = "center";
                                        ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
                                        ctx.shadowBlur = 5;
                                        ctx.fillStyle = "#ffcc00";
                                        ctx.drawImage(
                                            iconImg,
                                            nodePosition.x + nodeSize + 5,
                                            nodePosition.y + nodeSize + 5,
                                            iconWidth,
                                            iconHeight
                                        );
                                        iconImg.addEventListener("mouseover", myFunction, "false");
                                    }
                                });
                            });
                        }}
                        style={{ display: "flex", height: "40rem" }}
                    />
                </div>
                <div >
                    <div>
                        <p
                            style={{
                                fontSize: "2rem",
                                color: "blue",
                                display: "flex",
                                justifyContent: "center",
                                fontFamily: "Verdana"
                            }}
                        >
                            <b>Service Name</b>
                        </p>
                        <p
                            style={{
                                fontSize: "1.5rem",
                                display: "flex",
                                justifyContent: "center",
                                fontFamily: "Verdana"
                            }}
                        >
                            <b>{datas}</b>
                        </p>
                    </div>
                </div>
                <div


                    style={{ display: "flex", justifyContent: "space-around" }}
                >
                    <Button
                        onClick={(e) => {
                            sessionStorage.setItem("set", "yes");
                            graphRef.current.updateGraph();
                        }}
                    >
                        Price Tagger
                    </Button>
                    <Button
                        onClick={(e) => {
                            sessionStorage.setItem("set", "no");
                            graphRef.current.updateGraph();
                        }}
                    >
                        Cura
                    </Button>
                    <Button
                        onClick={() => {
                            console.log(data, "hujhgh");
                            console.log(JSON.stringify(data), "########");
                            const jsonString = JSON.stringify(data, null, 2); // Using null, 2 for pretty formatting

                            // Create a Blob from the JSON string
                            const blob = new Blob([jsonString], { type: "application/json" });

                            // Create a URL for the Blob
                            const url = URL.createObjectURL(blob);

                            // Create a link element to download the JSON file
                            const link = document.createElement("a");
                            link.href = url;
                            link.download = "data.json";
                            document.body.appendChild(link);
                            link.click();

                            // Clean up by revoking the URL and removing the link element
                            URL.revokeObjectURL(url);
                            document.body.removeChild(link);
                        }}
                    >
                        Fetch updated data
                    </Button>
                </div>
            </div>
        </>
    );
}

export default App