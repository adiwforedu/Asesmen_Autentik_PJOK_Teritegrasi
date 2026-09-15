/**
 * MAIN APP CONTROLLER - Asesmen Autentik PJOK SMA
 * 1. Freeze Column Nama Murid untuk Laptop & HP.
 * 2. Pembersihan Total Pre-filled Scores pada LocalStorage agar Murni Kosong (Belum Dinilai).
 * 3. Pewarnaan Tegas yang Berbeda untuk Setiap Kolom Kriteria Rubrik.
 * 4. Penyelarasan Sinkronisasi Dinamis Lembar Tanda Tangan (Guru, NIP Guru, Plt. Kepala SMAN 2 Ciamis, NIP, Kota/Tanggal).
 * 5. Sanitizer Otomatis Database Murid: Memastikan X E-1 s/d X E-12 Berisi 36 - 42 Siswa Murni Bebas Duplikasi.
 */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Rubric Engine
  const rubricEngine = new RubricEngine('basket');

  // Application State
  const state = {
    meta: {
      judul: 'RUBRIK ASESMEN AUTENTIK PJOK (OBSERVASI UNJUK KERJA GURU)',
      sekolah: 'SMA NEGERI 2 CIAMIS',
      subHeader: 'TAHUN PELAJARAN 2025-2026',
      tahunPelajaran: '2025-2026',
      kelas: 'Fase E (Kelas X E-1)',
      tanggal: new Date().toISOString().split('T')[0],
      olahraga: 'Bola Basket',
      guru: 'Afriadi Nugraha Sulaeman, S.Pd.',
      nipGuru: '19780512 200501 1 003',
      jabatanKepsek: 'Plt. Kepala SMAN 2 Ciamis',
      kepsek: 'Dadan Ramdan, S.Ag., M.Pd.',
      nipKepsek: '19710325 199702 1 002',
      kota: 'Ciamis'
    },
    filterCategory: 'all',
    selectedKelas: 'X E-1',
    selectedKelompok: 'all',
    activeModalCategory: 'Pemain',
    isUserImported: false,
    students: [],
    currentLineup: {
      hash: '', // combination of sport, kelas, kelompok
      startersA: [],
      benchA: [],
      startersB: [],
      benchB: [],
      officials: {},
      poolOther: []
    }
  };

  // Clean Sample Names Generator for X E-1 (Exactly 42 Students)
  const realStudentNamesXE1 = [
    'Adam Khadafi Al-Ghiffari', 'Ahmad Jeriko', 'Ahmad Rizky Pratama', 'Alisa Rahmawati', 'Alvin Putra',
    'Andika Pratama', 'Bintang Kejora', 'Budi Santoso', 'Cahya Kamila', 'Citra Dewi Anggraini',
    'Dian Sastrowardoyo', 'Doni Kusuma', 'Eka Putri Lestari', 'Erwin Gutawa', 'Fajar Nugraha',
    'Fitri Carlina', 'Gilang Dirga', 'Gita Savitri', 'Hendra Gunawan', 'Hesti Purwadinata',
    'Indah Permata', 'Irfan Hakim', 'Joko Widodo', 'Julia Perez', 'Kaesang Pangarep',
    'Kiki Amalia', 'Lesti Kejora', 'Lestari Rahayu', 'Megawati Soekarnoputri', 'Muhammad Farhan',
    'Nabila Syakieb', 'Nazaruddin', 'Okta Ramadhan', 'Olla Ramlan', 'Prabowo Subianto',
    'Putri Handayani', 'Qori Sandioriva', 'Rian Hidayat', 'Siti Nurhaliza', 'Taufik Hidayat',
    'Umar Amiruddin', 'Zainal Abidin'
  ];

  // Additional Real Indonesian Student Names for X E-2 to X E-12
  const additionalStudentNames = [
    'Ayu Ting Ting', 'Afgan Syahreza', 'Agnez Mo', 'Ariel Noah', 'Bunga Citra Lestari',
    'Chelsea Islan', 'Chico Jericho', 'Dewa 19', 'Gading Marten', 'Gisella Anastasia',
    'Isyana Sarasvati', 'Joe Taslim', 'Lyodra Ginting', 'Maudy Ayunda', 'Nicholas Saputra',
    'Pevita Pearce', 'Raffi Ahmad', 'Raisa Andriana', 'Reza Rahadian', 'Rossa Roslaina',
    'Sule Sutisna', 'Titi Kamal', 'Tulus Rusedi', 'Vidi Aldiano', 'Yura Yunita',
    'Zaskia Adya Mecca', 'Adhisty Zara', 'Angga Yunanda', 'Anya Geraldine', 'Bryan Domani',
    'Devano Danendra', 'Iqbaal Ramadhan', 'Jefri Nichol', 'Prilly Latuconsina', 'Rizky Febian',
    'Tiara Andini'
  ];

  // DOM Elements
  const elTableHead = document.getElementById('tableHeaderRow');
  const elTableBody = document.getElementById('tableBodySiswa');
  const elIntervalContainer = document.getElementById('intervalContainer');
  const elDispSkorMax = document.getElementById('dispSkorMax');
  const elSelectPreset = document.getElementById('selectPresetOlahraga');
  const elSelectKopKelas = document.getElementById('selectKopKelas');
  const elSelectFilterKelompok = document.getElementById('selectFilterKelompok');
  const elGroupBatchPanel = document.getElementById('groupBatchPanel');
  const elDispBatchGroupName = document.getElementById('dispBatchGroupName');
  const elBatchCriteriaGrid = document.getElementById('batchCriteriaGrid');
  const elBtnToggleCourtVisualizer = document.getElementById('btnToggleCourtVisualizer');
  const elCourtVisualizerPanel = document.getElementById('courtVisualizerPanel');
  const elCourtWrapper = document.getElementById('courtWrapper');
  const elBtnCloseCourtVisualizer = document.getElementById('btnCloseCourtVisualizer');
  const elDispKelasPrint = document.getElementById('dispKelasPrint');
  const elDispOlahragaPrint = document.getElementById('dispOlahragaPrint');

  // Inputs Identitas
  const inputTahunPelajaran = document.getElementById('inputTahunPelajaran');
  const inputTanggal = document.getElementById('inputTanggal');
  const inputGuru = document.getElementById('inputGuru');
  const inputNipGuru = document.getElementById('inputNipGuru');
  const inputJabatanKepsek = document.getElementById('inputJabatanKepsek');
  const inputKepsek = document.getElementById('inputKepsek');
  const inputNipKepsek = document.getElementById('inputNipKepsek');
  const inputKota = document.getElementById('inputKota');

  // Signature Elements
  const dispSekolahSig = document.getElementById('dispSekolahSig');
  const dispJabatanKepsekSig = document.getElementById('dispJabatanKepsekSig');
  const dispKepsekSig = document.getElementById('dispKepsekSig');
  const dispNipKepsekSig = document.getElementById('dispNipKepsekSig');
  const dispKotaSig = document.getElementById('dispKotaSig');
  const dispTanggalSig = document.getElementById('dispTanggalSig');
  const dispGuruSig = document.getElementById('dispGuruSig');
  const dispNipGuruSig = document.getElementById('dispNipGuruSig');

  // Modals
  const modalRubric = document.getElementById('rubricModal');
  const modalImport = document.getElementById('importModal');
  const rubricCriteriaList = document.getElementById('rubricCriteriaList');
  const rubricCategoryTabs = document.getElementById('rubricCategoryTabs');
  const inputModalTopicName = document.getElementById('inputModalTopicName');
  const toastNotif = document.getElementById('toastNotif');
  const toastMsg = document.getElementById('toastMsg');
  const modalSingleStudent = document.getElementById('singleStudentScoreModal');
  const elSingleStudentModalTitle = document.getElementById('singleStudentModalTitle');
  const elSingleStudentScoreContainer = document.getElementById('singleStudentScoreContainer');
  const btnCloseSingleStudentModal = document.getElementById('btnCloseSingleStudentModal');

  // -------------------------------------------------------------
  // INITIALIZATION & STATE PERSISTENCE WITH SANITIZER
  // -------------------------------------------------------------
  function init() {
    inputTanggal.value = state.meta.tanggal;

    // Load from LocalStorage if available
    const savedState = localStorage.getItem('pjok_assessment_state');
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        state.meta = Object.assign({}, state.meta, parsed.meta || {});
        state.isUserImported = parsed.isUserImported || false;

        // Auto-migrate old default values for this user
        if (state.meta.guru === 'Drs. H. Ahmad Fauzi, M.Pd.') {
          state.meta.guru = 'Afriadi Nugraha Sulaeman, S.Pd.';
        }
        if (state.meta.nipKepsek === '-') {
          state.meta.nipKepsek = '19710325 199702 1 002';
        }

        if (parsed.currentSport) {
          rubricEngine.setSportPreset(parsed.currentSport);
        }
        if (parsed.criteria && Array.isArray(parsed.criteria)) {
          // Clean out unwanted draft 'Kriteria Baru' from old local cache
          const cleanCriteria = parsed.criteria.filter(c => c && c.name && !/^KRITERIA BARU\s*\d*$/i.test(c.name.trim()));
          if (cleanCriteria.length > 0) {
            rubricEngine.setCriteria(cleanCriteria);
          } else {
            rubricEngine.resetCurrentSportToDefault();
          }
        }

        // Check if cached data was corrupted from old faulty import (e.g. > 550 total or inflated class)
        const hasInflatedClass = parsed.students && parsed.students.length > 550;

        // Load students if they exist and aren't corrupted, regardless of whether they were imported or generated
        if (!hasInflatedClass && parsed.students && Array.isArray(parsed.students) && parsed.students.length > 0) {
          const valid = parsed.students.filter(s => s && s.name && ExcelExporter.isValidStudentName(s.name));
          if (valid.length > 0) {
            state.students = valid;
          } else {
            loadSampleData();
          }
        } else {
          loadSampleData();
        }

        if (parsed.selectedKelas) {
          state.selectedKelas = parsed.selectedKelas;
        }

        if (parsed.selectedKelompok) {
          state.selectedKelompok = parsed.selectedKelompok;
        }

        if (parsed.matchResults && typeof parsed.matchResults === 'object') {
          state.matchResults = parsed.matchResults;
        } else {
          state.matchResults = {};
        }

        // Ensure every student has a valid kelompok attribute
        state.students.forEach((s, idx) => {
          if (!s.scores) s.scores = {};
          if (!s.kelompok) {
            const grpNum = Math.floor((idx % 42) / 6) + 1;
            s.kelompok = `Kelompok ${grpNum}`;
          }
        });

        // Sync UI
        document.getElementById('dispJudul').innerText = state.meta.judul;
        document.getElementById('dispSekolah').innerText = state.meta.sekolah;
        document.getElementById('dispSubHeader').innerText = state.meta.subHeader;
      } catch (e) {
        console.warn('Failed to load saved state:', e);
        loadSampleData();
      }
    } else {
      loadSampleData();
    }

    // Sync input form fields
    inputTahunPelajaran.value = state.meta.tahunPelajaran || '2025-2026';
    state.meta.subHeader = `TAHUN PELAJARAN ${inputTahunPelajaran.value}`;
    document.getElementById('dispSubHeader').innerText = state.meta.subHeader;
    inputTanggal.value = state.meta.tanggal || new Date().toISOString().split('T')[0];
    inputGuru.value = state.meta.guru || 'Afriadi Nugraha Sulaeman, S.Pd.';
    inputNipGuru.value = state.meta.nipGuru || '19780512 200501 1 003';
    inputJabatanKepsek.value = state.meta.jabatanKepsek || 'Plt. Kepala SMAN 2 Ciamis';
    inputKepsek.value = state.meta.kepsek || 'Dadan Ramdan, S.Ag., M.Pd.';
    inputNipKepsek.value = state.meta.nipKepsek || '19710325 199702 1 002';
    inputKota.value = state.meta.kota || 'Ciamis';

    saveState();
    renderSportDropdownOptions();
    renderKopClassDropdown();
    renderAll();
    setupEventListeners();
  }

  function loadSampleData() {
    const generated = [];

    // Master List of 42 Clean Real Student Names
    const master42Names = [
      'Adam Khadafi Al-Ghiffari', 'Ahmad Jeriko', 'Ahmad Rizky Pratama', 'Alisa Rahmawati', 'Alvin Putra',
      'Andika Pratama', 'Bintang Kejora', 'Budi Santoso', 'Cahya Kamila', 'Citra Dewi Anggraini',
      'Dian Sastrowardoyo', 'Doni Kusuma', 'Eka Putri Lestari', 'Erwin Gutawa', 'Fajar Nugraha',
      'Fitri Carlina', 'Gilang Dirga', 'Gita Savitri', 'Hendra Gunawan', 'Hesti Purwadinata',
      'Indah Permata', 'Irfan Hakim', 'Joko Widodo', 'Julia Perez', 'Kaesang Pangarep',
      'Kiki Amalia', 'Lesti Kejora', 'Lestari Rahayu', 'Megawati Soekarnoputri', 'Muhammad Farhan',
      'Nabila Syakieb', 'Nazaruddin', 'Okta Ramadhan', 'Olla Ramlan', 'Prabowo Subianto',
      'Putri Handayani', 'Qori Sandioriva', 'Rian Hidayat', 'Siti Nurhaliza', 'Taufik Hidayat',
      'Umar Amiruddin', 'Zainal Abidin'
    ];

    // Classes X E-1 to X E-12: EXACTLY 42 Students Each (Total = 12 * 42 = 504 Students)
    // Default Status: ALL STUDENTS START AS 'Belum Dikelompokkan'
    for (let cNum = 1; cNum <= 12; cNum++) {
      const clsName = `X E-${cNum}`;
      for (let i = 0; i < 42; i++) {
        const studentName = master42Names[i % master42Names.length];
        generated.push({
          id: `std_${cNum}_${i + 1}`,
          name: studentName,
          kelas: clsName,
          kelompok: 'Belum Dikelompokkan',
          scores: {}
        });
      }
    }

    state.students = generated;
    state.isUserImported = false;
  }

  function clearAllStudentScores() {
    state.students.forEach(s => {
      s.scores = {};
    });
  }

  function saveState() {
    try {
      const payload = {
        meta: state.meta,
        currentSport: rubricEngine.currentSport,
        criteria: rubricEngine.getCriteria(),
        selectedKelas: state.selectedKelas,
        selectedKelompok: state.selectedKelompok,
        isUserImported: state.isUserImported,
        students: state.students,
        matchResults: state.matchResults || {}
      };
      localStorage.setItem('pjok_assessment_state', JSON.stringify(payload));
    } catch (e) {
      console.warn('Could not save state to localStorage', e);
    }
  }

  function formatIndonesianDate(dateStr) {
    if (!dateStr) return '';
    try {
      const parts = dateStr.split('-');
      if (parts.length !== 3) return dateStr;
      const monthNames = [
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
      ];
      const day = parseInt(parts[2], 10);
      const month = monthNames[parseInt(parts[1], 10) - 1];
      const year = parts[0];
      return `${day} ${month} ${year}`;
    } catch (e) {
      return dateStr;
    }
  }

  function triggerHapticFeedback() {
    if ('vibrate' in navigator) {
      try {
        navigator.vibrate(20);
      } catch (e) {
        // Ignore if unsupported
      }
    }
  }

  function showToast(message) {
    toastMsg.innerText = message;
    toastNotif.classList.add('show');
    setTimeout(() => {
      toastNotif.classList.remove('show');
    }, 3000);
  }

  // -------------------------------------------------------------
  // DYNAMIC SPORT / TOPIC DROPDOWN MANAGER
  // -------------------------------------------------------------
  function renderSportDropdownOptions() {
    const topicsList = rubricEngine.getAllAvailableTopics();
    let html = '';

    topicsList.forEach(t => {
      const isSelected = t.key === rubricEngine.currentSport;
      html += `<option value="${t.key}" ${isSelected ? 'selected' : ''}>${escapeHtml(t.nama)} ${t.isCustom ? '(Kustom)' : ''}</option>`;
    });

    html += `<option value="__ADD_NEW_TOPIC__">+ Tambah Topik Olahraga Baru...</option>`;
    elSelectPreset.innerHTML = html;

    state.meta.olahraga = rubricEngine.getSportName();
    elDispOlahragaPrint.innerText = rubricEngine.getSportName();
  }

  // -------------------------------------------------------------
  // TOP KOP INTEGRATED CLASS DROPDOWN FILTER
  // -------------------------------------------------------------
  function renderKopClassDropdown() {
    const uniqueClasses = [...new Set(state.students.map(s => s.kelas || 'X E-1'))];
    uniqueClasses.sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));

    let html = `<option value="all" ${state.selectedKelas === 'all' ? 'selected' : ''}>Semua Kelas (${state.students.length} Murid Total)</option>`;

    uniqueClasses.forEach(cls => {
      const count = state.students.filter(s => (s.kelas || 'X E-1') === cls).length;
      html += `<option value="${escapeHtml(cls)}" ${state.selectedKelas === cls ? 'selected' : ''}>Fase E (Kelas ${escapeHtml(cls)}) - ${count} Murid</option>`;
    });

    html += `<option value="__ADD_NEW__">+ Tambah / Edit Kelas Baru...</option>`;

    elSelectKopKelas.innerHTML = html;

    // Update print text
    elDispKelasPrint.innerText = state.selectedKelas === 'all'
      ? `Semua Kelas (${state.students.length} Murid)`
      : `Fase E (Kelas ${state.selectedKelas})`;
  }

  // -------------------------------------------------------------
  // KELOMPOK / TIM DROPDOWN & BATCH SCORING PANEL RENDERER
  // -------------------------------------------------------------
  function renderGroupFilterDropdown() {
    if (!elSelectFilterKelompok) return;

    const activeStudents = state.selectedKelas === 'all'
      ? state.students
      : state.students.filter(s => (s.kelas || 'X E-1') === state.selectedKelas);

    const groups = [...new Set(activeStudents.map(s => s.kelompok || 'Kelompok 1'))];
    groups.sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));

    let html = `<option value="all" ${state.selectedKelompok === 'all' ? 'selected' : ''}>Semua Kelompok (${activeStudents.length} Murid)</option>`;

    // 1. TANDING 2 REGU BERSAMAAN (DUAL GROUP MATCH OPTIONS)
    if (groups.length >= 2) {
      html += `<optgroup label="⚔️ Tanding / Observasi 2 Regu Sekaligus">`;
      // Consecutive match pairings
      for (let i = 0; i < groups.length; i += 2) {
        if (i + 1 < groups.length) {
          const g1 = groups[i];
          const g2 = groups[i + 1];
          const countPair = activeStudents.filter(s => (s.kelompok || 'Kelompok 1') === g1 || (s.kelompok || 'Kelompok 1') === g2).length;
          const val = `match:${g1}+${g2}`;
          html += `<option value="${val}" ${state.selectedKelompok === val ? 'selected' : ''}>⚔️ ${escapeHtml(g1)} vs ${escapeHtml(g2)} (${countPair} Murid)</option>`;
        }
      }
      // Additional cross pairings
      if (groups.length > 2) {
        for (let i = 0; i < groups.length; i++) {
          for (let j = i + 1; j < groups.length; j++) {
            if (!(i % 2 === 0 && j === i + 1)) {
              const g1 = groups[i];
              const g2 = groups[j];
              const countPair = activeStudents.filter(s => (s.kelompok || 'Kelompok 1') === g1 || (s.kelompok || 'Kelompok 1') === g2).length;
              const val = `match:${g1}+${g2}`;
              html += `<option value="${val}" ${state.selectedKelompok === val ? 'selected' : ''}>⚔️ ${escapeHtml(g1)} vs ${escapeHtml(g2)} (${countPair} Murid)</option>`;
            }
          }
        }
      }
      html += `</optgroup>`;
    }

    // 2. SATU KELOMPOK INDIVIDUAL
    html += `<optgroup label="👥 Penilaian 1 Kelompok Mandiri">`;
    groups.forEach(grp => {
      const count = activeStudents.filter(s => (s.kelompok || 'Kelompok 1') === grp).length;
      html += `<option value="${escapeHtml(grp)}" ${state.selectedKelompok === grp ? 'selected' : ''}>${escapeHtml(grp)} (${count} Murid)</option>`;
    });
    html += `</optgroup>`;

    elSelectFilterKelompok.innerHTML = html;

    // Explicitly set value to ensure UI syncs even if innerHTML selected attribute is quirky
    if (state.selectedKelompok) {
      elSelectFilterKelompok.value = state.selectedKelompok;
    }
  }

  function renderGroupBatchPanel() {
    if (!elGroupBatchPanel) return;

    if (state.selectedKelompok === 'all') {
      if (elDispBatchGroupName) elDispBatchGroupName.textContent = 'Semua Kelompok';
    }

    elGroupBatchPanel.style.display = 'block';
    const criteria = rubricEngine.getCriteria();

    if (state.selectedKelompok.startsWith('match:')) {
      const [g1, g2] = state.selectedKelompok.replace('match:', '').split('+');
      if (elDispBatchGroupName) {
        elDispBatchGroupName.innerHTML = `Mode Tanding: <span style="color:#d97706; font-weight:800;">${escapeHtml(g1)}</span> vs <span style="color:#2563eb; font-weight:800;">${escapeHtml(g2)}</span>`;
      }

      let html = `<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(290px, 1fr)); gap: 12px; width: 100%;">`;

      // Regu A Subpanel
      html += `
        <div style="background: #fffbeb; border: 1.5px solid #fde68a; border-radius: 10px; padding: 10px 12px;">
          <div style="font-weight: 700; font-size: 0.84rem; color: #b45309; margin-bottom: 8px; display: flex; align-items: center; gap: 6px;">
            <i class="fa-solid fa-shield-halved"></i> Penilaian Serentak Regu A (${escapeHtml(g1)}):
          </div>
          <div class="batch-criteria-grid">
      `;
      criteria.forEach((c) => {
        html += `
          <div class="batch-crit-item" style="background: #ffffff; border: 1px solid #fde68a;">
            <span class="batch-crit-name">${escapeHtml(c.name)}</span>
            <div class="batch-btn-group">
              <button class="btn-batch-score" data-group="${escapeHtml(g1)}" data-crit="${c.id}" data-val="1" title="Set nilai 1 untuk seluruh anggota ${escapeHtml(g1)}">1</button>
              <button class="btn-batch-score" data-group="${escapeHtml(g1)}" data-crit="${c.id}" data-val="2" title="Set nilai 2 untuk seluruh anggota ${escapeHtml(g1)}">2</button>
              <button class="btn-batch-score" data-group="${escapeHtml(g1)}" data-crit="${c.id}" data-val="3" title="Set nilai 3 untuk seluruh anggota ${escapeHtml(g1)}">3</button>
              <button class="btn-batch-score" data-group="${escapeHtml(g1)}" data-crit="${c.id}" data-val="4" title="Set nilai 4 untuk seluruh anggota ${escapeHtml(g1)}">4</button>
            </div>
          </div>
        `;
      });
      html += `</div></div>`;

      // Regu B Subpanel
      html += `
        <div style="background: #eff6ff; border: 1.5px solid #bfdbfe; border-radius: 10px; padding: 10px 12px;">
          <div style="font-weight: 700; font-size: 0.84rem; color: #1d4ed8; margin-bottom: 8px; display: flex; align-items: center; gap: 6px;">
            <i class="fa-solid fa-shield-halved"></i> Penilaian Serentak Regu B (${escapeHtml(g2)}):
          </div>
          <div class="batch-criteria-grid">
      `;
      criteria.forEach((c) => {
        html += `
          <div class="batch-crit-item" style="background: #ffffff; border: 1px solid #bfdbfe;">
            <span class="batch-crit-name">${escapeHtml(c.name)}</span>
            <div class="batch-btn-group">
              <button class="btn-batch-score" data-group="${escapeHtml(g2)}" data-crit="${c.id}" data-val="1" title="Set nilai 1 untuk seluruh anggota ${escapeHtml(g2)}">1</button>
              <button class="btn-batch-score" data-group="${escapeHtml(g2)}" data-crit="${c.id}" data-val="2" title="Set nilai 2 untuk seluruh anggota ${escapeHtml(g2)}">2</button>
              <button class="btn-batch-score" data-group="${escapeHtml(g2)}" data-crit="${c.id}" data-val="3" title="Set nilai 3 untuk seluruh anggota ${escapeHtml(g2)}">3</button>
              <button class="btn-batch-score" data-group="${escapeHtml(g2)}" data-crit="${c.id}" data-val="4" title="Set nilai 4 untuk seluruh anggota ${escapeHtml(g2)}">4</button>
            </div>
          </div>
        `;
      });
      html += `</div></div></div>`;

      if (elBatchCriteriaGrid) elBatchCriteriaGrid.innerHTML = html;

    } else {
      if (elDispBatchGroupName) elDispBatchGroupName.innerText = state.selectedKelompok;

      let html = '';
      criteria.forEach((c) => {
        html += `
          <div class="batch-crit-item">
            <span class="batch-crit-name">${escapeHtml(c.name)}</span>
            <div class="batch-btn-group">
              <button class="btn-batch-score" data-group="${escapeHtml(state.selectedKelompok)}" data-crit="${c.id}" data-val="1" title="Set nilai 1 untuk seluruh anggota ${escapeHtml(state.selectedKelompok)}">1</button>
              <button class="btn-batch-score" data-group="${escapeHtml(state.selectedKelompok)}" data-crit="${c.id}" data-val="2" title="Set nilai 2 untuk seluruh anggota ${escapeHtml(state.selectedKelompok)}">2</button>
              <button class="btn-batch-score" data-group="${escapeHtml(state.selectedKelompok)}" data-crit="${c.id}" data-val="3" title="Set nilai 3 untuk seluruh anggota ${escapeHtml(state.selectedKelompok)}">3</button>
              <button class="btn-batch-score" data-group="${escapeHtml(state.selectedKelompok)}" data-crit="${c.id}" data-val="4" title="Set nilai 4 untuk seluruh anggota ${escapeHtml(state.selectedKelompok)}">4</button>
            </div>
          </div>
        `;
      });

      if (elBatchCriteriaGrid) elBatchCriteriaGrid.innerHTML = html;
    }
  }

  // -------------------------------------------------------------
  // RENDER FUNCTIONS & SIGNATURE SYNC
  // -------------------------------------------------------------
  function renderAll() {
    renderGroupFilterDropdown();
    renderGroupBatchPanel();
    renderHeaderColumns();
    renderStudentRows();
    renderIntervals();
    renderStats();
    renderSignatures();
    renderMatchEvidencePrint();
    if (elCourtVisualizerPanel && elCourtVisualizerPanel.style.display !== 'none') {
      renderCourtVisualizer();
    }
  }

  function renderSignatures() {
    if (dispSekolahSig) dispSekolahSig.innerText = state.meta.sekolah || 'SMA NEGERI 2 CIAMIS';
    if (dispJabatanKepsekSig) dispJabatanKepsekSig.innerText = state.meta.jabatanKepsek || 'Plt. Kepala SMAN 2 Ciamis';
    if (dispKepsekSig) dispKepsekSig.innerText = state.meta.kepsek || 'Dadan Ramdan, S.Ag., M.Pd.';
    if (dispNipKepsekSig) dispNipKepsekSig.innerText = state.meta.nipKepsek ? `NIP. ${state.meta.nipKepsek}` : 'NIP. 19710325 199702 1 002';

    if (dispKotaSig) dispKotaSig.innerText = state.meta.kota || 'Ciamis';
    if (dispTanggalSig) dispTanggalSig.innerText = formatIndonesianDate(state.meta.tanggal);

    if (dispGuruSig) dispGuruSig.innerText = state.meta.guru || 'Afriadi Nugraha Sulaeman, S.Pd.';
    if (dispNipGuruSig) dispNipGuruSig.innerText = state.meta.nipGuru ? `NIP. ${state.meta.nipGuru}` : 'NIP. ....................';
  }

  function renderHeaderColumns() {
    const criteria = rubricEngine.getCriteria();

    let html = `<th style="width: 38px; text-align: center;">No.</th>`;
    html += `<th style="min-width: 175px; text-align: center;" class="sticky-col">Nama Murid</th>`;
    html += `<th style="width: 75px; text-align: center;">Kelas</th>`;
    html += `<th style="width: 100px; text-align: center;">Kelompok / Tim</th>`;

    criteria.forEach((c, idx) => {
      const categoryTag = c.category === 'Perangkat' ? 'Perangkat Pertandingan' : (c.category || 'Pemain');
      const isPerangkat = categoryTag === 'Perangkat Pertandingan';
      const colorClass = `crit-col-${idx % 6}-head`;

      html += `<th class="${colorClass}" style="min-width: 110px; text-align: center;" title="Kategori: ${categoryTag}">
        <div style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 130px; margin: 0 auto;">${c.name}</div>
        <small style="font-size:0.65rem; font-weight: normal; white-space: nowrap;">[${categoryTag}${isPerangkat ? ' - Opsional' : ''}]</small>
      </th>`;
    });

    html += `<th style="width: 55px; text-align: center;">Skor</th>`;
    html += `<th style="width: 70px; text-align: center;">Nilai Akhir</th>`;
    html += `<th style="width: 125px; min-width: 125px; text-align: center;">Keterangan Interval</th>`;
    html += `<th class="no-print" style="width: 55px; text-align: center;">Reset</th>`;

    elTableHead.innerHTML = html;
  }

  function renderStudentRows() {
    const criteria = rubricEngine.getCriteria();
    const filterCat = state.filterCategory;
    const selectedKelas = state.selectedKelas;
    const selectedKelompok = state.selectedKelompok;

    elTableBody.innerHTML = '';

    let visibleCount = 0;
    let indexNo = 1;

    state.students.forEach((student) => {
      const studentKelas = student.kelas || 'X E-1';
      const studentKelompok = student.kelompok || 'Kelompok 1';

      if (selectedKelas !== 'all' && studentKelas !== selectedKelas) {
        return;
      }

      if (selectedKelompok !== 'all') {
        if (selectedKelompok.startsWith('match:')) {
          const pair = selectedKelompok.replace('match:', '').split('+');
          if (!pair.includes(studentKelompok)) {
            return;
          }
        } else if (studentKelompok !== selectedKelompok) {
          return;
        }
      }

      const classification = rubricEngine.classifyStudentDynamicScore(student.scores);

      if (filterCat !== 'all' && classification.code !== filterCat) {
        return;
      }
      visibleCount++;

      const tr = document.createElement('tr');

      let tdHtml = `<td style="text-align: center; font-weight: 600;">${indexNo++}</td>`;
      tdHtml += `<td class="sticky-col"><input type="text" class="student-name-input" value="${escapeHtml(student.name)}" data-id="${student.id}"></td>`;
      tdHtml += `<td style="text-align: center;"><span class="badge-kelas-tag">${escapeHtml(studentKelas)}</span></td>`;

      let kelompokBadgeHtml = `<span class="badge-kelompok-tag" data-id="${student.id}" title="Klik untuk ubah kelompok/tim">${escapeHtml(studentKelompok)}</span>`;
      if (selectedKelompok.startsWith('match:')) {
        const [g1, g2] = selectedKelompok.replace('match:', '').split('+');
        if (studentKelompok === g1) {
          kelompokBadgeHtml = `<span class="badge-kelompok-tag" style="background:#fef3c7; color:#b45309; border-color:#fde68a; font-weight:800;" data-id="${student.id}" title="Regu A">${escapeHtml(studentKelompok)} (A)</span>`;
        } else if (studentKelompok === g2) {
          kelompokBadgeHtml = `<span class="badge-kelompok-tag" style="background:#e0e7ff; color:#4338ca; border-color:#c7d2fe; font-weight:800;" data-id="${student.id}" title="Regu B">${escapeHtml(studentKelompok)} (B)</span>`;
        }
      }
      tdHtml += `<td style="text-align: center;">${kelompokBadgeHtml}</td>`;

      criteria.forEach((c, idx) => {
        const currentScore = student.scores[c.id] || 0;
        const desc1 = c.descriptors ? c.descriptors[1] : '';
        const desc2 = c.descriptors ? c.descriptors[2] : '';
        const desc3 = c.descriptors ? c.descriptors[3] : '';
        const desc4 = c.descriptors ? c.descriptors[4] : '';
        const cellColorClass = `crit-col-${idx % 6}-cell`;

        tdHtml += `<td class="${cellColorClass}" style="text-align: center;">
          <div class="score-btn-group" justify-content="center">
            <button class="btn-score ${currentScore === 1 ? 'active-1' : ''}" 
              data-std="${student.id}" data-crit="${c.id}" data-val="1" title="Deskripsi 1: ${escapeHtml(desc1)}">1</button>
            <button class="btn-score ${currentScore === 2 ? 'active-2' : ''}" 
              data-std="${student.id}" data-crit="${c.id}" data-val="2" title="Deskripsi 2: ${escapeHtml(desc2)}">2</button>
            <button class="btn-score ${currentScore === 3 ? 'active-3' : ''}" 
              data-std="${student.id}" data-crit="${c.id}" data-val="3" title="Deskripsi 3: ${escapeHtml(desc3)}">3</button>
            <button class="btn-score ${currentScore === 4 ? 'active-4' : ''}" 
              data-std="${student.id}" data-crit="${c.id}" data-val="4" title="Deskripsi 4: ${escapeHtml(desc4)}">4</button>
          </div>
        </td>`;
      });

      const totalScoreText = classification.maxPossible > 0 ? `${classification.totalScore}` : '-';
      const finalScoreValue = classification.maxPossible > 0 ? Math.round((classification.totalScore / classification.maxPossible) * 100) : '-';
      const finalScoreText = finalScoreValue !== '-' ? `${finalScoreValue}` : '-';

      tdHtml += `<td style="text-align: center; font-weight: 800; font-size: 0.95rem;">${totalScoreText}</td>`;
      tdHtml += `<td style="text-align: center; font-weight: 800; font-size: 0.95rem; color: #0284c7;">${finalScoreText}</td>`;
      tdHtml += `<td style="text-align: center;">
        <span class="badge-interval ${classification.badgeClass}">${classification.label}</span>
      </td>`;

      tdHtml += `<td class="no-print" style="text-align: center;">
        <button class="btn-rotate-scores btn-reset-student-scores" data-id="${student.id}" title="Hapus/Reset Hasil Penilaian Siswa">
          <i class="fa-solid fa-rotate-left"></i>
        </button>
      </td>`;

      tr.innerHTML = tdHtml;
      elTableBody.appendChild(tr);
    });

    if (visibleCount === 0) {
      elTableBody.innerHTML = `<tr><td colspan="${criteria.length + 6}" style="text-align: center; padding: 35px; color: var(--text-muted);">
        <i class="fa-solid fa-user-slash" style="font-size: 2.2rem; margin-bottom: 10px; color: var(--primary); display: block;"></i>
        Tidak ada data murid untuk filter kelas <strong>${escapeHtml(selectedKelas)}</strong> & kelompok <strong>${escapeHtml(selectedKelompok)}</strong>.
      </td></tr>`;
    }
  }

  function renderIntervals() {
    const intervals = rubricEngine.getIntervals();
    elDispSkorMax.innerText = rubricEngine.getMaxScore();

    let html = '';
    const keys = ['mahir', 'cakap', 'layak', 'berkembang'];
    const badgeMap = { mahir: 'badge-mahir', cakap: 'badge-cakap', layak: 'badge-layak', berkembang: 'badge-berkembang' };

    keys.forEach(k => {
      const item = intervals[k];
      html += `
        <div class="interval-row">
          <span class="badge-interval ${badgeMap[k]}">${item.label}</span>
          <span>: Rentang Skor <strong>${item.min} - ${item.max}</strong></span>
        </div>
      `;
    });

    elIntervalContainer.innerHTML = html;
  }

  function renderStats() {
    const selectedKelas = state.selectedKelas;
    const activeStudents = selectedKelas === 'all'
      ? state.students
      : state.students.filter(s => (s.kelas || 'X E-1') === selectedKelas);

    const total = activeStudents.length;
    let cntMahir = 0, cntCakap = 0, cntLayak = 0, cntBerkembang = 0, cntUnscored = 0;

    activeStudents.forEach(std => {
      const classification = rubricEngine.classifyStudentDynamicScore(std.scores);

      if (classification.code === 'Unscored') {
        cntUnscored++;
      } else if (classification.code === 'Mahir') cntMahir++;
      else if (classification.code === 'Cakap') cntCakap++;
      else if (classification.code === 'Layak') cntLayak++;
      else if (classification.code === 'Berkembang') cntBerkembang++;
    });

    document.getElementById('statTotalSiswa').innerText = total;
    document.getElementById('statMahir').innerText = cntMahir;
    document.getElementById('statCakap').innerText = cntCakap;
    document.getElementById('statLayak').innerText = cntLayak;
    document.getElementById('statBerkembang').innerText = cntBerkembang;

    document.getElementById('cntAll').innerText = total;
    document.getElementById('cntMahir').innerText = cntMahir;
    document.getElementById('cntCakap').innerText = cntCakap;
    document.getElementById('cntLayak').innerText = cntLayak;
    document.getElementById('cntBerkembang').innerText = cntBerkembang;
    document.getElementById('cntUnscored').innerText = cntUnscored;
  }

  // -------------------------------------------------------------
  // MANUAL GROUP MAPPING MODAL & 1-TAP INTERACTIVE BOARD
  // -------------------------------------------------------------
  let activeTargetGroup = 'Kelompok 1';

  function openGroupMappingModal() {
    const modalGroupMapping = document.getElementById('groupMappingModal');
    if (!modalGroupMapping) return;

    const activeStudents = state.selectedKelas === 'all'
      ? state.students
      : state.students.filter(s => (s.kelas || 'X E-1') === state.selectedKelas);

    if (activeStudents.length === 0) {
      alert('Tidak ada murid dalam kelas terpilih.');
      return;
    }

    // Default target group if invalid
    const existingGroups = [...new Set(activeStudents.map(s => s.kelompok || 'Kelompok 1'))];
    if (!existingGroups.includes(activeTargetGroup)) {
      activeTargetGroup = existingGroups[0] || 'Kelompok 1';
    }

    renderGroupMappingBoard();
    modalGroupMapping.classList.add('active');
  }

  function renderGroupMappingBoard() {
    const elTargetGroupPills = document.getElementById('targetGroupPills');
    const elDispActiveTargetBadge = document.getElementById('dispActiveTargetGroupBadge');
    const elStudentChipsGrid = document.getElementById('studentChipsGrid');
    const elGroupMappingList = document.getElementById('groupMappingList');
    const elDispSummary = document.getElementById('dispGroupMapSummary');

    const activeStudents = state.selectedKelas === 'all'
      ? state.students
      : state.students.filter(s => (s.kelas || 'X E-1') === state.selectedKelas);

    if (elDispSummary) {
      elDispSummary.innerText = `Total Murid: ${activeStudents.length} | Kelas: ${state.selectedKelas}`;
    }

    // Standard target groups + any custom assigned groups (excluding Belum Dikelompokkan)
    const defaultGroupPills = ['Kelompok 1', 'Kelompok 2', 'Kelompok 3', 'Kelompok 4', 'Kelompok 5', 'Kelompok 6', 'Kelompok 7'];
    let existingGroups = [...new Set([
      ...defaultGroupPills,
      ...activeStudents.map(s => s.kelompok || 'Belum Dikelompokkan')
    ])].filter(g => g && g !== 'Belum Dikelompokkan');

    existingGroups.sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));

    if (existingGroups.length === 0) {
      existingGroups = ['Kelompok 1'];
    }

    if (!existingGroups.includes(activeTargetGroup)) {
      activeTargetGroup = existingGroups[0];
    }

    if (elDispActiveTargetBadge) {
      elDispActiveTargetBadge.innerText = `🎯 Target: ${activeTargetGroup}`;
    }

    // 1. RENDER TARGET GROUP PILLS (TOP BAR)
    let pillsHtml = '';
    existingGroups.forEach(grp => {
      const count = activeStudents.filter(s => (s.kelompok || 'Belum Dikelompokkan') === grp).length;
      const isActive = grp === activeTargetGroup;
      pillsHtml += `
        <button class="btn-target-pill ${isActive ? 'active' : ''}" data-group="${escapeHtml(grp)}">
          <i class="fa-solid ${isActive ? 'fa-circle-check' : 'fa-users'}"></i>
          <span>${escapeHtml(grp)}</span>
          <span style="font-size:0.7rem; opacity:0.85; padding:1px 6px; background:rgba(0,0,0,0.12); border-radius:10px;">${count} murid</span>
        </button>
      `;
    });

    const unassignedCount = activeStudents.filter(s => (s.kelompok || 'Belum Dikelompokkan') === 'Belum Dikelompokkan').length;
    pillsHtml += `
      <span style="font-size:0.75rem; color:#64748b; align-self:center; margin-left:6px; font-weight:700;">(Belum Dikelompokkan: ${unassignedCount} murid)</span>
    `;

    if (elTargetGroupPills) elTargetGroupPills.innerHTML = pillsHtml;

    // 2. RENDER 1-TAP INTERACTIVE STUDENT CHIPS GRID
    let chipsHtml = '';
    activeStudents.forEach((std, idx) => {
      const stdGroup = std.kelompok || 'Belum Dikelompokkan';
      const isUnassigned = stdGroup === 'Belum Dikelompokkan';
      const isCurrentTarget = stdGroup === activeTargetGroup;
      const classification = rubricEngine.classifyStudentDynamicScore(std.scores);

      let badgeHtml = '';
      if (isCurrentTarget) {
        badgeHtml = `<span class="chip-badge" style="background:#16a34a; color:#ffffff; border-color:#16a34a;">✓ ${escapeHtml(stdGroup)}</span>`;
      } else if (isUnassigned) {
        badgeHtml = `<span class="chip-badge" style="background:#f1f5f9; color:#94a3b8; border-color:#cbd5e1; font-weight:normal;">Belum Dikelompokkan</span>`;
      } else {
        badgeHtml = `<span class="chip-badge">${escapeHtml(stdGroup)}</span>`;
      }

      chipsHtml += `
        <div class="student-chip-card ${isCurrentTarget ? 'assigned-active-target' : ''}" data-id="${std.id}">
          <span class="chip-no">${idx + 1}</span>
          <div class="chip-info">
            <strong class="chip-name">${escapeHtml(std.name)}</strong>
            <small class="chip-score">Asesmen Awal: <span class="badge-interval ${classification.badgeClass}" style="font-size:0.65rem; padding:0 4px;">${classification.label}</span> (${classification.totalScore})</small>
          </div>
          ${badgeHtml}
        </div>
      `;
    });
    if (elStudentChipsGrid) elStudentChipsGrid.innerHTML = chipsHtml;

    // 3. RENDER CLASSIC LIST DROPDOWN TABLE (FALLBACK/SECOND MODE)
    let listHtml = '';
    const allOptionsList = ['Belum Dikelompokkan', ...existingGroups];
    activeStudents.forEach((std, idx) => {
      const classification = rubricEngine.classifyStudentDynamicScore(std.scores);
      let optionsHtml = '';
      allOptionsList.forEach(grp => {
        const isSel = (std.kelompok || 'Belum Dikelompokkan') === grp;
        optionsHtml += `<option value="${escapeHtml(grp)}" ${isSel ? 'selected' : ''}>${escapeHtml(grp)}</option>`;
      });

      listHtml += `
        <div class="group-map-row" style="display: flex; align-items: center; justify-content: space-between; padding: 8px 12px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; gap: 10px;">
          <div style="display: flex; align-items: center; gap: 10px; flex: 1;">
            <span style="font-size: 0.8rem; font-weight: 800; color: #64748b; width: 25px;">${idx + 1}.</span>
            <div>
              <strong style="font-size: 0.88rem; color: #1e293b;">${escapeHtml(std.name)}</strong>
              <div style="font-size: 0.74rem; color: #64748b; margin-top: 2px;">
                Asesmen Awal: <span class="badge-interval ${classification.badgeClass}" style="font-size: 0.68rem; padding: 1px 5px;">${classification.label}</span>
                (Skor: ${classification.totalScore})
              </div>
            </div>
          </div>
          
          <div style="display: flex; align-items: center; gap: 8px;">
            <select class="select-input select-std-group" data-id="${std.id}" style="padding: 4px 8px; font-size: 0.82rem; font-weight: 700;">
              ${optionsHtml}
              <option value="__NEW_GROUP__">+ Buat Kelompok Baru...</option>
            </select>
          </div>
        </div>
      `;
    });
    if (elGroupMappingList) elGroupMappingList.innerHTML = listHtml;
  }

  // -------------------------------------------------------------
  // DYNAMIC RUBRIC MODAL & TOPIC EDITING
  // -------------------------------------------------------------
  function openRubricModal() {
    inputModalTopicName.value = rubricEngine.getSportName();
    state.activeModalCategory = rubricEngine.getActiveCategory() || 'Pemain';
    if (state.activeModalCategory === 'Perangkat') state.activeModalCategory = 'Perangkat Pertandingan';

    renderRubricCategoryTabs();
    renderRubricModalCards();
    modalRubric.classList.add('active');
  }

  function renderRubricCategoryTabs() {
    const categories = rubricEngine.getCategories();
    rubricCategoryTabs.innerHTML = '';
    categories.forEach(cat => {
      const cleanCatName = cat === 'Perangkat' ? 'Perangkat Pertandingan' : cat;
      const btn = document.createElement('button');
      btn.className = `tab-pill ${cleanCatName === state.activeModalCategory ? 'active' : ''}`;
      btn.dataset.cat = cleanCatName;
      btn.innerText = cleanCatName;
      btn.addEventListener('click', () => {
        saveCurrentModalInputsToState();
        state.activeModalCategory = cleanCatName;
        renderRubricCategoryTabs();
        renderRubricModalCards();
      });
      rubricCategoryTabs.appendChild(btn);
    });
  }

  function renderRubricModalCards() {
    const allCriteria = rubricEngine.getCriteria();
    const currentCatCriteria = allCriteria.filter(c => {
      const cat = c.category === 'Perangkat' ? 'Perangkat Pertandingan' : (c.category || 'Pemain');
      return cat === state.activeModalCategory;
    });

    rubricCriteriaList.innerHTML = '';

    currentCatCriteria.forEach((crit, index) => {
      const card = document.createElement('div');
      card.className = 'criterion-card-box';
      card.dataset.id = crit.id;
      card.dataset.category = state.activeModalCategory;

      const d1 = crit.descriptors ? crit.descriptors[1] : '';
      const d2 = crit.descriptors ? crit.descriptors[2] : '';
      const d3 = crit.descriptors ? crit.descriptors[3] : '';
      const d4 = crit.descriptors ? crit.descriptors[4] : '';

      card.innerHTML = `
        <div class="crit-box-header">
          <span class="crit-box-title">Judul Kriteria ${index + 1}</span>
          <button class="btn-trash-crit btn-remove-card" title="Hapus Kriteria"><i class="fa-solid fa-trash-can"></i></button>
        </div>
        <input type="text" class="crit-title-input input-crit-name" value="${escapeHtml(crit.name)}">
        
        <div class="desc-field-group">
          <label>Deskripsi 1</label>
          <textarea class="desc-textarea input-desc-1">${escapeHtml(d1)}</textarea>
        </div>

        <div class="desc-field-group">
          <label>Deskripsi 2</label>
          <textarea class="desc-textarea input-desc-2">${escapeHtml(d2)}</textarea>
        </div>

        <div class="desc-field-group">
          <label>Deskripsi 3</label>
          <textarea class="desc-textarea input-desc-3">${escapeHtml(d3)}</textarea>
        </div>

        <div class="desc-field-group">
          <label>Deskripsi 4</label>
          <textarea class="desc-textarea input-desc-4">${escapeHtml(d4)}</textarea>
        </div>
      `;

      card.querySelector('.btn-remove-card').addEventListener('click', () => card.remove());
      rubricCriteriaList.appendChild(card);
    });

    if (currentCatCriteria.length === 0) {
      rubricCriteriaList.innerHTML = `<div style="text-align:center; padding: 20px; color: var(--text-muted);">
        Belum ada kriteria untuk kategori <strong>${state.activeModalCategory}</strong>. Klik tombol di bawah untuk menambah.
      </div>`;
    }
  }

  function saveCurrentModalInputsToState() {
    const cards = rubricCriteriaList.querySelectorAll('.criterion-card-box');
    const updatedCategoryCriteria = [];

    cards.forEach(card => {
      const id = card.dataset.id;
      const category = card.dataset.category || state.activeModalCategory;
      const name = card.querySelector('.input-crit-name').value.trim() || 'Kriteria Baru';
      const d1 = card.querySelector('.input-desc-1').value.trim();
      const d2 = card.querySelector('.input-desc-2').value.trim();
      const d3 = card.querySelector('.input-desc-3').value.trim();
      const d4 = card.querySelector('.input-desc-4').value.trim();

      updatedCategoryCriteria.push({
        id,
        category: category === 'Perangkat' ? 'Perangkat Pertandingan' : category,
        name,
        descriptors: { 1: d1, 2: d2, 3: d3, 4: d4 }
      });
    });

    const otherCategoryCriteria = rubricEngine.getCriteria().filter(c => {
      const cat = c.category === 'Perangkat' ? 'Perangkat Pertandingan' : (c.category || 'Pemain');
      return cat !== state.activeModalCategory;
    });

    const fullMergedList = [...otherCategoryCriteria, ...updatedCategoryCriteria];
    rubricEngine.setCriteria(fullMergedList);
  }

  // -------------------------------------------------------------
  // COURT VISUALIZER LOGIC
  // -------------------------------------------------------------
  function toggleCourtVisualizer() {
    if (elCourtVisualizerPanel.style.display === 'none') {
      elCourtVisualizerPanel.style.display = 'flex';
      renderCourtVisualizer();
      setTimeout(() => {
        elCourtVisualizerPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } else {
      elCourtVisualizerPanel.style.display = 'none';
    }
  }

  function getCourtClassBySport(sportKey) {
    const sportName = (state.meta.olahraga || '').toLowerCase();
    if (sportKey === 'basket' || sportName.includes('basket')) return 'court-basketball';
    if (sportKey === 'voli' || sportName.includes('voli')) return 'court-volleyball';
    if (sportKey === 'bulutangkis' || sportName.includes('bulu tangkis') || sportName.includes('bulutangkis') || sportName.includes('badminton')) return 'court-badminton';
    if (sportKey === 'atletik' || sportName.includes('atletik') || sportName.includes('lari')) return 'court-athletics';
    if (sportKey === 'senam' || sportName.includes('senam') || sportName.includes('gymnastics')) return 'court-gymnastics';
    return 'court-general';
  }

  let selectedBenchPlayerIdForSub = null;
  window.isManualSubMode = false;

  function getMaxPlayersPerSport(sportKey) {
    if (sportKey === 'voli') return 6;
    if (sportKey === 'basket' || sportKey === 'futsal') return 5;
    if (sportKey === 'bulutangkis') return 2;
    return 11;
  }

  function findStudentLocation(stdId) {
    if (state.currentLineup.startersA.includes(stdId)) return { array: state.currentLineup.startersA };
    if (state.currentLineup.benchA.includes(stdId)) return { array: state.currentLineup.benchA };
    if (state.currentLineup.startersB.includes(stdId)) return { array: state.currentLineup.startersB };
    if (state.currentLineup.benchB.includes(stdId)) return { array: state.currentLineup.benchB };
    if (state.currentLineup.poolOther.includes(stdId)) return { array: state.currentLineup.poolOther };

    for (let role in state.currentLineup.officials) {
      if (state.currentLineup.officials[role] === stdId) return { obj: state.currentLineup.officials, key: role };
    }
    return null;
  }

  function getPlayerTeamSide(loc) {
    if (!loc) return null;
    if (loc.array === state.currentLineup.startersA || loc.array === state.currentLineup.benchA || (loc.obj && loc.key.endsWith('_a'))) return 'A';
    if (loc.array === state.currentLineup.startersB || loc.array === state.currentLineup.benchB || (loc.obj && loc.key.endsWith('_b'))) return 'B';
    return 'pool';
  }

  function resolveOfficialConflicts() {
    if (!state.currentLineup || !state.currentLineup.officials) return;
    const activeStarters = [...(state.currentLineup.startersA || []), ...(state.currentLineup.startersB || [])];

    for (const [role, studentId] of Object.entries(state.currentLineup.officials)) {
      if (studentId && activeStarters.includes(studentId)) {
        delete state.currentLineup.officials[role];
      }
    }
  }

  function swapPlayers(id1, id2) {
    const loc1 = findStudentLocation(id1);
    const loc2 = findStudentLocation(id2);
    if (loc1 && loc2) {
      const team1 = getPlayerTeamSide(loc1);
      const team2 = getPlayerTeamSide(loc2);

      // If cross-team swap between Team A and Team B, confirm with teacher
      if ((team1 === 'A' && team2 === 'B') || (team1 === 'B' && team2 === 'A')) {
        const proceed = confirm("Pemberitahuan Penyesuaian Tim:\nSecara aturan resmi, pemain cadangan hanya menggantikan pemain di kelompoknya sendiri.\n\nApakah Anda ingin tetap melakukan penukaran antar-tim ini untuk penyesuaian manual (penyeimbangan kemampuan tim)?");
        if (!proceed) {
          selectedBenchPlayerIdForSub = null;
          renderCourtVisualizer();
          return;
        }
      }

      if (loc1.array) {
        const idx1 = loc1.array.indexOf(id1);
        loc1.array[idx1] = id2;
      } else if (loc1.obj) {
        loc1.obj[loc1.key] = id2;
      }

      if (loc2.array) {
        const idx2 = loc2.array.indexOf(id2);
        loc2.array[idx2] = id1;
      } else if (loc2.obj) {
        loc2.obj[loc2.key] = id1;
      }
      resolveOfficialConflicts();
      saveState();
      selectedBenchPlayerIdForSub = null;
      renderCourtVisualizer();
      showToast("Pergantian/penyesuaian pemain berhasil!");
    }
  }

  function getPlayerPosition(sportKey, team, index) {
    // team: 'A' (bottom) or 'B' (top)
    // Volleyball (6 players)
    if (sportKey === 'voli') {
      const positionsA = [
        { left: 20, top: 65 }, // 0: Front Left (Pos 4)
        { left: 50, top: 55 }, // 1: Front Center (Pos 3)
        { left: 80, top: 65 }, // 2: Front Right (Pos 2)
        { left: 20, top: 85 }, // 3: Back Left (Pos 5)
        { left: 50, top: 75 }, // 4: Back Center (Pos 6)
        { left: 80, top: 85 }  // 5: Back Right (Pos 1)
      ];
      const positionsB = [
        { left: 80, top: 35 }, // 0: Front Left (Pos 4, dekat net kanan layar)
        { left: 50, top: 45 }, // 1: Front Center (Pos 3, dekat net tengah layar)
        { left: 20, top: 35 }, // 2: Front Right (Pos 2, dekat net kiri layar)
        { left: 80, top: 15 }, // 3: Back Left (Pos 5, belakang kanan layar)
        { left: 50, top: 25 }, // 4: Back Center (Pos 6, belakang tengah layar)
        { left: 20, top: 15 }  // 5: Back Right (Pos 1 / Server, belakang kiri layar)
      ];
      return team === 'A' ? (positionsA[index] || { left: 50, top: 75 }) : (positionsB[index] || { left: 50, top: 25 });
    }

    // Basketball / Futsal (5 players)
    if (sportKey === 'basket' || sportKey === 'futsal') {
      const positionsA = [
        { left: 50, top: 85 }, // Point Guard
        { left: 25, top: 70 }, // Wing L
        { left: 75, top: 70 }, // Wing R
        { left: 35, top: 58 }, // Post L
        { left: 65, top: 58 }  // Post R
      ];
      const positionsB = [
        { left: 50, top: 15 },
        { left: 25, top: 30 },
        { left: 75, top: 30 },
        { left: 35, top: 42 },
        { left: 65, top: 42 }
      ];
      return team === 'A' ? (positionsA[index] || { left: 50, top: 75 }) : (positionsB[index] || { left: 50, top: 25 });
    }

    // Badminton (2 players)
    if (sportKey === 'bulutangkis') {
      const positionsA = [
        { left: 30, top: 75 },
        { left: 70, top: 65 }
      ];
      const positionsB = [
        { left: 30, top: 25 },
        { left: 70, top: 35 }
      ];
      return team === 'A' ? (positionsA[index] || { left: 50, top: 70 }) : (positionsB[index] || { left: 50, top: 30 });
    }

    // Default grid (Atletik, etc)
    const row = Math.floor(index / 3);
    const col = index % 3;
    if (team === 'A') {
      return { left: 20 + (col * 30), top: 65 + (row * 10) };
    } else {
      return { left: 20 + (col * 30), top: 35 - (row * 10) };
    }
  }

  function getSportOfficials(sportKey) {
    if (sportKey === 'voli') return ['wasit_utama', 'wasit_kedua', 'hakim_garis_1', 'hakim_garis_2', 'hakim_garis_3', 'hakim_garis_4', 'pencatat_skor', 'medis', 'komentator'];
    if (sportKey === 'basket' || sportKey === 'futsal') return ['wasit_utama', 'wasit_kedua', 'pencatat_skor', 'timekeeper', 'medis', 'komentator'];
    if (sportKey === 'bulutangkis') return ['umpire', 'hakim_servis', 'hakim_garis_1', 'hakim_garis_2', 'hakim_garis_3', 'hakim_garis_4', 'pencatat_skor', 'komentator'];
    return ['wasit_utama', 'asisten_wasit', 'pencatat_skor', 'medis', 'komentator'];
  }

  window.rotateVoli = function (team, direction = 'forward') {
    const arr = team === 'A' ? state.currentLineup.startersA : state.currentLineup.startersB;
    if (!arr || arr.length === 0) return;

    if (arr.length === 6) {
      const sportKey = rubricEngine ? rubricEngine.currentSport : 'voli';
      const pins = [];
      for (let i = 0; i < 6; i++) {
        const stdId = arr[i];
        const pin = document.querySelector(`.player-pin[data-studentid="${stdId}"]`);
        pins.push(pin);
      }

      // Forward mapping (FIVB clockwise): 5->4, 4->3, 3->0, 0->1, 1->2, 2->5
      // Backward mapping (FIVB counter-clockwise): 4->5, 3->4, 0->3, 1->0, 2->1, 5->2
      const forwardMapping = { 5: 4, 4: 3, 3: 0, 0: 1, 1: 2, 2: 5 };
      const backwardMapping = { 4: 5, 3: 4, 0: 3, 1: 0, 2: 1, 5: 2 };
      const targetMapping = direction === 'forward' ? forwardMapping : backwardMapping;

      // Animate physical pins
      for (let i = 0; i < 6; i++) {
        const pin = pins[i];
        if (pin) {
          const targetIndex = targetMapping[i];
          const newPos = getPlayerPosition(sportKey, team, targetIndex);
          pin.style.transition = 'top 0.4s cubic-bezier(0.4, 0, 0.2, 1), left 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
          pin.style.top = newPos.top + '%';
          pin.style.left = newPos.left + '%';
        }
      }

      // Update state after animation
      setTimeout(() => {
        if (direction === 'forward') {
          const temp = arr[5]; // 1
          arr[5] = arr[2];     // 2 -> 1
          arr[2] = arr[1];     // 3 -> 2
          arr[1] = arr[0];     // 4 -> 3
          arr[0] = arr[3];     // 5 -> 4
          arr[3] = arr[4];     // 6 -> 5
          arr[4] = temp;       // 1 -> 6
        } else {
          const temp = arr[5]; // 1
          arr[5] = arr[4];     // 6 -> 1
          arr[4] = arr[3];     // 5 -> 6
          arr[3] = arr[0];     // 4 -> 5
          arr[0] = arr[1];     // 3 -> 4
          arr[1] = arr[2];     // 2 -> 3
          arr[2] = temp;       // 1 -> 2
        }
        saveState();
        renderCourtVisualizer();
        showToast(direction === 'forward' ? `Rotasi Maju ${team === 'A' ? 'Tim A' : 'Tim B'} Berhasil!` : `Rotasi Mundur ${team === 'A' ? 'Tim A' : 'Tim B'} Berhasil!`);
      }, 400);

    } else {
      showToast("Rotasi membutuhkan 6 pemain inti!");
    }
  };

  function renderCourtVisualizer() {
    if (!elCourtVisualizerPanel || elCourtVisualizerPanel.style.display === 'none') return;

    const sportKey = rubricEngine.currentSport;
    const sportName = (state.meta.olahraga || '').toLowerCase();
    const isSenamMode = (sportKey === 'senam' || sportName.includes('senam') || sportName.includes('gymnastics'));

    if (isSenamMode) {
      elCourtWrapper.classList.add('wrapper-gymnastics');
    } else {
      elCourtWrapper.classList.remove('wrapper-gymnastics');
    }

    const courtClass = getCourtClassBySport(sportKey);
    const maxPlayers = getMaxPlayersPerSport(sportKey);

    const currentHash = `${sportKey}-${state.selectedKelas}-${state.selectedKelompok}`;

    if (!state.currentLineup) {
      state.currentLineup = { hash: '', startersA: [], benchA: [], startersB: [], benchB: [], officials: {}, poolOther: [] };
    }

    const baseStudents = state.students.filter(s => s.kelas === state.selectedKelas);

    // Initialize lineup if configuration changed
    if (state.currentLineup.hash !== currentHash) {
      let activeStudentsTeamA = [];
      let activeStudentsTeamB = [];

      if (state.selectedKelompok !== 'all' && state.selectedKelompok.startsWith('match:')) {
        const [g1, g2] = state.selectedKelompok.replace('match:', '').split('+');
        activeStudentsTeamA = baseStudents.filter(s => s.kelompok === g1);
        activeStudentsTeamB = baseStudents.filter(s => s.kelompok === g2);
      } else if (state.selectedKelompok !== 'all') {
        activeStudentsTeamA = baseStudents.filter(s => s.kelompok === state.selectedKelompok);
      } else {
        const midIndex = Math.ceil(baseStudents.length / 2);
        activeStudentsTeamA = baseStudents.slice(0, midIndex);
        activeStudentsTeamB = baseStudents.slice(midIndex);
      }

      const otherStudents = baseStudents.filter(s => !activeStudentsTeamA.includes(s) && !activeStudentsTeamB.includes(s));

      state.currentLineup.hash = currentHash;
      state.currentLineup.startersA = activeStudentsTeamA.slice(0, maxPlayers).map(s => s.id);
      state.currentLineup.benchA = activeStudentsTeamA.slice(maxPlayers).map(s => s.id);
      state.currentLineup.startersB = activeStudentsTeamB.slice(0, maxPlayers).map(s => s.id);
      state.currentLineup.benchB = activeStudentsTeamB.slice(maxPlayers).map(s => s.id);

      const officialRoles = getSportOfficials(sportKey);
      state.currentLineup.officials = {};
      officialRoles.forEach(r => { state.currentLineup.officials[r] = null; });

      state.currentLineup.officials['pelatih_a'] = null;
      state.currentLineup.officials['official_a'] = null;
      state.currentLineup.officials['pelatih_b'] = null;
      state.currentLineup.officials['official_b'] = null;

      state.currentLineup.poolOther = otherStudents.map(s => s.id);
    }

    // Helper to map IDs back to student objects
    const getStd = (id) => state.students.find(s => s.id === id);

    const startersA = state.currentLineup.startersA.map(getStd).filter(Boolean);
    const benchA = state.currentLineup.benchA.map(getStd).filter(Boolean);
    const startersB = state.currentLineup.startersB.map(getStd).filter(Boolean);
    const benchB = state.currentLineup.benchB.map(getStd).filter(Boolean);

    let courtHTML = `<div class="court-container ${courtClass}">`;

    if (courtClass === 'court-basketball') {
      courtHTML += `
          <div class="bb-3pt-top"></div>
          <div class="bb-paint-top"></div>
          <div class="bb-3pt-bottom"></div>
          <div class="bb-paint-bottom"></div>
        `;
    } else if (courtClass === 'court-volleyball') {
      courtHTML += `
          <div class="vb-attack-line-top"></div>
          <div class="vb-attack-line-bottom"></div>
          
          <!-- Tombol Rotasi Tim B (Atas) -->
          <div class="court-rot-btn-group" style="top: 8px; right: 8px;">
            <button class="btn-rot-fwd" onclick="window.rotateVoli('B', 'forward')" title="Rotasi Maju Tim B (Searah Jarum Jam FIVB)">
              <i class="fa-solid fa-rotate-right"></i> Rotasi B
            </button>
            <button onclick="window.rotateVoli('B', 'backward')" title="Mundur Rotasi / Koreksi Tim B">
              <i class="fa-solid fa-rotate-left"></i> Mundur
            </button>
          </div>

          <!-- Tombol Rotasi Tim A (Bawah) -->
          <div class="court-rot-btn-group" style="bottom: 8px; right: 8px;">
            <button class="btn-rot-fwd" onclick="window.rotateVoli('A', 'forward')" title="Rotasi Maju Tim A (Searah Jarum Jam FIVB)">
              <i class="fa-solid fa-rotate-right"></i> Rotasi A
            </button>
            <button onclick="window.rotateVoli('A', 'backward')" title="Mundur Rotasi / Koreksi Tim A">
              <i class="fa-solid fa-rotate-left"></i> Mundur
            </button>
          </div>
        `;
    } else if (courtClass === 'court-badminton') {
      courtHTML += `
          <div class="bm-singles-sideline-left"></div>
          <div class="bm-singles-sideline-right"></div>
          <div class="bm-doubles-backline-top"></div>
          <div class="bm-doubles-backline-bottom"></div>
          <div class="bm-service-line-top"></div>
          <div class="bm-service-line-bottom"></div>
          <div class="bm-center-line-top"></div>
          <div class="bm-center-line-bottom"></div>
        `;
    } else if (courtClass === 'court-general') {
      courtHTML += `
          <div class="cg-penalty-top"></div>
          <div class="cg-penalty-bottom"></div>
        `;
    }

    let teamA = "TIM A";
    let teamB = "TIM B";
    if (state.selectedKelompok !== 'all' && state.selectedKelompok.startsWith('match:')) {
      const [g1, g2] = state.selectedKelompok.replace('match:', '').split('+');
      teamA = g1.toUpperCase();
      teamB = g2.toUpperCase();
    } else if (state.selectedKelompok !== 'all') {
      teamA = state.selectedKelompok.toUpperCase();
      teamB = "LAWAN";
    }

    if (!isSenamMode) {
      courtHTML += `
            <div class="team-label team-label-top"><i class="fa-solid fa-users" style="color: #3b82f6;"></i> ${escapeHtml(teamB)}</div>
            <div class="team-label team-label-bottom"><i class="fa-solid fa-users" style="color: #10b981;"></i> ${escapeHtml(teamA)}</div>
        `;
    }

    function createPlayerPin(student, topPercent, leftPercent, isBench = false) {
      // Determine whether student is an official or player to match criteria
      const loc = findStudentLocation(student.id);
      const isOfficialLoc = loc && loc.obj === state.currentLineup.officials;
      const cList = isOfficialLoc ? rubricEngine.getCriteria('Perangkat Pertandingan') : rubricEngine.getCriteria('Pemain');

      let totalAnswered = 0;
      cList.forEach(c => {
        if (student.scores && student.scores[c.id] && parseInt(student.scores[c.id]) > 0) {
          totalAnswered++;
        }
      });
      const totalCriteriaCount = cList.length;
      const scoreStr = `${totalAnswered} / ${totalCriteriaCount}`;
      const isComplete = totalAnswered === totalCriteriaCount && totalCriteriaCount > 0;
      const scoreBg = isComplete ? '#10b981' : (totalAnswered > 0 ? '#f59e0b' : '#ef4444');
      const shortName = student.name.split(' ')[0];

      const isBenchSelectable = isBench && window.isManualSubMode;
      const extraClass = isBench ? 'bench-pin' : (selectedBenchPlayerIdForSub ? 'highlight-substitute' : (window.isManualSubMode ? 'highlight-substitute' : ''));
      const selectedClass = selectedBenchPlayerIdForSub === student.id ? 'selected-for-sub' : '';
      const titleText = selectedBenchPlayerIdForSub ? 'Klik untuk tukar posisi dengan pemain ini' : (window.isManualSubMode ? 'Klik untuk memilih pemain yang akan ditukar' : 'Klik untuk menilai murid');

      let badgesHtml = '';
      if (student.apresiasi) badgesHtml += '<span title="Inisiatif / Apresiasi" style="font-size:0.65rem; margin-left:2px;">⭐</span>';
      if (student.yellowCard) badgesHtml += '<span title="Kartu Kuning" style="display:inline-block; width:6px; height:8px; background:#eab308; border-radius:1px; margin-left:2px; vertical-align:middle;"></span>';
      if (student.redCard) badgesHtml += '<span title="Kartu Merah" style="display:inline-block; width:6px; height:8px; background:#ef4444; border-radius:1px; margin-left:2px; vertical-align:middle;"></span>';

      let pinTop = topPercent;
      let pinLeft = leftPercent;
      if (isSenamMode && !isBench && state.currentLineup.customPositions && state.currentLineup.customPositions[student.id]) {
        pinTop = state.currentLineup.customPositions[student.id].y;
        pinLeft = state.currentLineup.customPositions[student.id].x;
      }

      const dragHandler = (isSenamMode && !isBench) ? `onpointerdown="window.startDragPin(event, '${student.id}')"` : '';
      const cursorStyle = (isSenamMode && !isBench) ? `cursor: grab; touch-action: none;` : '';

      return `
          <div class="player-pin ${extraClass} ${selectedClass}" 
               ${!isBench ? `style="top: ${pinTop}%; left: ${pinLeft}%; ${cursorStyle}"` : ''} 
               data-studentid="${student.id}" data-isbench="${isBench}" 
               onclick="window.handlePlayerPinClick('${student.id}', event)"
               ${dragHandler}
               title="${escapeHtml(student.name)} - ${titleText}">
             <div class="pin-name">${escapeHtml(shortName)}${badgesHtml}</div>
             <div class="pin-score" style="background: ${scoreBg};">${scoreStr}</div>
          </div>
        `;
    }

    // Distribute Starters A
    startersA.forEach((std, i) => {
      const pos = getPlayerPosition(sportKey, 'A', i);
      courtHTML += createPlayerPin(std, pos.top, pos.left, false);
    });

    // Distribute Starters B
    startersB.forEach((std, i) => {
      const pos = getPlayerPosition(sportKey, 'B', i);
      courtHTML += createPlayerPin(std, pos.top, pos.left, false);
    });

    // Distribute Officials
    if (!isSenamMode) {
      const officialRoles = Object.keys(state.currentLineup.officials || {});
      officialRoles.forEach(role => {
        const stdId = state.currentLineup.officials[role];
        const std = getStd(stdId);
        const displayRole = role.replace(/_/g, ' ').toUpperCase();

        if (std) {
          const rawPin = createPlayerPin(std, 0, 0, true);
          courtHTML += `<div class="official-slot pos-${role}" data-role="${role}" style="display:flex; flex-direction:column; align-items:center; cursor:pointer;" title="Perangkat: ${displayRole} (${escapeHtml(std.name)}) - Klik untuk kelola / nilai" onclick="window.handleOfficialSlotClick('${role}')">
                    <div class="official-badge-label">${displayRole}</div>
                    ${rawPin}
                </div>`;
        } else {
          courtHTML += `<div class="official-slot pos-${role}" data-role="${role}" title="Slot ${displayRole} - Klik untuk tugaskan murid" onclick="window.handleOfficialSlotClick('${role}')">
                    <div class="empty-official-slot">
                      <div style="font-size:0.5rem; font-weight:800; text-align:center; line-height:1.1; color:#0369a1;">${displayRole}</div>
                      <i class="fa-solid fa-plus" style="font-size:0.85rem; margin-top:2px; color:#0284c7;"></i>
                    </div>
                </div>`;
        }
      });
    }

    courtHTML += `</div>`;
    elCourtWrapper.innerHTML = courtHTML;

    // Render Bench & Pool Area
    const elBenchArea = document.getElementById('benchArea');
    const elBenchContainer = document.getElementById('benchPlayersContainer');
    if (elBenchArea && elBenchContainer) {
      let benchHTML = '';

      if (benchA.length > 0) {
        benchHTML += `<div style="margin-bottom: 15px; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                    <div style="font-size: 0.8rem; font-weight: bold; color: #64748b;">Cadangan ${escapeHtml(teamA)}</div>
                    <button class="btn btn-outline-sm" onclick="window.swapAllPlayers('A')" style="font-size: 0.7rem; padding: 2px 6px;">
                        <i class="fa-solid fa-arrows-rotate"></i> Ganti Semua
                    </button>
                </div>
                <div style="display: flex; flex-wrap: wrap; gap: 12px;">`;
        benchA.forEach(std => { benchHTML += createPlayerPin(std, 0, 0, true); });
        benchHTML += `</div></div>`;
      }

      if (benchB.length > 0) {
        benchHTML += `<div style="margin-bottom: 15px; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                    <div style="font-size: 0.8rem; font-weight: bold; color: #64748b;">Cadangan ${escapeHtml(teamB)}</div>
                    <button class="btn btn-outline-sm" onclick="window.swapAllPlayers('B')" style="font-size: 0.7rem; padding: 2px 6px;">
                        <i class="fa-solid fa-arrows-rotate"></i> Ganti Semua
                    </button>
                </div>
                <div style="display: flex; flex-wrap: wrap; gap: 12px;">`;
        benchB.forEach(std => { benchHTML += createPlayerPin(std, 0, 0, true); });
        benchHTML += `</div></div>`;
      }

      const poolStudents = state.currentLineup.poolOther.map(getStd).filter(Boolean);
      if (poolStudents.length > 0 && !isSenamMode) {
        benchHTML += `<div>
                <div style="font-size: 0.8rem; font-weight: bold; color: #64748b; margin-bottom: 8px;">Kumpulan Murid Lainnya (Tersedia untuk Perangkat Pertandingan)</div>
                <div style="display: flex; flex-wrap: wrap; gap: 12px;">`;
        poolStudents.forEach(std => { benchHTML += createPlayerPin(std, 0, 0, true); });
        benchHTML += `</div></div>`;
      }

      if (benchHTML.trim().length > 0) {
        elBenchArea.style.display = 'block';
        elBenchContainer.innerHTML = benchHTML;
      } else {
        elBenchArea.style.display = 'none';
        elBenchContainer.innerHTML = '';
      }
    }

    // Render Match Scoreboard & Evidence
    renderMatchScoreboard();
    renderMatchEvidencePrint();
  }

  // Global Handler for Player Pin Click
  window.handlePlayerPinClick = function (stdId, e) {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    if (window.wasDraggingPin) {
      window.wasDraggingPin = false;
      return;
    }
    triggerHapticFeedback();
    if (!stdId) return;

    if (selectedBenchPlayerIdForSub) {
      if (selectedBenchPlayerIdForSub === stdId) {
        selectedBenchPlayerIdForSub = null;
        renderCourtVisualizer();
        showToast('Mode substitusi dibatalkan.');
      } else {
        swapPlayers(selectedBenchPlayerIdForSub, stdId);
        if (!window.isManualSubMode) {
          selectedBenchPlayerIdForSub = null;
        }
      }
    } else if (window.isManualSubMode) {
      selectedBenchPlayerIdForSub = stdId;
      renderCourtVisualizer();
    } else {
      openSingleStudentScoreModal(stdId);
    }
  };

  // -------------------------------------------------------------
  // MATCH SCOREBOARD & EVIDENCE SYSTEM
  // -------------------------------------------------------------
  function getCurrentMatchKey() {
    const sport = rubricEngine ? rubricEngine.currentSport : 'sport';
    const kls = state.selectedKelas || 'X E-1';
    const grp = state.selectedKelompok || 'all';
    return `${sport}_${kls}_${grp}`;
  }

  function getMatchTeamNames() {
    let teamA = "Tim A";
    let teamB = "Tim B";
    if (state.selectedKelompok !== 'all' && state.selectedKelompok.startsWith('match:')) {
      const [g1, g2] = state.selectedKelompok.replace('match:', '').split('+');
      teamA = g1.toUpperCase();
      teamB = g2.toUpperCase();
    } else if (state.selectedKelompok !== 'all') {
      teamA = state.selectedKelompok.toUpperCase();
      teamB = "LAWAN";
    }
    return { teamA, teamB };
  }

  function getCurrentMatchData() {
    if (!state.matchResults) state.matchResults = {};
    const key = getCurrentMatchKey();
    const { teamA, teamB } = getMatchTeamNames();

    if (!state.matchResults[key]) {
      state.matchResults[key] = {
        scoreA: 0,
        scoreB: 0,
        period: '',
        status: 'ongoing',
        notes: '',
        teamA: teamA,
        teamB: teamB,
        updatedAt: new Date().toISOString()
      };
    } else {
      state.matchResults[key].teamA = teamA;
      state.matchResults[key].teamB = teamB;
    }
    return state.matchResults[key];
  }

  window.changeMatchScore = function (team, delta) {
    triggerHapticFeedback();
    const data = getCurrentMatchData();
    if (team === 'A') {
      data.scoreA = Math.max(0, (parseInt(data.scoreA) || 0) + delta);
    } else {
      data.scoreB = Math.max(0, (parseInt(data.scoreB) || 0) + delta);
    }
    data.updatedAt = new Date().toISOString();
    saveState();
    renderMatchScoreboard();
    renderMatchEvidencePrint();
  };

  window.setMatchScoreManual = function (team, val) {
    const data = getCurrentMatchData();
    const parsed = Math.max(0, parseInt(val) || 0);
    if (team === 'A') data.scoreA = parsed;
    else data.scoreB = parsed;
    data.updatedAt = new Date().toISOString();
    saveState();
    renderMatchScoreboard();
    renderMatchEvidencePrint();
  };

  window.handleMatchStatusChange = function (status) {
    const data = getCurrentMatchData();
    data.status = status;
    data.updatedAt = new Date().toISOString();
    saveState();
    renderMatchScoreboard();
    renderMatchEvidencePrint();
    showToast(status === 'finished' ? 'Pertandingan ditandai Selesai (Final)!' : 'Status pertandingan diperbarui.');
  };

  window.saveMatchPeriod = function (period) {
    const data = getCurrentMatchData();
    data.period = period.trim();
    data.updatedAt = new Date().toISOString();
    saveState();
    renderMatchEvidencePrint();
  };

  window.saveMatchEvidenceNotes = function (notes) {
    const data = getCurrentMatchData();
    data.notes = notes.trim();
    data.updatedAt = new Date().toISOString();
    saveState();
    renderMatchEvidencePrint();
    showToast('Catatan eviden pertandingan tersimpan!');
  };

  function hasMatchScoring(sportKey) {
    const sKey = (sportKey || (rubricEngine ? rubricEngine.currentSport : '')).toLowerCase();
    const sName = (state.meta.olahraga || (rubricEngine ? rubricEngine.getSportDisplayName() : '')).toLowerCase();

    // Individual / artistic / non-match sports without head-to-head match scoring
    if (sKey.includes('atletik') || sName.includes('atletik') || sName.includes('lari') || sName.includes('jalan cepat') || sName.includes('lompat') || sName.includes('lempar')) return false;
    if (sKey.includes('senam') || sName.includes('senam') || sName.includes('irama') || sName.includes('lantai') || sName.includes('aerobik') || sName.includes('artistik')) return false;
    if (sKey.includes('renang') || sName.includes('renang')) return false;
    if (sKey.includes('kebugaran') || sName.includes('kebugaran')) return false;

    return true;
  }

  function renderMatchScoreboard() {
    const elPanel = document.getElementById('matchScoreboardPanel');
    if (!elPanel) return;

    const sportKey = rubricEngine ? rubricEngine.currentSport : 'sport';
    const sportName = (state.meta.olahraga || (rubricEngine ? rubricEngine.getSportDisplayName() : '')).toLowerCase();

    if (!hasMatchScoring(sportKey)) {
      elPanel.style.display = 'none';
      return;
    }
    elPanel.style.display = 'block';

    const data = getCurrentMatchData();
    const { teamA, teamB } = getMatchTeamNames();

    const elTeamAName = document.getElementById('sbTeamAName');
    const elTeamBName = document.getElementById('sbTeamBName');
    const elScoreWrapA = document.querySelector('.team-a-block .score-display-wrap');
    const elScoreWrapB = document.querySelector('.team-b-block .score-display-wrap');
    const elPeriod = document.getElementById('inputMatchPeriod');
    const elStatus = document.getElementById('selectMatchStatus');
    const elNotes = document.getElementById('inputMatchEvidenceNotes');

    if (elTeamAName) elTeamAName.innerHTML = `<i class="fa-solid fa-users" style="color: #10b981;"></i> ${escapeHtml(teamA)}`;
    if (elTeamBName) elTeamBName.innerHTML = `<i class="fa-solid fa-users" style="color: #3b82f6;"></i> ${escapeHtml(teamB)}`;
    if (elPeriod) elPeriod.value = data.period || '';
    if (elStatus) elStatus.value = data.status || 'ongoing';
    if (elNotes) elNotes.value = data.notes || '';

    const isBasketball = sportKey === 'basket' || sportName.includes('basket');

    const scoreAVal = data.scoreA !== undefined ? data.scoreA : 0;
    const scoreBVal = data.scoreB !== undefined ? data.scoreB : 0;

    if (elScoreWrapA) {
      elScoreWrapA.innerHTML = `
              <button class="btn-score-ctrl btn-sub" onclick="window.changeMatchScore('A', -1)" title="Kurang 1 poin">-1</button>
              <input type="number" id="sbScoreA" class="input-score-val" value="${scoreAVal}" min="0" onchange="window.setMatchScoreManual('A', this.value)">
              <button class="btn-score-ctrl btn-add" onclick="window.changeMatchScore('A', 1)" title="Tambah 1 poin">+1</button>
              ${isBasketball ? `
                <button class="btn-score-ctrl btn-add-lg" onclick="window.changeMatchScore('A', 2)" title="Field Goal 2 poin">+2</button>
                <button class="btn-score-ctrl btn-add-lg" onclick="window.changeMatchScore('A', 3)" title="Three Point 3 poin">+3</button>
              ` : ''}
          `;
    }

    if (elScoreWrapB) {
      elScoreWrapB.innerHTML = `
              <button class="btn-score-ctrl btn-sub" onclick="window.changeMatchScore('B', -1)" title="Kurang 1 poin">-1</button>
              <input type="number" id="sbScoreB" class="input-score-val" value="${scoreBVal}" min="0" onchange="window.setMatchScoreManual('B', this.value)">
              <button class="btn-score-ctrl btn-add" onclick="window.changeMatchScore('B', 1)" title="Tambah 1 poin">+1</button>
              ${isBasketball ? `
                <button class="btn-score-ctrl btn-add-lg" onclick="window.changeMatchScore('B', 2)" title="Field Goal 2 poin">+2</button>
                <button class="btn-score-ctrl btn-add-lg" onclick="window.changeMatchScore('B', 3)" title="Three Point 3 poin">+3</button>
              ` : ''}
          `;
    }
  }

  function renderMatchEvidencePrint() {
    const elPrintBox = document.getElementById('matchEvidencePrintBox');
    const elPrintContent = document.getElementById('printEvidenceContent');
    const elSportBadge = document.getElementById('printEvidenceSportBadge');
    if (!elPrintBox || !elPrintContent) return;

    const sportKey = rubricEngine ? rubricEngine.currentSport : 'sport';
    if (!hasMatchScoring(sportKey)) {
      elPrintBox.style.display = 'none';
      return;
    }

    const data = getCurrentMatchData();
    const { teamA, teamB } = getMatchTeamNames();
    const sportName = state.meta.olahraga || (rubricEngine ? rubricEngine.getSportDisplayName() : 'PJOK');

    if (elSportBadge) elSportBadge.innerText = sportName.toUpperCase();

    // Determine Winner if finished
    let winnerBadge = '';
    if (data.status === 'finished') {
      if (data.scoreA > data.scoreB) {
        winnerBadge = `<span style="background: #10b981; color: #fff; font-size: 0.75rem; font-weight: 800; padding: 3px 8px; border-radius: 4px;"><i class="fa-solid fa-crown"></i> Pemenang: ${escapeHtml(teamA)}</span>`;
      } else if (data.scoreB > data.scoreA) {
        winnerBadge = `<span style="background: #3b82f6; color: #fff; font-size: 0.75rem; font-weight: 800; padding: 3px 8px; border-radius: 4px;"><i class="fa-solid fa-crown"></i> Pemenang: ${escapeHtml(teamB)}</span>`;
      } else {
        winnerBadge = `<span style="background: #64748b; color: #fff; font-size: 0.75rem; font-weight: 800; padding: 3px 8px; border-radius: 4px;">Hasil Imbang (Seri)</span>`;
      }
    } else {
      winnerBadge = `<span style="background: #f59e0b; color: #fff; font-size: 0.75rem; font-weight: 800; padding: 3px 8px; border-radius: 4px;"><i class="fa-solid fa-stopwatch"></i> Status: Sedang Berlangsung</span>`;
    }

    // Collect active officials
    const activeOfficials = [];
    if (state.currentLineup && state.currentLineup.officials) {
      for (let role in state.currentLineup.officials) {
        const stdId = state.currentLineup.officials[role];
        if (stdId) {
          const std = state.students.find(s => s.id === stdId);
          if (std) {
            const displayRole = role.replace(/_/g, ' ').toUpperCase();
            activeOfficials.push(`<strong>${displayRole}:</strong> ${escapeHtml(std.name)}`);
          }
        }
      }
    }

    const officialsHtml = activeOfficials.length > 0
      ? activeOfficials.join(' &bull; ')
      : '<em class="text-muted">Perangkat pertandingan belum ditugaskan.</em>';

    elPrintContent.innerHTML = `
        <div class="evidence-grid">
          <div class="evidence-score-card">
            <div>
              <div style="font-size: 0.75rem; font-weight: 800; color: #64748b; text-transform: uppercase;">Skor Akhir Laga</div>
              <div style="font-size: 1.1rem; font-weight: 800; color: #1e293b; margin-top: 4px;">
                ${escapeHtml(teamB)} <span class="evidence-score-num" style="color: #3b82f6;">${data.scoreB}</span> - <span class="evidence-score-num" style="color: #10b981;">${data.scoreA}</span> ${escapeHtml(teamA)}
              </div>
              ${data.period ? `<div style="font-size: 0.75rem; color: #475569; margin-top: 2px;">Rincian Set/Babak: <strong>${escapeHtml(data.period)}</strong></div>` : ''}
            </div>
            <div>${winnerBadge}</div>
          </div>

          <div class="evidence-score-card">
            <div>
              <div style="font-size: 0.75rem; font-weight: 800; color: #64748b; text-transform: uppercase; margin-bottom: 4px;">Petugas Pertandingan (Eviden Perangkat)</div>
              <div class="evidence-officials-list">${officialsHtml}</div>
            </div>
          </div>

          <div class="evidence-notes-box">
            <strong><i class="fa-solid fa-comment-dots"></i> Catatan Khusus Guru / Eviden Unjuk Kerja:</strong>
            <p style="margin: 4px 0 0 0; font-size: 0.82rem; line-height: 1.4;">
              ${data.notes ? escapeHtml(data.notes) : 'Pertandingan simulasi unjuk kerja autentik terlaksana dengan tertib, kompetitif, serta menjunjung tinggi nilai sportivitas, kerja sama tim, dan kepatuhan terhadap regulasi cabang olahraga.'}
            </p>
          </div>
        </div>
      `;

    elPrintBox.style.display = 'block';
  }

  // Helper to open score modal directly from court pin
  function openSingleStudentScoreModal(studentId) {
    const student = state.students.find(s => s.id === studentId);
    if (!student) return;

    const modalHeader = document.getElementById('singleStudentModalHeader');
    if (modalHeader) {
      modalHeader.innerHTML = `
           <div>
             <h3 style="font-size: 1.25rem; font-weight: 800; color: #1e293b; margin: 0;">${escapeHtml(student.name)}</h3>
             <div style="font-size: 0.8rem; color: #64748b; font-weight: 600; margin-top: 2px;">
               ${escapeHtml(student.kelompok || 'Kelompok')} &bull; ${escapeHtml(student.kelas || 'X E-1')}
             </div>
           </div>
           <button class="btn-substitusi-modal" onclick="window.triggerSubFromModal('${student.id}')" title="Tukar posisi / substitusi pemain">
             <i class="fa-solid fa-arrows-rotate"></i> Substitusi
           </button>
         `;
    }

    const loc = findStudentLocation(student.id);
    const isOfficialLoc = loc && loc.obj === state.currentLineup.officials;
    const criteriaList = isOfficialLoc ? rubricEngine.getCriteria('Perangkat Pertandingan') : rubricEngine.getCriteria('Pemain');
    let html = '';
    const levelLabels = {
      1: 'Berkembang',
      2: 'Layak',
      3: 'Cakap',
      4: 'Mahir'
    };

    criteriaList.forEach(c => {
      const currentScore = (student.scores && student.scores[c.id]) ? parseInt(student.scores[c.id]) : 0;

      let buttonsHtml = '';
      const maxScore = 4;
      for (let v = 1; v <= maxScore; v++) {
        const activeClass = v === currentScore ? `active-${v}` : '';
        buttonsHtml += `
              <button class="btn-score-level ${activeClass}" 
                onclick="window.updateSingleStudentScore('${student.id}', '${c.id}', ${v})">
                <div class="level-num">${v}</div>
                <div class="level-label">${levelLabels[v]}</div>
              </button>
            `;
      }

      const descriptors = c.descriptors || {};
      const safeCritName = escapeHtml(c.name).replace(/'/g, "\\'");
      const safeD1 = escapeHtml(descriptors[1] || '-').replace(/'/g, "\\'");
      const safeD2 = escapeHtml(descriptors[2] || '-').replace(/'/g, "\\'");
      const safeD3 = escapeHtml(descriptors[3] || '-').replace(/'/g, "\\'");
      const safeD4 = escapeHtml(descriptors[4] || '-').replace(/'/g, "\\'");

      html += `
          <div class="crit-eval-row">
             <div class="crit-eval-header">
                <span class="crit-eval-title">${escapeHtml(c.name)}</span>
                <button class="crit-eval-info-btn" title="Klik untuk lihat rincian deskriptor rubrik" onclick="alert('${safeCritName}\\n\\n1 (Berkembang): ${safeD1}\\n\\n2 (Layak): ${safeD2}\\n\\n3 (Cakap): ${safeD3}\\n\\n4 (Mahir): ${safeD4}')">
                  <i class="fa-solid fa-info"></i>
                </button>
             </div>
             <div class="crit-buttons-grid">
                ${buttonsHtml}
             </div>
          </div>
        `;
    });

    // Incident, Discipline & Appreciation Section
    html += `
         <div style="margin-top: 15px; display: flex; justify-content: center; padding: 0 10px;">
           <button class="btn btn-danger-sm" style="width: 100%; border-radius: 8px; padding: 10px; font-size: 0.85rem;" onclick="window.resetSingleStudentScores('${student.id}')">
             <i class="fa-solid fa-rotate-left"></i> Batalkan Semua Nilai Kriteria
           </button>
         </div>
       `;

    const isApresiasi = !!student.apresiasi;
    const isYellow = !!student.yellowCard;
    const isRed = !!student.redCard;
    const noteText = student.catatanKhusus || '';

    html += `
       <div class="incident-eval-box" style="margin-top: 20px; padding-top: 15px; border-top: 2px dashed #cbd5e1;">
         <h4 style="font-size: 0.85rem; font-weight: 700; color: #475569; margin: 0 0 10px 0;"><i class="fa-solid fa-triangle-exclamation"></i> Catatan Khusus & Insiden</h4>
         <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 12px;">
           <button class="btn-incident-toggle ${isApresiasi ? 'active-apresiasi' : ''}" onclick="window.toggleStudentDiscipline('${student.id}', 'apresiasi')" style="border-color: #facc15; color: #ca8a04;">
             <i class="fa-solid fa-star"></i> Apresiasi
           </button>
           <button class="btn-incident-toggle ${isYellow ? 'active-yellow' : ''}" onclick="window.toggleStudentDiscipline('${student.id}', 'yellowCard')" style="border-color: #eab308; color: #a16207;">
             <div class="card-icon" style="background: #facc15;"></div> Kartu Kuning
           </button>
           <button class="btn-incident-toggle ${isRed ? 'active-red' : ''}" onclick="window.toggleStudentDiscipline('${student.id}', 'redCard')" style="border-color: #ef4444; color: #b91c1c;">
             <div class="card-icon" style="background: #ef4444;"></div> Kartu Merah
           </button>
         </div>
         <textarea class="incident-note-textarea" placeholder="Ketik catatan tambahan di sini..." onchange="window.updateStudentNote('${student.id}', this.value)">${escapeHtml(noteText)}</textarea>
       </div>
     `;

    const container = document.getElementById('singleStudentScoreContainer');
    if (container) container.innerHTML = html;
    const modalEl = document.getElementById('singleStudentScoreModal');
    if (modalEl) {
      modalEl.style.display = 'flex';
      modalEl.classList.add('active');
    }
  }
  window.openSingleStudentScoreModal = openSingleStudentScoreModal;

  // -------------------------------------------------------------
  // PERANGKAT PERTANDINGAN (OFFICIALS) SELECTION MODAL
  // -------------------------------------------------------------
  window.handleOfficialSlotClick = function (role) {
    triggerHapticFeedback();
    const modalOfficial = document.getElementById('modalSelectOfficial');
    const titleEl = document.getElementById('dispSelectOfficialRoleTitle');
    const subEl = document.getElementById('dispSelectOfficialRoleSub');
    const currentCardEl = document.getElementById('selectOfficialCurrentCard');
    const candidateListEl = document.getElementById('selectOfficialCandidateList');

    if (!modalOfficial) return;

    modalOfficial.style.display = 'flex';
    setTimeout(() => {
      modalOfficial.classList.add('active');
    }, 10);

    const displayRole = role.replace(/_/g, ' ').toUpperCase();
    if (titleEl) {
      titleEl.innerHTML = `<i class="fa-solid fa-user-shield" style="color: #0284c7;"></i> Penugasan: ${escapeHtml(displayRole)}`;
    }

    // Check competing groups
    let groupA = '';
    let groupB = '';
    if (state.selectedKelompok && state.selectedKelompok.startsWith('match:')) {
      const parts = state.selectedKelompok.replace('match:', '').split('+');
      groupA = parts[0] || '';
      groupB = parts[1] || '';
    } else if (state.selectedKelompok && state.selectedKelompok !== 'all') {
      groupA = state.selectedKelompok;
    }

    const isTeamARole = role === 'pelatih_a' || role === 'official_a';
    const isTeamBRole = role === 'pelatih_b' || role === 'official_b';

    if (subEl) {
      if (isTeamARole) {
        subEl.innerText = `Pilih murid dari ${groupA || 'Tim A'} untuk ditugaskan sebagai ${displayRole}`;
      } else if (isTeamBRole) {
        subEl.innerText = `Pilih murid dari ${groupB || 'Tim B'} untuk ditugaskan sebagai ${displayRole}`;
      } else {
        subEl.innerText = `Hanya menampilkan murid netral di luar kelompok yang bertanding (${groupA || 'Tim A'} & ${groupB || 'Tim B'})`;
      }
    }

    // Currently assigned student in this role
    const currentStdId = (state.currentLineup && state.currentLineup.officials) ? state.currentLineup.officials[role] : null;
    const currentStd = currentStdId ? state.students.find(s => s.id === currentStdId) : null;

    if (currentCardEl) {
      if (currentStd) {
        currentCardEl.innerHTML = `
                <div style="background: #e0f2fe; border: 1.5px solid #7dd3fc; border-radius: 10px; padding: 12px 14px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
                  <div>
                    <div style="font-size: 0.72rem; font-weight: 800; color: #0369a1; text-transform: uppercase;">Petugas Saat Ini:</div>
                    <div style="font-size: 1rem; font-weight: 800; color: #0f172a;">${escapeHtml(currentStd.name)}</div>
                    <small style="color: #475569;">${escapeHtml(currentStd.kelompok || 'Kelompok')} (${escapeHtml(currentStd.kelas || '')})</small>
                  </div>
                  <div style="display: flex; gap: 6px;">
                    <button class="btn btn-primary-sm" onclick="document.getElementById('modalSelectOfficial').classList.remove('active'); document.getElementById('modalSelectOfficial').style.display='none'; openSingleStudentScoreModal('${currentStd.id}')">
                      <i class="fa-solid fa-pen-to-square"></i> Nilai Unjuk Kerja
                    </button>
                    <button class="btn btn-danger-sm" onclick="window.removeOfficialFromRole('${role}')">
                      <i class="fa-solid fa-trash-can"></i> Hapus
                    </button>
                  </div>
                </div>
              `;
      } else {
        currentCardEl.innerHTML = `
                <div style="background: #f1f5f9; border: 1px dashed #cbd5e1; border-radius: 8px; padding: 8px 12px; font-size: 0.8rem; color: #64748b;">
                  <i class="fa-solid fa-circle-info"></i> Belum ada murid yang ditugaskan pada slot ini.
                </div>
              `;
      }
    }

    // Filter available candidates
    let candidatePool = [];
    const currentClassStudents = state.students.filter(s => state.selectedKelas === 'all' || s.kelas === state.selectedKelas);
    const startersA = state.currentLineup.startersA || [];
    const startersB = state.currentLineup.startersB || [];

    // Mencegah nama yang sudah terpilih di slot official lain muncul lagi
    const assignedOtherRoleIds = Object.entries(state.currentLineup.officials || {})
      .filter(([r, id]) => r !== role && id !== null)
      .map(([r, id]) => id);

    const isEligible = (s) => !assignedOtherRoleIds.includes(s.id);

    if (isTeamARole) {
      candidatePool = currentClassStudents.filter(s => s.kelompok === groupA && !startersA.includes(s.id) && isEligible(s));
    } else if (isTeamBRole) {
      candidatePool = currentClassStudents.filter(s => s.kelompok === groupB && !startersB.includes(s.id) && isEligible(s));
    } else {
      // Neutral officials: MUST NOT belong to groupA or groupB
      candidatePool = currentClassStudents.filter(s => {
        if (groupA && s.kelompok === groupA) return false;
        if (groupB && s.kelompok === groupB) return false;
        if (!isEligible(s)) return false;
        return true;
      });
    }

    if (candidateListEl) {
      if (candidatePool.length === 0) {
        candidateListEl.innerHTML = `<div style="grid-column: 1/-1; padding: 16px; text-align: center; color: #94a3b8; font-size: 0.85rem;">Tidak ada murid netral yang tersedia di kelas ini.</div>`;
      } else {
        let html = '';
        candidatePool.forEach(std => {
          const isAssignedToThis = std.id === currentStdId;
          html += `
                    <div style="background: ${isAssignedToThis ? '#f0fdf4' : '#ffffff'}; border: 1.5px solid ${isAssignedToThis ? '#22c55e' : '#e2e8f0'}; border-radius: 8px; padding: 8px 10px; cursor: pointer; display: flex; flex-direction: column; justify-content: space-between; gap: 4px; transition: all 0.15s;" 
                         onclick="window.assignOfficialToRole('${role}', '${std.id}')" 
                         onmouseover="this.style.borderColor='#3b82f6'" 
                         onmouseout="this.style.borderColor='${isAssignedToThis ? '#22c55e' : '#e2e8f0'}'">
                      <div style="font-size: 0.82rem; font-weight: 700; color: #1e293b; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${escapeHtml(std.name)}</div>
                      <div style="font-size: 0.72rem; color: #64748b; display: flex; justify-content: space-between; align-items: center;">
                        <span>${escapeHtml(std.kelompok || 'Netral')}</span>
                        ${isAssignedToThis ? '<span style="color: #16a34a; font-weight: 800; font-size: 0.7rem;"><i class="fa-solid fa-check"></i> Terpilih</span>' : '<span style="color: #0284c7; font-weight: 600; font-size: 0.7rem;">+ Pilih</span>'}
                      </div>
                    </div>
                  `;
        });
        candidateListEl.innerHTML = html;
      }
    }
  };

  window.assignOfficialToRole = function (role, studentId) {
    triggerHapticFeedback();
    if (!state.currentLineup) state.currentLineup = {};
    if (!state.currentLineup.officials) state.currentLineup.officials = {};

    // Remove from current array so findStudentLocation finds them in officials
    const loc = findStudentLocation(studentId);
    if (loc && loc.array) {
      const idx = loc.array.indexOf(studentId);
      if (idx > -1) {
        loc.array.splice(idx, 1);
      }
    }

    state.currentLineup.officials[role] = studentId;
    saveState();

    const modalOfficial = document.getElementById('modalSelectOfficial');
    if (modalOfficial) {
      modalOfficial.classList.remove('active');
      setTimeout(() => { modalOfficial.style.display = 'none'; }, 250);
    }

    renderCourtVisualizer();
    const std = state.students.find(s => s.id === studentId);
    const displayRole = role.replace(/_/g, ' ').toUpperCase();
    showToast(`${std ? std.name : 'Murid'} berhasil ditugaskan sebagai ${displayRole}!`);
  };

  window.removeOfficialFromRole = function (role) {
    triggerHapticFeedback();
    if (state.currentLineup && state.currentLineup.officials) {
      const studentId = state.currentLineup.officials[role];
      if (studentId) {
        // Return them to poolOther so they don't disappear
        if (!state.currentLineup.poolOther) state.currentLineup.poolOther = [];
        state.currentLineup.poolOther.push(studentId);
      }
      delete state.currentLineup.officials[role];
      saveState();
    }
    const modalOfficial = document.getElementById('modalSelectOfficial');
    if (modalOfficial) {
      modalOfficial.classList.remove('active');
      setTimeout(() => { modalOfficial.style.display = 'none'; }, 250);
    }
    renderCourtVisualizer();
    showToast(`Slot petugas ${role.replace(/_/g, ' ').toUpperCase()} telah dikosongkan.`);
  };

  // Global function for the inline onclick in the modal
  window.updateSingleStudentScore = function (studentId, critId, value) {
    triggerHapticFeedback();
    const student = state.students.find(s => s.id === studentId);
    if (student) {
      // Toggle / cancel score if clicking the same value
      if (student.scores[critId] === value) {
        const proceed = confirm('Batalkan nilai ini? (Mereset kembali menjadi kosong)');
        if (proceed) {
          delete student.scores[critId];
        } else {
          return;
        }
      } else {
        student.scores[critId] = value;
      }
      saveState();
      // Re-render the modal content to show active button
      openSingleStudentScoreModal(studentId);
      // Also update the main table and the pin in the background
      renderStudentRows();
      renderStats();
      if (elCourtVisualizerPanel && elCourtVisualizerPanel.style.display !== 'none') {
        renderCourtVisualizer();
      }
    }
  };

  window.resetSingleStudentScores = function (studentId) {
    triggerHapticFeedback();
    const proceed = confirm('Apakah Anda yakin ingin membatalkan/mereset seluruh nilai kriteria untuk murid ini secara serentak?');
    if (!proceed) return;
    const student = state.students.find(s => s.id === studentId);
    if (student) {
      student.scores = {};
      saveState();
      openSingleStudentScoreModal(studentId);
      renderStudentRows();
      renderStats();
      if (elCourtVisualizerPanel && elCourtVisualizerPanel.style.display !== 'none') {
        renderCourtVisualizer();
      }
    }
  };

  window.toggleStudentDiscipline = function (studentId, field) {
    triggerHapticFeedback();
    const student = state.students.find(s => s.id === studentId);
    if (student) {
      student[field] = !student[field];
      saveState();
      openSingleStudentScoreModal(studentId);
      renderStudentRows();
      if (elCourtVisualizerPanel && elCourtVisualizerPanel.style.display !== 'none') {
        renderCourtVisualizer();
      }
      const labelMap = {
        'apresiasi': student[field] ? 'Diberikan bintang apresiasi/inisiatif!' : 'Bintang apresiasi dihapus.',
        'yellowCard': student[field] ? 'Diberikan kartu kuning!' : 'Kartu kuning dihapus.',
        'redCard': student[field] ? 'Diberikan kartu merah!' : 'Kartu merah dihapus.'
      };
      showToast(labelMap[field]);
    }
  };

  window.startDragPin = function (e, studentId) {
    if (e.button !== undefined && e.button !== 0) return;

    const pin = e.currentTarget;
    const court = pin.parentElement;
    const courtRect = court.getBoundingClientRect();

    let isDragging = false;
    document.body.style.userSelect = 'none';

    function onMove(moveEvent) {
      isDragging = true;
      let x = ((moveEvent.clientX - courtRect.left) / courtRect.width) * 100;
      let y = ((moveEvent.clientY - courtRect.top) / courtRect.height) * 100;

      x = Math.max(0, Math.min(100, x));
      y = Math.max(0, Math.min(100, y));

      pin.style.left = x + '%';
      pin.style.top = y + '%';
      pin.style.transform = 'translate(-50%, -50%) scale(1.1)';
      pin.style.zIndex = '1000';

      pin.dataset.tempX = x;
      pin.dataset.tempY = y;
    }

    function onUp(upEvent) {
      document.body.style.userSelect = '';
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerup', onUp);

      pin.style.transform = 'translate(-50%, -50%)';
      pin.style.zIndex = '';

      if (isDragging) {
        window.wasDraggingPin = true;
        setTimeout(() => { window.wasDraggingPin = false; }, 200);

        if (!state.currentLineup.customPositions) {
          state.currentLineup.customPositions = {};
        }

        if (pin.dataset.tempX !== undefined && pin.dataset.tempY !== undefined) {
          state.currentLineup.customPositions[studentId] = {
            x: parseFloat(pin.dataset.tempX),
            y: parseFloat(pin.dataset.tempY)
          };
          saveState();
        }
      }
    }

    document.addEventListener('pointermove', onMove);
    document.addEventListener('pointerup', onUp);
  };

  window.updateStudentNote = function (studentId, text) {
    const student = state.students.find(s => s.id === studentId);
    if (student) {
      student.catatanKhusus = text.trim();
      saveState();
      showToast('Catatan siswa disimpan!');
    }
  };

  window.triggerSubFromModal = function (studentId) {
    const modalEl = document.getElementById('singleStudentScoreModal');
    if (modalEl) {
      modalEl.style.display = 'none';
      modalEl.classList.remove('active');
    }
    selectedBenchPlayerIdForSub = studentId;
    if (elCourtVisualizerPanel && elCourtVisualizerPanel.style.display !== 'none') {
      renderCourtVisualizer();
      showToast('Pilih pemain cadangan atau pemain di lapangan untuk ditukar!');
    }
  };

  window.toggleManualSubMode = function () {
    triggerHapticFeedback();
    window.isManualSubMode = !window.isManualSubMode;
    selectedBenchPlayerIdForSub = null;

    const btnToggle = document.getElementById('btnToggleManualSub');
    if (btnToggle) {
      if (window.isManualSubMode) {
        btnToggle.innerHTML = '<i class="fa-solid fa-arrows-rotate"></i> Mode Substitusi: ON';
        btnToggle.style.backgroundColor = '#dbeafe';
        btnToggle.style.borderColor = '#3b82f6';
        btnToggle.style.color = '#1d4ed8';
      } else {
        btnToggle.innerHTML = '<i class="fa-solid fa-arrows-rotate"></i> Mode Substitusi: OFF';
        btnToggle.style.backgroundColor = '#f8fafc';
        btnToggle.style.borderColor = '#cbd5e1';
        btnToggle.style.color = '#334155';
      }
    }

    const hintText = document.getElementById('courtClickHint');
    if (hintText) {
      hintText.innerText = window.isManualSubMode ? 'Klik 2 pemain berturut-turut untuk menukar mereka' : 'Klik pin murid untuk menilai langsung';
    }

    renderCourtVisualizer();
    if (window.isManualSubMode) {
      showToast("Mode Substitusi Aktif: Klik pemain pertama lalu klik pemain kedua untuk ditukar.", "info");
    } else {
      showToast("Mode Substitusi Dinonaktifkan.");
    }
  };

  window.swapAllPlayers = function (teamSide) {
    triggerHapticFeedback();
    let starters = teamSide === 'A' ? state.currentLineup.startersA : state.currentLineup.startersB;
    let bench = teamSide === 'A' ? state.currentLineup.benchA : state.currentLineup.benchB;

    if (starters.length === 0 || bench.length === 0) {
      showToast('Tidak ada pemain cadangan yang bisa ditukar.');
      return;
    }

    // Prioritize bench players with fewer scores
    bench.sort((id1, id2) => {
      const s1 = state.students.find(s => s.id === id1);
      const s2 = state.students.find(s => s.id === id2);
      const scoreCount1 = (s1 && s1.scores) ? Object.keys(s1.scores).length : 0;
      const scoreCount2 = (s2 && s2.scores) ? Object.keys(s2.scores).length : 0;
      return scoreCount1 - scoreCount2;
    });

    const swapCount = Math.min(starters.length, bench.length);
    for (let i = 0; i < swapCount; i++) {
      const temp = starters[i];
      starters[i] = bench[i];
      bench[i] = temp;
    }

    resolveOfficialConflicts();
    saveState();
    renderCourtVisualizer();
    showToast(`Berhasil menukar secara serentak seluruh ${swapCount} pemain cadangan Tim ${teamSide} ke lapangan!`);
  };

  // -------------------------------------------------------------
  // EVENT LISTENERS & SETUP
  // -------------------------------------------------------------
  function setupEventListeners() {
    // Add Court Visualizer Event Listeners
    if (elBtnToggleCourtVisualizer) {
      elBtnToggleCourtVisualizer.addEventListener('click', toggleCourtVisualizer);
    }
    if (elBtnCloseCourtVisualizer) {
      elBtnCloseCourtVisualizer.addEventListener('click', toggleCourtVisualizer);
    }

    const modalSingleStudent = document.getElementById('singleStudentScoreModal');
    if (modalSingleStudent) {
      modalSingleStudent.addEventListener('click', (e) => {
        if (e.target === modalSingleStudent) {
          modalSingleStudent.style.display = 'none';
          modalSingleStudent.classList.remove('active');
          selectedBenchPlayerIdForSub = null;
          if (elCourtVisualizerPanel && elCourtVisualizerPanel.style.display !== 'none') {
            renderCourtVisualizer();
          }
        }
      });
    }

    const btnCloseSelectOfficial = document.getElementById('btnCloseSelectOfficial');
    const modalSelectOfficial = document.getElementById('modalSelectOfficial');
    if (btnCloseSelectOfficial) {
      btnCloseSelectOfficial.addEventListener('click', () => {
        if (modalSelectOfficial) modalSelectOfficial.style.display = 'none';
      });
    }
    if (modalSelectOfficial) {
      modalSelectOfficial.addEventListener('click', (e) => {
        if (e.target === modalSelectOfficial) {
          modalSelectOfficial.style.display = 'none';
        }
      });
    }

    // Dynamic Kop & Identitas Edits
    document.getElementById('dispJudul').addEventListener('blur', (e) => {
      state.meta.judul = e.target.innerText.trim(); saveState();
    });
    document.getElementById('dispSekolah').addEventListener('blur', (e) => {
      state.meta.sekolah = e.target.innerText.trim();
      renderSignatures();
      saveState();
    });
    document.getElementById('dispSubHeader').addEventListener('blur', (e) => {
      state.meta.subHeader = e.target.innerText.trim(); saveState();
    });

    // Inputs LIVE Sync with Signatures & Header Title
    inputTahunPelajaran.addEventListener('input', (e) => {
      const val = e.target.value;
      state.meta.tahunPelajaran = val;
      state.meta.subHeader = `TAHUN PELAJARAN ${val.trim()}`;
      document.getElementById('dispSubHeader').innerText = state.meta.subHeader;
      saveState();
    });
    inputTanggal.addEventListener('input', (e) => {
      state.meta.tanggal = e.target.value;
      renderSignatures();
      saveState();
    });
    inputGuru.addEventListener('input', (e) => {
      state.meta.guru = e.target.value;
      renderSignatures();
      saveState();
    });
    inputNipGuru.addEventListener('input', (e) => {
      state.meta.nipGuru = e.target.value;
      renderSignatures();
      saveState();
    });
    inputJabatanKepsek.addEventListener('input', (e) => {
      state.meta.jabatanKepsek = e.target.value;
      renderSignatures();
      saveState();
    });
    inputKepsek.addEventListener('input', (e) => {
      state.meta.kepsek = e.target.value;
      renderSignatures();
      saveState();
    });
    inputNipKepsek.addEventListener('input', (e) => {
      state.meta.nipKepsek = e.target.value;
      renderSignatures();
      saveState();
    });
    inputKota.addEventListener('input', (e) => {
      state.meta.kota = e.target.value;
      renderSignatures();
      saveState();
    });

    // INTEGRATED TOP KOP KELAS DROPDOWN CHANGE
    elSelectKopKelas.addEventListener('change', (e) => {
      triggerHapticFeedback();
      const val = e.target.value;

      if (val === '__ADD_NEW__') {
        const newCls = prompt('Masukkan Nama Kelas Baru (contoh: X E-13):');
        if (newCls && newCls.trim().length > 0) {
          const cleanCls = newCls.trim();
          state.selectedKelas = cleanCls;
          state.meta.kelas = `Fase E (Kelas ${cleanCls})`;
          renderKopClassDropdown();
          saveState();
          renderAll();
          showToast(`Kelas baru ${cleanCls} ditambahkan!`);
        } else {
          renderKopClassDropdown();
        }
        return;
      }

      state.selectedKelas = val;
      state.meta.kelas = val === 'all' ? `Semua Kelas (${state.students.length} Murid)` : `Fase E (Kelas ${val})`;
      elDispKelasPrint.innerText = state.meta.kelas;

      saveState();
      renderAll();
      showToast(`Menampilkan murid kelas: ${val === 'all' ? 'Semua Kelas' : val}`);
    });

    // Preset Olahraga Selector
    elSelectPreset.addEventListener('change', (e) => {
      triggerHapticFeedback();
      const selected = e.target.value;

      if (selected === '__ADD_NEW_TOPIC__') {
        const newTopicName = prompt('Masukkan Nama Topik / Cabang Olahraga Baru (contoh: Pencak Silat, Renang, Panahan):');
        if (newTopicName && newTopicName.trim().length > 0) {
          const cleanName = newTopicName.trim();
          const newKey = 'custom_' + Date.now();

          const initialCriteria = [
            {
              id: 'c_' + Date.now() + '_1',
              category: 'Pemain',
              name: 'Penguasaan Teknik Dasar',
              descriptors: {
                1: 'Melakukan dengan banyak kesalahan.',
                2: 'Cukup bisa walau kurang konsisten.',
                3: 'Menerapkan dengan akurasi baik.',
                4: 'Akurasi tinggi dan postur sempurna.'
              }
            },
            {
              id: 'c_' + Date.now() + '_2',
              category: 'Pemain',
              name: 'Kombinasi & Kerapihan Gerak',
              descriptors: {
                1: 'Gerakan kaku dan kurang koordinasi.',
                2: 'Kombinasi gerak lancar namun ritme kurang stabil.',
                3: 'Menerapkan kombinasi gerak dengan akurasi tinggi.',
                4: 'Gerakan sangat estetis, dinamis, dan presisi sempurna.'
              }
            }
          ];

          rubricEngine.saveTopicCustomDefault(newKey, cleanName, ['Pemain', 'Perangkat Pertandingan'], initialCriteria);
          rubricEngine.setSportPreset(newKey);

          clearAllStudentScores();
          renderSportDropdownOptions();
          saveState();
          renderAll();
          showToast(`Topik kustom baru "${cleanName}" berhasil dibuat (Nilai Kosong).`);
        } else {
          renderSportDropdownOptions();
        }
        return;
      }

      rubricEngine.setSportPreset(selected);
      state.meta.olahraga = rubricEngine.getSportName();
      elDispOlahragaPrint.innerText = rubricEngine.getSportName();

      clearAllStudentScores();
      saveState();
      renderAll();
      showToast(`Topik diganti ke ${rubricEngine.getSportName()} (Nilai Kosong).`);
    });

    // KELOMPOK FILTER DROPDOWN CHANGE
    if (elSelectFilterKelompok) {
      elSelectFilterKelompok.addEventListener('change', (e) => {
        triggerHapticFeedback();
        state.selectedKelompok = e.target.value;
        saveState();
        renderGroupBatchPanel();
        renderStudentRows();
        renderStats();
        renderMatchEvidencePrint();
        if (elCourtVisualizerPanel && elCourtVisualizerPanel.style.display !== 'none') {
          renderCourtVisualizer();
        }
        showToast(`Tampilan kelompok difilter ke: ${e.target.value === 'all' ? 'Semua Kelompok' : e.target.value}`);
      });
    }

    // AUTOMATIC GROUP DIVISION BUTTON
    const btnAutoGroup = document.getElementById('btnAutoDivideGroups');
    if (btnAutoGroup) {
      btnAutoGroup.addEventListener('click', () => {
        triggerHapticFeedback();
        const currentCls = state.selectedKelas === 'all' ? 'Seluruh Kelas' : `Kelas ${state.selectedKelas}`;
        const inputSize = prompt(`Bagi murid di ${currentCls} ke dalam kelompok secara otomatis!\n\nMasukkan jumlah anggota per tim (contoh: 6 untuk Volley/Basket 6-an, 5 untuk Basket 5v5, 3 untuk 3x3):`, '6');

        if (inputSize && !isNaN(parseInt(inputSize, 10)) && parseInt(inputSize, 10) > 0) {
          const groupSize = parseInt(inputSize, 10);

          let counter = 0;
          state.students.forEach(std => {
            if (state.selectedKelas === 'all' || std.kelas === state.selectedKelas) {
              const groupNum = Math.floor(counter / groupSize) + 1;
              std.kelompok = `Kelompok ${groupNum}`;
              counter++;
            }
          });

          state.selectedKelompok = 'all';
          saveState();
          renderAll();
          showToast(`Berhasil membagi ${counter} murid ke dalam kelompok (~${groupSize} murid per tim)!`);
        }
      });
    }

    // GROUP BATCH SCORING BUTTON CLICK EVENT
    if (elBatchCriteriaGrid) {
      elBatchCriteriaGrid.addEventListener('click', (e) => {
        const btnBatch = e.target.closest('.btn-batch-score');
        if (btnBatch) {
          triggerHapticFeedback();
          const critId = btnBatch.dataset.crit;
          const val = parseInt(btnBatch.dataset.val, 10);
          const targetGroup = btnBatch.dataset.group || state.selectedKelompok;

          const isMatchMode = state.selectedKelompok.startsWith('match:') || (elCourtVisualizerPanel && elCourtVisualizerPanel.style.display !== 'none');
          let updatedCount = 0;

          state.students.forEach(std => {
            if (state.selectedKelas === 'all' || std.kelas === state.selectedKelas) {
              let shouldScore = false;

              if (isMatchMode) {
                const loc = findStudentLocation(std.id);
                const isStarter = loc && (loc.array === state.currentLineup.startersA || loc.array === state.currentLineup.startersB);
                const isOfficial = loc && loc.obj === state.currentLineup.officials;
                const inTargetGroup = (std.kelompok || 'Kelompok 1') === targetGroup;

                if ((isStarter || isOfficial) && inTargetGroup) {
                  shouldScore = true;
                }
              } else {
                if ((std.kelompok || 'Kelompok 1') === targetGroup) {
                  shouldScore = true;
                }
              }

              if (shouldScore) {
                std.scores[critId] = val;
                updatedCount++;
              }
            }
          });

          saveState();
          renderStudentRows();
          renderStats();
          if (elCourtVisualizerPanel && elCourtVisualizerPanel.style.display !== 'none') {
            renderCourtVisualizer();
          }
          showToast(`Nilai ${val} berhasil diterapkan serentak ke ${updatedCount} murid di ${targetGroup}!`);
        }
      });
    }

    // MANUAL GROUP MAPPING MODAL LISTENERS
    const btnOpenGroupModal = document.getElementById('btnOpenGroupMappingModal');
    if (btnOpenGroupModal) {
      btnOpenGroupModal.addEventListener('click', () => {
        triggerHapticFeedback();
        openGroupMappingModal();
      });
    }

    const btnCloseGroupModal = document.getElementById('btnCloseGroupModal');
    const btnCancelGroupMapping = document.getElementById('btnCancelGroupMapping');
    const modalGroupMapping = document.getElementById('groupMappingModal');

    if (btnCloseGroupModal && modalGroupMapping) {
      btnCloseGroupModal.addEventListener('click', () => modalGroupMapping.classList.remove('active'));
    }
    if (btnCancelGroupMapping && modalGroupMapping) {
      btnCancelGroupMapping.addEventListener('click', () => modalGroupMapping.classList.remove('active'));
    }

    // 1-TAP TARGET GROUP PILL CLICK EVENT
    const elTargetGroupPills = document.getElementById('targetGroupPills');
    if (elTargetGroupPills) {
      elTargetGroupPills.addEventListener('click', (e) => {
        const btnPill = e.target.closest('.btn-target-pill');
        if (btnPill) {
          triggerHapticFeedback();
          activeTargetGroup = btnPill.dataset.group;
          renderGroupMappingBoard();
        }
      });
    }

    // 1-TAP STUDENT CHIP CLICK EVENT (INSTANT ASSIGNMENT TO TARGET GROUP)
    const elStudentChipsGrid = document.getElementById('studentChipsGrid');
    if (elStudentChipsGrid) {
      elStudentChipsGrid.addEventListener('click', (e) => {
        const chipCard = e.target.closest('.student-chip-card');
        if (chipCard) {
          triggerHapticFeedback();
          const stdId = chipCard.dataset.id;
          const student = state.students.find(s => s.id === stdId);
          if (student) {
            if (student.kelompok === activeTargetGroup) {
              student.kelompok = 'Belum Dikelompokkan';
            } else {
              student.kelompok = activeTargetGroup;
            }
            renderGroupMappingBoard();
          }
        }
      });
    }

    // TOGGLE VIEW MODE (1-TAP CARDS VS LIST DROPDOWN)
    const btnViewModeTap = document.getElementById('btnViewModeTap');
    const btnViewModeList = document.getElementById('btnViewModeList');
    if (btnViewModeTap && btnViewModeList) {
      btnViewModeTap.addEventListener('click', () => {
        triggerHapticFeedback();
        btnViewModeTap.classList.add('active');
        btnViewModeList.classList.remove('active');
        document.getElementById('studentChipsGrid').style.display = 'grid';
        document.getElementById('groupMappingList').style.display = 'none';
      });

      btnViewModeList.addEventListener('click', () => {
        triggerHapticFeedback();
        btnViewModeList.classList.add('active');
        btnViewModeTap.classList.remove('active');
        document.getElementById('studentChipsGrid').style.display = 'none';
        document.getElementById('groupMappingList').style.display = 'flex';
      });
    }

    // Change Handler inside Group Mapping List
    const groupMappingList = document.getElementById('groupMappingList');
    if (groupMappingList) {
      groupMappingList.addEventListener('change', (e) => {
        if (e.target.classList.contains('select-std-group')) {
          if (e.target.value === '__NEW_GROUP__') {
            const newName = prompt('Masukkan Nama Kelompok / Tim Baru (contoh: Kelompok Mahir, Tim Garuda, Tim A):');
            if (newName && newName.trim().length > 0) {
              const cleanName = newName.trim();
              const groupSelects = document.querySelectorAll('.select-std-group');
              groupSelects.forEach(sel => {
                const opt = document.createElement('option');
                opt.value = cleanName;
                opt.textContent = cleanName;
                sel.insertBefore(opt, sel.lastElementChild);
              });
              e.target.value = cleanName;
            } else {
              e.target.selectedIndex = 0;
            }
          }
        }
      });
    }

    // Save Group Mapping Modal
    const btnSaveGroupMapping = document.getElementById('btnSaveGroupMapping');
    if (btnSaveGroupMapping) {
      btnSaveGroupMapping.addEventListener('click', () => {
        triggerHapticFeedback();
        const groupSelects = document.querySelectorAll('.select-std-group');
        groupSelects.forEach(sel => {
          const stdId = sel.dataset.id;
          const val = sel.value;
          const student = state.students.find(s => s.id === stdId);
          if (student && val && val !== '__NEW_GROUP__') {
            student.kelompok = val;
          }
        });

        saveState();
        if (modalGroupMapping) modalGroupMapping.classList.remove('active');
        renderAll();
        showToast('Pemetaan kelompok manual berhasil disimpan!');
      });
    }

    // RESET ALL GROUPS TO UNASSIGNED BUTTON INSIDE MODAL
    const btnResetAllGroupsUnassigned = document.getElementById('btnResetAllGroupsUnassigned');
    if (btnResetAllGroupsUnassigned) {
      btnResetAllGroupsUnassigned.addEventListener('click', () => {
        triggerHapticFeedback();
        const activeStudents = state.selectedKelas === 'all'
          ? state.students
          : state.students.filter(s => (s.kelas || 'X E-1') === state.selectedKelas);

        activeStudents.forEach(std => {
          std.kelompok = 'Belum Dikelompokkan';
        });

        saveState();
        renderGroupMappingBoard();
        renderStudentRows();
        showToast('Seluruh murid kelas ini berhasil di-reset menjadi Belum Dikelompokkan.');
      });
    }

    // Create New Custom Group Name inside Modal via Input Bar
    const btnAddCustomGroupBtn = document.getElementById('btnAddCustomGroupBtn');
    const inputNewGroupName = document.getElementById('inputNewGroupName');
    if (btnAddCustomGroupBtn && inputNewGroupName) {
      btnAddCustomGroupBtn.addEventListener('click', () => {
        triggerHapticFeedback();
        const val = inputNewGroupName.value.trim();
        if (val.length > 0) {
          const groupSelects = document.querySelectorAll('.select-std-group');
          groupSelects.forEach(sel => {
            const opt = document.createElement('option');
            opt.value = val;
            opt.textContent = val;
            sel.insertBefore(opt, sel.lastElementChild);
          });
          inputNewGroupName.value = '';
          showToast(`Nama kelompok "${val}" ditambahkan ke opsi!`);
        } else {
          alert('Silakan ketik nama kelompok baru terlebih dahulu.');
        }
      });
    }

    // Auto-Group HETEROGENEOUS / MIX ABILITY (Snake Draft Distribution with Peer Tutors)
    const btnGroupHeterogeneous = document.getElementById('btnGroupHeterogeneous');
    if (btnGroupHeterogeneous) {
      btnGroupHeterogeneous.addEventListener('click', () => {
        triggerHapticFeedback();
        const activeStudents = state.selectedKelas === 'all'
          ? state.students
          : state.students.filter(s => (s.kelas || 'X E-1') === state.selectedKelas);

        if (activeStudents.length === 0) return;

        const currentCls = state.selectedKelas === 'all' ? 'Seluruh Kelas' : `Kelas ${state.selectedKelas}`;
        const inputNumTeams = prompt(`Bagi ${activeStudents.length} murid di ${currentCls} secara HETEROGEN / SEIMBANG!\n\n(Setiap tim akan berisi perpaduan seimbang 1 Mahir [Tutor Sebaya], 2-3 Cakap, & 1-2 Layak/Pendampingan)\n\nMasukkan jumlah tim yang ingin dibentuk:`, '7');

        if (inputNumTeams && !isNaN(parseInt(inputNumTeams, 10)) && parseInt(inputNumTeams, 10) > 0) {
          const numTeams = parseInt(inputNumTeams, 10);

          // Sort active students descending by diagnostic total score
          const sortedStudents = [...activeStudents].sort((a, b) => {
            const scoreA = rubricEngine.classifyStudentDynamicScore(a.scores).totalScore;
            const scoreB = rubricEngine.classifyStudentDynamicScore(b.scores).totalScore;
            return scoreB - scoreA;
          });

          // Snake Draft Distribution into N Teams
          sortedStudents.forEach((std, idx) => {
            const roundIdx = Math.floor(idx / numTeams);
            const isReverse = roundIdx % 2 === 1;
            const teamNum = isReverse
              ? numTeams - (idx % numTeams)
              : (idx % numTeams) + 1;

            std.kelompok = `Tim Heterogen ${teamNum} (Mix)`;
          });

          saveState();
          if (modalGroupMapping) modalGroupMapping.classList.remove('active');
          renderAll();
          showToast(`Berhasil membagi ${sortedStudents.length} murid ke dalam ${numTeams} Tim Heterogen Seimbang (Lengkap Tutor Sebaya)!`);
        }
      });
    }

    // Auto-Group Homogeneous Diagnostic Tiering Button inside Modal
    const btnGroupTierDiagnostic = document.getElementById('btnGroupTierDiagnostic');
    if (btnGroupTierDiagnostic) {
      btnGroupTierDiagnostic.addEventListener('click', () => {
        triggerHapticFeedback();
        const activeStudents = state.selectedKelas === 'all'
          ? state.students
          : state.students.filter(s => (s.kelas || 'X E-1') === state.selectedKelas);

        let mappedCount = 0;
        activeStudents.forEach(std => {
          const classification = rubricEngine.classifyStudentDynamicScore(std.scores);
          if (classification.code === 'Mahir') std.kelompok = 'Kelompok Mahir (Pengayaan)';
          else if (classification.code === 'Cakap') std.kelompok = 'Kelompok Cakap (Reguler)';
          else if (classification.code === 'Layak') std.kelompok = 'Kelompok Layak (Bimbingan)';
          else if (classification.code === 'Berkembang') std.kelompok = 'Kelompok Pendampingan Khusus';
          else std.kelompok = 'Kelompok Belum Terpetakan';
          mappedCount++;
        });

        saveState();
        if (modalGroupMapping) modalGroupMapping.classList.remove('active');
        renderAll();
        showToast(`Berhasil memetakan ${mappedCount} murid ke dalam kelompok diferensiasi level!`);
      });
    }

    // Score Button Click Event & Reset Student Scores Action
    elTableBody.addEventListener('click', (e) => {
      // EDIT KELOMPOK BADGE CLICK
      const badgeKelompok = e.target.closest('.badge-kelompok-tag');
      if (badgeKelompok) {
        triggerHapticFeedback();
        const stdId = badgeKelompok.dataset.id;
        const student = state.students.find(s => s.id === stdId);
        if (student) {
          const newGrp = prompt(`Ubah kelompok / tim untuk "${student.name}" (contoh: Kelompok 1, Kelompok 2, Tim Garuda, Tim Elang):`, student.kelompok || 'Kelompok 1');
          if (newGrp && newGrp.trim().length > 0) {
            student.kelompok = newGrp.trim();
            saveState();
            renderAll();
            showToast(`Kelompok ${student.name} diubah ke "${newGrp.trim()}".`);
          }
        }
      }

      const btnScore = e.target.closest('.btn-score');
      if (btnScore) {
        triggerHapticFeedback();
        const stdId = btnScore.dataset.std;
        const critId = btnScore.dataset.crit;
        const val = parseInt(btnScore.dataset.val, 10);

        const student = state.students.find(s => s.id === stdId);
        if (student) {
          if (student.scores[critId] === val) {
            delete student.scores[critId];
          } else {
            student.scores[critId] = val;
          }
          saveState();
          renderStudentRows();
          renderStats();
          if (elCourtVisualizerPanel && elCourtVisualizerPanel.style.display !== 'none') {
            renderCourtVisualizer();
          }
        }
      }

      // RESET/CLEAR STUDENT SCORES BUTTON
      const btnResetScores = e.target.closest('.btn-reset-student-scores');
      if (btnResetScores) {
        triggerHapticFeedback();
        const stdId = btnResetScores.dataset.id;
        const student = state.students.find(s => s.id === stdId);
        if (student) {
          student.scores = {};
          saveState();
          renderStudentRows();
          renderStats();
          if (elCourtVisualizerPanel && elCourtVisualizerPanel.style.display !== 'none') {
            renderCourtVisualizer();
          }
          showToast(`Hasil penilaian untuk ${student.name} telah dikosongkan.`);
        }
      }
    });

    // Student Name Edit
    elTableBody.addEventListener('input', (e) => {
      if (e.target.classList.contains('student-name-input')) {
        const stdId = e.target.dataset.id;
        const student = state.students.find(s => s.id === stdId);
        if (student) {
          student.name = e.target.value;
          saveState();
        }
      }
    });

    // Filter Pills by Performance Category
    document.querySelectorAll('.filter-pills .pill').forEach(btn => {
      btn.addEventListener('click', (e) => {
        triggerHapticFeedback();
        document.querySelectorAll('.filter-pills .pill').forEach(p => p.classList.remove('active'));
        btn.classList.add('active');
        state.filterCategory = btn.dataset.filter;
        renderStudentRows();
      });
    });

    // Add Student Button
    const triggerAddStudent = () => {
      triggerHapticFeedback();
      const defaultCls = state.selectedKelas !== 'all' ? state.selectedKelas : 'X E-1';
      const newName = prompt(`Masukkan Nama Murid Baru (Kelas: ${defaultCls}):`);
      if (newName && newName.trim().length > 0) {
        state.students.push({
          id: 'std_' + Date.now(),
          name: newName.trim(),
          kelas: defaultCls,
          scores: {}
        });
        saveState();
        renderKopClassDropdown();
        renderStudentRows();
        renderStats();
        showToast(`Murid ${newName.trim()} ditambahkan dengan kondisi nilai kosong.`);
      }
    };

    document.getElementById('btnAddStudent').addEventListener('click', triggerAddStudent);
    document.getElementById('mobileBtnAdd').addEventListener('click', triggerAddStudent);

    // Mobile FAB Buttons
    document.getElementById('mobileBtnExcel').addEventListener('click', () => {
      triggerHapticFeedback();
      document.getElementById('btnExportExcel').click();
    });
    document.getElementById('mobileBtnRubric').addEventListener('click', () => {
      triggerHapticFeedback();
      openRubricModal();
    });
    document.getElementById('mobileBtnPrint').addEventListener('click', () => {
      triggerHapticFeedback();
      window.print();
    });

    // TOOLBAR RESET/CLEAR ALL SCORES BUTTON
    document.getElementById('btnClearData').addEventListener('click', () => {
      triggerHapticFeedback();
      const targetClsName = state.selectedKelas === 'all' ? 'Seluruh Kelas' : `Kelas ${state.selectedKelas}`;
      if (confirm(`Apakah Anda yakin ingin mengosongkan/mereset seluruh hasil penilaian murid ${targetClsName}? Nama murid akan tetap tersimpan.`)) {
        state.students.forEach(s => {
          if (state.selectedKelas === 'all' || s.kelas === state.selectedKelas) {
            s.scores = {};
          }
        });
        saveState();
        renderStudentRows();
        renderStats();
        showToast(`Seluruh hasil penilaian ${targetClsName} telah dikosongkan.`);
      }
    });

    // Open Rubric Modal
    document.getElementById('btnManageRubric').addEventListener('click', openRubricModal);
    document.getElementById('btnCloseRubricModal').addEventListener('click', () => modalRubric.classList.remove('active'));

    // Add New Criteria Card in Modal
    document.getElementById('btnAddCriteria').addEventListener('click', () => {
      triggerHapticFeedback();
      const newId = 'c_' + Date.now();
      const currentCount = rubricCriteriaList.querySelectorAll('.criterion-card-box').length;

      const card = document.createElement('div');
      card.className = 'criterion-card-box';
      card.dataset.id = newId;
      card.dataset.category = state.activeModalCategory;

      card.innerHTML = `
        <div class="crit-box-header">
          <span class="crit-box-title">Judul Kriteria ${currentCount + 1}</span>
          <button class="btn-trash-crit btn-remove-card" title="Hapus Kriteria"><i class="fa-solid fa-trash-can"></i></button>
        </div>
        <input type="text" class="crit-title-input input-crit-name" value="Kriteria Baru ${currentCount + 1}">
        
        <div class="desc-field-group">
          <label>Deskripsi 1</label>
          <textarea class="desc-textarea input-desc-1">Melakukan dengan banyak kesalahan.</textarea>
        </div>

        <div class="desc-field-group">
          <label>Deskripsi 2</label>
          <textarea class="desc-textarea input-desc-2">Cukup bisa walau kurang konsisten.</textarea>
        </div>

        <div class="desc-field-group">
          <label>Deskripsi 3</label>
          <textarea class="desc-textarea input-desc-3">Menerapkan dengan akurasi baik.</textarea>
        </div>

        <div class="desc-field-group">
          <label>Deskripsi 4</label>
          <textarea class="desc-textarea input-desc-4">Akurasi tinggi dan postur sempurna.</textarea>
        </div>
      `;

      card.querySelector('.btn-remove-card').addEventListener('click', () => card.remove());
      rubricCriteriaList.appendChild(card);
    });

    // Save Dynamic Rubric (Including Topic Name Edit)
    document.getElementById('btnSaveRubric').addEventListener('click', () => {
      triggerHapticFeedback();
      saveCurrentModalInputsToState();

      const fullCriteriaList = rubricEngine.getCriteria();

      if (fullCriteriaList.length === 0) {
        alert('Minimal harus ada 1 kriteria penilaian!');
        return;
      }

      const updatedTopicName = inputModalTopicName.value.trim() || 'Topik Olahraga';

      rubricEngine.saveTopicCustomDefault(
        rubricEngine.currentSport,
        updatedTopicName,
        rubricEngine.getCategories(),
        fullCriteriaList
      );

      state.meta.olahraga = updatedTopicName;
      renderSportDropdownOptions();

      saveState();
      modalRubric.classList.remove('active');
      renderAll();
      showToast(`Rubrik & Topik "${updatedTopicName}" berhasil disimpan!`);
    });

    // Reset Rubric to Official Standard Button
    const btnResetRubric = document.getElementById('btnResetRubricDefault');
    if (btnResetRubric) {
      btnResetRubric.addEventListener('click', () => {
        triggerHapticFeedback();
        if (confirm('Apakah Anda yakin ingin memulihkan kriteria rubrik ke standar resmi? ("Kriteria Baru 1" dan draf kriteria lainnya akan dibersihkan).')) {
          rubricEngine.resetCurrentSportToDefault();
          saveState();
          renderRubricModalCriteria();
          renderAll();
          showToast('Kriteria rubrik berhasil dipulihkan ke standar resmi!');
        }
      });
    }

    // Import Modal
    document.getElementById('btnImportData').addEventListener('click', () => modalImport.classList.add('active'));
    document.getElementById('btnCloseImportModal').addEventListener('click', () => modalImport.classList.remove('active'));
    document.getElementById('btnCancelImport').addEventListener('click', () => modalImport.classList.remove('active'));

    document.getElementById('btnProcessImport').addEventListener('click', () => {
      triggerHapticFeedback();
      const text = document.getElementById('textPasteNama').value;
      const fileInput = document.getElementById('fileImportExcel');
      const manualTargetKelas = document.getElementById('inputTargetImportKelas').value.trim() || 'X E-1';

      if (fileInput.files.length > 0) {
        ExcelExporter.importFromExcel(fileInput.files[0], (records) => {
          if (!records || records.length === 0) {
            alert('Tidak ditemukan data murid valid dalam file tersebut.');
            return;
          }
          // Filter students in current target class or replace cleanly
          const targetCls = records[0].kelas || manualTargetKelas;
          state.students = state.students.filter(s => s.kelas !== targetCls);
          addImportedRecords(records);
          modalImport.classList.remove('active');
          fileInput.value = '';
        });
      } else if (text.trim().length > 0) {
        const names = text.split('\n').map(n => n.trim()).filter(n => ExcelExporter.isValidStudentName(n));
        const records = names.map(name => ({ name, kelas: manualTargetKelas }));

        state.students = state.students.filter(s => s.kelas !== manualTargetKelas);
        addImportedRecords(records);
        modalImport.classList.remove('active');
        document.getElementById('textPasteNama').value = '';
      } else {
        alert('Pilih file Excel/CSV atau tempel daftar nama siswa terlebih dahulu.');
      }
    });

    // Export Excel Button
    document.getElementById('btnExportExcel').addEventListener('click', () => {
      triggerHapticFeedback();
      ExcelExporter.exportToExcel({
        meta: state.meta,
        criteria: rubricEngine.getCriteria(),
        students: state.students,
        intervals: rubricEngine.getIntervals(),
        rubricEngine: rubricEngine,
        selectedKelas: state.selectedKelas
      });

      if (typeof confetti === 'function') {
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      }
      showToast('File Excel (.xlsx) berhasil diunduh!');
    });

    // Print PDF Button
    document.getElementById('btnPrintPDF').addEventListener('click', () => {
      triggerHapticFeedback();
      window.print();
    });

    // Theme Toggle Button
    document.getElementById('btnToggleTheme').addEventListener('click', () => {
      triggerHapticFeedback();
      const current = document.body.getAttribute('data-theme');
      if (current === 'dark') {
        document.body.removeAttribute('data-theme');
      } else {
        document.body.setAttribute('data-theme', 'dark');
      }
    });
  }

  function addImportedRecords(records) {
    if (!state.isUserImported) {
      state.students = [];
      state.isUserImported = true;
    }

    records.forEach((item, i) => {
      state.students.push({
        id: 'std_' + Date.now() + '_' + i,
        name: item.name,
        kelas: item.kelas || state.selectedKelas || 'X E-1',
        scores: {}
      });
    });

    state.isUserImported = true;

    if (records.length > 0 && records[0].kelas) {
      state.selectedKelas = records[0].kelas;
      state.meta.kelas = `Fase E (Kelas ${records[0].kelas})`;
    }

    saveState();
    renderKopClassDropdown();
    renderAll();

    const classSummaryCount = state.students.filter(s => s.kelas === state.selectedKelas).length;
    showToast(`Berhasil mengimpor database! Kelas ${state.selectedKelas}: ${classSummaryCount} murid murni (Nilai Kosong).`);
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
  }

  // Run App
  init();
});
