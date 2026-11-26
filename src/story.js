/**
 * GTA: San Sidoarjo (Grand Telkom Academy: Sidoarjo)
 * - ZERO spoilers on choice labels (no "(Benar!)" and no "+/- points" revealed beforehand!)
 * - 100% general-knowledge & everyday school questions for all exhibition visitors
 * - 100% keyboard-less hand-gesture friendly (including secret 2-finger Peace Easter Egg!)
 */

export const STORY_STAGES = [
  {
    id: 'ch1_gate',
    chapterTitle: 'Bab 1 · Gerbang San Sidoarjo (07:00)',
    timeLabel: '07:00 · Pagi',
    lighting: 'morning',
    mission: 'Temui Pak Budi (Penjaga Sekolah) di dekat gerbang utama!',
    targetId: 'pak_budi',
    targetPos: { x: -2.0, z: 18.2 },
    interactRadius: 3.1,
    dialogue: [
      {
        speaker: 'Pak Budi',
        role: 'Penjaga Sekolah · Grand Telkom Academy: San Sidoarjo',
        npcId: 'pak_budi',
        npcAnim: 'Talking',
        text: 'Selamat pagi, Nak! Kamu Rafi, siswa baru di San Sidoarjo ya? Gagah banget seragam rompi marun SMK Telkom-mu hari ini! Yuk mulai hari pertamamu di kampus!',
      },
      {
        speaker: 'Pak Budi',
        role: 'Penjaga Sekolah · San Sidoarjo',
        npcId: 'pak_budi',
        npcAnim: 'Talking',
        text: 'Tadi ada Buku Tugas jatuh di bangku taman sebelah kiri halaman. Kamu mau langsung ambil bukunya, atau mau santai dulu?',
        choices: [
          {
            label: 'Sapa ramah dan langsung cek bangku taman',
            stats: { sosial: 10, akademik: 5 },
            replySpeaker: 'Pak Budi',
            replyRole: 'Penjaga Sekolah',
            replyNpcAnim: 'Agree',
            replyText: 'Mantap sikapmu, Rafi! Sopan dan tanggap! Ambil buku tugasmu di bangku kiri ya, lalu silakan keliling kampus — banyak kejutan tersembunyi di sini!',
          },
          {
            label: 'Tanya lokasi lapangan olahraga dengan semangat',
            stats: { olahraga: 10, sosial: 5 },
            replySpeaker: 'Pak Budi',
            replyRole: 'Penjaga Sekolah',
            replyNpcAnim: 'Agree',
            replyText: 'Lapangan Basket di timur dan Lapangan Bola di barat siap dipakai sore nanti! Ambil dulu buku tugas di bangku kiri supaya tidak dimarahi Ibu Sari.',
          },
          {
            label: 'Pura-pura nggak lihat bukunya biar nggak ribet',
            stats: { sosial: -5, akademik: -5 },
            isPenalty: true,
            penaltyBanner: 'KETEGAAN! SIKAP KURANG BAIK',
            replySpeaker: 'Pak Budi',
            replyRole: 'Penjaga Sekolah',
            replyNpcAnim: 'Talking',
            replyText: 'Waduh, Nak... jangan malas di hari pertama dong! Padahal itu buku tugasmu sendiri lho. Yuk tetap diambil di bangku kiri ya!',
          },
        ],
      },
    ],
  },

  {
    id: 'ch1_book',
    chapterTitle: 'Bab 1 · Buku Tugas di Halaman (07:10)',
    timeLabel: '07:10 · Pagi',
    lighting: 'morning',
    mission: 'Ambil tumpukan Buku Tugas di bangku taman sebelah kiri halaman!',
    targetId: 'homework_book',
    targetPos: { x: -9.8, z: 12.6 },
    interactRadius: 2.8,
    onInteractEffect: 'pickupBook',
    missionPassedTitle: 'BUKU TUGAS DITEMUKAN!',
    dialogue: [
      {
        speaker: 'Rafi',
        role: 'Siswa Baru · San Sidoarjo',
        npcId: null,
        text: 'Untung saja aku ambil! Bel masuk berbunyi — ayo cepat masuk ke Ruang Kelas di sayap kiri-utara sebelum Ibu Sari mulai mengabsen!',
      },
    ],
  },

  {
    id: 'ch2_class_quiz',
    chapterTitle: 'Bab 2 · Kuis Umum di Kelas XI (08:30)',
    timeLabel: '08:30 · Pagi Cerah',
    lighting: 'morning',
    mission: 'Masuk ke Ruang Kelas (sayap kiri-utara) dan temui Ibu Sari!',
    targetId: 'ibu_sari',
    targetPos: { x: -16.8, z: -13.2 },
    interactRadius: 3.4,
    missionPassedTitle: 'KUIS KELAS SELESAI!',
    dialogue: [
      {
        speaker: 'Ibu Sari',
        role: 'Wali Kelas · Grand Telkom Academy: San Sidoarjo',
        npcId: 'ibu_sari',
        npcAnim: 'Talking',
        text: 'Selamat datang di kelas, Rafi! Sebelum pelajaran dimulai, kita pemanasan dengan 3 Kuis Pengetahuan Umum & Sidoarjo. Angkat 1, 2, atau 3 jari di depan kamera untuk memilih jawabanmu!',
      },
      {
        speaker: 'Ibu Sari',
        role: 'Mini-Quiz 1/3 · Kuliner Khas Sidoarjo',
        npcId: 'ibu_sari',
        npcAnim: 'Talking',
        text: 'Soal 1: Sidoarjo dikenal sebagai Kota Udang & Bandeng! Apa nama kuliner legendaris khas Sidoarjo yang disajikan dengan kuah petis hangat dan sate kerang?',
        choices: [
          {
            label: 'Lontong Kupang',
            stats: { akademik: 15 },
            replySpeaker: 'Ibu Sari',
            replyRole: 'Wali Kelas',
            replyNpcAnim: 'Agree',
            replyText: 'Tepat sekali!! Lontong Kupang + es degan memang juara khas Sidoarjo! Nilai penuh untukmu, Rafi!',
          },
          {
            label: 'Pempek Palembang',
            stats: { akademik: -5 },
            isPenalty: true,
            penaltyBanner: 'SALAH DAERAH!',
            replySpeaker: 'Ibu Sari',
            replyRole: 'Wali Kelas',
            replyNpcAnim: 'Talking',
            replyText: 'Hehe, Pempek itu dari Palembang, Nak! Kuliner khas Sidoarjo adalah Lontong Kupang. Ayo lebih teliti di soal berikutnya!',
          },
          {
            label: 'Gudeg Jogja',
            stats: { akademik: -5 },
            isPenalty: true,
            penaltyBanner: 'KURANG TEPAT!',
            replySpeaker: 'Ibu Sari',
            replyRole: 'Wali Kelas',
            replyNpcAnim: 'Talking',
            replyText: 'Wah jauh sekali ke Yogyakarta! Yang khas Sidoarjo itu Lontong Kupang ya.',
          },
        ],
      },
      {
        speaker: 'Ibu Sari',
        role: 'Mini-Quiz 2/3 · Wawasan Nusantara',
        npcId: 'ibu_sari',
        npcAnim: 'Talking',
        text: 'Soal 2: Bendera kebangsaan kita adalah Sang Saka Merah Putih. Apa makna dari warna MERAH pada bendera Indonesia?',
        choices: [
          {
            label: 'Kesucian',
            stats: { akademik: -5 },
            isPenalty: true,
            penaltyBanner: 'TERBALIK!',
            replySpeaker: 'Ibu Sari',
            replyRole: 'Wali Kelas',
            replyNpcAnim: 'Talking',
            replyText: 'Hampir! Kesucian adalah makna warna Putih, sedangkan Merah melambangkan Keberanian.',
          },
          {
            label: 'Keberanian',
            stats: { akademik: 15 },
            replySpeaker: 'Ibu Sari',
            replyRole: 'Wali Kelas',
            replyNpcAnim: 'Agree',
            replyText: 'Benar 100%! Merah melambangkan keberanian, dan Putih melambangkan kesucian!',
          },
          {
            label: 'Rasa pedas sambal petis',
            stats: { sosial: 5, akademik: -5 },
            isPenalty: true,
            penaltyBanner: 'BIKIN NGAKAK SEKELAS!',
            replySpeaker: 'Ibu Sari',
            replyRole: 'Wali Kelas',
            replyNpcAnim: 'Agree',
            replyText: 'Hahaha, sekelas langsung ketawa! Kamu asik banget, tapi jawaban yang benar adalah Keberanian ya!',
          },
        ],
      },
      {
        speaker: 'Ibu Sari',
        role: 'Mini-Quiz 3/3 · Minat & Bakat Siswa',
        npcId: 'ibu_sari',
        npcAnim: 'Talking',
        text: 'Soal 3: Di hari pertamamu di Grand Telkom Academy: San Sidoarjo, aktivitas apa yang paling bikin kamu bersemangat?',
        choices: [
          {
            label: 'Belajar di Lab & ikut Olimpiade Sekolah',
            stats: { akademik: 15 },
            replySpeaker: 'Ibu Sari',
            replyRole: 'Wali Kelas',
            replyNpcAnim: 'Agree',
            replyText: 'Semangat juara! Dinda di Lab nanti pasti senang sekali bekerja sama denganmu!',
          },
          {
            label: 'Ikut OSIS, Pensi Seni, & cari banyak teman',
            stats: { sosial: 15 },
            replySpeaker: 'Ibu Sari',
            replyRole: 'Wali Kelas',
            replyNpcAnim: 'Agree',
            replyText: 'Luar biasa! Kamu bakal cepat dikenal satu sekolah. Temui Pak Hendra di Ruang Seni setelah ini ya!',
          },
          {
            label: 'Berprestasi di tim Basket & Sepak Bola',
            stats: { olahraga: 15 },
            replySpeaker: 'Ibu Sari',
            replyRole: 'Wali Kelas',
            replyNpcAnim: 'Agree',
            replyText: 'Energi atlet sejati! Sore nanti tunjukkan aksimu di Lapangan Basket dan Sepak Bola ya!',
          },
        ],
      },
      {
        speaker: 'Ibu Sari',
        role: 'Wali Kelas',
        npcId: 'ibu_sari',
        npcAnim: 'Talking',
        text: 'Bagus sekali! Jam berikutnya adalah pelajaran Seni & Musik bersama Pak Hendra di Ruang Seni (tepat di selatan kelas ini). Kamu juga bisa menyapa Bima di pojok kelas kalau mau kuis bonus!',
      },
    ],
  },

  {
    id: 'ch3_music_intro',
    chapterTitle: 'Bab 3 · Ruang Seni & Musik (10:15)',
    timeLabel: '10:15 · Pagi',
    lighting: 'morning',
    mission: 'Kunjungi Ruang Seni & Musik (sayap barat-tengah) dan temui Pak Hendra!',
    targetId: 'pak_hendra_seni',
    targetPos: { x: -18.8, z: 3.4 },
    interactRadius: 3.4,
    startMinigameAfter: 'piano',
    dialogue: [
      {
        speaker: 'Pak Hendra',
        role: 'Pembina Seni & Pensi · San Sidoarjo',
        npcId: 'pak_hendra_seni',
        npcAnim: 'Talking',
        text: 'Halo Rafi! Selamat datang di Ruang Seni! Sebelum mencoba Piano 3D, jawab 1 pertanyaan tentang musik Nusantara dulu ya!',
      },
      {
        speaker: 'Pak Hendra',
        role: 'Mini-Quiz Musik Nusantara',
        npcId: 'pak_hendra_seni',
        npcAnim: 'Talking',
        text: 'Alat musik tradisional Indonesia dari Jawa Barat yang terbuat dari bambu dan dimainkan dengan cara digoyangkan disebut?',
        choices: [
          {
            label: 'Gitar Listrik',
            stats: { akademik: -5 },
            isPenalty: true,
            penaltyBanner: 'SALAH TEBAK!',
            replySpeaker: 'Pak Hendra',
            replyRole: 'Pembina Seni',
            replyNpcAnim: 'Talking',
            replyText: 'Waduh, gitar listrik nggak terbuat dari bambu dong! Yang benar adalah Angklung. Yuk langsung coba Piano 3D!',
          },
          {
            label: 'Drum Band',
            stats: { akademik: -5, sosial: 5 },
            isPenalty: true,
            penaltyBanner: 'KURANG TEPAT!',
            replySpeaker: 'Pak Hendra',
            replyRole: 'Pembina Seni',
            replyNpcAnim: 'Agree',
            replyText: 'Hahaha seru sih, tapi yang dari bambu digoyangkan itu Angklung! Ayo langsung praktik main Piano 3D!',
          },
          {
            label: 'Angklung',
            stats: { akademik: 10, sosial: 5 },
            replySpeaker: 'Pak Hendra',
            replyRole: 'Pembina Seni',
            replyNpcAnim: 'Agree',
            replyText: 'Betul sekali! Angklung bahkan sudah diakui UNESCO! Sekarang ayo mainkan 6 nada Piano 3D dengan gerakan tanganmu!',
          },
        ],
      },
    ],
  },

  {
    id: 'ch3_music_done',
    chapterTitle: 'Bab 3 · Harmoni Piano Sempurna! (11:00)',
    timeLabel: '11:00 · Menjelang Siang',
    lighting: 'midday',
    mission: 'Dengarkan apresiasi dari Pak Hendra!',
    autoTrigger: true,
    missionPassedTitle: 'PIANO CHALLENGE PASSED!',
    dialogue: [
      {
        speaker: 'Pak Hendra',
        role: 'Pembina Seni & Pensi',
        npcId: 'pak_hendra_seni',
        npcAnim: 'Agree',
        text: 'Keren banget permainan pianomu, Rafi! Sekarang waktunya istirahat — ambil Tas Praktikum di barisan Loker koridor tengah lalu bantu Dinda di Lab!',
      },
    ],
  },

  {
    id: 'ch4_locker',
    chapterTitle: 'Bab 4 · Koridor Loker (12:00)',
    timeLabel: '12:00 · Siang',
    lighting: 'midday',
    mission: 'Ambil Tas Praktikum di depan barisan Loker di koridor tengah!',
    targetId: 'locker_backpack',
    targetPos: { x: -2.0, z: -14.8 },
    interactRadius: 2.8,
    onInteractEffect: 'pickupBackpack',
    missionPassedTitle: 'TAS PRAKTIKUM DIAMBIL!',
    dialogue: [
      {
        speaker: 'Rafi',
        role: 'Siswa Baru · San Sidoarjo',
        npcId: null,
        text: 'Tas praktikum sudah aman! Sekarang langsung ke Ruang Lab di sayap kanan-utara untuk menemui Dinda.',
      },
    ],
  },

  {
    id: 'ch4_lab_intro',
    chapterTitle: 'Bab 4 · Eksperimen Mikroskop di Lab (12:25)',
    timeLabel: '12:25 · Siang',
    lighting: 'midday',
    mission: 'Temui Dinda di meja Mikroskop Lab (sayap kanan-utara)!',
    targetId: 'dinda',
    targetPos: { x: 17.5, z: -11.4 },
    interactRadius: 3.2,
    startMinigameAfter: 'microscope',
    dialogue: [
      {
        speaker: 'Dinda',
        role: 'Ketua Klub Sains · San Sidoarjo',
        npcId: 'dinda',
        npcAnim: 'Talking',
        text: 'Hai Rafi! Kebetulan banget kamu datang. Yuk bantu aku mengatur fokus lensa mikroskop untuk mengamati daun tanaman sekolah! Naik-turunkan tanganmu di depan kamera supaya jarum kuning stabil di Zona Hijau!',
      },
    ],
  },

  {
    id: 'ch4_lab_done',
    chapterTitle: 'Bab 4 · Fokus Mikroskop Sempurna! (13:15)',
    timeLabel: '13:15 · Siang',
    lighting: 'midday',
    mission: 'Dengarkan hasil pengamatan dari Dinda!',
    autoTrigger: true,
    missionPassedTitle: 'LAB CHALLENGE PASSED!',
    dialogue: [
      {
        speaker: 'Dinda',
        role: 'Ketua Klub Sains',
        npcId: 'dinda',
        npcAnim: 'Agree',
        text: 'Tajam banget hasil fokusnya! Sore sudah tiba — Dimas menunggumu di Lapangan Basket sebelah tenggara halaman!',
      },
    ],
  },

  {
    id: 'ch5_basket_intro',
    chapterTitle: 'Bab 5 · Tantangan Basket Senja (15:15)',
    timeLabel: '15:15 · Sore',
    lighting: 'sunset',
    mission: 'Pergi ke Lapangan Basket (sayap kanan-selatan) dan temui Dimas!',
    targetId: 'dimas',
    targetPos: { x: 17.2, z: 12.2 },
    interactRadius: 3.4,
    startMinigameAfter: 'basketball',
    dialogue: [
      {
        speaker: 'Dimas',
        role: 'Kapten Basket · San Sidoarjo',
        npcId: 'dimas',
        npcAnim: 'Talking',
        text: 'Yo Rafi! Ayo adu lempar basket 3D! Kepalkan tangan ✊ untuk mengisi tenaga ke Zona Emas lalu buka telapak tangan 🖐️ untuk melempar! Cetak 2 gol untuk menang!',
      },
    ],
  },

  {
    id: 'ch5_basket_done',
    chapterTitle: 'Bab 5 · Swish Spektakuler! (15:55)',
    timeLabel: '15:55 · Senja',
    lighting: 'sunset',
    mission: 'Dengarkan tantangan berikutnya dari Dimas!',
    autoTrigger: true,
    missionPassedTitle: 'BASKET CHALLENGE PASSED!',
    dialogue: [
      {
        speaker: 'Dimas',
        role: 'Kapten Basket',
        npcId: 'dimas',
        npcAnim: 'Dance',
        text: 'SWISH!! Keren banget lemparanmu! Tantangan olahraga terakhir ada di Lapangan Sepak Bola barat — cetak 2 Gol Penalti melewati kiper kami!',
      },
    ],
  },

  {
    id: 'ch6_soccer_intro',
    chapterTitle: 'Bab 6 · Penalti Sepak Bola (16:20)',
    timeLabel: '16:20 · Senja Emas',
    lighting: 'sunset',
    mission: 'Pergi ke Lapangan Sepak Bola (sayap barat-selatan) untuk Tantangan Penalti 3D!',
    targetId: 'soccer_spot',
    targetPos: { x: -17.6, z: 16.0 },
    interactRadius: 3.6,
    startMinigameAfter: 'penalty',
    dialogue: [
      {
        speaker: 'Rafi',
        role: 'Tantangan Penalti · Lapangan Bola San Sidoarjo',
        npcId: null,
        text: 'Kipernya sudah bersiap menjaga gawang! Geser tangan ke sudut kosong (Kiri / Tengah / Kanan), lalu Kepal ✊ atau Cubit 🤏 untuk menendang bola! Cetak 2 gol!',
      },
    ],
  },

  {
    id: 'ch6_soccer_done',
    chapterTitle: 'Bab 6 · Gol Penalti Kelas Dunia! (16:45)',
    timeLabel: '16:45 · Matahari Terbenam',
    lighting: 'sunset',
    mission: 'Kunjungi Galeri Piala di koridor tengah untuk Ending Ceritamu!',
    autoTrigger: true,
    missionPassedTitle: 'PENALTI GOAL PASSED!',
    dialogue: [
      {
        speaker: 'Rafi',
        role: 'Siswa Baru · San Sidoarjo',
        npcId: null,
        text: 'GOOOL!! Hari pertama yang tak terlupakan! Sekarang aku menuju Galeri Lemari Piala di koridor tengah untuk melihat Ending & Rapor Akhir Hari Pertamaku di Grand Telkom Academy: San Sidoarjo!',
      },
    ],
  },

  {
    id: 'ch7_finale',
    chapterTitle: 'Bab 7 · Penentuan Ending di Galeri Piala (17:00)',
    timeLabel: '17:00 · Sunset',
    lighting: 'sunset',
    mission: 'Kunjungi Galeri Lemari Piala di koridor tengah untuk membuka Ending Ceritamu!',
    targetId: 'trophy_cabinet',
    targetPos: { x: 4.5, z: -14.6 },
    interactRadius: 3.4,
    onCompleteTriggerEnding: true,
    dialogue: [
      {
        speaker: 'Narator · GTA: San Sidoarjo',
        role: 'Akhir Hari Pertama',
        npcId: null,
        text: 'Senja keemasan menyinari koridor Grand Telkom Academy: San Sidoarjo. Semua pilihan kuis, aksi mini-game, keisengan, hingga rahasia yang kamu temukan hari ini kini menentukan takdirmu...',
      },
    ],
  },
];

