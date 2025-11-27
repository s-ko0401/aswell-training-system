package com.aswell.trainingsystem.trainingtemplate.repository;

import com.aswell.trainingsystem.trainingtemplate.entity.TrainingSubItem;
import com.aswell.trainingsystem.trainingtemplate.entity.TrainingTodo;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TrainingTodoRepository extends JpaRepository<TrainingTodo, Long> {
    List<TrainingTodo> findBySubItemOrderBySortOrderAscIdAsc(TrainingSubItem subItem);
}
