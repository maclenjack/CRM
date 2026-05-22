import { Visibility } from './enums';

export interface Person {
  id: string;
  name: string;
  organization: string;
  email: string;
  phone: string;
  closedDeals: number;
  openDeals: number;
  labels: string[];
  owner: string;
  visibleTo: Visibility;
}

export interface AddPersonFormData {
  name: string;
  organization: string;
  phones: string[];
  emails: string[];
  labels: string[];
  owner: string;
  visibleTo: Visibility;
}
