import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {NgxPaginationModule} from 'ngx-pagination';
import {TranslateModule} from '@ngx-translate/core';
import {FormComponent} from './form.component';
import {FormFormComponent} from './form-form/form-form.component';
import {FormCardComponent} from './form-card/form-card.component';
import {FormCustomComponent} from './form-custom/form-custom.component';
import {FormElementComponent} from './form-element/form-element.component';
import {FormElementTextComponent} from './form-element/form-element-text/form-element-text.component';
import {FormValidationInfoComponent} from './form-form/form-validation-info/form-validation-info.component';
import {FormElementTextareaComponent} from './form-element/form-element-textarea/form-element-textarea.component';
import {FormElementCheckboxComponent} from './form-element/form-element-checkbox/form-element-checkbox.component';
import {FormElementSelectDataComponent} from './form-element/form-element-select-data/form-element-select-data.component';
import {FormElementSelectEnumComponent} from './form-element/form-element-select-enum/form-element-select-enum.component';
import {FormElementDateComponent} from './form-element/form-element-date/form-element-date.component';
import {FormButtonComponent} from './form-element/form-button/form-button.component';
import {FormElementDecimalComponent} from './form-element/form-element-decimal/form-element-decimal.component';
import {FormElementDatetimeComponent} from './form-element/form-element-datetime/form-element-datetime.component';
import {FormElementIntegerComponent} from './form-element/form-element-integer/form-element-integer.component';
import {FormValidationInfoListComponent} from './form-form/form-validation-info-list/form-validation-info-list.component';
import {FormTableNavigatorComponent} from './form-element/form-table-navigator/form-table-navigator.component';
import {TooltipModule} from 'ngx-bootstrap/tooltip';
import {MatDialogModule} from '@angular/material/dialog';

@NgModule({
    declarations: [
        FormComponent,
        FormFormComponent,
        FormCardComponent,
        FormCustomComponent,
        FormElementComponent,
        FormButtonComponent,
        FormValidationInfoComponent,
        FormElementTextComponent,
        FormElementTextareaComponent,
        FormElementSelectEnumComponent,
        FormElementSelectDataComponent,
        FormElementCheckboxComponent,
        FormElementDateComponent,
        FormElementDecimalComponent,
        FormElementDatetimeComponent,
        FormElementIntegerComponent,
        FormValidationInfoListComponent,
        FormTableNavigatorComponent
    ],
    exports: [FormComponent, FormElementComponent, FormButtonComponent, FormValidationInfoComponent, FormValidationInfoListComponent, FormTableNavigatorComponent],
    imports: [CommonModule, FormsModule, NgxPaginationModule, TranslateModule, TooltipModule, MatDialogModule],
    providers: []
})
export class FormModule {
}
