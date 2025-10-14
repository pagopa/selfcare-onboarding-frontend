import { DefaultComponentProps } from '@mui/material/OverridableComponent';
import { SvgIconTypeMap } from '@mui/material/SvgIcon';
import { User } from '@pagopa/selfcare-common-frontend/lib/model/User';
import { UserRole } from '@pagopa/selfcare-common-frontend/lib/utils/constants';
import { AxiosRequestConfig } from 'axios';
import { FunctionComponent, SVGProps } from 'react';
import { AooData } from './src/model/AooData';
import { AssistanceContacts } from './src/model/AssistanceContacts';
import { CompanyInformations } from './src/model/CompanyInformations';
import { GeographicTaxonomy } from './src/model/GeographicTaxonomies';
import { OnboardingFormData } from './src/model/OnboardingFormData';
import { PDNDBusinessResource } from './src/model/PDNDBusinessResource';
import { UoData } from './src/model/UoModel';
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

export type RequestOutcomeComplete =
  | 'success'
  | 'error'
  | 'toBeCompleted'
  | 'alreadyCompleted'
  | 'alreadyRejected'
  | 'expired'
  | 'notFound';

export type RequestOutcomeMessage = {
  title: string;
  description: Array<JSX.Element>;
  img?: Image;
  ImgComponent?:
    | FunctionComponent<SVGProps<SVGSVGElement>>
    | ((props: DefaultComponentProps<SvgIconTypeMap>) => JSX.Element);
};
export type RequestOutcomeOptions = { [key in RequestOutcome]: RequestOutcomeMessage };
export type RequestOutcomeOptionsJwt = { [key in RequestOutcomeComplete]: RequestOutcomeMessage };

/*
 * Onboarding component
 */
export type StepperStepComponentProps = {
  product?: Product | null;
  forward?: any;
  back?: any;
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
export type ProductStatus = 'ACTIVE' | 'INACTIVE' | 'PHASE_OUT' | 'TESTING';

export interface UserOnCreate extends User {
  from?: string; // This is temporary, part of the API shared with self-care
  role?: PartyRole;
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

export interface ProblemUserValidate {
  title: string;
  status: number;
  detail: string;
  instance: string;
  invalidParams?: Array<{ name: string; reason: string }>;
}

export interface ProblemError {
  code: string;
  detail: string;
}

export type Product = {
  id: string;
  title: string;
  status: ProductStatus;
  parentId?: string;
};

export type PartyData = IPACatalogParty &
  Party &
  AooData &
  UoData &
  InsuranceCompanyResource &
  ANACParty &
  PDNDBusinessResource &
  OnboardedParty;

export type SelfcareParty = {
  id: string;
  description: string;
  userRole: UserRole;
  urlLogo?: string;
};

export type Party = {
  originId: string;
  externalId: string;
  registeredOffice: string;
  zipCode: string;
  description: string;
  digitalAddress: string;
  taxCode: string;
  origin: string;
  // indirizzo mail supporto
  supportEmail?: string;
  istatCode?: string;
  registerType?: string;
};

export type OnboardedParty = {
  id: string;
  description: string;
  parentDescription: string;
  originId: string;
  institutionType: string;
  digitalAddress: string;
  address: string;
  zipCode: string;
  taxCode: string;
  origin: string;
};

export type InstitutionData = {
  id: string;
  billingData: OnboardingFormData;
  institutionType: InstitutionType;
  origin: string;
  originId: string;
  paymentServiceProvider?: PaymentServiceProviderDto;
  dataProtectionOfficer?: DataProtectionOfficerDto;
  companyInformations?: CompanyInformations;
  assistanceContacts?: AssistanceContacts;
  geographicTaxonomies?: Array<GeographicTaxonomy>;
  country?: string;
  county?: string;
  city?: string;
};

export type DataProtectionOfficerDto = {
  email?: string;
  address?: string;
  pec?: string;
};

export type PaymentServiceProviderDto = {
  businessRegisterNumber: string;
  legalRegisterName: string;
  legalRegisterNumber: string;
  abiCode: string;
  vatNumberGroup: boolean;
};

export type InstitutionOnboardingInfoResource = {
  geographicTaxonomies: Array<GeographicTaxonomy>;
  institution: InstitutionData;
};

export type InstitutionType = 'PA' | 'GSP' | 'SCP' | 'PT' | 'PSP' | 'SA' | 'AS' | 'PRV' | 'GPU' | 'SCEC' | 'PRV_PF';

export type ANACParty = {
  description: string;
  digitalAddress: string;
  id: string;
  originId: string;
  taxCode: string;
  anacEnabled?: boolean;
  anacEngaged?: boolean;
};

export type StationResource = {
  count: number;
  items: Array<ANACParty>;
};
export type InsuranceCompanyResource = {
  address: string;
  description: string;
  digitalAddress: string;
  id: string;
  origin: string;
  originId: string;
  istatCode?: string;
  registerType: string;
  workType: string;
  taxCode?: string;
};

export type InsuranceCompaniesResource = {
  count: number;
  items: Array<InsuranceCompanyResource>;
};

export type OnboardingRequestData = {
  productId: string;
  status: string;
  expiringDate: string;
};
