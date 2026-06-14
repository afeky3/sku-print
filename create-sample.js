const XLSX = require('xlsx');

const data = [
    ['Product Name', 'SKU', 'Quantity'],
    ['Teddy Bear Brown Large', 'TDB-001', 3],
    ['Teddy Bear White Small', 'TDW-002', 2],
    ['Teddy Bear Pink Medium', 'TDP-003', 1],
];

const ws = XLSX.utils.aoa_to_sheet(data);
const wb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wb, ws, 'Products');
XLSX.writeFile(wb, 'products.xlsx');

console.log('Sample file created: products.xlsx');
