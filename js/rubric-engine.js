/**
 * RUBRIC ENGINE - Multi-Category & Smart Tentative Scoring Engine
 * Mendukung Penilaian Tentatif Perangkat Pertandingan (Bobot Ideal 20% / Proporsional)
 */

const DEFAULT_DESCRIPTORS = {
  1: 'Melakukan dengan banyak kesalahan.',
  2: 'Cukup bisa walau kurang konsisten.',
  3: 'Menerapkan dengan akurasi baik.',
  4: 'Akurasi tinggi dan postur sempurna.'
};

const INITIAL_PRESETS = {
  basket: {
    nama: 'Bola Basket',
    categories: ['Pemain', 'Perangkat Pertandingan'],
    kriteria: [
      {
        id: 'c1',
        category: 'Pemain',
        name: 'Aturan Dasar',
        descriptors: {
          1: 'Melakukan dengan banyak kesalahan dan mengabaikan aturan dasar.',
          2: 'Cukup paham aturan dasar walau masih beberapa kali keliru.',
          3: 'Menerapkan aturan dasar dengan akurasi dan pemahaman yang baik.',
          4: 'Sangat menguasai seluruh aturan dasar permainan dengan sempurna.'
        }
      },
      {
        id: 'c2',
        category: 'Pemain',
        name: 'Dribbling',
        descriptors: {
          1: 'Melakukan dengan banyak kesalahan postur dan kontrol bola hilang.',
          2: 'Cukup bisa mendribble walau kurang konsisten saat bergerak.',
          3: 'Menerapkan dribble dengan akurasi baik dan pandangan terarah.',
          4: 'Akurasi tinggi, kontrol sempurna, dan postur terlindungi.'
        }
      },
      {
        id: 'c3',
        category: 'Pemain',
        name: 'Passing',
        descriptors: {
          1: 'Bermain tanpa strategi operan dan salah posisi lengan.',
          2: 'Mulai paham arah operan tapi eksekusi sering keliru.',
          3: 'Menerapkan passing dengan akurasi baik dan laju bola pas.',
          4: 'Operan sangat presisi, variatif, dan koordinasi mata-tangan sempurna.'
        }
      },
      {
        id: 'c4',
        category: 'Pemain',
        name: 'Menghargai Lawan dan Wasit',
        descriptors: {
          1: 'Sering emosional dan tidak menghargai keputusan wasit/lawan.',
          2: 'Cukup sopan walau kadang terpengaruh emosi pertandingan.',
          3: 'Menunjukkan sikap hormat tinggi kepada lawan dan keputusan wasit.',
          4: 'Sangat menjunjung tinggi fair play dan menjadi teladan di lapangan.'
        }
      },
      {
        id: 'c5',
        category: 'Pemain',
        name: 'Menerima Kekalahan & Kemenangan',
        descriptors: {
          1: 'Tidak sportif saat kalah atau berlebihan saat menang.',
          2: 'Bisa mengontrol emosi tetapi kurang bijak menyikapi hasil.',
          3: 'Menyikapi hasil pertandingan dengan dewasa dan menghormati lawan.',
          4: 'Sangat bijak, rendah hati saat menang, dan lapang dada saat kalah.'
        }
      }
    ]
  },
  voli: {
    nama: 'Bola Voli',
    categories: ['Pemain', 'Perangkat Pertandingan'],
    kriteria: [
      {
        id: 'c1',
        category: 'Pemain',
        name: 'Passing Bawah',
        descriptors: {
          1: 'Sikap pergelangan tangan tidak dirapatkan, pantulan tidak terarah.',
          2: 'Passing bawah cukup melambung namun arah bola kurang konsisten.',
          3: 'Teknik passing bawah tepat, lutut mengeper, pantulan bola akurat.',
          4: 'Kombinasi gerak sempurna, akurasi ke toser sangat stabil.'
        }
      },
      {
        id: 'c2',
        category: 'Pemain',
        name: 'Passing Atas',
        descriptors: {
          1: 'Jari-jari kaku, bola mengenai telapak tangan secara salah.',
          2: 'Passing atas cukup baik tetapi dorongan jari kurang bertenaga.',
          3: 'Menerapkan dorongan jari-jari dengan akurasi dan parabola baik.',
          4: 'Umpan bola atas sangat halus, presisi tinggi, dan mudah dismash.'
        }
      },
      {
        id: 'c3',
        category: 'Pemain',
        name: 'Servis Bawah / Atas',
        descriptors: {
          1: 'Servis tidak menyeberangi net atau keluar lapangan.',
          2: 'Servis menyeberang net namun kecepatan dan arah bola mudah dibaca.',
          3: 'Servis akurat menargetkan area kosong lawan dengan tenaga baik.',
          4: 'Servis tajam, bervariasi, dan konsisten menghasilkan poin.'
        }
      },
      {
        id: 'c_smash',
        category: 'Pemain',
        name: 'Smash / Serangan',
        descriptors: {
          1: 'Langkah awalan salah, pukulan menyangkut net atau keluar jauh.',
          2: 'Awalan cukup baik namun perkenaan bola dengan tangan tidak pas.',
          3: 'Lompatan dan timing pas, pukulan terarah melewati net.',
          4: 'Lompatan maksimal, timing sempurna, pukulan keras dan menukik tajam.'
        }
      },
      {
        id: 'c4',
        category: 'Perangkat Pertandingan',
        name: 'Pencatat Skor & Hakim Garis',
        descriptors: {
          1: 'Sering keliru mencatat skor atau sinyal garis bola.',
          2: 'Mampu mencatat skor tetapi membutuhkan konfirmasi wasit utama.',
          3: 'Fokus tinggi, sinyal hakim garis jelas dan tepat waktu.',
          4: 'Manajemen pencatatan skor sempurna dan keputusan garis akurat.'
        }
      }
    ]
  },
  sepakbola: {
    nama: 'Sepak Bola',
    categories: ['Pemain', 'Perangkat Pertandingan'],
    kriteria: [
      {
        id: 'c1',
        category: 'Pemain',
        name: 'Passing & First Touch',
        descriptors: {
          1: 'Operan sering melenceng dan kontrol bola terlepas.',
          2: 'Passing cukup baik tapi kontrol bola pertama masih jauh.',
          3: 'Passing akurat kaki dalam dan kontrol bola dekat dengan badan.',
          4: 'Operan presisi tinggi, vision baik, dan first touch sempurna.'
        }
      },
      {
        id: 'c2',
        category: 'Pemain',
        name: 'Dribbling & Menggiring',
        descriptors: {
          1: 'Dribble bola terlalu jauh sehingga mudah direbut lawan.',
          2: 'Mendribble dengan satu kaki saja dan pandangan terlalu ke bawah.',
          3: 'Dribble rapat dengan variasi arah dan pandangan melihat lapangan.',
          4: 'Kelincahan tinggi, mampu melewati lawan dengan variasi teknik.'
        }
      },
      {
        id: 'c3',
        category: 'Pemain',
        name: 'Shooting ke Gawang',
        descriptors: {
          1: 'Tembakan tidak bertenaga dan jauh dari sasaran.',
          2: 'Tembakan terarah tetapi kurang bertenaga.',
          3: 'Tembakan bertenaga dan akurat menargetkan gawang.',
          4: 'Tembakan tajam, bervariasi (punggung kaki/plasing), akurasi tinggi.'
        }
      }
    ]
  },
  bulutangkis: {
    nama: 'Bulu Tangkis',
    categories: ['Pemain', 'Perangkat Pertandingan'],
    kriteria: [
      {
        id: 'c1',
        category: 'Pemain',
        name: 'Servis (Pendek / Panjang)',
        descriptors: {
          1: 'Pegangan raket salah, kok sering tersangkut di net.',
          2: 'Servis masuk tapi ketinggian kok terlalu melambung manis.',
          3: 'Servis pendek tipis di atas net / servis panjang jauh ke belakang.',
          4: 'Servis sangat presisi, menyulitkan lawan melakukan serangan balik.'
        }
      },
      {
        id: 'c2',
        category: 'Pemain',
        name: 'Footwork & Pukulan Lob',
        descriptors: {
          1: 'Pergerakan kaki lambat dan posisi memukul bola terlambat.',
          2: 'Footwork cukup baik tapi pukulan lob belum mencapai garis belakang.',
          3: 'Footwork lincah, memukul lob melambung tinggi ke area belakang.',
          4: 'Pergerakan lapangan sangat efisien dan perulangan gerakan sempurna.'
        }
      }
    ]
  },
  atletik: {
    nama: 'Atletik (Lari Jarak Pendek)',
    categories: ['Pemain', 'Perangkat Pertandingan'],
    kriteria: [
      {
        id: 'c1',
        category: 'Pemain',
        name: 'Teknik Start Jongkok',
        descriptors: {
          1: 'Posisi "Bersedia" dan "Siap" salah, sering mencuri start.',
          2: 'Posisi start lumayan tetapi panggul tidak diangkat saat "Siap".',
          3: 'Posisi "Bersedia" dan "Siap" benar, tolakan kaki kuat saat "Ya".',
          4: 'Reaksi sangat cepat, tolakan meluncur eksplosif dan stabil.'
        }
      },
      {
        id: 'c2',
        category: 'Pemain',
        name: 'Teknik Sprint & Ayunan Tangan',
        descriptors: {
          1: 'Langkah kaki pendek, siku kaku, postur terlalu membungkuk.',
          2: 'Ayunan tangan cukup tapi langkah belum maksimal.',
          3: 'Langkah lebar frekuensi cepat, siku 90 derajat, badan tegak rekos.',
          4: 'Sprint maksimum, koordinasi siku dan lutut sempurna.'
        }
      }
    ]
  },
  senam: {
    nama: 'Senam Lantai',
    categories: ['Pemain', 'Perangkat Pertandingan'],
    kriteria: [
      {
        id: 'c1',
        category: 'Pemain',
        name: 'Roll Depan / Guling Depan',
        descriptors: {
          1: 'Tengkuk tidak menempel matras, tumpuan tangan miring.',
          2: 'Bisa berguling tapi dorongan kurang lurus atau butuh bantuan.',
          3: 'Gulingan lurus dari sikap awal hingga berdiri kembali.',
          4: 'Gerakan sangat halus, estetis, dan dorongan seimbang.'
        }
      }
    ]
  },
  senamRitmik: {
    nama: 'Senam Ritmik',
    categories: ['Pemain'],
    kriteria: [
      {
        id: 'c1',
        category: 'Pemain',
        name: 'Kelenturan & Postur',
        descriptors: {
          1: 'Postur kaku dan gerakan tidak merepresentasikan kelenturan dasar.',
          2: 'Mampu melakukan beberapa gerakan lentur namun sering tidak stabil.',
          3: 'Kelenturan baik, postur terjaga pada sebagian besar elemen gerakan.',
          4: 'Kelenturan maksimal dan postur tubuh sangat anggun/sempurna.'
        }
      },
      {
        id: 'c2',
        category: 'Pemain',
        name: 'Keseimbangan & Pivot',
        descriptors: {
          1: 'Sering jatuh atau goyah saat melakukan keseimbangan.',
          2: 'Keseimbangan cukup namun durasi menahan posisi kurang.',
          3: 'Mampu menahan pose keseimbangan dengan baik dan stabil.',
          4: 'Keseimbangan sempurna dan eksekusi pivot sangat halus.'
        }
      },
      {
        id: 'c3',
        category: 'Pemain',
        name: 'Koordinasi Gerak (Alat/Tubuh)',
        descriptors: {
          1: 'Gerakan terputus-putus dan tidak sinkron.',
          2: 'Koordinasi cukup namun transisi antar gerakan kurang mulus.',
          3: 'Gerakan tersinkronisasi dengan baik secara keseluruhan.',
          4: 'Koordinasi tubuh dan alat sangat presisi tanpa kesalahan.'
        }
      },
      {
        id: 'c4',
        category: 'Pemain',
        name: 'Musikalitas & Ritmik',
        descriptors: {
          1: 'Gerakan sangat tidak sesuai dengan ketukan musik.',
          2: 'Beberapa gerakan sesuai musik, namun sering meleset dari tempo.',
          3: 'Gerakan seirama dengan musik dan mengikuti tempo dengan baik.',
          4: 'Penjiwaan musik sempurna, setiap gerakan menyatu dengan nada.'
        }
      },
      {
        id: 'c5',
        category: 'Pemain',
        name: 'Ekspresi & Kreativitas',
        descriptors: {
          1: 'Tidak ada ekspresi dan koreografi monoton.',
          2: 'Ada sedikit ekspresi namun kurang menjiwai rutinitas.',
          3: 'Koreografi menarik dan menunjukkan penjiwaan yang baik.',
          4: 'Koreografi sangat orisinal, ekspresi memukau dan percaya diri penuh.'
        }
      }
    ]
  }
};


