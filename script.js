// FORMATTER RUPIAH
const formatRp = (angka) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka);

// STATE DATA
let subsidyData = [];

// DOM ELEMENTS
const tableBody = document.getElementById('tableBody');
const searchInput = document.getElementById('searchInput');
const statusFilter = document.getElementById('statusFilter');

// DOM FORM ELEMENTS
const usulanInput = document.getElementById('usulan');
const verifikasiInput = document.getElementById('verifikasi');
const sisaInput = document.getElementById('sisa');
const diajukanKembaliInput = document.getElementById('diajukanKembali');
const hangusInput = document.getElementById('hangus');

// --- 1. LOGIKA AUTO-CALCULATE FORM ---
function calculateLogic() {
    const usulan = Number(usulanInput.value) || 0;
    const verifikasi = Number(verifikasiInput.value) || 0;
    
    const sisa = usulan - verifikasi;
    sisaInput.value = sisa < 0 ? 0 : sisa;

    let diajukan = Number(diajukanKembaliInput.value) || 0;
    if (diajukan > sisa) {
        diajukan = sisa;
        diajukanKembaliInput.value = diajukan;
    }

    const hangus = sisa - diajukan;
    hangusInput.value = hangus < 0 ? 0 : hangus;
}

[usulanInput, verifikasiInput, diajukanKembaliInput].forEach(input => {
    input.addEventListener('input', calculateLogic);
});

// --- 2. MODAL & TOAST CONTROL ---
function openModal() {
    const modal = document.getElementById('inputModal');
    const content = document.getElementById('modalContent');
    modal.classList.remove('hidden');
    // Animasi masuk
    setTimeout(() => {
        modal.classList.remove('opacity-0');
        content.classList.remove('scale-95');
    }, 10);
}

function closeModal() {
    const modal = document.getElementById('inputModal');
    const content = document.getElementById('modalContent');
    modal.classList.add('opacity-0');
    content.classList.add('scale-95');
    setTimeout(() => { modal.classList.add('hidden'); }, 300);
}

function showToast(message) {
    const toast = document.getElementById('toast');
    document.getElementById('toastMsg').innerText = message;
    toast.classList.remove('translate-y-20', 'opacity-0');
    setTimeout(() => {
        toast.classList.add('translate-y-20', 'opacity-0');
    }, 3000);
}

document.getElementById('subsidyForm').addEventListener('submit', (e) => {
    e.preventDefault();
    closeModal();
    showToast("Memproses pengiriman ke Google Sheets...");
    // TODO: Gunakan fetch() POST ke endpoint URL Apps Script Anda di sini.
});

// --- 3. FETCH & RENDER DATA ---
async function loadData() {
    tableBody.innerHTML = '<tr><td colspan="6" class="p-8 text-center text-gray-500"><i class="fa-solid fa-circle-notch fa-spin text-3xl mb-3 text-blue-500"></i><br>Menyinkronkan Database...</td></tr>';
    
    try {
        // Ganti URL 'mock_data.json' ini dengan URL Google Apps Script Anda (URL Web App)
        const response = await fetch('mock_data.json');
        subsidyData = await response.json();
        
        renderTable(subsidyData);
        updateDashboardCards(subsidyData);
        renderChart(subsidyData);
    } catch (error) {
        console.error(error);
        tableBody.innerHTML = '<tr><td colspan="6" class="p-8 text-center text-red-500 font-medium">Gagal memuat data dari server. Pastikan URL API benar.</td></tr>';
    }
}

