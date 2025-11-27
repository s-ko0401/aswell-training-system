package com.aswell.trainingsystem.domain.role;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

@Entity
@Table(
        name = "role_mst",
        uniqueConstraints = {
                @UniqueConstraint(name = "ux_role_mst_code", columnNames = "code")
        }
)
public class Role {

    @Id
    @Column(name = "role_id", nullable = false)
    private Short roleId;

    @Column(name = "code", nullable = false, length = 50)
    private String code;

    @Column(name = "name_ja", nullable = false, length = 100)
    private String nameJa;

    @Column(name = "description")
    private String description;

    @Column(name = "sort_order")
    private Short sortOrder;

    public Short getRoleId() {
        return roleId;
    }

    public void setRoleId(Short roleId) {
        this.roleId = roleId;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getNameJa() {
        return nameJa;
    }

    public void setNameJa(String nameJa) {
        this.nameJa = nameJa;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Short getSortOrder() {
        return sortOrder;
    }

    public void setSortOrder(Short sortOrder) {
        this.sortOrder = sortOrder;
    }
}
