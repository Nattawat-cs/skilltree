// ========================================
// แหล่งเรียนของแต่ละวิชา (ข้อมูลชั่วคราว เลือกเอง)
//
// ใช้ฟรีทั้งหมด เช็คแล้วว่าลิงก์เปิดได้ (ต.ค. 2569)
// backend ยังไม่มีตารางนี้ เลยเขียนไว้ฝั่งหน้าบ้านไปก่อนเหมือน topicPrerequisites.js
//
// วิธีอ่าน
//   CS213: [
//     { type: "video", title: "Abdul Bari", url: "https://...", note: "อธิบายพร้อมวาดบนกระดาน" },
//   ]
//   type  = "video" (คลิป / ช่อง YouTube) | "web" (เว็บอ่าน / ฝึกทำ) | "book" (หนังสือฟรี) | "course" (คอร์สเต็ม)
//   note  = บอกสั้น ๆ ว่าเหมาะกับอะไร
//
// แหล่งเรียนรายหัวข้อ ไม่ได้เขียนไว้ที่นี่ หน้าเว็บจะสร้างลิงก์ค้นหา YouTube / Google จากชื่อหัวข้อให้เอง
// ========================================

const COURSE_RESOURCES = {
  CS100: [
    { type: "web", title: "MDN Learn web development", url: "https://developer.mozilla.org/en-US/docs/Learn_web_development", note: "HTML / CSS / JS ตั้งแต่ศูนย์ ละเอียดและถูกต้องที่สุด" },
    { type: "web", title: "javascript.info", url: "https://javascript.info/", note: "JavaScript ทีละบท มีแบบฝึกหัดท้ายบท" },
    { type: "course", title: "The Odin Project", url: "https://www.theodinproject.com/", note: "ทำเว็บจริงไปทีละโปรเจกต์" },
    { type: "video", title: "freeCodeCamp (YouTube)", url: "https://www.youtube.com/@freecodecamp", note: "คลิปสอนยาวแบบคอร์สเต็ม" },
  ],
  CS101: [
    { type: "video", title: "Discrete Math Full Course (YouTube)", url: "https://www.youtube.com/playlist?list=PLHXZ9OQGMqxersk8fUxiUMSIx0DBqsKZS", note: "เซต ตรรกะ การพิสูจน์ กราฟ ครบทั้งวิชา" },
    { type: "book", title: "Discrete Mathematics: An Open Introduction", url: "https://discrete.openmathbooks.org/dmoi3.html", note: "หนังสือฟรี มีโจทย์พร้อมเฉลย" },
    { type: "course", title: "MIT 6.042J Mathematics for CS", url: "https://ocw.mit.edu/courses/6-042j-mathematics-for-computer-science-fall-2010/", note: "เน้นการพิสูจน์และการนับ" },
    { type: "video", title: "Neso Academy (YouTube)", url: "https://www.youtube.com/@NesoAcademy", note: "Boolean algebra และวงจรดิจิทัล" },
  ],
  CS102: [
    { type: "course", title: "CS50x (Harvard)", url: "https://cs50.harvard.edu/x/", note: "ปูพื้นการเขียนโปรแกรมที่ดีที่สุดตัวหนึ่ง" },
    { type: "video", title: "Bro Code (YouTube)", url: "https://www.youtube.com/@BroCodez", note: "คลิปสั้น ตรงประเด็น หลายภาษา" },
    { type: "web", title: "VisuAlgo", url: "https://visualgo.net/en", note: "ดูภาพเคลื่อนไหวว่า loop / recursion ทำงานยังไง" },
  ],
  CS111: [
    { type: "course", title: "MOOC.fi Java Programming", url: "https://java-programming.mooc.fi/", note: "Java + OOP ทีละขั้น มีโจทย์ตรวจอัตโนมัติ" },
    { type: "web", title: "Oracle: Object-Oriented Concepts", url: "https://docs.oracle.com/javase/tutorial/java/concepts/", note: "class / object / inheritance / interface จากต้นทาง" },
    { type: "web", title: "Refactoring.Guru", url: "https://refactoring.guru/design-patterns", note: "หลักออกแบบเชิงวัตถุ มีภาพประกอบ" },
  ],
  CS180: [
    { type: "web", title: "Laws of UX", url: "https://lawsofux.com/", note: "กฎการออกแบบที่ใช้บ่อย สรุปเป็นการ์ด" },
    { type: "web", title: "W3C: Introduction to Web Accessibility", url: "https://www.w3.org/WAI/fundamentals/accessibility-intro/", note: "ออกแบบให้ทุกคนใช้ได้" },
    { type: "web", title: "Figma Help Center", url: "https://help.figma.com/hc/en-us", note: "ทำ wireframe / prototype ใน Figma" },
  ],
  CS213: [
    { type: "web", title: "VisuAlgo", url: "https://visualgo.net/en", note: "ภาพเคลื่อนไหวของ list / tree / heap / hash / graph" },
    { type: "web", title: "USFCA Data Structure Visualizations", url: "https://www.cs.usfca.edu/~galles/visualization/Algorithms.html", note: "ลองใส่ค่าเองแล้วดูโครงสร้างเปลี่ยน" },
    { type: "video", title: "Abdul Bari (YouTube)", url: "https://www.youtube.com/@abdul_bari", note: "อธิบายพร้อมวาดบนกระดาน" },
    { type: "book", title: "Open Data Structures", url: "https://opendatastructures.org/", note: "หนังสือฟรี มีโค้ดประกอบ" },
  ],
  CS217: [
    { type: "video", title: "Abdul Bari (YouTube)", url: "https://www.youtube.com/@abdul_bari", note: "Divide & conquer / greedy / DP ครบ" },
    { type: "course", title: "MIT 6.006 Introduction to Algorithms", url: "https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-spring-2020/", note: "คลิปบรรยาย + โจทย์" },
    { type: "book", title: "Jeff Erickson: Algorithms", url: "https://jeffe.cs.illinois.edu/teaching/algorithms/", note: "หนังสือฟรี อธิบายเหตุผลเบื้องหลังดีมาก" },
    { type: "web", title: "VisuAlgo", url: "https://visualgo.net/en", note: "ดู sorting / shortest path / MST ทำงานทีละขั้น" },
  ],
  CS221: [
    { type: "course", title: "Nand2Tetris", url: "https://www.nand2tetris.org/", note: "สร้างคอมพิวเตอร์เองตั้งแต่ logic gate" },
    { type: "video", title: "Crash Course Computer Science (YouTube)", url: "https://www.youtube.com/playlist?list=PL8dPuuaLjXtNlUrzyH5r6jN9ulIgZBpdo", note: "ภาพรวม CPU / memory เข้าใจง่าย" },
    { type: "video", title: "Neso Academy (YouTube)", url: "https://www.youtube.com/@NesoAcademy", note: "Computer organization รายหัวข้อ" },
  ],
  CS222: [
    { type: "book", title: "OSTEP (Operating Systems: Three Easy Pieces)", url: "https://pages.cs.wisc.edu/~remzi/OSTEP/", note: "หนังสือ OS ฟรี อ่านง่ายที่สุด" },
    { type: "course", title: "The Missing Semester (MIT)", url: "https://missing.csail.mit.edu/", note: "ใช้ command line / shell ให้คล่อง" },
    { type: "video", title: "Neso Academy (YouTube)", url: "https://www.youtube.com/@NesoAcademy", note: "process / scheduling / deadlock" },
  ],
  CS223: [
    { type: "web", title: "Red Hat: What is virtualization?", url: "https://www.redhat.com/en/topics/virtualization/what-is-virtualization", note: "ภาพรวม VM / hypervisor" },
    { type: "web", title: "Docker: Get started", url: "https://docs.docker.com/get-started/", note: "container / image / compose จากต้นทาง" },
    { type: "web", title: "Kubernetes Basics", url: "https://kubernetes.io/docs/tutorials/kubernetes-basics/", note: "ลองสั่ง Kubernetes ทีละขั้น" },
    { type: "video", title: "Fireship (YouTube)", url: "https://www.youtube.com/@Fireship", note: "คลิปสั้นสรุปเครื่องมือแต่ละตัว" },
  ],
  CS232: [
    { type: "web", title: "AWS: What is cloud computing?", url: "https://aws.amazon.com/what-is-cloud-computing/", note: "IaaS / PaaS / SaaS เบื้องต้น" },
    { type: "course", title: "Microsoft Learn: Describe cloud concepts", url: "https://learn.microsoft.com/en-us/training/paths/microsoft-azure-fundamentals-describe-cloud-concepts/", note: "คอร์สสั้นปูพื้นคลาวด์" },
    { type: "web", title: "NIST Definition of Cloud Computing", url: "https://csrc.nist.gov/pubs/sp/800/145/final", note: "นิยามมาตรฐานของ service / deployment model" },
    { type: "video", title: "ByteByteGo (YouTube)", url: "https://www.youtube.com/@ByteByteGo", note: "scalability / load balancing เป็นภาพ" },
  ],
  CS240: [
    { type: "course", title: "Kaggle Learn", url: "https://www.kaggle.com/learn", note: "pandas / visualization / ML ลองทำใน browser" },
    { type: "book", title: "Python Data Science Handbook", url: "https://jakevdp.github.io/PythonDataScienceHandbook/", note: "NumPy / pandas / matplotlib ครบ" },
    { type: "video", title: "StatQuest (YouTube)", url: "https://www.youtube.com/@statquest", note: "สถิติและ ML อธิบายช้า ๆ ชัด ๆ" },
  ],
  CS241: [
    { type: "course", title: "Programming Languages (Coursera)", url: "https://www.coursera.org/learn/programming-languages", note: "functional / OOP / type system" },
    { type: "book", title: "Crafting Interpreters", url: "https://craftinginterpreters.com/", note: "เขียนภาษาเอง เข้าใจ syntax / scope / GC" },
    { type: "video", title: "Computerphile (YouTube)", url: "https://www.youtube.com/@Computerphile", note: "แนวคิดภาษาโปรแกรมแบบเล่าเรื่อง" },
  ],
  CS242: [
    { type: "web", title: "The Python Tutorial", url: "https://docs.python.org/3/tutorial/", note: "จากต้นทาง ครบทุกพื้นฐาน" },
    { type: "course", title: "CS50P (Harvard)", url: "https://cs50.harvard.edu/python/", note: "คอร์ส Python ฟรี มีโจทย์" },
    { type: "book", title: "Automate the Boring Stuff", url: "https://automatetheboringstuff.com/", note: "ใช้ Python ทำงานจริง (ไฟล์ / เว็บ)" },
    { type: "web", title: "pandas: Getting started", url: "https://pandas.pydata.org/docs/getting_started/index.html", note: "ตาราง / DataFrame" },
  ],
  CS251: [
    { type: "web", title: "SQLBolt", url: "https://sqlbolt.com/", note: "ฝึก SQL ทีละบท พิมพ์ใน browser" },
    { type: "course", title: "CMU 15-445 Database Systems", url: "https://15445.courses.cs.cmu.edu/", note: "storage / index / transaction เชิงลึก" },
    { type: "web", title: "PostgreSQL Tutorial", url: "https://www.postgresql.org/docs/current/tutorial.html", note: "SQL จากเอกสารจริง" },
  ],
  CS261: [
    { type: "web", title: "Atlassian Agile Coach", url: "https://www.atlassian.com/agile", note: "Agile / Scrum / การวางแผนงาน" },
    { type: "web", title: "The Scrum Guide", url: "https://scrumguides.org/scrum-guide.html", note: "Scrum ฉบับทางการ อ่านจบในชั่วโมงเดียว" },
    { type: "book", title: "Pro Git", url: "https://git-scm.com/book/en/v2", note: "Git ตั้งแต่พื้นฐานถึงทำงานเป็นทีม" },
    { type: "web", title: "Refactoring.Guru", url: "https://refactoring.guru/design-patterns", note: "Design patterns มีภาพและโค้ด" },
  ],
  CS271: [
    { type: "course", title: "Berkeley CS188 Intro to AI", url: "https://inst.eecs.berkeley.edu/~cs188/", note: "search / CSP / minimax ตรงกับวิชา" },
    { type: "course", title: "Elements of AI", url: "https://www.elementsofai.com/", note: "ภาพรวม AI ไม่ต้องใช้คณิตเยอะ" },
    { type: "book", title: "AIMA (Artificial Intelligence: A Modern Approach)", url: "https://aima.cs.berkeley.edu/", note: "ตำราหลักของวิชา มีโค้ดประกอบ" },
  ],
  CS301: [
    { type: "web", title: "Tech Interview Handbook", url: "https://www.techinterviewhandbook.org/", note: "เตรียมสัมภาษณ์งานสาย tech" },
    { type: "web", title: "Purdue OWL", url: "https://owl.purdue.edu/owl/purdue_owl.html", note: "เขียนรายงาน / อ้างอิง / citation" },
    { type: "web", title: "draw.io", url: "https://www.drawio.com/", note: "วาดแผนภาพใส่ proposal / รายงาน" },
  ],
  CS305: [
    { type: "web", title: "สำนักงานคณะกรรมการคุ้มครองข้อมูลส่วนบุคคล (PDPC)", url: "https://www.pdpc.or.th/", note: "PDPA ฉบับทางการของไทย" },
    { type: "video", title: "Computerphile (YouTube)", url: "https://www.youtube.com/@Computerphile", note: "privacy / security กับสังคม" },
  ],
  CS314: [
    { type: "course", title: "MIT 18.404J Theory of Computation", url: "https://ocw.mit.edu/courses/18-404j-theory-of-computation-fall-2020/", note: "Sipser สอนเอง ตรงกับวิชา" },
    { type: "video", title: "Easy Theory (YouTube)", url: "https://www.youtube.com/@easytheory", note: "DFA / NFA / CFG / Turing machine ทีละโจทย์" },
    { type: "web", title: "JFLAP", url: "https://www.jflap.org/", note: "วาด automata แล้วลองรันได้" },
    { type: "video", title: "Neso Academy (YouTube)", url: "https://www.youtube.com/@NesoAcademy", note: "Theory of computation รายหัวข้อ" },
  ],
  CS331: [
    { type: "web", title: "Kurose & Ross (Computer Networking)", url: "https://gaia.cs.umass.edu/kurose_ross/", note: "สไลด์ คลิป และ interactive problems ของตำราหลัก" },
    { type: "book", title: "Beej's Guide to Network Programming", url: "https://beej.us/guide/bgnet/", note: "socket programming ฉบับเข้าใจง่าย" },
    { type: "video", title: "NetworkChuck (YouTube)", url: "https://www.youtube.com/@NetworkChuck", note: "subnetting / DNS / เครื่องมือ network" },
  ],
  CS332: [
    { type: "web", title: "PortSwigger Web Security Academy", url: "https://portswigger.net/web-security", note: "ฝึกโจมตี / ป้องกันเว็บ มี lab ฟรี" },
    { type: "web", title: "OWASP Top 10", url: "https://owasp.org/www-project-top-ten/", note: "ช่องโหว่เว็บที่เจอบ่อยที่สุด" },
    { type: "video", title: "Computerphile (YouTube)", url: "https://www.youtube.com/@Computerphile", note: "cryptography / authentication อธิบายง่าย" },
  ],
  CS372: [
    { type: "course", title: "Google Machine Learning Crash Course", url: "https://developers.google.com/machine-learning/crash-course", note: "ML พื้นฐานพร้อมแบบฝึก" },
    { type: "video", title: "StatQuest (YouTube)", url: "https://www.youtube.com/@statquest", note: "regression / decision tree / naive Bayes ทีละขั้น" },
    { type: "video", title: "3Blue1Brown: Neural networks", url: "https://www.youtube.com/playlist?list=PLZHQObOWTQDNU6R1_67000Dx_ZCJB-3pi", note: "เห็นภาพว่าโมเดลเรียนรู้ยังไง" },
    { type: "web", title: "scikit-learn User Guide", url: "https://scikit-learn.org/stable/user_guide.html", note: "ใช้โมเดลจริงใน Python" },
  ],
};

export default COURSE_RESOURCES;
