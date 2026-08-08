// ==========================================
// js/ui.js - UI Management & Navigation Router
// ==========================================

// 🚀 ระบบสลับหน้า View และจัดการ Navigation
function handleRouting() {
    const currentHash = window.location.hash || '#home';
    const cleanHash = currentHash.replace('#', '');
    const targetViewId = cleanHash + '-view';

    // 1. ซ่อน View Section ทั้งหมด
    document.querySelectorAll('.view-section').forEach(el => {
        el.classList.add('d-none');
    });

    // 2. ล้างค่า Active แถบเมนู Sidebar
    document.querySelectorAll('#sidebarMenuLinks .nav-link').forEach(link => {
        link.classList.remove('active', 'bg-light', 'text-primary', 'border-start', 'border-primary', 'border-4');
        link.classList.add('text-dark');
    });

    // 3. แสดงผล View Section เป้าหมาย
    const targetView = document.getElementById(targetViewId);
    if (targetView) {
        targetView.classList.remove('d-none');
    } else {
        const homeView = document.getElementById('home-view');
        if (homeView) homeView.classList.remove('d-none');
    }

    // 4. ไฮไลต์ Sidebar เมนูประจำหน้านั้นๆ
    const activeLink = document.querySelector(`#sidebarMenuLinks a[href="${currentHash}"]`);
    if (activeLink) {
        activeLink.classList.remove('text-dark');
        activeLink.classList.add('active', 'bg-light', 'text-primary', 'border-start', 'border-primary', 'border-4');
    }

    // 5. โหลดข้อมูลประจำหน้าทันทีเมื่อสลับหน้า
    if (cleanHash === 'report' || cleanHash === 'report-view') {
        if (typeof renderReportTable === 'function') renderReportTable();
    } else if (cleanHash === 'ot' || cleanHash === 'ot-view') {
        const monthSelector = document.getElementById('monthSelector');
        const selectedMonth = monthSelector ? monthSelector.value : (typeof getCurrentOTMonth === 'function' ? getCurrentOTMonth() : 1);
        if (typeof renderOTTable === 'function') renderOTTable(selectedMonth);
    }
}

// 📱 ปิด Sidebar บนมือถืออย่างปลอดภัยเมื่อย้ายหน้า
function safeCloseMobileSidebar() {
    const sidebarEl = document.getElementById('sidebarMenu');
    if (sidebarEl && sidebarEl.classList.contains('show')) {
        if (typeof bootstrap !== 'undefined' && bootstrap.Offcanvas) {
            const bsOffcanvas = bootstrap.Offcanvas.getInstance(sidebarEl) || bootstrap.Offcanvas.getOrCreateInstance(sidebarEl);
            if (bsOffcanvas) bsOffcanvas.hide();
        }
    }
}

// 🟢 ผูก Event การสลับหน้า
document.addEventListener('DOMContentLoaded', handleRouting);
window.addEventListener('hashchange', () => {
    handleRouting();
    safeCloseMobileSidebar();
});

// ==========================================
// js/ui.js - UI Management & Navigation Router
// ==========================================

// 🚀 ระบบสลับหน้า View และจัดการ Navigation
async function handleRouting() {
    const currentHash = window.location.hash || '#home';
    const cleanHash = currentHash.replace('#', '');
    const targetViewId = cleanHash + '-view';

    // 1. ซ่อน View Section ทั้งหมด
    document.querySelectorAll('.view-section').forEach(el => {
        el.classList.add('d-none');
    });

    // 2. ล้างค่า Active แถบเมนู Sidebar
    document.querySelectorAll('#sidebarMenuLinks .nav-link').forEach(link => {
        link.classList.remove('active', 'bg-light', 'text-primary', 'border-start', 'border-primary', 'border-4');
        link.classList.add('text-dark');
    });

    // 3. แสดงผล View Section เป้าหมาย
    const targetView = document.getElementById(targetViewId);
    if (targetView) {
        targetView.classList.remove('d-none');
    } else {
        const homeView = document.getElementById('home-view');
        if (homeView) homeView.classList.remove('d-none');
    }

    // 4. ไฮไลต์ Sidebar เมนูประจำหน้านั้นๆ
    const activeLink = document.querySelector(`#sidebarMenuLinks a[href="${currentHash}"]`);
    if (activeLink) {
        activeLink.classList.remove('text-dark');
        activeLink.classList.add('active', 'bg-light', 'text-primary', 'border-start', 'border-primary', 'border-4');
    }

    // 5. โหลดข้อมูลประจำหน้าทันทีเมื่อสลับหน้า (รอให้โหลดเสร็จก่อน)
    if (cleanHash === 'report' || cleanHash === 'report-view') {
        if (typeof renderReportTable === 'function') await renderReportTable();
    } else if (cleanHash === 'ot' || cleanHash === 'ot-view') {
        const monthSelector = document.getElementById('monthSelector');
        const selectedMonth = monthSelector ? monthSelector.value : (typeof getCurrentOTMonth === 'function' ? getCurrentOTMonth() : 1);
        if (typeof renderOTTable === 'function') await renderOTTable(selectedMonth);
    }

    // 6. 🟢 ซ่อน Preloader เมื่อโหลดข้อมูลหน้าแรกเสร็จสิ้น
    hidePreloader();
}

// 📱 ปิด Preloader นุ่มๆ
function hidePreloader() {
    const preloader = document.getElementById('pagePreloader');
    if (preloader && !preloader.classList.contains('d-none')) {
        preloader.style.opacity = '0';
        setTimeout(() => {
            preloader.classList.add('d-none');
        }, 300);
    }
}

// 📱 ปิด Sidebar บนมือถืออย่างปลอดภัยเมื่อย้ายหน้า
function safeCloseMobileSidebar() {
    const sidebarEl = document.getElementById('sidebarMenu');
    if (sidebarEl && sidebarEl.classList.contains('show')) {
        if (typeof bootstrap !== 'undefined' && bootstrap.Offcanvas) {
            const bsOffcanvas = bootstrap.Offcanvas.getInstance(sidebarEl) || bootstrap.Offcanvas.getOrCreateInstance(sidebarEl);
            if (bsOffcanvas) bsOffcanvas.hide();
        }
    }
}

// 🟢 ผูก Event การสลับหน้า
document.addEventListener('DOMContentLoaded', handleRouting);
window.addEventListener('hashchange', () => {
    handleRouting();
    safeCloseMobileSidebar();
});