class RubricEngine {
  constructor(initialSport = 'basket') {
    this.currentSport = initialSport;
    this.customTopics = {};
    this.loadAllTopicSavedPresets();
    this.activeCategory = 'Pemain';
    this.initSport(initialSport);
  }

  loadAllTopicSavedPresets() {
    try {
      const saved = localStorage.getItem('pjok_topic_custom_presets');
      if (saved) {
        this.customTopics = JSON.parse(saved);
        
        Object.keys(this.customTopics).forEach(key => {
          const t = this.customTopics[key];
          if (t && t.categories) {
            t.categories = t.categories.map(c => c === 'Perangkat' ? 'Perangkat Pertandingan' : c);
          }
          if (t && t.kriteria) {
            // Purge any lingering draft 'Kriteria Baru 1' from old local cache
            t.kriteria = t.kriteria.filter(crit => crit && crit.name && !/^KRITERIA BARU\s*\d*$/i.test(crit.name.trim()));
            t.kriteria.forEach(crit => {
              if (crit.category === 'Perangkat') crit.category = 'Perangkat Pertandingan';
            });
          }
        });
      }
    } catch (e) {
      console.warn('Could not load custom topic presets', e);
      this.customTopics = {};
    }
  }

  resetCurrentSportToDefault() {
    if (INITIAL_PRESETS[this.currentSport]) {
      delete this.customTopics[this.currentSport];
      this.saveAllTopicPresets();
      this.initSport(this.currentSport);
      return true;
    }
    return false;
  }

