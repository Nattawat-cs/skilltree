import { useEffect, useRef, useState } from "react";
import "./PanZoomCanvas.css";

// ========================================
// กระดานที่ลากเลื่อน / ซูมเข้าออกได้
// ใช้ทั้งแผนผังรายวิชา (leftpage.jsx) และแผนผังรายหัวข้อ (Topicpage.jsx)
//
// วิธีใช้
//   <PanZoomCanvas width={1200} height={800}>
//     ...ของที่จะวาด (วางตำแหน่งด้วย left / top ภายในขนาด width x height)
//   </PanZoomCanvas>
//
//   - ลากด้วยเมาส์ = เลื่อน
//   - ล้อเมาส์ / pinch บน trackpad = ซูม
//   - ปุ่ม − + พอดีจอ มุมขวาล่าง
//   - ขนาด width / height เปลี่ยนเมื่อไร จะจัดให้พอดีจอใหม่เอง
//
//   ถ้าส่ง focusArea = { x, y, width, height } มาด้วย
//   จะซูมไปให้เห็นพื้นที่นั้นพอดีจอแทน (เช่น เส้นทางของหัวข้อที่เลือก)
//   และมีปุ่ม "ไปที่เส้นทาง" เพิ่มที่มุมขวาล่าง
// ========================================

const MIN_ZOOM = 0.1; // ซูมออกได้สุด 10% (แผนผังทุกหัวข้อใหญ่มาก)
const MAX_ZOOM = 2;   // ซูมเข้าได้สุด 200%


// ========================================
// view = { x, y, scale }
//   x, y  = เลื่อนกระดานไปกี่ px จากมุมซ้ายบนของกล่อง
//   scale = ขนาด (1 = 100%)
// ========================================

// view ที่ทำให้เห็นพื้นที่ area = { x, y, width, height } พอดีกล่อง และอยู่ตรงกลาง
// (อยากเห็นทั้งกระดาน ก็ส่ง area = { x: 0, y: 0, width, height })
function fitToBox(box, area) {
  const scale = Math.max(
    MIN_ZOOM,
    Math.min(1, box.clientWidth / area.width, box.clientHeight / area.height)
  );
  return {
    scale: scale,
    x: (box.clientWidth - area.width * scale) / 2 - area.x * scale,
    y: (box.clientHeight - area.height * scale) / 2 - area.y * scale,
  };
}

// ซูมเข้า/ออก โดยให้จุด (pointX, pointY) บนจออยู่ที่เดิม
// (เช่น ซูมด้วยเมาส์ จุดใต้เมาส์จะไม่หนีไปไหน)
function zoomAt(view, pointX, pointY, factor) {
  const scale = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, view.scale * factor));
  const ratio = scale / view.scale;
  return {
    scale: scale,
    x: pointX - (pointX - view.x) * ratio,
    y: pointY - (pointY - view.y) * ratio,
  };
}


