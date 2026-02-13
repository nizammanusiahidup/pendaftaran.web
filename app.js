// ==========================================
// Global State Management
// ==========================================
let students = [];
let editingStudentId = null;

// ==========================================
// Initialize Application
// ==========================================
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    // Load data from localStorage
    loadStudents();
    
    // Initialize theme
    initializeTheme();
    
    // Initialize clock
    initializeClock();
    
    // Initialize navigation
    initializeNavigation();
    
    // Initialize form
    initializeForm();
    
    // Initialize search
    initializeSearch();
    
    // Initialize settings
    initializeSettings();
    
    // Render dashboard
    renderDashboard();
    
    // Render data table
    renderStudentTable();
}

// ==========================================
// localStorage Management
// ==========================================
function loadStudents() {
    const savedData = localStorage.getItem('mam1_students');
    if (savedData) {
        students = JSON.parse(savedData);
    }
}

function saveStudents() {
    localStorage.setItem('mam1_students', JSON.stringify(students));
}

// ==========================================
// Theme Management
// ==========================================
function initializeTheme() {
    const savedTheme = localStorage.getItem('mam1_theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    
    const themeToggle = document.getElementById('themeToggle');
    const darkModeSwitch = document.getElementById('darkModeSwitch');
    
    if (savedTheme === 'dark') {
        themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
        darkModeSwitch.checked = true;
    }
    
    themeToggle.addEventListener('click', toggleTheme);
    darkModeSwitch.addEventListener('change', toggleTheme);
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('mam1_theme', newTheme);
    
    const themeToggle = document.getElementById('themeToggle');
    const darkModeSwitch = document.getElementById('darkModeSwitch');
    
    if (newTheme === 'dark') {
        themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
        darkModeSwitch.checked = true;
    } else {
        themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
        darkModeSwitch.checked = false;
    }
}

// ==========================================
// Real-time Clock
// ==========================================
function initializeClock() {
    updateClock();
    setInterval(updateClock, 1000);
}

function updateClock() {
    const clockElement = document.getElementById('clockTime');
    const now = new Date();
    
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    
    const dayName = days[now.getDay()];
    const day = String(now.getDate()).padStart(2, '0');
    const month = months[now.getMonth()];
    const year = now.getFullYear();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    
    const timeString = `${dayName}, ${day} ${month} ${year} - ${hours}:${minutes}:${seconds}`;
    clockElement.textContent = timeString;
}

// ==========================================
// Navigation Management
// ==========================================
function initializeNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    const menuToggle = document.getElementById('menuToggle');
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebar = document.getElementById('sidebar');
    
    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const pageName = this.getAttribute('data-page');
            navigateToPage(pageName);
            
            // Close sidebar on mobile
            if (window.innerWidth <= 1024) {
                sidebar.classList.remove('active');
            }
        });
    });
    
    menuToggle.addEventListener('click', function() {
        sidebar.classList.add('active');
    });
    
    sidebarToggle.addEventListener('click', function() {
        sidebar.classList.remove('active');
    });
    
    // Footer links
    const footerLinks = document.querySelectorAll('.footer-right a');
    footerLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const pageName = this.getAttribute('data-page');
            navigateToPage(pageName);
        });
    });
}

function navigateToPage(pageName) {
    // Hide all pages
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => page.classList.remove('active'));
    
    // Show selected page
    const selectedPage = document.getElementById(pageName + '-page');
    if (selectedPage) {
        selectedPage.classList.add('active');
    }
    
    // Update nav active state
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.classList.remove('active');
        if (item.getAttribute('data-page') === pageName) {
            item.classList.add('active');
        }
    });
    
    // Reset form if navigating to add student page
    if (pageName === 'tambah-siswa' && editingStudentId) {
        resetForm();
    }
}

// ==========================================
// Form Management with Flatpickr
// ==========================================
let flatpickrInstance;

function initializeForm() {
    const form = document.getElementById('studentForm');
    const resetBtn = document.getElementById('resetForm');
    
    // Initialize Flatpickr with Indonesian locale
    flatpickrInstance = flatpickr('#tanggalLahir', {
        dateFormat: 'd/m/Y',
        locale: 'id',
        maxDate: 'today',
        onChange: function(selectedDates) {
            if (selectedDates.length > 0) {
                calculateAge(selectedDates[0]);
            }
        }
    });
    
    form.addEventListener('submit', handleFormSubmit);
    resetBtn.addEventListener('click', resetForm);
}

