package com.aswell.trainingsystem.trainingtemplate.repository;

import com.aswell.trainingsystem.trainingtemplate.entity.TrainingPlan;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface TrainingPlanRepository extends JpaRepository<TrainingPlan, Long> {

    @Query("SELECT p FROM TrainingPlan p WHERE (:keyword IS NULL OR :keyword = '' "
            + "OR LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%')) "
            + "OR LOWER(COALESCE(p.description, '')) LIKE LOWER(CONCAT('%', :keyword, '%')) ) "
            + "ORDER BY p.id DESC")
    List<TrainingPlan> search(@Param("keyword") String keyword);
}
