// ==========================================
// js/app.js - ศูนย์กลางควบคุมระบบทั้งหมด (Intelligent OT Management)
// ==========================================


// ==========================================
// 🚀 Main Entry Point
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    
    initOTManagement();
    initAmountToggle();
    initDocumentCenter();
    initFeedbackSystem();
    
    renderHomeSummary();
    renderNextPay();

    updateLiveClock();
    setInterval(updateLiveClock, 1000);
});

// ------------------------------------------
// 🛠️ Utility Functions & Helpers
// ------------------------------------------
function smoothRender(element, updateCallback) {
    if (!element) return;
    element.classList.add('fade-out-anim');
    setTimeout(() => {
        element.classList.remove('fade-out-anim');
        element.classList.add('fade-in-anim');
        if (typeof updateCallback === 'function') updateCallback();
        setTimeout(() => {
            element.classList.remove('fade-in-anim');
        }, 300);
    }, 180);
}

function getCurrentOTMonth() {
    const today = new Date();
    const currentDay = today.getDate();
    const currentMonth = today.getMonth() + 1;
    return (currentDay <= 20) ? currentMonth : (currentMonth === 12 ? 1 : currentMonth + 1);
}

if (typeof getPaymentDateText !== 'function') {
    window.getPaymentDateText = function(year, month) {
        const thMonths = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'];
        let lastDateOfPayment = new Date(year, month, 0);
        let dayOfWeek = lastDateOfPayment.getDay();
        if (dayOfWeek === 0) lastDateOfPayment.setDate(lastDateOfPayment.getDate() - 2);
        else if (dayOfWeek === 6) lastDateOfPayment.setDate(lastDateOfPayment.getDate() - 1);
        return `${lastDateOfPayment.getDate()} ${thMonths[lastDateOfPayment.getMonth()]}`;
    };
}

// ------------------------------------------
// ⏰ Real-time Clock
// ------------------------------------------
function updateLiveClock() {
    const clockEl = document.getElementById('liveClock');
    if (!clockEl) return;

    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const thaiMonths = [
        'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
        'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
    ];
    const month = thaiMonths[now.getMonth()];
    const year = now.getFullYear() + 543;

    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');

    clockEl.textContent = `${day} ${month} ${year} | ${hours}:${minutes}:${seconds} น.`;
}

// ------------------------------------------
// ☕ OT Management & Calculations
// ------------------------------------------
function calculateOTDetails() {
    const otTimeIn = document.getElementById('otTimeIn');
    const otTimeOut = document.getElementById('otTimeOut');
    const otIsHoliday = document.getElementById('otIsHoliday');
    const isOtBreakEl = document.getElementById('is_ot_break');
    const otDateEl = document.getElementById('otDate');

    const ot15Hours = document.getElementById('ot15Hours');
    const ot30Hours = document.getElementById('ot30Hours');
    const ot15Amount = document.getElementById('ot15Amount');
    const ot30Amount = document.getElementById('ot30Amount');
    const otMeal = document.getElementById('otMeal');

    if (!otTimeIn || !otTimeOut || !otTimeIn.value || !otTimeOut.value) return;

    let rawIn = otTimeIn.value.trim().replace('.', ':');
    let rawOut = otTimeOut.value.trim().replace('.', ':');

    if (otTimeIn.value !== rawIn) otTimeIn.value = rawIn;
    if (otTimeOut.value !== rawOut) otTimeOut.value = rawOut;

    const [inH, inM] = rawIn.split(':').map(Number);
    const [outH, outM] = rawOut.split(':').map(Number);

    if (isNaN(inH) || isNaN(inM) || isNaN(outH) || isNaN(outM)) return;

    let startMinutes = inH * 60 + inM;
    let endMinutes = outH * 60 + outM;

    if (endMinutes < startMinutes) endMinutes += 24 * 60;

    const isHoliday = otIsHoliday ? otIsHoliday.checked : false;
    const hasBreak = isOtBreakEl ? isOtBreakEl.checked : false;

    let dayOfWeek = -1;
    if (otDateEl && otDateEl.value) {
        const dateObj = new Date(otDateEl.value);
        dayOfWeek = dateObj.getDay();
    }

    let ot15 = 0, ot30 = 0;
    const normalWorkEnd = 17 * 60 + 30;
    const midnight = 24 * 60;

    if (!isHoliday) {
        if (endMinutes > normalWorkEnd) {
            if (dayOfWeek === 6 && endMinutes > midnight) {
                ot15 = (midnight - normalWorkEnd) / 60; 
                ot30 = (endMinutes - midnight) / 60;
            } else {
                ot15 = (endMinutes - normalWorkEnd) / 60;
            }
            if (hasBreak) ot15 -= 0.5;
        }
    } else {
        let totalHours = (endMinutes - startMinutes) / 60;
        if (hasBreak) totalHours -= 0.5;

        if (totalHours > 3.5) {
            ot15 = 3.5;
            ot30 = totalHours - 3.5;
        } else {
            ot15 = totalHours;
        }
    }

    ot15 = Math.max(0, ot15);
    ot30 = Math.max(0, ot30);

    const hourlyRate = (12000 / 30 / 8);
    const Amount15 = ot15 * (hourlyRate * 1.5);
    const Amount30 = ot30 * (hourlyRate * 3.0);

    let totalOTHours = ot15 + ot30;
    let mealCount = 0;
    if (totalOTHours >= 4) mealCount = 2;
    else if (totalOTHours >= 1.5) mealCount = 1;

    const mealAmount = mealCount * 50;

    if (ot15Hours) ot15Hours.value = ot15.toFixed(1);
    if (ot30Hours) ot30Hours.value = ot30.toFixed(1);
    if (ot15Amount) ot15Amount.value = Amount15.toFixed(1);
    if (ot30Amount) ot30Amount.value = Amount30.toFixed(1);
    if (otMeal) otMeal.value = mealAmount;
}

async function openEditOTModal(dateStr, docId = null) {
    let item = null;

    // 🟢 ตรวจสอบและดึงข้อมูลจาก Firestore
    if (docId && docId !== 'null' && docId !== 'undefined' && typeof otService !== 'undefined' && typeof otService.getRecordById === 'function') {
        const res = await otService.getRecordById(docId);
        if (res && res.success) item = res.data;
    }
    
    const otIdInput = document.getElementById('ot_id');
    const otDateInput = document.getElementById('otDate');
    const otTimeIn = document.getElementById('otTimeIn');
    const otTimeOut = document.getElementById('otTimeOut');
    const otIsHoliday = document.getElementById('otIsHoliday');
    const isOtBreakEl = document.getElementById('is_ot_break');
    const otWorkPlaceType = document.getElementById('otWorkPlaceType');
    const otWorkPlaceName = document.getElementById('otWorkPlaceName');
    const otRemark = document.getElementById('otRemark');
    const otModalTitle = document.getElementById('otModalTitle');
    const btnDeleteOT = document.getElementById('btnDeleteOT');

    if (otDateInput) otDateInput.value = dateStr;
    
    // 🎯 กำหนด ID ของ Document เข้าไปใน Input Hidden เสมอ
    const validDocId = (item && item.id) ? item.id : (docId && docId !== 'null' && docId !== 'undefined' ? docId : '');
    if (otIdInput) otIdInput.value = validDocId;

    if (item || validDocId) {
        if (otTimeIn) otTimeIn.value = item?.time_in || "08:30";
        if (otTimeOut) otTimeOut.value = item?.time_out || "17:30";
        if (otIsHoliday) otIsHoliday.checked = !!item?.is_holiday;
        if (isOtBreakEl) isOtBreakEl.checked = !!item?.is_ot_break;
        if (otWorkPlaceType) otWorkPlaceType.value = item?.work_place_type || "inside";
        if (otWorkPlaceName) otWorkPlaceName.value = item?.work_place_name || "ออฟฟิศแหลมฉบัง";
        if (otRemark) otRemark.value = item?.remark || "";
        if (otModalTitle) otModalTitle.textContent = `แก้ไขรายการ OT (${dateStr})`;
        if (btnDeleteOT) btnDeleteOT.classList.remove('d-none');
    } else {
        const otForm = document.getElementById('otForm');
        if (otForm) otForm.reset();
        
        if (otIdInput) otIdInput.value = '';
        if (otDateInput) otDateInput.value = dateStr;
        if (otTimeIn) otTimeIn.value = "08:30";
        if (otWorkPlaceType) otWorkPlaceType.value = "inside";
        if (otWorkPlaceName) otWorkPlaceName.value = "ออฟฟิศแหลมฉบัง";
        if (isOtBreakEl) isOtBreakEl.checked = false;
        if (otModalTitle) otModalTitle.textContent = `เพิ่มรายการ OT (${dateStr})`;
        if (btnDeleteOT) btnDeleteOT.classList.add('d-none');
    }

    calculateOTDetails();

    const otModalElement = document.getElementById('otModal');
    if (otModalElement) {
        otModalElement.addEventListener('shown.bs.modal', () => {
            if (otTimeOut) {
                otTimeOut.focus();
                otTimeOut.select();
            }
        }, { once: true });

        const modalInstance = bootstrap.Modal.getOrCreateInstance(otModalElement);
        modalInstance.show();
    }
}

