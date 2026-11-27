const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const all = (s) => document.querySelectorAll(s);

// 1. sections and cards appear while scrolling
if (!calm && 'IntersectionObserver' in window) {
    document.documentElement.classList.add('js');
    const watcher = new IntersectionObserver((entries) => {
        entries.forEach((e) => {
            if (e.isIntersecting) { e.target.classList.add('show'); watcher.unobserve(e.target); }
        });
    }, { threshold: 0.15 });
    all('.dash, .stats > div, .label, .big, .feature, #skills, .card, #contact').forEach((el) => {
        el.classList.add('reveal');
        watcher.observe(el);
    });
}

// 2. typing effect
const typed = document.getElementById('typed');
const words = ['Data Analyst Path', 'Power BI Learner', 'SQL Learner'];
let word = 0, letters = words[0].length, deleting = true;
function type() {
    letters += deleting ? -1 : 1;
    typed.textContent = words[word].slice(0, letters);
    let wait = deleting ? 45 : 90;
    if (!deleting && letters === words[word].length) { deleting = true; wait = 1800; }
    else if (deleting && letters === 0) { deleting = false; word = (word + 1) % words.length; wait = 300; }
    setTimeout(type, wait);
}
if (!calm) setTimeout(type, 2000);

// 3. interactive workflow
const steps = all('.dash li');
const bars = all('.spark i');
const detail = document.querySelector('.detail');
const shapes = [[40, 70, 35, 90, 55], [55, 60, 65, 70, 75], [30, 85, 50, 65, 100], [30, 50, 42, 72, 100]];
steps.forEach((step, i) => {
    const pick = () => {
        steps.forEach((s) => s.classList.remove('on'));
        step.classList.add('on');
        detail.textContent = step.dataset.info;
        bars.forEach((bar, n) => { bar.style.height = shapes[i][n] + '%'; });
    };
    step.addEventListener('click', pick);
    step.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(); }
    });
});

// 4. skills filter
const lists = all('.skills');
const also = document.querySelector('.also');
all('.filters button').forEach((button) => {
    button.addEventListener('click', () => {
        all('.filters button').forEach((b) => b.classList.remove('on'));
        button.classList.add('on');
        const show = button.dataset.show;
        lists[0].hidden = show === 'other';
        lists[1].hidden = show === 'data';
        also.hidden = show !== 'all';
    });
});

// 5. progress bar, active link, back to top
const progress = document.querySelector('.progress');
const topButton = document.querySelector('.top');
function onScroll() {
    const max = document.documentElement.scrollHeight - innerHeight;
    progress.style.transform = `scaleX(${max > 0 ? scrollY / max : 0})`;
    topButton.classList.toggle('show', scrollY > 500);
    let current = '';
    all('section[id]').forEach((s) => {
        if (s.getBoundingClientRect().top < innerHeight / 2) current = s.id;
    });
    if (max - scrollY < 5) current = 'contact';
    all('.links a').forEach((a) => a.classList.toggle('active', a.getAttribute('href') === '#' + current));
}
addEventListener('scroll', onScroll, { passive: true });
onScroll();

// 6. cards tilt with the mouse
if (!calm && matchMedia('(hover: hover)').matches) {
    all('.feature, .card').forEach((card) => {
        card.addEventListener('mousemove', (e) => {
            const r = card.getBoundingClientRect();
            const x = (e.clientX - r.left) / r.width - 0.5;
            const y = (e.clientY - r.top) / r.height - 0.5;
            card.style.transform = `perspective(700px) rotateX(${-y * 6}deg) rotateY(${x * 6}deg) translateY(-4px)`;
        });
        card.addEventListener('mouseleave', () => { card.style.transform = ''; });
    });
}

// 7. moving data points in the background
const canvas = document.getElementById('points');
const ctx = canvas.getContext('2d');
let dots = [];
const mouse = { x: -999, y: -999 };
function resize() {
    canvas.width = innerWidth;
    canvas.height = innerHeight;
    const count = Math.min(70, Math.floor(innerWidth / 16));
    dots = Array.from({ length: count }, () => ({
        x: Math.random() * innerWidth, y: Math.random() * innerHeight,
        vx: (Math.random() - 0.5) * 0.4, vy: (Math.random() - 0.5) * 0.4
    }));
}
function line(a, b, limit) {
    const d = Math.hypot(a.x - b.x, a.y - b.y);
    if (d < limit) {
        ctx.strokeStyle = `rgba(255, 105, 180, ${(1 - d / limit) * 0.35})`;
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
    }
}
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    dots.forEach((d, i) => {
        d.x += d.vx; d.y += d.vy;
        if (d.x < 0 || d.x > canvas.width) d.vx *= -1;
        if (d.y < 0 || d.y > canvas.height) d.vy *= -1;
        ctx.fillStyle = 'rgba(255, 140, 195, 0.6)';
        ctx.beginPath(); ctx.arc(d.x, d.y, 2, 0, Math.PI * 2); ctx.fill();
        for (let j = i + 1; j < dots.length; j++) line(d, dots[j], 110);
        line(d, mouse, 160);
    });
    if (!calm) requestAnimationFrame(draw);
}
addEventListener('resize', resize);
addEventListener('mousemove', (e) => { mouse.x = e.clientX; mouse.y = e.clientY; });
resize();
draw();
