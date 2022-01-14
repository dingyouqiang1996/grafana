import { Instance } from '../../Discovery.types';

export interface InstancesTableProps {
  instances: Instance[];
  selectInstance: (arg: any) => void;
  loading: boolean;
  credentials: any;
}
