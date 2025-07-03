package com.dupss.app.BE_Dupss.entity;

public enum AcademicTitle {
    GS("Giáo sư"),
    PGS("Phó Giáo sư"),
    TS("Tiến sĩ"),
    ThS("Thạc sĩ"),
    CN("Cử nhân"),
    BS("Bác sĩ"),
    TVV("Tư vấn viên"),
    OTHER("Khác");

    private final String fullName;

    AcademicTitle(String fullName) {
        this.fullName = fullName;
    }

    public String getFullName() {
        return fullName;
    }
}
