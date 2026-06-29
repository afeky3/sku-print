const XLSX = require('xlsx');
const PDFDocument = require('pdfkit');
const bwipjs = require('bwip-js');
const { print } = require('pdf-to-printer');
const fs = require('fs');
const path = require('path');

// Label size in points (1 cm = 28.35 points)
const LABEL_WIDTH = 4 * 28.35;   // 4 cm
const LABEL_HEIGHT = 2.5 * 28.35; // 2.5 cm

const EXCEL_FILE = process.argv[2] || 'products.xlsx';
const OUTPUT_PDF = path.join(__dirname, 'labels_output.pdf');

async function generateBarcode(sku) {
    const png = await bwipjs.toBuffer({
        bcid: 'code128',
        text: sku,
        scale: 2,
        height: 8,
        includetext: false,
    });
    return png;
}

async function main() {
    if (!fs.existsSync(EXCEL_FILE)) {
        console.error(`File not found: ${EXCEL_FILE}`);
        console.log('Usage: node print-labels.js <path-to-excel.xlsx>');
        console.log('');
        console.log('Excel format:');
        console.log('  Column A: Product Name');
        console.log('  Column B: SKU');
        console.log('  Column C: Quantity (number of labels to print)');
        process.exit(1);
    }

    const workbook = XLSX.readFile(EXCEL_FILE);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    // Skip header row
    const rows = data.slice(1).filter(row => row[0] && row[1] && row[2]);

    if (rows.length === 0) {
        console.error('No valid data found in Excel file.');
        process.exit(1);
    }

    const doc = new PDFDocument({
        size: [LABEL_WIDTH, LABEL_HEIGHT],
        margins: { top: 5, bottom: 5, left: 5, right: 5 },
    });

    const stream = fs.createWriteStream(OUTPUT_PDF);
    doc.pipe(stream);

    let totalLabels = 0;

    for (const row of rows) {
        const productName = String(row[0]).trim();
        const sku = String(row[1]).trim();
        const quantity = parseInt(row[2]) || 1;
        const price = row[3] !== undefined ? parseFloat(row[3]) || 0 : 0;

        const barcodeBuffer = await generateBarcode(sku);

        for (let i = 0; i < quantity; i++) {
            if (totalLabels > 0) {
                doc.addPage();
            }

            const centerX = LABEL_WIDTH / 2;

            // Barcode image - centered at top
            const barcodeWidth = 85;
            const barcodeHeight = 25;
            const barcodeX = centerX - barcodeWidth / 2;
            doc.image(barcodeBuffer, barcodeX, 10, {
                width: barcodeWidth,
                height: barcodeHeight,
            });

            // SKU text under barcode - centered
            doc.fontSize(7)
                .font('Helvetica')
                .text(sku, 5, 38, {
                    width: LABEL_WIDTH - 10,
                    align: 'center',
                });

            // Price - centered below SKU
            doc.fontSize(8)
                .font('Helvetica-Bold')
                .text(price + ' EGP', 5, 48, {
                    width: LABEL_WIDTH - 10,
                    align: 'center',
                });

            // Product name - centered below price
            doc.fontSize(6.5)
                .font('Helvetica-Bold')
                .text(productName, 5, 58, {
                    width: LABEL_WIDTH - 10,
                    align: 'center',
                    lineBreak: true,
                    height: 15,
                });

            totalLabels++;
        }
    }

    doc.end();

    await new Promise((resolve) => stream.on('finish', resolve));

    console.log(`Generated ${totalLabels} labels -> ${OUTPUT_PDF}`);
    console.log('Sending to printer...');

    try {
        await print(OUTPUT_PDF);
        console.log('Print job sent successfully!');
    } catch (err) {
        console.error('Print error:', err.message);
        console.log(`PDF saved at: ${OUTPUT_PDF}`);
        console.log('You can print it manually.');
    }
}

main().catch(err => {
    console.error('Error:', err);
    process.exit(1);
});
