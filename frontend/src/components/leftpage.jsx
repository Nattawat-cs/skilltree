import { useState } from "react";
import PanZoomCanvas from "./PanZoomCanvas";
import "./leftpage.css";

// ========================================
// ขนาดการ์ดและระยะห่าง (หน่วย px)
// CARD_WIDTH / CARD_HEIGHT ต้องตรงกับ .course-card ใน leftpage.css
// ========================================

const CARD_WIDTH = 240;
const CARD_HEIGHT = 84;
const GAP_X = 40;   // ระยะห่างแนวนอน ระหว่างการ์ดในชั้นเดียวกัน
const GAP_Y = 80;   // ระยะห่างแนวตั้ง ระหว่างชั้น (เว้นที่ให้เส้น)
const PADDING = 40; // ขอบว่างรอบแผนผัง


// ========================================
// หา "ชั้น" ของแต่ละวิชา
//   ไม่มีวิชาก่อนหน้า → ชั้น 0 (วิชาพื้นฐาน)
//   มีวิชาก่อนหน้า    → ชั้นที่สูงที่สุดของวิชาก่อนหน้า + 1
//
// ตัวอย่าง  CS101 → CS213 → CS261
//   CS101 = ชั้น 0, CS213 = ชั้น 1, CS261 = ชั้น 2
//
// ผลลัพธ์ = { [courseId]: เลขชั้น }
// ========================================

function calculateLevels(courses) {
  const levels = {};

  function levelOf(course) {
    // เคยคำนวณแล้ว ใช้ค่าเดิม
    if (levels[course.id] !== undefined) return levels[course.id];

    // ใส่ 0 ไว้ก่อน กันวนไม่รู้จบ ถ้าข้อมูลใน DB บังเอิญชี้กันเป็นวง
    levels[course.id] = 0;

    let level = 0;
    course.prerequisites.forEach((preId) => {
      const preCourse = courses.find((c) => c.id === preId);
      if (preCourse) {
        level = Math.max(level, levelOf(preCourse) + 1);
      }
    });

    levels[course.id] = level;
    return level;
  }

  courses.forEach(levelOf);
  return levels;
}


// ========================================
// คำนวณตำแหน่ง (x, y) ของการ์ดทุกใบ
//   - ชั้น 0 อยู่ล่างสุด ชั้นสูงขึ้นไปอยู่ด้านบน (พื้นฐานอยู่ล่าง)
//   - แต่ละชั้นจัดการ์ดเรียงแนวนอน ไว้กลางแผนผัง
//
// ผลลัพธ์ = { positions: { [courseId]: { x, y } }, width, height }
// ========================================

function calculatePositions(courses) {
  const levels = calculateLevels(courses);

  // แยกวิชาลงแต่ละชั้น: rows[0] = วิชาชั้น 0, rows[1] = วิชาชั้น 1, ...
  const rows = [];
  courses.forEach((course) => {
    const level = levels[course.id];
    if (!rows[level]) rows[level] = [];
    rows[level].push(course);
  });

  // ขนาดแผนผังทั้งหมด (ชั้นที่การ์ดเยอะสุดเป็นตัวกำหนดความกว้าง)
  const widestRow = Math.max(0, ...rows.map((row) => row.length));
  const width = PADDING * 2 + widestRow * CARD_WIDTH + (widestRow - 1) * GAP_X;
  const height = PADDING * 2 + rows.length * CARD_HEIGHT + (rows.length - 1) * GAP_Y;

  const positions = {};

  rows.forEach((row, level) => {
    // เรียงวิชาในชั้นนี้ ให้อยู่ใกล้ ๆ วิชาก่อนหน้าของตัวเอง (เส้นจะได้ไม่ไขว้กันมาก)
    //   ชั้น 0 เรียงตามที่ backend ส่งมา
    //   ชั้นอื่น เรียงตาม "ค่าเฉลี่ยตำแหน่ง x ของวิชาก่อนหน้า" (ชั้นล่างวางเสร็จไปแล้ว)
    if (level > 0) {
      row.sort((a, b) => averagePrerequisiteX(a, positions) - averagePrerequisiteX(b, positions));
    }

    // ชั้นนี้กว้างเท่าไร → เลื่อนให้อยู่กลาง
    const rowWidth = row.length * CARD_WIDTH + (row.length - 1) * GAP_X;
    const startX = (width - rowWidth) / 2;

    // ชั้นสูงสุดอยู่บนสุด ชั้น 0 อยู่ล่างสุด
    const y = PADDING + (rows.length - 1 - level) * (CARD_HEIGHT + GAP_Y);

    row.forEach((course, index) => {
      positions[course.id] = {
        x: startX + index * (CARD_WIDTH + GAP_X),
        y: y,
      };
    });
  });

  return { positions, width, height };
}