function handleFormSubmit(e) {
    e.preventDefault();
    
    const formData = {
        id: editingStudentId || generateId(),
        namaSiswa: document.getElementById('namaSiswa').value.trim(),
        tempatLahir: document.getElementById('tempatLahir').value.trim(),
        tanggalLahir: document.getElementById('tanggalLahir').value,
        umur: document.getElementById('umur').value,
        kelas: document.getElementById('kelas').value,
        jurusan: document.getElementById('jurusan').value,
        alamat: document.getElementById('alamat').value.trim(),
        tanggalDaftar: editingStudentId ? 
            students.find(s => s.id === editingStudentId).tanggalDaftar : 
            new Date().toISOString()
    };
    
    if (editingStudentId) {
        // Update existing student
        const index = students.findIndex(s => s.id === editingStudentId);
        students[index] = formData;
        showToast('Data siswa berhasil diperbarui!', 'success');
    } else {
        // Add new student
        students.push(formData);
        showToast('Siswa baru berhasil ditambahkan!', 'success');
    }
    
    saveStudents();
    renderDashboard();
    renderStudentTable();
    resetForm();
    
    // Navigate to data siswa page
    navigateToPage('data-siswa');
}

function resetForm() {
    document.getElementById('studentForm').reset();
    document.getElementById('studentId').value = '';
    document.getElementById('umur').value = '';
    editingStudentId = null;
    
    // Update page title
    const pageHeader = document.querySelector('#tambah-siswa-page .page-header h1');
    pageHeader.innerHTML = '<i class="fas fa-user-plus"></i> Tambah Siswa Baru';
}

function generateId() {
    return 'STD' + Date.now() + Math.random().toString(36).substr(2, 9);
}

function calculateAge(birthDate) {
    const today = new Date();
    const birth = new Date(birthDate);
    
    let years = today.getFullYear() - birth.getFullYear();
    let months = today.getMonth() - birth.getMonth();
    let days = today.getDate() - birth.getDate();
    
    if (days < 0) {
        months--;
        const lastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
        days += lastMonth.getDate();
    }
    
    if (months < 0) {
        years--;
        months += 12;
    }
    
    const ageString = `${years} tahun ${months} bulan ${days} hari`;
    document.getElementById('umur').value = ageString;
}

// ==========================================
// Dashboard Rendering
// ==========================================
function renderDashboard() {
    // Total students
    document.getElementById('totalSiswa').textContent = students.length;
    
    // Students by class
    const kelasX = students.filter(s => s.kelas === 'X').length;
    const kelasXI = students.filter(s => s.kelas === 'XI').length;
    const kelasXII = students.filter(s => s.kelas === 'XII').length;
    
    document.getElementById('siswaKelasX').textContent = kelasX;
    document.getElementById('siswaKelasXI').textContent = kelasXI;
    document.getElementById('siswaKelasXII').textContent = kelasXII;
    
    // Students by jurusan
    renderJurusanStats();
}

function renderJurusanStats() {
    const jurusanContainer = document.getElementById('jurusanStats');
    
    if (students.length === 0) {
        jurusanContainer.innerHTML = '<p class="no-data">Belum ada data siswa</p>';
        return;
    }
    
    const jurusanCounts = {};
    students.forEach(student => {
        const jurusan = student.jurusan;
        jurusanCounts[jurusan] = (jurusanCounts[jurusan] || 0) + 1;
    });
    
    let html = '';
    for (const [jurusan, count] of Object.entries(jurusanCounts)) {
        html += `
            <div class="jurusan-item">
                <span class="jurusan-name">${jurusan}</span>
                <span class="jurusan-count">${count} siswa</span>
            </div>
        `;
    }
    
    jurusanContainer.innerHTML = html;
}

