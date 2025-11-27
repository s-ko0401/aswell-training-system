package com.aswell.trainingsystem.company;

import com.aswell.trainingsystem.auth.AuthenticatedUser;
import com.aswell.trainingsystem.company.dto.CompanyResponse;
import com.aswell.trainingsystem.company.dto.CreateCompanyRequest;
import com.aswell.trainingsystem.company.dto.UpdateCompanyRequest;
import jakarta.validation.Valid;
import java.security.Principal;
import java.util.List;
import java.util.UUID;
import org.springframework.security.core.Authentication;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/companies")
public class CompanyController {

    private final CompanyService companyService;

    public CompanyController(CompanyService companyService) {
        this.companyService = companyService;
    }

    @GetMapping
    @PreAuthorize("hasRole('SYSTEM_ADMIN')")
    public ResponseEntity<List<CompanyResponse>> list(@RequestParam(value = "keyword", required = false) String keyword) {
        return ResponseEntity.ok(companyService.list(keyword));
    }

    @GetMapping("/{companyId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<CompanyResponse> get(@PathVariable UUID companyId) {
        return ResponseEntity.ok(companyService.get(companyId));
    }

    @PostMapping
    @PreAuthorize("hasRole('SYSTEM_ADMIN')")
    public ResponseEntity<CompanyResponse> create(
            @Valid @RequestBody CreateCompanyRequest request,
            Authentication authentication
    ) {
        AuthenticatedUser principal = authentication != null && authentication.getPrincipal() instanceof AuthenticatedUser u
                ? u
                : null;
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(companyService.create(request, (AuthenticatedUser) principal));
    }

    @PutMapping("/{companyId}")
    @PreAuthorize("hasRole('SYSTEM_ADMIN') or (hasRole('ADMIN') and #companyId.toString() == principal.companyId.toString())")
    public ResponseEntity<CompanyResponse> update(
            @PathVariable UUID companyId,
            @Valid @RequestBody UpdateCompanyRequest request,
            Authentication authentication
    ) {
        AuthenticatedUser principal = authentication != null && authentication.getPrincipal() instanceof AuthenticatedUser u
                ? u
                : null;
        return ResponseEntity.ok(companyService.update(companyId, request, principal));
    }

    @DeleteMapping("/{companyId}")
    @PreAuthorize("hasRole('SYSTEM_ADMIN') or (hasRole('ADMIN') and #companyId.toString() == principal.companyId.toString())")
    public ResponseEntity<Void> delete(
            @PathVariable UUID companyId,
            Authentication authentication
    ) {
        AuthenticatedUser principal = authentication != null && authentication.getPrincipal() instanceof AuthenticatedUser u
                ? u
                : null;
        companyService.delete(companyId, principal);
        return ResponseEntity.noContent().build();
    }
}