// ค่าเฉลี่ยตำแหน่ง x ของวิชาก่อนหน้าทั้งหมดของวิชานี้
function averagePrerequisiteX(course, positions) {
  const xs = course.prerequisites
    .filter((preId) => positions[preId])
    .map((preId) => positions[preId].x);
  if (xs.length === 0) return 0;
  return xs.reduce((sum, x) => sum + x, 0) / xs.length;
}


function Leftpage({ courses, selectedCourse, setSelectedCourse }) {
  const { positions, width, height } = calculatePositions(courses);

  // วิชาที่เมาส์ชี้อยู่ (null = ไม่ได้ชี้อะไร) เส้นของวิชานี้จะหนาขึ้น
  const [hoveredCourseId, setHoveredCourseId] = useState(null);

  // ========================================
  // เส้นเชื่อม 1 เส้น = วิชาก่อนหน้า → วิชาที่ต่อยอด
  //   เริ่มที่ "กลางขอบบน" ของวิชาก่อนหน้า (อยู่ล่าง)
  //   จบที่ "กลางขอบล่าง" ของวิชาที่ต่อยอด (อยู่บน)
  // ========================================

  const lines = [];
  courses.forEach((course) => {
    course.prerequisites.forEach((preId) => {
      const from = positions[preId];
      const to = positions[course.id];
      if (!from || !to) return;

      lines.push({
        key: `${preId}-${course.id}`,
        from: preId,
        to: course.id,
        x1: from.x + CARD_WIDTH / 2,
        y1: from.y,
        x2: to.x + CARD_WIDTH / 2,
        y2: to.y + CARD_HEIGHT,
      });
    });
  });

  return (
    <PanZoomCanvas width={width} height={height}>

      {/* ===== เส้นเชื่อม ===== */}
      <svg className="course-lines">
        {lines.map((l) => {
          const midY = (l.y1 + l.y2) / 2;
          const active =
            selectedCourse?.id === l.from || selectedCourse?.id === l.to;
          const hovered = hoveredCourseId === l.from || hoveredCourseId === l.to;

          return (
            <path
              key={l.key}
              d={`M ${l.x1} ${l.y1} C ${l.x1} ${midY}, ${l.x2} ${midY}, ${l.x2} ${l.y2}`}
              className={`course-line ${active ? "active" : ""} ${hovered ? "hovered" : ""}`}
            />
          );
        })}
      </svg>

      {/* ===== การ์ดรายวิชา ===== */}
      {courses.map((course) => {
        const isSelected = selectedCourse?.id === course.id;
        const position = positions[course.id];

        return (
          <button
            key={course.id}
            className={`course-card ${isSelected ? "selected" : ""}`}
            style={{ left: position.x, top: position.y }}
            title={course.name}
            onClick={() => setSelectedCourse(course)}
            onMouseEnter={() => setHoveredCourseId(course.id)}
            onMouseLeave={() => setHoveredCourseId(null)}
          >
            <div className="course-card-header">
              <span className="course-dot"></span>
              <span className="course-name">{course.name}</span>
            </div>

            <div className="course-info">
              {course.topics} หัวข้อ • รู้แล้ว {course.learned}
            </div>

            <div className="progress-bar">
              <div
                className="progress"
                style={{
                  width: `${
                    course.topics === 0
                      ? 0
                      : (course.learned / course.topics) * 100
                  }%`,
                }}
              />
            </div>
          </button>
        );
      })}
    </PanZoomCanvas>
  );
}

export default Leftpage;
