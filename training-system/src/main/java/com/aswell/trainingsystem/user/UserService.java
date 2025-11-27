package com.aswell.trainingsystem.user;

import com.aswell.trainingsystem.auth.AuthenticatedUser;
import com.aswell.trainingsystem.common.ApiException;
import com.aswell.trainingsystem.company.CurrentUser;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import com.aswell.trainingsystem.domain.user.User;
import com.aswell.trainingsystem.domain.user.TeacherStudentMap;
import com.aswell.trainingsystem.repository.UserRepository;
import com.aswell.trainingsystem.user.dto.UserListResponse;
import com.aswell.trainingsystem.user.dto.CreateUserRequest;
import com.aswell.trainingsystem.domain.company.Company;
import com.aswell.trainingsystem.repository.CompanyRepository;
import com.aswell.trainingsystem.repository.RoleRepository;
import com.aswell.trainingsystem.repository.UserRoleRepository;
import com.aswell.trainingsystem.repository.TeacherStudentMapRepository;
import com.aswell.trainingsystem.domain.role.Role;
import com.aswell.trainingsystem.domain.user.UserRole;
import org.springframework.security.crypto.password.PasswordEncoder;
import com.aswell.trainingsystem.user.dto.UpdateUserRequest;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final CompanyRepository companyRepository;
    private final RoleRepository roleRepository;
    private final UserRoleRepository userRoleRepository;
    private final TeacherStudentMapRepository teacherStudentMapRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(
            UserRepository userRepository,
            CompanyRepository companyRepository,
            RoleRepository roleRepository,
            UserRoleRepository userRoleRepository,
            TeacherStudentMapRepository teacherStudentMapRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.userRepository = userRepository;
        this.companyRepository = companyRepository;
        this.roleRepository = roleRepository;
        this.userRoleRepository = userRoleRepository;
        this.teacherStudentMapRepository = teacherStudentMapRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional(readOnly = true)
    public List<UserListResponse> list(String keyword, AuthenticatedUser actor) {
        AuthenticatedUser effectiveActor = actor != null ? actor : CurrentUser.get();
        List<User> users;
        if (isSystemAdmin(effectiveActor)) {
            users = userRepository.searchWithCompanyAndRoles(keyword);
        } else if (isAdmin(effectiveActor)) {
            users = userRepository.searchWithCompanyAndRolesForCompany(
                    effectiveActor.getCompanyId(),
                    keyword
            );
        } else {
            throw new ApiException(HttpStatus.FORBIDDEN, "Only SYSTEM_ADMIN or ADMIN can view users");
        }
        return users.stream().map(user -> {
            UserListResponse response = new UserListResponse();
            response.setUserId(user.getUserId());
            response.setCompanyId(user.getCompany().getCompanyId());
            response.setCompanyName(user.getCompany().getCompanyName());
            response.setLoginId(user.getLoginId());
            response.setName(user.getName());
            response.setEmail(user.getEmail());
            response.setFlag(user.getFlag());
            response.setCreatedAt(user.getCreatedAt());
            response.setUpdatedAt(user.getUpdatedAt());
            response.setRoles(user.getUserRoles().stream()
                    .map(ur -> ur.getRole().getCode())
                    .toList());
            return response;
        }).toList();
    }

    @Transactional
    public UserListResponse createForCompany(CreateUserRequest request, AuthenticatedUser actor) {
        AuthenticatedUser effectiveActor = actor != null ? actor : CurrentUser.get();
        if (!isSystemAdmin(effectiveActor) && !isAdmin(effectiveActor)) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Only SYSTEM_ADMIN or ADMIN can create users");
        }
        UUID companyId = effectiveActor.getCompanyId();
        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST, "Company not found"));

        if (userRepository.existsByCompanyAndLoginId(company, request.getLoginId())) {
            throw new ApiException(HttpStatus.CONFLICT, "Login ID already exists");
        }

        if (!"TRAINER".equalsIgnoreCase(request.getRoleCode())
                && !"TRAINEE".equalsIgnoreCase(request.getRoleCode())
                && !"ADMIN".equalsIgnoreCase(request.getRoleCode())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Invalid role code");
        }

        User user = new User();
        user.setUserId(UUID.randomUUID());
        user.setCompany(company);
        user.setLoginId(request.getLoginId());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setFlag(request.getFlag() != null ? request.getFlag() : (short) 0);
        userRepository.save(user);

        Role role = roleRepository.findByCode(request.getRoleCode())
                .orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST, "Role not found"));
        UserRole userRole = new UserRole();
        userRole.setUserRoleId(UUID.randomUUID());
        userRole.setUser(user);
        userRole.setRole(role);
        userRoleRepository.save(userRole);

        if ("TRAINEE".equalsIgnoreCase(request.getRoleCode())) {
            if (request.getTeacherId() == null) {
                throw new ApiException(HttpStatus.BAD_REQUEST, "teacherId is required for trainee");
            }
            User teacher = userRepository.findById(request.getTeacherId())
                    .orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST, "Teacher not found"));
            boolean teacherSameCompany = teacher.getCompany().getCompanyId().equals(companyId);
            boolean teacherHasRole = teacher.getUserRoles().stream()
                    .anyMatch(ur -> "TRAINER".equalsIgnoreCase(ur.getRole().getCode()));
            if (!teacherSameCompany || !teacherHasRole) {
                throw new ApiException(HttpStatus.BAD_REQUEST, "Teacher must belong to the same company and have TRAINER role");
            }
            TeacherStudentMap map = new TeacherStudentMap();
            map.setId(UUID.randomUUID());
            map.setTeacher(teacher);
            map.setStudent(user);
            teacherStudentMapRepository.save(map);
        }

        return toListResponse(user);
    }

    @Transactional
    public UserListResponse updateForCompany(UUID userId, UpdateUserRequest request, AuthenticatedUser actor) {
        AuthenticatedUser effectiveActor = actor != null ? actor : CurrentUser.get();
        if (!isSystemAdmin(effectiveActor) && !isAdmin(effectiveActor)) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Only SYSTEM_ADMIN or ADMIN can update users");
        }
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found"));
        if (!user.getCompany().getCompanyId().equals(effectiveActor.getCompanyId())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Cannot modify other companies' users");
        }

        if (!"TRAINER".equalsIgnoreCase(request.getRoleCode())
                && !"TRAINEE".equalsIgnoreCase(request.getRoleCode())
                && !"ADMIN".equalsIgnoreCase(request.getRoleCode())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Invalid role code");
        }

        user.setName(request.getName());
        user.setEmail(request.getEmail());
        if (request.getFlag() != null) {
            user.setFlag(request.getFlag());
        }

        // reset roles to requested single role (TRAINER or TRAINEE)
        userRoleRepository.findByUser(user).forEach(userRoleRepository::delete);
        Role role = roleRepository.findByCode(request.getRoleCode())
                .orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST, "Role not found"));
        UserRole userRole = new UserRole();
        userRole.setUserRoleId(UUID.randomUUID());
        userRole.setUser(user);
        userRole.setRole(role);
        userRoleRepository.save(userRole);

        // handle teacher-student mapping
        // remove existing mappings where this user is student
        teacherStudentMapRepository.findByStudent(user).forEach(teacherStudentMapRepository::delete);
        if ("TRAINEE".equalsIgnoreCase(request.getRoleCode())) {
            if (request.getTeacherId() == null) {
                throw new ApiException(HttpStatus.BAD_REQUEST, "teacherId is required for trainee");
            }
            User teacher = userRepository.findById(request.getTeacherId())
                    .orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST, "Teacher not found"));
            boolean teacherSameCompany = teacher.getCompany().getCompanyId().equals(effectiveActor.getCompanyId());
            boolean teacherHasRole = teacher.getUserRoles().stream()
                    .anyMatch(ur -> "TRAINER".equalsIgnoreCase(ur.getRole().getCode()));
            if (!teacherSameCompany || !teacherHasRole) {
                throw new ApiException(HttpStatus.BAD_REQUEST, "Teacher must belong to the same company and have TRAINER role");
            }
            TeacherStudentMap map = new TeacherStudentMap();
            map.setId(UUID.randomUUID());
            map.setTeacher(teacher);
            map.setStudent(user);
            teacherStudentMapRepository.save(map);
        }

        return toListResponse(user);
    }

    @Transactional
    public void deleteForCompany(UUID userId, AuthenticatedUser actor) {
        AuthenticatedUser effectiveActor = actor != null ? actor : CurrentUser.get();
        if (!isSystemAdmin(effectiveActor) && !isAdmin(effectiveActor)) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Only SYSTEM_ADMIN or ADMIN can delete users");
        }
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found"));
        if (!user.getCompany().getCompanyId().equals(effectiveActor.getCompanyId())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Cannot delete other companies' users");
        }
        // clean mapping
        teacherStudentMapRepository.findByStudent(user).forEach(teacherStudentMapRepository::delete);
        teacherStudentMapRepository.findByTeacher(user).forEach(teacherStudentMapRepository::delete);
        user.setFlag((short) 9);
    }

    private UserListResponse toListResponse(User user) {
        UserListResponse response = new UserListResponse();
        response.setUserId(user.getUserId());
        response.setCompanyId(user.getCompany().getCompanyId());
        response.setCompanyName(user.getCompany().getCompanyName());
        response.setLoginId(user.getLoginId());
        response.setName(user.getName());
        response.setEmail(user.getEmail());
        response.setFlag(user.getFlag());
        response.setCreatedAt(user.getCreatedAt());
        response.setUpdatedAt(user.getUpdatedAt());
        response.setRoles(user.getUserRoles().stream()
                .map(ur -> ur.getRole().getCode())
                .toList());
        return response;
    }

    private boolean isSystemAdmin(AuthenticatedUser actor) {
        if (actor != null && actor.getRoles().stream().anyMatch("SYSTEM_ADMIN"::equalsIgnoreCase)) {
            return true;
        }
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return auth != null && auth.getAuthorities().contains(new SimpleGrantedAuthority("ROLE_SYSTEM_ADMIN"));
    }

    private boolean isAdmin(AuthenticatedUser actor) {
        if (actor != null && actor.getRoles().stream().anyMatch("ADMIN"::equalsIgnoreCase)) {
            return true;
        }
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return auth != null && auth.getAuthorities().contains(new SimpleGrantedAuthority("ROLE_ADMIN"));
    }
}
