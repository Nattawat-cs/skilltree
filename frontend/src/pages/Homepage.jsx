import { useState, useEffect } from "react";
import Rightpage from "../components/Rightpage";
import Leftpage from "../components/leftpage";
import Upperbar from "../components/Upperbar";
import Topicpage from "../components/Topicpage";
import TopicDetail from "../components/TopicDetail";
import { toLookup, toTopicCards } from "../utils/topics";
import "./Homepage.css";

// ========================================
// แปลงข้อมูลจาก backend ให้เป็นรูปแบบที่ Leftpage / Rightpage ใช้อยู่แล้ว
//
//   tree   = ผลของ GET /api/skill-tree
//            { courses: [...], prerequisites: [{ courseId, prerequisiteId }] }
//   topics = หัวข้อทุกตัว (จาก toTopicCards ใน utils/topics.js) เอามานับว่ามีกี่หัวข้อ รู้แล้วกี่หัวข้อ
//
// ผลลัพธ์ 1 วิชา หน้าตาแบบนี้
//   {
//     id: "c000...101",
//     code: "CS101",
//     name: "CS101 Introduction to Programming",
//     topics: 3,             // มีกี่หัวข้อ
//     learned: 1,            // รู้แล้วกี่หัวข้อ
//     prerequisites: [...],  // id ของวิชาที่ต้องผ่านก่อน
//     nextCourses: [...],    // id ของวิชาที่เอาวิชานี้ไปต่อยอด
//     description: "...",
//   }
// ========================================

function toCourseCards(tree, topics) {
  return tree.courses.map((course) => {
    // หัวข้อของวิชานี้
    const courseTopics = topics.filter((topic) => topic.courseId === course.id);

    // วิชาที่ต้องผ่านก่อนวิชานี้
    const prerequisites = tree.prerequisites
      .filter((link) => link.courseId === course.id)
      .map((link) => link.prerequisiteId);

    // วิชาที่ต้องใช้วิชานี้เป็นพื้นฐาน (กลับทิศของข้างบน)
    const nextCourses = tree.prerequisites
      .filter((link) => link.prerequisiteId === course.id)
      .map((link) => link.courseId);

    return {
      id: course.id,
      code: course.code,
      name: `${course.code} ${course.name}`,
      topics: courseTopics.length,
      learned: courseTopics.filter((topic) => topic.done).length,
      prerequisites: prerequisites,
      nextCourses: nextCourses,
      description: course.desc || "ยังไม่มีคำอธิบายรายวิชา",
    };
  });
}


