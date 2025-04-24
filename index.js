const express = require("express");
const { PDFDocument, rgb } = require("pdf-lib");

const app = express();
app.use(express.json({ limit: "50mb" }));

app.post("/sign", async (req, res) => {
  try {
    const {
      pdfBase64,
      imageBase64,
      textBase64,
      dateBase64,
      base64ProfessorName,
      base64Position,
      base64School,
      base64Programme,
      base64StudentName,
      base64Appointment,
      page = 0,
      width = 150,
      height = 70,
      textSize = 12,
      dateSize = 10,
    } = req.body;

    // Decode all Base64 inputs
    const pdfBytes = Buffer.from(pdfBase64, "base64");
    const imageBytes = Buffer.from(imageBase64, "base64");
    const text = Buffer.from(textBase64, "base64").toString("utf-8");
    const date = Buffer.from(dateBase64, "base64").toString("utf-8");

    // Decode professor information fields
    const professorName = base64ProfessorName
      ? Buffer.from(base64ProfessorName, "base64").toString("utf-8")
      : "";
    const position = base64Position
      ? Buffer.from(base64Position, "base64").toString("utf-8")
      : "";
    const school = base64School
      ? Buffer.from(base64School, "base64").toString("utf-8")
      : "";
    const programme = base64Programme
      ? Buffer.from(base64Programme, "base64").toString("utf-8")
      : "";

    // Decode student name and appointment information
    const studentName = base64StudentName
      ? Buffer.from(base64StudentName, "base64").toString("utf-8")
      : "";
    const appointment = base64Appointment
      ? Buffer.from(base64Appointment, "base64").toString("utf-8")
      : "";

    const pdfDoc = await PDFDocument.load(pdfBytes);
    const image = await pdfDoc.embedPng(imageBytes);

    const pages = pdfDoc.getPages();
    const targetPage = pages[page];

    // ADVISOR INFORMATION SECTION (TOP PART)

    // Professor name after "I,"
    if (professorName) {
      targetPage.drawText(professorName, {
        x: 135, // Adjusted to the left
        y: 348, // Adjusted down
        size: textSize,
        color: rgb(0, 0, 0),
      });
    }

    // Position after "Position"
    if (position) {
      targetPage.drawText(position, {
        x: 400, // Adjusted to the left
        y: 348, // Adjusted down
        size: textSize,
        color: rgb(0, 0, 0),
      });
    }

    // School after "School"
    if (school) {
      targetPage.drawText(school, {
        x: 150, // Adjusted to the left
        y: 328, // Adjusted down
        size: textSize,
        color: rgb(0, 0, 0),
      });
    }

    // Programme after "Programme"
    if (programme) {
      targetPage.drawText(programme, {
        x: 380, // Adjusted to the left
        y: 328, // Adjusted down
        size: textSize,
        color: rgb(0, 0, 0),
      });
    }

    // Student name after "Mr./Miss"
    if (studentName) {
      targetPage.drawText(studentName, {
        x: 360, // Adjusted to the left
        y: 307, // Adjusted down
        size: textSize,
        color: rgb(0, 0, 0),
      });
    }

    // Appointment type at "Other (specify)"
    if (appointment) {
      targetPage.drawText(appointment, {
        x: 330, // Adjusted to the left
        y: 242, // Adjusted down
        size: textSize,
        color: rgb(0, 0, 0),
      });
    }

    // COMMENTS AND SIGNATURE SECTION (BOTTOM PART)

    // Comment/eligibility text in the Comment section
    targetPage.drawText(text, {
      x: 150, // Adjusted to the left
      y: 201, // Adjusted down
      size: textSize,
      color: rgb(0, 0, 0),
    });

    // The signature image
    targetPage.drawImage(image, {
      x: 130, // Adjusted to the left
      y: 110, // Adjusted down
      width,
      height,
    });

    // Professor short name under signature
    if (professorName) {
      // Extract first name if full name provided
      const nameParts = professorName.split(" ");
      const shortName =
        nameParts.length > 1
          ? nameParts[0] + " " + nameParts[1] // "Dr. Franco"
          : professorName;

      targetPage.drawText(shortName, {
        x: 160, // Adjusted to the left
        y: 106, // Adjusted down
        size: textSize,
        color: rgb(0, 0, 0),
      });
    }

    // The date in the Date field
    targetPage.drawText(date, {
      x: 160, // Adjusted to the left
      y: 85, // Adjusted down
      size: dateSize,
      color: rgb(0, 0, 0),
    });

    const signedPdfBytes = await pdfDoc.save();
    const signedBase64 = Buffer.from(signedPdfBytes).toString("base64");

    res.json({
      status: "success",
      signedPdfBase64: signedBase64,
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: err.toString(),
    });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`PDF signer running on port ${port}`));
