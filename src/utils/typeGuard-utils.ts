import { Party } from "../../types";
import { PDNDBusinessResource } from "../model/PDNDBusinessResource";

export const isParty = (party: Party | PDNDBusinessResource | undefined): party is Party => 
    party !== undefined && (party as Party).originId !== undefined;

export const isPDNDBusinessResource = (party: Party | PDNDBusinessResource | undefined): party is PDNDBusinessResource =>
    party !== undefined && (party as PDNDBusinessResource).businessTaxId !== undefined;

export const getTaxCode = (selectedParty: Party | PDNDBusinessResource | undefined): string | undefined => {
    if (isParty(selectedParty)) {
        return selectedParty.taxCode;
    } else if (isPDNDBusinessResource(selectedParty)) {
        return selectedParty.businessTaxId;
    }
    return undefined;
};