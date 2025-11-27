package com.aswell.trainingsystem.config;

import com.aswell.trainingsystem.domain.company.Company;
import com.aswell.trainingsystem.domain.role.Role;
import com.aswell.trainingsystem.domain.user.User;
import com.aswell.trainingsystem.domain.user.UserRole;
import com.aswell.trainingsystem.repository.CompanyRepository;
import com.aswell.trainingsystem.repository.RoleRepository;
import com.aswell.trainingsystem.repository.UserRepository;
import com.aswell.trainingsystem.repository.UserRoleRepository;
import java.util.Optional;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class BootstrapData implements CommandLineRunner {

    private final boolean enabled;
    private final CompanyRepository companyRepository;
    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final UserRoleRepository userRoleRepository;
    private final PasswordEncoder passwordEncoder;

    public BootstrapData(
            @Value("${app.bootstrap.enabled:true}") boolean enabled,
            CompanyRepository companyRepository,
            RoleRepository roleRepository,
            UserRepository userRepository,
            UserRoleRepository userRoleRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.enabled = enabled;
        this.companyRepository = companyRepository;
        this.roleRepository = roleRepository;
        this.userRepository = userRepository;
        this.userRoleRepository = userRoleRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) {
        if (!enabled) {
            return;
        }

        // Ensure base roles exist (matches V2__seed_roles.sql)
        ensureRole((short) 1, "SYSTEM_ADMIN", "システム管理者", 1);
        ensureRole((short) 2, "ADMIN", "管理者", 2);
        ensureRole((short) 3, "TRAINER", "教育担当者", 3);
        ensureRole((short) 4, "TRAINEE", "研修者", 4);

        // Seed a demo company/user for quick login
        Company company = companyRepository.findFirstByCompanyNameIgnoreCase("demo")
                .orElseGet(() -> {
                    Company c = new Company();
                    c.setCompanyId(UUID.fromString("11111111-1111-1111-1111-111111111111"));
                    c.setCompanyName("demo");
                    c.setBillingEmail("demo@example.com");
                    c.setFlag((short) 0);
                    return companyRepository.save(c);
                });

        Optional<User> existing = userRepository.findByCompanyAndLoginId(company, "admin");
        if (existing.isPresent()) {
            return;
        }

        User user = new User();
        user.setUserId(UUID.fromString("22222222-2222-2222-2222-222222222222"));
        user.setCompany(company);
        user.setLoginId("admin");
        user.setPasswordHash(passwordEncoder.encode("Password123!"));
        user.setName("Demo Admin");
        user.setEmail("admin@example.com");
        user.setFlag((short) 0);
        userRepository.save(user);

        Role systemAdmin = roleRepository.findByCode("SYSTEM_ADMIN").orElseThrow();
        UserRole userRole = new UserRole();
        userRole.setUserRoleId(UUID.randomUUID());
        userRole.setUser(user);
        userRole.setRole(systemAdmin);
        userRoleRepository.save(userRole);
    }

    private void ensureRole(short id, String code, String nameJa, int sort) {
        if (roleRepository.findByCode(code).isPresent()) {
            return;
        }
        Role role = new Role();
        role.setRoleId(id);
        role.setCode(code);
        role.setNameJa(nameJa);
        role.setSortOrder((short) sort);
        roleRepository.save(role);
    }
}
