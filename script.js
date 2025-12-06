let riddles = [];
let currentRiddle = null;

// عناصر من الـ HTML للصفحة الرئيسية
const riddleText = document.getElementById("riddle-text");
const answerText = document.getElementById("answer-text");
const showAnswerBtn = document.getElementById("show-answer-btn");
const newRiddleBtn = document.getElementById("new-riddle-btn");
const copyLinkBtn = document.getElementById("copy-link-btn");
const copyStatus = document.getElementById("copy-status");
const yearSpan = document.getElementById("year");

// تحديث سنة الفوتر في كل الصفحات
if (yearSpan) {
  yearSpan.textContent = new Date().getFullYear();
}

// تحميل الألغاز من ملف JSON (فقط إذا كنا في الصفحة الرئيسية)
function loadRiddles() {
  if (!riddleText) return;

  fetch("riddles.json")
    .then((response) => response.json())
    .then((data) => {
      riddles = data;
      if (newRiddleBtn) {
        newRiddleBtn.disabled = false;
      }
      riddleText.textContent = "اضغط على زر \"لغز جديد\" للحصول على لغز 👇";
    })
    .catch((error) => {
      console.error("لم يتم تحميل الألغاز من JSON:", error);
      riddleText.textContent =
        "تعذر تحميل الألغاز. يرجى إعادة تحميل الصفحة أو التأكد من الملفات.";
    });
}

// دالة لاختيار لغز عشوائي
function getRandomRiddle() {
  if (!riddles.length) return null;
  const index = Math.floor(Math.random() * riddles.length);
  return riddles[index];
}

// عرض لغز جديد
function showNewRiddle() {
  if (!riddles.length) {
    riddleText.textContent =
      "لا توجد ألغاز متاحة حاليًا. تأكد من ملف riddles.json.";
    return;
  }
  currentRiddle = getRandomRiddle();
  riddleText.textContent = currentRiddle.question;
  answerText.textContent = currentRiddle.answer;
  answerText.classList.add("hidden");
  if (showAnswerBtn) showAnswerBtn.disabled = false;
  if (copyStatus) copyStatus.textContent = "";
}

// إظهار الحل
function showAnswer() {
  if (!currentRiddle || !answerText) return;
  answerText.classList.remove("hidden");
}

// نسخ رابط الموقع (مبدئيًا)
function copyRiddleLink() {
  if (!navigator.clipboard) {
    if (copyStatus) {
      copyStatus.textContent =
        "متصفحك لا يدعم النسخ التلقائي، انسخ الرابط يدويًا من شريط العنوان.";
    }
    return;
  }

  const url = window.location.href;
  navigator.clipboard
    .writeText(url)
    .then(() => {
      if (copyStatus) {
        copyStatus.textContent =
          "تم نسخ رابط الموقع، يمكنك مشاركته مع أصدقائك.";
      }
    })
    .catch(() => {
      if (copyStatus) {
        copyStatus.textContent =
          "تعذر النسخ تلقائيًا، انسخ الرابط يدويًا من شريط العنوان.";
      }
    });
}

// ربط الأحداث بالأزرار إذا موجودة
if (newRiddleBtn) {
  newRiddleBtn.addEventListener("click", showNewRiddle);
}
if (showAnswerBtn) {
  showAnswerBtn.addEventListener("click", showAnswer);
}
if (copyLinkBtn) {
  copyLinkBtn.addEventListener("click", copyRiddleLink);
}

// استدعاء تحميل الألغاز عند فتح الصفحة الرئيسية
loadRiddles();

/* ---- صفحة اتصل بنا ---- */

function handleContactSubmit(event) {
  event.preventDefault();

  const nameInput = document.getElementById("name");
  const emailInput = document.getElementById("email");
  const messageInput = document.getElementById("message");
  const statusEl = document.getElementById("contact-status");

  if (!nameInput || !emailInput || !messageInput || !statusEl) return;

  statusEl.textContent = "شكرًا لتواصلك معنا، تم استلام رسالتك (تجريبيًا).";
  messageInput.value = "";
}

// نجعل الدالة متاحة في الـ HTML
window.handleContactSubmit = handleContactSubmit;
