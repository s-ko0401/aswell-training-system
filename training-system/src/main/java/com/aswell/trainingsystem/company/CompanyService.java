package com.aswell.trainingsystem.company;

import com.aswell.trainingsystem.auth.AuthenticatedUser;
import com.aswell.trainingsystem.common.ApiException;
import com.aswell.trainingsystem.company.dto.CompanyResponse;
import com.aswell.trainingsystem.company.dto.CreateCompanyRequest;
import com.aswell.trainingsystem.company.dto.UpdateCompanyRequest;
import com.aswell.trainingsystem.domain.company.Company;
import com.aswell.trainingsystem.domain.role.Role;
import com.aswell.trainingsystem.domain.user.User;
import com.aswell.trainingsystem.domain.user.UserRole;
import com.aswell.trainingsystem.repository.CompanyRepository;
import com.aswell.trainingsystem.repository.RoleRepository;
import com.aswell.trainingsystem.repository.UserRepository;
import com.aswell.trainingsystem.repository.UserRoleRepository;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CompanyService {

    private final CompanyRepository companyRepository;
    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final UserRoleRepository userRoleRepository;
    private final PasswordEncoder passwordEncoder;

    public CompanyService(
            CompanyRepository companyRepository,
            RoleRepository roleRepository,
            UserRepository userRepository,
            UserRoleRepository userRoleRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.companyRepository = companyRepository;
        this.roleRepository = roleRepository;
        this.userRepository = userRepository;
        this.userRoleRepository = userRoleRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional(readOnly = true)
    public List<CompanyResponse> list(String keyword) {
        AuthenticatedUser actor = CurrentUser.get();
        List<Company> companies;
        if (isSystemAdmin(actor)) {
            companies = (keyword == null || keyword.isBlank())
                    ? companyRepository.findAll()
                    : companyRepository.searchByKeyword(keyword.trim());
        } else if (isAdmin(actor)) {
            // 管理者は自社のみ閲覧
            companies = companyRepository.findById(actor.getCompanyId())
                    .map(List::of)
                    .orElse(List.of());
        } else {
            throw new ApiException(HttpStatus.FORBIDDEN, "Not allowed");
        }
        return companies.stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public CompanyResponse get(UUID companyId) {
        AuthenticatedUser actor = CurrentUser.get();
        if (!isSystemAdmin(actor) && !(isAdmin(actor) && actor.getCompanyId().equals(companyId))) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Not allowed");
        }
        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Company not found"));
        return toResponse(company);
    }

    @Transactional
    public CompanyResponse create(CreateCompanyRequest request, AuthenticatedUser actor) {
        AuthenticatedUser effectiveActor = actor != null ? actor : CurrentUser.get();
        if (!isSystemAdmin(effectiveActor)) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Only SYSTEM_ADMIN can create companies");
        }
        if (companyRepository.existsByCompanyNameIgnoreCase(request.getCompanyName())) {
            throw new ApiException(HttpStatus.CONFLICT, "Company name already exists");
        }

        Company company = new Company();
        company.setCompanyId(UUID.randomUUID());
        company.setCompanyName(request.getCompanyName());
        company.setBillingEmail(request.getBillingEmail());
        company.setFlag((short) 0);
        companyRepository.save(company);

        Role adminRole = roleRepository.findByCode("ADMIN")
                .orElseThrow(() -> new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "ADMIN role missing"));

        if (userRepository.existsByCompanyAndLoginId(company, request.getAdminLoginId())) {
            throw new ApiException(HttpStatus.CONFLICT, "Admin login ID already exists for this company");
        }

        User admin = new User();
        admin.setUserId(UUID.randomUUID());
        admin.setCompany(company);
        admin.setLoginId(request.getAdminLoginId());
        admin.setPasswordHash(passwordEncoder.encode(request.getAdminPassword()));
        admin.setName(request.getAdminName());
        admin.setEmail(request.getAdminEmail());
        admin.setFlag((short) 0);
        userRepository.save(admin);

        UserRole adminRoleLink = new UserRole();
        adminRoleLink.setUserRoleId(UUID.randomUUID());
        adminRoleLink.setUser(admin);
        adminRoleLink.setRole(adminRole);
        userRoleRepository.save(adminRoleLink);

        return toResponse(company);
    }

    @Transactional
    public CompanyResponse update(UUID companyId, UpdateCompanyRequest request, AuthenticatedUser actor) {
        AuthenticatedUser effectiveActor = actor != null ? actor : CurrentUser.get();
        if (!isSystemAdmin(effectiveActor) && !(isAdmin(effectiveActor) && effectiveActor.getCompanyId().equals(companyId))) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Only SYSTEM_ADMIN or company ADMIN can update this company");
        }
        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Company not found"));

        if (request.getCompanyName() != null && !request.getCompanyName().isBlank()) {
            // Ensure no duplicate name
            companyRepository.findFirstByCompanyNameIgnoreCase(request.getCompanyName())
                    .filter(existing -> !existing.getCompanyId().equals(companyId))
                    .ifPresent(existing -> {
                        throw new ApiException(HttpStatus.CONFLICT, "Company name already exists");
                    });
            company.setCompanyName(request.getCompanyName());
        }
        if (request.getBillingEmail() != null) {
            company.setBillingEmail(request.getBillingEmail());
        }
        if (request.getFlag() != null) {
            company.setFlag(request.getFlag());
        }

        return toResponse(company);
    }

    @Transactional
    public void delete(UUID companyId, AuthenticatedUser actor) {
        AuthenticatedUser effectiveActor = actor != null ? actor : CurrentUser.get();
        if (!isSystemAdmin(effectiveActor) && !(isAdmin(effectiveActor) && effectiveActor.getCompanyId().equals(companyId))) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Only SYSTEM_ADMIN or company ADMIN can delete this company");
        }
        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Company not found"));
        company.setFlag((short) 9);

        // Soft-delete users under the company
        userRepository.findByCompany(company)
                .forEach(u -> u.setFlag((short) 9));
    }

    private boolean isSystemAdmin(AuthenticatedUser user) {
        if (user != null && user.getRoles().stream().anyMatch("SYSTEM_ADMIN"::equalsIgnoreCase)) {
            return true;
        }
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return auth != null && auth.getAuthorities().contains(new SimpleGrantedAuthority("ROLE_SYSTEM_ADMIN"));
    }

    private boolean isAdmin(AuthenticatedUser user) {
        if (user != null && user.getRoles().stream().anyMatch("ADMIN"::equalsIgnoreCase)) {
            return true;
        }
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return auth != null && auth.getAuthorities().contains(new SimpleGrantedAuthority("ROLE_ADMIN"));
    }

    private CompanyResponse toResponse(Company company) {
        CompanyResponse response = new CompanyResponse();
        response.setCompanyId(company.getCompanyId());
        response.setCompanyName(company.getCompanyName());
        response.setBillingEmail(company.getBillingEmail());
        response.setFlag(company.getFlag());
        response.setCreatedAt(company.getCreatedAt());
        response.setUpdatedAt(company.getUpdatedAt());
        return response;
    }
}
