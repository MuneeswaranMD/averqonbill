import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const generateInvoicePDF = (order, customer) => {
  const doc = new jsPDF({
    orientation: 'p',
    unit: 'mm',
    format: 'a4',
  });

  // Header
  doc.setFontSize(22);
  doc.setTextColor(40, 40, 40);
  doc.text('SMART ORDER', 10, 20);
  
  doc.setFontSize(10);
  doc.text('GSTIN: 33AAAAA0000A1Z5', 10, 28);
  doc.text('Phone: +91 98765 43210', 10, 33);
  doc.text('Email: support@smartorder.com', 10, 38);

  doc.setFontSize(20);
  doc.setTextColor(0, 0, 255);
  doc.text('INVOICE', 160, 20);
  
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`Invoice #: INV-${String(order.id).slice(-6).toUpperCase()}`, 160, 28);
  doc.text(`Date: ${new Date().toLocaleDateString()}`, 160, 33);
  doc.text(`Order ID: ${order.id}`, 160, 38);

  // Customer Details
  doc.setDrawColor(200, 200, 200);
  doc.line(10, 45, 200, 45);
  
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text('Bill To:', 10, 55);
  
  doc.setFontSize(10);
  doc.text(customer.name, 10, 62);
  doc.text(customer.address, 10, 67);
  doc.text(`Phone: ${customer.phone}`, 10, 72);

  // Table
  const tableData = order.items.map((item, index) => [
    index + 1,
    item.name,
    item.price,
    item.qty,
    item.price * item.qty,
  ]);

  autoTable(doc, {
    startY: 85,
    head: [['#', 'Description', 'Price (INR)', 'Qty', 'Amount (INR)']],
    body: tableData,
    theme: 'grid',
    headStyles: { fillColor: [41, 128, 185], textColor: 255 },
    styles: { fontSize: 10, cellPadding: 3 },
    columnStyles: {
      0: { cellWidth: 10 },
      2: { halign: 'right' },
      3: { halign: 'center' },
      4: { halign: 'right' },
    },
  });

  // Totals
  const finalY = doc.lastAutoTable.finalY + 10;
  doc.setFontSize(10);
  doc.text('Subtotal:', 140, finalY);
  doc.text(`INR ${order.totalAmount}`, 180, finalY, { align: 'right' });
  
  doc.text('GST (0%):', 140, finalY + 5);
  doc.text('INR 0.00', 180, finalY + 5, { align: 'right' });
  
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 255);
  doc.text('Grand Total:', 140, finalY + 15);
  doc.text(`INR ${order.totalAmount}`, 180, finalY + 15, { align: 'right' });

  // Footer
  doc.setFontSize(10);
  doc.setTextColor(150, 150, 150);
  doc.text('Thank you for your business!', 105, 280, { align: 'center' });

  // Save/Download
  doc.save(`Invoice_${order.id}.pdf`);
  
  // Return blob for Firebase upload if needed
  return doc.output('blob');
};
