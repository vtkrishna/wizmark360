#!/bin/bash

DOCS_DIR="docs"
OUTPUT_DIR="docs/pdf"

mkdir -p "$OUTPUT_DIR"

generate_pdf() {
    local input_file="$1"
    local output_file="$2"
    local title="$3"
    local subtitle="$4"

    echo "Generating: $output_file"

    pandoc "$input_file" \
        -o "$output_file" \
        --pdf-engine=xelatex \
        -V geometry:margin=1in \
        -V fontsize=11pt \
        -V documentclass=article \
        -V colorlinks=true \
        -V linkcolor=NavyBlue \
        -V urlcolor=NavyBlue \
        -V toccolor=NavyBlue \
        -V mainfont="DejaVu Sans" \
        -V monofont="DejaVu Sans Mono" \
        -V title="$title" \
        -V subtitle="$subtitle" \
        -V date="February 2026" \
        -V author="Wizards360" \
        --toc \
        --toc-depth=3 \
        --highlight-style=tango \
        -V header-includes="\
\\usepackage{fancyhdr}\
\\usepackage{lastpage}\
\\usepackage{titling}\
\\usepackage{xcolor}\
\\definecolor{wizblue}{HTML}{1E3A8A}\
\\definecolor{wizgold}{HTML}{D97706}\
\\pagestyle{fancy}\
\\fancyhead{}\
\\fancyfoot{}\
\\fancyhead[L]{\\textcolor{wizblue}{\\small WizMark 360}}\
\\fancyhead[R]{\\textcolor{wizblue}{\\small Wizards360}}\
\\fancyfoot[C]{\\textcolor{wizblue}{\\small Page \\thepage\\ of \\pageref{LastPage}}}\
\\fancyfoot[R]{\\textcolor{wizgold}{\\small Confidential}}\
\\renewcommand{\\headrulewidth}{0.4pt}\
\\renewcommand{\\footrulewidth}{0.4pt}\
\\setlength{\\headheight}{15pt}" \
        2>&1

    if [ $? -eq 0 ]; then
        echo "  ✅ Generated: $output_file ($(du -h "$output_file" | cut -f1))"
    else
        echo "  ❌ Failed: $output_file"
        return 1
    fi
}

echo "=============================================="
echo "  WizMark 360 — PDF Document Generator"
echo "=============================================="
echo ""

generate_pdf \
    "$DOCS_DIR/WizMark-360-Investor-Presentation.md" \
    "$OUTPUT_DIR/WizMark-360-Investor-Presentation.pdf" \
    "WizMark 360 — Investor Presentation" \
    "Series A — The World's First AI Marketing Operating System"

echo ""

generate_pdf \
    "$DOCS_DIR/WizMark-360-Product-Note.md" \
    "$OUTPUT_DIR/WizMark-360-Product-Note.pdf" \
    "WizMark 360 — Product Note" \
    "Complete Platform Features & Capabilities"

echo ""
echo "=============================================="
echo "  PDF Generation Complete"
echo "=============================================="
echo ""
ls -lh "$OUTPUT_DIR"/*.pdf 2>/dev/null