async function renderOTTable(selectedMonth) {
    const tableContainer = document.getElementById('tableContainer');
    if (!tableContainer) return;

    tableContainer.innerHTML = `
        <div class="text-center py-5 text-muted">
            <div class="spinner-border spinner-border-sm text-primary mb-2" role="status"></div>
            <div class="small">กำลังโหลดข้อมูล OT...</div>
        </div>
    `;

    if (window.jQuery && $.fn.DataTable && $.fn.DataTable.isDataTable('#otDataTable')) {
        $('#otDataTable').DataTable().destroy();
    }

    let currentMonth = parseInt(selectedMonth) || getCurrentOTMonth();

    try {
        let firestoreDataList = [];
        if (typeof otService !== 'undefined' && typeof otService.getRecordsByMonth === 'function') {
            const response = await otService.getRecordsByMonth(currentMonth);
            firestoreDataList = response.success ? response.data : [];
        }

        const year = new Date().getFullYear();
        let prevMonth = currentMonth - 1;
        let prevYear = year;

        if (prevMonth === 0) {
            prevMonth = 12;
            prevYear--;
        }

        const startDate = new Date(prevYear, prevMonth - 1, 21);
        const endDate = new Date(year, currentMonth - 1, 20);

        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const thShortMonths = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
        const thMonths = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'];

        const rangeText = `21 ${thShortMonths[prevMonth - 1]} - 20 ${thShortMonths[currentMonth - 1]}`;
        
        let lastDateOfPayment = new Date(year, currentMonth, 0);
        let dayOfWeekPayment = lastDateOfPayment.getDay();
        if (dayOfWeekPayment === 0) lastDateOfPayment.setDate(lastDateOfPayment.getDate() - 2);
        else if (dayOfWeekPayment === 6) lastDateOfPayment.setDate(lastDateOfPayment.getDate() - 1);
        
        const paymentDateText = `เงินออก ${lastDateOfPayment.getDate()} ${thMonths[lastDateOfPayment.getMonth()]}`;

        const otRangeTextEl = document.getElementById('otRangeText');
        const otPaymentDateTextEl = document.getElementById('otPaymentDateText');
        if (otRangeTextEl) otRangeTextEl.textContent = rangeText;
        if (otPaymentDateTextEl) otPaymentDateTextEl.textContent = paymentDateText;

        let totalHoursSum = 0;
        let totalAmountSum = 0;

        let tableHTML = `
        <style>
            .custom-border-table th, 
            .custom-border-table td { 
                border-right: 1px solid #dee2e6 !important;
                border-bottom: 1px solid #dee2e6 !important;
            }
        </style>
        <div class="table-responsive">
            <table id="otDataTable" class="table table-hover table-striped align-middle text-center mb-0 w-100 border custom-border-table">
                <thead class="table-light text-muted small align-middle">
                    <tr>
                        <th rowspan="2" class="text-start align-middle" style="width: 8%;">
                            <input type="text" id="dateSearchInput" class="form-control border-start-0 ps-0 fw-bold text-muted" 
                                   placeholder=" Date" style="font-size: 0.85rem; box-shadow: none; background-color: transparent;">
                        </th>
                        <th rowspan="2" class="text-center" style="width: 5%;">In</th>
                        <th rowspan="2" class="text-center" style="width: 5%;">Out</th>
                        <th colspan="2" class="border-bottom d-none d-lg-table-cell text-center bg-light">OT 1.5</th>
                        <th colspan="2" class="border-bottom d-none d-lg-table-cell text-center bg-light">OT 3.0</th>
                        <th rowspan="2" class="text-center d-none d-lg-table-cell align-middle text-nowrap">ค่าข้าว</th>
                        <th colspan="2" class="border-bottom text-center">รวม</th>
                        <th rowspan="2" class="text-center px-2" style="width: 50px; max-width: 50px; font-size: 0.75rem;">Action</th>
                    </tr>
                    <tr>
                        <th class="d-none d-lg-table-cell text-center">ชม.</th>
                        <th class="d-none d-lg-table-cell text-center">บาท</th>
                        <th class="d-none d-lg-table-cell text-center">ชม.</th>
                        <th class="d-none d-lg-table-cell text-center">บาท</th>
                        <th class="text-center">ชม.</th>
                        <th class="text-center">บาท</th>
                    </tr>
                </thead>
                <tbody class="small">
        `;

        let currentDate = new Date(startDate);

        while (currentDate <= endDate) {
            const dayOfWeek = currentDate.getDay();
            const isWeekend = (dayOfWeek === 0 || dayOfWeek === 6);

            const dayNumber = String(currentDate.getDate()).padStart(2, '0');
            const dateStr = `${dayNumber} ${months[currentDate.getMonth()]}`;
            const isoDate = `${currentDate.getFullYear()}-${String(currentDate.getMonth()+1).padStart(2,'0')}-${String(currentDate.getDate()).padStart(2,'0')}`;

            const otItem = firestoreDataList.find(item => item.date === isoDate);

            let inTime = '-', outTime = '-';
            let ot15H = '-', ot15B = '-', ot30H = '-', ot30B = '-', mealB = '-', totalH = '-', totalB = '-';
            let btnClass = 'btn-outline-primary';

            if (otItem) {
                const textStyle = 'font-size: 0.65rem;';

                inTime = `<span class="text-primary fw-bold" style="${textStyle}">${otItem.time_in}</span>`;
                outTime = `<span class="text-primary fw-bold" style="${textStyle}">${otItem.time_out}</span>`;

                if (otItem.ot_1_5_hours > 0) {
                    ot15H = `<span class="text-dark fw-bold" style="${textStyle}">${otItem.ot_1_5_hours.toFixed(1)}</span>`;
                    ot15B = `<span class="text-success fw-bold" style="${textStyle}">${(otItem.ot_1_5_amount || 0).toLocaleString('en-US', {minimumFractionDigits: 2})}</span>`;
                }

                if (otItem.ot_3_0_hours > 0) {
                    ot30H = `<span class="text-dark fw-bold" style="${textStyle}">${otItem.ot_3_0_hours.toFixed(1)}</span>`;
                    ot30B = `<span class="text-success fw-bold" style="${textStyle}">${(otItem.ot_3_0_amount || 0).toLocaleString('en-US', {minimumFractionDigits: 2})}</span>`;
                }

                if (otItem.meal_amount > 0) {
                    mealB = `<span class="text-primary fw-bold" style="${textStyle}">${otItem.meal_amount.toLocaleString('en-US')}</span>`;
                }

                totalH = `<span class="text-warning fw-bold" style="${textStyle}">${(otItem.total_hours || 0).toFixed(1)}</span>`;
                totalB = `<span class="text-success fw-bold" style="${textStyle}">${(otItem.total_amount || 0).toLocaleString('en-US', {minimumFractionDigits: 2})}</span>`;

                btnClass = 'btn-warning text-white border-0 shadow-sm';
                
                totalHoursSum += otItem.total_hours || 0;
                totalAmountSum += otItem.total_amount || 0;
            }

            const trClass = isWeekend ? 'bg-light' : '';

            tableHTML += `
                <tr class="${trClass}">
                    <td class="text-start fw-bold text-nowrap" style="font-size: 0.8rem;">${dateStr}</td>
                    <td class="text-muted" style="font-size: 0.65rem;">${inTime}</td>
                    <td class="text-muted" style="font-size: 0.65rem;">${outTime}</td>
                    <td class="text-muted d-none d-lg-table-cell">${ot15H}</td>
                    <td class="text-muted d-none d-lg-table-cell">${ot15B}</td>
                    <td class="text-muted d-none d-lg-table-cell">${ot30H}</td>
                    <td class="text-muted d-none d-lg-table-cell">${ot30B}</td>
                    <td class="text-muted d-none d-lg-table-cell">${mealB}</td>
                    <td class="text-muted">${totalH}</td>
                    <td class="text-muted">${totalB}</td>
                    <td class="text-center px-2">
                        <button type="button" class="btn ${btnClass} btn-sm rounded-circle btn-edit-ot" 
                                data-date="${isoDate}" 
                                data-id="${otItem ? otItem.id : ''}" 
                                style="width: 30px; height: 30px; padding: 0;" 
                                title="แก้ไข/เพิ่ม OT">
                            <i class="fa-solid fa-pen-to-square" style="font-size: 0.7rem; pointer-events: none; position: relative; top: -1px;"></i>
                        </button>
                    </td>
                </tr>
            `;
            currentDate.setDate(currentDate.getDate() + 1);
        }

        tableHTML += `</tbody></table></div>`;

        const renderContent = () => {
            tableContainer.innerHTML = tableHTML;

            const totalHoursEl = document.querySelector('#ot-view .text-warning');
            if (totalHoursEl) {
                totalHoursEl.innerHTML = `${totalHoursSum.toFixed(1)} <span class="fs-6 text-muted fw-normal">Hrs</span>`;
            }

            const amountValueEl = document.getElementById('amountValue');
            if (amountValueEl) {
                const formattedAmount = totalAmountSum.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                amountValueEl.setAttribute('data-value', formattedAmount);

                const eyeIcon = document.querySelector('#ot-view .hide');
                if (eyeIcon && eyeIcon.classList.contains('fa-eye-slash')) {
                    amountValueEl.textContent = formattedAmount;
                } else {
                    amountValueEl.textContent = 'XX.XX';
                }
            }

            const formattedTotal = totalAmountSum.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
            const homeValue = `THB ${formattedTotal}`;

            const homeAmountEl = document.getElementById('homeAmountValue');
            if (homeAmountEl) {
                homeAmountEl.setAttribute('data-value', homeValue);
                
                const homeEyeIcon = document.getElementById('homeEyeIcon');
                if (homeEyeIcon && homeEyeIcon.classList.contains('fa-eye-slash')) {
                    homeAmountEl.textContent = homeValue;
                }
            }

            if (window.jQuery && $.fn.DataTable) {
                const table = $('#otDataTable').DataTable({
                    paging: false,
                    info: false,
                    ordering: false,
                    dom: 't',
                    scrollX: false,
                    orderCellsTop: true,
                    language: { emptyTable: "ไม่มีข้อมูลในรอบเดือนนี้" }
                });

                $('#dateSearchInput').off('input').on('input', function() {
                    let searchValue = this.value.trim();
                    if (/^\d$/.test(searchValue)) searchValue = '0' + searchValue;
                    table.column(0).search(searchValue).draw();
                });
            }

            // 🟢 จุดแก้ไขเดียว: เปลี่ยนจาก tableContainer.onclick เป็น jQuery Event Delegation
            if (window.jQuery) {
                $(tableContainer).off('click', '.btn-edit-ot').on('click', '.btn-edit-ot', function(e) {
                    e.preventDefault();
                    const dateVal = $(this).attr('data-date');
                    const docId = $(this).attr('data-id');
                    if (typeof openEditOTModal === 'function') {
                        openEditOTModal(dateVal, docId);
                    }
                });
            }
        };

        if (typeof smoothRender === 'function') {
            smoothRender(tableContainer, renderContent);
        } else {
            renderContent();
        }

    } catch (error) {
        console.error("Render OT Table Error:", error);
        tableContainer.innerHTML = `
            <div class="text-center text-danger py-4 small">
                เกิดข้อผิดพลาดในการโหลดข้อมูล OT: ${error.message}
            </div>
        `;
    }
}

function initOTManagement() {
    const tableContainer = document.getElementById('tableContainer'); 
    const monthSelector = document.getElementById('monthSelector');
    const btnAddOT = document.querySelector('#ot-view .btn-success');
    
    const otTimeIn = document.getElementById('otTimeIn');
    const otTimeOut = document.getElementById('otTimeOut');
    const otIsHoliday = document.getElementById('otIsHoliday');
    const isOtBreakEl = document.getElementById('is_ot_break');
    const otForm = document.getElementById('otForm');

    if (otTimeIn) {
        otTimeIn.addEventListener('input', calculateOTDetails);
        otTimeIn.addEventListener('change', calculateOTDetails);
    }
    if (otTimeOut) {
        otTimeOut.addEventListener('input', calculateOTDetails);
        otTimeOut.addEventListener('change', calculateOTDetails);
    }
    if (otIsHoliday) otIsHoliday.addEventListener('change', calculateOTDetails);
    if (isOtBreakEl) isOtBreakEl.addEventListener('change', calculateOTDetails);

    const handleEnterPress = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            calculateOTDetails(); 
            if (otForm) {
                if (typeof otForm.requestSubmit === 'function') {
                    otForm.requestSubmit();
                } else {
                    otForm.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
                }
            }
        }
    };

    if (otTimeIn) otTimeIn.addEventListener('keydown', handleEnterPress);
    if (otTimeOut) otTimeOut.addEventListener('keydown', handleEnterPress);

    if (tableContainer && monthSelector) {
        monthSelector.value = getCurrentOTMonth(); 
        renderOTTable(monthSelector.value);
        monthSelector.addEventListener('change', function() {
            renderOTTable(this.value);
        });
    }

    if (btnAddOT) {
        btnAddOT.addEventListener('click', () => {
            const todayIso = new Date().toISOString().split('T')[0];
            openEditOTModal(todayIso);
        });
    }