/**
 * Side Interactions (triggerable 100% hands-free via Pinch 🤏!) — NO spoilers on choices!
 */
export const SIDE_INTERACTIONS = [
  {
    id: 'side_bima_quiz',
    label: 'Kuis Tebak-Tebakan Bima',
    pos: { x: -21.0, z: -9.8 },
    radius: 3.0,
    npcId: 'bima_classmate',
    missionPassedTitle: 'BONUS KUIS BIMA SELESAI!',
    dialogue: [
      {
        speaker: 'Bima',
        role: 'Teman Sekelas · Kuis Bonus',
        npcId: 'bima_classmate',
        npcAnim: 'Agree',
        text: 'Eh Rafi! Mau kuis pengetahuan umum cepat nggak? Jawab pakai gestur 1, 2, atau 3 jari ya!',
      },
      {
        speaker: 'Bima',
        role: 'Bonus Quiz 1/2 · Tata Surya',
        npcId: 'bima_classmate',
        npcAnim: 'Agree',
        text: 'Planet TERBESAR di tata surya kita bernama...?',
        choices: [
          {
            label: 'Mars',
            stats: { akademik: -5 },
            isPenalty: true,
            penaltyBanner: 'SALAH PLANET!',
            replySpeaker: 'Bima',
            replyRole: 'Teman Sekelas',
            replyNpcAnim: 'Agree',
            replyText: 'Waduh Mars mah kecil, yang paling gede Jupiter dong! Hehe!',
          },
          {
            label: 'Jupiter',
            stats: { akademik: 12 },
            replySpeaker: 'Bima',
            replyRole: 'Teman Sekelas',
            replyNpcAnim: 'Agree',
            replyText: 'Cerdas banget! Jupiter memang planet paling raksasa! Lanjut pertanyaan kedua!',
          },
          {
            label: 'Pluto',
            stats: { akademik: -5 },
            isPenalty: true,
            penaltyBanner: 'KEKECILAN!',
            replySpeaker: 'Bima',
            replyRole: 'Teman Sekelas',
            replyNpcAnim: 'Agree',
            replyText: 'Pluto itu malah planet kerdil paling kecil! Yang terbesar Jupiter ya.',
          },
        ],
      },
      {
        speaker: 'Bima',
        role: 'Bonus Quiz 2/2 · Kebiasaan Istirahat',
        npcId: 'bima_classmate',
        npcAnim: 'Agree',
        text: 'Pas bel istirahat bunyi di San Sidoarjo, hal pertama yang kamu lakukan apa?',
        choices: [
          {
            label: 'Ajak teman baru makan bareng di kantin',
            stats: { sosial: 12 },
            replySpeaker: 'Bima',
            replyRole: 'Teman Sekelas',
            replyNpcAnim: 'Agree',
            replyText: 'Asik banget! Besok traktir es teh ya wkwk!',
          },
          {
            label: 'Baca buku seru di perpustakaan',
            stats: { akademik: 10 },
            replySpeaker: 'Bima',
            replyRole: 'Teman Sekelas',
            replyNpcAnim: 'Agree',
            replyText: 'Rajin amat, calon juara umum nih!',
          },
          {
            label: 'Tidur pulas di meja sampai bel pulang',
            stats: { akademik: -6, sosial: -4 },
            isPenalty: true,
            penaltyBanner: 'KETIDURAN DI KELAS!',
            replySpeaker: 'Bima',
            replyRole: 'Teman Sekelas',
            replyNpcAnim: 'Agree',
            replyText: 'Waduh jangan ketiduran dong, nanti ditinggal sekelas pulang lho! Hahaha!',
          },
        ],
      },
    ],
  },
  {
    id: 'side_projector_lab',
    label: 'Cek Proyektor Pameran Lab',
    pos: { x: 23.2, z: -12.0 },
    radius: 3.1,
    npcId: null,
    missionPassedTitle: 'PROYEKTOR PAMERAN NYALA!',
    dialogue: [
      {
        speaker: 'Meja Proyektor Lab',
        role: 'Interaksi Kampus',
        npcId: null,
        text: 'Layar presentasi pameran di meja komputer Lab tiba-tiba mati! Apa yang kamu lakukan?',
        choices: [
          {
            label: 'Cek colokan listrik dan tekan tombol daya dengan rapi',
            stats: { akademik: 12 },
            replySpeaker: 'Meja Proyektor Lab',
            replyRole: 'Status: Menyala Terang!',
            replyText: 'Beres! Ternyata colokannya sedikit longgar. Layar presentasi pameran kembali menyala jernih!',
          },
          {
            label: 'Ajak Dinda mengecek bareng-bareng',
            stats: { sosial: 10, akademik: 5 },
            replySpeaker: 'Meja Proyektor Lab',
            replyRole: 'Status: Menyala Terang!',
            replyText: 'Kerja sama yang kompak! Masalah selesai dalam sekejap.',
          },
          {
            label: 'Pukul-pukul monitornya keras-keras biar nyala',
            stats: { akademik: -8, sosial: -5 },
            isPenalty: true,
            penaltyBanner: 'JANGAN DIPUKUL!',
            replySpeaker: 'Meja Proyektor Lab',
            replyRole: 'Teguran Penjaga Lab!',
            replyText: 'DUK! Malah bunyi keras dan bikin Dinda kaget! Alat sekolah harus dijaga baik-baik ya!',
          },
        ],
      },
    ],
  },
  {
    id: 'side_apar_prank',
    label: 'Lihat Tabung APAR Koridor',
    pos: { x: -8.2, z: -14.8 },
    radius: 2.7,
    npcId: null,
    dialogue: [
      {
        speaker: 'Tabung APAR (Pemadam Kebakaran)',
        role: 'Interaksi Koridor',
        npcId: null,
        text: 'Ada tabung pemadam api merah mengilap di dinding koridor. Tanganmu agak gatal...',
        choices: [
          {
            label: 'Biarkan rapi, itu alat keselamatan penting',
            stats: { sosial: 6 },
            replySpeaker: 'Rafi',
            replyRole: 'Siswa Teladan',
            replyText: 'Bagus! Alat keselamatan tidak boleh dibuat main-main.',
          },
          {
            label: 'Coba pencet tuasnya sedikit buat iseng',
            stats: { sosial: -10, akademik: -5 },
            isPenalty: true,
            penaltyBanner: 'KETAHUAN ISENG APAR!',
            replySpeaker: 'Ibu Sari (dari kejauhan)',
            replyRole: 'Teguran Disiplin!',
            replyText: 'PFFFFT!! Busa putih menyemprot ke lantai koridor! "RAFIII!! Jangan main-main dengan tabung APAR ya!"',
          },
        ],
      },
    ],
  },
  {
    id: 'side_bus_escape',
    label: 'Intip Bus Sekolah Depan',
    pos: { x: -8.0, z: 22.8 },
    radius: 3.2,
    npcId: null,
    dialogue: [
      {
        speaker: 'Bus Sekolah Kuning',
        role: 'Interaksi Gerbang Depan',
        npcId: null,
        text: 'Mesin bus sekolah masih hangat di luar gerbang. Mau coba menyelinap pulang duluan sebelum bel?',
        choices: [
          {
            label: 'Nggak jadi ah, hari pertama di San Sidoarjo seru banget!',
            stats: { sosial: 5 },
            replySpeaker: 'Rafi',
            replyRole: 'Siswa Baru',
            replyText: 'Betul! Masih banyak misi seru di dalam kampus!',
          },
          {
            label: 'Coba kabur pulang diam-diam!',
            stats: { sosial: -8, akademik: -6 },
            isPenalty: true,
            penaltyBanner: 'BUSTED! KETAHUAN BOLOS!',
            replySpeaker: 'Pak Budi',
            replyRole: 'Penjaga Gerbang',
            replyText: 'HEH! Mau ke mana kamu, Rafi?! Baru hari pertama sudah mau pulang duluan! Balik masuk ke halaman sekolah sekarang! Haha!',
          },
        ],
      },
    ],
  },
];

