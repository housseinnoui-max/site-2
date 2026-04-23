const express = require("express");
const app = express();

app.use(express.json());

// قاعدة بيانات مؤقتة (في الذاكرة)
let users = [
  {
    email: "parent@test.com",
    password: "1234",
    role: "parent",
    children: ["Ali", "Sara"]
  },
  {
    email: "teacher@test.com",
    password: "1234",
    role: "teacher"
  }
];

let grades = [];

// ===== API =====

// تسجيل الدخول
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  const user = users.find(
    u => u.email === email && u.password === password
  );

  if (!user) return res.status(401).send("خطأ");

  res.json(user);
});

// إضافة نقطة
app.post("/add-grade", (req, res) => {
  grades.push(req.body);
  res.send("تمت الإضافة");
});

// جلب نقاط
app.get("/grades/:name", (req, res) => {
  const result = grades.filter(g => g.student === req.params.name);
  res.json(result);
});

// ===== FRONTEND =====

app.get("/", (req, res) => {
  res.send(`
    <h2>Ecole Connect</h2>

    <input id="email" placeholder="email"><br>
    <input id="password" placeholder="password" type="password"><br>
    <button onclick="login()">Login</button>

    <div id="app"></div>

    <script>
      let user = null;

      async function login() {
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;

        const res = await fetch("/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password })
        });

        if (res.status !== 200) {
          alert("خطأ");
          return;
        }

        user = await res.json();

        if (user.role === "parent") {
          loadParent();
        } else {
          loadTeacher();
        }
      }

      async function loadParent() {
        let html = "<h3>أبناءك:</h3>";

        for (let child of user.children) {
          html += "<b>" + child + "</b><br>";

          const res = await fetch("/grades/" + child);
          const data = await res.json();

          data.forEach(g => {
            html += g.subject + ": " + g.value + "<br>";
          });

          html += "<hr>";
        }

        document.getElementById("app").innerHTML = html;
      }

      function loadTeacher() {
        document.getElementById("app").innerHTML = \`
          <h3>إضافة نقطة</h3>
          <input id="student" placeholder="التلميذ"><br>
          <input id="subject" placeholder="المادة"><br>
          <input id="grade" placeholder="النقطة"><br>
          <button onclick="add()">إضافة</button>
        \`;
      }

      async function add() {
        const student = document.getElementById("student").value;
        const subject = document.getElementById("subject").value;
        const value = document.getElementById("grade").value;

        await fetch("/add-grade", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ student, subject, value })
        });

        alert("تمت");
      }
    </script>
  `);
});

// تشغيل السيرفر
app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
