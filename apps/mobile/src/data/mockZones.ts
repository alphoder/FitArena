export interface Zone {
  id: string;
  name: string;
  pinCode: string;
  center: [number, number]; // [lng, lat]
  polygon: [number, number][]; // GeoJSON coordinates
  controllingGroup: {
    id: string;
    name: string;
    color: string;
    totalAP: number;
  } | null;
  leaderboard: {
    rank: number;
    groupName: string;
    totalAP: number;
    memberCount: number;
  }[];
}

const createMockPolygon = (lng: number, lat: number, size = 0.015): [number, number][] => {
  return [
    [lng - size, lat - size],
    [lng + size, lat - size],
    [lng + size, lat + size],
    [lng - size, lat + size],
    [lng - size, lat - size], // close polygon
  ];
};

export const mockZones: Zone[] = [
  {
    id: "z_1",
    name: "Kolar Road",
    pinCode: "462016",
    center: [77.4121, 23.1672],
    polygon: createMockPolygon(77.4121, 23.1672, 0.015),
    controllingGroup: {
      id: "g_1",
      name: "Ironclad Fitness",
      color: "#22c55e", // Green
      totalAP: 12500,
    },
    leaderboard: [
      { rank: 1, groupName: "Ironclad Fitness", totalAP: 12500, memberCount: 42 },
      { rank: 2, groupName: "Kolar Runners", totalAP: 9800, memberCount: 28 },
      { rank: 3, groupName: "Peak Performers", totalAP: 5400, memberCount: 15 },
    ]
  },
  {
    id: "z_2",
    name: "MP Nagar",
    pinCode: "462011",
    center: [77.4344, 23.2332],
    polygon: createMockPolygon(77.4344, 23.2332, 0.012),
    controllingGroup: {
      id: "g_2",
      name: "Urban Athletes",
      color: "#3b82f6", // Blue
      totalAP: 18400,
    },
    leaderboard: [
      { rank: 1, groupName: "Urban Athletes", totalAP: 18400, memberCount: 56 },
      { rank: 2, groupName: "Corporate Fit", totalAP: 14200, memberCount: 34 },
      { rank: 3, groupName: "MP Nagar Cyclists", totalAP: 8900, memberCount: 22 },
      { rank: 4, groupName: "Weekend Warriors", totalAP: 4100, memberCount: 12 },
    ]
  },
  {
    id: "z_3",
    name: "Arera Colony",
    pinCode: "462016", 
    center: [77.4334, 23.2114],
    polygon: createMockPolygon(77.4334, 23.2114, 0.014),
    controllingGroup: {
      id: "g_3",
      name: "Elite Squad",
      color: "#f59e0b", // Amber
      totalAP: 21200,
    },
    leaderboard: [
      { rank: 1, groupName: "Elite Squad", totalAP: 21200, memberCount: 61 },
      { rank: 2, groupName: "Arera Masters", totalAP: 19500, memberCount: 48 },
      { rank: 3, groupName: "CrossFit Central", totalAP: 11200, memberCount: 29 },
    ]
  },
  {
    id: "z_4",
    name: "New Market",
    pinCode: "462003",
    center: [77.4002, 23.2389],
    polygon: createMockPolygon(77.4002, 23.2389, 0.01),
    controllingGroup: null, // Neutral zone
    leaderboard: [
      { rank: 1, groupName: "City Striders", totalAP: 2100, memberCount: 8 },
      { rank: 2, groupName: "Rookie Runners", totalAP: 1900, memberCount: 12 },
    ]
  },
  {
    id: "z_5",
    name: "Habibganj",
    pinCode: "462024",
    center: [77.4330, 23.2147],
    polygon: createMockPolygon(77.4330, 23.2147, 0.008),
    controllingGroup: {
      id: "g_5",
      name: "Rail Fit",
      color: "#ec4899", // Pink
      totalAP: 7600,
    },
    leaderboard: [
      { rank: 1, groupName: "Rail Fit", totalAP: 7600, memberCount: 19 },
      { rank: 2, groupName: "Station Sprinters", totalAP: 5200, memberCount: 14 },
    ]
  },
  {
    id: "z_6",
    name: "BHEL Region",
    pinCode: "462022",
    center: [77.4764, 23.2420],
    polygon: createMockPolygon(77.4764, 23.2420, 0.018),
    controllingGroup: {
      id: "g_6",
      name: "Industrial Core",
      color: "#8b5cf6", // Purple
      totalAP: 14800,
    },
    leaderboard: [
      { rank: 1, groupName: "Industrial Core", totalAP: 14800, memberCount: 38 },
      { rank: 2, groupName: "BHEL Titans", totalAP: 12100, memberCount: 27 },
      { rank: 3, groupName: "Sector 2 Athletes", totalAP: 6400, memberCount: 16 },
    ]
  }
];
