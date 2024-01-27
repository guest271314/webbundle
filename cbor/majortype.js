// Major type RFC: https://www.rfc-editor.org/rfc/rfc8949.html#name-major-types.
export var MajorType;
(function (MajorType) {
    MajorType[MajorType["PosInt"] = 0] = "PosInt";
    MajorType[MajorType["NegInt"] = 1] = "NegInt";
    MajorType[MajorType["ByteString"] = 2] = "ByteString";
    MajorType[MajorType["Text"] = 3] = "Text";
    MajorType[MajorType["Array"] = 4] = "Array";
    MajorType[MajorType["Map"] = 5] = "Map";
    MajorType[MajorType["Tag"] = 6] = "Tag";
    MajorType[MajorType["Other"] = 7] = "Other";
})(MajorType || (MajorType = {}));
// Returns the first 3 bits of the first byte representing cbor's major type.
export function getMajorType(b) {
    return (b & 0xff) >> 5;
}
