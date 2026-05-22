// Wedding invitation config — edit this file to customize
import mapQRCode from "./assets/map-qrcode.png";;
export const weddingConfig = {
  // Couple names
  groomKhmer: "ម៉ឹង ស៊ឺម៉េង",
  brideKhmer: "ពុធ សិទ្ធីនីហ្សា",
  groomLatin: "MOENG SEUMENG",
  brideLatin: "PUTH SETHYNYZA",

  // Wedding date & time (ISO format)
  weddingDate: "2026-06-27T13:00:00",

  // Ceremony details
  ceremony: {
    titleKhmer: "សិរីមង្គលអាពាហ៍ពិពាហ៍",
    titleLatin: "Wedding Ceremony",
    date: "ថ្ងៃសៅរ៍ ទី27 ខែមិថុនា ឆ្នាំ2026",
    partyDate: "ថ្ងៃសៅរ៍ ទី27 ខែមិថុនា ឆ្នាំ2026",
    partyTime: "5:30 នាទីល្ងាច",
    venue: "ភោជនីយដ្ឋាន ប៊ុន គឹមអ៊ី (តាឡាក់)",
    address: "ក្រុងប៉ោយប៉ែត​ ខេត្តបន្ទាយមានជ័យ",
    mapUrl: "https://maps.app.goo.gl/Drs5YZpaLNwHfV8f6?g_st=it",
    mapQRCode: mapQRCode,
  },

  // Schedule — `icon` is a lucide-react icon name (PascalCase).
  // See https://lucide.dev/icons/ for the full set.
  schedule: [
    {
      date: "ថ្ងៃសុក្រ ទី26 ខែមិថុនា ឆ្នាំ2026",
      events: [
        { time: "1:26 នាទីរសៀល", titleKhmer: "ពិធីសែនក្រុងពលី", icon: "HandHeart" },
        { time: "2:30 នាទីរសៀល", titleKhmer: "ពិធីកាត់សក់", icon: "Scissors" },
        { time: "4:00 នាទីរសៀល", titleKhmer: "ពិធីសូត្រមន្ត", icon: "BookOpen" },
        {
          time: "5:00 នាទីល្ងាច",
          titleKhmer: "ពិសារភោជនាហារពេលល្ងាច",
          icon: "Utensils",
        },
        { time: "6:00 នាទីល្ងាច", titleKhmer: "ពិធីកាត់ខាន់ស្លា", icon: "Flower2" },
        {
          time: "7:15 នាទីល្ងាច",
          titleKhmer: "ពិធីធ្វើធ្មេញបំពេញល័ក្ខកូនស្រី",
          icon: "Sparkles",
        },
      ],
    },
    {
      date: "ថ្ងៃសៅរ៍ ទី27 ខែមិថុនា ឆ្នាំ2026",
      events: [
        {
          time: "4:50 នាទីព្រឹក",
          titleKhmer: "ពិធីសំពះពិលាជូនកូនប្រុស",
          icon: "Sunrise",
        },
        { time: "7:30 នាទីព្រឹក", titleKhmer: "ពិធីហែរជំនូន", icon: "Gift" },
        { time: "9:30 នាទីព្រឹក", titleKhmer: "ពិធីបំពាក់ចិញ្ចៀន", icon: "Gem" },
        {
          time: "10:15 នាទីព្រឹក",
          titleKhmer:
            "ពិធីសំពះផ្ទឹម សែនដូនតា បង្វិលពពិល បាចផ្កាស្លា ចងដៃ ព្រះថោងតោងស្បៃ ចប់សម្រាកពិសារភោជនាហារពេលថ្ងៃត្រង់",
          icon: "Heart",
        },
        {
          time: "5:30 នាទីល្ងាច",
          titleKhmer: "ទទួលភ្ញៀវ ពិសារភោជនាហារពេលល្ងាច",
          icon: "Wine",
        },
      ],
    },
  ],

  // Gallery photos (replace with real paths in public/)
  gallery: [
    { src: "/photos/photo1.jpg", alt: "Engagement session" },
    { src: "/photos/photo2.jpg", alt: "Pre-wedding shoot" },
    { src: "/photos/photo3.jpg", alt: "Traditional ceremony" },
    { src: "/photos/photo4.jpg", alt: "Couple portrait" },
    { src: "/photos/photo5.jpg", alt: "Romantic moment" },
    { src: "/photos/photo6.jpg", alt: "Joy & laughter" },
  ],

  // Telegram bot config — fill in your bot token & chat ID
  telegram: {
    botToken: "YOUR_BOT_TOKEN_HERE",
    chatId: "YOUR_CHAT_ID_HERE",
  },

  // Parents
  groomParents: {
    fatherKhmer: "លោក ឃាន សំណាង",
    motherKhmer: "លោកស្រី អេង ណាវី",
  },
  brideParents: {
    fatherKhmer: "លោក ពុធ សុភីរ៉ាសិទ្ធិ",
    motherKhmer: "លោកស្រី ឈួន បូរិន",
  },

  // Greeting message for the Hero section
  greeting:
    "ឯកឧត្តម អ្នកឧកញ៉ា លោកឧកញ៉ា លោកជំទាវ លោក លោកស្រី​ អ្នកនាងកញ្ញា អញ្ជើញចូលរួមជាអធិបតីភាព និងជាភ្ញៀវកិត្តិយស ចម្រើន ជោគជ័យ សិរីសួស្តី ក្នុងកម្មវិធីសិរីមង្គលអាពាហ៍ពិពាហ៍ កូនប្រុស កូនស្រី របស់យើងខ្ញុំ។",
};
