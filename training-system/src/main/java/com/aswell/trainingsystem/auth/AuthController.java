package com.aswell.trainingsystem.auth;

import com.aswell.trainingsystem.auth.dto.AuthResponse;
import com.aswell.trainingsystem.auth.dto.LoginRequest;
import com.aswell.trainingsystem.auth.dto.RegisterRequest;
import com.aswell.trainingsystem.auth.dto.UserResponse;
import jakarta.validation.Valid;
import java.security.Principal;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout() {
        // Stateless JWT: client discards token; server can later add blacklist if needed.
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/me")
    public ResponseEntity<UserResponse> me(Principal principal) {
        if (principal instanceof AuthenticatedUser authenticatedUser) {
            UserResponse user = new UserResponse();
            user.setUserId(authenticatedUser.getUserId());
            user.setCompanyId(authenticatedUser.getCompanyId());
            user.setCompanyName(authenticatedUser.getCompanyName());
            user.setLoginId(authenticatedUser.getLoginId());
            user.setName(authenticatedUser.getDisplayName());
            user.setEmail(authenticatedUser.getEmail());
            user.setRoles(authenticatedUser.getRoles());
            return ResponseEntity.ok(user);
        }
        if (principal instanceof org.springframework.security.core.Authentication authentication
                && authentication.getPrincipal() instanceof AuthenticatedUser authenticatedUser) {
            UserResponse user = new UserResponse();
            user.setUserId(authenticatedUser.getUserId());
            user.setCompanyId(authenticatedUser.getCompanyId());
            user.setCompanyName(authenticatedUser.getCompanyName());
            user.setLoginId(authenticatedUser.getLoginId());
            user.setName(authenticatedUser.getDisplayName());
            user.setEmail(authenticatedUser.getEmail());
            user.setRoles(authenticatedUser.getRoles());
            return ResponseEntity.ok(user);
        }
        return ResponseEntity.status(401).build();
    }
}
