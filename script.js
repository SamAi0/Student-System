// Get saved information from LocalStorage.
var students = JSON.parse(localStorage.getItem("students")) || [];
var results = JSON.parse(localStorage.getItem("results")) || [];


// Show one app page and hide the other pages.
function showContent(pageId) {
  var pages = document.querySelectorAll(".content-page");
  for (var i = 0; i < pages.length; i++) pages[i].classList.add("hide");
  document.getElementById(pageId).classList.remove("hide");

  var buttons = document.querySelectorAll(".menu-button");
  for (var j = 0; j < buttons.length; j++) {
    buttons[j].classList.remove("active");
    if (buttons[j].getAttribute("data-page") === pageId) buttons[j].classList.add("active");
  }
}

function saveStudents() {
  localStorage.setItem("students", JSON.stringify(students));
}
function saveResults() {
  localStorage.setItem("results", JSON.stringify(results));
}
function findStudent(id) {
  for (var i = 0; i < students.length; i++) {
    if (students[i].id.toLowerCase() === id.toLowerCase()) return students[i];
  }
  return null;
}
function findResult(id) {
  for (var i = 0; i < results.length; i++) {
    if (results[i].studentId.toLowerCase() === id.toLowerCase()) return results[i];
  }
  return null;
}

// Side menu buttons open the selected page.
var menuButtons = document.querySelectorAll(".menu-button");
for (var i = 0; i < menuButtons.length; i++) {
  menuButtons[i].addEventListener("click", function() {
    showContent(this.getAttribute("data-page"));
  });
}

// Save a student. The Student ID must be unique.
document.getElementById("studentForm").addEventListener("submit", function(event) {
  event.preventDefault();
  var id = document.getElementById("studentId").value.trim();
  if (findStudent(id)) {
    document.getElementById("studentMessage").textContent = "This Student ID is already used.";
    return;
  }
  students.push({
    id: id,
    name: document.getElementById("studentName").value.trim(),
    email: document.getElementById("studentEmail").value.trim(),
    phone: document.getElementById("studentPhone").value.trim(),
    course: document.getElementById("studentCourse").value.trim()
  });
  saveStudents();
  this.reset();
  document.getElementById("studentMessage").textContent = "Student saved.";
  showStudents();
  fillStudentOptions();
});

// Show all student records in the table.
function showStudents() {
  var table = document.getElementById("recordsTable");
  table.innerHTML = "";
  for (var i = 0; i < students.length; i++) {
    var row = document.createElement("tr");
    row.innerHTML = "<td>" + students[i].id + "</td><td>" + students[i].name + "</td><td>" + students[i].email + "</td><td>" + students[i].phone + "</td><td>" + students[i].course + "</td><td><button class='delete-button' data-id='" + students[i].id + "'>Delete</button></td>";
    table.appendChild(row);
  }
  document.getElementById("emptyMessage").classList.toggle("hide", students.length > 0);
}

// Delete a student and their result, if there is one.
document.getElementById("recordsTable").addEventListener("click", function(event) {
  if (event.target.className === "delete-button") {
    var id = event.target.getAttribute("data-id");
    students = students.filter(function(student) { return student.id !== id; });
    results = results.filter(function(result) { return result.studentId.toLowerCase() !== id.toLowerCase(); });
    saveStudents();
    saveResults();
    showStudents();
    showResults();
    fillStudentOptions();
  }
});

// Put registered students in the result form list.
function fillStudentOptions() {
  var options = document.getElementById("studentOptions");
  options.innerHTML = "";
  for (var i = 0; i < students.length; i++) {
    var option = document.createElement("option");
    option.value = students[i].id;
    option.label = students[i].name;
    options.appendChild(option);
  }
}

// Calculate total, percentage, grade and pass/fail status.
function calculateResult(marks) {
  var total = 0;
  var passedAll = true;
  for (var i = 0; i < marks.length; i++) {
    total = total + marks[i];
    if (marks[i] < 35) passedAll = false;
  }
  var percentage = total / 5;
  var grade = "F";
  if (percentage >= 90) grade = "A+";
  else if (percentage >= 80) grade = "A";
  else if (percentage >= 70) grade = "B";
  else if (percentage >= 60) grade = "C";
  else if (percentage >= 40) grade = "D";
  var status = "Fail";
  if (passedAll) status = "Pass";
  return { total: total, percentage: percentage.toFixed(2), grade: grade, status: status };
}

