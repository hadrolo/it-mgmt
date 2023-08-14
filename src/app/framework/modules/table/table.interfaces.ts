import {FwFormConfig} from '../form/form.interfaces';

export enum FwTableStatusType {
    ENTRY_CLICKED = 'entry_clicked'
}

// The filter type - enum, lookup and group are dropdowns
export enum FwTableColumnFilterType {
    INPUT = 'input',
    ENUM = 'enum',
    LOOKUP = 'lookup',
    GROUP = 'group',
    BOOLEAN = 'boolean',
    SUBQUERY_CONCAT = 'subquery_concat',
    SUBQUERY_COUNT = 'subquery_count',
    SUBQUERY_GROUP = 'subquery_group'
}

// Alignment of table fields in head, body and footer
export enum FwTableFieldAlignment {
    RIGHT = 'right',
    CENTER = 'center'
}

export enum FwTableRowColorConditionOperator {
    EQUAL = 'equal',
    BIGGER_INT = 'bigger_int',
    BIGGER_DATE = 'bigger_date',
    SMALLER_INT = 'smaller_int',
    SMALLER_DATE = 'smaller_date'
}

export enum FwTableFilterOperator {
    EQUAL = 'equal',
    BIGGER = 'bigger',
    SMALLER = 'smaller',
    NOT = 'not',
    IS_NULL = 'is_null',
    NOT_NULL = 'not_null'
}

// Name of the local storage key
interface FwTableLocalStorage {
    // The version can be used to clear the saved local storage data without having to delete it
    version: number;
    name: string;
    enabled: boolean;
}

export interface FwTableRowColorCondition {
    key: string;
    value: string;
    operator: FwTableRowColorConditionOperator;
}

interface FwTableRowColor {
    color: string;
    conditions: FwTableRowColorCondition[];
}

export interface FwTableRowImage {
    key: string;
    image?: string;
    height?: string;
    width?: string;
    icon?: string;
    color?: string;
    conditions: FwTableRowColorCondition[];
}

export interface FwTableDataConfig {
    // The name of the database table
    tableName: string;
    // The name of the primary key of the table
    tableIndexName: string;
    // Table joins
    tableJoins: FwTableJoin[];
    // Table filter (config only, no UI)
    tableFilter?: FwTableFilter[];
    // Table fields to display
    tableFields: FwTableField[];
    reverse: boolean;
    alphaFilter: string;
    searchMinimumCharacter: number;
    search: string;
    order: string;
    // Defines the filter options
    columnFilter?: FwTableColumnFilter;
    rowColor?: FwTableRowColor[];
    rowImage?: FwTableRowImage[];
    externalFilter?: FwTableExternalFilter;
}

export interface FwTableFieldDateFormat {
    en: string;
    others: string;
}

interface FwTableColumnFilter {
    // If enabled shows the filter button
    enabled: boolean;
    // Toggles the active state of the filter
    active?: boolean;
    // The true value
    trueValue?: string;
    // The false value
    falseValue?: string;
    // Label for active filter button
    buttonOn?: FwTranslatable | string;
    // Label for inactive filter button
    buttonOff?: FwTranslatable | string;
    // Label for reset filter button
    buttonReset?: FwTranslatable | string;
    // The default dropdown value - TODO: rename to "defaultValue"? Can be used for inputs as well
    dropDownDefault?: string;
    // Defines the column fields that can be filtered
    fields: { [key: string]: FwTableColumnFilterField };
}

export interface FwTranslatable {
    label: string;
}

export interface FwTableColumnFilterField {
    value?: string;
    type?: FwTableColumnFilterType;
}

interface FwTableFileViewerFIDSettings {
    FID: string;
    width: string;
    height: string;
    viewThumbnail: boolean;
}

interface FwTableFileViewerSettings {
    FK_ID: string;
    FK_name: string;
    FK_table: string;
    doctype: string;
    width: string;
    height: string;
    viewThumbnail: boolean;
}

export interface FwTableField {
    // Unique Key - is used as alias in queries
    key: string;
    // Database of the field
    database?: string;
    // Table of the field, if not the original table
    table?: string;
    // The name of the primary key of the table, required for Lookup filter
    index?: string;
    // The alias is required when using a subquery
    alias?: string;
    // The column name in the database
    name?: string;
    // The title displayed in the table header
    title: string;
    // MySql DATE_FORMAT function
    dateFormat?: FwTableFieldDateFormat;
    // Translate fieldvalue with ngx-translate
    translate?: boolean;
    // Translate prefix for table values
    translateValuePrefix?: string;
    // Field is sortable
    sortable?: boolean;
    // Field is searchable by search field
    searchable?: boolean;
    // Used for custom subqueries, requires an alias
    subquery?: string;
    // Prevents body text wrapping
    nowrap?: boolean;
    // Prevents header text wrapping
    nowrapHeader?: boolean;
    // Whether to calculate the sum
    footerSum?: boolean;
    alignment?: FwTableFieldAlignment;
    visible?: boolean;
    // viewer settings
    fileViewerFID?: FwTableFileViewerFIDSettings;
    fileViewer?: FwTableFileViewerSettings;
    _DB_type_name?: string;
    _DB_type_constraints?: any;
    _DB_type_constraints_translated?: any;
    _footerSumValue?: number;
    _hasImage?: boolean;
}

export interface FwTableJoin {
    // The table to be joined
    left: string;
    // The table to join from
    right: string;
    // The key to join the tables
    key: string;
    // The key to join the tables defined in property right
    keyRight?: string;
    // Extended filter-condition (condition: "and table.field='xyz'")
    condition?: string;
}

export interface FwTableFilter {
    table: string;
    field: string;
    values?: string[];
    operator: FwTableFilterOperator;
}

interface FwPaginConfig {
    id: string;
    rowFields: string[];
    itemsPerPageDb: boolean;
    itemsPerPage: string;
    currentPage: number;
    totalItems: number;
    totalItemsLabel: string;
    prevLabel: string;
    nextLabel: string;
}

interface FwTableFileViewerConfig {
    viewFileInfo: boolean;
    viewFlipImage: boolean;
}

interface FwTableResult{
    table?: any[];
    total?: number;
    selects?: any;
    pkKeys?: any;
    alpha?: any;
}

export enum FwTableDesign {
    NONE = 'none',
    CARD = 'card'
}

export interface FwInsertButton{
    enabled: boolean;
    innerHtml: string;
    i18n?: string;
}

export interface FwTableConfig {
    // Name auf Table (uses for xls-export & debug info)
    title: string;
    design?: FwTableDesign;
    language: string;
    // Icon to display before the title
    titleIcon?: string;
    dataFilterAllName: string;
    // The route to navigate to when clicking on an item, if set to null opens a modal
    openDatasetRouterLink: any;
    dataConfig?: FwTableDataConfig;
    localStorage?: FwTableLocalStorage;
    paginConfig: FwPaginConfig;
    formConfig?: FwFormConfig;
    fileViewerConfig?: FwTableFileViewerConfig;
    // Enables CreateButton
    insertButton?: FwInsertButton;
    // Show Alphalist
    enableAlphalist: boolean;
    // Overwrite Alphalist
    alphalistOverlay?: any;
    // Focus selected Row
    enableFocusRow?: boolean;
    // Show export XLS button
    enableExportXLS?: boolean;
    // unique id
    _id?: string;
}

// Used by the table event emitter for various status messages
export interface FwTableStatus {
    type: FwTableStatusType;
    data: any;
}

export interface FwTableExternalFilter {
    key: string;
    value: string;
}

export interface FwTableData{
    config: FwTableConfig;
    result: FwTableResult;
}