  saveAllTopicPresets() {
    try {
      localStorage.setItem('pjok_topic_custom_presets', JSON.stringify(this.customTopics));
    } catch (e) {
      console.warn('Could not save topic presets', e);
    }
  }

  getAllAvailableTopics() {
    const list = [];
    
    Object.keys(INITIAL_PRESETS).forEach(key => {
      const customOverride = this.customTopics[key];
      list.push({
        key: key,
        nama: customOverride ? customOverride.nama : INITIAL_PRESETS[key].nama,
        isCustom: false
      });
    });

    Object.keys(this.customTopics).forEach(key => {
      if (!INITIAL_PRESETS[key]) {
        list.push({
          key: key,
          nama: this.customTopics[key].nama,
          isCustom: true
        });
      }
    });

    return list;
  }

  initSport(sportKey) {
    this.currentSport = sportKey;
    
    if (this.customTopics[sportKey]) {
      this.topicData = JSON.parse(JSON.stringify(this.customTopics[sportKey]));
    } else if (INITIAL_PRESETS[sportKey]) {
      this.topicData = JSON.parse(JSON.stringify(INITIAL_PRESETS[sportKey]));
    } else {
      this.topicData = {
        nama: sportKey,
        categories: ['Pemain', 'Perangkat Pertandingan'],
        kriteria: [
          {
            id: 'c_new_1',
            category: 'Pemain',
            name: 'Penguasaan Teknik Dasar',
            descriptors: { ...DEFAULT_DESCRIPTORS }
          }
        ]
      };
    }

    if (!this.topicData.categories || this.topicData.categories.length === 0) {
      this.topicData.categories = ['Pemain', 'Perangkat Pertandingan'];
    } else {
      this.topicData.categories = this.topicData.categories.map(c => c === 'Perangkat' ? 'Perangkat Pertandingan' : c);
    }

    this.activeCategory = this.topicData.categories[0] || 'Pemain';

    this.topicData.kriteria.forEach(c => {
      if (!c.category || c.category === 'Perangkat') c.category = 'Perangkat Pertandingan';
      if (!c.descriptors) c.descriptors = { ...DEFAULT_DESCRIPTORS };
    });
  }

