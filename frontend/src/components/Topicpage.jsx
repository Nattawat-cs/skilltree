import { useState } from "react";
import PanZoomCanvas from "./PanZoomCanvas";
import { findAllPrerequisites, toLookup } from "../utils/topics";
import "./Topicpage.css";

// ========================================
// แผนผังรายหัวข้อ
//   - 1 กล่อง = 1 วิชา ข้างในเป็นหัวข้อของวิชานั้น
//   - เส้น = หัวข้อล่าง ต้องรู้ก่อน หัวข้อบน (พื้นฐานอยู่ล่าง เหมือนแผนผังรายวิชา)
//
// เห็นทุกหัวข้อเสมอ แต่ถ้าเลือกอะไรไว้ จะซูมไปที่ "เส้นทาง" ของมัน
//   เลือกหัวข้อไว้   → เส้นทาง = หัวข้อนั้น + ทุกหัวข้อที่ต้องรู้ก่อน
//   เลือกแค่วิชา    → เส้นทาง = หัวข้อในวิชานั้น + ทุกหัวข้อที่ต้องรู้ก่อน
//
// เส้นปกติบาง ๆ จะหนาขึ้นเมื่อ
//   - อยู่บนเส้นทางของที่เลือก (สีส้ม)
//   - เอาเมาส์ชี้หัวข้อ → เส้นที่ต่อเข้า/ออกหัวข้อนั้นหนาสุด
// ========================================

// ขนาดและระยะห่าง (หน่วย px)
// NODE_WIDTH / NODE_HEIGHT ต้องตรงกับ .topic-node ใน Topicpage.css
const NODE_WIDTH = 170;
const NODE_HEIGHT = 34;
const NODE_GAP_X = 12;  // ระยะห่างแนวนอน ระหว่างหัวข้อในชั้นเดียวกัน
const NODE_GAP_Y = 30;  // ระยะห่างแนวตั้ง ระหว่างชั้นของหัวข้อ (เว้นที่ให้เส้น)
const BOX_HEADER = 36;  // ความสูงแถบชื่อวิชา บนกล่อง
const BOX_PADDING = 14; // ขอบว่างในกล่องวิชา
const BOX_GAP_X = 60;   // ระยะห่างแนวนอน ระหว่างกล่องวิชา
const BOX_GAP_Y = 90;   // ระยะห่างแนวตั้ง ระหว่างชั้นของกล่องวิชา
const PADDING = 40;     // ขอบว่างรอบแผนผัง


// ========================================
// หา "ชั้น" ของแต่ละอย่าง (ใช้ทั้งกับหัวข้อ และกับกล่องวิชา)
//   ไม่มีอะไรต้องรู้ก่อน → ชั้น 0
//   มี                 → ชั้นสูงสุดของสิ่งที่ต้องรู้ก่อน + 1
//
//   ids       = id ทั้งหมดที่จะจัดชั้น
//   parentsOf = ฟังก์ชัน รับ id แล้วคืน id ที่ต้องรู้ก่อน
//
// ผลลัพธ์ = rows  โดย rows[0] = id ชั้น 0, rows[1] = id ชั้น 1, ...
// ========================================

function splitIntoLevels(ids, parentsOf) {
  const levels = {};

  function levelOf(id) {
    if (levels[id] !== undefined) return levels[id];
    levels[id] = 0; // ใส่ 0 ไว้ก่อน กันวนไม่รู้จบ ถ้าข้อมูลบังเอิญชี้กันเป็นวง

    let level = 0;
    parentsOf(id).forEach((parentId) => {
      level = Math.max(level, levelOf(parentId) + 1);
    });

    levels[id] = level;
    return level;
  }

  const rows = [];
  ids.forEach((id) => {
    const level = levelOf(id);
    if (!rows[level]) rows[level] = [];
    rows[level].push(id);
  });
  return rows;
}


// ========================================
// คำนวณตำแหน่งกล่องวิชา และหัวข้อทุกตัว
//
// ผลลัพธ์ = {
//   boxes:     [{ course, topics, x, y, width, height }],
//   positions: { [topicId]: { x, y } },
//   width, height   ← ขนาดแผนผังทั้งหมด
// }
// ========================================

