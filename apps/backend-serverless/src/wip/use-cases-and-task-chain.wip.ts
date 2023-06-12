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

export class CoreUseCase<HeaderType, BodyType, QueryParameterType, ResponseType, CoreUseCaseDependencyType> {
    constructor(
        private coreUseCaseMethod: CoreUseCaseMethod<
            HeaderType,
            BodyType,
            QueryParameterType,
            ResponseType,
            CoreUseCaseDependencyType
        >,
        private coreUseCaseDependencies: CoreUseCaseDependencyType
    ) {}

    core(
        header: HeaderType,
        body: BodyType,
        queryParameter: QueryParameterType,
        dependencies: CoreUseCaseDependencyType
    ): ResponseType {
        return this.coreUseCaseMethod(header, body, queryParameter, dependencies);
    }
}

export class HandlerTaskChain<HeaderType, BodyType, QueryParameterType, ResponseType, CoreUseCaseDependencyType> {
    constructor(
        private inputValidateUseCase: InputValidationUseCase<HeaderType, BodyType, QueryParameterType>,
        private coreUseCase: CoreUseCase<
            HeaderType,
            BodyType,
            QueryParameterType,
            Promise<ResponseType>,
            CoreUseCaseDependencyType
        >
    ) {}

    async completeTaskChain(
        headerInput: unknown,
        bodyInput: unknown,
        parameterInput: unknown,
        dependencies: CoreUseCaseDependencyType
    ): Promise<ResponseType> {
        const { header, body, queryParameter } = this.inputValidateUseCase.validateInputs(
            headerInput,
            bodyInput,
            parameterInput
        );

        const result = await this.coreUseCase.core(header, body, queryParameter, dependencies);

        return result;
    }
}
