import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Main dispatcher for PDF generation
 */
export const generateInvoicePDF = (order, customer, templateId = 'classic') => {
    const doc = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: templateId === 'retail' ? [80, 200] : 'a4',
    });

    // Extract dynamic colors or use defaults
    const colors = {
        primary: [14, 165, 233], // blue-600
        secondary: [241, 245, 249], // gray-100
        text: [31, 41, 55], // gray-800
        lightText: [100, 100, 100],
    };

    const data = {
        invoiceNo: order.invoiceNumber || `INV-${String(order.id).slice(-6).toUpperCase()}`,
        date: new Date(order.invoiceDate || order.createdAt?.seconds * 1000 || order.date || Date.now()).toLocaleDateString(),
        dueDate: order.dueDate || 'N/A',
        customer: {
            name: customer.name || order.customerName || order.customer?.name || 'N/A',
            address: customer.address || order.customerAddress || 
                     (order.customer?.billingAddress ? 
                        `${order.customer.billingAddress.address1}, ${order.customer.billingAddress.city}, ${order.customer.billingAddress.country}` : 
                        'N/A'),
            phone: customer.phone || order.customerPhone || order.customer?.phone || 'N/A',
            email: customer.email || order.customerEmail || order.customer?.email || '',
        },
        company: {
            name: order.companyName || 'AVERQON BILL',
            address: order.companyAddress || 'Sivakasi, Tamil Nadu, India',
            phone: order.companyPhone || '+91 98765 43210',
            gstin: order.companyGSTIN || '33AAAAA0000A1Z5',
            logoUrl: order.logoUrl || null,
        },
        items: order.items || order.products || [],
        subtotal: order.pricing?.subtotal || order.subtotal || order.totalAmount,
        tax: order.pricing?.totalTax || order.tax || 0,
        discount: order.pricing?.totalDiscounts || order.discount || 0,
        shipping: order.pricing?.shippingTotal || 0,
        total: order.totalAmount || order.amount || 0,
        footer: order.footerNote || 'Thank you for your business!',
        currency: (order.currencySymbol || order.currency || 'Rs.').replace('₹', 'Rs.').replace('\u20B9', 'Rs.'),
    };

    switch (templateId) {
        case 'editorial':
            return renderEditorial(doc, data, colors);
        case 'modern':
            return renderModern(doc, data, colors);
        case 'retail':
            return renderRetail(doc, data, colors);
        case 'minimal':
            return renderMinimal(doc, data, colors);
        case 'professional':
            return renderProfessional(doc, data, colors);
        case 'crackers':
            return renderCrackers(doc, data, colors);
        case 'classic':
        default:
            return renderClassic(doc, data, colors);
    }
};

/* ─── TEMPLATES ─────────────────────────────────────────── */

/**
 * TEMPLATE 1 — Editorial
 * Matches the uploaded design: cream BG, giant 'Invoice' heading,
 * divider lines, two-column footer with payment info.
 */