// 🗑️ Event กดปุ่มลบข้อมูล OT
    const btnDeleteOT = document.getElementById('btnDeleteOT');
    if (btnDeleteOT) {
        btnDeleteOT.onclick = async function() {
            const docIdInput = document.getElementById('ot_id');
            const docId = docIdInput ? docIdInput.value.trim() : '';
            const targetDate = document.getElementById('otDate')?.value || '';

            // 🛑 ตรวจสอบ ID กรณีหลุดรอด
            if (!docId || docId === '' || docId === 'undefined' || docId === 'null') {
                showNotification("ไม่พบ ID รายการนี้ในระบบ ไม่สามารถสั่งลบได้ครับ (กรุณา Refresh หน้าเว็บแล้วลองอีกครั้ง)", 'error');
                return;
            }

            const otModalContent = document.querySelector('#otModal .modal-content');
            if (!otModalContent) return;

            // 1. 🌀 แสดง Spinner หมุนซ้อนทับบนหน้าต่าง Modal
            const loadingOverlay = document.createElement('div');
            loadingOverlay.id = 'otModalLoadingOverlay';
            loadingOverlay.className = 'position-absolute top-0 start-0 w-100 h-100 d-flex flex-column justify-content-center align-items-center bg-white bg-opacity-75 rounded-3';
            loadingOverlay.style.zIndex = '1056';
            loadingOverlay.style.backdropFilter = 'blur(4px)';
            loadingOverlay.style.webkitBackdropFilter = 'blur(4px)';
            loadingOverlay.innerHTML = `
                <div class="spinner-border text-danger mb-2" style="width: 2.5rem; height: 2.5rem;" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
                <div class="fw-bold text-danger small">กำลังลบข้อมูลออกจากระบบ...</div>
            `;

            otModalContent.classList.add('position-relative');
            otModalContent.appendChild(loadingOverlay);

            // 2. สั่งลบข้อมูลออกจาก Firestore
            let result = { success: false, error: 'otService ไม่พร้อมใช้งาน' };
            try {
                if (typeof otService !== 'undefined' && typeof otService.deleteRecord === 'function') {
                    result = await otService.deleteRecord(docId);
                }
            } catch (err) {
                result = { success: false, error: err.message };
            }

            // 3. เอา Spinner หมุนๆ ออก
            const overlayEl = document.getElementById('otModalLoadingOverlay');
            if (overlayEl) overlayEl.remove();

            // 4. ปิด Modal แก้ไข OT
            const otModalEl = document.getElementById('otModal');
            if (otModalEl) {
                const modalInstance = bootstrap.Modal.getInstance(otModalEl);
                if (modalInstance) modalInstance.hide();
            }

            // 5. 🔔 แจ้งเตือนผลการลบข้อมูล
            if (result && result.success) {
                const monthSelector = document.getElementById('monthSelector');
                const selectedM = monthSelector ? monthSelector.value : getCurrentOTMonth();
                
                // รีโหลดตาราง
                if (typeof renderOTTable === 'function') {
                    await renderOTTable(selectedM);
                }

                showNotification(`ลบรายการ OT วันที่ ${targetDate} เรียบร้อยแล้วครับ!`, 'success');
            } else {
                showNotification("เกิดข้อผิดพลาดในการลบข้อมูล: " + (result?.error || "ไม่ทราบสาเหตุ"), 'error');
            }
        };
    }

    if (otForm) {
        otForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            calculateOTDetails();

            const docId = document.getElementById('ot_id')?.value || null;
            const targetDate = document.getElementById('otDate').value;
            const targetDateObj = new Date(targetDate);

            const timeInVal = document.getElementById('otTimeIn').value.trim().replace('.', ':');
            const timeOutVal = document.getElementById('otTimeOut').value.trim().replace('.', ':');

            const o15h = parseFloat(document.getElementById('ot15Hours').value) || 0;
            const o30h = parseFloat(document.getElementById('ot30Hours').value) || 0;
            const mealAmount = parseFloat(document.getElementById('otMeal').value) || 0;
            const MEAL_RATE = 50;

            const hourlyRate = (12000 / 30 / 8);
            const totalH = o15h + o30h;
            const o15a = o15h * (hourlyRate * 1.5);
            const o30a = o30h * (hourlyRate * 3.0);
            const totalA = o15a + o30a + mealAmount;

            let mRound = targetDateObj.getMonth() + 1;
            if (targetDateObj.getDate() > 20) {
                mRound = mRound === 12 ? 1 : mRound + 1;
            }

            const formData = {
                date: targetDate,
                month_round: mRound,
                time_in: timeInVal,
                time_out: timeOutVal,
                is_holiday: document.getElementById('otIsHoliday').checked,
                is_ot_break: document.getElementById('is_ot_break')?.checked || false,
                work_place_type: document.getElementById('otWorkPlaceType').value,
                work_place_name: document.getElementById('otWorkPlaceName').value.trim(),
                ot_1_5_hours: o15h,
                ot_1_5_amount: o15a,
                ot_3_0_hours: o30h,
                ot_3_0_amount: o30a,
                meal_count: Math.floor(mealAmount / MEAL_RATE),
                meal_amount: mealAmount,
                total_hours: totalH,
                total_amount: totalA,
                remark: document.getElementById('otRemark').value.trim()
            };

            let result = { success: false, error: 'otService ไม่พร้อมใช้งาน' };
            if (typeof otService !== 'undefined') {
                if (docId && typeof otService.updateRecord === 'function') {
                    result = await otService.updateRecord(docId, formData);
                } else if (typeof otService.addRecord === 'function') {
                    result = await otService.addRecord(formData);
                }
            }

            if (result.success) {
                const otModalEl = document.getElementById('otModal');
                if (otModalEl) {
                    const modalInstance = bootstrap.Modal.getInstance(otModalEl);
                    if (modalInstance) modalInstance.hide();
                }

                showNotification(docId ? "แก้ไขรายการ OT เรียบร้อยแล้ว" : "บันทึกรายการ OT เรียบร้อยแล้ว", 'success');

                const monthSelector = document.getElementById('monthSelector');
                renderOTTable(monthSelector ? monthSelector.value : getCurrentOTMonth());
            } else {
                // จากเดิม: alert("เกิดข้อผิดพลาดในการบันทึก: " + result.error);
                showNotification("เกิดข้อผิดพลาดในการบันทึก: " + result.error, 'error'); 
            }
        });
    }
}

// ==========================================
// 👁️ Amount Toggle (Eye Icon Control System)
// ==========================================
function initAmountToggle() {
    document.addEventListener('click', function(e) {
        
        // 1. 👁️ สวิตช์ตาในหน้า OT View
        const otEyeBtn = e.target.closest('#ot-view .hide');
        if (otEyeBtn) {
            const amountValue = document.getElementById('amountValue');
            const isHidden = otEyeBtn.classList.contains('fa-eye');
            
            if (isHidden) {
                otEyeBtn.classList.remove('fa-eye');
                otEyeBtn.classList.add('fa-eye-slash');
                if (amountValue) amountValue.textContent = amountValue.getAttribute('data-value') || '0.00';
            } else {
                otEyeBtn.classList.remove('fa-eye-slash');
                otEyeBtn.classList.add('fa-eye');
                if (amountValue) amountValue.textContent = 'XX.XX';
            }
            return;
        }

        // 2. 👁️ สวิตช์ตาในหน้า Report View
        const reportEyeBtn = e.target.closest('#reportEyeIcon');
        if (reportEyeBtn) {
            const amountText = document.getElementById('reportYearTotalAmount');
            if (!amountText) return;

            const isHidden = reportEyeBtn.classList.contains('fa-eye');
            if (isHidden) {
                reportEyeBtn.classList.remove('fa-eye');
                reportEyeBtn.classList.add('fa-eye-slash');
                amountText.textContent = amountText.getAttribute('data-value') || '0.00';
            } else {
                reportEyeBtn.classList.remove('fa-eye-slash');
                reportEyeBtn.classList.add('fa-eye');
                amountText.textContent = 'XX,XXX.XX';
            }
            return;
        }

        // 3. 👁️ สวิตช์ตาในหน้า Home
        const homePayBtn = e.target.closest('.hide-home');
        if (homePayBtn) {
            const amountText = document.getElementById('homeAmountValue');
            const eyeIcon = document.getElementById('homeEyeIcon');
            if (!amountText || !eyeIcon) return;

            const isHidden = eyeIcon.classList.contains('fa-eye');
            if (isHidden) {
                eyeIcon.classList.remove('fa-eye');
                eyeIcon.classList.add('fa-eye-slash');
                
                // 🟢 ดึงค่าจาก data-value ถ้าไม่มีให้โชว์ THB --,--.-- เป็น Fallback (แก้ปัญหาที่ 3)
                const val = amountText.getAttribute('data-value') || 'THB --,--.--';
                amountText.textContent = val;
                
                homePayBtn.innerHTML = `<i class="fa-solid fa-eye-slash me-1" id="homeEyeIcon"></i> Hide my pay`;
            } else {
                eyeIcon.classList.remove('fa-eye-slash');
                eyeIcon.classList.add('fa-eye');
                amountText.textContent = 'THB XX,XXX.XX';
                homePayBtn.innerHTML = `<i class="fa-solid fa-eye me-1" id="homeEyeIcon"></i> Show my pay`;
            }
            return;
        }
    });
}

