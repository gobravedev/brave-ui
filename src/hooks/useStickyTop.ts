import { useState, useEffect, useRef } from "react";

/**
 * 监听元素的顶部距离和窗口宽度变化的 Hook。
 * 自动计算吸顶 top 值，并根据窗口宽度判断是否启用 sticky。
 * 
 * @param {number} breakpoint - 吸顶启用的最小宽度（默认 576）
 * @returns {object} { ref, top, isSticky }
 */
export function useStickyTop(breakpoint: number = 576) {
  const ref = useRef<HTMLDivElement>(null);
  const [top, setTop] = useState<number>(0);
  const [isSticky, setIsSticky] = useState<boolean>(window.innerWidth >= breakpoint);

  // 更新 top 距离
  const updateTop = () => {
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      setTop(rect.top);
    }
  };

  // 监听窗口大小变化
  useEffect(() => {
    const handleResize = () => {
      setIsSticky(window.innerWidth >= breakpoint);
      updateTop();
    };
    handleResize(); // 初始化执行一次
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [breakpoint]);

  return { ref, top, isSticky };
}