export const AMBIENT_FLAVOR_SPOTS = [
  { id: 'amb_trophy', x: 4.5, z: -15.6, radius: 3.6, lines: ['"Wih, banyak banget pialanya! Kapan ya namaku ada di salah satunya?"', '"Gila, lemari piala San Sidoarjo penuh prestasi semua!"'] },
  { id: 'amb_bikes', x: -8.0, z: 19.6, radius: 3.5, lines: ['"Sepedanya rapi banget, punya siapa nih yang ada keranjangnya?"', '"Enak juga ya besok berangkat sekolah naik sepeda..."'] },
  { id: 'amb_flag', x: 0.0, z: 6.2, radius: 3.2, lines: ['"Untung hari ini bukan jadwal upacara, panas banget kalau siang!"', '"Tiang benderanya tinggi banget, gagah!"'] },
  { id: 'amb_lockers', x: -3.5, z: -16.2, radius: 3.4, lines: ['"Loker nomor 17 agak macet... eh, bau kaos kaki olahraga siapa nih?!"', '"Rapi banget deretan lokernya, berasa di film sekolah!"'] },
  { id: 'amb_board', x: -17.2, z: -16.6, radius: 3.6, lines: ['"Semoga hari ini nggak mendadak disuruh maju ngerjain soal di papan tulis..."', '"Papan tulisnya bersih banget, enak dilihat!"'] },
  { id: 'amb_books', x: -23.0, z: -13.5, radius: 3.0, lines: ['"Wah, ada ensiklopedia sama komik sejarah lengkap di rak ini!"'] },
  { id: 'amb_piano', x: -22.5, z: 1.5, radius: 3.2, lines: ['"Keren juga ya kalau bisa main theme song San Sidoarjo pakai piano ini..."'] },
  { id: 'amb_bench', x: 7.6, z: 12.6, radius: 3.0, lines: ['"Bangku ini adem banget buat nongkrong sambil makan pentol sepulang sekolah."'] },
  { id: 'amb_computers', x: 23.0, z: -10.5, radius: 3.2, lines: ['"Wah komputernya kenceng-kenceng banget, kuat nih buat main game 3D!"'] },
];

