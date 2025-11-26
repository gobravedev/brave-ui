// /ssd1/wy/workspace2/leipu/leipu_workspace2/output/breseq/OSP-3/output/index.html
export const formatUrl = (path:string)=>{
    return path.replace("/ssd1/wy/workspace2","http://10.110.1.11:8000")
}

export const colors = ["magenta", "red", "volcano", "orange", "gold", "lime", "green", "cyan", "blue", "geekblue", "purple",
    "magenta", "red", "volcano", "orange", "gold", "lime", "green", "cyan", "blue", "geekblue", "purple",
     "magenta", "red", "volcano", "orange", "gold", "lime", "green", "cyan", "blue", "geekblue", "purple"
]

export function getPathname() {
    const path = window.location.pathname;
    if (path.endsWith('/')) {
        return path.slice(0, -1);
    }
    return path;
}