package com.aswell.trainingsystem.repository;

import com.aswell.trainingsystem.domain.company.Company;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface CompanyRepository extends JpaRepository<Company, UUID> {

    Optional<Company> findFirstByCompanyNameIgnoreCase(String companyName);

    boolean existsByCompanyNameIgnoreCase(String companyName);

    @Query("SELECT c FROM Company c WHERE LOWER(c.companyName) LIKE LOWER(CONCAT('%', :keyword, '%')) "
            + "OR LOWER(coalesce(c.billingEmail, '')) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<Company> searchByKeyword(@Param("keyword") String keyword);
}