// ==========================================
// Student Table Rendering
// ==========================================
function renderStudentTable(data = null) {
    const tbody = document.getElementById('studentTableBody');
    const dataToRender = data || students;
    
    if (dataToRender.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="no-data">Belum ada data siswa</td></tr>';
        return;
    }
    
    let html = '';
    dataToRender.forEach((student, index) => {
        html += `
            <tr>
                <td>${index + 1}</td>
                <td>${student.namaSiswa}</td>
                <td>${student.tempatLahir}, ${student.tanggalLahir}</td>
                <td>${student.umur}</td>
                <td>${student.kelas}</td>
                <td>${student.jurusan}</td>
                <td>${student.alamat}</td>
                <td>
                    <div class="table-actions">
                        <button class="action-btn edit" onclick="editStudent('${student.id}')">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button class="action-btn pdf" onclick="generatePDF('${student.id}')">
                            <i class="fas fa-file-pdf"></i> PDF
                        </button>
                        <button class="action-btn delete" onclick="deleteStudent('${student.id}')">
                            <i class="fas fa-trash"></i> Hapus
                        </button>
                    </div>
                </td>
            </tr>
        `;
    });
    
    tbody.innerHTML = html;
}

// ==========================================
// CRUD Operations
// ==========================================
function editStudent(id) {
    const student = students.find(s => s.id === id);
    if (!student) return;
    
    editingStudentId = id;
    
    // Fill form
    document.getElementById('studentId').value = student.id;
    document.getElementById('namaSiswa').value = student.namaSiswa;
    document.getElementById('tempatLahir').value = student.tempatLahir;
    document.getElementById('tanggalLahir').value = student.tanggalLahir;
    document.getElementById('umur').value = student.umur;
    document.getElementById('kelas').value = student.kelas;
    document.getElementById('jurusan').value = student.jurusan;
    document.getElementById('alamat').value = student.alamat;
    
    // Update flatpickr
    if (flatpickrInstance) {
        flatpickrInstance.setDate(student.tanggalLahir, true, 'd/m/Y');
    }
    
    // Update page title
    const pageHeader = document.querySelector('#tambah-siswa-page .page-header h1');
    pageHeader.innerHTML = '<i class="fas fa-edit"></i> Edit Data Siswa';
    
    // Navigate to form
    navigateToPage('tambah-siswa');
    
    showToast('Mode edit - Ubah data dan simpan', 'success');
}

function deleteStudent(id) {
    if (!confirm('Apakah Anda yakin ingin menghapus data siswa ini?')) {
        return;
    }
    
    students = students.filter(s => s.id !== id);
    saveStudents();
    renderDashboard();
    renderStudentTable();
    
    showToast('Data siswa berhasil dihapus!', 'success');
}

// ==========================================
// Search Functionality
// ==========================================
function initializeSearch() {
    const searchInput = document.getElementById('searchInput');
    
    searchInput.addEventListener('input', function() {
        const query = this.value.toLowerCase().trim();
        
        if (query === '') {
            const tbody = document.getElementById('searchTableBody');
            tbody.innerHTML = '<tr><td colspan="8" class="no-data">Gunakan kolom pencarian di atas</td></tr>';
            return;
        }
        
        const results = students.filter(student => {
            return (
                student.namaSiswa.toLowerCase().includes(query) ||
                student.kelas.toLowerCase().includes(query) ||
                student.jurusan.toLowerCase().includes(query)
            );
        });
        
        renderSearchResults(results);
    });
}

function renderSearchResults(results) {
    const tbody = document.getElementById('searchTableBody');
    
    if (results.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="no-data">Tidak ada hasil yang ditemukan</td></tr>';
        return;
    }
    
    let html = '';
    results.forEach((student, index) => {
        html += `
            <tr>
                <td>${index + 1}</td>
                <td>${student.namaSiswa}</td>
                <td>${student.tempatLahir}, ${student.tanggalLahir}</td>
                <td>${student.umur}</td>
                <td>${student.kelas}</td>
                <td>${student.jurusan}</td>
                <td>${student.alamat}</td>
                <td>
                    <div class="table-actions">
                        <button class="action-btn edit" onclick="editStudent('${student.id}')">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button class="action-btn pdf" onclick="generatePDF('${student.id}')">
                            <i class="fas fa-file-pdf"></i> PDF
                        </button>
                        <button class="action-btn delete" onclick="deleteStudent('${student.id}')">
                            <i class="fas fa-trash"></i> Hapus
                        </button>
                    </div>
                </td>
            </tr>
        `;
    });
    
    tbody.innerHTML = html;
}

