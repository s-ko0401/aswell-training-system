package com.aswell.trainingsystem.auth;

import java.security.Principal;
import java.util.List;
import java.util.UUID;

public class AuthenticatedUser implements Principal {

    private final UUID userId;
    private final UUID companyId;
    private final String companyName;
    private final String loginId;
    private final String displayName;
    private final String email;
    private final List<String> roles;

    public AuthenticatedUser(UUID userId, UUID companyId, String companyName, String loginId, String displayName, String email, List<String> roles) {
        this.userId = userId;
        this.companyId = companyId;
        this.companyName = companyName;
        this.loginId = loginId;
        this.displayName = displayName;
        this.email = email;
        this.roles = roles;
    }

    public UUID getUserId() {
        return userId;
    }

    public UUID getCompanyId() {
        return companyId;
    }

    public String getCompanyName() {
        return companyName;
    }

    public String getLoginId() {
        return loginId;
    }

    public String getDisplayName() {
        return displayName;
    }

    public String getEmail() {
        return email;
    }

    public List<String> getRoles() {
        return roles;
    }

    @Override
    public String getName() {
        return loginId;
    }
}
