import {NgModel} from '@angular/forms';

export enum FwFormButtonType {
    CANCEL_VIEW = 'cancelView',
    INSERT = 'insert',
    CANCEL_INSERT = 'cancelInsert',
    UPDATE = 'update',
    SET_DELETE = 'setDelete',
    DELETE = 'delete',
    CANCEL_DELETE = 'cancelDelete',
    EDIT = 'edit',
    CANCEL_EDIT = 'cancelEdit'
}

export enum FwFormStatusType {
    INSERT = 'insert',
    UPDATE = 'update',
    DELETE = 'delete',
    CLOSE_MODAL = 'close_modal',
    OPEN_MODAL = 'open_modal',
    OPEN = 'open'
}

export enum FwFormViewMode {
    VIEW = 'view',
    EDIT = 'edit',
    INSERT = 'insert',
    DELETE = 'delete'
}

export enum FwFormType {
    MODAL = 'modal',
    CARD = 'card',
    CUSTOM = 'custom'
}

export enum FwFormValidationStyle {
    NONE = 'none',
    FIELD = 'field',
    CUSTOM = 'custom'
}

export enum FwFormInputStyle {
    TITLE_COUNT = 'title_count',
    TITLE = 'tilte',
    NONE = 'none'
}

export enum FwFormInputSize {
    DEFAULT = 'default',
    SMALL = 'small',
    LARGE = 'large'
}

export interface FwFormButtonConfig {
    name: string;
    type: FwFormButtonType;
    className?: string;
    // for usage with access rights
    enabled?: boolean;
    _visible?: boolean;
}

export interface FwFormStatus {
    type: FwFormStatusType;
    data?: any;
}

export interface FwFormJoins {
    left: string;
    right: string;
    key: string;
}

export interface FwFormConfig {
    formName: string;
    // The name of the table
    tableName: string;
    // The name of the primary key of the table
    tableIndexName: string;
    titleView: string;
    titleInsert: string;
    titleEdit: string;
    titleDelete: string;
    // The name of the modal
    modalName: string;
    // The ID of the current record if any
    pkValue?: string;
    formType: FwFormType;
    formInputSize?: FwFormInputSize;
    formValidationStyle?: FwFormValidationStyle;
    viewMode?: FwFormViewMode;
    formJoins?: FwFormJoins[];
    // The fields to be used, the order will be kept
    formFields: { [key: string]: FwFormField };
    // The available buttons
    buttons?: { [key: string]: FwFormButtonConfig };
}

export interface FwFormField {
    // Table of the field, if not the original table
    table?: string;
    // The column name in the database
    name: string;
    // The title displayed in the modal or card header
    title: string;
    placeholder?: string;
    readOnly?: boolean;
    // If the field is a foreign key this will be used to select the column name of the foreign table to be displayed
    foreignName?: string;
    style?: FwFormInputStyle;
    // The validation info text
    validationInfo?: string;
    _disabled?: boolean;
    // Internal: The value of the field
    _value?: string;
    _oldValue?: string;
    // Internal: Set only for FKs values
    _foreignValue?: string;
    // Internal: The data for FK values
    _data?: any[];
    // Internal: Set to true when the field is created, used to detect missing fields
    _registered?: boolean;
    _DB_type_name?: string;
    _DB_type_constraints?: any;
    _DB_required?: boolean;
    _DB_Key?: string;
    _DB_Default?: string;
    _DB_CONSTRAINT_TYPE?: string;
    _model?: NgModel;
    _tableIndexName?: string;
}
