import { Button, Form, Input } from "antd";
import { useForm } from "antd/es/form/Form";
import React, { useEffect, useRef, useState } from "react";

const KeggPathwayViewer = ({ pathwayId = "hsa04144" }) => {
    const [markers, setMarkers] = useState<any>([]);
    const [from] = useForm()
    const imageUrl = `https://rest.kegg.jp/get/${pathwayId}/image`;

    const loadData = () => {
        fetch(`/brave-api/kegg/pathway/${pathwayId}/markers`)
            .then((res) => res.json())
            .then((data) => setMarkers(data));
    }
    useEffect(() => {
        // 从后端获取坐标标注
        loadData()
    }, [pathwayId]);

    return (
        <>
        <Form onFinish={(values:any)=>{
            console.log(values)
            setMarkers((prev:any)=>[
                ...prev,
                {...values,type: "rectangle"}
            ])
        }}>
            <Form.Item name={"x"} label="x">
                <Input></Input>
            </Form.Item>
            <Form.Item name={"y"} label="y">
                <Input></Input>
            </Form.Item>
            <Form.Item name={"width"} label="width">
                <Input></Input>
            </Form.Item>
            <Form.Item name={"height"} label="height">
                <Input></Input>
            </Form.Item>
            <Form.Item  >
                <Button type="primary" htmlType="submit">submit</Button>
            </Form.Item>
        </Form>
            <Button onClick={loadData}>reload</Button>

            {/* <div style={{ background: "#fff" }}>
                {JSON.stringify(markers)}
                <svg width="800" height="600" style={{ border: "1px solid #ccc" }}>
                    {markers.map((m) => (
                        <circle
                            key={m.id}
                            cx={m.x}
                            cy={m.y}
                            r={10}
                            fill={m.status === "up" ? "rgba(255,0,0,0.5)" : "rgba(0,0,255,0.5)"}
                            stroke="#000"
                            strokeWidth={1}
                        >
                            <title>{m.id}</title>
                        </circle>
                    ))}
                </svg>
            </div> */}
            <hr />
            <ImageWithGlowShapes
                imageUrl={imageUrl}
                shapes={markers}
                // rectangles={[
                //     { x: 50, y: 50, width: 100, height: 80 },
                //     { x: 200, y: 150, width: 120, height: 90, color: "blue" },
                // ]}
            />            {/* <div style={{ position: "relative", display: "inline-block" }}>
                <img
                    src={imageUrl}
                    alt={`KEGG Pathway ${pathwayId}`}
                    style={{ width: "1000px" }}
                />
                <svg
                    style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
       
                        pointerEvents: "none",
                        width: "1000px",
                        height: "1000px"
                    }}
                >
                    {markers.map((m) => (
                        <circle
                            key={m.id}
                            cx={m.x}
                            cy={m.y}
                            r={10}
                            fill={m.status === "up" ? "rgba(255,0,0,0.5)" : "rgba(0,0,255,0.5)"}
                            stroke="#000"
                            strokeWidth={1}
                        >
                            <title>{m.id}</title>
                        </circle>
                    ))}
                </svg>
            </div> */}

        </>
    );
};

export default KeggPathwayViewer;
type Shape =
  | { type: "rectangle"; x: number; y: number; width: number; height: number; color?: string }
  | { type: "circle"; x: number; y: number; radius: number; color?: string };

interface Props {
  imageUrl: string;
  shapes: Shape[];
  canvasWidth?: number;
  canvasHeight?: number;
  blinkInterval?: number; // 控制闪烁周期
}

const ImageWithGlowShapes: React.FC<Props> = ({
  imageUrl,
  shapes,
  canvasWidth = 1000,
  canvasHeight = 1000,
  blinkInterval = 1000,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement>(new Image());
  const [imgLoaded, setImgLoaded] = useState(false);
  const startTimeRef = useRef(Date.now());

  useEffect(() => {
    const img = imgRef.current;
    img.src = imageUrl;
    img.onload = () => setImgLoaded(true);
  }, [imageUrl]);

  useEffect(() => {
    if (!imgLoaded) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = imgRef.current.width;
    canvas.height = imgRef.current.height;

    let animationFrameId: number;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(imgRef.current, 0, 0, canvas.width, canvas.height);

      const elapsed = (Date.now() - startTimeRef.current) % blinkInterval;
      const t = elapsed / blinkInterval; // 0~1

      // 闪烁扩散透明度变化 (正弦函数)
      const alpha = 0.5 + 0.5 * Math.sin(t * Math.PI * 2);

      shapes.forEach((shape) => {
        ctx.save();
        ctx.strokeStyle = shape.color || "red";
        ctx.lineWidth = 2;
        ctx.shadowColor = shape.color || "red";
        ctx.shadowBlur = 20 * alpha; // 发光强度随 alpha 变化
        ctx.globalAlpha = 0.6 * alpha; // 边缘透明度随 alpha 变化

        if (shape.type === "rectangle") {
            const centerX = shape.x;
            const centerY = shape.y;
            const { width, height } = shape;
            
            ctx.strokeRect(centerX - width / 2, centerY - height / 2, width, height);
        } else if (shape.type === "circle") {
          ctx.beginPath();
          ctx.arc(shape.x, shape.y, shape.radius, 0, Math.PI * 2);
          ctx.stroke();
        }
        ctx.restore();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationFrameId);
  }, [imgLoaded, shapes, blinkInterval]);

  return <canvas ref={canvasRef} style={{ display: "block" }} />;
};

// type Shape = 
//   | { type: "rectangle"; x: number; y: number; width: number; height: number; color?: string }
//   | { type: "circle"; x: number; y: number; radius: number; color?: string };

// interface Props {
//   imageUrl: string;
//   shapes: Shape[];
//   canvasWidth?: number;
//   canvasHeight?: number;
// }

// const ImageWithShapes: React.FC<Props> = ({
//   imageUrl,
//   shapes,
//   canvasWidth = 1000,
//   canvasHeight = 1000,
// }) => {
//   const canvasRef = useRef<HTMLCanvasElement>(null);

//   useEffect(() => {
//     const canvas = canvasRef.current;
//     if (!canvas) return;

//     const ctx = canvas.getContext("2d");
//     if (!ctx) return;

//     const img = new Image();
//     img.src = imageUrl;
//     img.onload = () => {
//       canvas.width = img.width;
//       canvas.height = img.height;

//       // 清空画布
//       ctx.clearRect(0, 0, canvas.width, canvas.height);

//       // 绘制图片
//       ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

//       // 绘制形状
//       shapes.forEach((shape) => {
//         ctx.strokeStyle = shape.color || "red";
//         ctx.lineWidth = 2;

//         if (shape.type === "rectangle") {
//           ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
//         } else if (shape.type === "circle") {
//           ctx.beginPath();
//           ctx.arc(shape.x, shape.y, shape.radius, 0, Math.PI * 2);
//           ctx.stroke();
//         }
//       });
//     };
//   }, [imageUrl, shapes]);

//   return <canvas ref={canvasRef} style={{ display: "block" }} />;
// };