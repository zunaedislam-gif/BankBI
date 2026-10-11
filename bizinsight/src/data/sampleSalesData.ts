import { SalesRecord } from '../types/analytics';

export const SAMPLE_CSV_RAW = `Order Date,Region,Category,Product,Sales,Quantity,Profit
2024-01-05,West,Technology,UltraBook Pro 15,2599.98,2,650.00
2024-01-08,East,Furniture,Motorized Standing Desk,649.00,1,162.25
2024-01-12,Central,Office Supplies,Eco Recycled Copy Paper (Carton),149.70,3,45.00
2024-01-15,South,Technology,4K Quantum Monitor,799.98,2,199.99
2024-01-18,West,Industrial Equipment,Thermal Label Printer,420.00,1,105.00
2024-01-22,East,Furniture,Aero Ergonomic Chair,1198.00,2,299.50
2024-01-25,Central,Technology,Smart Hub Dock Pro,399.90,2,119.97
2024-01-28,South,Office Supplies,Heavy-Duty Steel Stapler,89.95,5,26.98
2024-02-02,West,Furniture,Motorized Standing Desk,1298.00,2,324.50
2024-02-05,East,Technology,UltraBook Pro 15,3899.97,3,974.99
2024-02-09,Central,Industrial Equipment,Barcode Laser Scanner,550.00,2,137.50
2024-02-14,South,Furniture,Acoustic Privacy Panel,360.00,4,72.00
2024-02-18,West,Technology,4K Quantum Monitor,1199.97,3,299.99
2024-02-21,East,Office Supplies,Archival Binder Archive Set,179.80,4,53.94
2024-02-25,Central,Furniture,Aero Ergonomic Chair,599.00,1,149.75
2024-02-28,South,Technology,Wireless Ergonomic Keyboard,299.85,3,89.95
2024-03-03,West,Industrial Equipment,Modular Shelving Unit,780.00,2,195.00
2024-03-07,East,Technology,4K Quantum Monitor,1599.96,4,399.99
2024-03-10,Central,Office Supplies,Precision Rollerball Pens (Box),75.00,5,30.00
2024-03-15,South,Furniture,Executive Conference Table,2450.00,1,490.00
2024-03-19,West,Technology,UltraBook Pro 15,1299.99,1,325.00
2024-03-24,East,Industrial Equipment,Thermal Label Printer,840.00,2,210.00
2024-03-27,Central,Technology,Smart Hub Dock Pro,599.85,3,179.95
2024-03-31,South,Furniture,Aero Ergonomic Chair,1797.00,3,449.25
2024-04-04,West,Office Supplies,Eco Recycled Copy Paper (Carton),249.50,5,74.85
2024-04-08,East,Technology,UltraBook Pro 15,2599.98,2,650.00
2024-04-12,Central,Furniture,Motorized Standing Desk,649.00,1,162.25
2024-04-16,South,Industrial Equipment,Heavy-Duty Hand Truck,320.00,2,64.00
2024-04-20,West,Technology,4K Quantum Monitor,799.98,2,199.99
2024-04-23,East,Furniture,Executive Conference Table,4900.00,2,980.00
2024-04-27,Central,Office Supplies,Desk Organization Caddy,120.00,4,36.00
2024-04-30,South,Technology,Smart Hub Dock Pro,799.80,4,239.94
2024-05-03,West,Furniture,Aero Ergonomic Chair,2396.00,4,599.00
2024-05-07,East,Technology,UltraBook Pro 15,5199.96,4,1300.00
2024-05-11,Central,Industrial Equipment,Thermal Label Printer,1260.00,3,315.00
2024-05-15,South,Office Supplies,Eco Recycled Copy Paper (Carton),199.60,4,59.88
2024-05-19,West,Technology,Wireless Ergonomic Keyboard,499.75,5,149.92
2024-05-22,East,Furniture,Motorized Standing Desk,1947.00,3,486.75
2024-05-26,Central,Technology,4K Quantum Monitor,1199.97,3,299.99
2024-05-30,South,Industrial Equipment,Barcode Laser Scanner,825.00,3,206.25
2024-06-03,West,Technology,UltraBook Pro 15,3899.97,3,974.99
2024-06-06,East,Office Supplies,Archival Binder Archive Set,134.85,3,40.45
2024-06-10,Central,Furniture,Acoustic Privacy Panel,450.00,5,90.00
2024-06-14,South,Technology,4K Quantum Monitor,1599.96,4,399.99
2024-06-18,West,Industrial Equipment,Modular Shelving Unit,1170.00,3,292.50
2024-06-22,East,Furniture,Aero Ergonomic Chair,1797.00,3,449.25
2024-06-25,Central,Technology,Smart Hub Dock Pro,399.90,2,119.97
2024-06-29,South,Office Supplies,Heavy-Duty Steel Stapler,125.93,7,37.78
2024-07-03,West,Furniture,Motorized Standing Desk,1298.00,2,324.50
2024-07-06,East,Technology,UltraBook Pro 15,6499.95,5,1624.98
2024-07-10,Central,Industrial Equipment,Heavy-Duty Hand Truck,480.00,3,96.00
2024-07-14,South,Furniture,Executive Conference Table,2450.00,1,490.00
2024-07-18,West,Technology,4K Quantum Monitor,1999.95,5,499.98
2024-07-22,East,Office Supplies,Eco Recycled Copy Paper (Carton),299.40,6,89.82
2024-07-25,Central,Furniture,Aero Ergonomic Chair,1198.00,2,299.50
2024-07-29,South,Technology,Wireless Ergonomic Keyboard,399.80,4,119.94
2024-08-02,West,Industrial Equipment,Thermal Label Printer,840.00,2,210.00
2024-08-06,East,Technology,4K Quantum Monitor,1199.97,3,299.99
2024-08-09,Central,Office Supplies,Precision Rollerball Pens (Box),120.00,8,48.00
2024-08-14,South,Furniture,Motorized Standing Desk,1298.00,2,324.50
2024-08-17,West,Technology,UltraBook Pro 15,2599.98,2,650.00
2024-08-21,East,Industrial Equipment,Modular Shelving Unit,1560.00,4,390.00
2024-08-25,Central,Technology,Smart Hub Dock Pro,799.80,4,239.94
2024-08-28,South,Furniture,Acoustic Privacy Panel,540.00,6,108.00
2024-09-02,West,Office Supplies,Archival Binder Archive Set,224.75,5,67.42
2024-09-05,East,Technology,UltraBook Pro 15,3899.97,3,974.99
2024-09-09,Central,Furniture,Executive Conference Table,2450.00,1,490.00
2024-09-13,South,Industrial Equipment,Barcode Laser Scanner,1100.00,4,275.00
2024-09-17,West,Technology,4K Quantum Monitor,1599.96,4,399.99
2024-09-20,East,Furniture,Aero Ergonomic Chair,2995.00,5,748.75
2024-09-24,Central,Office Supplies,Eco Recycled Copy Paper (Carton),349.30,7,104.79
2024-09-28,South,Technology,Smart Hub Dock Pro,599.85,3,179.95
2024-10-02,West,Furniture,Motorized Standing Desk,2596.00,4,649.00
2024-10-06,East,Technology,UltraBook Pro 15,7799.94,6,1949.98
2024-10-10,Central,Industrial Equipment,Thermal Label Printer,1680.00,4,420.00
2024-10-14,South,Furniture,Aero Ergonomic Chair,2396.00,4,599.00
2024-10-17,West,Technology,4K Quantum Monitor,2399.94,6,599.98
2024-10-21,East,Office Supplies,Desk Organization Caddy,210.00,7,63.00
2024-10-25,Central,Furniture,Executive Conference Table,4900.00,2,980.00
2024-10-29,South,Technology,Wireless Ergonomic Keyboard,599.70,6,179.91
2024-11-03,West,Industrial Equipment,Modular Shelving Unit,1950.00,5,487.50
2024-11-06,East,Technology,UltraBook Pro 15,5199.96,4,1300.00
2024-11-10,Central,Office Supplies,Archival Binder Archive Set,269.70,6,80.91
2024-11-14,South,Furniture,Motorized Standing Desk,1947.00,3,486.75
2024-11-18,West,Technology,Smart Hub Dock Pro,999.75,5,299.92
2024-11-21,East,Industrial Equipment,Barcode Laser Scanner,1375.00,5,343.75
2024-11-25,Central,Furniture,Aero Ergonomic Chair,1797.00,3,449.25
2024-11-29,South,Technology,4K Quantum Monitor,1999.95,5,499.98
2024-12-03,West,Furniture,Executive Conference Table,4900.00,2,980.00
2024-12-06,East,Technology,UltraBook Pro 15,9099.93,7,2274.98
2024-12-09,Central,Industrial Equipment,Heavy-Duty Hand Truck,640.00,4,128.00
2024-12-13,South,Furniture,Aero Ergonomic Chair,3594.00,6,898.50
2024-12-16,West,Technology,4K Quantum Monitor,2799.93,7,699.98
2024-12-19,East,Office Supplies,Eco Recycled Copy Paper (Carton),449.10,9,134.73
2024-12-22,Central,Technology,Smart Hub Dock Pro,1199.70,6,359.91
2024-12-26,South,Industrial Equipment,Thermal Label Printer,1260.00,3,315.00
2024-12-28,West,Furniture,Motorized Standing Desk,3245.00,5,811.25`;

export function getSampleSalesRecords(): SalesRecord[] {
  const lines = SAMPLE_CSV_RAW.trim().split('\n');
  const records: SalesRecord[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Simple robust comma splitter (our sample data has clean unquoted commas or standard names)
    const parts = line.split(',');
    if (parts.length >= 7) {
      records.push({
        id: `sample-${i}`,
        orderDate: parts[0].trim(),
        region: parts[1].trim(),
        category: parts[2].trim(),
        product: parts[3].trim(),
        sales: parseFloat(parts[4].trim()) || 0,
        quantity: parseInt(parts[5].trim(), 10) || 1,
        profit: parseFloat(parts[6].trim()) || 0,
      });
    }
  }

  return records;
}