// 🏠 ดึงและแสดงยอดเงินหน้า Home (ครอบคลุมการแก้ปัญหาข้ามเดือน และผู้ใช้ใหม่)
async function renderHomeSummary() {
    const homeAmountEl = document.getElementById('homeAmountValue');
    if (!homeAmountEl) return;

    const currentMonth = getCurrentOTMonth(); // ดึงเลขเดือนปัจจุบัน
    const rawCache = localStorage.getItem('cached_home_pay_amount');

    // ==========================================
    // ⚡ STEP 1: ตรวจสอบ และอ่านค่าจาก Cache (แก้ปัญหา 2 และ 3)
    // ==========================================
    if (rawCache) {
        try {
            const cachedData = JSON.parse(rawCache);

            // 🟢 แก้ปัญหาที่ 2: เช็กว่าเดือนใน Cache ตรงกับเดือนปัจจุบันหรือไม่
            if (cachedData && cachedData.month === currentMonth) {
                // ถ้าเป็นเดือนเดียวกัน ให้ดึงยอดเงินมาโชว์ทันที (0ms)
                homeAmountEl.setAttribute('data-value', cachedData.amount);
                
                const eyeIcon = document.getElementById('homeEyeIcon');
                if (eyeIcon && eyeIcon.classList.contains('fa-eye-slash')) {
                    homeAmountEl.textContent = cachedData.amount;
                }
            } else {
                // ถ้าเปลี่ยนเดือนใหม่แล้ว ให้ล้าง Cache เก่าทิ้ง และใส่ค่าสำรองรอไว้
                localStorage.removeItem('cached_home_pay_amount');
                homeAmountEl.setAttribute('data-value', 'THB --,--.--');
            }
        } catch (e) {
            console.error("Cache Read Error:", e);
        }
    } else {
        // 🟢 แก้ปัญหาที่ 3: เปิดครั้งแรก / เปลี่ยนเครื่อง / Incognito Mode (ยังไม่มี Cache)
        homeAmountEl.setAttribute('data-value', 'THB --,--.--');
    }

    // ==========================================
    // 🔄 STEP 2: ดึงข้อมูลจริงจาก Firebase มาอัปเดตในเบื้องหลัง
    // ==========================================
    try {
        let totalAmount = 0;

        if (typeof otService !== 'undefined' && typeof otService.getRecordsByMonth === 'function') {
            const response = await otService.getRecordsByMonth(currentMonth);
            if (response && response.success && Array.isArray(response.data)) {
                totalAmount = response.data.reduce((sum, item) => sum + (parseFloat(item.total_amount) || 0), 0);
            }
        }

        const formattedValue = `THB ${totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

        // 🟢 บันทึกยอดเงิน + เลขเดือนปัจจุบัน ลงใน Cache เพื่อใช้เช็กครั้งถัดไป
        const cachePayload = {
            month: currentMonth,
            amount: formattedValue
        };
        localStorage.setItem('cached_home_pay_amount', JSON.stringify(cachePayload));

        // ตั้งค่าให้ Element และสลับตัวเลขทันทีถ้าเปิดตาค้างไว้
        homeAmountEl.setAttribute('data-value', formattedValue);
        const eyeIcon = document.getElementById('homeEyeIcon');
        if (eyeIcon && eyeIcon.classList.contains('fa-eye-slash')) {
            homeAmountEl.textContent = formattedValue;
        }

    } catch (error) {
        console.error("Home Summary Fetch Error:", error);
    }
}

// ==========================================
// 📄 Document Center & PDF Helper Functions (ขยายตารางให้เต็มหน้า A4 พอดี)
// ==========================================

// 1. ฟังก์ชันสร้าง HTML ตาราง OT (ปรับสัดส่วนขยายเต็มหน้า A4)
async function buildOTHtmlContent(selectedMonth) {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const year = 2026;
    let prevMonth = selectedMonth - 1; 
    let prevYear = year;
    if (prevMonth === 0) { prevMonth = 12; prevYear--; }

    const startDateStr = `21 ${monthNames[prevMonth - 1]}`; 
    const endDateStr = `20 ${monthNames[selectedMonth - 1]}`;
    let currentDate = new Date(prevYear, prevMonth - 1, 21); 
    const endDate = new Date(year, selectedMonth - 1, 20);
    
    let liveOtData = [];
    if (typeof otService !== 'undefined' && typeof otService.getRecordsByMonth === 'function') {
        const response = await otService.getRecordsByMonth(selectedMonth);
        liveOtData = response.success ? response.data : [];
    }

    let otRows = '';
    let totalOutside = 0;
    let totalMeals = 0;
    let totalPay = 0;

    while (currentDate <= endDate) {
        const d = String(currentDate.getDate()).padStart(2, '0'); 
        const m = monthNames[currentDate.getMonth()]; 
        const y = String(currentDate.getFullYear()).slice(-2);
        const isWeekend = (currentDate.getDay() === 0 || currentDate.getDay() === 6);
        const bgStyle = isWeekend ? 'background-color: #92d050 !important;' : '';
        
        const isoDate = `${currentDate.getFullYear()}-${String(currentDate.getMonth()+1).padStart(2,'0')}-${String(currentDate.getDate()).padStart(2,'0')}`;
        const item = liveOtData.find(data => data.date === isoDate);
        
        let wOut = "", wIn = "", wName = "", tIn = "", tOut = "", ot15 = "", ot30 = "", remark = "", mealTxt = "";
        
        if (item) {
            if (item.work_place_type === "outside") { wOut = "✓"; totalOutside++; }
            else { wIn = "✓"; }
            
            wName = item.work_place_name || "";
            tIn = item.time_in || "";
            tOut = item.time_out || "";
            ot15 = item.ot_1_5_hours > 0 ? item.ot_1_5_hours.toFixed(1) : "";
            ot30 = item.ot_3_0_hours > 0 ? item.ot_3_0_hours.toFixed(1) : "";
            remark = item.remark || "";
            mealTxt = item.meal_count > 0 ? item.meal_count : "";
            
            totalMeals += item.meal_count || 0;
            totalPay += item.total_amount || 0;
        }

        otRows += `
            <tr>
                <td class="text-nowrap text-center" style="${bgStyle}">${d}-${m}-${y}</td>
                <td style="${bgStyle}"></td>
                <td class="text-center fw-bold text-success" style="${bgStyle}">${wOut}</td>
                <td class="text-center fw-bold text-success" style="${bgStyle}">${wIn}</td>
                <td style="${bgStyle}">${wName}</td>
                <td style="${bgStyle}">${remark}</td>
                <td class="text-center" style="${bgStyle}">${tIn}</td>
                <td class="text-center" style="${bgStyle}">${tOut}</td>
                <td class="text-center" style="${bgStyle}">${ot15}</td>
                <td class="text-center" style="${bgStyle}">${ot30}</td>
                <td style="${bgStyle}"></td>
                <td style="${bgStyle}"></td>
                <td style="${bgStyle}"></td>
                <td style="${bgStyle}"></td>
                <td style="${bgStyle}"></td>
                <td class="text-center" style="${bgStyle}">${mealTxt}</td>
            </tr>
        `;
        currentDate.setDate(currentDate.getDate() + 1);
    }

    return `
        <style>
            .excel-table th, .excel-table td { border: 1px solid #000 !important; color: #000 !important; font-size: 9.5px !important; padding: 2px 3px !important; line-height: 1.15 !important; height: 17px !important; }
            .excel-table th { background-color: #f2f2f2 !important; font-weight: bold; }
            .excel-table th, .excel-table td { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        </style>
        <div class="d-flex justify-content-between align-items-end mb-2">
            <div><img src="doc/logo.jpeg" alt="SINOTRANS Logo" style="width: 65px; height: auto;"></div>
            <div class="fw-bold text-end" style="font-size: 12px; color: #000;">เดือน-ปี Month-Year <span class="ms-2 px-3 fw-normal" style="border-bottom: 1px solid #000; display: inline-block; min-width: 120px; text-align: center;">${startDateStr} - ${endDateStr}</span></div>
        </div>
        <table class="table table-sm align-middle excel-table mb-0" style="table-layout: fixed; font-family: 'Segoe UI', sans-serif; width: 100%;">
            <colgroup><col style="width: 65px;"><col style="width: 80px;"><col style="width: 25px;"><col style="width: 25px;"><col style="width: 130px;"><col style="width: 125px;"><col style="width: 60px;"><col style="width: 60px;"><col style="width: 35px;"><col style="width: 35px;"><col style="width: 30px;"><col style="width: 40px;"><col style="width: 40px;"><col style="width: 65px;"><col style="width: 70px;"><col style="width: 40px;"></colgroup>
            <thead class="text-center align-middle">
                <tr><th rowspan="2">Date<br>วันที่</th><th rowspan="2">DN/TP No.<br>เลขที่ DN/TP</th><th colspan="3">สถานที่ทำงาน <br> Working Place</th><th rowspan="2">Remark</th><th colspan="2">เวลาทำงาน <br> Working Hours</th><th colspan="2">ชั่วโมง<br>O.T.</th><th rowspan="2">SR</th><th rowspan="2">Night<br>shift</th><th rowspan="2">Stan<br>d by</th><th rowspan="2">ลายเซ็น<br>Applicant</th><th rowspan="2">Approved by<br>Supervisor</th><th rowspan="2">ค่าข้าว<br>(มื้อ)<br>Meal</th></tr>
                <tr><th style="font-size: 8.5px;">งาน<br>นอก</th><th style="font-size: 8.5px;">งาน<br>ใน</th><th>ชื่อสถานที่ Working Place Name</th><th>เวลาเริ่ม<br>Start Time</th><th>เวลาสิ้นสุด<br>End Time</th><th>(1.5)</th><th>(3)</th></tr>
            </thead>
            <tbody>${otRows}</tbody>
            <tfoot style="border: none !important;">
                <tr>
                    <td colspan="6" class="text-end border-0 pt-2" style="font-size: 11px; color:#000;">จำนวนครั้งที่ออกนอกสถานที่ <span class="fw-bold" style="display:inline-block; width:140px; border-bottom:1px dotted #000; text-align: center;">${totalOutside}</span></td>
                    <td colspan="2" class="text-center border-0 border-bottom border-dark pt-2" style="color:#000; font-size: 11px;">ครั้ง</td>
                    <td colspan="8" rowspan="2" class="text-center align-middle border-0 pt-2" style="font-size: 11.5px; color:#000;">รวมเป็นเงินทั้งสิ้น <span class="fw-bold" style="display:inline-block; width:140px; border-bottom:1px dotted #000; text-align: center;">${totalPay.toLocaleString('en-US', {minimumFractionDigits: 2})}</span> บาท</td>
                </tr>
                <tr>
                    <td colspan="6" class="text-end border-0 pb-1" style="font-size: 11px; color:#000;">จำนวนมื้ออาหาร <span class="fw-bold" style="display:inline-block; width:140px; border-bottom:1px dotted #000; text-align: center;">${totalMeals}</span></td>
                    <td colspan="2" class="text-center border-0 pb-1" style="color:#000; font-size: 11px;">มื้อ</td>
                </tr>
            </tfoot>
        </table>
    `;
}

// 2. มัดรวมไฟล์ PDF ทั้งหมดเป็น Blob เดียว
window.generateCombinedPDFBlob = async function(callback) {
    try {
        const pdfUrls = { 1: "doc/ใบลงเวลางาน.pdf", 3: "doc/ใบเบิกค่าน้ำมัน.pdf" };
        const [timesheetBytes, fuelBytes] = await Promise.all([
            fetch(pdfUrls[1]).then(res => res.arrayBuffer()),
            fetch(pdfUrls[3]).then(res => res.arrayBuffer())
        ]);

        const docMonthSelect = document.getElementById('docMonthSelect');
        const fuelQtyInput = document.getElementById('fuelQtyInput');
        
        const selectedMonth = parseInt(docMonthSelect?.value) || getCurrentOTMonth();
        const otHtmlContent = await buildOTHtmlContent(selectedMonth);
        
        const otElement = document.createElement('div');
        otElement.style.width = '1060px'; 
        otElement.style.background = '#fff';
        otElement.style.padding = '0px';
        otElement.innerHTML = `<div style="width: 100%;">${otHtmlContent}</div>`;

        const options = {
            margin: [4, 6, 4, 6], 
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true, logging: false, width: 1060 },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' },
            pagebreak: { mode: 'avoid' }
        };

        const otPdfBlob = await html2pdf().set(options).from(otElement).outputPdf('blob');
        const otBytes = await otPdfBlob.arrayBuffer();

        const mergedPdf = await PDFLib.PDFDocument.create();
        const pdf1 = await PDFLib.PDFDocument.load(timesheetBytes);
        const pdf2 = await PDFLib.PDFDocument.load(otBytes);
        const pdf3 = await PDFLib.PDFDocument.load(fuelBytes);

        const pages1 = await mergedPdf.copyPages(pdf1, pdf1.getPageIndices());
        pages1.forEach(page => mergedPdf.addPage(page));

        const pages2 = await mergedPdf.copyPages(pdf2, pdf2.getPageIndices());
        pages2.forEach(page => mergedPdf.addPage(page));

        const repeatCount = parseInt(fuelQtyInput?.value) || 1;
        const pdf3PageIndices = pdf3.getPageIndices();
        for (let i = 0; i < repeatCount; i++) {
            const pages3 = await mergedPdf.copyPages(pdf3, pdf3PageIndices);
            pages3.forEach(page => mergedPdf.addPage(page));
        }

        const mergedPdfBytes = await mergedPdf.save();
        callback(new Blob([mergedPdfBytes], { type: 'application/pdf' }));
    } catch (error) {
        console.error("เกิดข้อผิดพลาดในการรวมไฟล์ PDF:", error);
        if (typeof showNotification === 'function') {
            showNotification("ระบบไม่สามารถมัดรวมไฟล์ได้ กรุณาตรวจสอบโฟลเดอร์ทรัพยากรระบบต้นทางครับ", 'error');
        }
    }
};

// 2. ฟังก์ชันหลักสำหรับระบบ Document Center
function initDocumentCenter() {
    const docFormSelect = document.getElementById('docFormSelect');
    const docMonthWrapper = document.getElementById('docMonthWrapper');
    const docMonthSelect = document.getElementById('docMonthSelect');
    const btnClearDocForm = document.getElementById('btnClearDocForm');
    const btnViewDocument = document.getElementById('btnViewDocument');
    const docRenderArea = document.getElementById('docRenderArea');

    if (!docFormSelect || !docMonthWrapper) return;
    const monthCollapse = new bootstrap.Collapse(docMonthWrapper, { toggle: false });

    if (docMonthSelect) docMonthSelect.value = getCurrentOTMonth();

    docFormSelect.addEventListener('change', function() {
        const selectedForm = this.value;

        if (!selectedForm || selectedForm === '') {
            monthCollapse.hide();
            smoothRender(docRenderArea, renderEmptyState);
            return;
        }

        if (selectedForm === 'monthly_all' || selectedForm === 'ot') {
            monthCollapse.show(); 
        } else {
            monthCollapse.hide(); 
            smoothRender(docRenderArea, () => renderDocument(selectedForm));
        }
    });

    if (btnClearDocForm) {
        btnClearDocForm.addEventListener('click', function() {
            docFormSelect.value = '';
            monthCollapse.hide();
            smoothRender(docRenderArea, renderEmptyState);
        });
    }

    if (btnViewDocument && docRenderArea) {
        btnViewDocument.addEventListener('click', function() {
            const selectedForm = docFormSelect.value;
            if (!selectedForm) {
                showNotification("กรุณาเลือกประเภทเอกสารที่ต้องการดูก่อนครับ", 'error');
                return;
            }
            smoothRender(docRenderArea, () => renderDocument(selectedForm));
        });
    }

    async function renderDocument(selectedForm) {
        if (selectedForm === 'monthly_all') {
            renderMonthlyAllDocument();
            return;
        }

        if (selectedForm === 'ot_payment') {
            renderOTPaymentDocument();
            return;
        }

        docRenderArea.classList.remove('justify-content-center', 'align-items-center', 'text-center', 'overflow-auto');
        docRenderArea.classList.add('align-items-start', 'text-start');

        // 🟢 เรนเดอร์ใบโอที
       if (selectedForm === 'ot') {
            const selectedMonth = parseInt(docMonthSelect?.value) || getCurrentOTMonth();
            const otHtmlContent = await buildOTHtmlContent(selectedMonth);

            // 🟢 เช็กขนาดหน้าจอตั้งแต่วาด HTML (ถ้าจอเล็กกว่า 768px ให้สูง 200px ถ้าจอใหญ่ให้สูง 560px)
            const initialHeight = window.innerWidth < 768 ? '200px' : '560px';

            docRenderArea.innerHTML = `
                <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-3 w-100 gap-2">
                    <h5 class="fw-bold mb-0 text-dark text-center text-md-start"><i class="fa-solid fa-file-pdf text-danger me-2"></i> ใบโอที</h5>
                    <button id="btnDownloadSingleOT" class="btn btn-primary btn-sm fw-bold px-3 shadow-sm"><i class="fa-solid fa-download me-1"></i> Download PDF</button>
                </div>
                <div id="singleOtPreviewContainer" class="w-100 border rounded shadow-sm bg-white overflow-hidden position-relative" style="height: ${initialHeight}; transition: height 0.2s ease;">
                    <div id="otSingleInnerPreview" class="bg-white p-3" style="width: 1060px; transform-origin: top left; position: absolute; top: 0; left: 0;">
                        ${otHtmlContent}
                    </div>
                </div>
            `;

            // 🟢 คำนวณ Scale และปรับความสูงกล่องให้พอดีกับกระดาษจริงอัตโนมัติ
            setTimeout(() => {
                const paper = document.getElementById('otSingleInnerPreview');
                const container = document.getElementById('singleOtPreviewContainer');
                if (paper && container) {
                    const scale = container.clientWidth / 1060;
                    paper.style.transform = `scale(${scale})`;

                    // ถ้าเป็นหน้าจอมือถือ/จอเล็ก ให้ยึดความสูง 200px หรือความสูงสเกลจริง
                    if (window.innerWidth < 768) {
                        const calculatedHeight = Math.min(200, paper.clientHeight * scale);
                        container.style.height = `${calculatedHeight}px`;
                    } else {
                        container.style.height = `${paper.clientHeight * scale + 20}px`;
                    }
                }
            }, 50);

            document.getElementById('btnDownloadSingleOT')?.addEventListener('click', async () => {
                const otElement = document.createElement('div');
                otElement.style.width = '1060px'; 
                otElement.style.background = '#fff';
                otElement.innerHTML = otHtmlContent;

                const options = {
                    margin: [4, 6, 4, 6], 
                    image: { type: 'jpeg', quality: 0.98 },
                    html2canvas: { scale: 2, useCORS: true, logging: false, width: 1060 },
                    jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' }
                };

                const otPdfBlob = await html2pdf().set(options).from(otElement).outputPdf('blob');
                const link = document.createElement('a');
                link.href = URL.createObjectURL(otPdfBlob);
                link.download = `ใบเวลาโอที_เดือน_${selectedMonth}.pdf`;
                link.click();
            });

            return;
        }

        // 🟢 เรนเดอร์เอกสารประเภทอื่นๆ
        let pdfTitle = "";
        let pdfUrl = "";

        switch (selectedForm) {
            case 'timesheet': pdfTitle = "ใบลงเวลางาน"; pdfUrl = "doc/ใบลงเวลางาน.pdf"; break;
            case 'fuel': pdfTitle = "ใบเบิกค่าน้ำมัน"; pdfUrl = "doc/ใบเบิกค่าน้ำมัน.pdf"; break;
        }

        docRenderArea.innerHTML = `
            <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-3 w-100 gap-2">
                <h5 class="fw-bold mb-0 text-dark text-center text-md-start"><i class="fa-solid fa-file-pdf text-danger me-2"></i> ${pdfTitle}</h5>
                <div class="d-flex gap-2 mt-2 mt-md-0">
                    <a href="${pdfUrl}" download class="btn btn-primary btn-sm fw-bold px-3 flex-fill shadow-sm"><i class="fa-solid fa-download me-1"></i> Download PDF</a>
                </div>
            </div>
            <div class="w-100 border rounded shadow-sm bg-white" style="height: 380px;">
                <iframe src="${pdfUrl}#toolbar=0&scrollbar=0&view=Fit" width="100%" height="100%" style="border: none;"></iframe>
            </div>
        `;
    }

    function renderOTPaymentDocument() {
        docRenderArea.classList.remove('justify-content-center', 'align-items-center', 'text-center');
        docRenderArea.classList.add('align-items-start', 'text-start');
        const pdfUrl = "doc/เอกสารการจ่ายโอที.pdf";

        docRenderArea.innerHTML = `
            <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-3 w-100 gap-2">
                <h5 class="fw-bold mb-0 text-dark text-center text-md-start"><i class="fa-solid fa-file-invoice-dollar text-success me-2"></i> เอกสารการจ่ายเงินโอที</h5>
                <a href="${pdfUrl}" download class="btn btn-primary btn-sm fw-bold px-3"><i class="fa-solid fa-download me-1"></i> Download PDF</a>
            </div>
            <div class="w-100 border rounded shadow-sm bg-white" style="height: 380px;">
                <iframe src="${pdfUrl}#toolbar=0&view=Fit" width="100%" height="100%" style="border: none;"></iframe>
            </div>
        `;
    }

    function renderMonthlyAllDocument() {
        docRenderArea.classList.remove('justify-content-center', 'align-items-center', 'text-center');
        docRenderArea.classList.add('align-items-start', 'text-start');

        let currentPage = 1;
        const pdfUrls = { 1: "doc/ใบลงเวลางาน.pdf", 3: "doc/ใบเบิกค่าน้ำมัน.pdf" };

        docRenderArea.innerHTML = `
            <div class="w-100 mb-3">
                <div class="d-flex flex-column flex-md-row align-items-center justify-content-between w-100 gap-3">
                    <div class="d-flex flex-column flex-md-row align-items-center justify-content-center justify-content-md-start gap-2 text-nowrap">
                        <h5 class="fw-bold mb-0 text-dark"><i class="fa-solid fa-file-pdf text-danger me-2"></i> ไฟล์ปริ้นประจำเดือน</h5>
                        <span id="pageIndicator" class="badge bg-secondary px-2 py-1 mt-1" style="font-size: 0.75rem;">หน้า 1/3 (ใบลงเวลางาน)</span>
                    </div>
                    <div class="d-flex flex-column flex-md-row align-items-center justify-content-center justify-content-md-end gap-3 w-100 w-md-auto">
                        <div class="d-flex align-items-center justify-content-center gap-2">
                            <div class="d-flex align-items-center gap-1">
                                <label for="fuelQtyInput" class="small fw-bold text-muted text-nowrap m-0" style="font-size: 0.8rem;">จำนวนใบเบิกน้ำมัน:</label>
                                <input type="number" id="fuelQtyInput" class="form-control form-control-sm text-center fw-bold" value="1" min="1" placeholder="1" style="width: 70px; border-color: #dc3545;">
                            </div>
                            <div class="btn-group shadow-sm">
                                <button id="btnPrevPage" class="btn btn-outline-secondary btn-sm fw-bold px-2" disabled><i class="fa-solid fa-chevron-left"></i></button>
                                <button id="btnNextPage" class="btn btn-outline-secondary btn-sm fw-bold px-2"><i class="fa-solid fa-chevron-right"></i></button>
                            </div>
                        </div>
                        <button id="btnDownloadCombined" class="btn btn-primary btn-sm fw-bold px-4 shadow-sm text-nowrap mt-2 mt-md-0"><i class="fa-solid fa-download me-1"></i> Download PDF</button>
                    </div>
                </div>
            </div>
            
            <div id="monthlyPreviewContainer" class="w-100 border rounded shadow-sm bg-white position-relative" style="cursor: zoom-in;">
                <div id="monthlyPreviewOverlay" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 10; cursor: zoom-in;" title="คลิกเพื่อเปิดดูแบบเต็มจอพร้อมสั่งพิมพ์"></div>
                <div id="monthlyPreviewContent" class="w-100 h-100 preview-fade-transition" style="min-height: 500px;">
                    <iframe id="previewIframe" src="${pdfUrls[1]}#toolbar=0&scrollbar=0&view=Fit" width="100%" height="560px" style="border: none;"></iframe>
                </div>
            </div>

            <div class="modal fade" id="monthlyFullscreenModal" tabindex="-1" aria-hidden="true">
                <div class="modal-dialog modal-fullscreen">
                    <div class="modal-content bg-dark text-white border-0 rounded-0 d-flex flex-column" style="height: 100vh;">
                        <div class="modal-header border-secondary py-2 justify-content-between bg-dark rounded-0 flex-shrink-0">
                            <h5 class="modal-title fs-6 fw-normal text-light"><i class="fa-solid fa-file-pdf text-danger me-2"></i> ชุดเอกสารปริ้นประจำเดือน_รวม.pdf</h5>
                            <button type="button" class="btn-close btn-close-white shadow-none" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body p-0 bg-secondary flex-grow-1" style="overflow-y: auto; -webkit-overflow-scrolling: touch; height: calc(100vh - 45px);">
                            <div id="modalLoadingSpinner" class="d-flex flex-column justify-content-center align-items-center h-100 text-white gap-2">
                                <div class="spinner-border text-light" role="status"></div>
                                <div class="small">กำลังมัดรวมเอกสารทั้ง 3 หน้าเข้าด้วยกัน...</div>
                            </div>
                            <iframe id="monthlyModalPdfFrame" width="100%" height="100%" style="border: none; display: block;" class="d-none"></iframe>
                        </div>
                    </div>
                </div>
            </div>
        `;

        const btnPrev = document.getElementById('btnPrevPage');
        const btnNext = document.getElementById('btnNextPage');
        const pageIndicator = document.getElementById('pageIndicator');
        const previewContent = document.getElementById('monthlyPreviewContent');
        const fuelQtyInput = document.getElementById('fuelQtyInput');
        const btnDownloadCombined = document.getElementById('btnDownloadCombined');
        const previewOverlay = document.getElementById('monthlyPreviewOverlay');

        const pageNames = { 1: "ใบลงเวลางาน", 2: "ใบลงเวลาโอที", 3: "ใบเบิกค่าน้ำมัน" };

        function validateFuelQuantity() {
            const qty = fuelQtyInput.value.trim();
            if (!qty || parseInt(qty) <= 0) {
                showNotification("กรุณาระบุจำนวนใบของ PDF ใบเบิกค่าน้ำมันก่อนดำเนินการต่อครับ", 'error');
                fuelQtyInput.focus();
                fuelQtyInput.style.borderColor = "#dc3545";
                return false;
            }
            fuelQtyInput.style.borderColor = "#dee2e6";
            return true;
        }

        fuelQtyInput.addEventListener('input', function() {
            this.style.borderColor = (this.value.trim() && parseInt(this.value) > 0) ? "#28a745" : "#dc3545";
        });

        async function switchPreviewPage(page) {
            currentPage = page;
            btnPrev.disabled = (currentPage === 1);
            btnNext.disabled = (currentPage === 3);
            pageIndicator.textContent = `หน้า ${currentPage}/3 (${pageNames[currentPage]})`;

            previewContent.style.opacity = '0';
            setTimeout(async () => {
                const container = document.getElementById('monthlyPreviewContainer');

                if (currentPage === 1 || currentPage === 3) {
                    if (container) container.style.height = "560px";
                    previewContent.style.height = "560px";
                    previewContent.innerHTML = `<iframe src="${pdfUrls[currentPage]}#toolbar=0&scrollbar=0&view=Fit" width="100%" height="100%" style="border: none;"></iframe>`;
                } else if (currentPage === 2) {
                    const selectedMonth = parseInt(docMonthSelect?.value) || getCurrentOTMonth();
                    const otHtml = await buildOTHtmlContent(selectedMonth);
                    previewContent.innerHTML = `
                        <div id="otInnerPreview" class="bg-white p-3" style="width: 1060px; transform-origin: top left; position: absolute; top: 0; left: 0;">
                            ${otHtml} 
                        </div>
                    `;
                    setTimeout(() => {
                        const paper = document.getElementById('otInnerPreview');
                        if (paper && container) {
                            const scale = container.clientWidth / 1060;
                            paper.style.transform = `scale(${scale})`;
                            const adjustedHeight = paper.clientHeight * scale;
                            previewContent.style.height = adjustedHeight + 'px';
                            container.style.height = adjustedHeight + 'px';
                        }
                    }, 20);
                }
                previewContent.style.opacity = '1';
            }, 180);
        }

        btnPrev.addEventListener('click', (e) => { e.stopPropagation(); switchPreviewPage(currentPage - 1); });
        btnNext.addEventListener('click', (e) => { e.stopPropagation(); switchPreviewPage(currentPage + 1); });

        previewOverlay.addEventListener('click', () => { if (validateFuelQuantity()) window.openMonthlyCombinedModal(); });
        btnDownloadCombined.addEventListener('click', () => { if (validateFuelQuantity()) window.downloadCombinedMonthlyPDF(); });

        window.generateCombinedPDFBlob = async function(callback) {
            try {
                const [timesheetBytes, fuelBytes] = await Promise.all([
                    fetch(pdfUrls[1]).then(res => res.arrayBuffer()),
                    fetch(pdfUrls[3]).then(res => res.arrayBuffer())
                ]);

                const selectedMonth = parseInt(docMonthSelect?.value) || getCurrentOTMonth();
                const otHtmlContent = await buildOTHtmlContent(selectedMonth);
                const otElement = document.createElement('div');
                otElement.style.width = '1060px'; otElement.style.background = '#fff';
                otElement.style.padding = '0px';
                otElement.innerHTML = `
                    <style>
                        .excel-table { width: 100% !important; border-collapse: collapse !important; font-family: 'Segoe UI', sans-serif !important; font-size: 8.5px !important; table-layout: fixed !important; margin-bottom: 2px !important; }
                        .excel-table th, .excel-table td { border: 1px solid #000 !important; color: #000 !important; padding: 1px 1.5px !important; line-height: 1.05 !important; height: 13.5px !important; }
                        .excel-table th { background-color: #f2f2f2 !important; font-weight: bold; text-align: center; }
                        .text-center { text-align: center !important; }
                        .excel-table tfoot td { padding-top: 2px !important; padding-bottom: 0px !important; }
                    </style>
                    <div style="width: 100%;">${otHtmlContent}</div>
                `;
                const cols = otElement.querySelectorAll('colgroup col');
                const widths = [65, 80, 25, 25, 130, 125, 60, 60, 35, 35, 30, 40, 40, 65, 70, 40];
                cols.forEach((col, idx) => { if(widths[idx]) col.style.width = widths[idx] + 'px'; });

                const options = {
                    margin: [3, 5, 3, 5], image: { type: 'jpeg', quality: 0.98 },
                    html2canvas: { scale: 2, useCORS: true, logging: false, width: 1060 },
                    jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' },
                    pagebreak: { mode: 'avoid' }
                };

                const otPdfBlob = await html2pdf().set(options).from(otElement).outputPdf('blob');
                const otBytes = await otPdfBlob.arrayBuffer();

                const mergedPdf = await PDFLib.PDFDocument.create();
                const pdf1 = await PDFLib.PDFDocument.load(timesheetBytes);
                const pdf2 = await PDFLib.PDFDocument.load(otBytes);
                const pdf3 = await PDFLib.PDFDocument.load(fuelBytes);

                const pages1 = await mergedPdf.copyPages(pdf1, pdf1.getPageIndices());
                pages1.forEach(page => mergedPdf.addPage(page));

                const pages2 = await mergedPdf.copyPages(pdf2, pdf2.getPageIndices());
                pages2.forEach(page => mergedPdf.addPage(page));

                const repeatCount = parseInt(fuelQtyInput.value) || 1;
                const pdf3PageIndices = pdf3.getPageIndices();
                for (let i = 0; i < repeatCount; i++) {
                    const pages3 = await mergedPdf.copyPages(pdf3, pdf3PageIndices);
                    pages3.forEach(page => mergedPdf.addPage(page));
                }

                const mergedPdfBytes = await mergedPdf.save();
                callback(new Blob([mergedPdfBytes], { type: 'application/pdf' }));
            } catch (error) {
                console.error("เกิดข้อผิดพลาดในการรวมไฟล์ PDF:", error);
                showNotification("ระบบไม่สามารถมัดรวมไฟล์ได้ กรุณาตรวจสอบโฟลเดอร์ทรัพยากรระบบต้นทางครับ", 'error');
            }
        };

        window.openMonthlyCombinedModal = function() {
            const myModal = new bootstrap.Modal(document.getElementById('monthlyFullscreenModal'));
            myModal.show();
            const spinner = document.getElementById('modalLoadingSpinner');
            const iframe = document.getElementById('monthlyModalPdfFrame');
            
            if (iframe) iframe.classList.add('d-none');
            if (spinner) spinner.classList.remove('d-none');

            window.generateCombinedPDFBlob((blob) => {
                const blobUrl = URL.createObjectURL(blob);
                if(iframe) {
                    iframe.src = `${blobUrl}#toolbar=1&view=FitH`;
                    spinner.classList.add('d-none');
                    iframe.classList.remove('d-none');
                }
            });
        };

        window.downloadCombinedMonthlyPDF = function() {
            window.generateCombinedPDFBlob((blob) => {
                const link = document.createElement('a');
                link.href = URL.createObjectURL(blob);
                link.download = `ชุดเอกสารปริ้นประจำเดือน_รวม.pdf`;
                link.click();
            });
        };
    }

    function renderEmptyState() {
        docRenderArea.classList.remove('align-items-start', 'text-start', 'overflow-auto');
        docRenderArea.classList.add('justify-content-center', 'align-items-center', 'text-center');
        docRenderArea.innerHTML = `
            <div class="d-inline-block bg-primary bg-opacity-10 text-primary rounded-circle p-4 mb-3" style="width: 100px; height: 100px; display: flex !important; justify-content: center; align-items: center;">
                <i class="fa-solid fa-file fs-1"></i>
            </div>
            <h4 class="h5 fw-bold text-dark">Document Center</h4>
            <p class="text-muted small mb-0">Please select a form type from the top menu to preview and download your documents.</p>
        `;
    }
}

// ------------------------------------------
// 📊 Report View Table & Detail Modal
// ------------------------------------------
async function renderReportTable() {
    const tableReportContainer = document.getElementById('tableReport') || document.getElementById('reportTableContainer');
    if (!tableReportContainer) return;

    tableReportContainer.innerHTML = `
        <div class="text-center py-5 text-muted">
            <div class="spinner-border spinner-border-sm text-primary mb-2" role="status"></div>
            <div class="small">กำลังประมวลผลรายงานสรุปประจำปี...</div>
        </div>
    `;

    try {
        const currentYear = new Date().getFullYear();
        const thFullMonths = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'];
        const thShortMonths = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];

        let allRecords = [];
        if (typeof otService !== 'undefined') {
            if (typeof otService.getAllRecords === 'function') {
                const response = await otService.getAllRecords().catch(() => ({ success: false, data: [] }));
                allRecords = (response && response.success && Array.isArray(response.data)) ? response.data : [];
            } else if (typeof otService.getRecordsByMonth === 'function') {
                const monthPromises = Array.from({ length: 12 }, (_, i) => 
                    otService.getRecordsByMonth(i + 1).catch(() => ({ success: false, data: [] }))
                );
                const results = await Promise.all(monthPromises);
                results.forEach(res => {
                    if (res && res.success && Array.isArray(res.data)) {
                        allRecords.push(...res.data);
                    }
                });
            }
        }

        let totalYearOt15H = 0, totalYearOt15B = 0;
        let totalYearOt30H = 0, totalYearOt30B = 0;
        let totalYearMeal = 0;
        let totalYearHours = 0, totalYearAmount = 0;

        let tableHTML = `
        <style>
            .custom-border-table th, 
            .custom-border-table td { 
                border-right: 1px solid #dee2e6 !important;
                border-bottom: 1px solid #dee2e6 !important;
            }
        </style>
        <div class="table-responsive w-100">
            <table class="table table-hover table-striped align-middle text-center mb-0 w-100 border custom-border-table">
                <thead class="table-light text-muted small align-middle">
                    <tr>
                        <th rowspan="2" class="text-center align-middle text-nowrap px-2" style="width: 15%;">เดือน</th>
                        <th rowspan="2" class="text-center align-middle d-none d-lg-table-cell">รอบเงินออก</th>
                        <th rowspan="2" class="text-center align-middle text-nowrap px-2" style="width: 20%;">เงินออกวันที่</th>
                        <th colspan="2" class="border-bottom d-none d-lg-table-cell text-center bg-light">OT 1.5</th>
                        <th colspan="2" class="border-bottom d-none d-lg-table-cell text-center bg-light">OT 3.0</th>
                        <th rowspan="2" class="text-center d-none d-lg-table-cell align-middle text-nowrap" style="min-width: 70px;">ค่าข้าว</th>
                        <th colspan="2" class="border-bottom text-center">รวม</th>
                        <th rowspan="2" class="text-center px-1 align-middle" style="width: 35px;">Action</th>
                    </tr>
                    <tr>
                        <th class="d-none d-lg-table-cell text-center">ชม.</th>
                        <th class="d-none d-lg-table-cell text-center">บาท</th>
                        <th class="d-none d-lg-table-cell text-center">ชม.</th>
                        <th class="d-none d-lg-table-cell text-center">บาท</th>
                        <th class="text-center text-nowrap" style="min-width: 55px;">ชม.</th>
                        <th class="text-center text-nowrap" style="min-width: 90px;">บาท</th>
                    </tr>
                </thead>
                <tbody class="small">
        `;

        for (let m = 1; m <= 12; m++) {
            let prevM = m - 1;
            let prevY = currentYear;
            if (prevM === 0) { prevM = 12; prevY--; }

            const roundText = `21 ${thShortMonths[prevM - 1]} - 20 ${thShortMonths[m - 1]}`;
            const payDateText = typeof getPaymentDateText === 'function' ? getPaymentDateText(currentYear, m) : `${m} ${thFullMonths[m-1]}`;

            const monthItems = allRecords.filter(item => {
                if (!item) return false;
                const itemMonth = item.month_round ? parseInt(item.month_round) : (item.date ? new Date(item.date).getMonth() + 1 : 0);
                return itemMonth === m;
            });

            let ot15h = 0, ot15b = 0;
            let ot30h = 0, ot30b = 0;
            let monthMeal = 0;
            let monthHours = 0, monthAmount = 0;

            monthItems.forEach(item => {
                ot15h += parseFloat(item.ot_1_5_hours) || 0;
                ot15b += parseFloat(item.ot_1_5_amount) || 0;
                ot30h += parseFloat(item.ot_3_0_hours) || 0;
                ot30b += parseFloat(item.ot_3_0_amount) || 0;
                monthMeal += parseFloat(item.meal_amount) || 0;
                monthHours += parseFloat(item.total_hours) || 0;
                monthAmount += parseFloat(item.total_amount) || 0;
            });

            totalYearOt15H += ot15h; totalYearOt15B += ot15b;
            totalYearOt30H += ot30h; totalYearOt30B += ot30b;
            totalYearMeal += monthMeal;
            totalYearHours += monthHours; totalYearAmount += monthAmount;

            const hasData = monthHours > 0;
            const textStyle = 'font-size: 0.8rem;';
            const btnClass = hasData ? 'btn-warning text-white border-0 shadow-sm' : 'btn-outline-primary';

            const ot15HDisplay = ot15h > 0 ? `<span class="text-dark fw-bold" style="${textStyle}">${ot15h.toFixed(1)}</span>` : `<span class="text-muted">-</span>`;
            const ot15BDisplay = ot15b > 0 ? `<span class="text-success fw-bold" style="${textStyle}">${ot15b.toLocaleString('en-US', {minimumFractionDigits: 2})}</span>` : `<span class="text-muted">-</span>`;
            const ot30HDisplay = ot30h > 0 ? `<span class="text-dark fw-bold" style="${textStyle}">${ot30h.toFixed(1)}</span>` : `<span class="text-muted">-</span>`;
            const ot30BDisplay = ot30b > 0 ? `<span class="text-success fw-bold" style="${textStyle}">${ot30b.toLocaleString('en-US', {minimumFractionDigits: 2})}</span>` : `<span class="text-muted">-</span>`;
            const mealDisplay = monthMeal > 0 ? `<span class="text-primary fw-bold text-nowrap" style="${textStyle}">${monthMeal.toLocaleString('en-US')}</span>` : `<span class="text-muted">-</span>`;
            const hoursDisplay = hasData ? `<span class="text-warning fw-bold text-nowrap" style="${textStyle}">${monthHours.toFixed(1)}</span>` : `<span class="text-muted">-</span>`;
            const amountDisplay = hasData ? `<span class="text-success fw-bold text-nowrap" style="${textStyle}">${monthAmount.toLocaleString('en-US', {minimumFractionDigits: 2})}</span>` : `<span class="text-muted">-</span>`;

            tableHTML += `
                <tr>
                    <td class="text-center fw-bold text-nowrap text-dark px-1" style="font-size: 0.8rem;">${thShortMonths[m - 1]}</td>
                    <td class="text-muted extra-small d-none d-lg-table-cell">${roundText}</td>
                    <td class="text-muted text-nowrap px-1"><span class="text-primary fw-bold" style="font-size: 0.8rem;">${payDateText}</span></td>
                    <td class="text-muted d-none d-lg-table-cell">${ot15HDisplay}</td>
                    <td class="text-muted d-none d-lg-table-cell">${ot15BDisplay}</td>
                    <td class="text-muted d-none d-lg-table-cell">${ot30HDisplay}</td>
                    <td class="text-muted d-none d-lg-table-cell">${ot30BDisplay}</td>
                    <td class="text-muted d-none d-lg-table-cell text-nowrap px-1">${mealDisplay}</td>
                    <td class="text-muted text-nowrap px-1">${hoursDisplay}</td>
                    <td class="text-muted text-nowrap px-1">${amountDisplay}</td>
                    <td class="text-center px-1">
                        <button type="button" class="btn ${btnClass} btn-sm rounded-circle btn-view-report-detail" 
                                data-month="${m}" 
                                data-month-name="${thFullMonths[m - 1]}"
                                style="width: 26px; height: 26px; padding: 0;" 
                                title="ดูรายละเอียด">
                            <i class="fa-solid fa-eye" style="font-size: 0.7rem; pointer-events: none; position: relative; top: -1px;"></i>
                        </button>
                    </td>
                </tr>
            `;
        }

        tableHTML += `
            </tbody>
        </table>
        </div>`;

        tableReportContainer.innerHTML = tableHTML;

        // 🟢 อัปเดตยอดรวมทั้งปีขึ้นการ์ดสรุปด้านบนสุดของหน้า Report
        const reportYearHoursEl = document.getElementById('reportYearTotalHours');
        if (reportYearHoursEl) {
            reportYearHoursEl.innerHTML = `${totalYearHours.toFixed(1)} <span class="fs-6 text-muted fw-normal">Hrs</span>`;
        }

        const reportYearAmountEl = document.getElementById('reportYearTotalAmount');
        if (reportYearAmountEl) {
            const formattedTotalAmount = totalYearAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
            reportYearAmountEl.setAttribute('data-value', formattedTotalAmount);

            // เช็กสถานะไอคอนตา เพื่อแสดงผล (ซ่อนเป็น XX,XXX.XX หรือ แสดงเลขจริง)
            const eyeIcon = document.getElementById('reportEyeIcon');
            if (eyeIcon && eyeIcon.classList.contains('fa-eye-slash')) {
                reportYearAmountEl.textContent = formattedTotalAmount;
            } else {
                reportYearAmountEl.textContent = 'XX.XX';
            }
        }

        tableReportContainer.onclick = function(e) {
            const btn = e.target.closest('.btn-view-report-detail');
            if (btn) {
                e.preventDefault();
                const m = parseInt(btn.getAttribute('data-month'));
                const mName = btn.getAttribute('data-month-name');
                if (typeof openReportDetailModal === 'function') {
                    openReportDetailModal(m, mName, allRecords);
                }
            }
        };

    } catch (error) {
        console.error("Render Report Table Error:", error);
        tableReportContainer.innerHTML = `
            <div class="text-center text-danger py-4 small">
                เกิดข้อผิดพลาดในการโหลดรายงาน: ${error.message}
            </div>
        `;
    }
}

