// FORMATTER
const formatRp = (angka) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka);

// MOCK DATA TERSTRUKTUR (Hasil Analisis Agustus 2026)
// Di real-case, data ini ditarik dari Google Sheets (JSON)
const analisisData = [
    { poin: "Gaji Pramudi (Diesel)", usulan: 1540606803, verifikasi: 1436735340, tipe: "Hangus", catatan: "Presensi mesin & batas tukin" },
    { poin: "Suku Cadang (Diesel)", usulan: 588581867, verifikasi: 285020393, tipe: "Tangguh", catatan: "Penangguhan Juni-Juli" },
    { poin: "Perawatan AC (Diesel)", usulan: 328501064, verifikasi: 254532326, tipe: "Tangguh", catatan: "Penangguhan Juni-Agustus" },
    { poin: "Bagian Keuntungan 7%", usulan: 389557597, verifikasi: 353948709, tipe: "Hangus", catatan: "Koreksi mengikuti BOK" },
    { poin: "Pramugara/i", usulan: 1342890987, verifikasi: 1244293378, tipe: "Hangus", catatan: "Tukin & Mesin presensi" },
    { poin: "BBM (Diesel)", usulan: 1647479190, verifikasi: 1647479190, tipe: "Aman", catatan: "Full Cair" }
];

// STATE ANALYTICS
let totalUsulan = 7270551337; // Total Gabungan (Diesel + Listrik)
let totalCair = 6590746936;
let totalSelisih = totalUsulan - totalCair;
let totalTangguh = 396902276; // Sesuai analisis perhitungan
let totalHangus = totalSelisih - totalTangguh;

// 1. UPDATE KPI CARDS
document.getElementById('kpi-usulan').innerText = formatRp(totalUsulan);
document.getElementById('kpi-cair').innerText = formatRp(totalCair);
document.getElementById('kpi-tangguh').innerText = formatRp(totalTangguh);
document.getElementById('kpi-hangus').innerText = formatRp(totalHangus);

// 2. RENDER TABLE KOMPONEN TERKOREKSI
const tableBody = document.getElementById('tableBody');
analisisData.forEach(row => {
    let selisih = row.usulan - row.verifikasi;
    let statusBadge = '';
    
    if(row.tipe === "Tangguh") {
        statusBadge = '<span class="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-bold">Di-Tangguhkan (Carry Over)</span>';
    } else if (row.tipe === "Hangus") {
        statusBadge = '<span class="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold">Murni Hangus / Koreksi</span>';
    } else {
        statusBadge = '<span class="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold">Cair 100%</span>';
    }

    const tr = document.createElement('tr');
    tr.className = "hover:bg-slate-50 transition";
    tr.innerHTML = `
        <td class="py-3 px-6">
            <div class="font-bold text-gray-800">${row.poin}</div>
            <div class="text-xs text-gray-500">${row.catatan}</div>
        </td>
        <td class="py-3 px-6 text-right font-mono text-gray-600">${formatRp(row.usulan)}</td>
        <td class="py-3 px-6 text-right font-mono text-emerald-600 font-bold">${formatRp(row.verifikasi)}</td>
        <td class="py-3 px-6 text-right font-mono text-red-500 font-semibold">${formatRp(selisih)}</td>
        <td class="py-3 px-6 text-center">${statusBadge}</td>
    `;
    tableBody.appendChild(tr);
});

// 3. RENDER DOUGHNUT CHART (Anatomi Selisih)
const ctx = document.getElementById('selisihChart').getContext('2d');
new Chart(ctx, {
    type: 'doughnut',
    data: {
        labels: ['Murni Hangus (Koreksi Tetap)', 'Ditangguhkan (Carry Over)'],
        datasets: [{
            data: [totalHangus, totalTangguh],
            backgroundColor: [
                'rgba(239, 68, 68, 0.85)', // Red-500
                'rgba(249, 115, 22, 0.85)' // Orange-500
            ],
            borderWidth: 0,
            hoverOffset: 4
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '70%',
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    usePointStyle: true,
                    boxWidth: 8,
                    font: { size: 11, family: 'sans-serif' }
                }
            },
            tooltip: {
                callbacks: {
                    label: function(context) {
                        let label = context.label || '';
                        let value = context.raw || 0;
                        return `${label}: ${formatRp(value)}`;
                    }
                }
            }
        }
    }
});
