import TOPIC_PREREQUISITES from "../data/topicPrerequisites";

// ========================================
// แปลงข้อมูลหัวข้อจาก backend ให้เป็นรูปแบบที่หน้าเว็บใช้
//
//   courseDetails = ผลของ GET /api/courses/{id} ของทุกวิชา
//                   [{ id, code, name, topics: [{ id, name, desc, seqNo }] }]
//   doneTopicIds  = id ของหัวข้อที่เรารู้แล้ว (จาก GET /api/progress)
//
// ผลลัพธ์ 1 หัวข้อ หน้าตาแบบนี้
//   {
//     id: "7213...",
//     name: "Linked Lists",
//     desc: "...",
//     seqNo: 4,
//     courseId: "c000...213",
//     courseCode: "CS213",
//     courseName: "Data Structures",
//     done: true,            // รู้แล้วหรือยัง
//     prerequisites: [...],  // id ของหัวข้อที่ต้องรู้ก่อน
//     nextTopics: [...],     // id ของหัวข้อที่เอาหัวข้อนี้ไปต่อยอด
//     depth: 3,              // อยู่ลึกแค่ไหน (0 = พื้นฐานสุด) ใช้เรียง "เรียนอะไรก่อน-หลัง"
//   }
// ========================================

export function toTopicCards(courseDetails, doneTopicIds) {
  // 1) สร้างหัวข้อทุกตัว (ยังไม่มีเส้นเชื่อม)
  const topics = [];
  courseDetails.forEach((course) => {
    course.topics.forEach((topic) => {
      topics.push({
        id: topic.id,
        name: topic.name,
        desc: topic.desc,
        seqNo: topic.seqNo,
        courseId: course.id,
        courseCode: course.code,
        courseName: course.name,
        done: doneTopicIds.includes(topic.id),
        prerequisites: [],
        nextTopics: [],
        depth: 0,
      });
    });
  });

  // 2) ตารางค้นหัวข้อจากชื่อ เช่น "CS213: Linked Lists" → หัวข้อนั้น
  const topicByFullName = {};
  topics.forEach((topic) => {
    topicByFullName[`${topic.courseCode}: ${topic.name}`] = topic;
  });

  // 3) ใส่เส้นเชื่อมตาม data/topicPrerequisites.js
  Object.entries(TOPIC_PREREQUISITES).forEach(([courseCode, topicList]) => {
    Object.entries(topicList).forEach(([topicName, needList]) => {
      const topic = topicByFullName[`${courseCode}: ${topicName}`];
      if (!topic) {
        console.warn(`topicPrerequisites.js: ไม่เจอหัวข้อ "${courseCode}: ${topicName}"`);
        return;
      }

      needList.forEach((need) => {
        // ไม่มีรหัสวิชานำหน้า = หัวข้อในวิชาเดียวกัน
        const fullName = /^CS\d+: /.test(need) ? need : `${courseCode}: ${need}`;
        const needTopic = topicByFullName[fullName];
        if (!needTopic) {
          console.warn(`topicPrerequisites.js: ไม่เจอหัวข้อ "${fullName}" (ที่ ${courseCode}: ${topicName} ต้องรู้ก่อน)`);
          return;
        }

        topic.prerequisites.push(needTopic.id);
        needTopic.nextTopics.push(topic.id);
      });
    });
  });

  // 4) หา depth = ต้องผ่านหัวข้อก่อนหน้ายาวที่สุดกี่ขั้น
  const topicById = toLookup(topics);
  const finished = {};

  function depthOf(topic) {
    if (finished[topic.id]) return topic.depth;
    finished[topic.id] = true; // ตั้งไว้ก่อน กันวนไม่รู้จบ ถ้าข้อมูลบังเอิญชี้กันเป็นวง

    topic.prerequisites.forEach((preId) => {
      topic.depth = Math.max(topic.depth, depthOf(topicById[preId]) + 1);
    });
    return topic.depth;
  }

  topics.forEach(depthOf);
  return topics;
}


// { [id]: item } เอาไว้หาของจาก id ได้เร็ว ๆ
export function toLookup(items) {
  const lookup = {};
  items.forEach((item) => {
    lookup[item.id] = item;
  });
  return lookup;
}


// ========================================
// หาหัวข้อทั้งหมดที่ต้องรู้ก่อน (ย้อนไปให้สุดทุกชั้น)
//
//   startIds = id หัวข้อที่อยากเรียน (ใส่ได้หลายตัว เช่น ทุกหัวข้อในวิชาเดียว)
//
// ตัวอย่าง  Loops → Arrays → Arrays & Dynamic Arrays
//   findAllPrerequisites(["Arrays & Dynamic Arrays"]) ได้ [Loops, Arrays, ...]
//
// ผลลัพธ์ = หัวข้อเรียงจาก "พื้นฐานสุด" ไป "ใกล้หัวข้อที่อยากเรียน"
//           (ไม่รวมหัวข้อใน startIds เอง)
// ========================================

export function findAllPrerequisites(startIds, topicById) {
  const foundIds = [];
  const toVisit = [...startIds];

  while (toVisit.length > 0) {
    const topic = topicById[toVisit.pop()];

    topic.prerequisites.forEach((preId) => {
      if (!foundIds.includes(preId)) {
        foundIds.push(preId);
        toVisit.push(preId);
      }
    });
  }

  return foundIds
    .filter((id) => !startIds.includes(id))
    .map((id) => topicById[id])
    .sort(
      (a, b) =>
        a.depth - b.depth ||
        a.courseCode.localeCompare(b.courseCode) ||
        a.seqNo - b.seqNo
    );
}