function openReportDetailModal(monthRound, monthName, allRecords = []) {
    const modalEl = document.getElementById('reportDetailModal');
    if (!modalEl) return;

    const currentYear = new Date().getFullYear();
    const thShortMonths = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];

    let prevM = monthRound - 1;
    let prevY = currentYear;
    if (prevM === 0) { prevM = 12; prevY--; }
    const roundText = `21 ${thShortMonths[prevM - 1]} - 20 ${thShortMonths[monthRound - 1]}`;

    const payDateText = typeof getPaymentDateText === 'function' ? getPaymentDateText(currentYear, monthRound) : `${monthRound}`;

    const monthItems = allRecords.filter(item => item && parseInt(item.month_round) === monthRound);

    let sumOt15H = 0, sumOt15B = 0;
    let sumOt30H = 0, sumOt30B = 0;
    let sumMealCount = 0, sumMealAmount = 0;
    let sumTotalAmount = 0;

    monthItems.forEach(item => {
        sumOt15H += parseFloat(item.ot_1_5_hours) || 0;
        sumOt15B += parseFloat(item.ot_1_5_amount) || 0;
        sumOt30H += parseFloat(item.ot_3_0_hours) || 0;
        sumOt30B += parseFloat(item.ot_3_0_amount) || 0;
        sumMealCount += parseInt(item.meal_count) || 0;
        sumMealAmount += parseFloat(item.meal_amount) || 0;
        sumTotalAmount += parseFloat(item.total_amount) || 0;
    });

    const monthTitle = document.getElementById('modalMonthTitle');
    const payDateEl = document.getElementById('modalPayDateText');
    const totalSummaryEl = document.getElementById('modalTotalSummaryText');
    const ot15H = document.getElementById('modalOt15HoursText');
    const ot15B = document.getElementById('modalOt15AmountText');
    const ot30H = document.getElementById('modalOt30HoursText');
    const ot30B = document.getElementById('modalOt30AmountText');
    const mealCount = document.getElementById('modalMealCountText');
    const mealAmount = document.getElementById('modalMealAmountText');

    if (monthTitle) monthTitle.innerHTML = `<i class="fa-solid fa-calendar-check me-2 text-warning"></i> ประจำเดือน${monthName}`;
    if (payDateEl) payDateEl.textContent = `${payDateText} ${currentYear + 543}`;
    if (totalSummaryEl) totalSummaryEl.textContent = `${sumTotalAmount.toLocaleString('en-US', {minimumFractionDigits: 2})} ฿`;

    if (ot15H) ot15H.textContent = `${sumOt15H.toFixed(1)} ชั่วโมง`;
    if (ot15B) ot15B.textContent = `${sumOt15B.toLocaleString('en-US', {minimumFractionDigits: 2})} ฿`;

    if (ot30H) ot30H.textContent = `${sumOt30H.toFixed(1)} ชั่วโมง`;
    if (ot30B) ot30B.textContent = `${sumOt30B.toLocaleString('en-US', {minimumFractionDigits: 2})} ฿`;

    if (mealCount) mealCount.textContent = `${sumMealCount} มื้อ`;
    if (mealAmount) mealAmount.textContent = `${sumMealAmount.toLocaleString('en-US', {minimumFractionDigits: 2})} ฿`;

    const btnGoToOTMonth = document.getElementById('btnGoToOTMonth');
    if (btnGoToOTMonth) {
        btnGoToOTMonth.onclick = function() {
            const modalInstance = bootstrap.Modal.getInstance(modalEl);
            if (modalInstance) modalInstance.hide();

            window.location.hash = '#ot';

            const monthSelector = document.getElementById('monthSelector');
            if (monthSelector) {
                monthSelector.value = monthRound;
            }

            if (typeof renderOTTable === 'function') {
                renderOTTable(monthRound);
            }
        };
    }

    const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
    modal.show();
}

