
export enum FwTagStyle {
    ICON = 'ICON',
    TEXT = 'TEXT',
    ICON_TEXT = 'ICON_TEXT'
}

export enum FwTagValueType {
    NONE = 'NONE',
    TEXT = 'TEXT',
    UID = 'UID'
}

export interface FwTagConfig {
    style: FwTagStyle;
    translate: boolean;
    translateValuePrefix?: string;
    fwTagValueType: FwTagValueType;
    FK_ID?: number;
    FK_name: string;
    editable: boolean;
}
