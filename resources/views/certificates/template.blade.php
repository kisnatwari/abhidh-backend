<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<style>
@page { size: A4 portrait; margin: 0; }
* { margin: 0; padding: 0; box-sizing: border-box; }
html, body {
    width: 210mm;
    height: 297mm;
    overflow: hidden;
    font-family: 'DejaVu Sans', sans-serif;
    background: #fff;
}

.page-wrap {
    position: absolute;
    top: 0;
    left: 0;
    width: 210mm;
    height: 297mm;
    overflow: hidden;
}

/*
 * Frame divs are intentionally empty — no children.
 * DomPDF renders a positioned bordered element's border separately
 * from its children, which causes a blank first page. Empty divs
 * avoid this entirely; content lives in sibling absolute elements.
 *
 * Outer frame: 15 mm page margin each side
 *   width = 210 - 30 = 180 mm   height = 297 - 30 = 267 mm
 */
.outer-frame {
    position: absolute;
    top: 15mm;
    left: 15mm;
    width: 180mm;
    height: 267mm;
    border: 2px solid #1B3C72;
}

/*
 * Inner frame: outer-frame origin + 4 mm outer padding
 *   top/left = 15 + 4 = 19 mm
 *   width  = 180 - 8 = 172 mm
 *   height = 267 - 8 = 259 mm
 */
.inner-frame {
    position: absolute;
    top: 19mm;
    left: 19mm;
    width: 172mm;
    height: 259mm;
    border: 1px solid #c5a84c;
}

/*
 * Content area: left = 19 mm (inner-frame left) + 10 mm inner padding = 29 mm
 *               width = 172 - 20 = 152 mm
 */
.content-area {
    position: absolute;
    top: 19mm;
    left: 29mm;
    width: 152mm;
}

/* ── Header (logo + academy name) — tight top margin ── */
.cert-header {
    text-align: center;
    margin-top: 4mm;
    margin-bottom: 4mm;
}
.logo {
    width: 32mm;
    height: auto;
    display: block;
    margin: 0 auto 3mm;
}
.academy-name {
    font-size: 13pt;
    font-weight: bold;
    letter-spacing: 3px;
    color: #1B3C72;
    text-transform: uppercase;
}

/*
 * Main block: pushed down with padding-top so the title/name/description
 * group sits in the vertical centre of the frame rather than hugging
 * the divider. Adjust padding-top to shift the block up or down.
 */
.main-block {
    padding-top: 10mm;
}

.cert-title {
    font-family: 'DejaVu Serif', serif;
    font-style: italic;
    font-size: 24pt;
    color: #1a1a2e;
    text-align: center;
    line-height: 1.15;
    margin-top: 0;
    margin-bottom: 5mm;
}
.certify-text {
    text-align: center;
    font-size: 11pt;
    color: #666;
    font-style: italic;
    margin-bottom: 6mm;
}
.student-name {
    text-align: center;
    font-size: 38pt;
    font-weight: bold;
    color: #1B3C72;
    letter-spacing: 2px;
    text-transform: uppercase;
    line-height: 1.1;
    margin-bottom: 6mm;
}
.description {
    text-align: center;
    font-size: 12pt;
    color: #333;
    line-height: 2.0;
}
.course-name { font-weight: bold; color: #1a1a1a; }

/*
 * Footer pinned near the bottom, immune to content length above.
 * "bottom: 25mm" equivalent (DomPDF only supports top/left reliably):
 *   inner-frame bottom = 19 + 259 = 278 mm
 *   8 mm inner bottom padding  → 270 mm
 *   footer height ≈ 40 mm      → top = 270 - 40 = 230 mm
 * Using 232 mm gives a ~26 mm visual gap from the page bottom.
 */
.footer-tbl {
    position: absolute;
    top: 185mm;
    left: 29mm;
    width: 152mm;
}

/* Certificate number: ~5 mm below footer bottom (185 + 48 + 2 = 235 mm) */
.cert-number {
    position: absolute;
    top: 235mm;
    left: 29mm;
    width: 152mm;
    text-align: right;
    font-size: 7.5pt;
    color: #999;
}
</style>
</head>
<body>
<div class="page-wrap">

    {{-- Decorative border frames (empty — content lives in siblings) --}}
    <div class="outer-frame"></div>
    <div class="inner-frame"></div>

    {{-- Main content --}}
    <div class="content-area">

        <div class="cert-header">
            <img src="{{ $logoSrc }}" class="logo" alt="Logo">
            <div class="academy-name">Abhidh Academy</div>
        </div>

        {{-- Two-tone divider --}}
        <table cellpadding="0" cellspacing="0" border="0" style="width: 100%; border-collapse: collapse;">
        <tr>
            <td style="width: 50%; border-top: 2px solid #2d2d2d; height: 1px; line-height: 0; padding: 0;"></td>
            <td style="width: 50%; border-top: 2px solid #1B3C72; height: 1px; line-height: 0; padding: 0;"></td>
        </tr>
        </table>

        {{-- Central block pushed down to visually centre on page --}}
        <div class="main-block">
            <div class="cert-title">Certificate of Completion</div>
            <div class="certify-text">This is to certify that</div>
            <div class="student-name">{{ strtoupper($user->name) }}</div>
            <div class="description">
                has successfully completed the certificate course in<br>
                <span class="course-name">{{ $course->title }}</span><br>
                conducted by Abhidh Academy
            </div>
        </div>

    </div>

    {{-- Footer: anchored by absolute position --}}
    <table class="footer-tbl" cellpadding="0" cellspacing="0" border="0" style="border-collapse: collapse;">
    <tr>
        <td style="width: 28%; vertical-align: bottom; text-align: left; padding: 0;">
            <div style="font-size: 9pt; font-weight: bold; color: #1a1a1a;">Format</div>
            <div style="font-size: 9pt; color: #555; margin-top: 1mm; margin-bottom: 5mm;">{{ $course->duration ?: ($course->course_type === 'self_paced' ? 'Self-Paced' : 'Guided') }}</div>
            <div style="font-size: 9pt; font-weight: bold; color: #1a1a1a;">Date</div>
            <div style="font-size: 9pt; color: #555; margin-top: 1mm;">{{ $certificate->issued_at->format('jS M, Y') }}</div>
        </td>
        <td style="width: 38%; vertical-align: bottom; text-align: center; padding: 0;">
            <img src="{{ $sealSrc }}" style="width: 36mm; height: 36mm;" alt="Seal">
        </td>
        <td style="width: 34%; vertical-align: bottom; text-align: right; padding: 0;">
            <table cellpadding="0" cellspacing="0" border="0" style="width: 54mm; margin-left: auto; border-collapse: collapse;">
            <tr>
                <td style="padding: 0; text-align: center;">
                    <img src="{{ $sigSrc }}" style="width: 54mm; height: auto; display: block;" alt="Signature">
                </td>
            </tr>
            <tr>
                <td style="border-top: 1px solid #333; padding-top: 2mm; text-align: center;">
                    <div style="font-size: 9.5pt; font-weight: bold; color: #1a1a1a;">Pradeep Rauniyar</div>
                    <div style="font-size: 8.5pt; color: #555;">Founder/CEO</div>
                </td>
            </tr>
            </table>
        </td>
    </tr>
    </table>

    {{-- Certificate number --}}
    <div class="cert-number">Certificate Number: {{ $certificate->certificate_number }}</div>

</div>
</body>
</html>