  setSportPreset(sportKey) {
    this.initSport(sportKey);
  }

  saveTopicCustomDefault(sportKey, topicName, categories, criteriaList) {
    this.topicData.nama = topicName || this.topicData.nama;
    
    const cleanCategories = (categories || this.topicData.categories || ['Pemain', 'Perangkat Pertandingan'])
      .map(c => c === 'Perangkat' ? 'Perangkat Pertandingan' : c);

    const cleanCriteria = criteriaList.map(c => ({
      ...c,
      category: c.category === 'Perangkat' ? 'Perangkat Pertandingan' : (c.category || 'Pemain')
    }));

    this.customTopics[sportKey] = {
      nama: this.topicData.nama,
      categories: cleanCategories,
      kriteria: cleanCriteria
    };

    this.saveAllTopicPresets();
    this.initSport(sportKey);
  }

  setSportName(newName) {
    if (!newName) return;
    this.topicData.nama = newName.trim();
    if (this.customTopics[this.currentSport]) {
      this.customTopics[this.currentSport].nama = newName.trim();
      this.saveAllTopicPresets();
    }
  }

  getSportName() {
    return this.topicData.nama;
  }

  getCategories() {
    return this.topicData.categories;
  }

  getActiveCategory() {
    return this.activeCategory;
  }

