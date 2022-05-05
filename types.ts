import { SvgIconTypeMap } from '@mui/material/SvgIcon';
import { DefaultComponentProps } from '@mui/material/OverridableComponent';
import { AxiosRequestConfig } from 'axios';
import { FunctionComponent, SVGProps } from 'react';
import { API } from './src/utils/constants';

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
export type RequestOutcomeMessage = {
  title: string;
  description: Array<JSX.Element>;
  img?: Image;
  ImgComponent?:
    | FunctionComponent<SVGProps<SVGSVGElement>>
    | ((props: DefaultComponentProps<SvgIconTypeMap>) => JSX.Element);
};
export type RequestOutcomeOptions = { [key in RequestOutcome]: RequestOutcomeMessage };

/*
 * Onboarding component
 */
export type StepperStepComponentProps = {
  product?: Product | null;
  forward?: any;
  back?: VoidFunction;
  updateFormData?: React.Dispatch<React.SetStateAction<any>>;
};

export type StepperStep = {
  label: string;
  Component: React.FunctionComponent<StepperStepComponentProps>;
};

export type IPACatalogParty = {
  address: string;
  category: string;
  description: string;
  digitalAddress: string;
  id: string;
  o: string;
  origin: string;
  originId: string;
  taxCode: string;
  zipCode: string;
};

/*
 * Platform user and party
 */
export type UserStatus = 'ACTIVE' | 'SUSPENDED';
export type PartyRole = 'MANAGER' | 'DELEGATE' | 'SUB_DELEGATE' | 'OPERATOR';
export type UserProductRole = 'ADMIN' | 'LIMITED';

export type UserOnCreate = {
  name: string;
  surname: string;
  taxCode: string; // This should not be optional, it is temporarily because of the "from" below
  from?: string; // This is temporary, part of the API shared with self-care
  email: string;
  role: PartyRole;
};

export type User = {
  uid: string;
  taxCode: string;
  name: string;
  surname: string;
  email: string;
};

export type AlertDialogActions = {
  setDialogTitle: (t: string) => void;
  setDialogDescription: (t: string) => void;
  setShowDialog: (t: boolean) => void;
  handleCloseDialog?: (t: any) => void;
};

export interface OnboardingInfo {
  person: PersonInfo;
  institutions: Array<OnboardingData>;
}

export interface PersonInfo {
  name: string;
  surname: string;
  taxCode: string;
}

export interface OnboardingData {
  id: string;
  externalId: string;
  originId: string;
  institutionType?: string;
  description: string;
  taxCode: string;
  digitalAddress: string;
  state: UserStatus;
  role: PartyRole;
  productInfo: ProductInfo;
  attributes: Array<Attribute>;
}

export interface ProductInfo {
  id: string;
  role: UserProductRole;
  createdAt: Date;
}

export interface Attribute {
  id: string;
  name: string;
  description: string;
}

export interface Problem {
  type: string;
  status: number;
  title: string;
  detail?: string;
  errors: Array<ProblemError>;
}

export interface ProblemError {
  code: string;
  detail: string;
}

export type Product = {
  id: string;
  title: string;
  parentId?: string;
};

export type SelfcareParty = {
  id: string;
  originId: string;
  externalId: string;
  institutionType?: string;
  description: string;
  urlLogo?: string;
  address: string;
  digitalAddress: string;
  taxCode: string;
  zipCode: string;
  origin: string;
};

export type Party = {
  originId: string;
  externalId: string;
  address: string;
  description: string;
  digitalAddress: string;
  taxCode: string;
  origin: string;
};

export type BillingData = {
  // Ragione sociale
  businessName: string;
  // Sede legale
  registeredOffice: string;
  // Indirizzo PEC
  digitalAddress: string;
  // Codice fiscale
  taxCode: string;
  // Partita iva
  vatNumber: string;
  // Codice destinatario
  recipientCode: string;
  // servizi pubblici
  publicServices?: boolean;
};

export type InstitutionData = {
  billingData: BillingData;
  institutionType: InstitutionType;
  origin: string;
};

export type InstitutionOnboardingInfoResource = {
  institution: InstitutionData;
  manager: UserOnCreate;
};

export type InstitutionType = 'PA' | 'GSP' | 'SCP' | 'PT';
