// Her Rise — Site Interactions

document.addEventListener('DOMContentLoaded', () => {
    const leaderboardUrl = 'data/donations.json';

    const money = (value) => `¥${Number(value || 0).toLocaleString('zh-CN')}`;
    const date = (value) => value ? new Intl.DateTimeFormat('zh-CN', { month: 'numeric', day: 'numeric' }).format(new Date(value)) : '';

    const loadLeaderboard = async () => {
        const list = document.querySelector('#leaderboard-list');
        if (!list) return;
        try {
            const response = await fetch(leaderboardUrl, { cache: 'no-cache' });
            if (!response.ok) throw new Error('leaderboard unavailable');
            const donations = await response.json();
            const total = document.querySelector('#leaderboard-total');
            const supporters = document.querySelector('#leaderboard-supporters');
            const paid = donations.filter((item) => item.status === 'paid');
            const totalAmount = paid.reduce((sum, item) => sum + Number(item.amount || 0), 0);
            if (total) total.textContent = money(totalAmount);
            if (supporters) supporters.textContent = paid.length;
            if (!paid.length) {
                list.innerHTML = '<div class="leaderboard-empty">还没有已完成的捐款记录，第一份支持正在等待你。</div>';
                return;
            }
            const sorted = paid.slice().sort((a, b) => (Number(b.amount) - Number(a.amount)) || String(a.createdAt).localeCompare(String(b.createdAt)));
            list.innerHTML = sorted.map((entry, index) => `
                <div class="leaderboard-row">
                    <span class="leaderboard-rank">${String(index + 1).padStart(2, '0')}</span>
                    <div><strong class="leaderboard-donor">${`第 ${String(index + 1).padStart(2, '0')} 笔支持`}</strong><span class="leaderboard-count">记录日期 · ${date(entry.createdAt)}</span></div>
                    <strong class="leaderboard-amount">${money(entry.amount)}</strong>
                </div>
            `).join('');
        } catch {
            list.innerHTML = '<div class="leaderboard-empty">筹款榜暂时无法加载，请稍后再试。</div>';
        }
    };

    loadLeaderboard();

    const hero = document.querySelector('.hero');
    const heroBg = document.querySelector('.hero-bg');

    // Let the hero light gently follow the visitor's pointer.
    hero?.addEventListener('pointermove', (event) => {
        if (!heroBg || event.pointerType === 'touch') return;
        const bounds = hero.getBoundingClientRect();
        const x = ((event.clientX - bounds.left) / bounds.width) * 100;
        const y = ((event.clientY - bounds.top) / bounds.height) * 100;
        heroBg.style.setProperty('--light-x', `${x}%`);
        heroBg.style.setProperty('--light-y', `${y}%`);
    });

    const viewLinks = document.querySelectorAll('[data-view]');
    const homeView = document.querySelector('#home-view');
    const contentView = document.querySelector('#content-view');
    const navLinks = document.querySelector('.nav-links');

    const showView = (viewName, updateUrl = true) => {
        const isHome = viewName === 'home';
        homeView?.classList.toggle('is-active', isHome);
        contentView?.classList.toggle('is-active', !isHome);
        contentView?.setAttribute('aria-hidden', String(isHome));
        navLinks?.classList.remove('open');

        if (!isHome) {
            const target = document.querySelector(`#${viewName}`);
            document.querySelectorAll('.page-view').forEach((page) => {
                page.classList.toggle('is-active', page === target);
            });
            window.scrollTo({ top: 0, behavior: 'auto' });
        } else {
            document.querySelectorAll('.page-view').forEach((page) => {
                page.classList.remove('is-active');
            });
            window.scrollTo({ top: 0, behavior: 'auto' });
        }

        if (updateUrl) {
            history.pushState({ view: viewName }, '', isHome ? '#home' : `#${viewName}`);
        }
    };

    viewLinks.forEach((link) => {
        link.addEventListener('click', (event) => {
            event.preventDefault();
            showView(link.dataset.view || 'home');
        });
    });

    const initialView = window.location.hash.slice(1);
    if (initialView && initialView !== 'home' && document.querySelector(`#${initialView}`)) {
        showView(initialView, false);
    }

    window.addEventListener('popstate', () => {
        const viewName = window.location.hash.slice(1) || 'home';
        showView(viewName, false);
    });

    const toggle = document.querySelector('.nav-toggle');
    const links = document.querySelector('.nav-links');

    toggle?.addEventListener('click', () => {
        links?.classList.toggle('open');
    });

});
