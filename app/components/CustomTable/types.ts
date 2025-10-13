export interface TableAddress {
  line1: string;
  line2: string;
  state: string;
  city: string;
  pin: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  linkedin: string;
  gender: string;
  address: TableAddress;
}

export interface CustomTableProps {
  users: User[];
  onEdit: (user: User) => void;
  onDelete?: (id: string) => void;
}