function calculateLayout(visibleTopics, courses, topicById) {
  const visibleIds = visibleTopics.map((topic) => topic.id);

  // ----- 1) แยกหัวข้อลงกล่องวิชา (วิชาที่ไม่มีหัวข้อให้เห็น ไม่ต้องวาดกล่อง) -----
  const boxes = courses
    .map((course) => ({
      course: course,
      topics: visibleTopics.filter((topic) => topic.courseId === course.id),
    }))
    .filter((box) => box.topics.length > 0);

  // ----- 2) ในแต่ละกล่อง จัดหัวข้อเป็นชั้น ๆ แล้วหาขนาดกล่อง -----
  boxes.forEach((box) => {
    const idsInBox = box.topics.map((topic) => topic.id);

    // นับเฉพาะหัวข้อก่อนหน้าที่อยู่ในกล่องเดียวกัน
    box.rows = splitIntoLevels(idsInBox, (id) =>
      topicById[id].prerequisites.filter((preId) => idsInBox.includes(preId))
    );
    box.rows.forEach((row) => row.sort((a, b) => topicById[a].seqNo - topicById[b].seqNo));

    const widestRow = Math.max(...box.rows.map((row) => row.length));
    box.width = BOX_PADDING * 2 + widestRow * NODE_WIDTH + (widestRow - 1) * NODE_GAP_X;
    box.height =
      BOX_HEADER + BOX_PADDING + box.rows.length * NODE_HEIGHT + (box.rows.length - 1) * NODE_GAP_Y;
  });

  // ----- 3) จัดกล่องวิชาเป็นชั้น ๆ -----
  // วิชา A ต้องอยู่สูงกว่าวิชา B ถ้า
  //   - B เป็นวิชาบังคับก่อนของ A หรือ
  //   - มีหัวข้อใน A ที่ต้องรู้หัวข้อใน B ก่อน
  const boxByCourseId = {};
  boxes.forEach((box) => {
    boxByCourseId[box.course.id] = box;
  });

  function coursesNeededBy(courseId) {
    const box = boxByCourseId[courseId];
    const needed = box.course.prerequisites.filter((id) => boxByCourseId[id]);

    box.topics.forEach((topic) => {
      topic.prerequisites.forEach((preId) => {
        const preCourseId = topicById[preId].courseId;
        if (preCourseId !== courseId && visibleIds.includes(preId) && !needed.includes(preCourseId)) {
          needed.push(preCourseId);
        }
      });
    });
    return needed;
  }

  const boxRows = splitIntoLevels(
    boxes.map((box) => box.course.id),
    coursesNeededBy
  ).map((row) => row.map((courseId) => boxByCourseId[courseId]));

  // ----- 4) วางกล่อง: ชั้น 0 ล่างสุด แต่ละชั้นเรียงแนวนอนไว้กลางแผนผัง -----
  const rowWidths = boxRows.map(
    (row) => row.reduce((sum, box) => sum + box.width, 0) + (row.length - 1) * BOX_GAP_X
  );
  const rowHeights = boxRows.map((row) => Math.max(...row.map((box) => box.height)));

  const width = PADDING * 2 + Math.max(...rowWidths);
  const height =
    PADDING * 2 + rowHeights.reduce((sum, h) => sum + h, 0) + (boxRows.length - 1) * BOX_GAP_Y;

  // วางจากชั้นล่างขึ้นบน เพราะต้องรู้ตำแหน่งกล่องชั้นล่างก่อน ถึงจะเรียงชั้นบนให้เส้นไม่ไขว้กันมาก
  let rowBottom = height - PADDING;
  boxRows.forEach((row, level) => {
    // ชั้นบน เรียงตาม "ค่าเฉลี่ยตำแหน่ง x ของวิชาที่ต้องรู้ก่อน"
    if (level > 0) {
      row.sort((a, b) => averageNeededX(a) - averageNeededX(b));
    }

    let x = (width - rowWidths[level]) / 2;
    row.forEach((box) => {
      box.x = x;
      box.y = rowBottom - box.height; // กล่องในชั้นเดียวกัน ชิดล่างเท่ากัน
      x += box.width + BOX_GAP_X;
    });

    rowBottom -= rowHeights[level] + BOX_GAP_Y;
  });

  function averageNeededX(box) {
    const xs = coursesNeededBy(box.course.id)
      .map((courseId) => boxByCourseId[courseId])
      .filter((needed) => needed.x !== undefined)
      .map((needed) => needed.x + needed.width / 2);
    if (xs.length === 0) return 0;
    return xs.reduce((sum, x) => sum + x, 0) / xs.length;
  }

  // ----- 5) วางหัวข้อในกล่อง: ชั้น 0 ล่างสุดของกล่อง -----
  const positions = {};
  boxes.forEach((box) => {
    box.rows.forEach((row, level) => {
      const rowWidth = row.length * NODE_WIDTH + (row.length - 1) * NODE_GAP_X;
      const startX = box.x + (box.width - rowWidth) / 2;
      const y = box.y + box.height - BOX_PADDING - NODE_HEIGHT - level * (NODE_HEIGHT + NODE_GAP_Y);

      row.forEach((topicId, index) => {
        positions[topicId] = { x: startX + index * (NODE_WIDTH + NODE_GAP_X), y: y };
      });
    });
  });

  return { boxes, positions, width, height };
}


