import React, { useState, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useCreateIncome, useCreateBill, getListIncomeQueryKey, getListBillsQueryKey, getGetDashboardQueryKey } from '@workspace/api-client-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  mode: 'income' | 'bills';
}

interface ParsedRow {
  [key: string]: string;
}

function parseCsv(text: string): ParsedRow[] {
  const lines = text.trim().split('\n');
  if (lines.length < 2) return [];
  const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/"/g, ''));
  return lines.slice(1).map(line => {
    const cols = line.split(',').map(c => c.trim().replace(/"/g, ''));
    const row: ParsedRow = {};
    headers.forEach((h, i) => { row[h] = cols[i] || ''; });
    return row;
  }).filter(r => Object.values(r).some(v => v));
}

export default function CsvImportModal({ open, onOpenChange, mode }: Props) {
  const queryClient = useQueryClient();
  const createIncome = useCreateIncome();
  const createBill = useCreateBill();
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<ParsedRow[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [fileName, setFileName] = useState('');
  const [importing, setImporting] = useState(false);

  const validateRows = (rows: ParsedRow[]): { valid: ParsedRow[]; errs: string[] } => {
    const valid: ParsedRow[] = [];
    const errs: string[] = [];

    rows.forEach((row, i) => {
      const lineNo = i + 2;
      if (mode === 'income') {
        const amount = parseFloat(row.amount);
        if (isNaN(amount) || amount <= 0) { errs.push(`Row ${lineNo}: invalid amount "${row.amount}"`); return; }
        if (!row.date || !/^\d{4}-\d{2}-\d{2}$/.test(row.date)) { errs.push(`Row ${lineNo}: invalid date "${row.date}" (use YYYY-MM-DD)`); return; }
        valid.push(row);
      } else {
        const amount = parseFloat(row.amount);
        if (isNaN(amount) || amount <= 0) { errs.push(`Row ${lineNo}: invalid amount "${row.amount}"`); return; }
        if (!row.name && !row['bill name']) { errs.push(`Row ${lineNo}: missing name`); return; }
        valid.push(row);
      }
    });

    return { valid, errs };
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const rows = parseCsv(text);
      const { valid, errs } = validateRows(rows);
      setPreview(valid.slice(0, 5));
      setErrors(errs);
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    if (!fileRef.current?.files?.[0]) return;
    setImporting(true);
    const text = await fileRef.current.files[0].text();
    const rows = parseCsv(text);
    const { valid } = validateRows(rows);

    let imported = 0;
    for (const row of valid) {
      try {
        if (mode === 'income') {
          await createIncome.mutateAsync({ data: { amount: Number(row.amount), source: row.source || '', date: row.date, category: row.category || 'other' } });
        } else {
          await createBill.mutateAsync({ data: { amount: Number(row.amount), name: row.name || row['bill name'] || '', category: row.category || 'miscellaneous' } });
        }
        imported++;
      } catch { /* skip invalid rows */ }
    }

    queryClient.invalidateQueries({ queryKey: getListIncomeQueryKey() });
    queryClient.invalidateQueries({ queryKey: getListBillsQueryKey() });
    queryClient.invalidateQueries({ queryKey: getGetDashboardQueryKey() });

    toast({ description: `Imported ${imported} ${mode === 'income' ? 'income entries' : 'bills'}.` });
    setImporting(false);
    setPreview([]);
    setErrors([]);
    setFileName('');
    onOpenChange(false);
  };

  const reset = () => { setPreview([]); setErrors([]); setFileName(''); if (fileRef.current) fileRef.current.value = ''; };

  return (
    <Sheet open={open} onOpenChange={(o) => { if (!o) reset(); onOpenChange(o); }}>
      <SheetContent side="bottom" className="rounded-t-2xl bg-paper-raised border-border px-6 py-6 font-sans max-h-[80vh] overflow-y-auto">
        <SheetHeader className="mb-6 text-left">
          <SheetTitle className="font-serif text-2xl text-ink">Import from CSV</SheetTitle>
          <SheetDescription className="text-gray font-sans text-sm">
            {mode === 'income'
              ? 'Upload a CSV with columns: source, amount, date (YYYY-MM-DD), category'
              : 'Upload a CSV with columns: name, amount, category'}
          </SheetDescription>
        </SheetHeader>

        <div
          className="border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer hover:border-gray transition-colors mb-4"
          onClick={() => fileRef.current?.click()}
        >
          <Upload className="w-6 h-6 text-gray mx-auto mb-2" />
          <p className="font-mono text-xs text-gray uppercase tracking-wider">
            {fileName ? fileName : 'Click to choose a CSV file'}
          </p>
          <input ref={fileRef} type="file" accept=".csv,text/csv" className="hidden" onChange={handleFile} />
        </div>

        {errors.length > 0 && (
          <div className="mb-4 p-3 bg-coral/10 border border-coral/30 rounded-xl">
            <p className="font-mono text-xs text-coral uppercase mb-2">Validation issues</p>
            {errors.map((e, i) => <p key={i} className="text-xs text-coral font-sans">{e}</p>)}
          </div>
        )}

        {preview.length > 0 && (
          <div className="mb-4">
            <p className="font-mono text-[10px] uppercase text-gray mb-2">Preview (first {preview.length} rows)</p>
            <div className="bg-paper rounded-xl border border-border/50 overflow-hidden">
              {preview.map((row, i) => (
                <div key={i} className="flex justify-between items-center px-4 py-2 border-b border-border/50 border-dashed last:border-0 text-xs">
                  <span className="font-sans text-ink">{row.source || row.name || row['bill name'] || '—'}</span>
                  <span className="font-mono text-teal">{row.amount}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <Button variant="outline" className="flex-1 border-border/50 text-ink bg-transparent" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button
            className="flex-1 bg-ink hover:bg-ink/90 text-paper font-medium"
            onClick={handleImport}
            disabled={!fileName || errors.length > 0 || importing || preview.length === 0}
          >
            {importing ? 'Importing...' : `Import ${preview.length > 0 ? preview.length + '+' : ''} rows`}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
