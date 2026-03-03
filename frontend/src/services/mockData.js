export const MOCK_PLOTS = [
    {
        id: 'mock-1',
        name: 'นายสมชาย รักเกษตร',
        farmer_name: 'นายสมชาย รักเกษตร',
        farmerName: 'นายสมชาย รักเกษตร',
        area_rai: 12.5,
        areaRai: 12.5,
        carbon_tons: 85.4,
        carbon: 85.4,
        planting_year: 2015,
        plantingYearBE: 2558,
        tree_age: new Date().getFullYear() - 2015,
        age: new Date().getFullYear() - 2015,
        variety: 'RRIM 600',
        method: 'eq1',
        methods: [{ method: 'eq1', name: 'สมการ TGO (1)', carbon: '85.40' }],
        geometry: {
            type: 'Polygon',
            coordinates: [[
                [99.3331, 9.1382],
                [99.3351, 9.1382],
                [99.3351, 9.1402],
                [99.3331, 9.1402],
                [99.3331, 9.1382]
            ]]
        },
        created_at: '2024-01-15T10:00:00Z',
        notes: 'พันธุ์: RRIM 600'
    },
    {
        id: 'mock-2',
        name: 'นางสมร ดีสวน',
        farmer_name: 'นางสมร ดีสวน',
        farmerName: 'นางสมร ดีสวน',
        area_rai: 8.2,
        areaRai: 8.2,
        carbon_tons: 42.1,
        carbon: 42.1,
        planting_year: 2018,
        plantingYearBE: 2561,
        tree_age: new Date().getFullYear() - 2018,
        age: new Date().getFullYear() - 2018,
        variety: 'PB 235',
        method: 'eq2',
        methods: [{ method: 'eq2', name: 'สมการ TGO (2)', carbon: '42.10' }],
        geometry: {
            type: 'Polygon',
            coordinates: [[
                [99.3400, 9.1450],
                [99.3420, 9.1450],
                [99.3420, 9.1470],
                [99.3400, 9.1470],
                [99.3400, 9.1450]
            ]]
        },
        created_at: '2024-02-10T09:30:00Z',
        notes: 'พันธุ์: PB 235'
    },
    {
        id: 'mock-3',
        name: 'นายบุญส่ง มุ่งมั่น',
        farmer_name: 'นายบุญส่ง มุ่งมั่น',
        farmerName: 'นายบุญส่ง มุ่งมั่น',
        area_rai: 25.0,
        areaRai: 25.0,
        carbon_tons: 156.8,
        carbon: 156.8,
        planting_year: 2010,
        plantingYearBE: 2553,
        tree_age: new Date().getFullYear() - 2010,
        age: new Date().getFullYear() - 2010,
        variety: 'RRIT 251',
        method: 'ndvi',
        methods: [{ method: 'ndvi', name: 'NDVI Satellite', carbon: '156.80' }],
        geometry: {
            type: 'Polygon',
            coordinates: [[
                [99.3250, 9.1300],
                [99.3280, 9.1300],
                [99.3280, 9.1330],
                [99.3250, 9.1330],
                [99.3250, 9.1300]
            ]]
        },
        created_at: '2023-11-20T14:15:00Z',
        notes: 'พันธุ์: RRIT 251'
    },
    {
        id: 'mock-4',
        name: 'นายประสิทธิ์ ชูคาร์บอน',
        farmer_name: 'นายประสิทธิ์ ชูคาร์บอน',
        farmerName: 'นายประสิทธิ์ ชูคาร์บอน',
        area_rai: 15.0,
        areaRai: 15.0,
        carbon_tons: 102.5,
        carbon: 102.5,
        planting_year: 2012,
        plantingYearBE: 2555,
        tree_age: new Date().getFullYear() - 2012,
        age: new Date().getFullYear() - 2012,
        variety: 'RRIM 600',
        method: 'eq1+ndvi+tcari',
        methods: [
            { method: 'eq1', name: 'สมการ TGO (1)', formula: 'AGB = 0.118 × DBH^2.53', carbon: '102.50', agb: '218.09' },
            { method: 'ndvi', name: 'NDVI Satellite', formula: 'AGB = 34.2 × NDVI + 5.8', carbon: '87.30', agb: '185.74' },
            { method: 'tcari', name: 'TCARI Analysis', formula: 'AGB = 13.57 × TCARI + 7.45', carbon: '94.10', agb: '200.21' }
        ],
        dbh: 22.5,
        height: 18.3,
        satData: { ndvi: 0.82, tcari: 0.65 },
        geometry: {
            type: 'Polygon',
            coordinates: [[
                [99.3180, 9.1220],
                [99.3210, 9.1220],
                [99.3210, 9.1250],
                [99.3180, 9.1250],
                [99.3180, 9.1220]
            ]]
        },
        created_at: '2024-06-05T11:00:00Z',
        notes: 'พันธุ์: RRIM 600 | DBH: 22.5 | ความสูง: 18.3 | NDVI: 0.82 | TCARI: 0.65 | AGB: 218.09 | สูตร: สมการ TGO (1)=AGB = 0.118 × DBH^2.53[carbon:102.50,agb:218.09] ++ NDVI Satellite=AGB = 34.2 × NDVI + 5.8[carbon:87.30,agb:185.74] ++ TCARI Analysis=AGB = 13.57 × TCARI + 7.45[carbon:94.10,agb:200.21]'
    }
];

export const MOCK_SUMMARY = {
    total_plots: 4,
    total_area_rai: 60.7,
    total_carbon_tons: 386.8,
    total_value_baht: 96700
};
