import './Upperbar.css';
import { useEffect, useRef, useState } from 'react';

const MAX_RESULTS = 12; // ผลค้นหาแสดงได้สูงสุดกี่รายการ

// activeTab / setActiveTab มาจาก Homepage (Homepage ต้องรู้ว่าเลือกแท็บไหน จะได้สลับฝั่งซ้าย)
// courses / topics = ข้อมูลที่เอามาค้น
// onSelectCourse / onSelectTopic = กดเลือกผลค้นหาแล้วให้ Homepage ทำอะไรต่อ
function Upperbar({ onLogout, activeTab, setActiveTab, courses = [], topics = [], onSelectCourse, onSelectTopic }) {

  const [searchText, setSearchText] = useState('');
  const [isSearching, setIsSearching] = useState(false); // ช่องค้นหาถูกคลิกอยู่ไหม (เปิดกล่องผลค้นหา)
  const [activeIndex, setActiveIndex] = useState(0);     // ผลค้นหาตัวที่ไฮไลต์อยู่ (กดลูกศรขึ้นลงเปลี่ยนได้)
  const inputRef = useRef(null);

  // กด Ctrl+K (หรือ ⌘K บน Mac) ที่ไหนก็ได้ = ไปที่ช่องค้นหา
  useEffect(() => {
    function handleKeyDown(event) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        inputRef.current.focus();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);


  // ========================================
  // ผลค้นหา = วิชาที่ชื่อตรง ตามด้วยหัวข้อที่ชื่อตรง (ไม่สนตัวพิมพ์เล็ก/ใหญ่)
  //   1 รายการ = { key, type: 'course' | 'topic', title, sub, item }
  // ========================================

  const keyword = searchText.trim().toLowerCase();

  const courseResults = courses
    .filter((course) => course.name.toLowerCase().includes(keyword))
    .map((course) => ({
      key: course.id,
      type: 'course',
      title: course.name,
      sub: `${course.topics} หัวข้อ`,
      item: course,
    }));

  const topicResults = topics
    .filter((topic) => topic.name.toLowerCase().includes(keyword))
    .map((topic) => ({
      key: topic.id,
      type: 'topic',
      title: `${topic.done ? '✓ ' : ''}${topic.name}`,
      sub: `${topic.courseCode} ${topic.courseName}`,
      item: topic,
    }));

  const results = keyword === '' ? [] : [...courseResults, ...topicResults].slice(0, MAX_RESULTS);

  // เลือกผลค้นหา → ส่งต่อให้ Homepage แล้วล้างช่องค้นหา
  function choose(result) {
    if (result.type === 'course') {
      onSelectCourse(result.item);
    } else {
      onSelectTopic(result.item);
    }
    setSearchText('');
    inputRef.current.blur();
  }

  // ลูกศรขึ้น/ลง = เลื่อนไฮไลต์, Enter = เลือก, Esc = ปิด
  function handleSearchKeyDown(event) {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex(Math.min(activeIndex + 1, results.length - 1));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex(Math.max(activeIndex - 1, 0));
    } else if (event.key === 'Enter' && results[activeIndex]) {
      choose(results[activeIndex]);
    } else if (event.key === 'Escape') {
      setSearchText('');
      inputRef.current.blur();
    }
  }

  // ข้อมูลนักศึกษาได้มาตอน login แล้ว (App.jsx เก็บไว้ใน localStorage)
  // ไม่ต้อง fetch ใหม่ แค่อ่านออกมาใช้
  const student = JSON.parse(localStorage.getItem("user") || "null");
  const studentName = student?.displayNameTh?.trim() || "";


  return (
    <nav className="nav-container" aria-label="หน้าหลัก">
      <span className="brand">CSTUCOM</span>

      <div className="tabs" role="tablist">
        <button className={`tab ${activeTab === 'course' ? 'active' : ''}`} 
        onClick={() => setActiveTab('course')}>รายวิชา</button>
        <button  className={`tab ${activeTab === 'topic' ? 'active' : ''}`} 
          onClick={() => setActiveTab('topic')}>รายหัวข้อ</button>
      </div>

     
      <div className="search-wrap">
        <label className="search-btn" htmlFor="search-input"> 🔍︎
          <input id="search-input" ref={inputRef} type="text" placeholder="ค้นหาหัวข้อ / วิชา" autoComplete="off" value={searchText}
            onChange={(e) => {
              setSearchText(e.target.value);
              setActiveIndex(0); // พิมพ์ใหม่ → ไฮไลต์ผลแรก
            }}
            onFocus={() => setIsSearching(true)}
            onBlur={() => setIsSearching(false)}
            onKeyDown={handleSearchKeyDown}/>
          <kbd>Ctrl K</kbd>
        </label>

        {/* ===== กล่องผลค้นหา (เปิดเมื่อช่องค้นหาถูกคลิก และพิมพ์อะไรไปแล้ว) ===== */}
        {isSearching && keyword !== '' && (
          <ul className="search-results">
            {results.length === 0 && (
              <li className="search-empty">ไม่เจอวิชาหรือหัวข้อที่ชื่อมีคำว่า "{searchText.trim()}"</li>
            )}

            {results.map((result, index) => (
              <li key={result.key}>
                {/* ใช้ onMouseDown ไม่ใช่ onClick: ถ้าใช้ onClick ช่องค้นหาจะ blur
                    ปิดกล่องผลค้นหาไปก่อน แล้วการคลิกจะไม่โดนอะไร */}
                <button
                  className={`search-result ${index === activeIndex ? 'active' : ''}`}
                  onMouseDown={(event) => {
                    event.preventDefault();
                    choose(result);
                  }}
                  onMouseEnter={() => setActiveIndex(index)}
                >
                  <span className={`search-result-type ${result.type}`}>
                    {result.type === 'course' ? 'วิชา' : 'หัวข้อ'}
                  </span>
                  <span className="search-result-text">
                    <span className="search-result-title">{result.title}</span>
                    <span className="search-result-sub">{result.sub}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="user" title="ข้อมูลนักศึกษา">
        <span className="avatar">{studentName.charAt(0) || "?"}</span>
        <span className="who">
          <b>{studentName}</b>
          <small>วิทยาการคอมพิวเตอร์</small>
        </span>
      </div>

      <button className="logout-btn" onClick={onLogout}>
        ออกจากระบบ
      </button>
    </nav>
  );
}
export default Upperbar;