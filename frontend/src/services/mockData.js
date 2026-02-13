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
    }
];

export const MOCK_SUMMARY = {
    total_plots: 3,
    total_area_rai: 45.7,
    total_carbon_tons: 284.3,
    total_value_baht: 71075
};
