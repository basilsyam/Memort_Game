/* --- 1. الإعدادات والمتغيرات الأساسية --- */
let duration = 1000; 
let blocksContainer = document.querySelector(".memory-game-blocks");
let blocks = []; 
let timerInterval;
let canHint = true;
let currentLevelKey = '4x4';

// إعدادات المستويات
const levels = {
    '4x4': { cols: 4, size: 16, time: 120, iconsCount: 8 },
    '6x6': { cols: 6, size: 36, time: 240, iconsCount: 18 },
    '8x8': { cols: 8, size: 64, time: 480, iconsCount: 32 }
};

// الأيقونات
const allIcons = [
    'fa-anchor','fa-bug','fa-car','fa-cloud','fa-code','fa-coffee',
    'fa-gear','fa-heart','fa-leaf','fa-music','fa-rocket','fa-star',
    'fa-umbrella','fa-bolt','fa-apple-whole','fa-bomb','fa-camera','fa-crown',
    'fa-ghost','fa-dragon','fa-hippo','fa-pizza-slice','fa-brain','fa-gamepad',
    'fa-lightbulb','fa-gift','fa-key','fa-lock','fa-eye','fa-plane',
    'fa-bicycle','fa-bus','fa-cookie','fa-ice-cream','fa-robot','fa-shuttle-space',
    'fa-hammer','fa-microscope','fa-flask','fa-palette','fa-chess-knight'
];

const successSound = document.getElementById('success');
const clickSound = document.getElementById('click');
const gameOverSound = document.getElementById('game-over-sound');

/* --- 2. شاشة البداية --- */
document.querySelector(".control-buttons span").onclick = async function() {
    const isDark = document.body.classList.contains('dark-mode');
    
    const { value: formValues } = await Swal.fire({
        title: 'Memory Game Pro',
        html: `
            <input id="swal-name" class="swal2-input" placeholder="اسم اللاعب">
            <select id="swal-level" class="swal2-input">
                <option value="4x4">مستوى 4x4 (سهل)</option>
                <option value="6x6">مستوى 6x6 (متوسط)</option>
                <option value="8x8">مستوى 8x8 (صعب)</option>
            </select>
        `,
        confirmButtonColor: '#4dabf7',
        background: isDark ? '#1a1b26' : '#fff',
        color: isDark ? '#fff' : '#000',
        preConfirm: () => [
            document.getElementById('swal-name').value,
            document.getElementById('swal-level').value
        ]
    });

    if (formValues) {
        let [name, levelKey] = formValues;
        currentLevelKey = levelKey;
        document.querySelector(".name span").innerHTML = name.trim() === "" ? "لاعب مجهول" : name;
        document.querySelector(".control-buttons").style.display = 'none';
        
        if(clickSound) clickSound.play();
        setupGame(levelKey);
    }
};

/* --- 3. بناء اللعبة --- */
function setupGame(levelKey) {
    const config = levels[levelKey];
    blocksContainer.innerHTML = ''; 
    blocksContainer.style.gridTemplateColumns = `repeat(${config.cols}, 1fr)`;

    let selectedIcons = allIcons.slice(0, config.iconsCount);
    let gameIcons = [...selectedIcons, ...selectedIcons];
    shuffle(gameIcons);

    for (let i = 0; i < config.size; i++) {
        const icon = gameIcons.pop();
        const block = document.createElement('div');
        block.classList.add('game-block');
        block.dataset.icon = icon;
        block.innerHTML = `
            <div class="face front"></div>
            <div class="face back"><i class="fa-solid ${icon}"></i></div>
        `;
        block.onclick = () => flipBlock(block);
        blocksContainer.appendChild(block);
    }

    blocks = Array.from(blocksContainer.children);
    startWavePeek(() => startTimer(config.time));
}

/* --- 4. تأثير الموجة عند البداية --- */
function startWavePeek(callback) {
    blocksContainer.classList.add('no-clicking');
    canHint = false;

    blocks.forEach((block, index) => {
        setTimeout(() => block.classList.add('is-flipped'), index * 30);
    });

    setTimeout(() => {
        blocks.forEach((block, index) => {
            setTimeout(() => block.classList.remove('is-flipped'), index * 20);
        });

        setTimeout(() => {
            blocksContainer.classList.remove('no-clicking');
            canHint = true;
            if(callback) callback();
        }, blocks.length * 20 + 300);

    }, 1500);
}

