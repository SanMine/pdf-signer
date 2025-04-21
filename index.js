const express = require('express');
const { PDFDocument } = require('pdf-lib');
const fetch = require('node-fetch');

const app = express();
app.use(express.json({ limit: '50mb' }));

app.post('/sign', async (req, res) => {
  try {
    const { pdfBase64, imageBase64, page = 0, x = 50, y = 50, width = 100, height = 50 } = req.body;

    const pdfBytes = Buffer.from(pdfBase64, 'base64');
    const imageBytes = Buffer.from(imageBase64, 'base64');

    const pdfDoc = await PDFDocument.load(pdfBytes);
    const image = await pdfDoc.embedPng(imageBytes); // Use embedJpg for JPG

    const pages = pdfDoc.getPages();
    const targetPage = pages[page];
    targetPage.drawImage(image, { x, y, width, height });

    const signedPdfBytes = await pdfDoc.save();
    const signedBase64 = Buffer.from(signedPdfBytes).toString('base64');

    res.json({ status: 'success', signedPdfBase64: signedBase64 });

  } catch (err) {
    res.status(500).json({ status: 'error', message: err.toString() });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`PDF signer running on port ${port}`));
