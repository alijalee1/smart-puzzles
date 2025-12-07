let riddles = [];
let currentRiddle = null;

// عناصر صفحة اللغز الرئيسية
const riddleText = document.getElementById("riddle-text");
const answerText = document.getElementById("answer-text");
const showAnswerBtn = document.getElementById("show-answer-btn");
const newRiddleBtn = document.getElementById("new-riddle-btn");
const copyLinkBtn = document.getElementById("copy-link-btn");
const copyStatus = document.getElementById("copy-status");
const yearSpan = document.getElementById("year");

// عناصر البحث (في الصفحة الرئيسية فقط)
const searchForm = document.getElementById("search-form");
const searchInput = document.getElementById("search-input");
const searchResults = document.getElementById("search-results");

// عناصر صفحة ألغاز الرياضيات
const mathList = document.getElementById("math-list");

// تحديث سنة الفوتر
if (yearSpan) {
  yearSpan.textContent = new Date().getFullYear();
}

// تحميل الألغاز من ملف JSON
function loadRiddles() {
  // لو لا نحتاج ألغاز في هذه الصفحة، لا نحمّل
  const needRiddles = riddleText || mathList;
  if (!needRiddles) return;

  fetch("riddles.json")
    .then((response) => response.json())
    .then((data) => {
      riddles = data;

      // تهيئة الصفحة الرئيسية
      if (riddleText) {
        if (newRiddleBtn) {
          newRiddleBtn.disabled = false;
        }

        const params = new URLSearchParams(window.location.search);
        const initialQuery = params.get("q");

        if (initialQuery && searchInput) {
          searchInput.value = initialQuery;
          performSearch(initialQuery);
          riddleText.textContent =
            'اختر أحد الألغاز من نتائج البحث بالأسفل أو اضغط "لغز جديد".';
        } else {
          riddleText.textContent =
            'اضغط على زر "لغز جديد" للحصول على لغز 👇';
        }
      }

      // تهيئة صفحة ألغاز الرياضيات
      if (mathList) {
        renderMathRiddles();
      }
    })
    .catch((error) => {
      console.error("لم يتم تحميل الألغاز من JSON:", error);
      if (riddleText) {
        riddleText.textContent =
          "تعذر تحميل الألغاز. يرجى إعادة تحميل الصفحة أو التأكد من الملفات.";
      }
      if (mathList) {
        mathList.innerHTML =
          '<p class="small-muted">تعذر تحميل ألغاز الرياضيات حاليًا.</p>';
      }
    });
}

// اختيار لغز عشوائي
function getRandomRiddle() {
  if (!riddles.length) return null;
  const index = Math.floor(Math.random() * riddles.length);
  return riddles[index];
}

// عرض لغز جديد
function showNewRiddle() {
  if (!riddles.length) {
    if (riddleText) {
      riddleText.textContent =
        "لا توجد ألغاز متاحة حاليًا. تأكد من ملف riddles.json.";
    }
    return;
  }
  currentRiddle = getRandomRiddle();
  if (riddleText) riddleText.textContent = currentRiddle.question;
  if (answerText) {
    answerText.textContent = currentRiddle.answer;
    answerText.classList.add("hidden");
  }
  if (showAnswerBtn) showAnswerBtn.disabled = false;
  if (copyStatus) copyStatus.textContent = "";
}

// إظهار الحل
function showAnswer() {
  if (!currentRiddle || !answerText) return;
  answerText.classList.remove("hidden");
}

// نسخ رابط الصفحة
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

/* ---------- البحث عن الألغاز في الصفحة الرئيسية ---------- */

function performSearch(query) {
  if (!searchResults) return;

  const q = (query || "").trim().toLowerCase();

  if (!q) {
    searchResults.innerHTML = "";
    return;
  }

  if (!riddles.length) {
    searchResults.innerHTML =
      '<p class="search-empty">جاري تحميل الألغاز، حاول مرة أخرى بعد لحظات.</p>';
    return;
  }

  const results = riddles.filter((r) => {
    const question = (r.question || "").toLowerCase();
    const type = (r.type || "").toLowerCase();
    return question.includes(q) || type.includes(q);
  });

  if (!results.length) {
    searchResults.innerHTML =
      '<p class="search-empty">لا توجد ألغاز مطابقة لبحثك حاليًا.</p>';
    return;
  }

  searchResults.innerHTML = results
    .slice(0, 10)
    .map(
      (r) => `
      <button class="search-result-item" data-id="${r.id}">
        <span class="search-type">${r.type || "لغز"}</span>
        <span class="search-question">${r.question}</span>
      </button>
    `
    )
    .join("");
}

if (searchForm && searchInput) {
  searchForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const query = searchInput.value;
    performSearch(query);

    const url = new URL(window.location);
    if (query && query.trim() !== "") {
      url.searchParams.set("q", query.trim());
    } else {
      url.searchParams.delete("q");
    }
    window.history.replaceState({}, "", url);
  });
}

if (searchResults) {
  searchResults.addEventListener("click", (event) => {
    const button = event.target.closest(".search-result-item");
    if (!button) return;

    const id = Number(button.dataset.id);
    const selected = riddles.find((r) => r.id === id);
    if (!selected) return;

    currentRiddle = selected;
    if (riddleText) riddleText.textContent = selected.question;
    if (answerText) {
      answerText.textContent = selected.answer;
      answerText.classList.add("hidden");
    }
    if (showAnswerBtn) showAnswerBtn.disabled = false;

    window.scrollTo({
      top: riddleText.offsetTop - 80,
      behavior: "smooth"
    });
  });
}

/* ---------- صفحة ألغاز الرياضيات ---------- */

function renderMathRiddles() {
  if (!mathList) return;

  const mathRiddles = riddles.filter((r) => {
    const type = (r.type || "").toLowerCase();
    return type.includes("رياضيات") || type.includes("رياضي");
  });

  if (!mathRiddles.length) {
    mathList.innerHTML =
      '<p class="small-muted">لا توجد ألغاز رياضيات متاحة حاليًا.</p>';
    return;
  }

  mathList.innerHTML = mathRiddles
    .map(
      (r, index) => `
      <div class="math-item">
        <h4>لغز رياضيات رقم ${index + 1}</h4>
        <p>${r.question}</p>
        <p class="math-answer"><strong>الحل:</strong> ${r.answer}</p>
      </div>
    `
    )
    .join("");
}

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

window.handleContactSubmit = handleContactSubmit;

// تحميل الألغاز عند فتح الصفحة المناسبة
loadRiddles();

// ربط الأزرار في الصفحة الرئيسية
if (newRiddleBtn) {
  newRiddleBtn.addEventListener("click", showNewRiddle);
}
if (showAnswerBtn) {
  showAnswerBtn.addEventListener("click", showAnswer);
}
if (copyLinkBtn) {
  copyLinkBtn.addEventListener("click", copyRiddleLink);
}
