package com.aswell.trainingsystem.role;

import com.aswell.trainingsystem.auth.AuthenticatedUser;
import com.aswell.trainingsystem.common.ApiException;
import com.aswell.trainingsystem.domain.role.Role;
import com.aswell.trainingsystem.repository.RoleRepository;
import com.aswell.trainingsystem.repository.UserRoleRepository;
import com.aswell.trainingsystem.role.dto.CreateRoleRequest;
import com.aswell.trainingsystem.role.dto.RoleResponse;
import com.aswell.trainingsystem.role.dto.UpdateRoleRequest;
import java.util.Comparator;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class RoleService {

    private final RoleRepository roleRepository;
    private final UserRoleRepository userRoleRepository;

    public RoleService(RoleRepository roleRepository, UserRoleRepository userRoleRepository) {
        this.roleRepository = roleRepository;
        this.userRoleRepository = userRoleRepository;
    }

    @Transactional(readOnly = true)
    public List<RoleResponse> list() {
        return roleRepository.findAll().stream()
                .sorted(Comparator.comparing(Role::getSortOrder, Comparator.nullsLast(Comparator.naturalOrder()))
                        .thenComparing(Role::getCode))
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public RoleResponse create(CreateRoleRequest request, AuthenticatedUser actor) {
        requireSystemAdmin(actor);
        if (roleRepository.existsByCodeIgnoreCase(request.getCode())) {
            throw new ApiException(HttpStatus.CONFLICT, "Role code already exists");
        }
        Role role = new Role();
        role.setRoleId(nextId());
        role.setCode(request.getCode());
        role.setNameJa(request.getNameJa());
        role.setDescription(request.getDescription());
        role.setSortOrder(request.getSortOrder());
        roleRepository.save(role);
        return toResponse(role);
    }

    @Transactional
    public RoleResponse update(short roleId, UpdateRoleRequest request, AuthenticatedUser actor) {
        requireSystemAdmin(actor);
        Role role = roleRepository.findById(roleId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Role not found"));

        if (request.getCode() != null && !request.getCode().isBlank()) {
            roleRepository.findByCode(request.getCode())
                    .filter(existing -> !existing.getRoleId().equals(roleId))
                    .ifPresent(existing -> {
                        throw new ApiException(HttpStatus.CONFLICT, "Role code already exists");
                    });
            role.setCode(request.getCode());
        }
        if (request.getNameJa() != null && !request.getNameJa().isBlank()) {
            role.setNameJa(request.getNameJa());
        }
        if (request.getDescription() != null) {
            role.setDescription(request.getDescription());
        }
        if (request.getSortOrder() != null) {
            role.setSortOrder(request.getSortOrder());
        }

        return toResponse(role);
    }

    @Transactional
    public void delete(short roleId, AuthenticatedUser actor) {
        requireSystemAdmin(actor);
        if (userRoleRepository.existsByRole_RoleId(roleId)) {
            throw new ApiException(HttpStatus.CONFLICT, "Role is assigned to users and cannot be deleted");
        }
        Role role = roleRepository.findById(roleId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Role not found"));
        roleRepository.delete(role);
    }

    private void requireSystemAdmin(AuthenticatedUser actor) {
        if (actor == null || actor.getRoles().stream().noneMatch("SYSTEM_ADMIN"::equalsIgnoreCase)) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Only SYSTEM_ADMIN can manage roles");
        }
    }

    private short nextId() {
        return (short) (roleRepository.findAll().stream()
                .mapToInt(Role::getRoleId)
                .max()
                .orElse(0) + 1);
    }

    private RoleResponse toResponse(Role role) {
        RoleResponse response = new RoleResponse();
        response.setRoleId(role.getRoleId());
        response.setCode(role.getCode());
        response.setNameJa(role.getNameJa());
        response.setDescription(role.getDescription());
        response.setSortOrder(role.getSortOrder());
        return response;
    }
}
