type ParseAndValidateMethod<T> = (body: unknown) => T;

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

export class HandlerTaskChain<HeaderType, BodyType, QueryParameterType> {
    constructor(private inputValidateUseCase: InputValidationUseCase<HeaderType, BodyType, QueryParameterType>) {}
}