  setActiveCategory(cat) {
    this.activeCategory = cat;
  }

  getCriteria(categoryFilter = null) {
    if (!categoryFilter) {
      return this.topicData.kriteria;
    }
    return this.topicData.kriteria.filter(c => c.category === categoryFilter);
  }

  setCriteria(newCriteriaList) {
    this.topicData.kriteria = newCriteriaList;
  }

  getMaxScore() {
    return this.topicData.kriteria.length * 4;
  }

  getMinScore() {
    return this.topicData.kriteria.length * 1;
  }

  /**
   * Menghitung Interval Skor Dinamis (Murni: Mahir, Cakap, Layak, Berkembang)
   * Berdasarkan Kriteria Aktif Keseluruhan atau Kriteria Terisi Saja
   */
  getIntervals(customMaxScore = null) {
    const max = customMaxScore || this.getMaxScore();
    const min = customMaxScore ? Math.ceil(customMaxScore / 4) : this.getMinScore();
    const range = max - min + 1;
    const step = Math.floor(range / 4);

    const mahirMin = max - step + 1;
    const cakapMin = mahirMin - step;
    const layakMin = cakapMin - step;

    return {
      mahir: { label: 'Mahir', min: mahirMin, max: max, code: 'Mahir' },
      cakap: { label: 'Cakap', min: cakapMin, max: mahirMin - 1, code: 'Cakap' },
      layak: { label: 'Layak', min: layakMin, max: cakapMin - 1, code: 'Layak' },
      berkembang: { label: 'Berkembang', min: min, max: layakMin - 1, code: 'Berkembang' }
    };
  }

