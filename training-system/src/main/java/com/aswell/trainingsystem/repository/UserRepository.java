package com.aswell.trainingsystem.repository;

import com.aswell.trainingsystem.domain.company.Company;
import com.aswell.trainingsystem.domain.user.User;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface UserRepository extends JpaRepository<User, UUID> {

    Optional<User> findByCompanyAndLoginId(Company company, String loginId);

    boolean existsByCompanyAndLoginId(Company company, String loginId);

    List<User> findByCompany(Company company);

    @Query("SELECT DISTINCT u FROM User u "
            + "LEFT JOIN FETCH u.company c "
            + "LEFT JOIN FETCH u.userRoles ur "
            + "LEFT JOIN FETCH ur.role r "
            + "WHERE (:keyword IS NULL OR :keyword = '' "
            + "OR LOWER(u.loginId) LIKE LOWER(CONCAT('%', :keyword, '%')) "
            + "OR LOWER(u.name) LIKE LOWER(CONCAT('%', :keyword, '%')) "
            + "OR LOWER(COALESCE(u.email, '')) LIKE LOWER(CONCAT('%', :keyword, '%')) "
            + "OR LOWER(c.companyName) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    List<User> searchWithCompanyAndRoles(@Param("keyword") String keyword);

    @Query("SELECT DISTINCT u FROM User u "
            + "LEFT JOIN FETCH u.company c "
            + "LEFT JOIN FETCH u.userRoles ur "
            + "LEFT JOIN FETCH ur.role r "
            + "WHERE c.companyId = :companyId "
            + "AND (:keyword IS NULL OR :keyword = '' "
            + "OR LOWER(u.loginId) LIKE LOWER(CONCAT('%', :keyword, '%')) "
            + "OR LOWER(u.name) LIKE LOWER(CONCAT('%', :keyword, '%')) "
            + "OR LOWER(COALESCE(u.email, '')) LIKE LOWER(CONCAT('%', :keyword, '%')) )")
    List<User> searchWithCompanyAndRolesForCompany(@Param("companyId") UUID companyId, @Param("keyword") String keyword);
}
