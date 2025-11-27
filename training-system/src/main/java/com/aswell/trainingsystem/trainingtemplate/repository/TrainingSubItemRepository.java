package com.aswell.trainingsystem.trainingtemplate.repository;

import com.aswell.trainingsystem.trainingtemplate.entity.TrainingMainItem;
import com.aswell.trainingsystem.trainingtemplate.entity.TrainingSubItem;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TrainingSubItemRepository extends JpaRepository<TrainingSubItem, Long> {
    List<TrainingSubItem> findByMainItemOrderBySortOrderAscIdAsc(TrainingMainItem mainItem);
}