async function renderFeedbackReportTable() {
    const tbody = document.getElementById('feedbackReportTbody');
    if (!tbody) return;

    if (typeof feedbackService === 'undefined' || typeof feedbackService.getAllFeedbacks !== 'function') return;

    const res = await feedbackService.getAllFeedbacks();
    const list = res.success ? res.data : [];

    if (list.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" class="text-center text-muted py-3">ยังไม่มีรายการข้อเสนอแนะในระบบ</td></tr>`;
        return;
    }

    const typeBadge = {
        'bug': '<span class="badge bg-danger bg-opacity-10 text-danger border border-danger border-opacity-25">Bug / ปัญหา</span>',
        'feature': '<span class="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25">Feature ใหม่</span>',
        'other': '<span class="badge bg-secondary bg-opacity-10 text-secondary border border-secondary border-opacity-25">อื่นๆ</span>'
    };

    let html = '';
    list.forEach(item => {
        let dateText = '-';
        if (item.created_at) {
            const dateObj = item.created_at.toDate ? item.created_at.toDate() : new Date(item.created_at);
            dateText = dateObj.toLocaleDateString('th-TH', { day: '2-digit', month: 'short', year: '2-digit', hour: '2-digit', minute: '2-digit' });
        }

        const hasImage = !!item.image_url;
        const imageBtn = hasImage ? `
            <button class="btn btn-sm btn-outline-primary py-0 px-2 btn-view-image" data-img="${item.image_url}" style="font-size: 0.75rem;">
                <i class="fa-solid fa-image me-1"></i> ดูรูป
            </button>
        ` : `<span class="text-muted small">-</span>`;

        html += `
            <tr>
                <td class="text-center text-muted" style="font-size: 0.8rem;">${dateText}</td>
                <td class="text-center">${typeBadge[item.type] || typeBadge['other']}</td>
                <td class="text-start">${item.message || '-'}</td>
                <td class="text-center"><span class="badge bg-warning text-dark fw-normal">Pending</span></td>
                <td class="text-center">${imageBtn}</td>
            </tr>
        `;
    });

    tbody.innerHTML = html;

    tbody.querySelectorAll('.btn-view-image').forEach(btn => {
        btn.addEventListener('click', function() {
            const imgUrl = this.getAttribute('data-img');
            const previewImg = document.getElementById('previewImageSrc');
            const modalEl = document.getElementById('imagePreviewModal');

            if (previewImg && modalEl) {
                previewImg.src = imgUrl;
                const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
                modal.show();
            }
        });
    });
}

