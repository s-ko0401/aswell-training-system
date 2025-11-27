package com.aswell.trainingsystem.role;

import com.aswell.trainingsystem.auth.AuthenticatedUser;
import com.aswell.trainingsystem.role.dto.CreateRoleRequest;
import com.aswell.trainingsystem.role.dto.RoleResponse;
import com.aswell.trainingsystem.role.dto.UpdateRoleRequest;
import jakarta.validation.Valid;
import java.security.Principal;
import java.util.List;
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
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/roles")
public class RoleController {

    private final RoleService roleService;

    public RoleController(RoleService roleService) {
        this.roleService = roleService;
    }

    @GetMapping
    @PreAuthorize("hasRole('SYSTEM_ADMIN')")
    public ResponseEntity<List<RoleResponse>> list() {
        return ResponseEntity.ok(roleService.list());
    }

    @PostMapping
    @PreAuthorize("hasRole('SYSTEM_ADMIN')")
    public ResponseEntity<RoleResponse> create(
            @Valid @RequestBody CreateRoleRequest request,
            Authentication authentication
    ) {
        AuthenticatedUser principal = authentication != null && authentication.getPrincipal() instanceof AuthenticatedUser u
                ? u
                : null;
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(roleService.create(request, (AuthenticatedUser) principal));
    }

    @PutMapping("/{roleId}")
    @PreAuthorize("hasRole('SYSTEM_ADMIN')")
    public ResponseEntity<RoleResponse> update(
            @PathVariable short roleId,
            @Valid @RequestBody UpdateRoleRequest request,
            Authentication authentication
    ) {
        AuthenticatedUser principal = authentication != null && authentication.getPrincipal() instanceof AuthenticatedUser u
                ? u
                : null;
        return ResponseEntity.ok(roleService.update(roleId, request, principal));
    }

    @DeleteMapping("/{roleId}")
    @PreAuthorize("hasRole('SYSTEM_ADMIN')")
    public ResponseEntity<Void> delete(
            @PathVariable short roleId,
            Authentication authentication
    ) {
        AuthenticatedUser principal = authentication != null && authentication.getPrincipal() instanceof AuthenticatedUser u
                ? u
                : null;
        roleService.delete(roleId, principal);
        return ResponseEntity.noContent().build();
    }
}
