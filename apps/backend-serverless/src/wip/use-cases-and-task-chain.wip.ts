import { Body } from 'aws-sdk/clients/s3.js';
import { createErrorResponse, errorResponse } from '../utilities/responses/error-response.utility.js';

type ErrorResponseMethod<T> = (error: unknown) => T;
type ParseAndValidateMethod<T> = (body: unknown) => T;
type CoreUseCaseMethod<HeaderType, BodyType, QueryParameterType, ResponseType, CoreUseCaseDependencyType> = (
    header: HeaderType,
    body: BodyType,
    queryParameter: QueryParameterType,
    dependencies: CoreUseCaseDependencyType
) => ResponseType;

export class ParseAndValidateUseCase<ValidatedType> {
    constructor(private parseAndValidateMethod: ParseAndValidateMethod<ValidatedType>) {}

    parseAndValidate(body: unknown): ValidatedType {
        return this.parseAndValidateMethod(body);
    }
}

type InputValidationUseCaseValidateResponse<HeaderType, BodyType, QueryParameterType> = {
    header: HeaderType;
    body: BodyType;
    queryParameter: QueryParameterType;
};

export class ErrorResponseUseCase<ResponseType> {
    constructor(private errorResponseMethod: ErrorResponseMethod<ResponseType>) {}

    errorResponse(error: unknown): ResponseType {
        return this.errorResponseMethod(error);
    }
}

export class HandlerErrorUseCase<ResponseType> {
    constructor(private errorResponseUseCase: ErrorResponseUseCase<ResponseType>) {}

    error(error: unknown): ResponseType {
        return this.errorResponseUseCase.errorResponse(error);
    }
}

export class InputValidationUseCase<HeaderType, BodyType, QueryParameterType> {
    constructor(
        private headerValidationUseCase: ParseAndValidateUseCase<HeaderType>,
        private bodyValidationUseCase: ParseAndValidateUseCase<BodyType>,
        private queryParameterValidationUseCase: ParseAndValidateUseCase<QueryParameterType>
    ) {}

    validateInputs(
        headerInput: unknown,
        bodyInput: unknown,
        queryParmaterInput: unknown
    ): InputValidationUseCaseValidateResponse<HeaderType, BodyType, QueryParameterType> {
        const header = this.headerValidationUseCase.parseAndValidate(headerInput);
        const body = this.bodyValidationUseCase.parseAndValidate(bodyInput);
        const queryParameter = this.queryParameterValidationUseCase.parseAndValidate(queryParmaterInput);

        return {
            header,
            body,
            queryParameter,
        };
    }
}

// export class HandlerCoreFunctionUseCase<
//     HeaderType,
//     BodyType,
//     QueryParameterType,
//     ResponseType,
//     CoreUseCaseDependencyType
// > {
//     constructor(
//         private coreUseCaseMethod: CoreUseCaseMethod<
//             HeaderType,
//             BodyType,
//             QueryParameterType,
//             ResponseType,
//             CoreUseCaseDependencyType
//         >,
//         private coreUseCaseDependencies: CoreUseCaseDependencyType
//     ) {}

//     coreFunction(
//         header: HeaderType,
//         body: BodyType,
//         queryParameter: QueryParameterType,
//         dependencies: CoreUseCaseDependencyType
//     ): ResponseType {
//         return this.coreUseCaseMethod(header, body, queryParameter, dependencies);
//     }
// }

export interface HandlerCoreFunctionUseCaseInterface<HeaderType, BodyType, QueryParameterType, ResponseType> {
    coreFunction(header: HeaderType, body: BodyType, queryParameter: QueryParameterType): ResponseType;
}

export class HandlerTaskChain<HeaderType, BodyType, QueryParameterType, ResponseType, CoreUseCaseDependencyType> {
    constructor(
        private inputValidateUseCase: InputValidationUseCase<HeaderType, BodyType, QueryParameterType>,
        private handlerCoreFunctionUseCase: HandlerCoreFunctionUseCaseInterface<
            HeaderType,
            BodyType,
            QueryParameterType,
            Promise<ResponseType>
        >,
        private handlerErrorUseCase: HandlerErrorUseCase<ResponseType>
    ) {}

    async completeTaskChain(
        headerInput: unknown,
        bodyInput: unknown,
        parameterInput: unknown,
        dependencies: CoreUseCaseDependencyType
    ): Promise<ResponseType> {
        try {
            const { header, body, queryParameter } = this.inputValidateUseCase.validateInputs(
                headerInput,
                bodyInput,
                parameterInput
            );
            return await this.handlerCoreFunctionUseCase.coreFunction(header, body, queryParameter);
        } catch (error) {
            return this.handlerErrorUseCase.error(error);
        }
    }
}