function initReportView() {
    renderReportTable();
    renderFeedbackReportTable();
}

// ------------------------------------------
// 💬 Feedback System
// ------------------------------------------
function initFeedbackSystem() {
    const btnOpenFeedback = document.getElementById('btnOpenFeedback');
    const feedbackModalEl = document.getElementById('feedbackModal');

    if (btnOpenFeedback && feedbackModalEl) {
        btnOpenFeedback.addEventListener('click', (e) => {
            e.preventDefault();
            const form = feedbackModalEl.querySelector('form');
            if (form) form.reset();
            
            const modal = bootstrap.Modal.getOrCreateInstance(feedbackModalEl);
            modal.show();
        });
    }
}

document.addEventListener('submit', async (e) => {
    const targetForm = e.target;

    if (targetForm && (targetForm.id === 'feedbackForm' || targetForm.closest('#feedbackModal'))) {
        e.preventDefault();
        e.stopImmediatePropagation();

        const textareaEl = targetForm.querySelector('textarea');
        const selectEl = targetForm.querySelector('select');
        const fileInputEl = targetForm.querySelector('input[type="file"]');
        const submitBtn = targetForm.querySelector('button[type="submit"]');

        const messageText = textareaEl ? textareaEl.value.trim() : '';
        const typeText = selectEl ? selectEl.value : 'other';
        const file = fileInputEl && fileInputEl.files ? fileInputEl.files[0] : null;

        if (!messageText) {
            //alert("กรุณากรอกรายละเอียดข้อเสนอแนะด้วย");
            showNotification("กรุณากรอกรายละเอียดข้อเสนอแนะด้วย", 'error');
            if (textareaEl) textareaEl.focus();
            return;
        }

        const originalBtnHTML = submitBtn ? submitBtn.innerHTML : '';
        if (submitBtn) submitBtn.disabled = true;

        try {
            if (typeof feedbackService === 'undefined') {
                throw new Error("ไม่พบตัวแปร feedbackService! กรุณาเช็กไฟล์ index.html ว่าใส่ <script src='js/services/feedbackService.js'></script> แล้วหรือยัง");
            }

            let imageUrl = '';

            if (file) {
                if (submitBtn) submitBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin me-1"></i> กำลังแปลงรูปภาพ...`;
                if (typeof feedbackService.fileToBase64 === 'function') {
                    imageUrl = await feedbackService.fileToBase64(file);
                }
            }

            if (submitBtn) submitBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin me-1"></i> กำลังส่งข้อมูล...`;

            const feedbackData = {
                type: typeText,
                message: messageText,
                image_url: imageUrl,
                user_name: 'Saowalak Phuttharaksa'
            };

            const result = await feedbackService.addFeedback(feedbackData);

            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnHTML;
            }

            if (result && result.success) {
                targetForm.reset();

                if (submitBtn) submitBtn.blur();
                if (document.activeElement) document.activeElement.blur();

                const feedbackModalEl = document.getElementById('feedbackModal');
                if (feedbackModalEl) {
                    const modal = bootstrap.Modal.getInstance(feedbackModalEl);
                    if (modal) modal.hide();
                }

                //alert("ขอบคุณสำหรับข้อเสนอแนะ! บันทึกข้อมูลเรียบร้อยแล้ว");
                showNotification("ขอบคุณสำหรับข้อเสนอแนะ! บันทึกข้อมูลเรียบร้อยแล้ว", 'success');
            } else {
                //alert("เกิดข้อผิดพลาดจาก Firestore: " + (result?.error || "ไม่ทราบสาเหตุ"));
                showNotification("เกิดข้อผิดพลาดจาก Firestore: " + (result?.error || "ไม่ทราบสาเหตุ"), 'error');
            }

        } catch (error) {
            console.error("❌ Error in Feedback Submit:", error);
            alert("เกิดข้อผิดพลาด: " + error.message);

            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnHTML;
            }
        }
    }
}, true);


