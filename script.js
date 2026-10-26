const plannerForm = document.querySelector("#planner-form");
const planOutput = document.querySelector("#plan-output");
const quizOutput = document.querySelector("#quiz-output");
const quizResult = document.querySelector("#quiz-result");

plannerForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const name = document.querySelector("#student-name").value.trim();
  const subjects = document.querySelector("#subjects").value
    .split(",").map((subject) => subject.trim()).filter(Boolean);
  const hours = Number(document.querySelector("#hours").value);
  const examDate = document.querySelector("#exam-date").value;
  const weakTopics = document.querySelector("#weak-topics").value.trim();

  if (subjects.length === 0 || !Number.isFinite(hours) || hours < 1) {
    planOutput.innerHTML = "<p>Please enter at least one subject and a valid number of study hours.</p>";
    planOutput.classList.remove("hidden");
    return;
  }

  const totalMinutes = hours * 60;
  const breakMinutes = Math.max(5, Math.round(totalMinutes * 0.1));
  const studyMinutes = totalMinutes - breakMinutes;
  const baseMinutes = Math.floor(studyMinutes / subjects.length);
  let remainder = studyMinutes % subjects.length;

  const rows = subjects.map((subject) => {
    const minutes = baseMinutes + (remainder-- > 0 ? 1 : 0);
    return `<li><span>${escapeHTML(subject)}</span><strong>${minutes} min</strong></li>`;
  }).join("");

  const focusHTML = weakTopics
    ? `<p><strong>Revision focus:</strong> ${escapeHTML(weakTopics)}. Add a short review of these topics at the end of your session.</p>`
    : "<p><strong>Tip:</strong> Use the final 10 minutes to review what you learned.</p>";
  const greeting = name ? `${escapeHTML(name)}'s study plan` : "Your study plan";
  const examHTML = examDate ? `<p><strong>Exam date:</strong> ${escapeHTML(examDate)}</p>` : "";

  planOutput.innerHTML = `
    <h3>${greeting}</h3>
    <p>Study for ${hours} hour(s), with about ${breakMinutes} minutes reserved for breaks.</p>
    <ul class="plan-list">${rows}<li><span>Breaks / reset</span><strong>${breakMinutes} min</strong></li></ul>
    ${examHTML}${focusHTML}
  `;
  planOutput.classList.remove("hidden");
});

const sampleQuestions = [
  {
    question: "Which habit is most helpful when preparing for an exam?",
    options: ["Study everything at the last minute", "Follow a realistic study schedule", "Skip revision", "Avoid taking breaks"],
    answer: 1
  },
  {
    question: "Why should students take practice quizzes?",
    options: ["To identify what they understand and what needs review", "To avoid learning", "To replace every textbook", "To make study time longer"],
    answer: 0
  },
  {
    question: "What is a useful way to handle a difficult topic?",
    options: ["Ignore it", "Break it into smaller parts and practise", "Never ask for help", "Only read it once"],
    answer: 1
  },
  {
    question: "What should you do after a study session?",
    options: ["Review key points", "Forget the topic", "Avoid checking mistakes", "Delete your notes"],
    answer: 0
  },
  {
    question: "Which is a good study break?",
    options: ["A short walk or stretch", "Another hour of scrolling", "Skipping sleep", "Studying without stopping all day"],
    answer: 0
  }
];

document.querySelector("#generate-quiz").addEventListener("click", () => {
  quizResult.classList.add("hidden");
  quizResult.textContent = "";
  quizOutput.innerHTML = sampleQuestions.map((item, index) => `
    <div class="question">
      <p>${index + 1}. ${escapeHTML(item.question)}</p>
      ${item.options.map((option, optionIndex) => `
        <label class="option">
          <input type="radio" name="question-${index}" value="${optionIndex}" />
          <span>${escapeHTML(option)}</span>
        </label>
      `).join("")}
    </div>
  `).join("") + '<button type="button" class="submit-quiz" id="submit-quiz">Check my score</button>';

  document.querySelector("#submit-quiz").addEventListener("click", gradeQuiz);
});

function gradeQuiz() {
  let score = 0;
  let answered = 0;

  sampleQuestions.forEach((question, index) => {
    const selected = document.querySelector(`input[name="question-${index}"]:checked`);
    if (selected) {
      answered += 1;
      if (Number(selected.value) === question.answer) score += 1;
    }
  });

  quizResult.textContent = `Your score: ${score}/${sampleQuestions.length}. You answered ${answered} of ${sampleQuestions.length} questions. Review any missed questions and try again.`;
  quizResult.classList.remove("hidden");
}

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
  })[character]);
}
