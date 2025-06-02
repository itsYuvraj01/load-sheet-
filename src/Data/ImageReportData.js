const flightData = [
  // Flight 1 - IX 2749
  {
    departureDate: "2025-05-28",
    flightNo: "IX 2749",
    origin: "DEL",
    destination: "BLR",
    std: "10:00 AM",
    loadSheetName: "Sheet A",
    loadSheetPrintTime: "2025-05-28 09:00",
    loadSheetUploadTime: "2025-05-28 09:15",
    userDetail: "Admin",
    imageName: "Image 1",
    url: "/images/ix2749_1.png"
  },
  {
    departureDate: "2025-05-28",
    flightNo: "IX 2749",
    origin: "DEL",
    destination: "BLR",
    std: "10:00 AM",
    loadSheetName: "Sheet A",
    loadSheetPrintTime: "2025-05-28 09:00",
    loadSheetUploadTime: "2025-05-28 09:15",
    userDetail: "Admin",
    imageName: "Image 2",
    url: "/images/ix2749_2.png"
  },
  {
    departureDate: "2025-05-28",
    flightNo: "IX 2749",
    origin: "DEL",
    destination: "BLR",
    std: "10:00 AM",
    loadSheetName: "Sheet A",
    loadSheetPrintTime: "2025-05-28 09:00",
    loadSheetUploadTime: "2025-05-28 09:15",
    userDetail: "Admin",
    imageName: "Image 3",
    url: "/images/ix2749_3.png"
  },
  {
    departureDate: "2025-05-28",
    flightNo: "IX 2749",
    origin: "DEL",
    destination: "BLR",
    std: "10:00 AM",
    loadSheetName: "Sheet A",
    loadSheetPrintTime: "2025-05-28 09:00",
    loadSheetUploadTime: "2025-05-28 09:15",
    userDetail: "Admin",
    imageName: "Image 4",
    url: "/images/ix2749_4.png"
  },

  // Flight 2 - IX 5432
  {
    departureDate: "2025-05-28",
    flightNo: "IX 5432",
    origin: "BOM",
    destination: "MAA",
    std: "02:30 PM",
    loadSheetName: "Sheet B",
    loadSheetPrintTime: "2025-05-28 01:15",
    loadSheetUploadTime: "2025-05-28 01:45",
    userDetail: "Supervisor",
    imageName: "Image 1",
    url: "/images/ix5432_1.png"
  },
  {
    departureDate: "2025-05-28",
    flightNo: "IX 5432",
    origin: "BOM",
    destination: "MAA",
    std: "02:30 PM",
    loadSheetName: "Sheet B",
    loadSheetPrintTime: "2025-05-28 01:15",
    loadSheetUploadTime: "2025-05-28 01:45",
    userDetail: "Supervisor",
    imageName: "Image 2",
    url: "/images/ix5432_2.png"
  },
  {
    departureDate: "2025-05-28",
    flightNo: "IX 5432",
    origin: "BOM",
    destination: "MAA",
    std: "02:30 PM",
    loadSheetName: "Sheet B",
    loadSheetPrintTime: "2025-05-28 01:15",
    loadSheetUploadTime: "2025-05-28 01:45",
    userDetail: "Supervisor",
    imageName: "Image 3",
    url: "/images/ix5432_3.png"
  },
  {
    departureDate: "2025-05-28",
    flightNo: "IX 5432",
    origin: "BOM",
    destination: "MAA",
    std: "02:30 PM",
    loadSheetName: "Sheet B",
    loadSheetPrintTime: "2025-05-28 01:15",
    loadSheetUploadTime: "2025-05-28 01:45",
    userDetail: "Supervisor",
    imageName: "Image 4",
    url: "/images/ix5432_4.png"
  },

  // Flight 3 - IX 6789
  {
    departureDate: "2025-05-28",
    flightNo: "IX 6789",
    origin: "HYD",
    destination: "CCU",
    std: "06:45 AM",
    loadSheetName: "Sheet C",
    loadSheetPrintTime: "2025-05-28 06:00",
    loadSheetUploadTime: "2025-05-28 06:30",
    userDetail: "Officer",
    imageName: "Image 1",
    url: "/images/ix6789_1.png"
  },
  {
    departureDate: "2025-05-28",
    flightNo: "IX 6789",
    origin: "HYD",
    destination: "CCU",
    std: "06:45 AM",
    loadSheetName: "Sheet C",
    loadSheetPrintTime: "2025-05-28 06:00",
    loadSheetUploadTime: "2025-05-28 06:30",
    userDetail: "Officer",
    imageName: "Image 2",
    url: "/images/ix6789_2.png"
  },
  {
    departureDate: "2025-05-28",
    flightNo: "IX 6789",
    origin: "HYD",
    destination: "CCU",
    std: "06:45 AM",
    loadSheetName: "Sheet C",
    loadSheetPrintTime: "2025-05-28 06:00",
    loadSheetUploadTime: "2025-05-28 06:30",
    userDetail: "Officer",
    imageName: "Image 3",
    url: "/images/ix6789_3.png"
  },
  {
    departureDate: "2025-05-28",
    flightNo: "IX 6789",
    origin: "HYD",
    destination: "CCU",
    std: "06:45 AM",
    loadSheetName: "Sheet C",
    loadSheetPrintTime: "2025-05-28 06:00",
    loadSheetUploadTime: "2025-05-28 06:30",
    userDetail: "Officer",
    imageName: "Image 4",
    url: "/images/ix6789_4.png"
  },

  // Flight 4 - IX 1122
  {
    departureDate: "2025-05-28",
    flightNo: "IX 1122",
    origin: "BLR",
    destination: "GOI",
    std: "11:15 AM",
    loadSheetName: "Sheet D",
    loadSheetPrintTime: "2025-05-28 10:00",
    loadSheetUploadTime: "2025-05-28 10:30",
    userDetail: "Coordinator",
    imageName: "Image 1",
    url: "/images/ix1122_1.png"
  },
  {
    departureDate: "2025-05-28",
    flightNo: "IX 1122",
    origin: "BLR",
    destination: "GOI",
    std: "11:15 AM",
    loadSheetName: "Sheet D",
    loadSheetPrintTime: "2025-05-28 10:00",
    loadSheetUploadTime: "2025-05-28 10:30",
    userDetail: "Coordinator",
    imageName: "Image 2",
    url: "/images/ix1122_2.png"
  },
  {
    departureDate: "2025-05-28",
    flightNo: "IX 1122",
    origin: "BLR",
    destination: "GOI",
    std: "11:15 AM",
    loadSheetName: "Sheet D",
    loadSheetPrintTime: "2025-05-28 10:00",
    loadSheetUploadTime: "2025-05-28 10:30",
    userDetail: "Coordinator",
    imageName: "Image 3",
    url: "/images/ix1122_3.png"
  },

  // Flight 5 - IX 3301
  {
    departureDate: "2025-05-28",
    flightNo: "IX 3301",
    origin: "MAA",
    destination: "DEL",
    std: "04:45 PM",
    loadSheetName: "Sheet E",
    loadSheetPrintTime: "2025-05-28 04:00",
    loadSheetUploadTime: "2025-05-28 04:20",
    userDetail: "Supervisor",
    imageName: "Image 1",
    url: "/images/ix3301_1.png"
  },
  {
    departureDate: "2025-05-28",
    flightNo: "IX 3301",
    origin: "MAA",
    destination: "DEL",
    std: "04:45 PM",
    loadSheetName: "Sheet E",
    loadSheetPrintTime: "2025-05-28 04:00",
    loadSheetUploadTime: "2025-05-28 04:20",
    userDetail: "Supervisor",
    imageName: "Image 2",
    url: "/images/ix3301_2.png"
  },
  {
    departureDate: "2025-05-28",
    flightNo: "IX 3301",
    origin: "MAA",
    destination: "DEL",
    std: "04:45 PM",
    loadSheetName: "Sheet E",
    loadSheetPrintTime: "2025-05-28 04:00",
    loadSheetUploadTime: "2025-05-28 04:20",
    userDetail: "Supervisor",
    imageName: "Image 3",
    url: "/images/ix3301_3.png"
  }
];


export default flightData;