// ==========================================
// 🔔 Helper: Universal Popup Notification (Modal Style)
// ==========================================
function showNotification(message, type = 'success') {
    // 1. ลบ Modal เก่าออกก่อนถ้ามีค้างอยู่ใน DOM
    const oldModal = document.getElementById('customNotificationModal');
    if (oldModal) {
        const bsOldModal = bootstrap.Modal.getInstance(oldModal);
        if (bsOldModal) bsOldModal.dispose();
        oldModal.remove();
    }

    // 2. กำหนดธีมสี/ไอคอน/ข้อความหัวข้อตามประเภท (success / error)
    const isSuccess = type === 'success';
    const colorClass = isSuccess ? 'text-success' : 'text-danger';
    const bgIconClass = isSuccess ? 'bg-success' : 'bg-danger';
    const iconClass = isSuccess ? 'fa-circle-check' : 'fa-circle-exclamation';
    const titleText = isSuccess ? 'ดำเนินการสำเร็จ' : 'แจ้งเตือน / ข้อผิดพลาด';
    const btnClass = isSuccess ? 'btn-success' : 'btn-danger';

    // 3. สร้าง HTML ของ Modal Popup ตรงกลางจอ
    const modalHTML = `
        <div class="modal fade" id="customNotificationModal" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered modal-sm">
                <div class="modal-content border-0 shadow-lg rounded-4 text-center overflow-hidden">
                    <div class="modal-body p-4">
                        <div class="d-inline-block ${bgIconClass} bg-opacity-10 ${colorClass} rounded-circle p-3 mb-3">
                            <i class="fa-solid ${iconClass} fs-1"></i>
                        </div>
                        <h6 class="fw-bold text-dark mb-2">${titleText}</h6>
                        <p class="text-muted small mb-0">${message}</p>
                    </div>
                    <div class="modal-footer bg-light p-2 border-0 justify-content-center">
                        <button type="button" class="btn ${btnClass} btn-sm px-4 fw-bold rounded-pill shadow-sm" data-bs-dismiss="modal">ตกลง</button>
                    </div>
                </div>
            </div>
        </div>
    `;

    // 4. พ่น HTML ลงใน <body> และสั่งเปิด Modal
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    const modalEl = document.getElementById('customNotificationModal');
    const bsModal = new bootstrap.Modal(modalEl);

    // ลบ Element ออกจากระบบทันทีหลังจากผู้ใช้กดปิด Modal
    modalEl.addEventListener('hidden.bs.modal', () => {
        modalEl.remove();
    });

    bsModal.show();
}
// ==========================================
// ❓ Helper: Custom Confirmation Modal (แทนที่ confirm())
// ==========================================
function showConfirmModal(message, onConfirm, onCancel) {
    const oldModal = document.getElementById('customConfirmModal');
    if (oldModal) oldModal.remove();

    const modalHTML = `
        <div class="modal fade" id="customConfirmModal" tabindex="-1" aria-hidden="true" data-bs-backdrop="static">
            <div class="modal-dialog modal-dialog-centered modal-sm">
                <div class="modal-content border-0 shadow-lg rounded-4 overflow-hidden text-center">
                    <div class="modal-body p-4">
                        <div class="d-inline-block bg-danger bg-opacity-10 text-danger rounded-circle p-3 mb-3">
                            <i class="fa-solid fa-trash-can fs-2"></i>
                        </div>
                        <h6 class="fw-bold text-dark mb-2">ยืนยันการลบข้อมูล</h6>
                        <p class="text-muted small mb-0">${message}</p>
                    </div>
                    <div class="modal-footer bg-light p-2 border-0 justify-content-center gap-2">
                        <button type="button" class="btn btn-light btn-sm px-3 fw-bold border rounded-pill" id="btnCancelConfirm">ยกเลิก</button>
                        <button type="button" class="btn btn-danger btn-sm px-3 fw-bold rounded-pill shadow-sm" id="btnOkConfirm">ยืนยันลบ</button>
                    </div>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);

    const modalEl = document.getElementById('customConfirmModal');
    const bsModal = new bootstrap.Modal(modalEl);

    document.getElementById('btnOkConfirm').onclick = () => {
        bsModal.hide();
        if (typeof onConfirm === 'function') onConfirm();
        setTimeout(() => modalEl.remove(), 400);
    };

    document.getElementById('btnCancelConfirm').onclick = () => {
        bsModal.hide();
        if (typeof onCancel === 'function') onCancel();
        setTimeout(() => modalEl.remove(), 400);
    };

    bsModal.show();
}

// ==========================================
// 📅 คำนวณและแสดงผลวันเงินออกถัดไป (Next Pay)
// ==========================================

// Helper Function: หาวันเงินออก (วันทำงานสุดท้ายของเดือน)
function getPayDate(year, monthIndex) {
    // monthIndex: 0 = Jan, 11 = Dec (หรือถ้านับล้นไป 12 = Jan ปีถัดไป)
    let payDate = new Date(year, monthIndex + 1, 0); // วันสุดท้ายของเดือน
    const dayOfWeek = payDate.getDay();

    if (dayOfWeek === 0) {
        payDate.setDate(payDate.getDate() - 2); // ถ้าเป็นอาทิตย์ เลื่อนขึ้นเป็นศุกร์
    } else if (dayOfWeek === 6) {
        payDate.setDate(payDate.getDate() - 1); // ถ้าเป็นเสาร์ เลื่อนขึ้นเป็นศุกร์
    }

    payDate.setHours(0, 0, 0, 0);
    return payDate;
}

// ฟังก์ชันหลักสำหรับเรนเดอร์ Next Pay
function renderNextPay() {
    const daysEl = document.getElementById('nextPayDays');
    const dateEl = document.getElementById('nextPayDate');
    if (!daysEl && !dateEl) return;

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // 1. หาวันเงินออกของเดือนนี้ก่อน
    let payDate = getPayDate(today.getFullYear(), today.getMonth());

    // 2. ถ้าวันนี้เลยวันเงินออกของเดือนนี้ไปแล้ว ให้คิดวันเงินออกของเดือนถัดไป
    if (today > payDate) {
        payDate = getPayDate(today.getFullYear(), today.getMonth() + 1);
    }

    // 3. คำนวณจำนวนวันที่เหลือ
    const diffTime = payDate - today;
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

    // 4. จัดรูปแบบวันที่แสดงผล (ภาษาอังกฤษตามธีมหน้า Home)
    const monthsEng = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const formattedDate = `On ${monthsEng[payDate.getMonth()]} ${payDate.getDate()}, ${payDate.getFullYear()}`;

    // 5. พ่นข้อมูลลง UI
    if (daysEl) {
        if (diffDays === 0) {
            daysEl.textContent = 'Today!';
        } else if (diffDays === 1) {
            daysEl.textContent = 'In 1 day';
        } else {
            daysEl.textContent = `In ${diffDays} days`;
        }
    }

    if (dateEl) {
        dateEl.textContent = formattedDate;
    }
}