function renderEditorial(doc, data, colors) {
    const cream = [248, 246, 237];
    const black = [10, 10, 10];
    const lightGray = [180, 180, 180];
    const W = 210;
    const MARGIN = 18;
    const RIGHT = W - MARGIN;

    // Convenience formatter — currency is already PDF-safe (Rs.) from the data builder
    const cur = (amt) => `${data.currency} ${Number(amt || 0).toFixed(2)}`;

    // ── Background ──────────────────────────────────
    doc.setFillColor(...cream);
    doc.rect(0, 0, W, 297, 'F');

    // ── Big "Invoice" heading ────────────────────────
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(52);
    doc.setTextColor(...black);
    doc.text('Invoice', MARGIN, 40);

    // ── Date + Invoice No (top-right) ────────────────
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(...black);
    let invoiceDate = data.date;
    try {
        const parsed = new Date(data.date);
        if (!isNaN(parsed)) {
            invoiceDate = parsed.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
        }
    } catch (e) {}
    doc.text(invoiceDate, RIGHT, 26, { align: 'right' });
    doc.setFont('helvetica', 'bold');
    doc.text(`Invoice No. ${data.invoiceNo}`, RIGHT, 33, { align: 'right' });

    // ── Divider #1 ───────────────────────────────────
    doc.setDrawColor(...lightGray);
    doc.setLineWidth(0.3);
    doc.line(MARGIN, 48, RIGHT, 48);

    // ── Billed to ────────────────────────────────────
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('Billed to:', MARGIN, 60);
    doc.setFont('helvetica', 'normal');
    doc.text(data.customer.name || '', MARGIN, 68);
    doc.text(data.customer.phone || '', MARGIN, 74);
    if (data.customer.address && data.customer.address !== 'N/A') {
        doc.text(data.customer.address, MARGIN, 80, { maxWidth: 100 });
    }

    // ── Divider #2 ───────────────────────────────────
    doc.setDrawColor(...lightGray);
    doc.line(MARGIN, 100, RIGHT, 100);

    // ── Line items table ─────────────────────────────
    const tableBody = data.items.map(item => [
        item.name || '',
        cur(item.price),
        String(item.qty || 1),
        cur(item.total)
    ]);

    autoTable(doc, {
        startY: 106,
        margin: { left: MARGIN, right: MARGIN },
        // Pass each header cell as an object so its alignment matches the body column
        head: [[
            { content: 'Description', styles: { halign: 'left'   } },
            { content: 'Rate',        styles: { halign: 'right'  } },
            { content: 'Qty',         styles: { halign: 'right'  } },
            { content: 'Amount',      styles: { halign: 'right'  } },
        ]],
        body: tableBody,
        theme: 'plain',
        headStyles: {
            fontStyle: 'bold',
            textColor: black,
            fillColor: cream,
            fontSize: 10,
            cellPadding: { top: 3, bottom: 5, left: 2, right: 2 },
            lineWidth: { bottom: 0.4 },
            lineColor: lightGray,
        },
        bodyStyles: {
            textColor: black,
            fillColor: cream,
            fontSize: 10,
            cellPadding: { top: 3, bottom: 4, left: 2, right: 2 },
            lineWidth: { bottom: 0.2 },
            lineColor: [220, 220, 210],
        },
        columnStyles: {
            0: { halign: 'left',   cellWidth: 'auto' },
            1: { halign: 'right',  cellWidth: 42 },
            2: { halign: 'right', cellWidth: 18 },
            3: { halign: 'right',  cellWidth: 36 },
        },
        rowPageBreak: 'avoid',
    });

    // ── Summary (Subtotal / Tax / Total) ─────────────
    const fy = doc.lastAutoTable.finalY + 10;
    const labelX = 132;

    // Helper — prints a label-value row
    const summaryRow = (label, value, y, bold = false) => {
        doc.setFont('helvetica', bold ? 'bold' : 'normal');
        doc.setFontSize(bold ? 11 : 10);
        doc.text(label, labelX, y);
        doc.text(value, RIGHT, y, { align: 'right' });
    };

    const subtotal = Number(data.subtotal || data.total || 0);
    const taxRate  = Number(data.tax || 0);
    const taxAmt   = (subtotal * taxRate / 100);
    const total    = Number(data.total || 0);

    summaryRow('Subtotal', cur(subtotal), fy);
    summaryRow(`Tax (${taxRate}%)`, cur(taxAmt), fy + 9);

    // Divider above Total
    doc.setDrawColor(...lightGray);
    doc.setLineWidth(0.3);
    doc.line(labelX, fy + 14, RIGHT, fy + 14);

    summaryRow('Total', cur(total), fy + 22, true);

    // ── Footer ───────────────────────────────────────
    const footerY = 258;
    doc.setDrawColor(...lightGray);
    doc.setLineWidth(0.3);
    doc.line(MARGIN, footerY, RIGHT, footerY);

    // Left column — Payment Information
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(...black);
    doc.text('Payment Information', MARGIN, footerY + 10);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text(data.company.name, MARGIN, footerY + 17);
    doc.text(`Bank: ${data.company.bank || 'Contact us for details'}`, MARGIN, footerY + 23);
    doc.text(`Account No: ${data.company.account || 'N/A'}`, MARGIN, footerY + 29);

    // Right column — Company / Sender info
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text(data.company.name, RIGHT, footerY + 10, { align: 'right' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text(data.company.address, RIGHT, footerY + 17, { align: 'right' });
    doc.text(data.company.phone, RIGHT, footerY + 23, { align: 'right' });
    if (data.company.email) {
        doc.text(data.company.email, RIGHT, footerY + 29, { align: 'right' });
    }

    // Bottom divider
    doc.setDrawColor(...lightGray);
    doc.line(MARGIN, footerY + 36, RIGHT, footerY + 36);

    return saveDoc(doc, data.invoiceNo);
}

function renderClassic(doc, data, colors) {
    // Header
    doc.setFillColor(...colors.secondary);
    doc.rect(0, 0, 210, 50, 'F');
    
    doc.setFontSize(24);
    doc.setTextColor(...colors.primary);
    doc.setFont("helvetica", "bold");
    doc.text(data.company.name, 20, 25);
    
    doc.setFontSize(10);
    doc.setTextColor(...colors.text);
    doc.setFont("helvetica", "normal");
    doc.text(`GSTIN: ${data.company.gstin}`, 20, 32);
    doc.text(data.company.address, 20, 37);

    doc.setFontSize(22);
    doc.setTextColor(...colors.text);
    doc.setFont("helvetica", "bold");
    doc.text('INVOICE', 190, 25, { align: 'right' });
    
    doc.setFontSize(10);
    doc.setTextColor(...colors.lightText);
    doc.setFont("helvetica", "normal");
    doc.text(`#${data.invoiceNo}`, 190, 32, { align: 'right' });
    doc.text(`DATE: ${data.date}`, 190, 37, { align: 'right' });

    // Billing Info
    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150);
    doc.setFont("helvetica", "bold");
    doc.text('BILL TO:', 20, 65);
    
    doc.setFontSize(12);
    doc.setTextColor(...colors.text);
    doc.text(data.customer.name, 20, 72);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(data.customer.address, 20, 78, { maxWidth: 60 });
    doc.text(`Phone: ${data.customer.phone}`, 20, 88);

    // Table
    const tableData = data.items.map((item, i) => [
        i + 1, item.name, `${data.currency}${item.price}`, item.qty, `${data.currency}${item.total}`
    ]);

    autoTable(doc, {
        startY: 100,
        head: [['#', 'Description', 'Price', 'Qty', 'Total']],
        body: tableData,
        theme: 'grid',
        headStyles: { fillColor: colors.primary, textColor: 255 },
        columnStyles: { 2: { halign: 'left' }, 3: { halign: 'left' }, 4: { halign: 'left' } }
    });

    const finalY = doc.lastAutoTable.finalY + 15;
    doc.setFont("helvetica", "bold");
    doc.text('Subtotal:', 140, finalY);
    doc.text('Tax:', 140, finalY + 7);
    doc.text('Discount:', 140, finalY + 14);
    doc.setFont("helvetica", "normal");
    doc.text(`${data.currency}${data.subtotal}`, 190, finalY, { align: 'right' });
    doc.text(`${data.currency}${data.tax}`, 190, finalY + 7, { align: 'right' });
    doc.text(`${data.currency}${data.discount}`, 190, finalY + 14, { align: 'right' });

    doc.setFillColor(...colors.secondary);
    doc.rect(130, finalY + 20, 70, 15, 'F');
    doc.setFontSize(14);
    doc.setTextColor(...colors.primary);
    doc.setFont("helvetica", "bold");
    doc.text('Total Amount:', 135, finalY + 30);
    doc.text(`${data.currency}${data.total}`, 190, finalY + 30, { align: 'right' });

    finishDoc(doc, data, colors, finalY);
    return saveDoc(doc, data.invoiceNo);
}

function renderModern(doc, data, colors) {
    const accent = [79, 70, 229]; // Indigo-600
    
    // Header Stripe
    doc.setFillColor(...accent);
    doc.rect(0, 0, 210, 15, 'F');

    doc.setFontSize(28);
    doc.setTextColor(...colors.text);
    doc.setFont("helvetica", "bold");
    doc.text(data.company.name, 20, 35);
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(data.company.address, 20, 42);
    doc.text(`GST: ${data.company.gstin}`, 20, 47);

    // Invoice Info Box
    doc.setFillColor(...colors.secondary);
    doc.rect(140, 25, 50, 25, 'F');
    doc.setFontSize(14);
    doc.text('INVOICE', 145, 33);
    doc.setFontSize(9);
    doc.text(`# ${data.invoiceNo}`, 145, 40);
    doc.text(`Date: ${data.date}`, 145, 45);

    doc.setFontSize(11);
    doc.text('CUSTOMER', 20, 65);
    doc.setDrawColor(...accent);
    doc.line(20, 67, 40, 67);
    doc.setFontSize(12);
    doc.text(data.customer.name, 20, 75);
    doc.setFontSize(9);
    doc.text(data.customer.address, 20, 80, { maxWidth: 60 });

    autoTable(doc, {
        startY: 100,
        head: [['ITEM', 'QTY', 'UNIT PRICE', 'TOTAL']],
        body: data.items.map(item => [item.name, item.qty, `${data.currency}${item.price}`, `${data.currency}${item.total}`]),
        theme: 'striped',
        headStyles: { fillColor: accent, textColor: 255 },
        columnStyles: { 2: { halign: 'right' }, 3: { halign: 'right' } }
    });

    const finalY = doc.lastAutoTable.finalY + 10;
    doc.text('TOTAL DUE', 140, finalY + 10);
    doc.setFontSize(24);
    doc.setTextColor(...accent);
    doc.text(`${data.currency}${data.total}`, 140, finalY + 20);

    finishDoc(doc, data, colors, finalY + 30);
    return saveDoc(doc, data.invoiceNo);
}

function renderRetail(doc, data, colors) {
    // 80mm receipt style
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(data.company.name, 40, 15, { align: 'center' });
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text(data.company.address, 40, 20, { align: 'center', maxWidth: 70 });
    doc.text(`GST: ${data.company.gstin}`, 40, 25, { align: 'center' });
    doc.line(5, 28, 75, 28);
    
    doc.text(`Inv: ${data.invoiceNo}`, 5, 35);
    doc.text(`Date: ${data.date}`, 75, 35, { align: 'right' });
    doc.text(`To: ${data.customer.name}`, 5, 40);

    autoTable(doc, {
        startY: 45,
        margin: { left: 5, right: 5 },
        head: [['Item', 'Qty', 'Amt']],
        body: data.items.map(i => [i.name, i.qty, i.total]),
        theme: 'plain',
        styles: { fontSize: 8 },
        columnStyles: { 2: { halign: 'right' } }
    });

    const finalY = doc.lastAutoTable.finalY + 5;
    doc.setFont("helvetica", "bold");
    doc.text('TOTAL', 5, finalY);
    doc.text(`${data.currency}${data.total}`, 75, finalY, { align: 'right' });
    doc.setFontSize(7);
    doc.text(data.footer, 40, finalY + 10, { align: 'center' });

    return saveDoc(doc, data.invoiceNo);
}

function renderMinimal(doc, data, colors) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(data.company.name.toUpperCase(), 20, 20);
    doc.text(data.company.gstin, 20, 25);
    
    doc.setFontSize(30);
    doc.text('INVOICE', 20, 50);
    
    doc.setFontSize(10);
    doc.text(`NO. ${data.invoiceNo}`, 190, 20, { align: 'right' });
    doc.text(`DATE. ${data.date}`, 190, 25, { align: 'right' });

    doc.text('BILL TO', 20, 70);
    doc.setFont("helvetica", "bold");
    doc.text(data.customer.name, 20, 75);
    doc.setFont("helvetica", "normal");
    doc.text(data.customer.address, 20, 80, { maxWidth: 50 });

    autoTable(doc, {
        startY: 100,
        head: [['DESCRIPTION', 'QTY', 'AMOUNT']],
        body: data.items.map(i => [i.name, i.qty, `${data.currency}${i.total}`]),
        theme: 'plain',
        headStyles: { fontStyle: 'bold', borderBottom: [1, 0, 0, 0] },
        columnStyles: { 2: { halign: 'right' } }
    });

    const finalY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(12);
    doc.text('SUBTOTAL', 140, finalY);
    doc.text(`${data.currency}${data.subtotal}`, 190, finalY, { align: 'right' });
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text('TOTAL', 140, finalY + 10);
    doc.text(`${data.currency}${data.total}`, 190, finalY + 10, { align: 'right' });

    finishDoc(doc, data, colors, finalY + 30);
    return saveDoc(doc, data.invoiceNo);
}