function renderTable(data) {
    tableBody.innerHTML = '';
    if(data.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="6" class="p-8 text-center text-gray-500">Tidak ada data ditemukan.</td></tr>';
        return;
    }

    data.forEach(row => {
        let statusBadge = '';
        if (row.tindak_lanjut === 'Selesai') {
            statusBadge = '<span class="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold"><i class="fa-solid fa-check mr-1"></i>Selesai</span>';
        } else if (row.tindak_lanjut.includes('Sebagian')) {
            statusBadge = '<span class="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-bold"><i class="fa-solid fa-arrows-split-up-and-left mr-1"></i>Sebagian</span>';
        } else if (row.tindak_lanjut.includes('Penuh')) {
            statusBadge = '<span class="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-bold"><i class="fa-solid fa-forward mr-1"></i>Carry Over</span>';
        } else {
            statusBadge = '<span class="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold">Hangus</span>';
        }

        const tr = document.createElement('tr');
        tr.className = "hover:bg-slate-50 transition border-b border-gray-50";
        tr.innerHTML = `
            <td class="py-4 px-6">
                <div class="font-bold text-gray-800">${row.id_item}</div>
                <div class="text-xs text-gray-500 mt-1"><i class="fa-regular fa-calendar mr-1"></i>${row.periode}</div>
            </td>
            <td class="py-4 px-6">
                <div class="font-medium text-gray-800">${row.detail_poin}</div>
                <div class="text-xs text-blue-600 mt-1 font-semibold">${row.kategori}</div>
            </td>
            <td class="py-4 px-6 text-right font-mono text-gray-600">${formatRp(row.usulan)}</td>
            <td class="py-4 px-6 text-right font-mono font-bold text-emerald-600">${formatRp(row.verifikasi)}</td>
            <td class="py-4 px-6 text-center">${statusBadge}</td>
            <td class="py-4 px-6 text-center">
                <button class="text-gray-400 hover:text-blue-600 transition p-2 bg-white border border-gray-200 rounded-lg shadow-sm"><i class="fa-solid fa-ellipsis-vertical"></i></button>
            </td>
        `;
        tableBody.appendChild(tr);
    });
}

// --- 4. SEARCH & FILTER FITUR ---
function filterData() {
    const keyword = searchInput.value.toLowerCase();
    const status = statusFilter.value;

    const filtered = subsidyData.filter(row => {
        const matchKeyword = row.id_item.toLowerCase().includes(keyword) || row.detail_poin.toLowerCase().includes(keyword);
        const matchStatus = status === 'all' || row.tindak_lanjut.includes(status);
        return matchKeyword && matchStatus;
    });

    renderTable(filtered);
}

searchInput.addEventListener('input', filterData);
statusFilter.addEventListener('change', filterData);

// --- 5. DASHBOARD METRICS ---
function updateDashboardCards(data) {
    let totalUsulan = 0;
    let totalCair = 0;
    let totalSisa = 0;

    data.forEach(row => {
        totalUsulan += row.usulan;
        totalCair += row.verifikasi;
        totalSisa += row.sisa;
    });

    document.getElementById('kpi-usulan').innerText = formatRp(totalUsulan);
    document.getElementById('kpi-cair').innerText = formatRp(totalCair);
    document.getElementById('kpi-sisa').innerText = formatRp(totalSisa);
}

// --- 6. CHART.JS VISUALIZATION ---
let myChart = null;
function renderChart(data) {
    const ctx = document.getElementById('subsidyChart').getContext('2d');
    
    // Grouping data by Poin Biaya (Contoh sederhana untuk Chart)
    const labels = data.map(d => d.detail_poin);
    const dataUsulan = data.map(d => d.usulan);
    const dataCair = data.map(d => d.verifikasi);

    if(myChart) myChart.destroy(); // Cegah duplikasi chart

    myChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Nilai Usulan (Rp)',
                    data: dataUsulan,
                    backgroundColor: 'rgba(59, 130, 246, 0.8)', // Blue
                    borderRadius: 6
                },
                {
                    label: 'Nilai Cair (Rp)',
                    data: dataCair,
                    backgroundColor: 'rgba(16, 185, 129, 0.8)', // Emerald
                    borderRadius: 6
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'top' }
            },
            scales: {
                y: { beginAtZero: true }
            }
        }
    });
}

// Inisialisasi awal
loadData();
