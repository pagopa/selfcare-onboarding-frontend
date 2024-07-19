import { Party } from "../../types";
import { PDNDBusinessResource } from "../model/PDNDBusinessResource";

export const isParty = (party?: Party | PDNDBusinessResource): party is Party => 
    !!(party as Party)?.originId;

export const isPDNDBusinessResource = (party?: Party | PDNDBusinessResource): party is PDNDBusinessResource =>
   !!(party as PDNDBusinessResource)?.businessTaxId;

export const getTaxCode = (selectedParty?: Party | PDNDBusinessResource): string => {
    if (isParty(selectedParty)) {
        return selectedParty.taxCode;
    } else if (isPDNDBusinessResource(selectedParty)) {
        return selectedParty.businessTaxId;
    }
    return '';
};