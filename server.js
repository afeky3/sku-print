const express = require('express');
const multer = require('multer');
const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3333;

const upload = multer({ dest: path.join(__dirname, 'uploads') });

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Upload Excel and return data
app.post('/api/upload', upload.single('file'), (req, res) => {
    try {
        const workbook = XLSX.readFile(req.file.path);
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

        const rows = data.slice(1).filter(row => row[0] && row[1] && row[2]);

        const products = rows.map(row => ({
            name: String(row[0]).trim(),
            sku: String(row[1]).trim(),
            quantity: parseInt(row[2]) || 1,
            price: row[3] !== undefined ? parseFloat(row[3]) || 0 : 0,
        }));

        const totalLabels = products.reduce((sum, p) => sum + p.quantity, 0);

        fs.unlinkSync(req.file.path);

        res.json({ products, totalLabels });
    } catch (err) {
        res.status(400).json({ error: 'Failed to read Excel file: ' + err.message });
    }
});

app.listen(PORT, () => {
    console.log(`Label Printer running at http://localhost:${PORT}`);
});
