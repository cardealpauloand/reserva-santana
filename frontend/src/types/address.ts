export interface Address {
  id: string;
  user_id: number;
  name: string;
  phone: string | null;
  zip_code: string;
  street: string;
  number: string;
  complement: string | null;
  neighborhood: string;
  city: string;
  state: string;
  is_default: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CreateAddressData {
  name: string;
  phone?: string;
  zip_code: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  is_default?: boolean;
}
