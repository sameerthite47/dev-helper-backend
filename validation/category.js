const Validator = require('validator');
const isEmpty = require('./is-empty');

module.exports = function validateCategoryInput(data) {
    let errors = {};

    data.name = !isEmpty(data.name) ? data.name : '';
    data.description = !isEmpty(data.description) ? data.description : '';
    data.imageUrl = !isEmpty(data.imageUrl) ? data.imageUrl : '';

    if (Validator.isEmpty(data.name)) {
        errors.name = 'Name field is required';
    }

    if (Validator.isEmpty(data.description)) {
        errors.description = 'Description field is required';
    }

    if (Validator.isEmpty(data.imageUrl)) {
        errors.imageUrl = 'Image url field is required';
    }

    return {
        errors,
        isValid:isEmpty(errors)
    }
}