function PanZoomCanvas({ width, height, focusArea = null, children }) {
  const boxRef = useRef(null);          // กล่องกระดาน (ใช้วัดขนาดและรับ event ล้อเมาส์)
  const dragRef = useRef(null);         // ข้อมูลตอนกำลังลาก (null = ไม่ได้ลาก)
  const justDraggedRef = useRef(false); // เพิ่งลากเสร็จไหม (ถ้าใช่ จะไม่นับเป็นการคลิก)
  const isFirstFitRef = useRef(true);   // จัดพอดีจอครั้งแรกไหม (ครั้งแรกไม่ต้องเล่นอนิเมชัน)
  const [view, setView] = useState({ x: 0, y: 0, scale: 1 });
  const [isAnimating, setIsAnimating] = useState(false); // กำลังเลื่อนไปหาเส้นทางแบบนุ่ม ๆ

  // พื้นที่ที่อยากให้เห็น: มี focusArea ใช้อันนั้น ไม่มีก็ทั้งกระดาน
  // (แยกเป็นตัวเลขทีละตัว เพราะ useEffect เทียบตัวเลขได้ตรง ๆ ว่าเปลี่ยนจริงไหม)
  const areaX = focusArea ? focusArea.x : 0;
  const areaY = focusArea ? focusArea.y : 0;
  const areaWidth = focusArea ? focusArea.width : width;
  const areaHeight = focusArea ? focusArea.height : height;

  // พื้นที่ที่อยากให้เห็นเปลี่ยน (โหลดข้อมูลเสร็จ / เลือกหัวข้อใหม่) → เลื่อน + ซูมไปหา
  useEffect(() => {
    setView(fitToBox(boxRef.current, { x: areaX, y: areaY, width: areaWidth, height: areaHeight }));

    if (isFirstFitRef.current) {
      isFirstFitRef.current = false;
      return;
    }
    // เปิดอนิเมชันแป๊บเดียว (ระหว่างลาก / ซูมด้วยล้อเมาส์ต้องไม่มีอนิเมชัน ไม่งั้นจะหน่วง)
    setIsAnimating(true);
    const timer = setTimeout(() => setIsAnimating(false), 400);
    return () => clearTimeout(timer);
  }, [areaX, areaY, areaWidth, areaHeight]);

  // ล้อเมาส์ / pinch บน trackpad = ซูม
  // ต้องผูก event เองด้วย passive: false ถึงจะ preventDefault ได้
  // (ไม่อย่างนั้น pinch จะไปซูมทั้งหน้าเว็บแทน)
  useEffect(() => {
    const box = boxRef.current;

    function handleWheel(event) {
      event.preventDefault();
      const rect = box.getBoundingClientRect();
      const mouseX = event.clientX - rect.left;
      const mouseY = event.clientY - rect.top;
      // pinch บน trackpad จะมาเป็น ctrlKey + deltaY ค่าเล็ก ๆ จึงคูณให้ไวกว่า
      const speed = event.ctrlKey ? 0.01 : 0.002;
      const factor = Math.exp(-event.deltaY * speed);
      setView((current) => zoomAt(current, mouseX, mouseY, factor));
    }

    box.addEventListener("wheel", handleWheel, { passive: false });
    return () => box.removeEventListener("wheel", handleWheel);
  }, []);

  // ===== ลากเพื่อเลื่อนกระดาน =====

  function handlePointerDown(event) {
    if (event.button !== 0) return; // รับแค่คลิกซ้าย
    dragRef.current = {
      startX: event.clientX,
      startY: event.clientY,
      viewX: view.x,
      viewY: view.y,
      moved: false,
    };
    justDraggedRef.current = false;
  }

  function handlePointerMove(event) {
    const drag = dragRef.current;
    if (!drag) return;

    const dx = event.clientX - drag.startX;
    const dy = event.clientY - drag.startY;

    // ขยับน้อยกว่า 5px ยังถือว่าเป็นการคลิก ไม่ใช่การลาก
    if (!drag.moved && Math.hypot(dx, dy) < 5) return;

    drag.moved = true;
    setView((current) => ({ ...current, x: drag.viewX + dx, y: drag.viewY + dy }));
  }

  function handlePointerUp() {
    justDraggedRef.current = dragRef.current?.moved || false;
    dragRef.current = null;
  }

  // ถ้าเพิ่งลากเสร็จ ไม่ให้ไปกดปุ่มที่ปล่อยเมาส์ทับ
  function handleClickCapture(event) {
    if (justDraggedRef.current) {
      event.stopPropagation();
      justDraggedRef.current = false;
    }
  }

  // ===== ปุ่มซูม (ซูมรอบจุดกลางกล่อง) =====

  function zoomFromCenter(factor) {
    const box = boxRef.current;
    setView((current) => zoomAt(current, box.clientWidth / 2, box.clientHeight / 2, factor));
  }

  return (
    <div
      className="pan-zoom-canvas"
      ref={boxRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      onClickCapture={handleClickCapture}
    >
      {/* กล่องขนาดเท่ากระดานจริง เลื่อน/ซูมด้วย transform ทั้งกล่อง */}
      <div
        className={`pan-zoom-content ${isAnimating ? "animate" : ""}`}
        style={{
          width,
          height,
          transform: `translate(${view.x}px, ${view.y}px) scale(${view.scale})`,
        }}
      >
        {children}
      </div>

      {/* ===== ปุ่มซูม มุมขวาล่าง ===== */}
      <div className="zoom-controls">
        <button onClick={() => zoomFromCenter(1 / 1.2)} aria-label="ซูมออก">−</button>
        <span className="zoom-value">{Math.round(view.scale * 100)}%</span>
        <button onClick={() => zoomFromCenter(1.2)} aria-label="ซูมเข้า">+</button>
        {focusArea && (
          <button className="zoom-fit" onClick={() => setView(fitToBox(boxRef.current, focusArea))}>
            ไปที่เส้นทาง
          </button>
        )}
        <button
          className="zoom-fit"
          onClick={() => setView(fitToBox(boxRef.current, { x: 0, y: 0, width, height }))}
        >
          พอดีจอ
        </button>
      </div>
    </div>
  );
}

export default PanZoomCanvas;
