package com.aswell.trainingsystem.user;

import com.aswell.trainingsystem.auth.AuthenticatedUser;
import com.aswell.trainingsystem.user.dto.UserListResponse;
import com.aswell.trainingsystem.user.dto.CreateUserRequest;
import java.security.Principal;
import java.util.List;
import org.springframework.security.core.Authentication;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import java.util.UUID;
import com.aswell.trainingsystem.user.dto.UpdateUserRequest;
import org.springframework.web.bind.annotation.PathVariable;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    @PreAuthorize("hasRole('SYSTEM_ADMIN') or hasRole('ADMIN')")
    public ResponseEntity<List<UserListResponse>> list(
            @RequestParam(value = "keyword", required = false) String keyword,
            Authentication authentication
    ) {
        AuthenticatedUser principal = authentication != null && authentication.getPrincipal() instanceof AuthenticatedUser u
                ? u
                : null;
        return ResponseEntity.ok(userService.list(keyword, principal));
    }

    @PostMapping
    @PreAuthorize("hasRole('SYSTEM_ADMIN') or hasRole('ADMIN')")
    public ResponseEntity<UserListResponse> create(
            @Valid @RequestBody CreateUserRequest request,
            Authentication authentication
    ) {
        AuthenticatedUser principal = authentication != null && authentication.getPrincipal() instanceof AuthenticatedUser u
                ? u
                : null;
        return ResponseEntity.ok(userService.createForCompany(request, principal));
    }

    @PutMapping("/{userId}")
    @PreAuthorize("hasRole('SYSTEM_ADMIN') or hasRole('ADMIN')")
    public ResponseEntity<UserListResponse> update(
            @PathVariable("userId") UUID userId,
            @Valid @RequestBody UpdateUserRequest request,
            Authentication authentication
    ) {
        AuthenticatedUser principal = authentication != null && authentication.getPrincipal() instanceof AuthenticatedUser u
                ? u
                : null;
        return ResponseEntity.ok(userService.updateForCompany(userId, request, principal));
    }

    @DeleteMapping("/{userId}")
    @PreAuthorize("hasRole('SYSTEM_ADMIN') or hasRole('ADMIN')")
    public ResponseEntity<Void> delete(
            @PathVariable("userId") UUID userId,
            Authentication authentication
    ) {
        AuthenticatedUser principal = authentication != null && authentication.getPrincipal() instanceof AuthenticatedUser u
                ? u
                : null;
        userService.deleteForCompany(userId, principal);
        return ResponseEntity.noContent().build();
    }
}
