import COURSE_RESOURCES from "../data/courseResources";
import { findAllPrerequisites } from "../utils/topics";
import ResourceList from "./ResourceList";
import "./Rightpage.css";
import "./TopicDetail.css";

// ลิงก์ค้นหาจากชื่อหัวข้อ (ไม่ต้องเก็บลิงก์ทีละหัวข้อ และไม่มีวันเป็นลิงก์เสีย)
function searchLinksFor(topic) {
  const youtube = (query) => `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
  return [
    { type: "search", title: "คลิปสอนภาษาไทย", url: youtube(`สอน ${topic.name}`), note: "ค้นใน YouTube" },
    { type: "search", title: "คลิปสอนภาษาอังกฤษ", url: youtube(`${topic.name} tutorial`), note: "ค้นใน YouTube (มีให้เลือกเยอะกว่า)" },
    {
      type: "search",
      title: "บทความอ่าน",
      url: `https://www.google.com/search?q=${encodeURIComponent(`${topic.name} ${topic.courseName}`)}`,
      note: "ค้นใน Google",
    },
  ];
}

// ========================================
// ฝั่งขวา ตอนเลือกหัวข้อ (แท็บรายหัวข้อ)
// ตอบคำถามเดียว: "เรียนหัวข้อนี้ไม่ทัน ต้องย้อนไปเรียนอะไร"
//
//   topic          = หัวข้อที่เลือก
//   topicById      = { [id]: หัวข้อ } ของทุกหัวข้อ
//   onSelectTopic  = กดหัวข้ออื่นในรายการ → ไปดูหัวข้อนั้น
//   onToggleDone   = กดปุ่ม "รู้เรื่องแล้ว"
//   onClear        = กดปุ่ม "ล้าง" (เลิกเลือกหัวข้อ)
// ========================================

