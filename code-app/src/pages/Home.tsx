import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Team, PendingItem } from '../types';
import styles from './Home.module.css';

const STATUS_OPTIONS = ['All Status', 'Pending Receipt Processing', 'QC Completed'] as const;

interface HomeProps {
  currentTeam: Team;
  pendingItems: PendingItem[];
  kpiItems: number;
  kpiDamaged: number;
  kpiUnprocessed: number;
  kpiMissingData: number;
  pageSize: number;
}

export default function Home({
  currentTeam,
  pendingItems,
  kpiItems,
  kpiDamaged,
  kpiUnprocessed,
  kpiMissingData,
  pageSize,
}: HomeProps) {
  const navigate = useNavigate();
  const [navOpen, setNavOpen] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All Status');
  const [pageIndex, setPageIndex] = useState(1);

  const filtered = useMemo(() => {
    return pendingItems.filter((p) => {
      const matchSearch =
        !search ||
        p.poNo.toLowerCase().includes(search.toLowerCase()) ||
        p.supplier.toLowerCase().includes(search.toLowerCase());
      const matchStatus =
        statusFilter === 'All Status' || p.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [pendingItems, search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const start = (pageIndex - 1) * pageSize;
  const pageItems = useMemo(
    () => filtered.slice(start, start + pageSize),
    [filtered, start, pageSize]
  );

  const handleRowClick = (item: PendingItem) => {
    navigate(`/item/${item.id}`, { state: { item } });
  };

  return (
    <div className={styles.layout}>
      <header className={styles.appBar}>
        <button
          type="button"
          className={styles.menuBtn}
          onClick={() => setNavOpen(!navOpen)}
          aria-label="Toggle menu"
        >
          ☰
        </button>
        <div className={styles.appBarLogo}>
          <svg width="24" height="24" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
            <path d="M16 2L18 14H30L20 22L24 30L16 26L8 30L12 22L2 14H14L16 2Z" fill="#fff"/>
          </svg>
          <span>ST Engineering</span>
        </div>
        <div className={styles.appBarUser}>
          <span className={styles.userName}>Michelle Tay</span>
          <span className={styles.teamName}>{currentTeam.teamName}</span>
        </div>
        <button type="button" className={styles.iconBtn} aria-label="Search">
          🔍
        </button>
      </header>

      <aside className={`${styles.sideNav} ${navOpen ? styles.sideNavOpen : ''}`}>
        <nav>
          <div className={styles.navItemActive}>Home</div>
        </nav>
      </aside>

      <main className={styles.main}>
        <h2 className={styles.sectionTitle}>Home</h2>

        <div className={styles.kpiGrid}>
          <div className={`${styles.kpiCard} ${styles.kpiCardRed}`}>
            <span className={styles.kpiIcon} aria-hidden>👤</span>
            <span className={styles.kpiValue}>{kpiItems}</span>
            <span className={styles.kpiLabel}>Items</span>
          </div>
          <div className={`${styles.kpiCard} ${styles.kpiCardDark}`}>
            <span className={styles.kpiIcon} aria-hidden>📦</span>
            <span className={styles.kpiValue}>{kpiDamaged}</span>
            <span className={styles.kpiLabel}>Damaged Items</span>
          </div>
          <div className={`${styles.kpiCard} ${styles.kpiCardBlue}`}>
            <span className={styles.kpiIcon} aria-hidden>@</span>
            <span className={styles.kpiValue}>{kpiUnprocessed}</span>
            <span className={styles.kpiLabel}>Unprocessed</span>
          </div>
          <div className={`${styles.kpiCard} ${styles.kpiCardGrey}`}>
            <span className={styles.kpiIcon} aria-hidden>↓</span>
            <span className={styles.kpiValue}>{kpiMissingData}</span>
            <span className={styles.kpiLabel}>Missing Data</span>
          </div>
        </div>

        <button
          type="button"
          className={styles.acceptBtn}
          onClick={() => navigate('/accept')}
        >
          <span aria-hidden>+</span> Accept New Inventory
        </button>

        <h3 className={styles.tableTitle}>New Items Pending Checks</h3>
        <div className={styles.toolbar}>
          <input
            type="text"
            placeholder="Search..."
            className={styles.searchInput}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPageIndex(1);
            }}
          />
          <select
            className={styles.statusSelect}
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPageIndex(1);
            }}
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>PO No.</th>
                <th>Invoice No.</th>
                <th>Supplier</th>
                <th>Date Received</th>
                <th>Status</th>
                <th aria-hidden />
              </tr>
            </thead>
            <tbody>
              {pageItems.map((item) => (
                <tr
                  key={item.id}
                  onClick={() => handleRowClick(item)}
                  className={styles.rowClickable}
                >
                  <td>{item.poNo}</td>
                  <td>{item.invoiceNo}</td>
                  <td>{item.supplier}</td>
                  <td>{item.dateReceived}</td>
                  <td>
                    <span
                      className={
                        item.status === 'QC Completed'
                          ? styles.statusCompleted
                          : styles.statusPending
                      }
                    >
                      {item.status}
                    </span>
                  </td>
                  <td>→</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className={styles.pagination}>
          <span className={styles.paginationLabel}>
            {filtered.length === 0
              ? '0 entries'
              : `${start + 1} to ${Math.min(start + pageSize, filtered.length)} of ${filtered.length} entries`}
          </span>
          <div className={styles.paginationBtns}>
            <button
              type="button"
              disabled={pageIndex <= 1}
              onClick={() => setPageIndex(1)}
            >
              ««
            </button>
            <button
              type="button"
              disabled={pageIndex <= 1}
              onClick={() => setPageIndex((p) => Math.max(1, p - 1))}
            >
              «
            </button>
            <span className={styles.pageNum}>{pageIndex}</span>
            <button
              type="button"
              disabled={pageIndex >= totalPages}
              onClick={() => setPageIndex((p) => Math.min(totalPages, p + 1))}
            >
              »
            </button>
            <button
              type="button"
              disabled={pageIndex >= totalPages}
              onClick={() => setPageIndex(totalPages)}
            >
              »»
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