function renderProfessional(doc, data, colors) {
    const navy = [15, 23, 42]; // slate-900
    
    // Solid Header Top
    doc.setFillColor(...navy);
    doc.rect(0, 0, 210, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.text(data.company.name, 20, 25);
    doc.setFontSize(9);
    doc.text(data.company.address, 20, 32);

    doc.setFontSize(30);
    doc.text('INVOICE', 190, 30, { align: 'right' });

    doc.setTextColor(...colors.text);
    doc.text('RECIPIENT', 20, 60);
    doc.setFontSize(12);
    doc.text(data.customer.name, 20, 68);
    
    doc.setFontSize(9);
    doc.text('INVOICE DETAILS', 140, 60);
    doc.text(`Number: ${data.invoiceNo}`, 140, 68);
    doc.text(`Date: ${data.date}`, 140, 73);

    autoTable(doc, {
        startY: 90,
        head: [['Qty', 'Description', 'Unit Price', 'Line Total']],
        body: data.items.map(i => [i.qty, i.name, `${data.currency}${i.price}`, `${data.currency}${i.total}`]),
        theme: 'grid',
        headStyles: { fillColor: navy, textColor: 255 },
        styles: { cellPadding: 5 }
    });

    const finalY = doc.lastAutoTable.finalY + 10;
    // ... stats ...
    doc.setFontSize(11);
    doc.text(`GRAND TOTAL: ${data.currency}${data.total}`, 190, finalY + 10, { align: 'right' });

    finishDoc(doc, data, colors, finalY + 30);
    return saveDoc(doc, data.invoiceNo);
}

function renderCrackers(doc, data, colors) {
    const teal = [0, 150, 136];
    const black = [20, 20, 20];
    const gray = [100, 100, 100];
    const W = 210;
    const MARGIN = 10;
    const RIGHT = W - MARGIN;
    const centerX = W / 2;

    const cur = (amt) => `${Number(amt || 0).toFixed(2)}`;

    // ── Watermark (Logo background) ──────────────────
    const centerY = 160;
    doc.setGState(new doc.GState({ opacity: 0.1 }));
    doc.setFillColor(...teal);
    doc.setDrawColor(...teal);
    doc.setLineWidth(1);
    
    // Draw outer circle
    doc.circle(centerX, centerY, 60, 'S');
    
    // Draw Sun rays effect
    for (let i = 0; i < 36; i++) {
        const angle = (i * 10) * Math.PI / 180;
        const x1 = centerX + Math.cos(angle) * 35;
        const y1 = centerY + Math.sin(angle) * 35;
        const x2 = centerX + Math.cos(angle) * 55;
        const y2 = centerY + Math.sin(angle) * 55;
        doc.line(x1, y1, x2, y2);
    }

    // Logo Text "MPD Q"
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(80);
    doc.text('M', centerX - 10, centerY - 10, { align: 'center' });
    doc.text('P', centerX - 10, centerY + 15, { align: 'center' });
    doc.text('D', centerX - 10, centerY + 40, { align: 'center' });
    
    doc.setFontSize(140);
    doc.text('Q', centerX + 15, centerY + 20, { align: 'center' });
    
    doc.setGState(new doc.GState({ opacity: 1.0 }));

    // ── Header Bar ───────────────────────────────────
    doc.setFillColor(...teal);
    doc.rect(MARGIN, MARGIN, RIGHT - MARGIN, 8, 'F');
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(255, 255, 255);
    doc.text(`Enquiry No : ${data.invoiceNo}`, MARGIN + 2, MARGIN + 5.5);
    doc.text('Estimation', centerX, MARGIN + 5.5, { align: 'center' });
    doc.text(`Date : ${data.date}`, RIGHT - 2, MARGIN + 5.5, { align: 'right' });

    // ── Shop Details ─────────────────────────────────
    doc.setTextColor(...black);
    doc.setFontSize(14);
    doc.text(data.company.name, MARGIN, 28);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(data.company.address, MARGIN, 33, { maxWidth: 80 });
    doc.text(`Phone : ${data.company.phone}`, MARGIN, 40);

    // ── Customer Details ─────────────────────────────
    doc.setFont('helvetica', 'bold');
    doc.text(data.customer.name, RIGHT, 28, { align: 'right' });
    doc.setFont('helvetica', 'normal');
    doc.text(data.customer.address, RIGHT, 33, { align: 'right', maxWidth: 80 });
    doc.text(`Email : ${data.customer.email || 'N/A'}`, RIGHT, 40, { align: 'right' });
    doc.text(`Phone : ${data.customer.phone}`, RIGHT, 45, { align: 'right' });

    // ── Table ────────────────────────────────────────
    const tableBody = data.items.map((item, i) => [
        i + 1,
        item.name || '',
        item.unit || 'BOX',
        item.qty || 1,
        cur(item.price),
        cur(item.total)
    ]);

    autoTable(doc, {
        startY: 55,
        margin: { left: MARGIN, right: MARGIN },
        head: [[
            'S No',
            'Product Name',
            'Content',
            'Qty',
            'Rate',
            'Amount'
        ]],
        body: tableBody,
        theme: 'grid',
        headStyles: {
            fillColor: teal,
            textColor: 255,
            fontSize: 9,
            halign: 'center',
            cellPadding: 2
        },
        styles: {
            fontSize: 8,
            textColor: black,
            cellPadding: 2,
            lineColor: [200, 200, 200],
            lineWidth: 0.1
        },
        columnStyles: {
            0: { halign: 'center', cellWidth: 12 },
            1: { halign: 'left' },
            2: { halign: 'center', cellWidth: 20 },
            3: { halign: 'center', cellWidth: 15 },
            4: { halign: 'right', cellWidth: 25 },
            5: { halign: 'right', cellWidth: 30 }
        }
    });

    // ── Summary / Footer ─────────────────────────────
    const finalY = doc.lastAutoTable.finalY;
    const footerTop = Math.max(finalY + 10, 240); 
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(...teal);
    doc.text('Payments Details', MARGIN, footerTop - 2);
    
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.1);
    doc.rect(MARGIN, footerTop, 100, 35);
    
    doc.setFontSize(8);
    doc.setTextColor(...black);
    doc.setFont('helvetica', 'normal');
    doc.text(`Bank name : ${data.company.bank || 'N/A'}`, MARGIN + 2, footerTop + 6);
    doc.text(`Acc Holder Name : ${data.company.name}`, MARGIN + 2, footerTop + 13);
    doc.text(`IFSC Code : ${data.company.ifsc || 'N/A'}`, MARGIN + 2, footerTop + 20);
    doc.text(`UPI ID : ${data.company.phone}`, MARGIN + 2, footerTop + 27);

    const totalsX = 110;
    doc.rect(totalsX, footerTop, RIGHT - totalsX, 35);
    
    const summaryRow = (label, value, y, bold = false) => {
        doc.setFont('helvetica', bold ? 'bold' : 'normal');
        doc.text(label, RIGHT - 40, y, { align: 'right' });
        doc.text(value, RIGHT - 2, y, { align: 'right' });
    };

    summaryRow('Net Total:', cur(data.subtotal), footerTop + 6);
    summaryRow('Discount With Total:', cur(data.discount), footerTop + 13);
    summaryRow('Package Charge:', '0.00', footerTop + 20);
    
    doc.line(totalsX, footerTop + 24, RIGHT, footerTop + 24);
    summaryRow('Total:', cur(data.total), footerTop + 30, true);

    doc.setFontSize(7);
    doc.setTextColor(...gray);
    doc.text('Page 1 of 1', centerX, 292, { align: 'center' });

    return saveDoc(doc, data.invoiceNo);
}

/* ─── HELPERS ───────────────────────────────────────────── */

function finishDoc(doc, data, colors, finalY) {
    doc.setFontSize(9);
    doc.setTextColor(150, 150, 150);
    doc.text('FOOTER:', 20, finalY);
    doc.text(data.footer, 20, finalY + 5, { maxWidth: 170 });

    doc.setDrawColor(...colors.primary);
    doc.line(140, 260, 190, 260);
    doc.text('Authorized Signature', 165, 265, { align: 'center' });
    doc.text('THANK YOU FOR YOUR BUSINESS', 105, 285, { align: 'center' });
}

function saveDoc(doc, invoiceNo) {
    doc.save(`Invoice_${invoiceNo}.pdf`);
    return doc.output('blob');
}