function TopicDetail({ topic, topicById, onSelectTopic, onToggleDone, onClear }) {
  // ทุกหัวข้อที่ต้องรู้ก่อน เรียงจากพื้นฐานสุด
  const prerequisites = findAllPrerequisites([topic.id], topicById);
  const known = prerequisites.filter((pre) => pre.done);
  const missing = prerequisites.filter((pre) => !pre.done);

  // "เริ่มตรงนี้" = หัวข้อที่ยังไม่รู้ แต่พื้นของมันครบแล้ว → เรียนได้ทันที
  const startHere = missing.filter((pre) =>
    pre.prerequisites.every((id) => topicById[id].done)
  );

  const nextTopics = topic.nextTopics.map((id) => topicById[id]);

  const percent = prerequisites.length === 0 ? 100 : (known.length / prerequisites.length) * 100;

  // ป้ายสถานะท้ายแถว
  function statusOf(pre) {
    if (pre.done) return { text: "✓ รู้แล้ว", className: "done" };
    if (startHere.includes(pre)) return { text: "เริ่มตรงนี้", className: "start" };
    return { text: "ยังไม่รู้", className: "missing" };
  }

  return (
    <div className="right-page">
      <div className="course-detail">

        {/* ==================================
            หัวเรื่อง
        ================================== */}
        <div className="detail-label">หัวข้อที่เลือก</div>
        <h1 className="topic-detail-title">{topic.name}</h1>
        <div className="topic-detail-course">
          <span className="detail-dot"></span>
          {topic.courseCode} {topic.courseName}
        </div>

        <div className="detail-info">
          ต้องรู้ก่อน <strong>{prerequisites.length}</strong> • รู้แล้ว{" "}
          <strong>{known.length}</strong> • ยังขาด <strong>{missing.length}</strong> • ต่อยอดไป{" "}
          <strong>{nextTopics.length}</strong>
        </div>

        <div className="detail-progress">
          <div className="detail-progress-fill" style={{ width: `${percent}%` }} />
        </div>

        <div className="detail-buttons">
          <button
            className={topic.done ? "secondary-button" : "primary-button"}
            onClick={() => onToggleDone(topic.id)}
          >
            {topic.done ? "✓ รู้แล้ว (กดเพื่อยกเลิก)" : "หัวข้อนี้รู้เรื่องแล้ว"}
          </button>
          <button className="secondary-button" onClick={onClear}>
            ล้าง
          </button>
        </div>

        {/* ==================================
            คำตอบสั้น ๆ: ต้องย้อนไปไหน
        ================================== */}
        <div className="topic-verdict">
          {prerequisites.length === 0 && "หัวข้อนี้เป็นพื้นฐาน เริ่มเรียนได้เลย ไม่ต้องรู้อะไรก่อน"}
          {prerequisites.length > 0 && missing.length === 0 && "พื้นครบแล้ว ✓ เรียนหัวข้อนี้ต่อได้เลย"}
          {missing.length > 0 && (
            <>
              ยังขาดพื้น <strong>{missing.length} หัวข้อ</strong> ควรย้อนไปเริ่มที่{" "}
              {startHere.map((pre, index) => (
                <span key={pre.id}>
                  {index > 0 && ", "}
                  <button className="link-button" onClick={() => onSelectTopic(pre)}>
                    {pre.name}
                  </button>{" "}
                  ({pre.courseCode})
                </span>
              ))}
            </>
          )}
        </div>

        {/* ==================================
            คำอธิบายหัวข้อ
        ================================== */}
        <div className="section-block">
          <div className="section-title">คำอธิบายหัวข้อ</div>
          <div className="description-text">
            {topic.desc || "ยังไม่มีคำอธิบายหัวข้อ"}
          </div>
        </div>

        {/* ==================================
            แหล่งเรียน: ค้นหาตามชื่อหัวข้อ + แหล่งเรียนของทั้งวิชา
        ================================== */}
        <div className="section-block">
          <div className="section-title">หาคลิป / บทความของหัวข้อนี้</div>
          <ResourceList links={searchLinksFor(topic)} />
        </div>

        {COURSE_RESOURCES[topic.courseCode] && (
          <div className="section-block">
            <div className="section-title">แหล่งเรียนวิชา {topic.courseCode}</div>
            <ResourceList links={COURSE_RESOURCES[topic.courseCode]} />
          </div>
        )}

        {/* ==================================
            ทุกหัวข้อที่ต้องรู้ก่อน เรียงตามลำดับที่ควรเรียน
        ================================== */}
        {prerequisites.length > 0 && (
          <div className="section-block">
            <div className="section-title">ต้องรู้ก่อน (เรียงจากพื้นฐานสุด)</div>
            <ol className="path-list">
              {prerequisites.map((pre, index) => {
                const status = statusOf(pre);
                return (
                  <li key={pre.id}>
                    <button className={`path-item ${status.className}`} onClick={() => onSelectTopic(pre)}>
                      <span className="path-number">{index + 1}</span>
                      <span className="path-text">
                        <span className="path-name">{pre.name}</span>
                        <span className="path-course">{pre.courseCode} {pre.courseName}</span>
                      </span>
                      <span className="path-status">{status.text}</span>
                    </button>
                  </li>
                );
              })}
            </ol>
          </div>
        )}

        {/* ==================================
            รู้หัวข้อนี้แล้ว เอาไปต่อยอดอะไรได้
        ================================== */}
        <div className="section-block">
          <div className="section-title">เรียนแล้วต่อยอดไป</div>
          {nextTopics.length === 0 && <div className="empty-text">- ไม่มีหัวข้อต่อยอด -</div>}
          <ul className="path-list">
            {nextTopics.map((next) => (
              <li key={next.id}>
                <button className={`path-item ${next.done ? "done" : ""}`} onClick={() => onSelectTopic(next)}>
                  <span className="path-text">
                    <span className="path-name">{next.name}</span>
                    <span className="path-course">{next.courseCode} {next.courseName}</span>
                  </span>
                  {next.done && <span className="path-status">✓ รู้แล้ว</span>}
                </button>
              </li>
            ))}
          </ul>
        </div>

      </div>
    </div>
  );
}

export default TopicDetail;
