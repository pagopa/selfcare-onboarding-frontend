import { AxiosRequestConfig } from 'axios';
import { API } from './src/lib/constants';

/*
 * Fetch data and router related types
 */
export type ApiEndpointKey = keyof typeof API;

export type Endpoint = {
  endpoint: ApiEndpointKey;
  endpointParams?: any;
};

export type RequestConfig = {
  path: Endpoint;
  config: AxiosRequestConfig;
};

export type RoutesObject = { [key: string]: RouteConfig };

export type RouteConfig = {
  PATH: string;
  LABEL: string;
  EXACT?: boolean;
  SUBROUTES?: RoutesObject;
  COMPONENT?: React.FunctionComponent<any>;
};

export type Image = { src: string; alt: string };
export type RequestOutcome = 'success' | 'error';
export type RequestOutcomeMessage = { title: string; description: JSX.Element[]; img: Image };
export type RequestOutcomeOptions = { [key in RequestOutcome]: RequestOutcomeMessage };

/*
 * Onboarding component
 */
export type StepperStepComponentProps = {
  forward?: any;
  back?: VoidFunction;
  updateFormData?: React.Dispatch<React.SetStateAction<any>>;
};

export type StepperStep = {
  label: string;
  Component: React.FunctionComponent<StepperStepComponentProps>;
};

export type IPACatalogParty = {
  description: string;
  digitalAddress: string;
  id: string;
  managerName: string;
  managerSurname: string;
  o: string;
  ou: string;
};

/*
 * Platform user and party
 */
export type UserStatus = 'active' | 'suspended';
export type UserRole = 'Manager' | 'Delegate' | 'Operator';
export type UserPlatformRole = 'admin' | 'security' | 'api';

export type UserOnCreate = {
  name: string;
  surname: string;
  taxCode: string; // This should not be optional, it is temporarily because of the "from" below
  from?: string; // This is temporary, part of the API shared with self-care
  email: string;
  role: UserRole;
  platformRole: UserPlatformRole;
};

export type User = UserOnCreate & {
  status: UserStatus;
};

export type Party = {
  status: 'Pending' | 'Active';
  description: string;
  institutionId: string;
  digitalAddress: string;
  role: UserRole;
  platformRole: UserPlatformRole;
  partyId?: string;
  attributes: string[];
};

export type DocUpload = {
  files: Array<File>;
};

export type AlertDialogActions = {
  setDialogTitle: (t: string) => void;
  setDialogDescription: (t: string) => void;
  setShowDialog: (t: boolean) => void;
  handleCloseDialog?: (t: any) => void;
};