export const PHYSICAL_EASTER_EGGS = [
  {
    id: 'ee_here_we_go',
    title: 'EASTER EGG #1 · SAN SIDOARJO NOSTALGIA!',
    pos: { x: 10.6, z: 22.8 },
    radius: 3.3,
    stats: { sosial: 10, olahraga: 10 },
    text: '"Ah... hari baru, semangat baru di San Sidoarjo! Here we go again!" Kamu menemukan spot rahasia di dekat Bus Timur!',
  },
  {
    id: 'ee_golden_shrimp',
    title: 'EASTER EGG #2 · MONUMEN EMAS KOTA UDANG!',
    pos: { x: 25.0, z: 1.8 },
    radius: 2.9,
    stats: { akademik: 12, sosial: 12, olahraga: 12 },
    text: 'Selamat! Kamu menemukan Monumen Emas Rahasia Kota Udang Sidoarjo yang tersembunyi di sisi timur gedung!',
  },
];

export function computeEnding(stats, sideQuestsDoneCount = 0, easterEggsCount = 0) {
  const { akademik, sosial, olahraga } = stats;
  const total = akademik + sosial + olahraga;
  const minStat = Math.min(akademik, sosial, olahraga);
  const maxStat = Math.max(akademik, sosial, olahraga);

  if ((total >= 145 && minStat >= 38 && sideQuestsDoneCount >= 1) || easterEggsCount >= 2) {
    return {
      id: 'secret_master',
      code: 'ENDING RAHASIA (4/4)',
      badge: '👑 LEGENDA SAN SIDOARJO (SECRET ENDING)',
      themeColor: '#fde047',
      summary:
        'LUAR BIASA! Kamu menaklukkan kuis, semua mini-game, sekaligus membongkar rahasia tersembunyi kampus! Seluruh guru dan siswa mengukuhkanmu sebagai Legenda Hari Pertama Grand Telkom Academy: San Sidoarjo!',
    };
  }

  if (akademik === maxStat) {
    return {
      id: 'ending_hacker',
      code: 'ENDING 1/4 · JALUR AKADEMIK',
      badge: '🎓 BINTANG CERDAS SAN SIDOARJO',
      themeColor: '#38bdf8',
      summary:
        'Wawasan luasmu di kelas Ibu Sari dan ketelitianmu saat eksperimen mikroskop bersama Dinda membuatmu langsung dipercaya mewakili sekolah di ajang Olimpiade!',
    };
  }

  if (sosial === maxStat) {
    return {
      id: 'ending_king',
      code: 'ENDING 2/4 · JALUR SOSIAL & SENI',
      badge: '🌟 KING OF SAN SIDOARJO & BINTANG PENSI',
      themeColor: '#c084fc',
      summary:
        'Keramahanmu ke Pak Budi, permainan piano keren bersama Pak Hendra, dan keakrabanmu dengan teman-teman menjadikanmu siswa baru paling populer dan calon Ketua OSIS!',
    };
  }

  return {
    id: 'ending_mvp',
    code: 'ENDING 3/4 · JALUR OLAHRAGA',
    badge: '🏆 MVP LAPANGAN SIDOARJO',
    themeColor: '#fb923c',
    summary:
      'Tembakan basket senja mulus & gol penalti tak terbendung darimu memukau Dimas dan seluruh siswa! Jersey kapten tim olahraga San Sidoarjo sudah menunggumu besok!',
  };
}
