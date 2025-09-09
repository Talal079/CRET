document.addEventListener('DOMContentLoaded', () => {
    const searchForm = document.getElementById('search-form');
    const regNumberInput = document.getElementById('reg-number');
    const resultDisplay = document.getElementById('result-display');

    searchForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const regNumber = regNumberInput.value.trim();

        if (!regNumber) {
            displayMessage("الرجاء إدخال رقم القيد.", 'error');
            return;
        }

        displayMessage("جاري البحث عن النتيجة، يرجى الانتظار...", 'loading');

        try {
            const studentResult = await fetchStudentData(regNumber, "first_sem_2024");

            if (studentResult.found) {
                displayResult(studentResult.data, "first_sem_2024");
            } else {
                displayMessage(`عفواً، لم يتم العثور على نتيجة للطالب برقم ${regNumber}.`, 'error');
            }
        } catch (error) {
            displayMessage("حدث خطأ أثناء جلب البيانات. الرجاء المحاولة لاحقاً.", 'error');
            console.error("Fetch error:", error);
        }
    });

    // =======================================================
    // قاعدة البيانات الوهمية (Mock Database)
    // =======================================================

    const mockDb = {
        "20240101": {
            id: "20240101",
            name: "أحمد علي",
            semester_results: {
                "first_sem_2024": {
                    grades: [
                        { subject: "رياضة 2", works: 35, final: 55 },
                        { subject: "فيزياء 2", works: 38, final: 58 },
                        { subject: "انجليزي 2", works: 15, final: 30 },
                        { subject: "كيمياء 2", works: 30, final: 50 },
                        { subject: "حاسوب 2", works: 25, final: 45 },
                        { subject: "علم مواد", works: 32, final: 50 },
                        { subject: "أساسيات علم بيئة", works: 40, final: 60 }
                    ]
                }
            }
        },
        "20240102": {
            id: "20240102",
            name: "فاطمة محمد",
            semester_results: {
                "first_sem_2024": {
                    grades: [
                        { subject: "رياضة 2", works: 30, final: 50 },
                        { subject: "فيزياء 2", works: 20, final: 35 },
                        { subject: "انجليزي 2", works: 18, final: 25 },
                        { subject: "كيمياء 2", works: 10, final: 20 },
                        { subject: "حاسوب 2", works: 25, final: 45 },
                        { subject: "علم مواد", works: 32, final: 50 },
                        { subject: "أساسيات علم بيئة", works: 40, final: 60 }
                    ]
                }
            }
        },
        "128241024": {
            id: "128241024",
            name: "طلال محمد الشبيب",
            semester_results: {
                "first_sem_2024": {
                    grades: [
                        { subject: "أساسيات علم بيئة", works: 27, final: 41 },
                        { subject: "رياضة 2", works: 36, final: 48 },
                        { subject: "فيزياء 2", works: 17, final: 29 },
                        { subject: "لغة انجليزية 2", works: 30, final: 40 },
                        { subject: "حاسوب 2", works: 38, final: 40 },
                        { subject: "علم مواد", works: 30, final: 50 },
                        { subject: "كيمياء 2", works: 20, final: 31 }
                    ]
                }
            }
        }
    };

    /**
     * محاكاة جلب البيانات من API
     */
    function fetchStudentData(regNumber, semester) {
        return new Promise(resolve => {
            setTimeout(() => {
                const studentData = mockDb[regNumber];
                if (studentData && studentData.semester_results[semester]) {
                    resolve({ found: true, data: studentData });
                } else {
                    resolve({ found: false });
                }
            }, 1000);
        });
    }

    /**
     * عرض رسالة خطأ أو تحميل
     */
    function displayMessage(message, type) {
        const className = type === 'error' ? 'error-message' : 'placeholder-text';
        resultDisplay.innerHTML = `<p class="${className}">${message}</p>`;
    }

    /**
     * عرض بطاقة النتيجة بالتفصيل
     */
    function displayResult(result, semester) {
        const semesterData = result.semester_results[semester];
        let totalFailed = 0;
        let totalScore = 0;
        let totalSubjects = semesterData.grades.length;

        const gradesHTML = semesterData.grades.map(g => {
            const finalScore = g.works + g.final;
            const isPassed = finalScore >= 50 && g.final >= 30;
            if (!isPassed) {
                totalFailed++;
            }
            totalScore += finalScore;

            const rowClass = !isPassed ? 'class="carry-over-row"' : '';
            const statusClass = isPassed ? 'status-passed' : 'status-failed';
            const statusText = isPassed ? 'ناجح' : 'راسب';

            return `<tr ${rowClass}>
                        <td>${g.subject}</td>
                        <td>${g.works}</td>
                        <td>${g.final}</td>
                        <td>${finalScore}</td>
                        <td class="${statusClass}">${statusText}</td>
                    </tr>`;
        }).join('');

        const finalStatus = totalFailed <= 2 ? "مرحل" : "راسب";
        const finalStatusColor = finalStatus === 'مرحل' ? 'var(--orange-color)' : 'var(--red-color)';
        
        const averageFrom100 = (totalScore / totalSubjects).toFixed(2);
        
        const html = `
            <div class="result-card">
                <h3>بيانات الطالب</h3>
                <div class="result-detail">
                    <p><strong>الاسم:</strong> ${result.name}</p>
                    <p><strong>رقم القيد:</strong> ${result.id}</p>
                    <p><strong>الفصل الدراسي:</strong> ${semester}</p>
                    <p><strong>الحالة النهائية:</strong> <strong style="color: ${finalStatusColor}">${finalStatus}</strong></p>
                    <p><strong>المعدل الفصلي:</strong> ${averageFrom100}%</p>
                    <p><strong>المعدل التراكمي:</strong> ${averageFrom100}%</p>
                </div>
                
                <hr style="margin: 20px 0;">

                <h4>درجات الفصل:</h4>
                <table class="grades-table">
                    <thead>
                        <tr>
                            <th>المادة</th>
                            <th>أعمال (40)</th>
                            <th>نهائي (60)</th>
                            <th>الدرجة النهائية (100)</th>
                            <th>الحالة</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${gradesHTML}
                    </tbody>
                </table>
                <button class="download-btn">تحميل النتيجة بصيغة PDF</button>
            </div>
        `;
        resultDisplay.innerHTML = html;
        document.querySelector('.download-btn').addEventListener('click', () => {
            alert("وظيفة تحميل PDF غير متاحة في هذا النموذج التجريبي.");
        });
    }
});