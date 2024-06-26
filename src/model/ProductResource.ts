import { ProductStatus } from "../../types";

export type ProductResource = {
    id: string;
    parentId: string;
    title: string;
    logo: string;
    logoBgColor: string;
    status: ProductStatus;
};