// Save a new result or update the result currently being edited.
document.getElementById("resultForm").addEventListener("submit", function(event) {
  event.preventDefault();
  var id = document.getElementById("resultStudent").value.trim();
  var student = findStudent(id);
  if (!student) {
    document.getElementById("resultMessage").textContent = "Please enter a registered Student ID.";
    return;
  }
  var markInputs = document.querySelectorAll(".mark");
  var marks = [];
  for (var i = 0; i < markInputs.length; i++) marks.push(Number(markInputs[i].value));
  var calculated = calculateResult(marks);
  var result = {
    studentId: id,
    marks: marks,
    total: calculated.total,
    percentage: calculated.percentage,
    grade: calculated.grade,
    status: calculated.status
  };
  var oldResult = findResult(id);
  if (oldResult) {
    for (var j = 0; j < results.length; j++) {
      if (results[j].studentId.toLowerCase() === id.toLowerCase()) results[j] = result;
    }
    document.getElementById("resultMessage").textContent = "Result updated.";
  } else {
    results.push(result);
    document.getElementById("resultMessage").textContent = "Result saved.";
  }
  saveResults();
  this.reset();
  showResults();
});

// Show all saved results.
function showResults() {
  var table = document.getElementById("resultTable");
  table.innerHTML = "";
  for (var i = 0; i < results.length; i++) {
    var student = findStudent(results[i].studentId);
    var name = "Student not found";
    if (student) name = student.name;
    var row = document.createElement("tr");
    row.innerHTML = "<td>" + results[i].studentId + "</td><td>" + name + "</td><td>" + results[i].total + " / 500</td><td>" + results[i].percentage + "%</td><td>" + results[i].grade + "</td><td>" + results[i].status + "</td><td><button class='edit-result' data-id='" + results[i].studentId + "'>Edit</button> <button class='delete-result' data-id='" + results[i].studentId + "'>Delete</button></td>";
    table.appendChild(row);
  }
  document.getElementById("noResults").classList.toggle("hide", results.length > 0);
}

// Edit or delete a result from the results table.
document.getElementById("resultTable").addEventListener("click", function(event) {
  var id = event.target.getAttribute("data-id");
  var result = findResult(id);
  if (!result) return;
  if (event.target.className === "edit-result") {
    document.getElementById("resultStudent").value = result.studentId;
    var markInputs = document.querySelectorAll(".mark");
    for (var i = 0; i < markInputs.length; i++) markInputs[i].value = result.marks[i];
  } else if (event.target.className === "delete-result") {
    results = results.filter(function(item) { return item.studentId !== id; });
    saveResults();
    showResults();
  }
});

// Search for a student and show their result on this same page.
document.getElementById("searchForm").addEventListener("submit", function(event) {
  event.preventDefault();
  var id = document.getElementById("searchId").value.trim();
  var student = findStudent(id);
  var result = findResult(id);
  var message = document.getElementById("searchMessage");
  var output = document.getElementById("searchResult");
  output.classList.add("hide");

  if (!student) {
    message.textContent = "Student not found. Please check the Student ID.";
  } else if (!result) {
    message.textContent = "Student found, but no result has been entered yet.";
  } else {
    message.textContent = "";
    output.innerHTML = "<h3>" + student.name + " (" + student.id + ")</h3><p>Course: " + student.course + "</p><p>HTML: " + result.marks[0] + " / 100</p><p>CSS: " + result.marks[1] + " / 100</p><p>JavaScript: " + result.marks[2] + " / 100</p><p>Database: " + result.marks[3] + " / 100</p><p>Computer Fundamentals: " + result.marks[4] + " / 100</p><p><b>Total:</b> " + result.total + " / 500</p><p><b>Percentage:</b> " + result.percentage + "%</p><p><b>Grade:</b> " + result.grade + "</p><p><b>Status:</b> " + result.status + "</p>";
    output.classList.remove("hide");
  }
});

