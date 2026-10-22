import "./ResourceList.css";

// ========================================
// รายการลิงก์แหล่งเรียน (ใช้ทั้งฝั่งขวาตอนเลือกวิชา และตอนเลือกหัวข้อ)
//
//   links = [{ type, title, url, note }]
//     type = "video" | "web" | "book" | "course" | "search"
//   กดแล้วเปิดแท็บใหม่ หน้าเว็บเราไม่หายไปไหน
// ========================================

const TYPE_LABEL = {
  video: "วิดีโอ",
  web: "เว็บ",
  book: "หนังสือ",
  course: "คอร์ส",
  search: "ค้นหา",
};

function ResourceList({ links }) {
  return (
    <ul className="resource-list">
      {links.map((link) => (
        <li key={link.url}>
          <a className="resource-item" href={link.url} target="_blank" rel="noopener noreferrer">
            <span className={`resource-type ${link.type}`}>{TYPE_LABEL[link.type]}</span>
            <span className="resource-text">
              <span className="resource-title">{link.title} ↗</span>
              {link.note && <span className="resource-note">{link.note}</span>}
            </span>
          </a>
        </li>
      ))}
    </ul>
  );
}

export default ResourceList;
