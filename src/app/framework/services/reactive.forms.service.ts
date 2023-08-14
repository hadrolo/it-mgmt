import {Injectable} from '@angular/core';
import {FormArray, FormGroup, Validators} from '@angular/forms';

/**
 * The FormService simplifies handling FormGroups and FormArrays
 */
@Injectable({
    providedIn: 'root'
})
export class ReactiveFormsService {

    constructor() {
    }

    moveFormArrayEntry(form: FormGroup, control: string, currentIndex: number, shift: number): void {
        const formArray = this.getFormArray(form, control);

        let newIndex = currentIndex + shift;
        if (newIndex === -1) {
            newIndex = formArray.length - 1;
        } else if (newIndex === formArray.length) {
            newIndex = 0;
        }

        const currentElement = formArray.at(currentIndex);
        formArray.removeAt(currentIndex);
        formArray.insert(newIndex, currentElement);
    }

    removeFormArrayItem(form: FormGroup, control: string, index: number): void {
        this.getFormArray(form, control).removeAt(index);
    }

    getFormArray(form: FormGroup, control: string): FormArray {
        return form.get(control) as FormArray;
    }

    /**
     * Easy way to setup validators based on a condition
     *
     * @example wear_mask: [null, this.reactiveFormsService.conditionalValidator(() => this.form.get('adult').value === true, Validators.required)],
     * @source https://medium.com/ngx/3-ways-to-implement-conditional-validation-of-reactive-forms-c59ed6fc3325
     * @param predicate The condition to check
     * @param validator The validator to apply
     */
    conditionalValidator(predicate, validator): Validators {
        return (formControl => {
            if (!formControl.parent) {
                return null;
            }
            if (predicate()) {
                return validator(formControl);
            }
            return null;
        });
    }
}
