import { parseAndValidateSafteyKeyMessage } from '../../../../src/models/step-functions/saftey-key-sweep.model.js';
import {
    runEmptyFieldTests,
    runInvalidFieldTypeTests,
    runMissingFieldTests,
    runValidParameterTest,
} from '../../../../src/utilities/testing-helper/common-model-test.utility.js';

describe('unit testing the saftey key model', () => {
    const validParams = {
        key: 'some-id',
    };

    const fields = Object.keys(validParams);

    const wrongTypes = {
        key: 123,
    };

    runValidParameterTest(parseAndValidateSafteyKeyMessage, validParams);
    runMissingFieldTests(parseAndValidateSafteyKeyMessage, validParams, fields);
    runInvalidFieldTypeTests(parseAndValidateSafteyKeyMessage, validParams, fields, wrongTypes);
    runEmptyFieldTests(parseAndValidateSafteyKeyMessage, validParams, fields);
});
