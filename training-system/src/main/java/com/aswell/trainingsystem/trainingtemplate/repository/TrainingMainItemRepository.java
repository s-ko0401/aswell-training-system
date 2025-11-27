package com.aswell.trainingsystem.trainingtemplate.repository;

import com.aswell.trainingsystem.trainingtemplate.entity.TrainingMainItem;
import com.aswell.trainingsystem.trainingtemplate.entity.TrainingPlan;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TrainingMainItemRepository extends JpaRepository<TrainingMainItem, Long> {
    List<TrainingMainItem> findByTrainingPlanOrderBySortOrderAscIdAsc(TrainingPlan plan);
}
