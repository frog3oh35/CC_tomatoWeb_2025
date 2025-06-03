
//1. refactoring
const pageNames = ["home", "effect", "canvas", "recipe", "mbti"];
const pagePathPrefix = "sections/sec_";
const pages = pageNames.map(name => `${pagePathPrefix}${name}.html`);
//

const circleList = document.querySelectorAll(".circle");

window.addEventListener("DOMContentLoaded", () => {
    //현재 파일명 추출
    let current = location.pathname.split("/").pop();

    if (!current || current === "") current = "sec_home.html";

    //2. refactoring, 현재 페이지 키워드만 추출
    const pageKey = current.replace("sec_", "").replace(".html", "");

    // 자동 인덱스 계산, 못 찾으면 기본값 0
    const index = pageNames.indexOf(pageKey) !== -1 ? pageNames.indexOf(pageKey) : 0;


    // 동그라미 활성화 함수 실행
    circleList.forEach(c => c.classList.remove("active"));
    if (circleList[index]) {
        circleList[index].classList.add("active");
    }
    //로드
    loadSection(pages[index]);

});

/* 1. 하드코딩 빠이.
const pages = [
    "sections/sec_home.html",
    "sections/sec_effect.html",
    "sections/sec_canvas.html",
    "sections/sec_recipe.html",
    "sections/sec_mbti.html"
];
*/

/* 2. switch-case라서 확장성 떨어짐. 여기도 리팩터
let index = 0;
switch (current) {
    case "sec_home.html": index = 0; break;
    case "sec_effect.html": index = 1; break;
    case "sec_canvas.html": index = 2; break;
    case "sec_recipe.html": index = 3; break;
    case "sec_mbti.html": index = 4; break;
    default: index = 0; break;
}

if (circleList[index]) {
    circleList.forEach(c => c.classList.remove("active"));
    circleList[index].classList.add("active");
}
*/



//동그라미 클릭 시 해당 페이지 이동
circleList.forEach((circle, idx) => {
    circle.addEventListener("click", () => {
        loadSection(pages[idx]);
        circleList.forEach(c => c.classList.remove("active"));
        circle.classList.add("active");
    });
});

//페이지 불러오기
function loadSection(file) {
    console.log(" fetch 요청됨:", file);

    fetch(file)
        .then(res => {
            console.log("응답 상태코드:", res.status);
            if (!res.ok) throw new Error("응답 실패");
            return res.text();
        })
        .then(html => {
            const postBox = document.querySelector(".post_box"); // ✅ 클래스 선택자니까 이렇게
            console.log("찾았냐?", postBox);

            if (postBox) {
                postBox.innerHTML = html;
            } else {
                console.error("❌ post_box 없음ㅋ (지금 DOM에 존재 안 함)");
            }

            if (file.includes("sec_canvas")) {
                initCanvas();
            }

            if (file.includes("sec_recipe")) {
                toggleLike();
            }

            if (file.includes("sec_mbti")) {
                initMbti();
            }


        })
        .catch(err => {
            console.error("fetch 실패:", err);

            const postBox = document.querySelector(".post_box");
            if (postBox) {
                postBox.innerHTML = `
                    <div class="error-box">
                        <h2>페이지를 불러올 수 없습니다 🥲</h2>
                    </div>
                `;
            }
        });
}

/*sec_canvas 3페이지*/
function initCanvas() {
    const canvas = document.getElementById('tomatoCanvas');
    if (!canvas) {
        console.warn("canvas 요소가 아직 DOM에 존재하지 않음");
        return;
    }
    const ctx = canvas.getContext('2d');
    let drawing = false;

    canvas.addEventListener('mousedown', () => drawing = true);
    canvas.addEventListener('mouseup', () => {
        drawing = false;
        ctx.beginPath();
    });
    canvas.addEventListener('mouseleave', () => {
        drawing = false;
        ctx.beginPath();
    });
    canvas.addEventListener('mousemove', draw);

    //색상 변수
    const colorPicker = document.getElementById('colorPicker');
    let currentColor = colorPicker ? colorPicker.value : '#d34b32';

    if (colorPicker) {
        colorPicker.addEventListener('change', () => {
            currentColor = colorPicker.value;
        });
    }

    //드로잉 함수
    function draw(e) {
        if (!drawing) return;
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.strokeStyle = currentColor;

        ctx.lineTo(e.offsetX, e.offsetY);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(e.offsetX, e.offsetY);
    }

    const clearBtn = document.getElementById('clearBtn');
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.beginPath();
        });
    }

    const downloadBtn = document.getElementById('downloadBtn');
    if (downloadBtn) {
        downloadBtn.addEventListener('click', () => {
            // 1️⃣ 기존 그림을 이미지로 저장
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = canvas.width;
            tempCanvas.height = canvas.height;

            const tempCtx = tempCanvas.getContext('2d');
            tempCtx.fillStyle = '#ffffff'; // 흰 배경
            tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
            tempCtx.drawImage(canvas, 0, 0);

            // 4️⃣ 저장
            const image = tempCanvas.toDataURL('image/png');
            const link = document.createElement('a');
            link.href = image;
            link.download = 'my_tomato.png';
            link.click();
        });
    }

}

/*like toggle*/
function toggleLike() {
    const likes = document.querySelectorAll('.like');
    likes.forEach((like) => {
        like.addEventListener('click', () => {
            like.classList.toggle('active');
            like.textContent = like.classList.contains('active') ? '❤️' : '🤍';
        });
    });
}

/*mbti*/
function initMbti() {
    let answer1 = '';
    let answer2 = '';

    document.querySelectorAll('.q1 .answer').forEach(btn => {
        btn.addEventListener('click', () => {
            answer1 = btn.dataset.type;
            document.querySelector('.q1').style.display = 'none';
            document.querySelector('.q2').style.display = 'block';
        });
    });

    document.querySelectorAll('.q2 .answer').forEach(btn => {
        btn.addEventListener('click', () => {
            answer2 = btn.dataset.type;
            document.querySelector('.q2').style.display = 'none';
            const resultId = `${answer1}-${answer2}`;
            document.getElementById(resultId).classList.add('active');
        });
    });

}