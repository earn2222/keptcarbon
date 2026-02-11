export const MOCK_PLOTS = [
    {
        id: 'mock-1',
        farmer_name: 'นายสมชาย รักเกษตร',
        area_rai: 12.5,
        carbon_tons: 85.4,
        planting_year: 2015 - 543,
        variety: 'RRIM 600',
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
        farmer_name: 'นางสมร ดีสวน',
        area_rai: 8.2,
        carbon_tons: 42.1,
        planting_year: 2018 - 543,
        variety: 'PB 235',
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
        farmer_name: 'นายบุญส่ง มุ่งมั่น',
        area_rai: 25.0,
        carbon_tons: 156.8,
        planting_year: 2010 - 543,
        variety: 'RRIT 251',
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
