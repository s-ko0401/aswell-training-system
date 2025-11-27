package com.aswell.trainingsystem.trainingtemplate;

import com.aswell.trainingsystem.auth.AuthenticatedUser;
import com.aswell.trainingsystem.common.ApiException;
import com.aswell.trainingsystem.domain.user.User;
import com.aswell.trainingsystem.repository.UserRepository;
import com.aswell.trainingsystem.trainingtemplate.dto.MainItemRequest;
import com.aswell.trainingsystem.trainingtemplate.dto.PlanRequest;
import com.aswell.trainingsystem.trainingtemplate.dto.SubItemRequest;
import com.aswell.trainingsystem.trainingtemplate.dto.TodoRequest;
import com.aswell.trainingsystem.trainingtemplate.entity.TrainingMainItem;
import com.aswell.trainingsystem.trainingtemplate.entity.TrainingPlan;
import com.aswell.trainingsystem.trainingtemplate.entity.TrainingSubItem;
import com.aswell.trainingsystem.trainingtemplate.entity.TrainingTodo;
import com.aswell.trainingsystem.trainingtemplate.repository.TrainingMainItemRepository;
import com.aswell.trainingsystem.trainingtemplate.repository.TrainingPlanRepository;
import com.aswell.trainingsystem.trainingtemplate.repository.TrainingSubItemRepository;
import com.aswell.trainingsystem.trainingtemplate.repository.TrainingTodoRepository;
import java.util.List;
import java.util.Optional;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class TrainingTemplateService {

    private final TrainingPlanRepository planRepository;
    private final TrainingMainItemRepository mainItemRepository;
    private final TrainingSubItemRepository subItemRepository;
    private final TrainingTodoRepository todoRepository;
    private final UserRepository userRepository;

    public TrainingTemplateService(
            TrainingPlanRepository planRepository,
            TrainingMainItemRepository mainItemRepository,
            TrainingSubItemRepository subItemRepository,
            TrainingTodoRepository todoRepository,
            UserRepository userRepository
    ) {
        this.planRepository = planRepository;
        this.mainItemRepository = mainItemRepository;
        this.subItemRepository = subItemRepository;
        this.todoRepository = todoRepository;
        this.userRepository = userRepository;
    }

    private void requireAdmin(AuthenticatedUser actor) {
        if (actor == null || actor.getRoles().stream().noneMatch(r -> "ADMIN".equalsIgnoreCase(r) || "SYSTEM_ADMIN".equalsIgnoreCase(r))) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Only ADMIN or SYSTEM_ADMIN can manage templates");
        }
    }

    @Transactional(readOnly = true)
    public List<TrainingPlan> listPlans(String keyword, AuthenticatedUser actor) {
        requireAdmin(actor);
        return planRepository.search(keyword);
    }

    @Transactional
    public TrainingPlan createPlan(PlanRequest request, AuthenticatedUser actor) {
        requireAdmin(actor);
        TrainingPlan plan = new TrainingPlan();
        plan.setId(null);
        plan.setName(request.getName());
        plan.setDescription(request.getDescription());
        plan.setExpectedDays(request.getExpectedDays());
        plan.setStatus(request.getStatus());
        User creator = userRepository.findById(actor.getUserId())
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "User not found"));
        plan.setCreatedBy(creator);
        return planRepository.save(plan);
    }

    @Transactional
    public TrainingPlan updatePlan(Long id, PlanRequest request, AuthenticatedUser actor) {
        requireAdmin(actor);
        TrainingPlan plan = planRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Plan not found"));
        plan.setName(request.getName());
        plan.setDescription(request.getDescription());
        plan.setExpectedDays(request.getExpectedDays());
        plan.setStatus(request.getStatus());
        return plan;
    }

    @Transactional
    public void deletePlan(Long id, AuthenticatedUser actor) {
        requireAdmin(actor);
        planRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public List<TrainingMainItem> listMainItems(Long planId, AuthenticatedUser actor) {
        requireAdmin(actor);
        TrainingPlan plan = planRepository.findById(planId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Plan not found"));
        return mainItemRepository.findByTrainingPlanOrderBySortOrderAscIdAsc(plan);
    }

    @Transactional
    public TrainingMainItem createMainItem(MainItemRequest request, AuthenticatedUser actor) {
        requireAdmin(actor);
        TrainingPlan plan = planRepository.findById(request.getTrainingPlanId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Plan not found"));
        TrainingMainItem item = new TrainingMainItem();
        item.setTrainingPlan(plan);
        item.setTitle(request.getTitle());
        item.setDescription(request.getDescription());
        item.setExpectedDays(request.getExpectedDays());
        item.setSortOrder(request.getSortOrder());
        return mainItemRepository.save(item);
    }

    @Transactional
    public TrainingMainItem updateMainItem(Long id, MainItemRequest request, AuthenticatedUser actor) {
        requireAdmin(actor);
        TrainingMainItem item = mainItemRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Main item not found"));
        if (!item.getTrainingPlan().getId().equals(request.getTrainingPlanId())) {
            TrainingPlan plan = planRepository.findById(request.getTrainingPlanId())
                    .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Plan not found"));
            item.setTrainingPlan(plan);
        }
        item.setTitle(request.getTitle());
        item.setDescription(request.getDescription());
        item.setExpectedDays(request.getExpectedDays());
        item.setSortOrder(request.getSortOrder());
        return item;
    }

    @Transactional
    public void deleteMainItem(Long id, AuthenticatedUser actor) {
        requireAdmin(actor);
        mainItemRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public List<TrainingSubItem> listSubItems(Long mainItemId, AuthenticatedUser actor) {
        requireAdmin(actor);
        TrainingMainItem main = mainItemRepository.findById(mainItemId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Main item not found"));
        return subItemRepository.findByMainItemOrderBySortOrderAscIdAsc(main);
    }

    @Transactional
    public TrainingSubItem createSubItem(SubItemRequest request, AuthenticatedUser actor) {
        requireAdmin(actor);
        TrainingMainItem main = mainItemRepository.findById(request.getMainItemId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Main item not found"));
        TrainingSubItem sub = new TrainingSubItem();
        sub.setMainItem(main);
        sub.setTitle(request.getTitle());
        sub.setDescription(request.getDescription());
        sub.setSortOrder(request.getSortOrder());
        return subItemRepository.save(sub);
    }

    @Transactional
    public TrainingSubItem updateSubItem(Long id, SubItemRequest request, AuthenticatedUser actor) {
        requireAdmin(actor);
        TrainingSubItem sub = subItemRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Sub item not found"));
        if (!sub.getMainItem().getId().equals(request.getMainItemId())) {
            TrainingMainItem main = mainItemRepository.findById(request.getMainItemId())
                    .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Main item not found"));
            sub.setMainItem(main);
        }
        sub.setTitle(request.getTitle());
        sub.setDescription(request.getDescription());
        sub.setSortOrder(request.getSortOrder());
        return sub;
    }

    @Transactional
    public void deleteSubItem(Long id, AuthenticatedUser actor) {
        requireAdmin(actor);
        subItemRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public List<TrainingTodo> listTodos(Long subItemId, AuthenticatedUser actor) {
        requireAdmin(actor);
        TrainingSubItem sub = subItemRepository.findById(subItemId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Sub item not found"));
        return todoRepository.findBySubItemOrderBySortOrderAscIdAsc(sub);
    }

    @Transactional
    public TrainingTodo createTodo(TodoRequest request, AuthenticatedUser actor) {
        requireAdmin(actor);
        TrainingSubItem sub = subItemRepository.findById(request.getSubItemId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Sub item not found"));
        TrainingTodo todo = new TrainingTodo();
        todo.setSubItem(sub);
        todo.setTitle(request.getTitle());
        todo.setDescription(request.getDescription());
        todo.setDayIndex(request.getDayIndex());
        todo.setSortOrder(request.getSortOrder());
        return todoRepository.save(todo);
    }

    @Transactional
    public TrainingTodo updateTodo(Long id, TodoRequest request, AuthenticatedUser actor) {
        requireAdmin(actor);
        TrainingTodo todo = todoRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Todo not found"));
        if (!todo.getSubItem().getId().equals(request.getSubItemId())) {
            TrainingSubItem sub = subItemRepository.findById(request.getSubItemId())
                    .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Sub item not found"));
            todo.setSubItem(sub);
        }
        todo.setTitle(request.getTitle());
        todo.setDescription(request.getDescription());
        todo.setDayIndex(request.getDayIndex());
        todo.setSortOrder(request.getSortOrder());
        return todo;
    }

    @Transactional
    public void deleteTodo(Long id, AuthenticatedUser actor) {
        requireAdmin(actor);
        todoRepository.deleteById(id);
    }
}
