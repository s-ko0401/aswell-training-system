package com.aswell.trainingsystem.repository;

import com.aswell.trainingsystem.domain.user.User;
import com.aswell.trainingsystem.domain.user.UserRole;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRoleRepository extends JpaRepository<UserRole, UUID> {

    List<UserRole> findByUser(User user);

    boolean existsByRole_RoleId(short roleId);
}