/* --- 5. منطق النقل والتحقق --- */
function flipBlock(selectedBlock) {
    if (selectedBlock.classList.contains('is-flipped') || 
        selectedBlock.classList.contains('has-match') || 
        blocksContainer.classList.contains('no-clicking')) return;

    selectedBlock.classList.add("is-flipped");
    if(clickSound) { clickSound.currentTime = 0; clickSound.play(); }

    let flippedBlocks = blocks.filter(b => b.classList.contains('is-flipped') && !b.classList.contains('has-match'));

    if (flippedBlocks.length === 2) {
        blocksContainer.classList.add('no-clicking'); 
        checkMatch(flippedBlocks[0], flippedBlocks[1]);
    }
}

function checkMatch(f, s) {
    let triesDisplay = document.querySelector('.tries span');
    
    if (f.dataset.icon === s.dataset.icon) {
        setTimeout(() => {
            f.classList.replace("is-flipped", "has-match");
            s.classList.replace("is-flipped", "has-match");
            if(successSound) successSound.play();
            blocksContainer.classList.remove('no-clicking');
            checkWin();
        }, 300);
    } else {
        setTimeout(() => {
            f.classList.add('shake');
            s.classList.add('shake');
            
            let currentTries = parseInt(triesDisplay.innerHTML) + 1;
            triesDisplay.innerHTML = currentTries;
            updateStars(currentTries);

            setTimeout(() => {
                f.classList.remove("is-flipped", "shake");
                s.classList.remove("is-flipped", "shake");
                blocksContainer.classList.remove('no-clicking');
            }, 600);
        }, 400);
    }
}

/* --- 6. نظام التلميح (Hint) --- */
document.getElementById('hint-btn').onclick = function() {
    if (!canHint || blocksContainer.classList.contains('no-clicking')) return;
    
    canHint = false;
    this.style.opacity = "0.3";
    
    let triesDisplay = document.querySelector('.tries span');
    triesDisplay.innerHTML = parseInt(triesDisplay.innerHTML) + 3; 

    let unMatched = blocks.filter(b => !b.classList.contains('has-match'));
    unMatched.forEach(b => b.classList.add('is-flipped'));

    setTimeout(() => {
        unMatched.forEach(b => b.classList.remove('is-flipped'));
        canHint = true;
        this.style.opacity = "1";
    }, 1000);
};

/* --- 7. المؤقت والنجوم وفحص الفوز --- */
function startTimer(seconds) {
    let timeLeft = seconds;
    let timerDisplay = document.querySelector(".timer span");
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        let m = Math.floor(timeLeft / 60);
        let s = timeLeft % 60;
        timerDisplay.innerHTML = `${m}:${s < 10 ? '0' : ''}${s}`;
        if (timeLeft <= 0) { clearInterval(timerInterval); handleGameOver(); }
        timeLeft--;
    }, 1000);
}

function checkWin() {
    if (blocks.every(b => b.classList.contains('has-match'))) {
        clearInterval(timerInterval);
        Swal.fire({
            icon: 'success',
            title: 'أسطورة الذاكرة!',
            text: `تم المستوى بنجاح!`,
            confirmButtonText: 'إعادة اللعب'
        }).then(() => location.reload());
    }
}

function handleGameOver() {
    if(gameOverSound) gameOverSound.play();
    Swal.fire({ icon: 'error', title: 'انتهى الوقت!', confirmButtonText: 'حاول مجدداً' }).then(() => location.reload());
}

function updateStars(err) {
    let starsContainer = document.querySelector('.stars-live');
    let stars = "⭐⭐⭐⭐⭐";
    if (err > 25) stars = "⭐";
    else if (err > 18) stars = "⭐⭐";
    else if (err > 12) stars = "⭐⭐⭐";
    else if (err > 6) stars = "⭐⭐⭐⭐";
    starsContainer.innerHTML = stars;
}

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

/* --- 8. الوضع الليلي --- */
const darkModeBtn = document.getElementById('darkModeBtn');
if (localStorage.getItem('theme') === 'dark') document.body.classList.add('dark-mode');
darkModeBtn.onclick = () => {
    document.body.classList.toggle('dark-mode');
    localStorage.setItem('theme', document.body.classList.contains('dark-mode') ? 'dark' : 'light');
};

/* --- 9. منطق PWA وزر التثبيت العلوي --- */
let deferredPrompt;
const installDiv = document.getElementById('installApp');
const installBtn = document.getElementById('installBtn');

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    // إظهار الزر في الأعلى
    if (installDiv) installDiv.style.display = 'block';
});

if (installBtn) {
    installBtn.addEventListener('click', async () => {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            console.log(`User choice: ${outcome}`);
            deferredPrompt = null;
            installDiv.style.display = 'none';
        }
    });
}

window.addEventListener('appinstalled', () => {
    if (installDiv) installDiv.style.display = 'none';
    console.log('Memory Game Pro was installed!');
});