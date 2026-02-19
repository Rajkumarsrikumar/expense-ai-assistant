import type { Team, PendingItem } from '../types';

export const MOCK_TEAMS: Team[] = [
  { id: '1', teamName: 'DR Team', imageUrl: '' },
  { id: '2', teamName: 'QA Team', imageUrl: '' },
  { id: '3', teamName: 'R&D Team', imageUrl: '' },
  { id: '4', teamName: 'Air Force Team', imageUrl: '' },
];

export const MOCK_PENDING_ITEMS: PendingItem[] = [
  { id: '1', poNo: 'PO-2025-INV-008-00123', invoiceNo: '772', supplier: 'Boeing Defense Systems', dateReceived: '20 Dec 2025, 09:15 AM', status: 'Pending Receipt Processing' },
  { id: '2', poNo: 'PO-2025-INV-007-00122', invoiceNo: '771', supplier: 'Acme Corp', dateReceived: '19 Dec 2025, 02:30 PM', status: 'Pending Receipt Processing' },
  { id: '3', poNo: 'PO-2025-INV-006-00121', invoiceNo: '770', supplier: 'Defense Supplies Ltd', dateReceived: '18 Dec 2025, 11:00 AM', status: 'QC Completed' },
  { id: '4', poNo: 'PO-2025-INV-005-00120', invoiceNo: '769', supplier: 'Boeing Defense Systems', dateReceived: '17 Dec 2025, 10:00 AM', status: 'Pending Receipt Processing' },
  { id: '5', poNo: 'PO-2025-INV-004-00119', invoiceNo: '768', supplier: 'Acme Corp', dateReceived: '16 Dec 2025, 03:00 PM', status: 'Pending Receipt Processing' },
  { id: '6', poNo: 'PO-2025-INV-003-00118', invoiceNo: '767', supplier: 'Defense Supplies Ltd', dateReceived: '15 Dec 2025, 11:30 AM', status: 'QC Completed' },
  { id: '7', poNo: 'PO-2025-INV-002-00117', invoiceNo: '766', supplier: 'Boeing Defense Systems', dateReceived: '14 Dec 2025, 09:00 AM', status: 'Pending Receipt Processing' },
];