  /**
   * SMART TENTATIVE SCORING:
   * Mengkalkulasi nilai siswa berdasarkan kriteria yang benar-benar dinilai untuk siswa tersebut.
   * Jika Kriteria Perangkat Pertandingan tidak diisi/kosong, siswa TIDAK dirugikan!
   */
  classifyStudentDynamicScore(scoresMap) {
    if (!scoresMap || Object.keys(scoresMap).length === 0) {
      return { label: 'Belum Dinilai', code: 'Unscored', badgeClass: 'badge-secondary', totalScore: 0, maxPossible: 0 };
    }

    const criteriaList = this.topicData.kriteria;
    let totalScore = 0;
    let maxPossible = 0;
    let scoredCriteriaCount = 0;
    let hasPerangkatScore = false;

    criteriaList.forEach(c => {
      const val = scoresMap[c.id] || 0;
      if (val > 0) {
        totalScore += val;
        maxPossible += 4;
        scoredCriteriaCount++;
        if (c.category === 'Perangkat Pertandingan') {
          hasPerangkatScore = true;
        }
      }
    });

    if (scoredCriteriaCount === 0) {
      return { label: 'Belum Dinilai', code: 'Unscored', badgeClass: 'badge-secondary', totalScore: 0, maxPossible: 0 };
    }

    const intervals = this.getIntervals(maxPossible);

    let resultClassification;
    if (totalScore >= intervals.mahir.min) {
      resultClassification = { label: intervals.mahir.label, code: 'Mahir', badgeClass: 'badge-mahir' };
    } else if (totalScore >= intervals.cakap.min) {
      resultClassification = { label: intervals.cakap.label, code: 'Cakap', badgeClass: 'badge-cakap' };
    } else if (totalScore >= intervals.layak.min) {
      resultClassification = { label: intervals.layak.label, code: 'Layak', badgeClass: 'badge-layak' };
    } else {
      resultClassification = { label: intervals.berkembang.label, code: 'Berkembang', badgeClass: 'badge-berkembang' };
    }

    resultClassification.totalScore = totalScore;
    resultClassification.maxPossible = maxPossible;
    resultClassification.hasPerangkatScore = hasPerangkatScore;

    return resultClassification;
  }

  classifyScore(totalScore) {
    if (totalScore === 0) return { label: 'Belum Dinilai', code: 'Unscored', badgeClass: 'badge-secondary' };
    const intervals = this.getIntervals();

    if (totalScore >= intervals.mahir.min) {
      return { label: intervals.mahir.label, code: 'Mahir', badgeClass: 'badge-mahir' };
    } else if (totalScore >= intervals.cakap.min) {
      return { label: intervals.cakap.label, code: 'Cakap', badgeClass: 'badge-cakap' };
    } else if (totalScore >= intervals.layak.min) {
      return { label: intervals.layak.label, code: 'Layak', badgeClass: 'badge-layak' };
    } else {
      return { label: intervals.berkembang.label, code: 'Berkembang', badgeClass: 'badge-berkembang' };
    }
  }

  generateFeedback(studentName, scoresMap, categoryCode) {
    if (!scoresMap || Object.keys(scoresMap).length === 0) {
      return 'Belum ada penilaian.';
    }

    const criteriaList = this.topicData.kriteria;
    let highestCrit = '';
    let lowestCrit = '';
    let maxVal = -1;
    let minVal = 5;
    let perangkatNotes = '';

    criteriaList.forEach(c => {
      const val = scoresMap[c.id] || 0;
      if (val > maxVal) { maxVal = val; highestCrit = c.name; }
      if (val < minVal && val > 0) { minVal = val; lowestCrit = c.name; }
      if (c.category === 'Perangkat Pertandingan' && val > 0) {
        perangkatNotes = ` Aktif bertugas sebagai perangkat pertandingan (Skor ${val}/4).`;
      }
    });

    let mainFeedback = '';
    if (categoryCode === 'Mahir') {
      mainFeedback = `${studentName} menunjukkan penguasaan sangat baik terutama pada ${highestCrit}. Siap menjadi tutor sebaya.`;
    } else if (categoryCode === 'Cakap') {
      mainFeedback = `${studentName} menguasai ${highestCrit} dengan baik. Perlu pemantapan pada aspek ${lowestCrit}.`;
    } else if (categoryCode === 'Layak') {
      mainFeedback = `${studentName} cukup baik pada ${highestCrit}, namun perlu perbaikan pada ${lowestCrit}.`;
    } else {
      mainFeedback = `${studentName} memerlukan bimbingan terstruktur dan latihan terfokus pada ${lowestCrit || 'teknik dasar'}.`;
    }

    return mainFeedback + perangkatNotes;
  }
}

window.RubricEngine = RubricEngine;
window.INITIAL_PRESETS = INITIAL_PRESETS;
