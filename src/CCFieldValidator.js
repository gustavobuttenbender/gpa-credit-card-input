import valid from "card-validator";
import pick from "lodash.pick";
import values from "lodash.values";
import every from "lodash.every";

const toStatus = validation => {
  return validation.isValid ? "valid" :
         validation.isPotentiallyValid ? "incomplete" :
         "invalid";
};

const FALLBACK_CARD = { gaps: [4, 8, 12], lengths: [16], code: { size: 3 } };
export default class CCFieldValidator {
  constructor(displayedFields, validatePostalCode, validByRequest) {
    this._displayedFields = displayedFields;
    this._validatePostalCode = validatePostalCode;
    this._validByRequest = validByRequest;
  }

  validateNumber = (number) => {
    if (this._validByRequest.maxLength !== number.length) {
      return 'incomplete'
    } else if (this._validByRequest.cardType) {
      return 'valid'
    }

    return "invalid" 
  }

  validateValues = (formValues) => {
    const numberValidation = valid.number(formValues.number) ;
    const expiryValidation = valid.expirationDate(formValues.expiry);
    const maxCVCLength = (numberValidation.card || FALLBACK_CARD).code.size;
    const cvcValidation = valid.cvv(formValues.cvc, maxCVCLength);

    const validationStatuses = pick({
      number: this.validateNumber(formValues.number),
      expiry: toStatus(expiryValidation),
      cvc: toStatus(cvcValidation),
      name: !!formValues.name ? "valid" : "incomplete",
      postalCode: this._validatePostalCode(formValues.postalCode),
    }, this._displayedFields);

    return {
      valid: every(values(validationStatuses), status => status === "valid"),
      status: validationStatuses,
    };
  };
}
