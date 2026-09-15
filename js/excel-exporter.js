/**
 * EXCEL EXPORTER - SheetJS Engine with xlsx-js-style
 * Ekspor & Impor Data Asesmen Autentik PJOK SMA
 * Menyertakan Template Presisi dengan NATIVE BORDERS, HEADER COLORS, ZEBRA STRIPING, & FORMATTING
 */

const ExcelExporter = {
  /**
   * Unduh Berkas .xlsx Presisi Sesuai Template Resmi User (Lengkap Garis & Tema Warna)
   */
  exportToExcel: function(options) {
    const { meta, criteria, students, intervals, rubricEngine, selectedKelas } = options;

    if (typeof XLSX === 'undefined') {
      alert('Sistem ekspor XLSX belum siap. Pastikan koneksi internet terhubung.');
      return;
    }

    const wb = XLSX.utils.book_new();
    const wsData = [];
    const merges = [];

    const numCriteria = criteria.length;
    const selectedClsText = selectedKelas === 'all' 
      ? `Semua Kelas (${students.length} Murid Total)` 
      : `Fase E (${selectedKelas})`;
    const dateText = this.formatDateIndo(meta.tanggal);
    const olahragaName = meta.olahraga ? meta.olahraga.toUpperCase() : 'BASKET';

    // 1. KOP IDENTITAS ATAS (Baris 1-3)
    wsData.push([`RUBRIK ASESMEN OTENTIK ${olahragaName} FASE E (OBSERVASI GURU)`]);
    wsData.push([meta.sekolah ? meta.sekolah.toUpperCase() : 'SMA NEGERI 2 CIAMIS']);
    wsData.push([`TAHUN PELAJARAN ${meta.tahunPelajaran || '2025-2026'}`]);
    wsData.push([]); // Baris 4 Blank

    // 2. META INFORMASI (Baris 5-6)
    wsData.push([`Kelas: ${selectedClsText}`]);
    wsData.push([`Hari/Tanggal: ${dateText}`]);
    wsData.push([]); // Baris 7 Blank

    // 3. BARIS HEADER TABEL 2-LEVEL (Baris 8-9)
    // Baris 8 (Row Index 7): Header Utama
    const row8 = ['No.', 'Nama Murid', 'Kelompok / Tim'];
    row8.push('Kriteria Penilaian');
    for (let c = 1; c < numCriteria; c++) {
      row8.push(''); // Empty slots for horizontal merge
    }
    row8.push('Skor');
    row8.push('Keterangan Interval Skor');
    wsData.push(row8);

    // Baris 9 (Row Index 8): Sub-Header Kriteria
    const row9 = ['', '', '']; // Empty slots for vertical merge
    criteria.forEach((c) => {
      row9.push(c.name);
    });
    row9.push(''); // Empty slot for Skor merge
    row9.push(''); // Empty slot for Keterangan Interval merge
    wsData.push(row9);

    // MERGE SPECIFICATIONS FOR HEADER (Row Index 7 & 8)
    merges.push({ s: { r: 7, c: 0 }, e: { r: 8, c: 0 } }); // No.
    merges.push({ s: { r: 7, c: 1 }, e: { r: 8, c: 1 } }); // Nama Murid
    merges.push({ s: { r: 7, c: 2 }, e: { r: 8, c: 2 } }); // Kelompok / Tim
    if (numCriteria > 0) {
      merges.push({ s: { r: 7, c: 3 }, e: { r: 7, c: 3 + numCriteria - 1 } }); // Kriteria Penilaian
    }
    merges.push({ s: { r: 7, c: 3 + numCriteria }, e: { r: 8, c: 3 + numCriteria } }); // Skor
    merges.push({ s: { r: 7, c: 4 + numCriteria }, e: { r: 8, c: 4 + numCriteria } }); // Keterangan Interval Skor

    // 4. BARIS DATA MURID (Baris 10 s.d. N)
    let no = 1;
    students.forEach((student) => {
      const studentKelas = student.kelas || 'X E-1';
      const studentKelompok = student.kelompok || 'Kelompok 1';
      
      if (selectedKelas !== 'all' && studentKelas !== selectedKelas) {
        return;
      }

      const classification = rubricEngine.classifyStudentDynamicScore(student.scores);
      const row = [no++, student.name, studentKelompok];

      // Score Cells
      criteria.forEach((c) => {
        const val = student.scores[c.id] || 0;
        row.push(val > 0 ? val : '');
      });

      // Total Skor & Interval Badge Text
      row.push(classification.maxPossible > 0 ? classification.totalScore : 0);
      row.push(classification.code !== 'Unscored' ? classification.label.toUpperCase() : 'BELUM DINILAI');

      wsData.push(row);
    });

    const totalStudentsInTable = no - 1;
    wsData.push([]); // Blank row

    // 5. BLOK KETERANGAN INTERVAL SKOR (Bawah Tabel)
    wsData.push(['Keterangan Interval Skor:']);
    wsData.push([`Mahir: ${intervals.mahir.max} - ${intervals.mahir.min}`]);
    wsData.push([`Cakap: ${intervals.cakap.max} - ${intervals.cakap.min}`]);
    wsData.push([`Layak: ${intervals.layak.max} - ${intervals.layak.min}`]);
    wsData.push([`Berkembang: ${intervals.berkembang.max} - ${intervals.berkembang.min}`]);

    wsData.push([]); // Blank row

    // 6. BLOK KETERANGAN INDIKATOR DESKRIPSI
    wsData.push(['Keterangan:']);
    wsData.push(['Mahir (4): Level ini berisi indikator pencapaian yang lebih tinggi dari level 1-3. Murid menunjukkan penguasaan teknik yang sangat baik dan konsisten.']);
    wsData.push(['Cakap (3): Level ini berisi indikator pencapaian yang lebih tinggi dari level 1-2. Murid menunjukkan penguasaan teknik yang baik, namun masih ada beberapa kekurangan.']);
    wsData.push(['Layak (2): Level ini berisi indikator pencapaian yang lebih tinggi dari level 1. Peserta didik menunjukkan penguasaan teknik yang cukup, namun masih banyak kekurangan.']);
    wsData.push(['Berkembang (1): Siswa belum menunjukkan penguasaan teknik yang baik dan membutuhkan banyak perbaikan.']);

    wsData.push([]); // Blank row

    // 7. BLOK KREATIVITAS DAN KEBERAGAMAN
    wsData.push(['Kreativitas dan Keberagaman (Kreativitas yang dikembangkan meliputi):']);
    wsData.push(['Kemampuan beradaptasi dalam situasi permainan yang berbeda.']);
    wsData.push(['Pengembangan strategi permainan yang efektif.']);
    wsData.push(['Penerapan teknik yang inovatif dalam mendribble, passing, dan shooting.']);
    wsData.push(['Kerjasama dan komunikasi yang baik dalam tim yang beragam.']);

    wsData.push([]); // Blank row

    // 8. BLOK UMPAN BALIK GURU
    wsData.push(['Umpan Balik: Guru memberikan umpan balik secara langsung setelah pertandingan berakhir, fokus pada kekuatan dan area yang perlu diperbaiki. Siswa juga diberikan kesempatan untuk memberikan umpan balik kepada rekan satu tim dalam sesi diskusi kelompok.']);

    wsData.push([]); // Blank row
    wsData.push([]); // Blank row

    // 9. BLOK LEGITIMASI TANDA TANGAN DINAMIS (HORIZONTAL MERGE A:C & RIGHT COLS)
    const kotaText = meta.kota || 'Ciamis';
    const totalCols = 5 + numCriteria;
    const rightStartCol = Math.max(3, totalCols - 3);
    const sigStartRowIdx = wsData.length;

    // Row 1: Mengetahui, ... Ciamis, 26 Agustus 2026
    const sigRow1 = new Array(totalCols).fill('');
    sigRow1[0] = 'Mengetahui,';
    sigRow1[rightStartCol] = `${kotaText}, ${dateText}`;
    wsData.push(sigRow1);
    const r1Idx = sigStartRowIdx;

    // Row 2: Plt. Kepala SMAN 2 Ciamis ... Guru PJOK
    const sigRow2 = new Array(totalCols).fill('');
    sigRow2[0] = meta.jabatanKepsek || 'Plt. Kepala SMAN 2 Ciamis';
    sigRow2[rightStartCol] = 'Guru PJOK';
    wsData.push(sigRow2);
    const r2Idx = sigStartRowIdx + 1;

    // Blank Rows for signature space
    wsData.push(new Array(totalCols).fill(''));
    wsData.push(new Array(totalCols).fill(''));
    wsData.push(new Array(totalCols).fill(''));

    // Row 6: Dadan Ramdan, S.Ag., M.Pd. ... Drs. H. Ahmad Fauzi, M.Pd.
    const sigRow3 = new Array(totalCols).fill('');
    sigRow3[0] = meta.kepsek || 'Dadan Ramdan, S.Ag., M.Pd.';
    sigRow3[rightStartCol] = meta.guru || 'Drs. H. Ahmad Fauzi, M.Pd.';
    wsData.push(sigRow3);
    const r3Idx = sigStartRowIdx + 5;

    // Row 7: NIP. - ... NIP. 19780512 200501 1 003
    const sigRow4 = new Array(totalCols).fill('');
    sigRow4[0] = `NIP. ${meta.nipKepsek || '-'}`;
    sigRow4[rightStartCol] = `NIP. ${meta.nipGuru || '19780512 200501 1 003'}`;
    wsData.push(sigRow4);
    const r4Idx = sigStartRowIdx + 6;

    // MERGE LEFT BLOCK (Cols 0..2) & RIGHT BLOCK (Cols rightStartCol..(totalCols-1))
    [r1Idx, r2Idx, r3Idx, r4Idx].forEach(r => {
      merges.push({ s: { r: r, c: 0 }, e: { r: r, c: 2 } });
      merges.push({ s: { r: r, c: rightStartCol }, e: { r: r, c: totalCols - 1 } });
    });

    // CREATE WORKSHEET WITH MERGES & AUTO COLUMN WIDTHS
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    ws['!merges'] = merges;

    // 10. APPLY CELL STYLING (NATIVE EXCEL BORDERS, COLORS, ALIGNMENTS, & FONTS)
    const dataStartRow = 9; // Row Index 9 (Baris 10 Excel)
    const dataEndRow = dataStartRow + totalStudentsInTable - 1;

    const thinBorder = {
      top: { style: 'thin', color: { rgb: '000000' } },
      bottom: { style: 'thin', color: { rgb: '000000' } },
      left: { style: 'thin', color: { rgb: '000000' } },
      right: { style: 'thin', color: { rgb: '000000' } }
    };

    // Style Title Rows (Rows 0, 1, 2)
    for (let r = 0; r <= 2; r++) {
      const cellRef = XLSX.utils.encode_cell({ r: r, c: 0 });
      if (ws[cellRef]) {
        ws[cellRef].s = {
          font: { name: 'Calibri', sz: r === 0 ? 12 : 11, bold: true, color: { rgb: '000000' } },
          alignment: { horizontal: 'left', vertical: 'center' }
        };
      }
    }

    // Style Meta Rows (Rows 4, 5)
    [4, 5].forEach(r => {
      const cellRef = XLSX.utils.encode_cell({ r: r, c: 0 });
      if (ws[cellRef]) {
        ws[cellRef].s = {
          font: { name: 'Calibri', sz: 11, bold: true, color: { rgb: '000000' } }
        };
      }
    });

    // Style Table Header Cells (Row Index 7 & 8)
    for (let r = 7; r <= 8; r++) {
      for (let c = 0; c < totalCols; c++) {
        const cellRef = XLSX.utils.encode_cell({ r, c });
        if (!ws[cellRef]) {
          ws[cellRef] = { t: 's', v: '' };
        }
        ws[cellRef].s = {
          font: { name: 'Calibri', sz: 10, bold: true, color: { rgb: '000000' } },
          fill: { fgColor: { rgb: 'D9E1F2' } }, // Soft Light Blue Header Fill
          alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
          border: thinBorder
        };
      }
    }

    // Style Table Data Cells (Row Index 9 to dataEndRow)
    for (let r = dataStartRow; r <= dataEndRow; r++) {
      const isEvenRow = (r - dataStartRow) % 2 === 1;
      const rowFillColor = isEvenRow ? 'F9FAFB' : 'FFFFFF';

      for (let c = 0; c < totalCols; c++) {
        const cellRef = XLSX.utils.encode_cell({ r, c });
        if (!ws[cellRef]) {
          ws[cellRef] = { t: 's', v: '' };
        }

        const isNamaCol = c === 1;
        const isSkorCol = c === 3 + numCriteria;
        const isIntervalCol = c === 4 + numCriteria;

        ws[cellRef].s = {
          font: { 
            name: 'Calibri', 
            sz: 10, 
            bold: isSkorCol || isIntervalCol, 
            color: { rgb: '000000' } 
          },
          fill: { fgColor: { rgb: rowFillColor } },
          alignment: { 
            horizontal: isNamaCol ? 'left' : 'center', 
            vertical: 'center' 
          },
          border: thinBorder
        };
      }
    }

    // Style Footer Section Titles (Bold Section Headers)
    const refDecoded = XLSX.utils.decode_range(ws['!ref']);
    for (let r = dataEndRow + 1; r < r1Idx; r++) {
      const cellRef = XLSX.utils.encode_cell({ r, c: 0 });
      if (ws[cellRef] && typeof ws[cellRef].v === 'string') {
        const val = ws[cellRef].v.trim();
        if (/^(Keterangan|Kreativitas|Umpan Balik|Mahir|Cakap|Layak|Berkembang)/i.test(val)) {
          ws[cellRef].s = {
            font: { name: 'Calibri', sz: 10, bold: true, color: { rgb: '000000' } }
          };
        }
      }
    }

    // Style Signature Block Cells (Center Aligned across Merged Columns)
    [r1Idx, r2Idx, r3Idx, r4Idx].forEach((r, idx) => {
      // Left Block Cell (Col 0)
      const leftCellRef = XLSX.utils.encode_cell({ r: r, c: 0 });
      if (ws[leftCellRef]) {
        ws[leftCellRef].s = {
          font: { name: 'Calibri', sz: 10, bold: idx >= 2, color: { rgb: '000000' } },
          alignment: { horizontal: 'center', vertical: 'center' }
        };
      }

      // Right Block Cell (Col rightStartCol)
      const rightCellRef = XLSX.utils.encode_cell({ r: r, c: rightStartCol });
      if (ws[rightCellRef]) {
        ws[rightCellRef].s = {
          font: { name: 'Calibri', sz: 10, bold: idx >= 2, color: { rgb: '000000' } },
          alignment: { horizontal: 'center', vertical: 'center' }
        };
      }
    });

    // Auto Column Widths
    const colWidths = [
      { wch: 6 },  // Col A: No
      { wch: 30 }, // Col B: Nama Murid
      { wch: 16 }, // Col C: Kelompok / Tim
    ];
    criteria.forEach(() => colWidths.push({ wch: 18 })); // Criteria Columns
    colWidths.push({ wch: 10 }); // Skor Sum
    colWidths.push({ wch: 24 }); // Keterangan Interval Skor

    ws['!cols'] = colWidths;

    XLSX.utils.book_append_sheet(wb, ws, 'Rubrik Asesmen PJOK');

    const cleanOlahraga = (meta.olahraga || 'Basket').replace(/[^a-zA-Z0-9]/g, '_');
    const cleanKelas = (selectedKelas || 'X_E_1').replace(/[^a-zA-Z0-9]/g, '_');
    const fileName = `Rubrik_Asesmen_PJOK_${cleanOlahraga}_${cleanKelas}_${meta.tanggal}.xlsx`;

    XLSX.writeFile(wb, fileName);
  },

  /**
   * SMART IMPOR PARSER: Memisah Kolom Nama, Kelas, NISN, & JK secara Presisi
   */
  importFromExcel: function(file, callback) {
    if (typeof XLSX === 'undefined') {
      alert('Sistem impor XLSX belum siap.');
      return;
    }

    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonRows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        if (!jsonRows || jsonRows.length === 0) {
          alert('File Excel/CSV kosong.');
          return;
        }

        // Detect Header Row & Column Indexes
        let nameColIdx = -1;
        let classColIdx = -1;
        let headerRowIdx = -1;

        for (let i = 0; i < Math.min(15, jsonRows.length); i++) {
          const row = jsonRows[i];
          if (!row) continue;
          for (let j = 0; j < row.length; j++) {
            const cell = String(row[j] || '').trim().toUpperCase();
            if (/NAMA\s*(SISWA|MURID|LENGKAP|PESERTA)?/i.test(cell) && !/NAMA\s*SEKOLAH/i.test(cell) && !/NAMA\s*GURU/i.test(cell)) {
              nameColIdx = j;
              headerRowIdx = i;
            }
            if (/KELAS|FASE/i.test(cell)) {
              classColIdx = j;
            }
          }
          if (nameColIdx !== -1) break;
        }

        const parsedRecords = [];
        const startIdx = headerRowIdx !== -1 ? headerRowIdx + 1 : 0;

        for (let i = startIdx; i < jsonRows.length; i++) {
          const row = jsonRows[i];
          if (!row || row.length === 0) continue;

          let studentName = '';
          let studentClass = '';

          // If explicit column index was found
          if (nameColIdx !== -1 && row[nameColIdx] !== undefined) {
            const candidate = String(row[nameColIdx] || '').trim();
            if (this.isValidStudentName(candidate)) {
              studentName = candidate;
            }
          }

          // If no name found via header index, search cells intelligently
          if (!studentName) {
            for (let j = 0; j < row.length; j++) {
              const cellVal = String(row[j] || '').trim();
              if (this.isValidStudentName(cellVal)) {
                studentName = cellVal;
                break;
              }
            }
          }

          // Extract Class
          if (classColIdx !== -1 && row[classColIdx] !== undefined) {
            const cCandidate = String(row[classColIdx] || '').trim();
            if (/X[I]{0,2}\s+[E-F]/i.test(cCandidate) || /^X/i.test(cCandidate)) {
              studentClass = cCandidate.replace(/^Kelas\s+/i, '');
            }
          }

          // Search row for class if not found
          if (!studentClass) {
            for (let j = 0; j < row.length; j++) {
              const cellVal = String(row[j] || '').trim();
              if (/^X[I]{0,2}\s+[E-F]\s*[-_]?\s*\d+/i.test(cellVal)) {
                studentClass = cellVal.replace(/^Kelas\s+/i, '');
                break;
              }
            }
          }

          if (studentName) {
            parsedRecords.push({
              name: studentName,
              kelas: studentClass || 'X E-1'
            });
          }
        }

        callback(parsedRecords);
      } catch (err) {
        console.error('Error importing excel:', err);
        alert('Gagal membaca berkas Excel. Pastikan format file valid (.csv atau .xlsx).');
      }
    };

    reader.readAsArrayBuffer(file);
  },

  /**
   * Helper Validator untuk Menyaring Nama Murid Asli (Mengabaikan NISN, JK, Kelas, Poin, & Sampah Header)
   */
  isValidStudentName: function(str) {
    if (!str || typeof str !== 'string') return false;
    const clean = str.trim();
    if (clean.length < 3) return false;

    // Reject pure numbers (NISN, NIP, Phone, Row Numbers like 0109357110)
    if (/^\d+$/.test(clean)) return false;

    // Reject Class codes (e.g. X E-1, X E-2, XI F-3)
    if (/^X[I]{0,2}\s+[E-F]\s*[-_]?\s*\d+$/i.test(clean)) return false;

    // Reject Gender terms (Laki-laki, Perempuan, L, P, Male, Female)
    if (/^(Laki-laki|Perempuan|L|P|Male|Female)$/i.test(clean)) return false;

    // Reject Common Header/System words
    if (/^(No|No\.|NIS|NISN|NAMA|NAMA SISWA|NAMA MURID|KELAS|JENIS KELAMIN|JK|SKOR|TOTAL|KETERANGAN|INTERVAL|RESET|GURU|SEKOLAH|TANGGAL|HARI|PERANGKAT|PEMAIN)$/i.test(clean)) return false;

    // Must contain letters (alphabetic characters)
    if (!/[a-zA-Z]/.test(clean)) return false;

    return true;
  },

  formatDateIndo: function(dateStr) {
    if (!dateStr) return '';
    try {
      const parts = dateStr.split('-');
      if (parts.length !== 3) return dateStr;
      const monthNames = [
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
      ];
      return `${parseInt(parts[2], 10)} ${monthNames[parseInt(parts[1], 10) - 1]} ${parts[0]}`;
    } catch (e) {
      return dateStr;
    }
  }
};

window.ExcelExporter = ExcelExporter;
