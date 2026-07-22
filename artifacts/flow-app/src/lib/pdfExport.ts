// @ts-ignore — jspdf-autotable extends jsPDF prototype at runtime
import jsPDF from "jspdf";
// @ts-ignore
import autoTable from "jspdf-autotable";

export interface PdfReportData {
  safeToSpend: number;
  baselineIncome: number;
  totalBills: number;
  bufferBalance: number;
  bufferGoal: number;
  savingsPct: number;
  spendingRate: number;
  dailyBudget: number;
  income: Array<{ source: string; amount: number; date: string; category: string }>;
  bills: Array<{ name: string; amount: number; category: string }>;
  goals: Array<{ name: string; targetAmount: number; currentAmount: number; completed: boolean }>;
  currencySymbol: string;
  formatAmount: (n: number) => string;
}

export function exportPdfReport(data: PdfReportData) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const ink = [27, 36, 48];
  const teal = [47, 110, 99];
  const coral = [193, 88, 74];
  const gold = [201, 162, 39];
  const gray = [139, 144, 152];

  // ── Header bar ──
  doc.setFillColor(27, 36, 48);
  doc.rect(0, 0, pageW, 28, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text("Flow.", 15, 17);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(200, 200, 200);
  doc.text("Financial Report", 15, 24);
  doc.text(`Generated: ${new Date().toLocaleDateString("en-US", { dateStyle: "long" })}`, pageW - 15, 24, { align: "right" });

  let y = 40;

  // ── Summary cards ──
  const cards = [
    { label: "Safe to Spend", value: data.formatAmount(data.safeToSpend), color: teal },
    { label: "Baseline Income", value: data.formatAmount(data.baselineIncome), color: ink },
    { label: "Fixed Bills", value: data.formatAmount(data.totalBills), color: coral },
    { label: "Buffer Balance", value: data.formatAmount(data.bufferBalance), color: gold },
  ];

  const cardW = (pageW - 30 - 12) / 4;
  cards.forEach((card, i) => {
    const x = 15 + i * (cardW + 4);
    doc.setFillColor(248, 248, 246);
    doc.roundedRect(x, y, cardW, 22, 2, 2, "F");
    doc.setTextColor(...(card.color as [number, number, number]));
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text(card.value, x + cardW / 2, y + 10, { align: "center" });
    doc.setTextColor(...(gray as [number, number, number]));
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.text(card.label.toUpperCase(), x + cardW / 2, y + 18, { align: "center" });
  });

  y += 32;

  // ── Insights row ──
  doc.setFontSize(8);
  doc.setTextColor(...(gray as [number, number, number]));
  const insights = [
    `Savings Rate: ${Math.round(data.savingsPct)}%`,
    `Spending Rate: ${Math.round(data.spendingRate)}%`,
    `Daily Budget: ${data.formatAmount(data.dailyBudget)}`,
  ];
  insights.forEach((text, i) => {
    doc.text(text, 15 + i * 62, y);
  });

  y += 12;

  // ── Section: Income ──
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...(ink as [number, number, number]));
  doc.text("Income", 15, y);
  y += 2;

  autoTable(doc, {
    startY: y,
    head: [["Source", "Category", "Date", "Amount"]],
    body: data.income.map((e) => [
      e.source || "Income",
      e.category,
      new Date(e.date + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      data.formatAmount(e.amount),
    ]),
    headStyles: { fillColor: [27, 36, 48], textColor: [255, 255, 255], fontSize: 8, fontStyle: "bold" },
    bodyStyles: { fontSize: 8, textColor: [27, 36, 48] },
    columnStyles: { 3: { halign: "right", textColor: [47, 110, 99] } },
    alternateRowStyles: { fillColor: [248, 248, 246] },
    margin: { left: 15, right: 15 },
    styles: { cellPadding: 3, lineColor: [220, 220, 218], lineWidth: 0.1 },
  });

  y = (doc as any).lastAutoTable.finalY + 10;

  // ── Section: Fixed Bills ──
  if (y > 230) { doc.addPage(); y = 20; }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...(ink as [number, number, number]));
  doc.text("Fixed Bills", 15, y);
  y += 2;

  autoTable(doc, {
    startY: y,
    head: [["Name", "Category", "Monthly Amount"]],
    body: data.bills.map((b) => [b.name, b.category, data.formatAmount(b.amount)]),
    headStyles: { fillColor: [27, 36, 48], textColor: [255, 255, 255], fontSize: 8, fontStyle: "bold" },
    bodyStyles: { fontSize: 8, textColor: [27, 36, 48] },
    columnStyles: { 2: { halign: "right", textColor: [193, 88, 74] } },
    alternateRowStyles: { fillColor: [248, 248, 246] },
    margin: { left: 15, right: 15 },
    styles: { cellPadding: 3, lineColor: [220, 220, 218], lineWidth: 0.1 },
  });

  y = (doc as any).lastAutoTable.finalY + 10;

  // ── Section: Savings Goals ──
  if (data.goals.length > 0) {
    if (y > 220) { doc.addPage(); y = 20; }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(...(ink as [number, number, number]));
    doc.text("Savings Goals", 15, y);
    y += 2;

    autoTable(doc, {
      startY: y,
      head: [["Goal", "Target", "Saved", "Progress", "Status"]],
      body: data.goals.map((g) => {
        const pct = g.targetAmount > 0 ? Math.min(100, Math.round((g.currentAmount / g.targetAmount) * 100)) : 0;
        return [g.name, data.formatAmount(g.targetAmount), data.formatAmount(g.currentAmount), `${pct}%`, g.completed ? "Complete" : "In progress"];
      }),
      headStyles: { fillColor: [27, 36, 48], textColor: [255, 255, 255], fontSize: 8, fontStyle: "bold" },
      bodyStyles: { fontSize: 8, textColor: [27, 36, 48] },
      columnStyles: { 3: { halign: "center" }, 4: { halign: "center" } },
      alternateRowStyles: { fillColor: [248, 248, 246] },
      margin: { left: 15, right: 15 },
      styles: { cellPadding: 3, lineColor: [220, 220, 218], lineWidth: 0.1 },
    });
  }

  // ── Footer ──
  const pageCount = (doc.internal as any).getNumberOfPages();
  for (let p = 1; p <= pageCount; p++) {
    doc.setPage(p);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(...(gray as [number, number, number]));
    doc.text(`Flow · Page ${p} of ${pageCount}`, pageW / 2, 290, { align: "center" });
  }

  doc.save(`flow-report-${new Date().toISOString().split("T")[0]}.pdf`);
}
