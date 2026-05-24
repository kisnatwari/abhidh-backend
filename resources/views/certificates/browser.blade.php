<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Certificate – {{ $certificate->certificate_number }}</title>
<style>

/* ── Screen: gray background + floating button ── */
html {
    background: #4a4a4a;
    margin: 0;
    padding: 24px 0 48px;
    min-height: 100vh;
}

body { margin: 0; padding: 0; font-family: Arial, sans-serif; }

.btn-bar {
    width: 210mm;
    margin: 0 auto 16px;
    display: flex;
    gap: 10px;
    justify-content: flex-end;
}

.btn-download {
    background: #1B3C72;
    color: #fff;
    border: none;
    padding: 10px 28px;
    font-size: 14px;
    font-weight: bold;
    letter-spacing: 0.5px;
    cursor: pointer;
    border-radius: 4px;
}
.btn-download:hover { background: #254f99; }

/* ── A4 shell (screen only) ── */
.page-shell {
    width: 210mm;
    height: 297mm;
    overflow: hidden;
    margin: 0 auto;
    background: #fff;
    box-shadow: 0 6px 40px rgba(0,0,0,0.55);
    box-sizing: border-box;
    padding: 15mm;
}

/* ── Certificate frames ── */
* { margin: 0; padding: 0; box-sizing: border-box; }

.outer-frame {
    width: 100%;
    min-height: 265mm;
    border: 2px solid #1B3C72;
    padding: 4mm;
}

.inner-frame {
    width: 100%;
    min-height: 255mm;
    border: 1px solid #c5a84c;
    padding: 0 10mm 8mm;
}

/* ── Header ── */
.header { text-align: center; margin-top: 8mm; margin-bottom: 6mm; }
.logo { width: 24mm; height: auto; display: block; margin: 0 auto 3mm; }
.academy-name {
    font-size: 12pt; font-weight: bold; letter-spacing: 4px;
    color: #1B3C72; text-transform: uppercase;
}

/* ── Divider ── */
.divider-tbl { width: 100%; border-collapse: collapse; }
.divider-dark { width: 50%; border-top: 2px solid #2d2d2d; padding: 0; height: 1px; line-height: 0; }
.divider-blue { width: 50%; border-top: 2px solid #1B3C72; padding: 0; height: 1px; line-height: 0; }

/* ── Title ── */
.cert-title {
    font-family: Georgia, 'Times New Roman', serif;
    font-style: italic;
    font-size: 24pt;
    color: #1a1a2e;
    text-align: center;
    line-height: 1.15;
    margin-top: 8mm;
    margin-bottom: 6mm;
}

.certify-text {
    text-align: center; font-size: 11pt;
    color: #666; font-style: italic; margin-bottom: 8mm;
}

/* ── Name ── */
.student-name {
    text-align: center; font-size: 34pt; font-weight: bold;
    color: #1B3C72; letter-spacing: 2px; text-transform: uppercase;
    line-height: 1.1; margin-bottom: 6mm;
}

/* ── Description ── */
.description {
    text-align: center; font-size: 12pt;
    color: #333; line-height: 1.7; margin-bottom: 32mm;
}
.course-name { font-weight: bold; color: #1a1a1a; }

/* ── Footer ── */
.foot-tbl { width: 100%; border-collapse: collapse; }
.foot-tbl td { vertical-align: bottom; padding: 0; }
.col-left  { width: 30%; text-align: left; }
.col-center{ width: 40%; text-align: center; }
.col-right { width: 30%; text-align: right; }

.meta-label { font-size: 9pt; font-weight: bold; color: #1a1a1a; }
.meta-value { font-size: 9pt; color: #555; margin-top: 1mm; margin-bottom: 5mm; }
.seal-img   { width: 36mm; height: 36mm; display: inline-block; }

.cert-number {
    margin-top: 5mm; text-align: right;
    font-size: 7.5pt; color: #999;
}

/* ── Print styles: hide button, use @page margins ── */
@media print {
    @page { size: A4 portrait; margin: 15mm; }

    html { background: white; padding: 0; }
    .btn-bar { display: none; }

    .page-shell {
        width: 100%;
        height: auto;
        overflow: visible;
        box-shadow: none;
        padding: 0;
        margin: 0;
    }

    .outer-frame { min-height: 0; }
    .inner-frame  { min-height: 0; }
}

</style>
</head>
<body>

<div class="btn-bar">
    <button class="btn-download" onclick="window.print()">⬇ Download as PDF</button>
</div>

<div class="page-shell">
    <div class="outer-frame">
        <div class="inner-frame">

            <div class="header">
                <img src="{{ asset('logo.png') }}" class="logo" alt="Logo">
                <div class="academy-name">Abhidh Academy</div>
            </div>

            <table class="divider-tbl">
                <tr>
                    <td class="divider-dark"></td>
                    <td class="divider-blue"></td>
                </tr>
            </table>

            <div class="cert-title">Certificate of Completion</div>
            <div class="certify-text">This is to certify that</div>

            <div class="student-name">{{ strtoupper($user->name) }}</div>

            <div class="description">
                has successfully completed the certificate course in<br>
                <span class="course-name">{{ $course->title }}</span><br>
                conducted by Abhidh Academy
            </div>

            <table class="foot-tbl">
                <tr>
                    <td class="col-left">
                        <div class="meta-label">Duration</div>
                        <div class="meta-value">{{ $course->duration ?? 'N/A' }}</div>
                        <div class="meta-label">Date</div>
                        <div class="meta-value">{{ $certificate->issued_at->format('jS M, Y') }}</div>
                    </td>
                    <td class="col-center">
                        <img src="{{ asset('seal.png') }}" class="seal-img" alt="Seal">
                    </td>
                    <td class="col-right">
                        <table style="width:44mm; margin-left:auto; border-collapse:collapse;">
                            <tr>
                                <td style="padding:0; text-align:center;">
                                    <img src="{{ asset('signature.png') }}" style="width:44mm; height:auto; display:block;" alt="Signature">
                                </td>
                            </tr>
                            <tr>
                                <td style="border-top:1.5px solid #333; padding-top:2mm; text-align:center;">
                                    <div style="font-size:9.5pt; font-weight:bold; color:#1a1a1a;">Pradeep Rauniyar</div>
                                    <div style="font-size:8.5pt; color:#555;">Founder/CEO</div>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>

            <div class="cert-number">Certificate Number: {{ $certificate->certificate_number }}</div>

        </div>
    </div>
</div>

</body>
</html>