function Home({ onLogout }) {

  // ========================================
  // ข้อมูลจาก backend (โหลดครั้งเดียวตอนเปิดหน้า)
  //   tree          = แผนผังวิชา + เส้น prerequisite   ตอนแรก null = ยังโหลดไม่เสร็จ
  //   courseDetails = รายละเอียด + หัวข้อ ของทุกวิชา
  //   doneTopicIds  = id ของหัวข้อที่เรารู้แล้ว
  // ========================================

  const [tree, setTree] = useState(null);
  const [courseDetails, setCourseDetails] = useState([]);
  const [doneTopicIds, setDoneTopicIds] = useState([]);

  // โหลดข้อมูลไม่สำเร็จไหม (เช่น backend ยังไม่ได้เปิด)
  const [loadError, setLoadError] = useState(false);

  // ========================================
  // สิ่งที่ผู้ใช้เลือก (เก็บแค่ id ตอนแรกยังไม่ได้เลือก = null)
  // ========================================

  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [selectedTopicId, setSelectedTopicId] = useState(null);

  // ========================================
  // แท็บที่เลือกอยู่บน Upperbar
  //   "course" = แผนผังรายวิชา
  //   "topic"  = แผนผังรายหัวข้อ
  // ========================================

  const [activeTab, setActiveTab] = useState("course");


  // ========================================
  // ดึงข้อมูลจาก backend ตอนเปิดหน้านี้
  // ========================================

  useEffect(() => {
    async function loadAll() {
      try {
        // 1) หัวข้อที่เรารู้แล้ว (ต้อง login — browser แนบ cookie ให้เอง)
        const progressResponse = await fetch("/api/progress");

        // session หมดอายุ (ไม่ได้ใช้งาน 30 นาที) → กลับไปหน้า login
        if (progressResponse.status === 401) {
          onLogout();
          return;
        }

        // 2) แผนผังวิชา + เส้น prerequisite (ไม่ต้อง login)
        const treeResponse = await fetch("/api/skill-tree");

        if (!treeResponse.ok || !progressResponse.ok) {
          throw new Error("backend ตอบ error");
        }

        const treeData = await treeResponse.json();
        const progressList = await progressResponse.json();

        // 3) หัวข้อของทุกวิชา (ยิงพร้อมกันทุกวิชา แล้วรอให้ครบ)
        const details = await Promise.all(
          treeData.courses.map(async (course) => {
            const response = await fetch(`/api/courses/${course.id}`);
            if (!response.ok) throw new Error("backend ตอบ error");
            return response.json();
          })
        );

        setTree(treeData);
        setCourseDetails(details);
        setDoneTopicIds(progressList.map((progress) => progress.topicId));
      } catch (error) {
        console.error("โหลดข้อมูลรายวิชาไม่สำเร็จ", error);
        setLoadError(true);
      }
    }

    loadAll();
  }, [onLogout]);


  // ========================================
  // แปลงข้อมูลให้หน้าเว็บใช้ (คำนวณใหม่ทุกครั้งที่ข้อมูลเปลี่ยน เช่น ติ๊กหัวข้อ)
  // ========================================

  const topics = toTopicCards(courseDetails, doneTopicIds);
  const topicById = toLookup(topics);
  const courses = tree ? toCourseCards(tree, topics) : [];

  const selectedCourse = courses.find((course) => course.id === selectedCourseId) || null;
  const selectedTopic = topicById[selectedTopicId] || null;

  // เลือกวิชา (หรือ null = เลิกเลือก) → เลิกเลือกหัวข้อด้วย
  function selectCourse(course) {
    setSelectedCourseId(course ? course.id : null);
    setSelectedTopicId(null);
  }

  // เลือกหัวข้อ → เลือกวิชาของหัวข้อนั้นด้วย แล้วไปแท็บรายหัวข้อ
  function selectTopic(topic) {
    setSelectedTopicId(topic.id);
    setSelectedCourseId(topic.courseId);
    setActiveTab("topic");
  }


  // ========================================
  // ติ๊ก / ยกเลิกติ๊ก "รู้แล้ว"
  //   ยังไม่รู้ → PUT    /api/progress/topics/{topicId}
  //   รู้แล้ว   → DELETE /api/progress/topics/{topicId}
  // ========================================

  async function toggleTopicDone(topicId) {
    const isDone = doneTopicIds.includes(topicId);

    const response = await fetch(`/api/progress/topics/${topicId}`, {
      method: isDone ? "DELETE" : "PUT",
    });

    if (response.status === 401) {
      onLogout();
      return;
    }
    if (!response.ok) {
      alert("บันทึกไม่สำเร็จ ลองใหม่อีกครั้ง");
      return;
    }

    if (isDone) {
      setDoneTopicIds(doneTopicIds.filter((id) => id !== topicId));
    } else {
      setDoneTopicIds([...doneTopicIds, topicId]);
    }
  }


  // ========================================
  // ฝั่งซ้ายแสดงอะไร
  //   โหลดพัง           → ข้อความ error
  //   แท็บรายหัวข้อ      → แผนผังรายหัวข้อ
  //   แท็บรายวิชา (ปกติ) → แผนผังรายวิชา
  // ========================================

  function renderLeftSide() {
    if (loadError) {
      return (
        <div className="load-error">
          โหลดข้อมูลรายวิชาไม่สำเร็จ ลองเช็กว่า backend เปิดอยู่ไหม
        </div>
      );
    }

    if (activeTab === "topic") {
      return (
        <Topicpage
          topics={topics}
          courses={courses}
          selectedTopic={selectedTopic}
          selectedCourse={selectedCourse}
          onSelectTopic={selectTopic}
        />
      );
    }

    return (
      <Leftpage
        courses={courses}
        selectedCourse={selectedCourse}
        setSelectedCourse={selectCourse}
      />
    );
  }


  return (
    <>
      <Upperbar
        onLogout={onLogout}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        courses={courses}
        topics={topics}
        onSelectCourse={selectCourse}
        onSelectTopic={selectTopic}
      />
      {/* ==================================
          Navbar
      ================================== */}

      {/* ==================================
          เนื้อหาหลัก
      ================================== */}

      <div className="homepage">


        {/* ==================================
            ฝั่งซ้าย 70%
        ================================== */}

        <div className="leftPage">

          {renderLeftSide()}

        </div>


        {/* ==================================
            ฝั่งขวา 30%
        ================================== */}

        <div className="rightPage">

          {/* แท็บรายหัวข้อ + เลือกหัวข้อไว้ → รายละเอียดหัวข้อ / นอกนั้น → รายละเอียดวิชา */}
          {activeTab === "topic" && selectedTopic ? (
            <TopicDetail
              topic={selectedTopic}
              topicById={topicById}
              onSelectTopic={selectTopic}
              onToggleDone={toggleTopicDone}
              onClear={() => setSelectedTopicId(null)}
            />
          ) : (
            <Rightpage
              selectedCourse={selectedCourse}
              setSelectedCourse={selectCourse}
              courses={courses}
              courseTopics={topics.filter((topic) => topic.courseId === selectedCourseId)}
              onShowTopics={() => setActiveTab("topic")}
              onSelectTopic={selectTopic}
            />
          )}

        </div>

      </div>
    </>
  );
}

export default Home;