// กรอบสี่เหลี่ยมที่ล้อมหัวข้อทั้งหมดใน ids (เผื่อขอบไว้รอบ ๆ) เอาไว้ซูมไปหา
function areaAround(ids, positions) {
  const xs = ids.map((id) => positions[id].x);
  const ys = ids.map((id) => positions[id].y);
  const margin = 60;
  const left = Math.min(...xs) - margin;
  const top = Math.min(...ys) - margin;
  return {
    x: left,
    y: top,
    width: Math.max(...xs) + NODE_WIDTH + margin - left,
    height: Math.max(...ys) + NODE_HEIGHT + margin - top,
  };
}


function Topicpage({ topics, courses, selectedTopic, selectedCourse, onSelectTopic }) {
  const topicById = toLookup(topics);

  // หัวข้อที่เมาส์ชี้อยู่ (null = ไม่ได้ชี้อะไร)
  const [hoveredTopicId, setHoveredTopicId] = useState(null);

  // ========================================
  // หัวข้อที่อยู่ "บนเส้นทาง" = หัวข้อที่สนใจ + ทุกหัวข้อที่ต้องรู้ก่อน
  // ========================================

  let focusIds = [];      // หัวข้อที่สนใจ
  let focusLabel = "";    // ข้อความบอกว่ากำลังดูอะไร
  if (selectedTopic) {
    focusIds = [selectedTopic.id];
    focusLabel = `หัวข้อ ${selectedTopic.name}`;
  } else if (selectedCourse) {
    focusIds = topics.filter((topic) => topic.courseId === selectedCourse.id).map((topic) => topic.id);
    focusLabel = `วิชา ${selectedCourse.name}`;
  }

  const pathIds = [
    ...focusIds,
    ...findAllPrerequisites(focusIds, topicById).map((topic) => topic.id),
  ];
  const hasPath = pathIds.length > 0;

  if (topics.length === 0) {
    return <div className="topic-map-message">กำลังโหลดหัวข้อ...</div>;
  }

  const { boxes, positions, width, height } = calculateLayout(topics, courses, topicById);

  // ========================================
  // เส้นเชื่อม 1 เส้น = หัวข้อที่ต้องรู้ก่อน → หัวข้อที่ต่อยอด
  //   เริ่มที่ "กลางขอบบน" ของหัวข้อที่ต้องรู้ก่อน (อยู่ล่าง)
  //   จบที่ "กลางขอบล่าง" ของหัวข้อที่ต่อยอด (อยู่บน)
  // ========================================

  const lines = [];
  topics.forEach((topic) => {
    topic.prerequisites.forEach((preId) => {
      const from = positions[preId];
      const to = positions[topic.id];

      const classes = ["topic-line"];
      if (pathIds.includes(preId) && pathIds.includes(topic.id)) classes.push("on-path");
      if (hoveredTopicId === preId || hoveredTopicId === topic.id) classes.push("hovered");

      lines.push({
        key: `${preId}-${topic.id}`,
        className: classes.join(" "),
        x1: from.x + NODE_WIDTH / 2,
        y1: from.y,
        x2: to.x + NODE_WIDTH / 2,
        y2: to.y + NODE_HEIGHT,
      });
    });
  });

  // เส้นที่หนากว่า วาดทีหลัง จะได้ทับเส้นบาง ๆ (svg วาดตามลำดับ ตัวหลังอยู่บน)
  const weight = (line) => (line.className.includes("hovered") ? 2 : line.className.includes("on-path") ? 1 : 0);
  lines.sort((a, b) => weight(a) - weight(b));

  // วิชาของหัวข้อที่สนใจ (ใช้ติดป้าย "วิชานี้" บนกล่อง)
  const focusCourseId = selectedTopic ? selectedTopic.courseId : selectedCourse?.id;

  return (
    <div className="topic-map">
      <PanZoomCanvas
        width={width}
        height={height}
        focusArea={hasPath ? areaAround(pathIds, positions) : null}
      >

        {/* ===== กล่องวิชา (อยู่ล่างสุด) ===== */}
        {boxes.map((box) => {
          const hasPathTopic = box.topics.some((topic) => pathIds.includes(topic.id));
          return (
            <div
              key={box.course.id}
              className={`topic-box ${box.course.id === focusCourseId ? "focus" : ""} ${hasPath && !hasPathTopic ? "faded" : ""}`}
              style={{ left: box.x, top: box.y, width: box.width, height: box.height }}
            >
              <div className="topic-box-header">
                <span className="topic-box-dot"></span>
                <span className="topic-box-name" title={box.course.name}>{box.course.name}</span>
                {hasPathTopic && (
                  <span className="topic-box-badge">
                    {box.course.id === focusCourseId ? "วิชานี้" : "ต้องรู้ก่อน"}
                  </span>
                )}
                <span className="topic-box-count">{box.topics.length} หัวข้อ</span>
              </div>
            </div>
          );
        })}

        {/* ===== เส้นเชื่อม ===== */}
        <svg className="topic-lines">
          {lines.map((l) => {
            const midY = (l.y1 + l.y2) / 2;
            return (
              <path
                key={l.key}
                d={`M ${l.x1} ${l.y1} C ${l.x1} ${midY}, ${l.x2} ${midY}, ${l.x2} ${l.y2}`}
                className={l.className}
              />
            );
          })}
        </svg>

        {/* ===== หัวข้อ ===== */}
        {topics.map((topic) => {
          const position = positions[topic.id];
          const classes = ["topic-node"];
          if (topic.done) classes.push("done");
          if (pathIds.includes(topic.id)) classes.push("on-path");
          else if (hasPath) classes.push("faded"); // ไม่ได้อยู่บนเส้นทาง → จางลง (แต่ยังเห็น)
          if (selectedTopic?.id === topic.id) classes.push("selected");

          return (
            <button
              key={topic.id}
              className={classes.join(" ")}
              style={{ left: position.x, top: position.y }}
              title={`${topic.courseCode} · ${topic.name}`}
              onClick={() => onSelectTopic(topic)}
              onMouseEnter={() => setHoveredTopicId(topic.id)}
              onMouseLeave={() => setHoveredTopicId(null)}
            >
              {topic.done && "✓ "}
              {topic.name}
            </button>
          );
        })}
      </PanZoomCanvas>

      {/* ===== แถบบอกว่ากำลังดูอะไร มุมซ้ายบน ===== */}
      <div className="topic-map-bar">
        <span className="topic-map-label">
          {hasPath
            ? `${focusLabel} และหัวข้อที่ต้องรู้ก่อน (${pathIds.length} หัวข้อ)`
            : "คลิกหัวข้อที่เรียนไม่ทัน เพื่อดูว่าต้องย้อนไปเรียนอะไรก่อน"}
        </span>
      </div>

      {/* ===== วิธีอ่าน มุมซ้ายล่าง ===== */}
      <div className="topic-map-legend">
        <span><i className="legend-swatch done"></i>รู้แล้ว</span>
        <span><i className="legend-swatch on-path"></i>อยู่บนเส้นทาง</span>
        <span>เส้น: ล่าง ต้องรู้ก่อน บน</span>
      </div>
    </div>
  );
}

export default Topicpage;
