import api from './axios';
import type { Account } from '@/types'; 

const getAccounts = async () : Promise<Account[]> => {
   const {data} = await api.get<Account[]>('/accounts');
   return data;
}

const getAccountById = async (id: string) : Promise<Account> => {
  const {data} = await api.get<Account>(`/accounts/${id}`);
  return data;
}       

export { getAccounts, getAccountById };