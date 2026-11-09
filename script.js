// URL Google Apps Script Web App Anda (Ganti setelah deploy Apps Script)
const API_URL = 'https://script.google.com/macros/s/AKfycbwahTiuEDDz_E2SfLiYnQsbSoN2aWDvyIJOZnyioA3XiE4xrhXuV5lG1274AFYBn9o2/exec'; 

// DOM Elements
const usulanInput = document.getElementById('usulan');
const verifikasiInput = document.getElementById('verifikasi');
const sisaInput = document.getElementById('sisa');
const diajukanKembaliInput = document.getElementById('diajukanKembali');
const hangusInput = document.getElementById('hangus');
const tableBody = document.getElementById('tableBody');
const form = document.getElementById('subsidyForm');

// Format Rupiah
const formatRp = (angka) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka);

// Auto-Calculate Logic
function calculateLogic() {
    const usulan = Number(usulanInput.value) || 0;
    const verifikasi = Number(verifikasiInput.value) || 0;
    
    // Hitung Sisa
    const sisa = usulan - verifikasi;
    sisaInput.value = sisa;

    // Reset Diajukan Kembali jika sisa berubah dan nilainya melebihi sisa
    let diajukan = Number(diajukanKembaliInput.value) || 0;
    if (diajukan > sisa) {
        diajukan = sisa;
        diajukanKembaliInput.value = diajukan;
    }

    // Hitung Hangus
    const hangus = sisa - diajukan;
    hangusInput.value = hangus;
}

// Event Listeners untuk Kalkulasi
[usulanInput, verifikasiInput, diajukanKembaliInput].forEach(input => {
    input.addEventListener('input', calculateLogic);
});

// Fetch Data JSON
async function loadData() {
    try {
        tableBody.innerHTML = '<tr><td colspan="5" class="p-4 text-center">Loading data...</td></tr>';
        
        // Uncomment baris di bawah jika API sudah siap, sementara pakai mock local
        // const response = await fetch(API_URL);
        // const data = await response.json();
        
        // MOCK DATA (Simulasi JSON dari backend)
        const data = await fetch('mock_data.json').then(res => res.json());
        renderTable(data);
    } catch (error) {
        console.error('Error fetching data:', error);
        tableBody.innerHTML = '<tr><td colspan="5" class="p-4 text-center text-red-500">Gagal memuat data</td></tr>';
    }
}

// Render Data ke Tabel
function renderTable(data) {
    tableBody.innerHTML = '';
    data.forEach(row => {
        let statusBadge = 'bg-gray-100 text-gray-700';
        if (row.tindak_lanjut === 'Selesai') statusBadge = 'bg-green-100 text-green-700';
        if (row.tindak_lanjut.includes('Sebagian')) statusBadge = 'bg-yellow-100 text-yellow-700';
        if (row.tindak_lanjut === 'Hangus') statusBadge = 'bg-red-100 text-red-700';

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="py-3 px-4">
                <div class="font-medium">${row.id_item}</div>
                <div class="text-xs text-gray-500">${row.periode}</div>
            </td>
            <td class="py-3 px-4">
                <div>${row.detail_poin}</div>
                <div class="text-xs text-gray-500 font-mono">${row.sumber}</div>
            </td>
            <td class="py-3 px-4 text-right font-medium">${formatRp(row.usulan)}</td>
            <td class="py-3 px-4 text-right font-medium text-blue-600">${formatRp(row.verifikasi)}</td>
            <td class="py-3 px-4 text-center">
                <span class="px-2 py-1 text-xs rounded-full ${statusBadge}">${row.tindak_lanjut}</span>
            </td>
        `;
        tableBody.appendChild(tr);
    });
}

// Handle Form Submit (Simulasi POST ke API)
form.addEventListener('submit', (e) => {
    e.preventDefault();
    alert('Logika POST ke Apps Script akan dieksekusi di sini.');
    // Integrasikan fetch(API_URL, { method: 'POST', body: JSON.stringify(...) }) di sini.
});

// Load awal
loadData();
