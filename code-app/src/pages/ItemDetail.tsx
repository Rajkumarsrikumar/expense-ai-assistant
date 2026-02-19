import { useNavigate, useLocation } from 'react-router-dom';
import type { PendingItem } from '../types';
import styles from './ItemDetail.module.css';

export default function ItemDetail() {
  const navigate = useNavigate();
  const location = useLocation();
  const item = (location.state as { item?: PendingItem })?.item;

  if (!item) {
    navigate('/home', { replace: true });
    return null;
  }

  const isCompleted = item.status === 'QC Completed';

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
        <h1 className={styles.title}>Item details</h1>
      </header>
      <main className={styles.main}>
        <dl className={styles.dl}>
          <dt>PO No.</dt>
          <dd>{item.poNo}</dd>
          <dt>Invoice No.</dt>
          <dd>{item.invoiceNo}</dd>
          <dt>Supplier</dt>
          <dd>{item.supplier}</dd>
          <dt>Date Received</dt>
          <dd>{item.dateReceived}</dd>
          <dt>Status</dt>
          <dd>
            <span
              className={
                isCompleted ? styles.statusCompleted : styles.statusPending
              }
            >
              {item.status}
            </span>
          </dd>
        </dl>
      </main>
    </div>
  );
}
