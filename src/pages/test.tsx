import React, { useEffect, useState } from "react";
import axios from "axios";

interface Entry {
  id: string;
  name: string;
  type: string;
  link: string;
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
}

export const  KGMLMap = ({ pathwayId="hsa04144" }: { pathwayId?: string }) =>{
  const [image, setImage] = useState("");
  const [entries, setEntries] = useState<Entry[]>([]);

  useEffect(() => {
    axios.get(`/kegg/kgml/${pathwayId}`).then((res) => {
      setImage(res.data.image);
      setEntries(res.data.entries);
    });
  }, [pathwayId]);

  return (
    <div style={{ position: "relative", textAlign: "center" }}>
      {image && (
        <>
          <img
            src={image}
            alt="KEGG pathway"
            useMap="#kgmlmap"
            style={{ border: "1px solid #ddd", maxWidth: "100%" }}
          />
          <map name="kgmlmap">
            {entries.map((e) => {
              const left = e.x - e.width / 2;
              const top = e.y - e.height / 2;
              const right = e.x + e.width / 2;
              const bottom = e.y + e.height / 2;
              return (
                <area
                  key={e.id}
                  shape="rect"
                  coords={`${left},${top},${right},${bottom}`}
                  href={e.link}
                  target="_blank"
                  alt={e.label}
                  title={e.label}
                />
              );
            })}
          </map>
        </>
      )}
    </div>
  );
}

export default KGMLMap