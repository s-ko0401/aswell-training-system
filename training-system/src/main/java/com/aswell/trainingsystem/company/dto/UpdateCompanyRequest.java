package com.aswell.trainingsystem.company.dto;

import jakarta.validation.constraints.Email;

public class UpdateCompanyRequest {

    private String companyName;

    @Email
    private String billingEmail;

    /**
     * Flag: 0=active,1=stopped,9=deleted
     */
    private Short flag;

    public String getCompanyName() {
        return companyName;
    }

    public void setCompanyName(String companyName) {
        this.companyName = companyName;
    }

    public String getBillingEmail() {
        return billingEmail;
    }

    public void setBillingEmail(String billingEmail) {
        this.billingEmail = billingEmail;
    }

    public Short getFlag() {
        return flag;
    }

    public void setFlag(Short flag) {
        this.flag = flag;
    }
}
