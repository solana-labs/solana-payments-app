import * as yup_lib_string from 'yup/lib/string';
import * as yup from 'yup';
import { InferType } from 'yup';
import * as yup_lib_types from 'yup/lib/types';
import * as yup_lib_object from 'yup/lib/object';

declare let appInstallQueryParmSchema: yup.ObjectSchema<yup_lib_object.Assign<yup_lib_object.ObjectShape, {
    hmac: yup.StringSchema<string | undefined, yup_lib_types.AnyObject, string | undefined>;
    shop: yup_lib_string.RequiredStringSchema<string | undefined, yup_lib_types.AnyObject>;
    timestamp: yup_lib_string.RequiredStringSchema<string | undefined, yup_lib_types.AnyObject>;
}>, yup_lib_object.AnyObject, yup_lib_object.TypeOfShape<yup_lib_object.Assign<yup_lib_object.ObjectShape, {
    hmac: yup.StringSchema<string | undefined, yup_lib_types.AnyObject, string | undefined>;
    shop: yup_lib_string.RequiredStringSchema<string | undefined, yup_lib_types.AnyObject>;
    timestamp: yup_lib_string.RequiredStringSchema<string | undefined, yup_lib_types.AnyObject>;
}>>, yup_lib_object.AssertsShape<yup_lib_object.Assign<yup_lib_object.ObjectShape, {
    hmac: yup.StringSchema<string | undefined, yup_lib_types.AnyObject, string | undefined>;
    shop: yup_lib_string.RequiredStringSchema<string | undefined, yup_lib_types.AnyObject>;
    timestamp: yup_lib_string.RequiredStringSchema<string | undefined, yup_lib_types.AnyObject>;
}>>>;
type AppInstallQueryParam = InferType<typeof appInstallQueryParmSchema>;

declare let appRedirectQueryParmSchema: yup.ObjectSchema<yup_lib_object.Assign<yup_lib_object.ObjectShape, {
    code: yup_lib_string.RequiredStringSchema<string | undefined, yup_lib_types.AnyObject>;
    hmac: yup.StringSchema<string | undefined, yup_lib_types.AnyObject, string | undefined>;
    shop: yup_lib_string.RequiredStringSchema<string | undefined, yup_lib_types.AnyObject>;
    host: yup_lib_string.RequiredStringSchema<string | undefined, yup_lib_types.AnyObject>;
    state: yup_lib_string.RequiredStringSchema<string | undefined, yup_lib_types.AnyObject>;
    timestamp: yup_lib_string.RequiredStringSchema<string | undefined, yup_lib_types.AnyObject>;
}>, yup_lib_object.AnyObject, yup_lib_object.TypeOfShape<yup_lib_object.Assign<yup_lib_object.ObjectShape, {
    code: yup_lib_string.RequiredStringSchema<string | undefined, yup_lib_types.AnyObject>;
    hmac: yup.StringSchema<string | undefined, yup_lib_types.AnyObject, string | undefined>;
    shop: yup_lib_string.RequiredStringSchema<string | undefined, yup_lib_types.AnyObject>;
    host: yup_lib_string.RequiredStringSchema<string | undefined, yup_lib_types.AnyObject>;
    state: yup_lib_string.RequiredStringSchema<string | undefined, yup_lib_types.AnyObject>;
    timestamp: yup_lib_string.RequiredStringSchema<string | undefined, yup_lib_types.AnyObject>;
}>>, yup_lib_object.AssertsShape<yup_lib_object.Assign<yup_lib_object.ObjectShape, {
    code: yup_lib_string.RequiredStringSchema<string | undefined, yup_lib_types.AnyObject>;
    hmac: yup.StringSchema<string | undefined, yup_lib_types.AnyObject, string | undefined>;
    shop: yup_lib_string.RequiredStringSchema<string | undefined, yup_lib_types.AnyObject>;
    host: yup_lib_string.RequiredStringSchema<string | undefined, yup_lib_types.AnyObject>;
    state: yup_lib_string.RequiredStringSchema<string | undefined, yup_lib_types.AnyObject>;
    timestamp: yup_lib_string.RequiredStringSchema<string | undefined, yup_lib_types.AnyObject>;
}>>>;
type AppRedirectQueryParam = InferType<typeof appRedirectQueryParmSchema>;

declare let accessTokenResponseSchema: yup.ObjectSchema<yup_lib_object.Assign<yup_lib_object.ObjectShape, {
    access_token: yup_lib_string.RequiredStringSchema<string | undefined, yup_lib_types.AnyObject>;
    scope: yup_lib_string.RequiredStringSchema<string | undefined, yup_lib_types.AnyObject>;
}>, yup_lib_object.AnyObject, yup_lib_object.TypeOfShape<yup_lib_object.Assign<yup_lib_object.ObjectShape, {
    access_token: yup_lib_string.RequiredStringSchema<string | undefined, yup_lib_types.AnyObject>;
    scope: yup_lib_string.RequiredStringSchema<string | undefined, yup_lib_types.AnyObject>;
}>>, yup_lib_object.AssertsShape<yup_lib_object.Assign<yup_lib_object.ObjectShape, {
    access_token: yup_lib_string.RequiredStringSchema<string | undefined, yup_lib_types.AnyObject>;
    scope: yup_lib_string.RequiredStringSchema<string | undefined, yup_lib_types.AnyObject>;
}>>>;
interface AccessTokenResponse extends InferType<typeof accessTokenResponseSchema> {
}

declare const verifyShopifyInstallRequest: (appInstallQuery: any) => void;
declare const parseAppInstallQueryParms: (appInstallQuery: any) => AppInstallQueryParam;
declare const parseAppRedirectQueryParms: (appRedirectQuery: any) => AppRedirectQueryParam;
declare const createShopifyOAuthGrantRedirectUrl: (shop: string, nonce: string) => string;
declare const createScopeString: (scopes: ShopifyScope[]) => string;
declare enum ShopifyScope {
    WRITE_PAYMENT_GATEWAYS = "write_payment_gateways",
    WRITE_PAYMENT_SESSIONS = "write_payment_sessions"
}
declare const verifyShopifyRedirectRequest: (appRedirectQuery: any) => void;
declare const fetchAccessToken: (shop: string, authCode: string) => Promise<AccessTokenResponse>;
declare const accessTokenEndpoint: (shop: string, authCode: string) => string;

export { ShopifyScope, accessTokenEndpoint, createScopeString, createShopifyOAuthGrantRedirectUrl, fetchAccessToken, parseAppInstallQueryParms, parseAppRedirectQueryParms, verifyShopifyInstallRequest, verifyShopifyRedirectRequest };
