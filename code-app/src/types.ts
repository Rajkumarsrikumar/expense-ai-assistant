export interface Team {
  id: string;
  teamName: string;
  imageUrl?: string;
}

export type PendingItemStatus =
  | 'Pending Receipt Processing'
  | 'QC Completed'
  | 'Damaged'
  | 'Unprocessed'
  | 'Missing Data';

export interface PendingItem {
  id: string;
  poNo: string;
  invoiceNo: string;
  supplier: string;
  dateReceived: string;
  status: PendingItemStatus;
}