// ==========================================
// PDF Generation
// ==========================================
function generatePDF(id) {
    const student = students.find(s => s.id === id);
    if (!student) return;
    
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Registration number
    const regNumber = 'REG-' + student.id.slice(-8).toUpperCase();
    const regDate = new Date(student.tanggalDaftar);
    const regDateStr = regDate.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
    });
    
    // Header
    doc.setFillColor(45, 122, 79);
    doc.rect(0, 0, 210, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont(undefined, 'bold');
    doc.text('MAM 1 PACIRAN', 105, 15, { align: 'center' });
    
    doc.setFontSize(14);
    doc.setFont(undefined, 'normal');
    doc.text('Bukti Pendaftaran Siswa', 105, 25, { align: 'center' });
    
    doc.setFontSize(10);
    doc.text('Madrasah Aliyah Matholi\'ul Anwar 1 Paciran', 105, 33, { align: 'center' });
    
    // Registration Info Box
    doc.setTextColor(45, 122, 79);
    doc.setFillColor(240, 248, 242);
    doc.roundedRect(15, 50, 180, 25, 3, 3, 'FD');
    
    doc.setFontSize(11);
    doc.setFont(undefined, 'bold');
    doc.text('Nomor Pendaftaran:', 20, 60);
    doc.setFont(undefined, 'normal');
    doc.text(regNumber, 70, 60);
    
    doc.setFont(undefined, 'bold');
    doc.text('Tanggal Pendaftaran:', 20, 68);
    doc.setFont(undefined, 'normal');
    doc.text(regDateStr, 70, 68);
    
    // Student Data
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('DATA SISWA', 15, 90);
    
    doc.setDrawColor(45, 122, 79);
    doc.setLineWidth(0.5);
    doc.line(15, 92, 195, 92);
    
    let yPos = 105;
    const lineHeight = 10;
    
    doc.setFontSize(11);
    
    const fields = [
        { label: 'Nama Lengkap', value: student.namaSiswa },
        { label: 'Tempat Lahir', value: student.tempatLahir },
        { label: 'Tanggal Lahir', value: student.tanggalLahir },
        { label: 'Umur', value: student.umur },
        { label: 'Kelas', value: student.kelas },
        { label: 'Jurusan', value: student.jurusan },
        { label: 'Alamat', value: student.alamat }
    ];
    
    fields.forEach(field => {
        doc.setFont(undefined, 'bold');
        doc.text(field.label + ':', 20, yPos);
        doc.setFont(undefined, 'normal');
        doc.text(field.value, 70, yPos);
        yPos += lineHeight;
    });
    
    // Registration Fee
    yPos += 10;
    doc.setDrawColor(45, 122, 79);
    doc.line(15, yPos, 195, yPos);
    yPos += 10;
    
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text('Biaya Pendaftaran:', 20, yPos);
    doc.setTextColor(45, 122, 79);
    doc.text('Rp 500.000', 70, yPos);
    
    // Footer
    doc.setTextColor(100, 100, 100);
    doc.setFontSize(9);
    doc.setFont(undefined, 'italic');
    doc.text('Dokumen ini adalah bukti pendaftaran resmi MAM 1 Paciran', 105, 270, { align: 'center' });
    doc.text('Simpan dokumen ini sebagai bukti pendaftaran yang sah', 105, 275, { align: 'center' });
    
    doc.setFontSize(8);
    doc.text('Dicetak pada: ' + new Date().toLocaleString('id-ID'), 105, 285, { align: 'center' });
    
    // Save PDF
    const fileName = `Bukti_Pendaftaran_${student.namaSiswa.replace(/\s+/g, '_')}.pdf`;
    doc.save(fileName);
    
    showToast('PDF berhasil diunduh!', 'success');
}

// ==========================================
// Settings
// ==========================================
function initializeSettings() {
    const clearDataBtn = document.getElementById('clearDataBtn');
    
    clearDataBtn.addEventListener('click', function() {
        if (!confirm('PERINGATAN: Semua data siswa akan dihapus permanen. Apakah Anda yakin?')) {
            return;
        }
        
        if (!confirm('Konfirmasi sekali lagi. Data yang terhapus tidak dapat dikembalikan!')) {
            return;
        }
        
        students = [];
        saveStudents();
        renderDashboard();
        renderStudentTable();
        
        showToast('Semua data berhasil dihapus!', 'success');
    });
}

// ==========================================
// Toast Notification
// ==========================================
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');
    
    toastMessage.textContent = message;
    toast.className = 'toast show ' + type;
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}
