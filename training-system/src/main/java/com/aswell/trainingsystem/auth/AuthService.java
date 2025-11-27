package com.aswell.trainingsystem.auth;

import com.aswell.trainingsystem.auth.dto.AuthResponse;
import com.aswell.trainingsystem.auth.dto.LoginRequest;
import com.aswell.trainingsystem.auth.dto.RegisterRequest;
import com.aswell.trainingsystem.auth.dto.UserResponse;
import com.aswell.trainingsystem.common.ApiException;
import com.aswell.trainingsystem.domain.company.Company;
import com.aswell.trainingsystem.domain.role.Role;
import com.aswell.trainingsystem.domain.user.User;
import com.aswell.trainingsystem.domain.user.UserRole;
import com.aswell.trainingsystem.repository.CompanyRepository;
import com.aswell.trainingsystem.repository.RoleRepository;
import com.aswell.trainingsystem.repository.UserRepository;
import com.aswell.trainingsystem.repository.UserRoleRepository;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private static final String DEFAULT_ROLE = "TRAINEE";

    private final CompanyRepository companyRepository;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final UserRoleRepository userRoleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(
            CompanyRepository companyRepository,
            UserRepository userRepository,
            RoleRepository roleRepository,
            UserRoleRepository userRoleRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService
    ) {
        this.companyRepository = companyRepository;
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.userRoleRepository = userRoleRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        Company company = companyRepository.findFirstByCompanyNameIgnoreCase(request.getCompanyName())
                .orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST, "Company not found"));
        if (company.getFlag() != 0) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Company is inactive");
        }

        if (userRepository.existsByCompanyAndLoginId(company, request.getLoginId())) {
            throw new ApiException(HttpStatus.CONFLICT, "Login ID already exists for this company");
        }

        User user = new User();
        user.setUserId(UUID.randomUUID());
        user.setCompany(company);
        user.setLoginId(request.getLoginId());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setFlag((short) 0);

        userRepository.save(user);

        List<String> requestedRoles = request.getRoleCodes();
        List<String> roleCodes = (requestedRoles == null || requestedRoles.isEmpty())
                ? List.of(DEFAULT_ROLE)
                : requestedRoles;

        List<Role> roles = roleRepository.findByCodeIn(roleCodes);
        if (roles.size() != roleCodes.size()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "One or more roles are invalid");
        }

        List<String> assignedCodes = new ArrayList<>();
        for (Role role : roles) {
            UserRole userRole = new UserRole();
            userRole.setUserRoleId(UUID.randomUUID());
            userRole.setUser(user);
            userRole.setRole(role);
            userRoleRepository.save(userRole);
            assignedCodes.add(role.getCode());
        }

        return buildAuthResponse(user, assignedCodes);
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        Company company = companyRepository.findFirstByCompanyNameIgnoreCase(request.getCompanyName())
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Invalid credentials"));
        if (company.getFlag() != 0) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Company inactive");
        }

        User user = userRepository.findByCompanyAndLoginId(company, request.getLoginId())
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Invalid credentials"));
        if (user.getFlag() != 0) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "User inactive");
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Invalid credentials");
        }

        List<String> roleCodes = userRoleRepository.findByUser(user).stream()
                .map(userRole -> userRole.getRole().getCode())
                .toList();

        if (roleCodes.isEmpty()) {
            throw new ApiException(HttpStatus.FORBIDDEN, "User has no roles");
        }

        return buildAuthResponse(user, roleCodes);
    }

    private AuthResponse buildAuthResponse(User user, List<String> roleCodes) {
        Map<String, Object> claims = Map.of(
                "companyId", user.getCompany().getCompanyId().toString(),
                "companyName", user.getCompany().getCompanyName(),
                "loginId", user.getLoginId(),
                "name", user.getName(),
                "email", user.getEmail(),
                "roles", roleCodes
        );
        String token = jwtService.generateToken(user.getUserId().toString(), claims);
        Instant expiresAt = jwtService.getExpiration(token);

        UserResponse userResponse = new UserResponse();
        userResponse.setUserId(user.getUserId());
        userResponse.setCompanyId(user.getCompany().getCompanyId());
        userResponse.setCompanyName(user.getCompany().getCompanyName());
        userResponse.setLoginId(user.getLoginId());
        userResponse.setName(user.getName());
        userResponse.setEmail(user.getEmail());
        userResponse.setRoles(roleCodes);

        AuthResponse response = new AuthResponse();
        response.setToken(token);
        response.setExpiresAt(expiresAt);
        response.setUser(userResponse);
        return response;
    }
}
