import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Team, PendingItem, PendingItemStatus } from '../types';
import styles from './AcceptInventory.module.css';

const STATUS_OPTIONS: PendingItemStatus[] = [
  'Pending Receipt Processing',
  'QC Completed',
  'Damaged',
  'Unprocessed',
  'Missing Data',
];

interface AcceptInventoryProps {
  currentTeam: Team;
  onAdd: (item: Omit<PendingItem, 'id'>) => void;
}

export default function AcceptInventory({ onAdd }: AcceptInventoryProps) {
  const navigate = useNavigate();
  const [poNo, setPoNo] = useState('');
  const [invoiceNo, setInvoiceNo] = useState('');
  const [supplier, setSupplier] = useState('');
  const [dateReceived, setDateReceived] = useState('');
  const [status, setStatus] = useState<PendingItemStatus>('Pending Receipt Processing');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!poNo.trim() || !invoiceNo.trim() || !supplier.trim() || !dateReceived.trim()) return;
    onAdd({
      poNo: poNo.trim(),
      invoiceNo: invoiceNo.trim(),
      supplier: supplier.trim(),
      dateReceived: dateReceived.trim(),
      status,
    });
    navigate('/home');
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <button
          type="button"
          className={styles.backBtn}
          onClick={() => navigate('/home')}
        >
          ← Back
        </button>
        <h1 className={styles.title}>Accept New Inventory</h1>
      </header>
      <main className={styles.main}>
        <form onSubmit={handleSubmit} className={styles.form}>
          <label className={styles.label}>
            PO No.
            <input
              type="text"
              value={poNo}
              onChange={(e) => setPoNo(e.target.value)}
              className={styles.input}
              required
              placeholder="e.g. PO-2025-INV-008-00123"
            />
          </label>
          <label className={styles.label}>
            Invoice No.
            <input
              type="text"
              value={invoiceNo}
              onChange={(e) => setInvoiceNo(e.target.value)}
              className={styles.input}
              required
              placeholder="e.g. 772"
            />
          </label>
          <label className={styles.label}>
            Supplier
            <input
              type="text"
              value={supplier}
              onChange={(e) => setSupplier(e.target.value)}
              className={styles.input}
              required
              placeholder="e.g. Boeing Defense Systems"
            />
          </label>
          <label className={styles.label}>
            Date Received
            <input
              type="text"
              value={dateReceived}
              onChange={(e) => setDateReceived(e.target.value)}
              className={styles.input}
              required
              placeholder="e.g. 20 Dec 2025, 09:15 AM"
            />
          </label>
          <label className={styles.label}>
            Status
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as PendingItemStatus)}
              className={styles.select}
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>
          <div className={styles.actions}>
            <button type="button" className={styles.cancelBtn} onClick={() => navigate('/home')}>
              Cancel
            </button>
            <button type="submit" className={styles.submitBtn}>
              Submit
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
